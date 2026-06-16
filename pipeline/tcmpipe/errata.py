#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Parse clarification (釋疑) PDFs into structured errata, conservatively.

Uses PyMuPDF table extraction. Columns (科目/題號/釋疑答覆/釋疑結果) are consistent
across schools. Corrected letters appear as (A) / 【A】 / full-width Ｃ — normalized.
Only high-confidence changes/送分 are flagged for override; everything keeps the
original answer and the reasoning text becomes the explanation.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field

import fitz

from tcmpipe import config as C

# full-width A-Z -> half-width
_FW = {chr(0xFF21 + i): chr(ord('A') + i) for i in range(26)}
LETTER_RE = re.compile(r'[（(【\[]\s*([A-E])\s*[)）】\]]')
AWARD_RE = re.compile(r'送分|一律給分|皆給分|均給分|給分')
CHANGE_RE = re.compile(r'更正|修正為|改為|答案更改')
KEEP_RE = re.compile(r'維持原答案|維持原公告|無須修正|無需修正')

HEADER_KEYS = {
    'subject': ('科目', '科 目', '考科'),
    'qnum': ('題號', '題 號'),
    'result': ('釋疑結果', '結果'),
    'reason': ('釋疑答覆', '答覆釋疑', '答 覆', '釋 疑'),
}


@dataclass
class Errata:
    subject: str | None
    qnum: int
    award_all: bool = False
    changed: bool = False
    letters: list[str] = field(default_factory=list)
    reason: str = ''


def _norm(s: str | None) -> str:
    if not s:
        return ''
    return ''.join(_FW.get(c, c) for c in C.nfkc(s))


def _classify_columns(header_row: list[str]) -> dict[str, int]:
    cols: dict[str, int] = {}
    for ci, cell in enumerate(header_row):
        # strip spaces too, so spaced headers like '題 號' / '科 目' match the keywords
        c = _norm(cell).replace('\n', '').replace(' ', '')
        for key, kws in HEADER_KEYS.items():
            if key in cols:
                continue
            if any(kw.replace(' ', '') in c for kw in kws):
                cols[key] = ci
    return cols


def _subject_code(text: str) -> str | None:
    t = text.replace('\n', '')
    for kw, code in C.SUBJECT_KEYWORDS:
        if kw in t:
            return code
    return None


def _dedup(seq: list[str]) -> list[str]:
    seen: set[str] = set()
    return [x for x in seq if not (x in seen or seen.add(x))]


def _classify_row(result_txt: str, reason_txt: str) -> tuple[bool, bool, list[str]]:
    """Decide (award_all, changed, letters) from the 釋疑結果 + 釋疑答覆 cells (already
    NFKC-normalized by the caller).

    Conservative (rule #4): a correction is honored only when BOTH the change verb AND
    the corrected letter come from the RESULT column — a 改為 buried in the reason prose
    (often hypothetical, e.g.「若改為 C 則…」) is NOT auto-applied; build leaves it as
    needs_review instead. 維持原答案 anywhere suppresses a change. Letters prefer the
    result cell, falling back to the reason cell for the official answer."""
    blob = result_txt + ' ' + reason_txt
    award = bool(AWARD_RE.search(result_txt)) or bool(AWARD_RE.search(reason_txt))
    keep = bool(KEEP_RE.search(blob))
    result_letters = _dedup(LETTER_RE.findall(result_txt))
    changed = bool(CHANGE_RE.search(result_txt)) and bool(result_letters) and not keep
    letters = result_letters or _dedup(LETTER_RE.findall(reason_txt))
    return award, changed, letters


def parse_clarification(path: str) -> dict[str, dict[int, Errata]]:
    """Return {subject: {qnum: Errata}}. Subject may be None if undetectable."""
    doc = fitz.open(path)
    result: dict[str, dict[int, Errata]] = {}
    cols: dict[str, int] = {}
    cur_subject: str | None = None
    for pno in range(doc.page_count):
        try:
            tables = doc[pno].find_tables().tables
        except Exception:
            tables = []
        for tab in tables:
            rows = tab.extract()
            if not rows:
                continue
            start = 0
            maybe = _classify_columns(rows[0])
            if 'qnum' in maybe and 'result' in maybe:
                cols = maybe
                start = 1
            if 'qnum' not in cols:
                continue
            for row in rows[start:]:
                def cell(key):
                    ci = cols.get(key)
                    return _norm(row[ci]) if ci is not None and ci < len(row) else ''
                subj_cell = cell('subject')
                if subj_cell.strip():
                    sc = _subject_code(subj_cell)
                    if sc:
                        cur_subject = sc
                qn_raw = cell('qnum')
                m = re.search(r'\d{1,3}', qn_raw)
                if not m:
                    continue
                qnum = int(m.group(0))
                result_txt = cell('result')
                reason_txt = cell('reason')
                award, changed, letters = _classify_row(result_txt, reason_txt)
                e = Errata(subject=cur_subject, qnum=qnum, award_all=award,
                           changed=changed, letters=letters, reason=reason_txt.strip())
                result.setdefault(cur_subject or '?', {})[qnum] = e
    return result
