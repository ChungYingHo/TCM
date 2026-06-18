#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build src/data/schedule.json — the ORDERING + pace targets that drive 今日複習.

This is NOT a fixed calendar. The daily page slices each track from the user's
actual cursor (derived from completion), so the plan is a ROLLING sequence consumed
at real pace — a busy day just doesn't advance. Weekday vs weekend is read from the
clock (studyPlan.ts), not pinned here. The file carries:
  - per-day pace targets (notes/quiz/new-vocab/classic)
  - subject pairs rotated one-per-study-day (lighter daily note load)
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

# EXAM here is the *content-completion target* (finish all new material), not a real
# exam date — the three schools test separately in 2027/3–4 (see EXAM_WINDOW). The last
# 14 days before it are the review-only taper; newVocab is sized to finish the whole
# vocab track before that taper begins.
EXAM = '2027-02-01'
EXAM_WINDOW = '實際考試 2027/3–4（義守約 3 月底、慈濟 4/10、中國醫約 4 月中下旬）'
HORIZON_DAYS = 200  # nominal rolling length (a sizing hint; the plan is consumed at real pace,
                    # not pinned to dates — see studyPlan.ts).
# Subject pairs, rotated one per STUDY day (cursor-driven), so each weekday is only two
# subjects' notes — lighter load alongside cram school. 單字/古文/元素 still run daily.
PAIRS = [['biology', 'english'], ['chemistry', 'chinese']]
PER_DAY = {
    'notesPerSubject': 1,
    'quiz': 10,           # learn phase: questions tagged to today's notes
    'quizDrill': 30,      # drill phase (first note pass done): sequential full-bank drill…
    'quizWeak': 6,        # …of which this many re-target the user's weakest tags
    'newVocab': 18,
    'reviewVocabMax': 100,    # absolute ceiling (cap = min(target, max))
    'reviewVocabTarget': 30,  # daily review size — a LIMITED, date-seeded random rotating batch
                              # (more-due-than-this rolls to following days); tune here if needed
}
QUIZ_POOL_CAP = 60  # ids kept per tag — enough to rotate without bloating the file


def parse_taxonomy() -> dict[str, list[tuple[str, str, str | None]]]:
    """-> {subject: [(tag, slug, readIn|None), ...]} in pedagogical order, parsed from
    taxonomy.ts (the single source of truth, so the order can't drift). `readIn` is set when a
    tag's reading is merged into another note (tag still exists for question-tagging/trends)."""
    txt = open(TAXONOMY_TS, encoding='utf-8').read()
    body = txt[txt.index('export const TAXONOMY'):]
    out: dict[str, list[tuple[str, str, str | None]]] = {s: [] for s in C.SUBJECTS}
    cur = None
    for line in body.splitlines():
        head = re.match(r"\s*(chemistry|biology|chinese|english):\s*\[", line)
        if head:
            cur = head.group(1)
            continue
        ent = re.search(r"tag:\s*'([^']+)',\s*slug:\s*'([^']+)'", line)
        if ent and cur:
            readin = re.search(r"readIn:\s*'([^']+)'", line)
            out[cur].append((ent.group(1), ent.group(2), readin.group(1) if readin else None))
    return out


