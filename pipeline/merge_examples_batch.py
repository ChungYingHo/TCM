#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Merge a hand-authored batch of example sentences into the committed cache
pipeline/data/vocab_examples.json. Lets gaps be filled in batches without an API
key (做法二 in HANDOFF.md): author a {word: {example, example_zh}} batch file,
run this to fold it into the cache, then run gen_vocab_examples.py once at the end.

Keyed by word, so re-ranking the base list never loses examples and this is
idempotent / resumable. Stdout is ASCII-only (Windows cp950 consoles cannot
print CJK); the JSON files themselves are always UTF-8.

Run:
  python pipeline/merge_examples_batch.py [batch.json]   # default pipeline/out/_batch.json
"""
from __future__ import annotations
import os
import sys
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'pipeline', 'data', 'vocab_examples.json')


def load_json(path: str, default):
    if not os.path.exists(path):
        return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def main() -> None:
    batch_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'pipeline', 'out', '_batch.json')
    batch = load_json(batch_path, None)
    if not isinstance(batch, dict):
        sys.exit(f'batch file not found or not an object: {batch_path}')
    cache = load_json(CACHE, {})

    before = len(cache)
    added = updated = 0
    skipped: list[str] = []
    for word, ex in batch.items():
        if not (isinstance(ex, dict) and isinstance(ex.get('example'), str) and ex['example'].strip()
                and isinstance(ex.get('example_zh'), str) and ex['example_zh'].strip()):
            skipped.append(word)
            continue
        if word in cache:
            updated += 1
        else:
            added += 1
        cache[word] = {'example': ex['example'].strip(), 'example_zh': ex['example_zh'].strip()}

    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2, sort_keys=True)

    print(f'batch={len(batch)} added={added} updated={updated} skipped={len(skipped)} '
          f'cache: {before} -> {len(cache)}')
    if skipped:
        print('skipped (invalid/empty): ' + ', '.join(skipped[:50]))


if __name__ == '__main__':
    main()
