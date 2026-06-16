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
import traceback

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
        concept_tags=tg.assign_tags(subject, ex.stem, [o['text'] for o in ex.options]),
        explanation=explanation,
        source_pdf=ex.__dict__.get('source_pdf', '') or '',
        source_answer_pdf=answer_src,
        needs_review=needs_review,
        image_w=ex.image_w, image_h=ex.image_h,
    )


def _ensure_answer_selectable(rec: QuestionRecord) -> None:
    """Pad option letters in-place so every correct-answer letter is selectable.
    Effective letters = the question's own option letters, or the UI's A–D fallback
    when it has none. If an answer falls outside that (e.g. an E answer on a
    structure-only question), extend the options to A..<max needed> with empty
    text. No-op for the common case where options already cover the answer."""
    if rec.award_all or not rec.correct_answer:
        return
    have = [o.letter for o in rec.options]
    effective = set(have) if have else set('ABCD')
    if set(rec.correct_answer) <= effective:
        return
    top = max(effective | set(rec.correct_answer) | set(have or ['D']))
    by = {o.letter: o for o in rec.options}
    rec.options = [by.get(L, Option(letter=L, text=''))
                   for L in (chr(c) for c in range(ord('A'), ord(top) + 1))]


def _load_overrides(school):
    p = os.path.join(C.OVERRIDES_DIR, f'{school}.json')
    if os.path.isfile(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    return {}


def _load_segments():
    if os.path.isfile(C.SEGMENTS_FILE):
        with open(C.SEGMENTS_FILE, encoding='utf-8') as f:
            return json.load(f)
    return {}


_SEGMENTS = _load_segments()


def _segment_records(school, year, subject, doc, amap, answer_src, e_subj, existing: set, src):
    """Image-only records for questions normal extraction can't reach (scanned /
    doubled / inline-numbered cloze). Each segment item renders one crop shared by
    its `nums`; text/options are left empty (the image is authoritative) and the
    answer still flows from the card + errata via `_merge_one`. Options are seeded
    as empty A–E so any A–E answer stays clickable."""
    spec = _SEGMENTS.get(f'{school}-{year}-{subject}')
    if not spec:
        return []
    out = []
    for item in spec.get('items', []):
        bands = [(int(p), float(t), float(b)) for (p, t, b) in item['bands']]
        img_bytes, w, h, spans = extract._render_crop(doc, bands)
        for num in item['nums']:
            if num in existing:
                continue
            ex = extract.Extracted(num=num, stem='',
                                   options=[{'letter': L, 'text': ''} for L in ALL_LETTERS],
                                   image_w=w, image_h=h, image_bytes=img_bytes, spans_pages=spans)
            ex.source_pdf = src
            out.append(_merge_one(school, year, subject, ex, amap, answer_src, e_subj.get(num)))
            existing.add(num)
    return out


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
            try:
                errata_by_subj = err.parse_clarification(cpath)
            except Exception as exc:  # 壞掉的 clarification.pdf 只影響該年
                qa.append({'year': year, 'issue': 'errata_parse_failed', 'detail': repr(exc)})
                print(f'[{school} {year}] errata 解析失敗，該年改用答案卡（其他年/校不受影響）: {exc!r}',
                      file=sys.stderr)
        # 科別未偵測的釋疑列只能落在 '?' 桶；不可跨科盲套（A 科第 N 題的送分/更正
        # 套到 B 科第 N 題會靜默改錯答案）。改記入 QA 供人工以 override 處理。
        if '?' in errata_by_subj:
            qa.append({'year': year, 'issue': 'errata_subject_undetected',
                       'qnums': sorted(errata_by_subj['?'])})

        for subject, doc, anchors, src in _exam_sources(school, year):
            if subject is None:
                qa.append({'year': year, 'issue': 'subject_undetected', 'count': len(anchors)})
                continue
            amap, answer_src = answers_by_subj.get(subject, ({}, ''))
            e_subj = errata_by_subj.get(subject) or {}
            # a `replace` segment spec means normal extraction is unreliable for this
            # subject (scanned / doubled-glyph PDF) — use ONLY the image-only segments
            seg_spec = _SEGMENTS.get(f'{school}-{year}-{subject}')
            replace = bool(seg_spec and seg_spec.get('replace'))
            extracted = [] if replace else extract.extract_section(doc, anchors)
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
            # image-only segments fill in questions normal extraction can't reach
            records.extend(_segment_records(school, year, subject, doc, amap, answer_src,
                                            e_subj, set(nums), src))

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

    # english cloze: needs neighbour context, so run once over the full set
    cloze = tg.cloze_ids([{'id': r.id, 'school': r.school, 'year': r.year,
                           'subject': r.subject, 'question_number': r.question_number,
                           'question_text': r.question_text} for r in records])
    for r in records:
        if r.id in cloze:
            r.concept_tags = ['克漏字'] + [t for t in r.concept_tags if t != '克漏字']

    # curated concept_tag overrides (move catch-all questions to specific categories)
    ctp = os.path.join(C.OVERRIDES_DIR, 'concept_tags.json')
    if os.path.isfile(ctp):
        with open(ctp, encoding='utf-8') as f:
            tag_ov = json.load(f)
        for r in records:
            if r.id in tag_ov:
                r.concept_tags = tag_ov[r.id]

    # passage-group context (題組/克漏字/長閱讀): attach the shared-passage crop
    # produced by gen_groups.py so a member served standalone can show its passage.
    gpath = os.path.join(C.ROOT, 'pipeline', 'data', 'question_groups.json')
    if os.path.isfile(gpath):
        with open(gpath, encoding='utf-8') as f:
            gmap = json.load(f).get('groups', {})
        for r in records:
            gi = gmap.get(r.id)
            if gi and gi.get('passage_image_url'):
                r.group = gi['group']
                r.passage_image_url = gi['passage_image_url']
                r.passage_image_w = gi.get('passage_image_w', 0)
                r.passage_image_h = gi.get('passage_image_h', 0)

    # every correct-answer letter must be clickable: some chemistry options render
    # only as structures (no text) or a 5th option E isn't in the text layer, so the
    # UI's A–D fallback can't select an E answer. Pad missing letters (empty text;
    # the image stays the source of truth).
    for r in records:
        _ensure_answer_selectable(r)

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
    failed = []
    for school in schools:
        try:
            run_school(school)
        except Exception:  # 一校壞掉不得中止/汙染其他校（per-school 隔離鐵則）
            failed.append(school)
            print(f'[{school}] 產出失敗，跳過此校、其他校照常產出：', file=sys.stderr)
            traceback.print_exc()
    if failed:
        print(f'完成，但下列學校失敗（其他校未受影響）：{failed}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
