#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Re-extract ONLY display text (question_text + options[].text) from the PDFs
using the fixed smart-space join, and update the existing data shards in place.

Correctness-first: this never touches correct_answer / original_answer / errata /
concept_tags / images / any other field. A record's text is updated only when the
re-extracted option LETTERS exactly match the stored ones (otherwise skipped), and
empty re-extractions never overwrite existing text. Answers are asserted unchanged.

Run:  python pipeline/refine_text.py
"""
from __future__ import annotations
import os
import sys
import json
import copy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C
from tcmpipe import extract as ex
from tcmpipe.build import _exam_sources


def _reextract_school(school: str) -> dict[str, tuple[str, list[dict]]]:
    """id -> (stem, [{letter,text}])  from the PDFs (text only, no rendering)."""
    out: dict[str, tuple[str, list[dict]]] = {}
    for year in C.YEARS:
        if not os.path.isdir(C.exam_dir(school, year)):
            continue
        for subject, doc, anchors, _src in _exam_sources(school, year):
            if subject is None:
                continue
            for i, a in enumerate(anchors):
                nxt = anchors[i + 1] if i + 1 < len(anchors) else None
                bands = ex._page_bands(doc, a, nxt)
                stem, opts = ex.parse_stem_options(ex._question_tokens(doc, bands))
                out[f'{school}-{year}-{subject}-{a.num}'] = (stem, opts)
    return out


def run(school: str) -> dict:
    path = os.path.join(C.WEB_DATA_DIR, f'{school}.json')
    with open(path, encoding='utf-8') as f:
        shard = json.load(f)
    answers_before = {r['id']: list(r.get('correct_answer') or []) for r in shard['questions']}

    fresh = _reextract_school(school)
    updated = skipped_letters = stem_fixed = opt_fixed = 0
    for r in shard['questions']:
        hit = fresh.get(r['id'])
        if not hit:
            continue
        new_stem, new_opts = hit
        old_opts = r.get('options') or []
        # safety: only touch text when the option letters line up exactly
        if [o['letter'] for o in new_opts] != [o.get('letter') for o in old_opts]:
            skipped_letters += 1
            continue
        changed = False
        if new_stem and new_stem != (r.get('question_text') or ''):
            r['question_text'] = new_stem
            stem_fixed += 1
            changed = True
        by_letter = {o['letter']: o['text'] for o in new_opts}
        for o in old_opts:
            nt = by_letter.get(o['letter'], '')
            if nt and nt != (o.get('text') or ''):
                o['text'] = nt
                opt_fixed += 1
                changed = True
        if changed:
            updated += 1

    # correctness assertion: answers must be byte-identical
    answers_after = {r['id']: list(r.get('correct_answer') or []) for r in shard['questions']}
    assert answers_before == answers_after, f'{school}: correct_answer changed!'

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(shard, f, ensure_ascii=False, separators=(',', ':'))
    print(f'[{school}] records text-updated={updated} (stems={stem_fixed}, options={opt_fixed}); '
          f'skipped(letter-mismatch)={skipped_letters}; answers UNCHANGED ✓')
    return {'school': school, 'updated': updated, 'skipped': skipped_letters}


def main() -> None:
    schools = [s for s in sys.argv[1:] if s in C.SCHOOLS] or C.SCHOOLS
    for s in schools:
        run(s)


if __name__ == '__main__':
    main()
