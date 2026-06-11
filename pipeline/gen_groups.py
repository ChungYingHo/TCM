#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Detect passage groups (題組/克漏字/長閱讀) and render each group's shared passage
as its own image, so a group question served standalone can show its context.

Why: question crops run anchor-to-anchor, so a group's shared passage lands at the
BOTTOM of the PREVIOUS question's crop — invisible when a member is drilled alone.

How:
  1. Scan each exam PDF for range markers (※…回答第 X~Y 題 / Questions X-Y / 題組…).
     Markers fully containing a finer marker are dropped (keep the per-passage ones).
  2. Wide ranges that bundle several passages (e.g. CMU Cloze Questions 21-40) are
     sub-split wherever a substantial text block sits between two member anchors
     (= the next passage). Each sub-group's passage region = block top → first
     member's anchor.
  3. Region is rendered via the same band/crop machinery as questions and written to
     public/q/<school>/<year>/<subject>/p<start>-<end>.webp.
  4. Members already covered by a segments.json item are skipped for passage
     attachment (their shared manual crop already includes the passage).

Output: pipeline/data/question_groups.json
  {qid: {"group": [start, end], "passage_image_url": str, "passage_image_w": int,
         "passage_image_h": int}}
Apply to shards with apply_groups.py (also merged by tcmpipe.build on full rebuilds).

