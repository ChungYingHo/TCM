#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Auto-generate pipeline/overrides/segments.json for the two mechanically-detectable
broken-PDF categories:

  • TCU 106 chemistry — doubled-glyph PDF: the real numbers 1–50 sit as tokens at
    the left margin x≈42.6 (some with an overlapping bogus single-digit `N.`); emit
    a per-question image-only crop and REPLACE the (garbled) normal extraction.
  • CMU english cloze (104–114) — inline-numbered passages: a `N-M` heading marks a
    block whose blanks have no left-margin anchor; emit one shared block crop per
    missing range and APPEND it.

The scanned TCU 112 chem+bio entries are authored separately (no text to detect).
Run:  python _gen_segments.py   (merges into segments.json, preserving manual keys)
"""
from __future__ import annotations
import sys, os, re, json
sys.stdout.reconfigure(encoding='utf-8')
import fitz
from tcmpipe import config as C, extract

MARGIN_NUM = re.compile(r'^(\d{1,3})\.?$')
RANGE = re.compile(r'^(\d{1,3})[-–~—](\d{1,3})[:：.]?$')


def _bands_between(doc, page, y, nxt_anchor):
    a = extract.Anchor(page, y, 45.0, 0)
    return [[p, t, b] for (p, t, b) in extract._page_bands(doc, a, nxt_anchor)]


def gen_tcu106_chem():
    doc = fitz.open(os.path.join(C.exam_dir('TCU', 106), 'exam_chemistry.pdf'))
    cand: dict[tuple, int] = {}          # (page, round(y)) -> num, at the true margin
    for (pno, x0, y0, x1, y1, t) in extract.load_words(doc):
        if 40.0 <= x0 <= 46.0:
            m = MARGIN_NUM.match(C.nfkc(t))
            if m:
                cand[(pno, round(y0))] = int(m.group(1))
    anchors = sorted((extract.Anchor(p, y, 42.6, n) for (p, y), n in cand.items()),
                     key=lambda a: (a.page, a.y))
    nums = [a.num for a in anchors]
    assert nums == list(range(1, 51)), f'TCU106 chem nums not 1..50: {nums}'
    items = []
    for i, a in enumerate(anchors):
        nxt = anchors[i + 1] if i + 1 < len(anchors) else None
        items.append({'nums': [a.num], 'bands': _bands_between(doc, a.page, a.y, nxt)})
    return {'note': '雙重文字層 PDF（文字疊印重複），改用每題圖片＋答案卡', 'replace': True, 'items': items}


def gen_cmu_english_cloze(year):
    path = os.path.join(C.exam_dir('CMU', year), 'exam_english.pdf')
    if not os.path.isfile(path):
        return None
    doc = fitz.open(path)
    real = extract.find_anchors(extract.load_words(doc))
    real_nums = {a.num for a in real}
    # range headings (x indented, plausible range)
    heads = []
    for pno in range(doc.page_count):
        for w in doc[pno].get_text('words'):
            m = RANGE.match(C.nfkc(w[4]).replace(' ', ''))
            if m and 80 < w[0] < 300:
                a, b = int(m.group(1)), int(m.group(2))
                if 0 < a < b <= 50 and b - a <= 12:
                    heads.append((pno, w[1], a, b))
    heads.sort(key=lambda h: (h[0], h[1]))
    items = []
    for idx, (hp, hy, a, b) in enumerate(heads):
        missing = [n for n in range(a, b + 1) if n not in real_nums]
        if not missing:
            continue
        # block ends at the next heading OR next real anchor, whichever comes first
        bounds = [(real_a.page, real_a.y) for real_a in real if (real_a.page, real_a.y) > (hp, hy)]
        bounds += [(heads[idx + 1][0], heads[idx + 1][1])] if idx + 1 < len(heads) else []
        nb = min(bounds) if bounds else None
        nxt = extract.Anchor(nb[0], nb[1], 45.0, 0) if nb else None
        items.append({'nums': missing, 'bands': _bands_between(doc, hp, hy, nxt)})
    if not items:
        return None
    return {'note': '克漏字／閱讀測驗：題號內嵌段落，整段（含選項）圖片＋答案卡', 'items': items}


# scanned (no text layer) TCU 112: per-page first-question numbers, read by eye from
# the left-margin strips. Ranges are contiguous and sum to 50 (a self-check).
T112_FIRSTS = {
    'chemistry': [1, 10, 17, 24, 30, 39, 47],          # content pages pno 1..7
    'biology':   [1, 9, 16, 23, 29, 34, 38, 42],       # content pages pno 1..8
}


def gen_tcu112_scanned(subject, fn):
    doc = fitz.open(os.path.join(C.exam_dir('TCU', 112), fn))
    firsts = T112_FIRSTS[subject]
    items = []
    for i, first in enumerate(firsts):
        pno = i + 1                                     # pno 0 is the cover
        nxt = firsts[i + 1] if i + 1 < len(firsts) else 51
        ph = doc[pno].rect.height
        bands = [[pno, 56.0, round(ph - 26, 1)]]
        if pno + 1 < doc.page_count:                    # overlap next page top to catch
            bands.append([pno + 1, 56.0, 356.0])        # options that bleed across the break
        items.append({'nums': list(range(first, nxt)), 'bands': bands})
    total = sum(len(it['nums']) for it in items)
    assert total == 50 and [it['nums'][0] for it in items] == firsts, f'{subject} map bad: {total}'
    return {'note': '掃描卷（無文字層），整頁圖片＋答案卡；同頁題目共用頁面圖', 'replace': True, 'items': items}


def main():
    seg = {}
    if os.path.isfile(C.SEGMENTS_FILE):
        seg = json.load(open(C.SEGMENTS_FILE, encoding='utf-8'))
    seg['TCU-106-chemistry'] = gen_tcu106_chem()
    seg['TCU-112-chemistry'] = gen_tcu112_scanned('chemistry', 'exam_chemistry.pdf')
    seg['TCU-112-biology'] = gen_tcu112_scanned('biology', 'exam_biology.pdf')
    # CMU 111 chemistry: last page (pno 9) is a scanned image holding Q49 & Q50
    # (organic-structure questions). Append per-question crops of that page.
    seg['CMU-111-chemistry'] = {'note': '最後一頁為掃描影像（有機結構題），圖片＋答案卡',
                                'items': [{'nums': [49], 'bands': [[9, 95.0, 308.0]]},
                                          {'nums': [50], 'bands': [[9, 305.0, 700.0]]}]}
    for year in range(104, 116):
        s = gen_cmu_english_cloze(year)
        if s:
            seg[f'CMU-{year}-english'] = s
    # summary
    for k, v in sorted(seg.items()):
        n = sum(len(it['nums']) for it in v['items'])
        print(f'{k:22} items={len(v["items"]):2} nums={n:2} replace={v.get("replace", False)}')
    os.makedirs(os.path.dirname(C.SEGMENTS_FILE), exist_ok=True)
    json.dump(seg, open(C.SEGMENTS_FILE, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('\nwrote', C.SEGMENTS_FILE)


if __name__ == '__main__':
    main()
