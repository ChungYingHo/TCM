#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the high-frequency English vocabulary list from the question bank.

Tested vocabulary lives in the OPTIONS of vocab-style questions. We tokenise the
single-word options across all schools/years, count how often each word appears
and how often it is the CORRECT answer, tag a coarse theme (medical / GRE-style
adjective / academic verb / general), and record the question ids that used it so
the UI can link back. Output: src/data/vocab.json (consumed by /vocab).

Run:  python pipeline/gen_vocab.py
"""
from __future__ import annotations
import os
import sys
import json
import re
import datetime
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C

# function words / connectives / fillers that are not study "vocabulary".
# (connectives & phrasal idioms live in their own notes; keep this list nouns/
# verbs/adjectives only.) Also covers space-glued PDF artifacts like "asif".
STOP = set('''the a an of to in on at by for from with as into onto off over under about
against between through during within without upon toward towards among beyond and or but
nor so yet that this these those it its he she they them his her their our your my me we you
is are was were be been being am do does did has have had will would shall should can could
may might must not no nor than then thus also more most very much many few all any some such
which who whom whose what when where why how if because although though since while whereas
however therefore moreover otherwise hence besides nevertheless one two three four five there
their here out up down only just even ever never always often once both each other another
same own per via etc unless despite whether instead regardless throughout meanwhile
furthermore consequently albeit notwithstanding wherever whenever whatever whoever nonetheless
upon onto unto whom toward might ought need dare
asif inspiteof hasbeen assoonas aslongas asfaras evenif eventhough aswellas ratherthan
suchas inadditionto incaseof bymeansof byandlarge nomatter onlyif ifonly asmuchas
asaresultof thanksto accessto inorderto insteadof apartfrom astoughas asthough
inwhich bywhich forwhich towhich notonly butalso eitheror neithernor
make made makes making take takes took taking year years percent become becomes
came come comes goes gone give given gives gave keep kept good well able well-known
havebeen hadbeen willbe wouldbe couldbe shouldbe hasbeen havebeennbsp ableto used
according regarding concerning provided unless'''.split())

MED = set('''pernicious malignant benign contagious immune deficiency antibiotic insomnia
constipation dehydrate degeneration anatomy susceptible nutrients virulent gynecologist
prognosis therapeutic epidemiology analgesic mortality morbidity vaccine arthritis fracture
obesity diagnosis chronic acute inflammation tumor lesion remission pathogen vulnerable
impaired permeable impermeable'''.split())
MED_SUFFIX = ('itis', 'osis', 'emia', 'pathy', 'ectomy', 'otomy')
ADJ_SUFFIX = ('ious', 'eous', 'ous', 'ent', 'ant', 'ive', 'able', 'ible', 'ulent', 'id')
VERB_SUFFIX = ('ize', 'ise', 'ate', 'ify', 'fy')


def theme(w: str) -> str:
    if w in MED or w.endswith(MED_SUFFIX):
        return 'medical'
    if w.endswith(VERB_SUFFIX) and len(w) > 5:
        return 'verb'
    if w.endswith(ADJ_SUFFIX) and len(w) > 5:
        return 'adjective'
    return 'general'


def is_vocab_question(q: dict) -> bool:
    opts = [o.get('text', '') for o in (q.get('options') or [])]
    if len(opts) < 3:
        return False
    single = sum(1 for o in opts if o and ' ' not in o.strip() and re.fullmatch(r'[A-Za-z][A-Za-z-]+', o.strip()))
    return single >= max(3, len(opts) - 1)


def main() -> None:
    recs = []
    for s in C.SCHOOLS:
        with open(os.path.join(C.WEB_DATA_DIR, f'{s}.json'), encoding='utf-8') as f:
            recs += json.load(f)['questions']
    eng = [q for q in recs if q['subject'] == 'english']
    vq = [q for q in eng if is_vocab_question(q)]

    count: dict[str, int] = defaultdict(int)
    correct: dict[str, int] = defaultdict(int)
    ids: dict[str, list[str]] = defaultdict(list)
    for q in vq:
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

    words = []
    for w, c in count.items():
        if c < 2:  # keep words that recur (tested more than once)
            continue
        words.append({
            'word': w,
            'count': c,
            'correct': correct[w],
            'theme': theme(w),
            'ids': ids[w][:15],
        })
    words.sort(key=lambda x: (-x['count'], -x['correct'], x['word']))

    out = {
        'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'vocab_questions': len(vq),
        'unique_words': len(count),
        'words': words,
    }
    path = os.path.join(C.WEB_DATA_DIR, 'vocab.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    by_theme: dict[str, int] = defaultdict(int)
    for w in words:
        by_theme[w['theme']] += 1
    print(f'vocab questions={len(vq)} unique words={len(count)} '
          f'recurring(>=2)={len(words)} themes={dict(by_theme)}')
    print('top 15:', ', '.join(f"{w['word']}({w['count']}/{w['correct']})" for w in words[:15]))


if __name__ == '__main__':
    main()
