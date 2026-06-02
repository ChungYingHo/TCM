#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Orchestrator: PDFs -> src/data/<school>.json + public/q images + query index.

Run:  python -m tcmpipe.build [SCHOOL ...]      (default: all schools)
Correctness path is LLM-free: answers + errata only. Tags are added offline.
"""
from __future__ import annotations
import os
import sys
import json
import datetime

import fitz

from tcmpipe import config as C
from tcmpipe import extract, answers as ans, errata as err, tags as tg
from tcmpipe.models import QuestionRecord, Option, SchoolShard

ALL_LETTERS = ['A', 'B', 'C', 'D', 'E']


def _write_image(school, year, subject, num, data: bytes) -> str:
    d = os.path.join(C.WEB_IMAGE_DIR, school, str(year), subject)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, f'{num}.webp'), 'wb') as f:
        f.write(data)
    return f'/q/{school}/{year}/{subject}/{num}.webp'


def _exam_sources(school, year):
    """Yield (subject, fitz.Document, anchors, source_pdf_rel) per subject."""
    edir = C.exam_dir(school, year)
    if not os.path.isdir(edir):
        return
    files = set(os.listdir(edir))
    if school == 'ISU' and 'exam_all.pdf' in files:
        path = os.path.join(edir, 'exam_all.pdf')
        doc = fitz.open(path)
        anchors = extract.find_anchors(extract.load_words(doc))
        for sec in extract.split_sections(anchors):
            subj = extract.detect_subject(doc, sec[0].page, sec[-1].page)
            yield (subj, doc, sec, C.rel(path))
    else:
        for subject in C.SUBJECTS:
            fn = f'exam_{subject}.pdf'
            if fn in files:
                path = os.path.join(edir, fn)
                doc = fitz.open(path)
                anchors = extract.find_anchors(extract.load_words(doc))
                yield (subject, doc, anchors, C.rel(path))


def _merge_one(school, year, subject, ex, amap, answer_src, e):
    """Build a QuestionRecord, applying errata over the answer sheet."""
    opt_letters = [o['letter'] for o in ex.options] or ['A', 'B', 'C', 'D']
    original = [amap[ex.num]] if ex.num in amap else []
    correct = list(original)
    errata_applied = False
    award_all = False
    explanation = None
    needs_review = False

    if e is not None:
        explanation = e.reason or None
        if e.award_all:
            award_all = True
            errata_applied = True
            correct = list(opt_letters)
        elif e.changed and e.letters:
            correct = e.letters
            errata_applied = True
        elif e.letters and not original:
            correct = e.letters            # official answer when sheet lacked it
        elif e.letters and original and e.letters[0] != original[0]:
            needs_review = True            # keep-result but letter disagrees -> flag

    if not correct and not award_all:
        needs_review = True                # no answer resolved

    return QuestionRecord(
        id=f'{school}-{year}-{subject}-{ex.num}',
        school=school, year=year, subject=subject, question_number=ex.num,
        question_image_url=_write_image(school, year, subject, ex.num, ex.image_bytes),
        question_text=ex.stem,
        options=[Option(letter=o['letter'], text=o['text']) for o in ex.options],
        correct_answer=correct, original_answer=original,
        errata_applied=errata_applied, award_all=award_all,
        concept_tags=tg.assign_tags(subject, ex.stem + ' ' + ' '.join(o['text'] for o in ex.options)),
        explanation=explanation,
        source_pdf=ex.__dict__.get('source_pdf', '') or '',
        source_answer_pdf=answer_src,
        needs_review=needs_review,
        image_w=ex.image_w, image_h=ex.image_h,
    )


def _load_overrides(school):
    p = os.path.join(C.OVERRIDES_DIR, f'{school}.json')
    if os.path.isfile(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    return {}


def run_school(school):
    records: list[QuestionRecord] = []
    qa: list[dict] = []
    answer_cache: dict[int, dict] = {}
    for year in C.YEARS:
        if not os.path.isdir(C.exam_dir(school, year)):
            continue
        answers_by_subj = ans.load_answers(school, year)
        # parse errata once per year
        errata_by_subj: dict[str, dict] = {}
        cpath = os.path.join(C.answer_dir(school, year), 'clarification.pdf')
        if os.path.isfile(cpath):
            errata_by_subj = err.parse_clarification(cpath)

        for subject, doc, anchors, src in _exam_sources(school, year):
            if subject is None:
                qa.append({'year': year, 'issue': 'subject_undetected', 'count': len(anchors)})
                continue
            amap, answer_src = answers_by_subj.get(subject, ({}, ''))
            e_subj = errata_by_subj.get(subject) or errata_by_subj.get('?') or {}
            extracted = extract.extract_section(doc, anchors)
            nums = [x.num for x in extracted]
            # QA: contiguity / answer coverage
            if nums:
                expected = set(range(1, max(nums) + 1))
                missing = sorted(expected - set(nums))
                no_ans = [n for n in nums if n not in amap]
                if missing or no_ans or not amap:
                    qa.append({'year': year, 'subject': subject, 'n': len(nums),
                               'missing_qnums': missing, 'no_answer': no_ans[:10],
                               'answer_count': len(amap)})
            for ex in extracted:
                ex.source_pdf = src
                rec = _merge_one(school, year, subject, ex, amap, answer_src, e_subj.get(ex.num))
                records.append(rec)

    # guarantee unique ids (a spurious anchor can duplicate a question_number);
    # suffix duplicates and flag them for review so the UI never sees a dup key.
    seen: dict[str, int] = {}
    for r in records:
        if r.id in seen:
            seen[r.id] += 1
            r.id = f'{r.id}-d{seen[r.id]}'
            r.needs_review = True
        else:
            seen[r.id] = 0

    # apply human overrides (sacred, last)
    overrides = _load_overrides(school)
    if overrides:
        by_id = {r.id: r for r in records}
        for rid, patch in overrides.items():
            if rid in by_id:
                cur = by_id[rid].model_dump()
                cur.update(patch)
                by_id[rid] = QuestionRecord(**cur)
        records = list(by_id.values())

    records.sort(key=lambda r: (r.year, r.subject, r.question_number))
    _write_shard(school, records)
    _write_index(school, records)
    _write_qa(school, qa, records)
    return records, qa


def _write_shard(school, records):
    os.makedirs(C.WEB_DATA_DIR, exist_ok=True)
    shard = SchoolShard(
        school=school,
        generated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        questions=records,
    )
    with open(os.path.join(C.WEB_DATA_DIR, f'{school}.json'), 'w', encoding='utf-8') as f:
        json.dump(shard.model_dump(), f, ensure_ascii=False, separators=(',', ':'))


def _write_index(school, records):
    idx_dir = os.path.join(C.WEB_DATA_DIR, 'index')
    os.makedirs(idx_dir, exist_ok=True)
    by_year, by_subject, by_tag = {}, {}, {}
    for i, r in enumerate(records):
        by_year.setdefault(str(r.year), []).append(i)
        by_subject.setdefault(r.subject, []).append(i)
        for t in r.concept_tags:
            by_tag.setdefault(t, []).append(i)
    idx = {'school': school, 'count': len(records),
           'years': sorted({r.year for r in records}),
           'subjects': sorted({r.subject for r in records}),
           'tags': sorted(by_tag.keys()),
           'byYear': by_year, 'bySubject': by_subject, 'byTag': by_tag}
    with open(os.path.join(idx_dir, f'{school}.idx.json'), 'w', encoding='utf-8') as f:
        json.dump(idx, f, ensure_ascii=False, separators=(',', ':'))


def _write_qa(school, qa, records):
    os.makedirs(os.path.join(C.OUT_DIR, 'qa'), exist_ok=True)
    summary = {
        'school': school,
        'total_questions': len(records),
        'needs_review': sum(1 for r in records if r.needs_review),
        'errata_applied': sum(1 for r in records if r.errata_applied),
        'award_all': sum(1 for r in records if r.award_all),
        'no_correct_answer': sum(1 for r in records if not r.correct_answer and not r.award_all),
        'anomalies': qa,
    }
    with open(os.path.join(C.OUT_DIR, 'qa', f'{school}.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f'[{school}] questions={summary["total_questions"]} '
          f'needs_review={summary["needs_review"]} errata={summary["errata_applied"]} '
          f'award_all={summary["award_all"]} no_answer={summary["no_correct_answer"]} '
          f'anomaly_rows={len(qa)}')


def main():
    schools = [s for s in sys.argv[1:] if s in C.SCHOOLS] or C.SCHOOLS
    for school in schools:
        run_school(school)


if __name__ == '__main__':
    main()
