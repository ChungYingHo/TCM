#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Phase-1 regenerate: run the full pipeline, but only RE-RENDER images for the
subjects whose extraction changed (anchor fixes shifted their crop boundaries).
Every other subject keeps its committed image bytes (a fresh WebP encode differs
byte-for-byte, so blanket re-rendering would churn ~300MB for no visual change).

Dirty = the new anchor set's question-number multiset differs from what the
committed shard currently holds. For dirty subjects the stale image folder is
cleared first so removed phantom numbers don't linger."""
from __future__ import annotations
import sys, os, json, shutil, time
sys.stdout.reconfigure(encoding='utf-8')

import fitz
from tcmpipe import config as C, extract, build


def committed_nums():
    out: dict[tuple, list[int]] = {}
    for school in C.SCHOOLS:
        p = os.path.join(C.WEB_DATA_DIR, f'{school}.json')
        if not os.path.isfile(p):
            continue
        for q in json.load(open(p, encoding='utf-8'))['questions']:
            out.setdefault((school, q['year'], q['subject']), []).append(q['question_number'])
    return out


def new_nums():
    out: dict[tuple, list[int]] = {}
    for school in C.SCHOOLS:
        for year in C.YEARS:
            for subject, doc, anchors, src in build._exam_sources(school, year):
                if subject:
                    out.setdefault((school, year, subject), []).extend(a.num for a in anchors)
    return out


def main():
    old, new = committed_nums(), new_nums()
    keys = set(old) | set(new)
    dirty = {k for k in keys if sorted(old.get(k, [])) != sorted(new.get(k, []))}
    # segment-spec subjects always re-render: their output (image-only crops) is not
    # reflected in normal-extraction nums, so the multiset compare can't see the change
    for sk in build._SEGMENTS:
        school, year, subject = sk.split('-', 2)
        dirty.add((school, int(year), subject))
    print(f'dirty subjects (will re-render): {len(dirty)}')
    for k in sorted(dirty):
        print('   ', k, f'old={len(old.get(k,[]))} new={len(new.get(k,[]))}')

    # clear stale image folders for dirty subjects
    for (school, year, subject) in dirty:
        d = os.path.join(C.WEB_IMAGE_DIR, school, str(year), subject)
        if os.path.isdir(d):
            shutil.rmtree(d)

    rendered = {'n': 0}
    kept = {'n': 0}

    def _write(school, year, subject, num, data: bytes) -> str:
        d = os.path.join(C.WEB_IMAGE_DIR, school, str(year), subject)
        p = os.path.join(d, f'{num}.webp')
        url = f'/q/{school}/{year}/{subject}/{num}.webp'
        if (school, year, subject) not in dirty and os.path.isfile(p):
            kept['n'] += 1
            return url
        os.makedirs(d, exist_ok=True)
        with open(p, 'wb') as f:
            f.write(data)
        rendered['n'] += 1
        return url

    build._write_image = _write
    t0 = time.time()
    for school in C.SCHOOLS:
        build.run_school(school)
    print(f'\nDONE in {time.time()-t0:.0f}s | rendered={rendered["n"]} kept={kept["n"]}')


if __name__ == '__main__':
    main()
