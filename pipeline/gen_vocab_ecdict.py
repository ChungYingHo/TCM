#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the enriched ~3000-word study list from ECDICT (authoritative phonetic +
Chinese + GRE/TOEFL tags), cross-referenced with words that actually appeared in
the 後中 exams (so the UI can show 「後中考過 N 次」). Example sentences are attached
separately by gen_vocab_examples.py, so re-ranking never discards authored examples.

The word itself is the stable id (a learner's per-word SRS must survive regens).

Source: pipeline/data/ecdict.csv  (download per pipeline/README — gitignored, ~66MB)
Output: pipeline/out/vocab_base.json  (no example sentences yet)

Run:  python pipeline/gen_vocab_ecdict.py
"""
from __future__ import annotations
import os
import sys
import csv
import json
import re
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C
from gen_vocab import is_vocab_question, STOP  # reuse exam-vocab detection

# ECDICT translations are Simplified Chinese; this is a Traditional-Chinese (zh-Hant,
# Taiwan) site, so convert. Graceful if OpenCC isn't installed.
try:
    import opencc
    _S2T = opencc.OpenCC('s2twp')  # Simplified -> Traditional w/ Taiwan phrasing
    def to_trad(s: str) -> str:
        return _S2T.convert(s) if s else s
except Exception:
    print('warning: opencc not installed — zh left as Simplified (pip install opencc)')
    def to_trad(s: str) -> str:
        return s

ECDICT = os.path.join(C.ROOT, 'pipeline', 'data', 'ecdict.csv')
OUT = os.path.join(C.OUT_DIR, 'vocab_base.json')
TARGET = 3000
WANT_TAGS = ('gre', 'toefl')
UNRANKED = 10**9
# Words that were ever a CORRECT answer are proven exam vocabulary — include them all,
# except very common words (frq rank ≤ TRIVIAL_FRQ without a gre/toefl tag).
TRIVIAL_FRQ = 3000
# Hard cap so the daily schedule can finish the track before the pre-exam taper
# (18 new words/day × 180 full-intensity days, see gen_schedule.py).
CAP = 3240


def lemmas(w: str) -> set[str]:
    """Cheap inflection→lemma candidates (escalates→escalate, abated→abate…)."""
    out: set[str] = set()
    for suf, reps in [('ies', ['y']), ('ied', ['y']), ('es', ['', 'e']), ('s', ['']),
                      ('ed', ['', 'e']), ('d', ['']), ('ing', ['', 'e']), ('ly', ['']),
                      ('er', ['', 'e']), ('est', ['', 'e']), ('ally', ['al']), ('ness', [''])]:
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            base = w[: len(w) - len(suf)]
            for r in reps:
                out.add(base + r)
            if len(base) >= 2 and base[-1] == base[-2]:  # running -> run
                out.add(base[:-1])
    return out

POS_LABEL = {
    'n': 'n.', 'v': 'v.', 'j': 'adj.', 'a': 'adj.', 'r': 'adv.',
    'prep': 'prep.', 'conj': 'conj.', 'pron': 'pron.', 'int': 'int.', 'num': 'num.', 'u': '',
}


def primary_pos(pos: str) -> str:
    """ECDICT pos like 'n:46/v:30/j:24' -> the dominant readable label."""
    best, best_n = '', -1
    for part in (pos or '').split('/'):
        if ':' in part:
            code, n = part.split(':', 1)
            try:
                n = int(n)
            except ValueError:
                n = 0
            if n > best_n:
                best, best_n = code.strip(), n
    if not best:
        return ''
    return POS_LABEL.get(best, best + '.')


def clean_zh(translation: str) -> str:
    """ECDICT translation is multi-line; collapse to a compact single line."""
    raw = (translation or '').replace('\\n', '\n')
    lines = [ln.strip() for ln in raw.split('\n') if ln.strip()]
    return to_trad('；'.join(lines)[:90])


def frq_key(row: dict) -> int:
    """Lower = more frequent. Unranked words sort last."""
    for k in ('frq', 'bnc'):
        v = (row.get(k) or '').strip()
        if v.isdigit() and int(v) > 0:
            return int(v)
    return UNRANKED


def exam_words() -> tuple[dict, dict, dict]:
    """word -> (count, correct, ids) for words that actually appeared in 後中 exams."""
    recs = []
    for s in C.SCHOOLS:
        with open(os.path.join(C.WEB_DATA_DIR, f'{s}.json'), encoding='utf-8') as f:
            recs += json.load(f)['questions']
    count: dict[str, int] = defaultdict(int)
    correct: dict[str, int] = defaultdict(int)
    ids: dict[str, list[str]] = defaultdict(list)
    for q in (q for q in recs if q['subject'] == 'english' and is_vocab_question(q)):
        ans = set(q.get('correct_answer') or [])
        for o in q.get('options') or []:
            w = (o.get('text') or '').strip().lower()
            if not re.fullmatch(r'[a-z][a-z-]{2,}', w) or w in STOP or len(w) < 4:
                continue
            count[w] += 1
            if o.get('letter') in ans:
                correct[w] += 1
            if q['id'] not in ids[w]:
                ids[w].append(q['id'])
    return count, correct, ids


def load_ecdict() -> dict[str, dict]:
    rows: dict[str, dict] = {}
    with open(ECDICT, encoding='utf-8', newline='') as f:
        for row in csv.DictReader(f):
            w = (row.get('word') or '').strip().lower()
            if w and ' ' not in w and re.fullmatch(r"[a-z][a-z'-]+", w):
                rows[w] = row
    return rows


def main() -> None:
    if not os.path.exists(ECDICT):
        sys.exit(f'missing {ECDICT} — download per pipeline/README.md')
    ec = load_ecdict()
    ex_count, ex_correct, ex_ids = exam_words()

    def make(word: str, row: dict) -> dict:
        frq = frq_key(row)
        tags = [t for t in re.split(r'[ ,/]+', (row.get('tag') or '').strip()) if t]
        return {
            'id': word,  # the word IS the id (stable across regenerations)
            'word': word,
            'phonetic': (row.get('phonetic') or '').strip(),
            'zh': clean_zh(row.get('translation')),
            'pos': primary_pos(row.get('pos')),
            'tags': tags,
            'frq': 0 if frq == UNRANKED else frq,
            'examCount': ex_count.get(word, 0),
            'examCorrect': ex_correct.get(word, 0),
            'examIds': ex_ids.get(word, [])[:15],
            'example': '',
            'example_zh': '',
            'draft': False,
        }

    # 1) GRE/TOEFL-tagged words, ranked by frequency, capped at TARGET.
    tagged = [
        (frq_key(row), w, row)
        for w, row in ec.items()
        if any(t in (row.get('tag') or '').lower() for t in WANT_TAGS)
    ]
    tagged.sort(key=lambda x: x[0])
    chosen: dict[str, dict] = {w: make(w, row) for _, w, row in tagged[:TARGET]}

    # 2) Add exam-tested words that RECUR (≥2×) but missed the GRE/TOEFL cut — these
    #    are proven 後中 vocabulary.
    extra = 0
    for w, c in ex_count.items():
        if c >= 2 and w not in chosen and w in ec:
            chosen[w] = make(w, ec[w])
            extra += 1

    # 3) Add every word that was ever a CORRECT answer (≥1×) — a once-tested answer
    #    is higher-yield than a never-tested frequency pick. Inflections fold onto
    #    their ECDICT lemma; trivially common words stay out.
    def is_real(w: str) -> bool:
        """A genuine study word, not an ECDICT junk stub (abbr/variant w/ no rank+tag)."""
        row = ec.get(w)
        return bool(row) and (frq_key(row) != UNRANKED or (row.get('tag') or '').strip() != '')

    def best_lemma(w: str) -> str | None:
        """Real ECDICT lemma for an inflected form: prefer the most frequent candidate."""
        cands = [l for l in ({w} | lemmas(w)) if is_real(l)]
        return min(cands, key=lambda l: frq_key(ec[l])) if cands else None

    answers = 0
    for w, c in ex_correct.items():
        if c < 1 or w in STOP or w in chosen or any(l in chosen for l in lemmas(w)):
            continue
        target = best_lemma(w)
        if not target or target in chosen:
            continue
        row = ec[target]
        frq = frq_key(row)
        tag = (row.get('tag') or '').lower()
        if frq != UNRANKED and frq <= TRIVIAL_FRQ and not any(t in tag for t in WANT_TAGS):
            continue
        chosen[target] = make(target, row)
        answers += 1

    # 4) Re-attribute exam stats so inflected exam forms count toward their in-list
    #    lemma (escalates/escalating -> escalate) — drives both the 「後中考過」badge
    #    and the exam-first ordering.
    agg_count: dict[str, int] = defaultdict(int)
    agg_correct: dict[str, int] = defaultdict(int)
    agg_ids: dict[str, list[str]] = defaultdict(list)
    for w in ex_count:
        tgt = w if w in chosen else next((l for l in lemmas(w) if l in chosen), None)
        if not tgt:
            continue
        agg_count[tgt] += ex_count[w]
        agg_correct[tgt] += ex_correct.get(w, 0)
        for qid in ex_ids.get(w, []):
            if qid not in agg_ids[tgt]:
                agg_ids[tgt].append(qid)
    for w, entry in chosen.items():
        entry['examCount'] = agg_count.get(w, 0)
        entry['examCorrect'] = agg_correct.get(w, 0)
        entry['examIds'] = agg_ids.get(w, [])[:15]

    # 5) Cap so the schedule finishes the track before the taper — drop the rarest
    #    never-tested words first (the lowest-yield tail).
    dropped = 0
    if len(chosen) > CAP:
        drop = sorted(
            (w for w, e in chosen.items() if e['examCount'] == 0),
            key=lambda w: frq_key(ec[w]), reverse=True,
        )[: len(chosen) - CAP]
        for w in drop:
            del chosen[w]
        dropped = len(drop)

    # Order: exam-tested first (by exam count), then most-frequent — this is also
    # the order the schedule introduces new words, so the most relevant come first.
    words = sorted(
        chosen.values(),
        key=lambda x: (-x['examCount'], x['frq'] or UNRANKED, x['word']),
    )

    os.makedirs(C.OUT_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({'count': len(words), 'words': words}, f, ensure_ascii=False, separators=(',', ':'))
    exam_in = sum(1 for w in words if w['examCount'])
    print(f'ecdict={len(ec)} chosen={len(words)} recur-extra={extra} answer-extra={answers} '
          f'tail-dropped={dropped} exam-tested-in-list={exam_in}')
    print('first 12:', ', '.join(w['word'] for w in words[:12]))


if __name__ == '__main__':
    main()
