#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Shared configuration: paths, enums, render settings."""
from __future__ import annotations
import os
import unicodedata


def nfkc(s: str) -> str:
    """Normalize CJK compatibility/variant codepoints (e.g. U+F96B 參) to canonical
    forms so substring/keyword matching works. PDFs encode some glyphs as variants."""
    return unicodedata.normalize('NFKC', s) if s else s

# repo root = two levels up from this file (pipeline/tcmpipe/config.py)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SCHOOLS = ['CMU', 'ISU', 'TCU']
YEARS = list(range(104, 116))  # 104..115
SUBJECTS = ['chemistry', 'chinese', 'biology', 'english']

# Chinese subject keywords -> canonical subject code (order matters: check 生物 before 物)
SUBJECT_KEYWORDS = [
    ('化學', 'chemistry'),
    ('國文', 'chinese'),
    ('生物', 'biology'),
    ('英文', 'english'),
]

# filename subject token -> subject code (for split per-subject PDFs)
FILE_SUBJECT = {
    'chemistry': 'chemistry',
    'chinese': 'chinese',
    'biology': 'biology',
    'english': 'english',
}

# Output locations (website consumes these)
WEB_DATA_DIR = os.path.join(ROOT, 'src', 'data')              # JSON shards + index
WEB_IMAGE_DIR = os.path.join(ROOT, 'public', 'q')             # question crops
WEB_ERRATA_DIR = os.path.join(ROOT, 'public', 'errata')       # errata region crops
OUT_DIR = os.path.join(ROOT, 'pipeline', 'out')               # intermediate (gitignored)
OVERRIDES_DIR = os.path.join(ROOT, 'pipeline', 'overrides')   # human QA (committed)
# explicit image-only crops for questions normal anchor extraction can't reach
# (scanned PDFs with no text layer, doubled-glyph PDFs, inline-numbered cloze
# blocks). Maps `<SCHOOL>-<YEAR>-<subject>` -> {items:[{nums, bands}]}.
SEGMENTS_FILE = os.path.join(OVERRIDES_DIR, 'segments.json')

# Rendering — higher DPI so the zoom/lightbox stays crisp (source PDF is vector).
RENDER_DPI = 220          # crop image resolution (~1820px wide for A4)
IMAGE_FORMAT = 'webp'
WEBP_QUALITY = 85
LEFT_MARGIN_MAX = 80      # question-number anchors sit near the left margin (x0 < this)
FOOTER_TRIM_PT = 28       # trim page-number footer when a question runs to page bottom
TOP_PAD_PT = 3
BOTTOM_PAD_PT = 3


def exam_dir(school: str, year: int) -> str:
    return os.path.join(ROOT, school, str(year), 'pre-exams')


def answer_dir(school: str, year: int) -> str:
    return os.path.join(ROOT, school, str(year), 'answers')


def rel(path: str) -> str:
    """Repo-relative POSIX path (for provenance fields)."""
    return os.path.relpath(path, ROOT).replace('\\', '/')