Run:  python pipeline/gen_groups.py [--dry]
"""
from __future__ import annotations
import os
import re
import sys
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fitz

from tcmpipe import config as C
from tcmpipe import extract
from tcmpipe.extract import Anchor

OUT = os.path.join(C.ROOT, 'pipeline', 'data', 'question_groups.json')

ZH_RE = re.compile(r'回答\s*第?\s*(\d{1,3})\s*[~～〜\-–—至]+\s*第?\s*(\d{1,3})\s*題'
                   r'|(?:^|※)\s*(\d{1,3})\s*[~～〜\-–—至]+\s*(\d{1,3})\s*為?題組')
EN_RE = re.compile(r'Questions?\s*(\d{1,3})\s*[-–~‐]\s*(\d{1,3})', re.I)
OPT_LINE_RE = re.compile(r'\([A-E]\)')
# page furniture that isn't caught by extract's header/footer filters (turn-page
# notices etc.) — must never count toward a "passage block"
CHROME_EXTRA_RE = re.compile(r'背面[還尚]有試題|以下空白|試題隨卷繳回|請翻頁')
MIN_PASSAGE_CHARS = 70   # a real passage block between members is at least this long
MIN_REGION_CHARS = 60    # groups whose region holds less text than this are dropped
                         # (section headers like "Questions 1-10: complete each sentence")


def _lang_chars(subject: str, txt: str) -> int:
    """Language-relevant character count: an English passage is mostly Latin and a
    Chinese one mostly CJK — page furniture in the other script never adds up."""
    if subject == 'english':
        return sum(1 for ch in txt if ch.isascii() and ch.isalpha())
    return sum(1 for ch in txt if '一' <= ch <= '鿿')


def _page_lines(page) -> list[tuple[float, str]]:
    """Visual lines of a page -> [(y0, joined_text)] (reading order)."""
    ws = sorted(page.get_text('words'), key=lambda w: (round(w[1], 1), w[0]))
    rows: list[list] = []
    cur: list = []
    cy = None
    for w in ws:
        if cy is None or abs(w[1] - cy) <= 3.0:
            cur.append(w)
            cy = w[1] if cy is None else cy
        else:
            rows.append(cur)
            cur, cy = [w], w[1]
    if cur:
        rows.append(cur)
    out = []
    for ln in rows:
        ln.sort(key=lambda w: w[0])
        out.append((ln[0][1], C.nfkc(''.join(x[4] for x in ln))))
    return out


def _find_markers(doc) -> list[dict]:
    """All range markers in the doc -> [{'s','e','page','y','text'}]."""
    found = []
    for pno in range(doc.page_count):
        for (y, txt) in _page_lines(doc[pno]):
            m = ZH_RE.search(txt) or EN_RE.search(txt)
            if not m:
                continue
            nums = [x for x in m.groups() if x is not None]
            s, e = int(nums[0]), int(nums[1])
            if 1 <= s < e <= 100 and e - s <= 40:
                found.append({'s': s, 'e': e, 'page': pno, 'y': y, 'text': txt})
    return found


def _drop_outer(markers: list[dict]) -> list[dict]:
    """Drop a marker iff a strictly finer marker lies inside its range."""
    keep = []
    for m in markers:
        outer = any(o is not m and m['s'] <= o['s'] and o['e'] <= m['e']
                    and (o['e'] - o['s']) < (m['e'] - m['s']) for o in markers)
        if not outer:
            keep.append(m)
    return keep


def _gap_block(doc, subject: str, prev: Anchor, nxt: Anchor) -> tuple[int, float, int] | None:
    """A substantial text block between two member anchors (= the next passage).
    Returns (page, top_y, chars) of the block, or None. The block = lines below the
    LAST option-marker line in the gap (a passage never contains (A)..(E) rows)."""
    lines: list[tuple[int, float, str]] = []
    for pno in range(prev.page, nxt.page + 1):
        for (y, txt) in _page_lines(doc[pno]):
            if pno == prev.page and y <= prev.y + 1:
                continue
            if pno == nxt.page and y >= nxt.y - 1:
                continue
            if extract._is_chrome(txt) or CHROME_EXTRA_RE.search(txt):
                continue
            lines.append((pno, y, txt))
    last_opt = -1
    for i, (_, _, txt) in enumerate(lines):
        if OPT_LINE_RE.search(txt):
            last_opt = i
    block = lines[last_opt + 1:]
    chars = sum(_lang_chars(subject, t) for (_, _, t) in block)
    if not block or chars < MIN_PASSAGE_CHARS:
        return None
    return (block[0][0], block[0][1], chars)


def _region_chars(doc, top: Anchor, bottom: Anchor) -> int:
    n = 0
    for pno in range(top.page, bottom.page + 1):
        for (y, txt) in _page_lines(doc[pno]):
            if pno == top.page and y < top.y - 1:
                continue
            if pno == bottom.page and y >= bottom.y - 1:
                continue
            if not extract._is_chrome(txt):
                n += len(txt)
    return n


def _load_segment_nums(school: str, year: int, subject: str) -> set[int]:
    p = os.path.join(C.OVERRIDES_DIR, 'segments.json')
    if not os.path.isfile(p):
        return set()
    with open(p, encoding='utf-8') as f:
        spec = json.load(f).get(f'{school}-{year}-{subject}')
    return {n for it in (spec or {}).get('items', []) for n in it['nums']}


def _write_passage(school, year, subject, s, e, data: bytes) -> str:
    d = os.path.join(C.WEB_IMAGE_DIR, school, str(year), subject)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, f'p{s}-{e}.webp'), 'wb') as f:
        f.write(data)
    return f'/q/{school}/{year}/{subject}/p{s}-{e}.webp'


def run(dry: bool = False) -> dict:
    groups: dict[str, dict] = {}
    report = {'groups': 0, 'members': 0, 'skipped_small': [], 'skipped_segment': [],
              'subsplits': [], 'fallback': []}

    for school in C.SCHOOLS:
        for year in C.YEARS:
            edir = C.exam_dir(school, year)
            if not os.path.isdir(edir):
                continue
            # reuse build's source discovery (per-subject docs + anchors/sections)
            from tcmpipe.build import _exam_sources
            for (subject, doc, anchors, _src) in _exam_sources(school, year):
                if subject is None:
                    continue
                by_num = {a.num: a for a in anchors}
                nums = sorted(by_num)
                markers = [m for m in _drop_outer(_find_markers(doc))
                           if m['s'] in by_num or m['e'] in by_num]
                # keep only markers positioned before their first member's anchor
                # (guards ISU's combined PDF where numbers repeat across subjects)
                def _before(m, a: Anchor) -> bool:
                    return (m['page'], m['y']) < (a.page, a.y)
                markers = [m for m in markers
                           if m['s'] in by_num and _before(m, by_num[m['s']])
                           and (by_num[m['s']].page - m['page']) <= 2]
                seg_nums = _load_segment_nums(school, year, subject)

                for m in markers:
                    members = [n for n in range(m['s'], m['e'] + 1)]
                    # sub-split a wide range at every passage block between members
                    cuts = [m['s']]
                    for n in members[1:]:
                        if n in by_num and (n - 1) in by_num:
                            blk = _gap_block(doc, subject, by_num[n - 1], by_num[n])
                            if blk:
                                cuts.append(n)
                    cuts.append(m['e'] + 1)
                    for ci in range(len(cuts) - 1):
                        s, e = cuts[ci], cuts[ci + 1] - 1
                        if s > e:
                            continue
                        anchored = [n for n in range(s, e + 1) if n in by_num]
                        non_seg = [n for n in anchored if n not in seg_nums]
                        if not non_seg:
                            report['skipped_segment'].append(f'{school}-{year}-{subject} {s}-{e}')
                            continue
                        first = by_num[anchored[0]]
                        if ci == 0:
                            top = Anchor(m['page'], max(0.0, m['y'] - 4), 0, 0)
                        else:
                            blk = _gap_block(doc, subject, by_num[s - 1], by_num[s])
                            if not blk:
                                continue
                            top = Anchor(blk[0], max(0.0, blk[1] - 4), 0, 0)
                        if _region_chars(doc, top, first) < MIN_REGION_CHARS:
                            report['skipped_small'].append(f'{school}-{year}-{subject} {s}-{e}')
                            continue
                        bands = extract._page_bands(doc, top, first)
                        url, w, h = '', 0, 0
                        if not dry:
                            img, w, h, _sp = extract._render_crop(doc, bands)
                            url = _write_passage(school, year, subject, s, e, img)
                        if ci > 0:
                            report['subsplits'].append(f'{school}-{year}-{subject} {s}-{e}')
                        report['groups'] += 1
                        for n in range(s, e + 1):
                            qid = f'{school}-{year}-{subject}-{n}'
                            groups[qid] = {
                                'group': [s, e],
                                'passage_image_url': url,
                                'passage_image_w': w,
                                'passage_image_h': h,
                            }
                            report['members'] += 1

    # ── marker-less fallback (english only) ──────────────────────────────────
    # TCU/ISU english bundles cloze/reading under "Passage N"-style headers with
    # no question ranges. Infer groups purely from anchor-gap passage blocks:
    # a block (≥150 Latin chars) starts a group at the next question; membership
    # extends over consecutive ORPHAN-looking questions (stem < 60 Latin chars —
    # bare option rows / "This passage…" stems) until the next block.
    for school in C.SCHOOLS:
        for year in C.YEARS:
            edir = C.exam_dir(school, year)
            if not os.path.isdir(edir):
                continue
            from tcmpipe.build import _exam_sources
            for (subject, doc, anchors, _src) in _exam_sources(school, year):
                if subject != 'english':
                    continue
                by_num = {a.num: a for a in anchors}
                nums = sorted(by_num)
                seg_nums = _load_segment_nums(school, year, subject)
                stems: dict[int, str] = {}
                for i, a in enumerate(anchors):
                    nxt = anchors[i + 1] if i + 1 < len(anchors) else None
                    bands = extract._page_bands(doc, a, nxt)
                    stem, _opts = extract.parse_stem_options(extract._question_tokens(doc, bands))
                    stems[a.num] = stem
                idx = {n: i for i, n in enumerate(nums)}
                cur: list[int] = []
                cur_top: Anchor | None = None
                def _flush():
                    nonlocal cur, cur_top
                    if cur_top and len(cur) >= 1:
                        s, e = cur[0], cur[-1]
                        if not dry:
                            bands = extract._page_bands(doc, cur_top, by_num[s])
                            img, w, h, _sp = extract._render_crop(doc, bands)
                            url = _write_passage(school, year, subject, s, e, img)
                        else:
                            url, w, h = '', 0, 0
                        report['groups'] += 1
                        report['fallback'].append(f'{school}-{year}-{subject} {s}-{e}')
                        for n in cur:
                            qid = f'{school}-{year}-{subject}-{n}'
                            groups[qid] = {'group': [s, e], 'passage_image_url': url,
                                           'passage_image_w': w, 'passage_image_h': h}
                            report['members'] += 1
                    cur, cur_top = [], None
                SECTION_HEAD_RE = re.compile(r'^[IVX]+\.\s')
                def _section_head_between(prev: Anchor, nxt: Anchor) -> bool:
                    for pno in range(prev.page, nxt.page + 1):
                        for (y, txt) in _page_lines(doc[pno]):
                            if pno == prev.page and y <= prev.y + 1:
                                continue
                            if pno == nxt.page and y >= nxt.y - 1:
                                continue
                            if SECTION_HEAD_RE.match(txt):
                                return True
                    return False
                for n in nums:
                    qid = f'{school}-{year}-{subject}-{n}'
                    prev_n = nums[idx[n] - 1] if idx[n] > 0 else None
                    blk = (_gap_block(doc, subject, by_num[prev_n], by_num[n])
                           if prev_n is not None else None)
                    new_block = blk is not None and blk[2] >= 150
                    stem = stems.get(n, '')
                    standalone = '__' in stem  # sentence-completion blank → not a group member
                    orphan = _lang_chars('english', stem) < 60 and not standalone
                    if qid in groups or n in seg_nums:
                        _flush()
                        continue
                    if new_block:
                        _flush()
                        if orphan:
                            cur = [n]
                            cur_top = Anchor(blk[0], max(0.0, blk[1] - 4), 0, 0)
                        continue
                    # continuation: stay in the group until the next passage block,
                    # a section header, a sentence-completion stem, or the size cap
                    if cur and not standalone and len(cur) < 12 \
                            and prev_n is not None and not _section_head_between(by_num[prev_n], by_num[n]):
                        cur.append(n)
                    else:
                        _flush()
                _flush()

    if not dry:
        with open(OUT, 'w', encoding='utf-8') as f:
            json.dump({'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                       'groups': groups}, f, ensure_ascii=False, indent=1)
    print(f"groups={report['groups']} members={report['members']} "
          f"subsplits={len(report['subsplits'])} "
          f"skipped_small={len(report['skipped_small'])} "
          f"skipped_segment={len(report['skipped_segment'])}")
    for k in ('subsplits', 'skipped_small', 'skipped_segment', 'fallback'):
        for line in report[k]:
            print(f'  [{k}] {line}')
    return groups


if __name__ == '__main__':
    run(dry='--dry' in sys.argv)
