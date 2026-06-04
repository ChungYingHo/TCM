#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render + segment exam PDFs into per-question (text, options, crop image).

All three schools are single-column. Question-number tokens `N.` near the left
margin are the segmentation anchors — matched as a prefix so a number glued to the
stem (`10.假設…`) still anchors, and in-content numbered lists are dropped by left-x
clustering (`_drop_spurious_anchors`). Words are assigned to a question by their
vertical centre, and grouped into visual lines so two-column option blocks read in
order (`_question_tokens`). Option markers are `(A)`..`(E)` — standalone (CMU/TCU)
or glued to the option text (ISU); both handled by `parse_stem_options`.

PDFs that defeat text extraction (scanned with no text layer, doubled-glyph layers,
inline-numbered cloze blocks) are covered by image-only crops in
`pipeline/overrides/segments.json`, consumed in `build._segment_records`.
"""
from __future__ import annotations
import re
import io
from dataclasses import dataclass

import fitz
from PIL import Image

from tcmpipe import config as C

QNUM_RE = re.compile(r'^(\d{1,3})\.$')                  # standalone "12." token
# question number at the START of a token — the dot must NOT be followed by a digit
# (so decimals like "1.5" never match) but MAY be followed by glued stem text, e.g.
# "10.假設在動物胚胎…" which single-token QNUM_RE misses entirely (whole question lost).
QNUM_PREFIX_RE = re.compile(r'^(\d{1,3})\.(?=\D|$)')
OPT_RE = re.compile(r'^\(([A-E])\)(.*)$')


@dataclass
class Anchor:
    page: int
    y: float
    x: float
    num: int


@dataclass
class Extracted:
    num: int
    stem: str
    options: list[dict]          # [{'letter','text'}]
    image_w: int
    image_h: int
    image_bytes: bytes           # WebP
    spans_pages: bool


def load_words(doc: fitz.Document) -> list[tuple]:
    out = []
    for pno in range(doc.page_count):
        for w in doc[pno].get_text('words'):
            out.append((pno, w[0], w[1], w[2], w[3], C.nfkc(w[4])))
    return out


def find_anchors(words: list[tuple]) -> list[Anchor]:
    anchors = []
    for (pno, x0, y0, x1, y1, t) in words:
        m = QNUM_PREFIX_RE.match(t)
        if m and x0 < C.LEFT_MARGIN_MAX:
            anchors.append(Anchor(pno, y0, x0, int(m.group(1))))
    anchors.sort(key=lambda a: (a.page, a.y))
    return _drop_spurious_anchors(anchors)


def _drop_spurious_anchors(anchors: list[Anchor]) -> list[Anchor]:
    """Reject anchors that aren't at a question left margin. Real question numbers
    line up at a margin; an in-content numbered list (`1. 2. 3.` inside a question)
    sits indented and would otherwise become phantom questions.

    A combined exam (ISU `exam_all.pdf`) holds several subjects whose margins can
    differ (English is indented ~10pt from the CJK subjects), so keep EVERY sizable
    x-cluster — not just the dominant one — and drop only the small outlier clusters
    (a stray list is a handful of anchors; a subject is 35–50)."""
    if len(anchors) < 8:
        return anchors
    # group xs into margin clusters, splitting only on a wide gap. Single-digit
    # numbers are right-aligned ~6pt past the two-digit column ("9." vs "10."), so
    # they must stay in their subject's cluster; an in-content list is indented far
    # more (~14pt) and stays a separate, small cluster.
    xs = sorted(a.x for a in anchors)
    clusters: list[list[float]] = []
    for x in xs:
        if clusters and x - clusters[-1][-1] <= 9.0:
            clusters[-1].append(x)
        else:
            clusters.append([x])
    keep = [(cl[0], cl[-1]) for cl in clusters if len(cl) >= 10]  # sizable margins only
    if not keep:
        return anchors                       # tiny file — don't over-filter
    return [a for a in anchors if any(lo - 3.0 <= a.x <= hi + 3.0 for lo, hi in keep)]


def split_sections(anchors: list[Anchor]) -> list[list[Anchor]]:
    """Split a linear anchor stream into subject sections at question-number resets
    (used for ISU's combined exam_all.pdf)."""
    sections, cur = [], []
    for a in anchors:
        if cur and a.num <= cur[-1].num:
            sections.append(cur)
            cur = []
        cur.append(a)
    if cur:
        sections.append(cur)
    return sections


def detect_subject(doc: fitz.Document, page_from: int, page_to: int) -> str | None:
    """Find subject keyword in the header region of a section's pages."""
    for pno in range(page_from, min(page_to + 1, doc.page_count)):
        # headers render subject names spaced ("國 文", "生 物 學") -> strip whitespace
        head = ''.join(C.nfkc(doc[pno].get_text('text')[:200]).split())
        for kw, code in C.SUBJECT_KEYWORDS:
            if kw in head:
                return code
    return None


def _need_space(prev: str, nxt: str) -> bool:
    """Space between two reading-order tokens only at a Latin word boundary.
    PyMuPDF yields real space-delimited tokens, so two ASCII alphanumerics across
    a token boundary were separated by a space in the PDF (e.g. "Population"+
    "ecology"). CJK needs no spaces, so never insert one next to a CJK char."""
    if not prev or not nxt:
        return False
    a, b = prev[-1], nxt[0]
    return a.isascii() and a.isalnum() and b.isascii() and b.isalnum()


def _smart_join(parts: list[str]) -> str:
    out = ''
    for p in parts:
        if not p:
            continue
        if out and _need_space(out, p):
            out += ' '
        out += p
    # space out fill-in blanks stuck to adjacent Latin text (e.g. "with_____evidence")
    out = re.sub(r'([A-Za-z0-9])(_{2,})', r'\1 \2', out)
    out = re.sub(r'(_{2,})([A-Za-z0-9])', r'\1 \2', out)
    return out


def parse_stem_options(tokens: list[str]) -> tuple[str, list[dict]]:
    """Reading-order tokens of one question -> (stem, options).
    Stem = text before the first option marker. Each `(X)` starts a new option;
    following non-marker tokens append to its text. Tokens are joined with
    `_smart_join` so embedded English keeps its spaces while CJK stays unspaced."""
    stem_parts: list[str] = []
    options: list[dict] = []
    cur: dict | None = None
    for i, t in enumerate(tokens):
        if QNUM_RE.match(t):
            continue                       # standalone "12." number token -> drop
        if cur is None and not stem_parts:
            pm = QNUM_PREFIX_RE.match(t)    # leading number glued to the stem text
            if pm:                         # ("10.假設…") -> keep only the stem part
                t = t[pm.end():]
                if not t:
                    continue
        m = OPT_RE.match(t)
        if m:
            cur = {'letter': m.group(1), 'parts': [m.group(2)]}
            options.append(cur)
        elif cur is not None:
            cur['parts'].append(t)
        else:
            stem_parts.append(t)
    # de-dupe accidental repeated option letters (keep the first), then sort by
    # letter so display order is always A,B,C,D,E — a two-column layout can yield
    # the markers in reading order A,B,D,C, but the letter↔text pairing is exact.
    seen = set()
    uniq = []
    for o in options:
        if o['letter'] in seen:
            continue
        seen.add(o['letter'])
        uniq.append({'letter': o['letter'], 'text': _smart_join(o['parts']).strip()})
    uniq.sort(key=lambda o: o['letter'])
    return _smart_join(stem_parts).strip(), uniq


MAX_SPAN_PAGES = 3          # cap a single question crop's page span
MAX_IMAGE_PX = 16000        # WebP hard limit is 16383
# repeated page-header markers (exam title / 考試科目 / 頁碼 …) — excluded from crops
HEADER_RE = re.compile(r'學年度|考試科目|頁碼|總頁數|本試題|招生考試|考試日期|含封面')
# footer page numbers like 5/8
FOOTER_RE = re.compile(r'^\d{1,3}/\d{1,3}$')


def _is_chrome(text: str) -> bool:
    return bool(HEADER_RE.search(text) or FOOTER_RE.match(text))


def _header_bottom(words: list) -> float:
    hb = 0.0
    for w in words:
        if HEADER_RE.search(w[4]):
            hb = max(hb, w[3])  # y1 of last header word
    return hb


def _page_bands(doc: fitz.Document, a: Anchor, nxt: Anchor | None) -> list[tuple[int, float, float]]:
    """Per-page (page, top, bottom) bounds tightly fit to the question's real content.
    Excludes the repeated exam header + footer page numbers, trims trailing whitespace,
    and drops continuation pages that hold only header chrome (the next-page-header bleed)."""
    end_page = min(nxt.page if nxt else a.page, a.page + MAX_SPAN_PAGES)
    bands: list[tuple[int, float, float]] = []
    for pno in range(a.page, end_page + 1):
        page = doc[pno]
        ph = page.rect.height
        words = page.get_text('words')
        hb = _header_bottom(words)
        raw_top = (a.y - C.TOP_PAD_PT) if pno == a.page else (hb + 4 if hb else C.TOP_PAD_PT)
        raw_top = max(0.0, raw_top)
        raw_bottom = (nxt.y - C.BOTTOM_PAD_PT) if (nxt and nxt.page == pno) else (ph - C.FOOTER_TRIM_PT)
        # real content = words in the raw band that aren't header/footer chrome
        ys = [(w[1], w[3]) for w in words
              if w[3] > raw_top + 0.5 and w[1] < raw_bottom - 0.5 and not _is_chrome(w[4])]
        if not ys:
            if pno == a.page:
                bands.append((pno, raw_top, min(raw_bottom, raw_top + 24)))
            continue  # continuation page with only chrome -> skip (fixes header bleed)
        top = raw_top if pno == a.page else max(raw_top, min(y for y, _ in ys) - C.TOP_PAD_PT)
        bottom = min(raw_bottom, max(y for _, y in ys) + C.BOTTOM_PAD_PT)
        if bottom > top + 4:
            bands.append((pno, top, bottom))
    if not bands:
        bands = [(a.page, max(0.0, a.y - C.TOP_PAD_PT), a.y + 40)]
    return bands


def _question_tokens(doc: fitz.Document, bands: list[tuple[int, float, float]]) -> list[str]:
    """Reading-order tokens for a question. Words are grouped into visual lines
    and sorted left-to-right WITHIN each line, then lines run top-to-bottom.
    This fixes two-column option layouts (A/B side by side, C/D below): a plain
    `(round(y,1), x)` sort mis-orders them because an option's value text often
    sits ~1pt off its marker's baseline, dropping it past the next column's
    marker and gluing it onto the wrong option."""
    toks = []
    for (pno, top, bottom) in bands:
        for w in doc[pno].get_text('words'):
            yc = (w[1] + w[3]) / 2  # a word belongs to the band if its vertical CENTRE is
            if top - 0.5 <= yc <= bottom + 0.5 and not _is_chrome(w[4]):  # inside — matches the
                toks.append((pno, w[0], w[1], w[3], C.nfkc(w[4])))  # rendered crop and never drops
                # a last line that straddles the band's bottom edge (tightly-packed cloze option
                # rows otherwise vanished: the whole `(A)..(D)` row sits ~1pt past `nxt.y - pad`).
                # page, x0, y0, y1, text
    toks.sort(key=lambda r: (r[0], r[2], r[1]))  # page, y0, x0
    ordered: list[tuple] = []
    line: list[tuple] = []
    ref_y = ref_h = 0.0
    cur_page = -1
    for tok in toks:
        pno, _x0, y0, y1 = tok[0], tok[1], tok[2], tok[3]
        h = max(1.0, y1 - y0)
        # new visual line when the page changes or this token drops clearly below
        # the current line's baseline (tolerance = 0.6× the line's text height)
        if line and (pno != cur_page or (y0 - ref_y) > 0.6 * ref_h):
            line.sort(key=lambda r: r[1])  # left-to-right within the line
            ordered.extend(line)
            line = []
        if not line:
            ref_y, ref_h = y0, h
        line.append(tok)
        cur_page = pno
    if line:
        line.sort(key=lambda r: r[1])
        ordered.extend(line)
    return [r[4] for r in ordered]


def _render_crop(doc: fitz.Document, bands: list[tuple[int, float, float]]) -> tuple[bytes, int, int, bool]:
    slices: list[Image.Image] = []
    for (pno, top, bottom) in bands:
        page = doc[pno]
        clip = fitz.Rect(0, max(0.0, top), page.rect.width, min(page.rect.height, bottom))
        if clip.height <= 2:
            continue
        pix = page.get_pixmap(dpi=C.RENDER_DPI, clip=clip)
        slices.append(Image.frombytes('RGB', (pix.width, pix.height), pix.samples))
    if not slices:
        slices = [Image.new('RGB', (10, 10), 'white')]
    spans = len(slices) > 1
    if spans:
        w = max(s.width for s in slices)
        canvas = Image.new('RGB', (w, sum(s.height for s in slices)), 'white')
        y = 0
        for s in slices:
            canvas.paste(s, (0, y))
            y += s.height
        img = canvas
    else:
        img = slices[0]
    if img.height > MAX_IMAGE_PX or img.width > MAX_IMAGE_PX:
        scale = MAX_IMAGE_PX / max(img.width, img.height)
        img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))))
    buf = io.BytesIO()
    img.save(buf, format='WEBP', quality=C.WEBP_QUALITY, method=6)
    return buf.getvalue(), img.width, img.height, spans


def extract_section(doc: fitz.Document, anchors: list[Anchor]) -> list[Extracted]:
    out = []
    for i, a in enumerate(anchors):
        nxt = anchors[i + 1] if i + 1 < len(anchors) else None
        bands = _page_bands(doc, a, nxt)
        stem, opts = parse_stem_options(_question_tokens(doc, bands))
        img_bytes, w, h, spans = _render_crop(doc, bands)
        out.append(Extracted(a.num, stem, opts, w, h, img_bytes, spans))
    return out
