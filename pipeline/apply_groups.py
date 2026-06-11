#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Merge pipeline/data/question_groups.json into the existing src/data/<school>.json
shards in place — so passage-group context lands without a full PDF rebuild.

A full `python -m tcmpipe.build` already does this merge (see build.py); this script
is the cheap path when only gen_groups.py was re-run.

Run:  python pipeline/gen_groups.py && python pipeline/apply_groups.py
"""
from __future__ import annotations
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C

GROUPS = os.path.join(C.ROOT, 'pipeline', 'data', 'question_groups.json')
GROUP_FIELDS = ('group', 'passage_image_url', 'passage_image_w', 'passage_image_h')


def main() -> None:
    with open(GROUPS, encoding='utf-8') as f:
        gmap = json.load(f).get('groups', {})

    for school in C.SCHOOLS:
        path = os.path.join(C.WEB_DATA_DIR, f'{school}.json')
        if not os.path.isfile(path):
            continue
        with open(path, encoding='utf-8') as f:
            shard = json.load(f)
        applied = 0
        for q in shard['questions']:
            gi = gmap.get(q['id'])
            # clear stale fields first so a re-run after detection changes is clean
            for k in GROUP_FIELDS:
                q.pop(k, None)
            if gi and gi.get('passage_image_url'):
                q['group'] = gi['group']
                q['passage_image_url'] = gi['passage_image_url']
                q['passage_image_w'] = gi.get('passage_image_w', 0)
                q['passage_image_h'] = gi.get('passage_image_h', 0)
                applied += 1
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(shard, f, ensure_ascii=False, separators=(',', ':'))
        print(f'[{school}] passage-group members applied: {applied}')


if __name__ == '__main__':
    main()
