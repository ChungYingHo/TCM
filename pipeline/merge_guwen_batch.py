#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Append a batch of 古文 entries to pipeline/data/guwen_seed.json. Preserves the
existing entries byte-safe, validates required fields + id uniqueness, then saves
(UTF-8, indent=2). After merging, run gen_classics.py + gen_schedule.py.

ASCII-only stdout (Windows cp950); files are UTF-8.

Run:  python pipeline/merge_guwen_batch.py <batch.json>
"""
from __future__ import annotations
import os
import sys
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = os.path.join(ROOT, 'pipeline', 'data', 'guwen_seed.json')
REQUIRED = ('id', 'title', 'author', 'dynasty', 'era', 'source', 'tags', 'original', 'translation', 'annotation')
ERAS = {'先秦', '漢', '魏晉南北朝', '唐', '宋', '元', '明', '清', '近現代'}


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit('usage: merge_guwen_batch.py <batch.json>')
    with open(SEED, encoding='utf-8') as f:
        seed = json.load(f)
    with open(sys.argv[1], encoding='utf-8') as f:
        batch = json.load(f)
    seen = {e['id'] for e in seed}
    added, skipped = 0, []
    for e in batch:
        miss = [k for k in REQUIRED if not e.get(k) and e.get(k) != []]
        if miss or e['id'] in seen or e['era'] not in ERAS:
            skipped.append(f"{e.get('id','?')}({','.join(miss) or ('dup' if e.get('id') in seen else 'era')})")
            continue
        seed.append(e)
        seen.add(e['id'])
        added += 1
    with open(SEED, 'w', encoding='utf-8') as f:
        json.dump(seed, f, ensure_ascii=False, indent=2)
    print(f'batch={len(batch)} added={added} total={len(seed)} skipped={len(skipped)}')
    if skipped:
        print('skipped:', ', '.join(skipped))


if __name__ == '__main__':
    main()
