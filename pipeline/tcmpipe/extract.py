#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render + segment exam PDFs into per-question (text, options, crop image).

All three schools are single-column. Question-number tokens `N.` near the left
margin are the segmentation anchors. Option markers are `(A)`..`(E)` — sometimes a
standalone token (CMU/TCU), sometimes glued to the option text (ISU text subjects);
both are handled by `parse_stem_options`.
"""
from __future__ import annotations
import re
import io
from dataclasses import dataclass

import fitz
from PIL import Image

from tcmpipe import config as C

QNUM_RE = re.compile(r'^(\d{1,3})\.$')
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
        m = QNUM_RE.match(t)
        if m and x0 < C.LEFT_MARGIN_MAX:
            anchors.append(Anchor(pno, y0, x0, int(m.group(1))))
    anchors.sort(key=lambda a: (a.page, a.y))
    return anchors


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


def parse_stem_options(tokens: list[str]) -> tuple[str, list[dict]]:
    """Reading-order tokens of one question -> (stem, options).
    Stem = text before the first option marker. Each `(X)` starts a new option;
    following non-marker tokens append to its text."""
    stem_parts: list[str] = []
    options: list[dict] = []
    cur: dict | None = None
    for t in tokens:
        if QNUM_RE.match(t):
            continue
        m = OPT_RE.match(t)
        if m:
            cur = {'letter': m.group(1), 'text': m.group(2)}
            options.append(cur)
        elif cur is not None:
            cur['text'] += t
        else:
            stem_parts.append(t)
    # de-dupe accidental repeated option letters, keep first occurrence order
    seen = set()
    uniq = []
    for o in options:
        if o['letter'] in seen:
            continue
        seen.add(o['letter'])
        o['text'] = o['text'].strip()
        uniq.append(o)
    return ''.join(stem_parts).strip(), uniq


MAX_SPAN_PAGES = 3          # cap a single question crop's page span
MAX_IMAGE_PX = 16000        # WebP hard limit is 16383


def _end_page(doc: fitz.Document, a: Anchor, nxt: Anchor | None) -> int:
    """Last page a question occupies. Open-ended questions stay on their own page;
    multi-page spans are capped to avoid runaway crops."""
    ep = nxt.page if nxt else a.page
    return min(ep, a.page + MAX_SPAN_PAGES)


def _question_tokens(doc: fitz.Document, a: Anchor, nxt: Anchor | None) -> list[str]:
    end_page = _end_page(doc, a, nxt)
    toks = []
    for pno in range(a.page, end_page + 1):
        for w in doc[pno].get_text('words'):
            x0, y0, t = w[0], w[1], w[4]
            after = (pno > a.page) or (y0 >= a.y - 0.5)
            before = nxt is None or (pno < nxt.page) or (y0 < nxt.y - 0.5)
            if after and before:
                toks.append((pno, y0, x0, C.nfkc(t)))
    toks.sort(key=lambda r: (r[0], round(r[1], 1), r[2]))
    return [r[3] for r in toks]


def _render_crop(doc: fitz.Document, a: Anchor, nxt: Anchor | None) -> tuple[bytes, int, int, bool]:
    end_page = _end_page(doc, a, nxt)
    slices: list[Image.Image] = []
    for pno in range(a.page, end_page + 1):
        page = doc[pno]
        top = (a.y - C.TOP_PAD_PT) if pno == a.page else 0
        top = max(0, top)
        if nxt and nxt.page == pno:
            bottom = nxt.y - C.BOTTOM_PAD_PT
        else:
            bottom = page.rect.height - C.FOOTER_TRIM_PT
        if bottom <= top + 2:
            continue
        clip = fitz.Rect(0, top, page.rect.width, bottom)
        pix = page.get_pixmap(dpi=C.RENDER_DPI, clip=clip)
        img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        slices.append(img)
    if not slices:
        slices = [Image.new('RGB', (10, 10), 'white')]
    spans = len(slices) > 1
    if spans:
        w = max(s.width for s in slices)
        h = sum(s.height for s in slices)
        canvas = Image.new('RGB', (w, h), 'white')
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
        toks = _question_tokens(doc, a, nxt)
        stem, opts = parse_stem_options(toks)
        img_bytes, w, h, spans = _render_crop(doc, a, nxt)
        out.append(Extracted(a.num, stem, opts, w, h, img_bytes, spans))
    return out
