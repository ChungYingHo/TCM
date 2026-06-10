#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble src/data/classics.json from the curated 古文 seed (古文觀止-adjacent,
public-domain). The ORIGINAL text is authoritative; the 白話 translation + 註釋 are
editor/LLM drafts → draft:true (shown with an 「AI 草稿」 badge). `examRelevance`
counts how often each piece's title or author surfaces in the 國文 question bank,
so the daily plan can prioritise high-yield texts.

Run:  python pipeline/gen_classics.py
"""
from __future__ import annotations
import os
import sys
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C

SEED = os.path.join(C.ROOT, 'pipeline', 'data', 'guwen_seed.json')
OUT = os.path.join(C.WEB_DATA_DIR, 'classics.json')


def chinese_questions() -> list[dict]:
    qs: list[dict] = []
    for s in C.SCHOOLS:
        with open(os.path.join(C.WEB_DATA_DIR, f'{s}.json'), encoding='utf-8') as f:
            qs += [q for q in json.load(f)['questions'] if q['subject'] == 'chinese']
    return qs


def main() -> None:
    with open(SEED, encoding='utf-8') as f:
        seed = json.load(f)
    qs = chinese_questions()

    out = []
    for c in seed:
        title = c['title'].split('（')[0]  # 馬說（雜說四） -> 馬說
        author = c['author'].split('（')[0]  # 孔子（語，《禮記》輯錄） -> 孔子
        needles = [n for n in (title, author) if n]
        hits, tags = [], set()
        for q in qs:
            text = (q.get('question_text') or '') + ' ' + ' '.join(
                o.get('text', '') for o in (q.get('options') or [])
            )
            if any(n in text for n in needles):
                hits.append(q['id'])
                tags.update(q.get('concept_tags') or [])
        out.append({
            'id': c['id'],
            'title': c['title'],
            'author': c['author'],
            'dynasty': c['dynasty'],
            'era': c['era'],
            'source': c.get('source', ''),
            'tags': c.get('tags', []),
            'original': c['original'],
            'translation': c['translation'],
            'annotation': c.get('annotation', []),
            'draft': True,  # translation/annotation are drafts; original is authoritative
            'examRelevance': {'count': len(hits), 'ids': hits[:10], 'tags': sorted(tags)},
        })

    out.sort(key=lambda x: (-x['examRelevance']['count'], x['id']))
    payload = {
        'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'count': len(out),
        'classics': out,
    }
    os.makedirs(C.WEB_DATA_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, separators=(',', ':'))
    print(f'classics={len(out)} ->', {c['title'][:6]: c['examRelevance']['count'] for c in out})


if __name__ == '__main__':
    main()
