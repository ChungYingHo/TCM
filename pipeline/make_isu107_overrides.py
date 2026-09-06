#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the ISU/107 entries of pipeline/overrides/ISU.json from the scanned answer
key (exams/ISU/107/answers/answer_all.pdf). The key below was re-read cell by cell
against the scan at 6x zoom on 2026-09-06 (PyMuPDF crops): the first hand
transcription had 21 wrong or blank cells (chemistry 14/15/20/30/34/40/41/47/50,
english 3/10/13/14/15/18/20/23, chinese 21/25/26/30); biology matched in full.
Questions that carry official errata (award_all etc.) are skipped so the override
never clobbers the errata. Other schools'/years' entries in ISU.json are kept.
Run: python pipeline/make_isu107_overrides.py
"""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OV = os.path.join(ROOT, 'pipeline', 'overrides', 'ISU.json')
EXPL = '本年參考答案為掃描公告，人工轉謄後已於 2026-09-06 對照原掃描逐格核對。'

# '?' = keep out of the overrides (official errata already decides that question)
KEY = {
  'chinese': list('ADBBDCABAB' 'ADCDBCCDAA' 'DAABDDABCD' 'DADAC'),  # 1..35
  'biology': list('CABDCDADAB' 'BDDDBDBADB' 'BBDCCBBDDB' 'CBBBCDABCC' 'BDACCCADAC'),  # 1..50
  'chemistry': list('CDABDCDDCC' 'CBDBBDCDCB' 'BDABCAACBD' 'CB?CADDBAA' 'DBACCDDABB'),  # 1..50 (33 = 釋疑送分)
  'english': list('ACBADBADAB' 'DCACBCADDC' 'CABDBADCBD' 'BDACBACDDA'),  # 1..40
}
# 已有官方釋疑的題不寫進 override（override 在 build 最後套用，會蓋掉釋疑）
SKIP = {'ISU-107-chemistry-33', 'ISU-107-chemistry-13', 'ISU-107-english-5'}

existing = {}
if os.path.isfile(OV):
    with open(OV, encoding='utf-8') as f:
        existing = json.load(f)
overrides = {k: v for k, v in existing.items() if not k.startswith('ISU-107-')}
kept = {k: v for k, v in existing.items() if k in SKIP}
for v in kept.values():  # 這三題的答案也已對照掃描核對過，只是答案本身由釋疑決定
    v['needs_review'] = False
filled = {s: 0 for s in KEY}
for subject, letters in KEY.items():
    for i, ch in enumerate(letters, start=1):
        qid = f'ISU-107-{subject}-{i}'
        if ch == '?' or qid in SKIP:
            if qid in kept:
                overrides[qid] = kept[qid]
            continue
        overrides[qid] = {
            'correct_answer': [ch],
            'original_answer': [ch],
            'needs_review': False,
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
