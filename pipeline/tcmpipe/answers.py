#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Per-school answer-sheet parsing -> {subject: {qnum: letter}}.

Two on-page formats, both covered by one positional parser:
  - CMU / ISU:  `1 B 11 D 21 A ...`   (integer immediately followed by its letter)
  - TCU:        `1 2 ... 10` then `B A C ...` (a number row then a letter row)
A combined `answer_all.pdf` (CMU/ISU) is split into subject chunks by the
per-subject header line; per-subject files take the subject from their filename.
"""
from __future__ import annotations
import os
import re

import fitz

from tcmpipe import config as C

SUBJ_HEADER_RE = re.compile(r'(國文|化學|生物學?|英文)\S*?(?:試題)?參考?答案|(國文|化學|生物學?|英文)科答案')
_INT_RE = re.compile(r'^\d{1,3}$')
_LET_RE = re.compile(r'^[A-E]$')


def _parse_pairs(toks: list[str]) -> dict[int, str]:
    """`N L` format (CMU / ISU): an integer immediately followed by an A–E letter.
    Naturally skips blank cells (integer followed by another integer)."""
    out: dict[int, str] = {}
    for i in range(len(toks) - 1):
        if _INT_RE.match(toks[i]) and _LET_RE.match(toks[i + 1]):
            out[int(toks[i])] = toks[i + 1]
    return out


def _parse_rows(toks: list[str]) -> dict[int, str]:
    """`N N ... L L ...` format (TCU): a run of integers then an equal run of letters,
    mapped by position."""
    out: dict[int, str] = {}
    i, n = 0, len(toks)
    while i < n:
        if _INT_RE.match(toks[i]):
            nums = []
            while i < n and _INT_RE.match(toks[i]):
                nums.append(int(toks[i])); i += 1
            lets = []
            while i < n and _LET_RE.match(toks[i]):
                lets.append(toks[i]); i += 1
            for k in range(min(len(nums), len(lets))):
                out[nums[k]] = lets[k]
        else:
            i += 1
    return out


def parse_block(text: str) -> dict[int, str]:
    """Choose the right answer-grid parser by how integers are adjacent:
    int-followed-by-letter dominates -> pairs (CMU/ISU); int-followed-by-int
    dominates -> rows (TCU)."""
    toks = text.split()
    p = q = 0
    for i in range(len(toks) - 1):
        if _INT_RE.match(toks[i]):
            if _LET_RE.match(toks[i + 1]):
                p += 1
            elif _INT_RE.match(toks[i + 1]):
                q += 1
    return _parse_pairs(toks) if p >= q else _parse_rows(toks)


def _full_text(path: str) -> str:
    doc = fitz.open(path)
    return C.nfkc('\n'.join(doc[p].get_text('text') for p in range(doc.page_count)))


def _subject_of_header(match_text: str) -> str | None:
    for kw, code in C.SUBJECT_KEYWORDS:
        if kw in match_text:
            return code
    return None


def _split_combined(text: str) -> dict[str, dict[int, str]]:
    marks = [m for m in SUBJ_HEADER_RE.finditer(text)]
    result: dict[str, dict[int, str]] = {}
    for idx, m in enumerate(marks):
        end = marks[idx + 1].start() if idx + 1 < len(marks) else len(text)
        subj = _subject_of_header(m.group(0))
        if not subj:
            continue
        amap = parse_block(text[m.end():end])
        if amap:
            result[subj] = amap
    return result


def load_answers(school: str, year: int) -> dict[str, tuple[dict[int, str], str]]:
    """Return {subject: (answers, source_pdf_rel)}.

    Some per-subject `answer_<subject>.pdf` files are actually detailed solution
    papers (not key grids) — e.g. CMU 107. So for each subject we parse every
    candidate source and keep whichever yields the most complete key, rather than
    blindly preferring the per-subject file.
    """
    adir = C.answer_dir(school, year)
    if not os.path.isdir(adir):
        return {}
    files = set(os.listdir(adir))

    # candidate maps per subject: list of (answers, source_rel)
    candidates: dict[str, list[tuple[dict[int, str], str]]] = {s: [] for s in C.SUBJECTS}

    for subj in C.SUBJECTS:
        fn = f'answer_{subj}.pdf'
        if fn in files:
            amap = parse_block(_full_text(os.path.join(adir, fn)))
            candidates[subj].append((amap, C.rel(os.path.join(adir, fn))))

    for combined in ('answer_all.pdf', 'answer_all_v2.pdf'):
        if combined in files:
            split = _split_combined(_full_text(os.path.join(adir, combined)))
            src = C.rel(os.path.join(adir, combined))
            for subj, amap in split.items():
                candidates[subj].append((amap, src))

    # pick the source with the most answers for each subject
    result: dict[str, tuple[dict[int, str], str]] = {}
    for subj, opts in candidates.items():
        best = max(opts, key=lambda o: len(o[0]), default=None)
        if best and best[0]:
            result[subj] = best
    return result
