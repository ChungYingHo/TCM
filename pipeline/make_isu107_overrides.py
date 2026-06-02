#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate pipeline/overrides/ISU.json from the hand-transcribed ISU/107 answer
key (scanned). Obscured cells (watermark/seal) are left out -> stay needs_review.
Everything transcribed is flagged needs_review=true ('待核對') until the user
verifies against the original scan.  Run: python pipeline/make_isu107_overrides.py
"""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OV = os.path.join(ROOT, 'pipeline', 'overrides', 'ISU.json')
EXPL = '本年參考答案為掃描公告，由人工轉謄、尚待核對。'

# '?' = obscured by watermark/seal, left blank (no answer, stays needs_review)
KEY = {
  'chinese': list('ADBBDCABAB' 'ADCDBCCDAA' 'AAABBAABCA' 'DADAC'),  # 1..35
  'biology': list('CABDCDADAB' 'BDDDBDBADB' 'BBDCCBBDDB' 'CBBBCDABCC' 'BDACCCADAC'),  # 1..50
  'chemistry': list('CDABDCDDCC' 'CBDDDDCDCC' 'BDABCAACB?' 'CB??ADDBA?' 'BBACCDCAB?'),  # 1..50 (30,33,34,40,50=?)
  'english': list('ACAADBADA?' 'DC???CA?DD' 'CADDBADCBD' 'BDACBACDDA'),  # 1..40 (10,13,14,15,18=?)
}

overrides = {}
filled = {s: 0 for s in KEY}
for subject, letters in KEY.items():
    for i, ch in enumerate(letters, start=1):
        qid = f'ISU-107-{subject}-{i}'
        if ch == '?':
            continue  # leave obscured cells unanswered
        overrides[qid] = {
            'correct_answer': [ch],
            'original_answer': [ch],
            'needs_review': True,
            'explanation': EXPL,
        }
        filled[subject] += 1

os.makedirs(os.path.dirname(OV), exist_ok=True)
with open(OV, 'w', encoding='utf-8') as f:
    json.dump(overrides, f, ensure_ascii=False, indent=2)

print('wrote', OV)
for s in KEY:
    total = len(KEY[s])
    print(f'  {s}: filled {filled[s]}/{total}, obscured {total - filled[s]}')
print('total overrides:', len(overrides))
