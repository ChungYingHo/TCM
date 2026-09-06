#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Map Symbol-font private-use characters in question_text / options[].text to real
Unicode.

Root cause: exam PDFs set Greek letters, arrows, ×, −, °, Δ … in the legacy Symbol
font. PyMuPDF returns those glyphs as U+F000 + <Symbol byte> (private-use area),
which every browser renders as a blank box, so「1.0 x 106」shows up as
「1.0 x 106」and「A + 2B  C」loses its arrow (2026-09-06 audit: 50 distinct
codes in 182 questions across the three schools).

The table below is the Adobe Symbol encoding (0x20–0xFF) plus the circled numbers
①–⑤ (0x81–0x85) that Windows CJK documents put in the same range. Only codes that
were actually observed and whose meaning was checked against the question images
are listed; anything else is left untouched and reported so a human can look.

Correctness-first (same contract as clean_text_junk.py / refine_text.py): touches
ONLY question_text and options[].text. Never reads or writes correct_answer /
original_answer / errata / concept_tags / images. The per-question screenshot
remains the source of truth. Idempotent: re-run after any rebuild of src/data.

Usage:
  python pipeline/fix_symbol_pua.py           # dry-run report
  python pipeline/fix_symbol_pua.py --apply   # rewrite the shards
"""
from __future__ import annotations
import json
import os
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
WEB_DATA_DIR = os.path.join(HERE, '..', 'src', 'data')
SCHOOLS = ('CMU', 'ISU', 'TCU')

PUA_MAP = {
    0xF020: ' ',
    0xF028: '(', 0xF029: ')', 0xF02B: '+', 0xF02D: '−', 0xF02E: '.',
    0xF03C: '<', 0xF03D: '=', 0xF03E: '>',
    0xF042: 'B', 0xF044: 'Δ', 0xF049: 'I',
    0xF061: 'α', 0xF062: 'β', 0xF064: 'δ', 0xF065: 'ε', 0xF066: 'φ', 0xF068: 'η',
    0xF06B: 'κ', 0xF06C: 'λ', 0xF06D: 'μ', 0xF06E: 'ν', 0xF06F: '°',
    0xF070: 'π', 0xF071: 'θ', 0xF072: 'ρ', 0xF073: 'σ', 0xF077: 'ω',
    0xF081: '①', 0xF082: '②', 0xF083: '③', 0xF084: '④', 0xF085: '⑤',
    0xF09F: '•',
    0xF0AC: '←', 0xF0AE: '→', 0xF0B0: '°', 0xF0B4: '×', 0xF0BA: '≡', 0xF0BE: '—',
    0xF0C7: '⁺', 0xF0CE: '×', 0xF0D7: '·', 0xF0E0: '→',
    0xF0E6: '⎛', 0xF0E7: '⎜', 0xF0E8: '⎝', 0xF0F6: '⎞', 0xF0F7: '⎟', 0xF0F8: '⎠',
}


def fix_pua(text: str, unmapped: Counter) -> str:
    out = []
    for ch in text:
        code = ord(ch)
        if 0xE000 <= code <= 0xF8FF:
            if code in PUA_MAP:
                out.append(PUA_MAP[code])
                continue
            unmapped[code] += 1
        out.append(ch)
    return ''.join(out)


def main(apply: bool) -> int:
    grand_changed = 0
    for school in SCHOOLS:
        path = os.path.join(WEB_DATA_DIR, f'{school}.json')
        with open(path, encoding='utf-8') as f:
            shard = json.load(f)
        unmapped: Counter = Counter()
        changed_q = 0
        for q in shard['questions']:
            before = (q.get('question_text') or '', [o.get('text') or '' for o in q.get('options', [])])
            q['question_text'] = fix_pua(before[0], unmapped)
            for o in q.get('options', []):
                o['text'] = fix_pua(o.get('text') or '', unmapped)
            after = (q['question_text'], [o.get('text') or '' for o in q.get('options', [])])
            if after != before:
                changed_q += 1
        grand_changed += changed_q
        print(f'[{school}] questions changed: {changed_q}; unmapped PUA codes: '
              + (', '.join(f'{hex(c)}×{n}' for c, n in sorted(unmapped.items())) or 'none'))
        if apply:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(shard, f, ensure_ascii=False, separators=(',', ':'))
    print(('applied' if apply else 'dry-run') + f': {grand_changed} questions')
    return 0


if __name__ == '__main__':
    sys.exit(main('--apply' in sys.argv))
