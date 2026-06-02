#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Phase 0 spike: prove ISU exam_all -> segmented questions (text + options + crop image)
and answer-sheet + errata parsing. Run from repo root:  python pipeline/spike_isu.py
Outputs to pipeline/out_spike/.
"""
import re, json, os, sys
import fitz  # PyMuPDF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
YEAR = 115
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out_spike')
os.makedirs(OUT, exist_ok=True)

QNUM_RE = re.compile(r'^(\d{1,3})\.$')
OPT_RE = re.compile(r'^\(([A-E])\)(.*)$')
DPI = 150
LEFT_MARGIN_MAX = 60  # qnum anchors sit at x0~37

def load_words(doc):
    """Return list of (page, x0, y0, x1, y1, text) across all pages, sorted by (page,y,x)."""
    out = []
    for pno in range(doc.page_count):
        for w in doc[pno].get_text('words'):
            out.append((pno, w[0], w[1], w[2], w[3], w[4]))
    return out

def find_question_anchors(words):
    """qnum tokens near the left margin. Returns list of dicts with page,y,num."""
    anchors = []
    for (pno, x0, y0, x1, y1, t) in words:
        m = QNUM_RE.match(t)
        if m and x0 < LEFT_MARGIN_MAX:
            anchors.append({'page': pno, 'y': y0, 'x': x0, 'num': int(m.group(1))})
    anchors.sort(key=lambda a: (a['page'], a['y']))
    return anchors

def split_subjects(anchors):
    """Split the linear anchor stream into subject sections where qnum resets to 1
    (or drops). Returns list of sections, each a list of anchors."""
    sections, cur = [], []
    for a in anchors:
        if cur and a['num'] <= cur[-1]['num']:
            sections.append(cur)
            cur = []
        cur.append(a)
    if cur:
        sections.append(cur)
    return sections

def question_text(doc, sec_anchors, idx):
    """Collect words belonging to question idx within a section (text + options)."""
    a = sec_anchors[idx]
    nxt = sec_anchors[idx + 1] if idx + 1 < len(sec_anchors) else None
    stem_words, options = [], []
    for pno in range(a['page'], (nxt['page'] if nxt else doc.page_count - 1) + 1):
        for w in doc[pno].get_text('words'):
            x0, y0, t = w[0], w[1], w[4]
            # within vertical range of this question
            after_start = (pno > a['page']) or (y0 >= a['y'] - 0.5)
            before_end = nxt is None or (pno < nxt['page']) or (y0 < nxt['y'] - 0.5)
            if not (after_start and before_end):
                continue
            if QNUM_RE.match(t) and x0 < LEFT_MARGIN_MAX:
                continue  # skip the qnum token itself
            om = OPT_RE.match(t)
            if om:
                options.append({'letter': om.group(1), 'text': om.group(2)})
            else:
                stem_words.append(t)
    return ''.join(stem_words), options

def crop_image(doc, sec_anchors, idx, name):
    a = sec_anchors[idx]
    nxt = sec_anchors[idx + 1] if idx + 1 < len(sec_anchors) else None
    page = doc[a['page']]
    pad = 4
    top = max(0, a['y'] - pad)
    if nxt and nxt['page'] == a['page']:
        bottom = nxt['y'] - pad
    else:
        bottom = page.rect.height - 30  # to near page bottom (footer trimmed)
    clip = fitz.Rect(0, top, page.rect.width, bottom)
    pix = page.get_pixmap(dpi=DPI, clip=clip)
    path = os.path.join(OUT, name)
    pix.save(path)
    return os.path.relpath(path, ROOT).replace('\\', '/'), pix.width, pix.height

# ---- answer sheet parsing (ISU: 4 subjects, each a "...參考答案" section) ----
SUBJ_HEADER_RE = re.compile(r'(國文|化學|生物學?|英文)\S*?試題?參考答案')

def parse_answers(path):
    doc = fitz.open(path)
    txt = '\n'.join(doc[p].get_text('text') for p in range(doc.page_count))
    # split into subject chunks by the per-subject header line
    marks = [(m.start(), m.group(1)) for m in SUBJ_HEADER_RE.finditer(txt)]
    blocks = []
    for i, (pos, subj) in enumerate(marks):
        end = marks[i + 1][0] if i + 1 < len(marks) else len(txt)
        chunk = txt[pos:end]
        tokens = chunk.split()
        amap = {}
        for j in range(len(tokens) - 1):
            if re.fullmatch(r'\d{1,3}', tokens[j]) and re.fullmatch(r'[A-E]', tokens[j + 1]):
                amap[int(tokens[j])] = tokens[j + 1]
        blocks.append({'subject': subj, 'answers': amap})
    return blocks

# ---- errata parsing (ISU clarification table) ----
RESULT_RE = re.compile(r'(維持原答案|送分|一律給分|答案更正為?|更正為?)')

def parse_errata(path):
    doc = fitz.open(path)
    txt = '\n'.join(doc[p].get_text('text') for p in range(doc.page_count))
    entries = []
    for m in RESULT_RE.finditer(txt):
        seg = txt[m.start():m.start() + 30]
        letters = re.findall(r'[（(]([A-E])[)）]', seg)
        entries.append({'result': m.group(1), 'corrected_letters': letters})
    return entries

def main():
    exam = os.path.join(ROOT, 'ISU', str(YEAR), 'pre-exams', 'exam_all.pdf')
    doc = fitz.open(exam)
    words = load_words(doc)
    anchors = find_question_anchors(words)
    sections = split_subjects(anchors)
    print(f'pages={doc.page_count} total_qnum_anchors={len(anchors)} sections={len(sections)}')
    print('section sizes (questions each):', [len(s) for s in sections])

    # report the section that is short of 50 (anchor miss diagnosis)
    for si, s in enumerate(sections):
        nums = [a['num'] for a in s]
        missing = sorted(set(range(1, max(nums) + 1)) - set(nums))
        if len(s) != 50:
            print(f'  section {si}: {len(s)} questions, nums {nums[0]}..{nums[-1]}, missing={missing}')

    answers = parse_answers(os.path.join(ROOT, 'ISU', str(YEAR), 'answers', 'answer_all.pdf'))
    print('answer blocks:', [(b['subject'], len(b['answers'])) for b in answers])

    errata = parse_errata(os.path.join(ROOT, 'ISU', str(YEAR), 'answers', 'clarification.pdf'))
    print('errata entries:', len(errata))
    for e in errata[:12]:
        print('   ', e)

    # sample: extract first 3 questions of section 0 with text+options+crop
    sample = []
    sec = sections[0]
    for idx in range(min(3, len(sec))):
        stem, opts = question_text(doc, sec, idx)
        img, w, h = crop_image(doc, sec, idx, f'isu{YEAR}_s0_q{sec[idx]["num"]}.png')
        sample.append({
            'num': sec[idx]['num'],
            'stem': stem[:200],
            'options': opts,
            'image': img, 'img_w': w, 'img_h': h,
            'answer_from_block0': answers[0]['answers'].get(sec[idx]['num']) if answers else None,
        })
    # also one chemistry-likely section question crop (section 1)
    if len(sections) > 1:
        sec1 = sections[1]
        stem, opts = question_text(doc, sec1, 0)
        img, w, h = crop_image(doc, sec1, 0, f'isu{YEAR}_s1_q{sec1[0]["num"]}.png')
        sample.append({'num': sec1[0]['num'], 'section': 1, 'stem': stem[:200],
                       'options': opts, 'image': img, 'img_w': w, 'img_h': h})

    with open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8') as f:
        json.dump(sample, f, ensure_ascii=False, indent=2)
    print('\nSAMPLE:')
    print(json.dumps(sample, ensure_ascii=False, indent=2)[:2000])

if __name__ == '__main__':
    main()
