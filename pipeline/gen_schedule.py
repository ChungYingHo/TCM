#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build src/data/schedule.json — the ORDERING + pace targets that drive 今日複習.

This is NOT a fixed calendar. The daily page slices each track from the user's
actual cursor (derived from completion), so a busy or sprint day is absorbed
instead of desyncing. The file carries:
  - per-day pace targets (notes/quiz/new-vocab/classic)
  - a humane rhythm (weekly light day, periodic rest, pre-exam taper)
  - ordered tracks (vocab by frequency, notes by pedagogical order, classics by yield)
  - a per-tag quiz candidate pool (today's quiz = questions on today's note tags)

Run:  python pipeline/gen_schedule.py   (after gen_vocab_examples.py + gen_classics.py)
"""
from __future__ import annotations
import os
import sys
import re
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C

OUT = os.path.join(C.WEB_DATA_DIR, 'schedule.json')
TAXONOMY_TS = os.path.join(C.ROOT, 'src', 'models', 'taxonomy.ts')

START = '2026-06-22'
END = '2027-01-31'
EXAM = '2027-02-01'
PER_DAY = {'notesPerSubject': 1, 'quiz': 10, 'newVocab': 16, 'classicEveryNDays': 3, 'reviewVocabMax': 70}
RHYTHM = {'lightWeekday': 0, 'restEveryNCycles': 4, 'taperLastDays': 14}
QUIZ_POOL_CAP = 60  # ids kept per tag — enough to rotate without bloating the file


def parse_taxonomy() -> dict[str, list[tuple[str, str]]]:
    """-> {subject: [(tag, slug), ...]} in pedagogical order, parsed from taxonomy.ts
    (the single source of truth, so the order can't drift)."""
    txt = open(TAXONOMY_TS, encoding='utf-8').read()
    body = txt[txt.index('export const TAXONOMY'):]
    out: dict[str, list[tuple[str, str]]] = {s: [] for s in C.SUBJECTS}
    cur = None
    for line in body.splitlines():
        head = re.match(r"\s*(chemistry|biology|chinese|english):\s*\[", line)
        if head:
            cur = head.group(1)
            continue
        ent = re.search(r"tag:\s*'([^']+)',\s*slug:\s*'([^']+)'", line)
        if ent and cur:
            out[cur].append((ent.group(1), ent.group(2)))
    return out


def all_questions() -> list[dict]:
    qs: list[dict] = []
    for s in C.SCHOOLS:
        with open(os.path.join(C.WEB_DATA_DIR, f'{s}.json'), encoding='utf-8') as f:
            qs += json.load(f)['questions']
    return qs


def parse_reviews() -> dict:
    """Scan note MDX for kind:review digests -> {slug: {title, subject, covers}}.
    Surfaced on light/review days so review has a concrete reading target."""
    import glob
    out: dict[str, dict] = {}
    for path in glob.glob(os.path.join(C.ROOT, 'src', 'content', 'notes', '*.mdx')):
        parts = open(path, encoding='utf-8').read().split('---')
        if len(parts) < 3:
            continue
        head = parts[1]

        def field(name: str) -> str:
            m = re.search(rf'^{name}:\s*(.+)$', head, re.M)
            return m.group(1).strip().strip('\'"') if m else ''

        if field('kind') != 'review':
            continue
        slug = os.path.splitext(os.path.basename(path))[0]
        covers = re.findall(r"['\"]([^'\"]+)['\"]", field('covers'))
        out[slug] = {'title': field('title'), 'subject': field('subject'), 'covers': covers}
    return out


def main() -> None:
    tax = parse_taxonomy()
    vocab = json.load(open(os.path.join(C.WEB_DATA_DIR, 'vocab.json'), encoding='utf-8'))
    classics = json.load(open(os.path.join(C.WEB_DATA_DIR, 'classics.json'), encoding='utf-8'))
    qs = all_questions()

    notes = {s: [slug for _, slug in tax[s]] for s in C.SUBJECTS}
    note_tags = {slug: tag for s in C.SUBJECTS for tag, slug in tax[s]}
    taxo_tags = set(note_tags.values())

    # quiz candidate pool: concept tag -> question ids (capped, file-stable order)
    pool: dict[str, list[str]] = {}
    for q in qs:
        for t in q.get('concept_tags') or []:
            if t in taxo_tags:
                bucket = pool.setdefault(t, [])
                if len(bucket) < QUIZ_POOL_CAP:
                    bucket.append(q['id'])

    days = (datetime.date.fromisoformat(END) - datetime.date.fromisoformat(START)).days + 1
    schedule = {
        'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'range': {'start': START, 'end': END, 'days': days},
        'examDate': EXAM,
        'perDay': PER_DAY,
        'rhythm': RHYTHM,
        'tracks': {
            'vocab': [w['id'] for w in vocab['words']],
            'notes': notes,
            'classics': [c['id'] for c in classics['classics']],
        },
        'noteTags': note_tags,
        'quizPoolByTag': pool,
        'reviews': parse_reviews(),  # review-digest slug -> {title, subject, covers}
    }
    os.makedirs(C.WEB_DATA_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(schedule, f, ensure_ascii=False, separators=(',', ':'))
    print(f"schedule: {days} days, vocab={len(schedule['tracks']['vocab'])}, "
          f"notes={ {s: len(v) for s, v in notes.items()} }, "
          f"classics={len(schedule['tracks']['classics'])}, quizTags={len(pool)}")


if __name__ == '__main__':
    main()
