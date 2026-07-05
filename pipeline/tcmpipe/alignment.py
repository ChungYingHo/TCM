# -*- coding: utf-8 -*-
"""Detect explanations that don't match their question — the signature of a
mis-assigned (wrong-question) draft.

Why this exists: in 2026-06 a whole exam's AI-draft explanations (CMU-115-biology,
45/50) were written against the WRONG questions and sat undetected for weeks,
because explanations are keyed by positional id (`CMU-115-biology-14`) with no
binding to the question's content. Nothing would ever notice — until a human read
one. This turns "read every one by eye" into a cheap repeatable check.

Method — lexical overlap: an explanation written FOR a question repeats that
question's distinctive terms (rare 中文詞 + English/technical tokens); a
wrong-question draft shares almost none. `overlap_coef` = fraction of the
question's distinctive anchors that also appear in the explanation.

Caveat (why a single low score is only a CANDIDATE, not proof): a *correct*
explanation can score low too — pure-calculation answers (numbers/formulas only),
reading-comprehension (English stem, Chinese explanation), 國文 paraphrase. So the
reliable signal is a whole exam-cohort with a HIGH flag-rate: that is the
wholesale-misassignment fingerprint (CMU-115-biology was 90%; the worst
false-positive-prone cohort — calc-heavy chemistry — tops out ~49%). For a
definitive per-pair verdict, feed the low-overlap pairs to an LLM judge.

Run the audit:  cd pipeline && python -m tcmpipe.alignment
"""
from __future__ import annotations
import json
import os
import re
from collections import Counter

from tcmpipe import config as C

# unicode sub/superscripts -> ascii, so O₂ (explanation) matches O2 (stem)
_SUPSUB = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋', '0123456789+-0123456789+-')
_LATIN = re.compile(r'[A-Za-z][A-Za-z0-9+\-]{1,}')
_CJK = re.compile(r'[一-鿿]')

LOW_COEF = 0.10          # a pair sharing <10% of the question's anchors is "low"
MIN_ANCHORS = 4          # too few distinctive anchors -> can't judge, skip
MIN_COHORT = 10          # don't rate-flag a cohort with too few judged pairs
# a cohort with at least this fraction of its explanations sharing ~no term with
# their question is almost certainly a wholesale wrong-question batch. Calibrated
# between the worst false-positive cohort (~0.49, calc chemistry) and the real
# break (CMU-115-biology 0.90), with margin on both sides.
WHOLESALE_FLAG_RATE = 0.65


def _tokens(s: str):
    s = (s or '').translate(_SUPSUB)
    latin = {t.lower() for t in _LATIN.findall(s) if len(t) >= 2}
    ch = _CJK.findall(s)
    bigrams = {ch[i] + ch[i + 1] for i in range(len(ch) - 1)}
    return latin, bigrams


def question_text(q: dict) -> str:
    """Stem + all option texts — the full surface an explanation would echo."""
    s = q.get('question_text') or ''
    for o in (q.get('options') or []):
        s += ' ' + (o.get('text') or '')
    return s


def document_freq(questions) -> Counter:
    """Bigram frequency across all questions, to tell distinctive terms from
    boilerplate (細胞/蛋白/基因 appear everywhere and aren't discriminative)."""
    df: Counter = Counter()
    for q in questions:
        _, bigrams = _tokens(question_text(q))
        for b in bigrams:
            df[b] += 1
    return df


def anchors(qtext: str, df: Counter, n_questions: int) -> set:
    latin, bigrams = _tokens(qtext)
    thr = max(3, int(n_questions * 0.01))   # "rare" = appears in <=1% of questions
    return latin | {b for b in bigrams if df[b] <= thr}


def overlap_coef(qtext: str, explanation: str, df: Counter, n_questions: int):
    """Fraction of the question's distinctive anchors present in the explanation.
    None when the question has too few anchors to judge."""
    a = anchors(qtext, df, n_questions)
    if len(a) < MIN_ANCHORS:
        return None
    elat, ebi = _tokens(explanation)
    return len(a & (elat | ebi)) / len(a)


def scan(questions, solutions):
    """-> (low_pairs, cohort_rates).
    low_pairs: [(id, coef)] with coef < LOW_COEF, ascending.
    cohort_rates: {'<SCHOOL>-<YEAR>-<subject>': (flagged, judged)}."""
    df = document_freq(questions)
    n = len(questions)
    qmap = {q['id']: q for q in questions}
    low, tot, flag = [], Counter(), Counter()
    for qid, sol in solutions.items():
        q = qmap.get(qid)
        if not q or not isinstance(sol, str):
            continue
        coef = overlap_coef(question_text(q), sol, df, n)
        if coef is None:
            continue
        coh = '-'.join(qid.split('-')[:3])
        tot[coh] += 1
        if coef < LOW_COEF:
            flag[coh] += 1
            low.append((qid, round(coef, 3)))
    low.sort(key=lambda x: x[1])
    return low, {c: (flag[c], tot[c]) for c in tot}


def wholesale_misassigned_cohorts(cohort_rates):
    """Cohorts whose flag-rate crosses the wholesale-misassignment threshold —
    i.e. an exam whose explanations were (almost) all written for wrong questions."""
    out = [(c, f, t) for c, (f, t) in cohort_rates.items()
           if t >= MIN_COHORT and f / t >= WHOLESALE_FLAG_RATE]
    return sorted(out, key=lambda x: -x[1] / x[2])


def load_committed():
    questions = []
    for sch in C.SCHOOLS:
        p = os.path.join(C.WEB_DATA_DIR, f'{sch}.json')
        if os.path.exists(p):
            questions.extend(json.load(open(p, encoding='utf-8'))['questions'])
    cache = os.path.join(C.ROOT, 'pipeline', 'data', 'question_explanations.json')
    solutions = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    return questions, solutions


def main():
    questions, solutions = load_committed()
    low, rates = scan(questions, solutions)
    bad = wholesale_misassigned_cohorts(rates)
    print(f'scanned {len(solutions)} explanations against {len(questions)} questions')
    print(f'{len(low)} low-overlap pairs (coef<{LOW_COEF}) — mostly false positives '
          '(calc / reading-comprehension / paraphrase).')
    if bad:
        print('\n[!] WHOLESALE MISASSIGNMENT — these cohorts look like wrong-question batches:')
        for coh, f, t in bad:
            print(f'    {coh}: {f}/{t} ({100 * f // t}%) explanations share ~no term with their question')
        print('    -> LLM-judge these pairs; this is exactly how CMU-115-biology was caught.')
    else:
        print(f'no cohort crosses the wholesale-misassignment threshold '
              f'({int(WHOLESALE_FLAG_RATE * 100)}%). OK')
    worst = sorted(rates.items(), key=lambda kv: -(kv[1][0] / kv[1][1]))[:8]
    print('\nhighest flag-rate cohorts (FYI — high baselines are calc/reading-comp, not bugs):')
    for coh, (f, t) in worst:
        print(f'    {coh}: {f}/{t} ({100 * f // t}%)')


if __name__ == '__main__':
    main()
