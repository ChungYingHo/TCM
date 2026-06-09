#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Era / 時代 tagging for 國文 questions.

High precision, low recall by design: a dynasty is assigned only when every curated
author/work name found in the text points to the SAME dynasty. A question that
compares authors across dynasties (or mentions none) stays None — which is the
correct, honest outcome (the analysis reports only what it can determine).
"""
from __future__ import annotations
import os
import json
from functools import lru_cache
from typing import Optional

_DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'author_dynasty.json')


@lru_cache(maxsize=1)
def _lookup() -> dict[str, str]:
    with open(_DATA, encoding='utf-8') as f:
        raw = json.load(f)
    return {k: v for k, v in raw.items() if not k.startswith('_')}


def assign_era(stem: str, options=None) -> Optional[str]:
    text = stem or ''
    if options:
        parts = []
        for o in options:
            if isinstance(o, str):
                parts.append(o)
            elif isinstance(o, dict):
                parts.append(o.get('text', ''))
        text += ' ' + ' '.join(parts)
    if not text:
        return None
    found = {dyn for name, dyn in _lookup().items() if name in text}
    return next(iter(found)) if len(found) == 1 else None
