#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add an `era` field to 國文 questions in src/data/{CMU,ISU,TCU}.json (in place).
Only 國文 questions are touched; other subjects keep their shard byte-for-byte.
Idempotent. Run AFTER the main build (build.py / retag.py rewrite these shards).

Run:  python pipeline/gen_era.py
"""
from __future__ import annotations
import os
import sys
import json
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C
from tcmpipe.era import assign_era


def main() -> None:
    dist: Counter = Counter()
    for s in C.SCHOOLS:
        path = os.path.join(C.WEB_DATA_DIR, f'{s}.json')
        with open(path, encoding='utf-8') as f:
            shard = json.load(f)
        for q in shard['questions']:
            if q.get('subject') == 'chinese':
                era = assign_era(q.get('question_text', ''), q.get('options'))
                q['era'] = era
                dist[era or '(未判定)'] += 1
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(shard, f, ensure_ascii=False, separators=(',', ':'))
    total = sum(dist.values())
    tagged = total - dist.get('(未判定)', 0)
    print(f'國文 questions={total}, era-tagged={tagged} ({100 * tagged // max(total, 1)}%)')
    for era, n in dist.most_common():
        print(f'  {era}: {n}')


if __name__ == '__main__':
    main()
