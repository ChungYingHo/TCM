#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""補習班國文實力測驗 PDF → 每題一張裁圖 ＋ 答案卡 ＋ 詳解，供網站當「線上作答的筆記篇」。

和考古題 pipeline 同一套切題機制（`tcmpipe.extract`），差別只有三點：

1. **答案只從【解答】那張表拿。** 那是一張乾淨的「題號 / 選項」對照表，逐格解析，
   不從詳解的散文裡猜（詳解常常先列錯誤選項，照著讀會全錯）。
2. **題幹一律以裁圖為準。** 這批 PDF 有重疊的雙層文字（同一行被拆成「前兩字」與
   「整行」兩個 text run），純文字抽取會靜靜地吐出殘缺句子。抽到的文字只存來搜尋，
   畫面顯示的是裁圖，永遠不會被抽壞。
3. 輸出到 `src/data/practice/<code>.json` 與 `public/practice/<code>/`，
   與三校考古題的分片完全分開。

用法：
    cd pipeline && python gen_practice_tests.py            # 全部重產
    cd pipeline && python gen_practice_tests.py T11 T12    # 只做指定幾份
"""
from __future__ import annotations

import io
import json
import os
import re
import sys

import fitz
from PIL import Image

from tcmpipe import config as C
from tcmpipe.extract import Anchor, load_words, extract_section

SRC_DIR = r'C:\Users\User\Desktop\TCM-exports\國文'
DATA_DIR = os.path.join(C.ROOT, 'src', 'data', 'practice')
IMAGE_DIR = os.path.join(C.ROOT, 'public', 'practice')

# 國文（實力測驗T11）.pdf / 國文（補資B4）.pdf
NAME_RE = re.compile(r'國文（(?:實力測驗|補資)([A-Z]\d+)）')
ANSWER_MARK = '【解答】'
DETAIL_MARK = '【詳解】'


def find_mark(doc: fitz.Document, mark: str) -> tuple[int, float] | None:
    """(page, y) of a marker such as 【解答】, so question anchors after it can be cut."""
    for pno in range(doc.page_count):
        hits = doc[pno].search_for(mark)
        if hits:
            return pno, hits[0].y0
    return None


def parse_answer_key(text: str) -> dict[int, str]:
    """【解答】是一張表，抽出來是「題號、選項」交替的一串 token。逐格配對，不做任何推論。

    有些份（T5）會把整格併成一個 token（`11 D`），先把那種拆開再配對，
    否則那幾題會靜靜地沒有答案。"""
    toks: list[str] = []
    for raw in text.split('\n'):
        t = raw.strip()
        if not t:
            continue
        m = re.fullmatch(r'(\d{1,3})\s+([A-E])', t)
        if m:
            toks.extend([m.group(1), m.group(2)])
        else:
            toks.append(t)
    out: dict[int, str] = {}
    for i in range(len(toks) - 1):
        if re.fullmatch(r'\d{1,3}', toks[i]) and re.fullmatch(r'[A-E]', toks[i + 1]):
            n = int(toks[i])
            out.setdefault(n, toks[i + 1])
    return out


# 題號錨點：這批 PDF 的左邊界比三校考古題寬，而且有幾份的句點沒被畫進 token（T12 的
# 第 11 題只有 `11`）。所以放寬成「左邊界附近、看起來像題號」，再靠**必須剛好接續上一題**
# 這條把假錨點濾掉——內文裡的數字要剛好等於下一個題號又貼在左邊界，機率極低。
PRACTICE_MARGIN_MAX = 110
PRACTICE_NUM_RE = re.compile(r'^(\d{1,3})[.．、]?$|^(\d{1,3})[.．]\S')


def find_practice_anchors(words: list[tuple], cutoff: tuple[int, float]) -> list[Anchor]:
    cands: list[Anchor] = []
    for (pno, x0, y0, x1, y1, t) in words:
        if x0 >= PRACTICE_MARGIN_MAX or (pno, y0) >= cutoff:
            continue
        m = PRACTICE_NUM_RE.match(t)
        if m:
            cands.append(Anchor(pno, y0, x0, int(m.group(1) or m.group(2))))
    cands.sort(key=lambda a: (a.page, a.y, a.x))
    kept: list[Anchor] = []
    for a in cands:
        want = 1 if not kept else kept[-1].num + 1
        if a.num == want:
            kept.append(a)
    return kept


def parse_details(text: str) -> dict[int, str]:
    """【詳解】區塊：以「N.」開頭的行起算，到下一個「N.」為止。原始 PDF 不一定每題都有。"""
    lines = text.split('\n')
    starts: list[tuple[int, int]] = []
    for i, ln in enumerate(lines):
        m = re.match(r'^\s*(\d{1,3})\.(?:\s|$)', ln)
        if m:
            starts.append((i, int(m.group(1))))
    out: dict[int, str] = {}
    for k, (i, n) in enumerate(starts):
        j = starts[k + 1][0] if k + 1 < len(starts) else len(lines)
        chunk = '\n'.join(lines[i:j])
        chunk = re.sub(r'^\s*\d{1,3}\.\s*', '', chunk, count=1)
        chunk = '\n'.join(x for x in chunk.split('\n') if not _is_chrome(x))
        chunk = re.sub(r'[ \t]+', ' ', chunk).strip()
        if chunk and n not in out:
            out[n] = chunk
    return out


def _is_chrome(line: str) -> bool:
    s = line.strip()
    return (not s) or s == '版權所有，重製必究' or re.fullmatch(r'\d{1,3}', s) is not None


# 這批 PDF 有些頁把每一行畫成兩個重疊的 text run（「前兩字」＋「整行」），抽出來會變成
# 「若以以」「酒酒入豪腸」這種疊字。實測乾淨的題幹疊字率是 0.00、壞掉的最低 0.07，
# 門檻取 0.04：寧可多丟幾條沒問題的文字，也不要讓壞掉的句子上線（顯示本來就靠裁圖）。
DOUBLING_MAX = 0.04
PRIVATE_USE_RE = re.compile(r'[-]')


def doubling_rate(s: str) -> float:
    s = re.sub(r'\s', '', s)
    if len(s) < 8:
        return 0.0
    return sum(1 for a, b in zip(s, s[1:]) if a == b) / (len(s) - 1)


# 每頁最後一題的裁圖會一路吃到頁尾，留下半頁空白。這裡把上下左右的空白切掉。
# 門檻取 200（0–255）：正文是黑的，頁面中央那個淡灰浮水印遠比 200 亮，不會被當成內容。
INK_MAX = 200
TRIM_PAD = 12


def trim_whitespace(png_bytes: bytes) -> tuple[bytes, int, int]:
    img = Image.open(io.BytesIO(png_bytes)).convert('RGB')
    mask = img.convert('L').point(lambda v: 255 if v < INK_MAX else 0)
    box = mask.getbbox()
    if box:
        l, t, r, b = box
        img = img.crop((max(0, l - TRIM_PAD), max(0, t - TRIM_PAD),
                        min(img.width, r + TRIM_PAD), min(img.height, b + TRIM_PAD)))
    buf = io.BytesIO()
    img.save(buf, format='WEBP', quality=C.WEBP_QUALITY, method=6)
    return buf.getvalue(), img.width, img.height


def clean_stem(stem: str) -> str | None:
    """抽到的題幹只在「確定沒被雙層文字弄壞」時才留，否則寧可不給。"""
    s = PRIVATE_USE_RE.sub('', stem or '').strip()
    if not s or doubling_rate(s) > DOUBLING_MAX:
        return None
    return s


def text_between(doc: fitz.Document, start: tuple[int, float] | None,
                 end: tuple[int, float] | None) -> str:
    """Page text from `start` (page, y) up to `end`, inclusive of partial pages."""
    if start is None:
        return ''
    sp, sy = start
    ep, ey = end if end else (doc.page_count - 1, 1e6)
    parts = []
    for pno in range(sp, min(ep, doc.page_count - 1) + 1):
        page = doc[pno]
        top = sy if pno == sp else 0.0
        bottom = ey if pno == ep else page.rect.height
        clip = fitz.Rect(0, top, page.rect.width, bottom)
        parts.append(page.get_text(clip=clip))
    return '\n'.join(parts)


def build_one(pdf_path: str) -> dict:
    code = NAME_RE.search(os.path.basename(pdf_path)).group(1)
    doc = fitz.open(pdf_path)

    ans_pos = find_mark(doc, ANSWER_MARK)
    det_pos = find_mark(doc, DETAIL_MARK)
    if ans_pos is None:
        raise SystemExit(f'{code}: 找不到 {ANSWER_MARK}，這份的版型不一樣，先別動它')

    answers = parse_answer_key(text_between(doc, ans_pos, det_pos))
    details = parse_details(text_between(doc, det_pos, None)) if det_pos else {}

    # 只找【解答】之前的題號錨點，否則答案表與詳解裡的「N.」會被當成題目
    kept = find_practice_anchors(load_words(doc), ans_pos)
    items = extract_section(doc, kept)
    out_img = os.path.join(IMAGE_DIR, code)
    os.makedirs(out_img, exist_ok=True)

    questions = []
    for it in items:
        name = f'q{it.num:02d}.webp'
        img_bytes, iw, ih = trim_whitespace(it.image_bytes)
        with open(os.path.join(out_img, name), 'wb') as fh:
            fh.write(img_bytes)
        q = {
            'n': it.num,
            'answer': answers.get(it.num),
            'img': f'/practice/{code}/{name}',
            'w': iw,
            'h': ih,
        }
        stem = clean_stem(it.stem)
        if stem:
            q['stem'] = stem
        if it.num in details:
            q['explain'] = PRIVATE_USE_RE.sub('', details[it.num])
        questions.append(q)

    doc.close()
    return {
        'code': code,
        'title': f'國文實力測驗 {code}',
        'questionCount': len(questions),
        'answeredCount': sum(1 for q in questions if q['answer']),
        'explainedCount': sum(1 for q in questions if q.get('explain')),
        'stemCount': sum(1 for q in questions if q.get('stem')),
        'keyCount': len(answers),
        'questions': questions,
    }


PAGE_DIR = os.path.join(C.ROOT, 'src', 'pages', 'practice')

# 每份測驗一個頁面檔（與 readings/r1.astro、r2.astro 同一個作法）。
# notes.test.ts 的「每篇註冊的筆記都有真的頁面」是逐檔找的，動態路由過不了那條。
PAGE_TEMPLATE = '''---
// 由 pipeline/gen_practice_tests.py 產生，請不要手改：改了下次重跑就沒了。
import Layout from '@/layouts/Layout.astro'
import PracticeRunner from '@/components/practice/PracticeRunner.svelte'
import type {{ PracticeTest }} from '@/models/practice'
import data from '@/data/practice/{code}.json'

export const prerender = false

const test = data as unknown as PracticeTest
---

<Layout title={{`${{test.title}} · TCM 題庫`}}>
  <header class="mb-6 flex flex-col gap-1.5">
    <a href="/notes?subject=國文" class="page-kicker gap-1 transition-opacity hover:opacity-70">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><polyline points="15 18 9 12 15 6"></polyline></svg>
      筆記 · 國文實力測驗
    </a>
    <h1 class="page-title">{{test.title}}</h1>
    <p class="page-desc max-w-2xl">
      共 {{test.questionCount}} 題。選一個選項就立刻對答案，答錯會顯示正解與原卷詳解。
      題目與選項是原卷裁圖，答案取自原卷的【解答】表。
    </p>
  </header>

  <PracticeRunner test={{test}} client:load />
</Layout>
'''


def write_page(code: str) -> None:
    os.makedirs(PAGE_DIR, exist_ok=True)
    with io.open(os.path.join(PAGE_DIR, f'{code}.astro'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(PAGE_TEMPLATE.format(code=code))


def main() -> None:
    want = {a.upper() for a in sys.argv[1:]}
    os.makedirs(DATA_DIR, exist_ok=True)
    paths = sorted(p for p in os.listdir(SRC_DIR) if p.lower().endswith('.pdf') and NAME_RE.search(p))
    bad = []
    for name in paths:
        code = NAME_RE.search(name).group(1)
        if want and code not in want:
            continue
        doc_data = build_one(os.path.join(SRC_DIR, name))
        with io.open(os.path.join(DATA_DIR, f'{doc_data["code"]}.json'), 'w', encoding='utf-8') as fh:
            json.dump(doc_data, fh, ensure_ascii=False, indent=1)
        write_page(doc_data['code'])
        n, k = doc_data['questionCount'], doc_data['keyCount']
        miss = [q['n'] for q in doc_data['questions'] if not q['answer']]
        flag = '' if (n == k and not miss) else '  <-- 檢查'
        if flag:
            bad.append(doc_data['code'])
        print(f'{doc_data["code"]:>4}  題 {n:>3}  答案卡 {k:>3}  有詳解 {doc_data["explainedCount"]:>3}'
              f'  題幹可用 {doc_data["stemCount"]:>3}  缺答案 {len(miss):>2}{flag}')
    print('\n需要人工確認的：', bad or '無')


if __name__ == '__main__':
    main()
