#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recompute concept_tags on the existing data shards — no PDFs needed.

The keyword taxonomy in tcmpipe/tags.py is the only thing that changed; answers,
errata, overrides and images are untouched. This re-derives concept_tags from the
already-extracted question_text + options, rewrites src/data/<school>.json and the
query index src/data/index/<school>.idx.json, per-school (isolated), and prints a
coverage report so we can sanity-check the new taxonomy.

Run:  python -m retag            (from pipeline/)  or  python pipeline/retag.py
"""
from __future__ import annotations
import os
import sys
import json
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C
from tcmpipe import tags as tg


def _load_tag_overrides() -> dict:
    """Human/curated per-question concept_tag corrections (sacred, win last).
    Used to move catch-all-bucket questions into their correct specific category."""
    p = os.path.join(C.OVERRIDES_DIR, 'concept_tags.json')
    if os.path.isfile(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    return {}


def _retag_school(school: str) -> dict:
    path = os.path.join(C.WEB_DATA_DIR, f'{school}.json')
    with open(path, encoding='utf-8') as f:
        shard = json.load(f)
    records = shard['questions']

    for r in records:
        stem = C.nfkc(r.get('question_text') or '')
        opts = [C.nfkc(o.get('text') or '') for o in (r.get('options') or [])]
        r['concept_tags'] = tg.assign_tags(r['subject'], stem, opts)

    # english cloze (neighbour-aware), primary tag
    cloze = tg.cloze_ids([{'id': r['id'], 'school': r['school'], 'year': r['year'],
                           'subject': r['subject'], 'question_number': r['question_number'],
                           'question_text': r.get('question_text')} for r in records])
    for r in records:
        if r['id'] in cloze:
            r['concept_tags'] = ['克漏字'] + [t for t in r['concept_tags'] if t != '克漏字']

    # curated concept_tag overrides win last
    overrides = _load_tag_overrides()
    for r in records:
        if r['id'] in overrides:
            r['concept_tags'] = overrides[r['id']]

    _write_shard(path, shard)
    _write_index(school, records)
    return _report(school, records)


def _write_shard(path: str, shard: dict) -> None:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(shard, f, ensure_ascii=False, separators=(',', ':'))


def _write_index(school: str, records: list[dict]) -> None:
    idx_dir = os.path.join(C.WEB_DATA_DIR, 'index')
    os.makedirs(idx_dir, exist_ok=True)
    by_year, by_subject, by_tag = defaultdict(list), defaultdict(list), defaultdict(list)
    for i, r in enumerate(records):
        by_year[str(r['year'])].append(i)
        by_subject[r['subject']].append(i)
        for t in r['concept_tags']:
            by_tag[t].append(i)
    idx = {'school': school, 'count': len(records),
           'years': sorted({r['year'] for r in records}),
           'subjects': sorted({r['subject'] for r in records}),
           'tags': sorted(by_tag.keys()),
           'byYear': dict(by_year), 'bySubject': dict(by_subject), 'byTag': dict(by_tag)}
    with open(os.path.join(idx_dir, f'{school}.idx.json'), 'w', encoding='utf-8') as f:
        json.dump(idx, f, ensure_ascii=False, separators=(',', ':'))


def _report(school: str, records: list[dict]) -> dict:
    by_subj_total: Counter = Counter()
    by_subj_untagged: Counter = Counter()
    by_subj_tagcount: dict[str, Counter] = defaultdict(Counter)
    for r in records:
        s = r['subject']
        by_subj_total[s] += 1
        if not r['concept_tags']:
            by_subj_untagged[s] += 1
        for t in r['concept_tags']:
            by_subj_tagcount[s][t] += 1
    print(f'\n=== {school} ({len(records)} questions) ===')
    for s in C.SUBJECTS:
        tot = by_subj_total[s]
        if not tot:
            continue
        un = by_subj_untagged[s]
        cov = 100 * (tot - un) / tot
        print(f'  {s}: {tot} q, untagged {un} ({cov:.1f}% covered)')
    return {'school': school, 'total': len(records),
            'untagged': dict(by_subj_untagged), 'totals': dict(by_subj_total),
            'tagcounts': {s: dict(c) for s, c in by_subj_tagcount.items()}}


def main() -> None:
    schools = [s for s in sys.argv[1:] if s in C.SCHOOLS] or C.SCHOOLS
    agg: dict[str, Counter] = defaultdict(Counter)
    tot: dict[str, Counter] = defaultdict(Counter)
    for school in schools:
        rep = _retag_school(school)
        for s, c in rep['tagcounts'].items():
            for t, n in c.items():
                agg[s][t] += n
        for s, n in rep['totals'].items():
            tot[s]['total'] += n
    print('\n=== combined tag distribution (all schools) ===')
    for s in C.SUBJECTS:
        print(f'\n[{s}] total {tot[s]["total"]}')
        for t, n in sorted(agg[s].items(), key=lambda x: -x[1]):
            print(f'  {n:4d}  {t}')


if __name__ == '__main__':
    main()