def parse_tag_parents() -> dict[str, str]:
    """-> {tag: parentTag} for note-only sub-topics (entries with a `parent:`)."""
    txt = open(TAXONOMY_TS, encoding='utf-8').read()
    parents: dict[str, str] = {}
    for line in txt.splitlines():
        ent = re.search(r"tag:\s*'([^']+)'.*parent:\s*'([^']+)'", line)
        if ent:
            parents[ent.group(1)] = ent.group(2)
    return parents


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

    # Resolve readIn → the merged note, and DEDUPE so a merged note appears once in its
    # subject's track. note_tags maps the (resolved) slug to its CANONICAL tag — the first
    # entry that owns the file (the readIn target), used for the note's mini-quiz.
    notes: dict[str, list[str]] = {}
    note_tags: dict[str, str] = {}
    for s in C.SUBJECTS:
        seen: set[str] = set()
        lst: list[str] = []
        for tag, slug, readin in tax[s]:
            resolved = readin or slug
            if resolved not in seen:
                seen.add(resolved)
                lst.append(resolved)
                note_tags[resolved] = tag
        notes[s] = lst
    # ALL taxonomy tags (incl. merged-in ones) stay eligible for the quiz pool + drill + trends.
    taxo_tags = {tag for s in C.SUBJECTS for tag, slug, readin in tax[s]}

    # qnum: trailing question number of an id (for stable, recent-first ordering).
    def qnum(q: dict) -> int:
        m = re.search(r'(\d+)\D*$', q['id'])
        return int(m.group(1)) if m else 0

    # The newest exam year is reserved intact as future full mock exams — excluded from
    # BOTH the daily-quiz pool and the drill track so it is not spoiled before then.
    MOCK_YEAR = max(int(q['year']) for q in qs)

    # quiz candidate pool: concept tag -> question ids (capped, file-stable order).
    # Fill in a school-round-robin, newest-year-first order so each tag's 60-cap is
    # balanced across CMU/ISU/TCU. (Previously qs was CMU-first, so popular tags like
    # 原子結構與核化學 filled the cap entirely with CMU → 「今日考題」全是中國醫。)
    by_school: dict[str, list[dict]] = {}
    for q in qs:
        if int(q['year']) == MOCK_YEAR:
            continue
        by_school.setdefault(q['school'], []).append(q)
    for sch in by_school:
        by_school[sch].sort(key=lambda q: (-int(q['year']), qnum(q)))
    ordered: list[dict] = []
    i = 0
    while any(i < len(v) for v in by_school.values()):
        for sch in ('CMU', 'ISU', 'TCU'):
            lst = by_school.get(sch)
            if lst and i < len(lst):
                ordered.append(lst[i])
        i += 1

    pool: dict[str, list[str]] = {}
    for q in ordered:
        for t in q.get('concept_tags') or []:
            if t in taxo_tags:
                bucket = pool.setdefault(t, [])
                if len(bucket) < QUIZ_POOL_CAP:
                    bucket.append(q['id'])

    # note-only sub-topics carry no question tags of their own, so alias each one's
    # quiz pool to its parent broad category (keeps 「今日考題」 populated on their days).
    for tag, parent in parse_tag_parents().items():
        if tag not in pool and parent in pool:
            pool[tag] = list(pool[parent])

    # drill track: EVERY taxonomy-tagged question, newest exam years first (most
    # representative of current exam style), round-robin across subjects so each
    # drill day mixes all four subjects. Consumed sequentially in the drill phase.
    # The newest year (MOCK_YEAR) is EXCLUDED — those papers are reserved intact as
    # full mock exams for the 2027/2–4 final-review phase; burning them as daily
    # drill would waste the most representative simulation material.
    by_subject: dict[str, list[dict]] = {s: [] for s in C.SUBJECTS}
    for q in qs:
        if int(q['year']) == MOCK_YEAR:
            continue
        if any(t in taxo_tags for t in (q.get('concept_tags') or [])):
            by_subject[q['subject']].append(q)
    for s in C.SUBJECTS:
        by_subject[s].sort(key=lambda q: (-int(q['year']), q['school'], qnum(q)))
    drill: list[str] = []
    idx = {s: 0 for s in C.SUBJECTS}
    while any(idx[s] < len(by_subject[s]) for s in C.SUBJECTS):
        for s in C.SUBJECTS:
            if idx[s] < len(by_subject[s]):
                drill.append(by_subject[s][idx[s]]['id'])
                idx[s] += 1

    schedule = {
        'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'examDate': EXAM,
        'examWindow': EXAM_WINDOW,
        'horizonDays': HORIZON_DAYS,
        'pairs': PAIRS,
        'perDay': PER_DAY,
        'tracks': {
            'vocab': [w['id'] for w in vocab['words']],
            'notes': notes,
            'classics': [c['id'] for c in classics['classics']],
            'drill': drill,
        },
        'noteTags': note_tags,
        'quizPoolByTag': pool,
        'reviews': parse_reviews(),  # review-digest slug -> {title, subject, covers}
    }
    os.makedirs(C.WEB_DATA_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(schedule, f, ensure_ascii=False, separators=(',', ':'))
    print(f"schedule: horizon={HORIZON_DAYS}d, pairs={PAIRS}, vocab={len(schedule['tracks']['vocab'])}, "
          f"notes={ {s: len(v) for s, v in notes.items()} }, "
          f"classics={len(schedule['tracks']['classics'])}, quizTags={len(pool)}, "
          f"drill={len(drill)}")


if __name__ == '__main__':
    main()
