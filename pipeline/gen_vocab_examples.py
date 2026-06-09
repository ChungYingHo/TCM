#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Attach bilingual example sentences to the vocab list and write the final
src/data/vocab.json. Examples live in pipeline/data/vocab_examples.json (committed),
so re-ranking the base list never loses authored examples and gaps can be filled in
batches. Examples are LLM-drafted study aids → every one is flagged `draft: true`
(per CLAUDE.md: the LLM only writes non-critical aids, never the answer key).

Run:
  python pipeline/gen_vocab_examples.py            # merge cache -> src/data/vocab.json
  ANTHROPIC_API_KEY=sk-... python pipeline/gen_vocab_examples.py --fill 500
                                                   # generate 500 missing examples, then merge
"""
from __future__ import annotations
import os
import sys
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C

BASE = os.path.join(C.OUT_DIR, 'vocab_base.json')
CACHE = os.path.join(C.ROOT, 'pipeline', 'data', 'vocab_examples.json')
OUT = os.path.join(C.WEB_DATA_DIR, 'vocab.json')


def load_json(path: str, default):
    if not os.path.exists(path):
        return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def save_cache(cache: dict) -> None:
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2, sort_keys=True)


def fill_examples(words: list[dict], cache: dict, limit: int) -> None:
    """Generate missing examples via the Anthropic API (idempotent — only fills gaps)."""
    key = os.environ.get('ANTHROPIC_API_KEY')
    if not key:
        sys.exit('--fill needs ANTHROPIC_API_KEY (examples are non-critical study aids).')
    import urllib.request
    base = os.environ.get('ANTHROPIC_BASE_URL', 'https://api.anthropic.com').rstrip('/')
    todo = [w for w in words if w['word'] not in cache][:limit]
    print(f'filling {len(todo)} examples via API…')
    for i in range(0, len(todo), 20):
        batch = todo[i:i + 20]
        listing = '\n'.join(f"{w['word']} — {w['zh'][:40]}" for w in batch)
        prompt = (
            'For each English word below, write ONE natural example sentence that makes the '
            'meaning obvious, plus a Traditional-Chinese (zh-Hant, Taiwan) translation. '
            'Return ONLY a JSON object mapping word -> {"example","example_zh"}.\n\n' + listing
        )
        body = json.dumps({
            'model': 'claude-sonnet-4-6',
            'max_tokens': 4000,
            'messages': [{'role': 'user', 'content': prompt}],
        }).encode()
        req = urllib.request.Request(
            f'{base}/v1/messages', data=body,
            headers={'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'},
        )
        try:
            resp = json.load(urllib.request.urlopen(req, timeout=60))
            text = resp['content'][0]['text']
            text = text[text.find('{'):text.rfind('}') + 1]
            got = json.loads(text)
            for w, ex in got.items():
                if isinstance(ex, dict) and ex.get('example'):
                    cache[w] = {'example': ex['example'], 'example_zh': ex.get('example_zh', '')}
            print(f'  batch {i // 20 + 1}: +{len(got)}')
            save_cache(cache)  # checkpoint after each batch
        except Exception as e:  # noqa: BLE001 — best-effort bulk fill
            print(f'  batch {i // 20 + 1} failed: {e}')


def main() -> None:
    # Prefer the freshly-ranked base; fall back to the shipped vocab.json so examples
    # can be filled on a clean clone without re-downloading ECDICT.
    base = load_json(BASE, None) or load_json(OUT, None)
    if not base:
        sys.exit(f'missing {BASE} and {OUT} — run pipeline/gen_vocab_ecdict.py first')
    words = base['words']
    cache = load_json(CACHE, {})

    if '--fill' in sys.argv:
        n = int(sys.argv[sys.argv.index('--fill') + 1])
        fill_examples(words, cache, n)
        cache = load_json(CACHE, {})

    with_ex = 0
    for w in words:
        ex = cache.get(w['word'])
        if ex and ex.get('example'):
            w['example'] = ex['example']
            w['example_zh'] = ex.get('example_zh', '')
            w['draft'] = True  # LLM-drafted study aid
            with_ex += 1

    out = {
        'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'count': len(words),
        'withExamples': with_ex,
        'words': words,
    }
    os.makedirs(C.WEB_DATA_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'wrote {OUT}: {len(words)} words, {with_ex} with examples '
          f'({len(words) - with_ex} pending — run with --fill + API key)')


if __name__ == '__main__':
    main()
