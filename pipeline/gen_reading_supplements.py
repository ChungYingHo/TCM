#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""英文增補廣讀（旋元佑老師編授）PDF → `src/data/reading-r<N>.ts`。

這批講義的版型很規矩，所以段落切分**用幾何、不用空行**：內文行都靠左對齊在
x≈56.7，行距 18pt，段落之間會空到 36pt。純文字抽取看不出段落界線（前一段的句號
後面直接接下一段），照行距切才不會把兩段黏成一段。

字彙表夾在段落之間，長這樣：
    heady (a.) 令人興奮的 / limestone (n.) 石灰岩 / perch (n.) 棲地 / promontory
    (n.) 地岬 / stunning (a.) 驚人的
同一塊先把行接起來再用 ` / ` 切，被換行拆開的詞條（promontory ｜ (n.) 地岬）才不會斷掉。

用法：
    cd pipeline && python gen_reading_supplements.py R3 R4 R5
"""
from __future__ import annotations

import io
import os
import re
import sys

import fitz

from tcmpipe import config as C

SRC_DIR = r'C:\Users\User\Desktop\TCM-exports\英文'
OUT_DIR = os.path.join(C.ROOT, 'src', 'data')

BODY_X_MIN, BODY_X_MAX = 50.0, 70.0   # 內文靠左對齊的欄位
BLOCK_GAP = 27.0                       # 行距 18、段距 36，取中間當界線
CJK = re.compile(r'[\u3400-\u9fff]')
CHROME = re.compile(r'^(增補資料|旋元佑|版權所有|\s*字\s*彙)|^[*A-Z0-9]{8,}$|^\d{1,3}$')
GLOSS_ENTRY = re.compile(r'^(.+?)\s*\(([a-z]{1,4}\.?)\)\s*(.+)$')
BYLINE = re.compile(r'^(By\s+.+|[A-Z][a-z]+(?:\s+[A-Z][a-zA-Z\'\u2019.-]+){1,3})$')
START_MARK = 'For one-time'


BOLD_FLAG = 16


class Line:
    __slots__ = ('text', 'bold', 'bolds', 'cjk')

    def __init__(self, text: str, bold: bool, bolds: list[str]):
        self.text = text
        self.bold = bold           # 整行都是粗體 → 標題或小標
        self.bolds = bolds         # 行內被加粗的片段 → 就是要畫底線的單字表面形
        self.cjk = bool(CJK.search(text))


class Block:
    __slots__ = ('text', 'bold', 'bolds', 'cjk')

    def __init__(self, lines: list[Line]):
        self.text = ' '.join(x.text for x in lines).strip()
        self.bold = all(x.bold for x in lines)
        self.bolds = [f for x in lines for f in x.bolds]
        self.cjk = any(x.cjk for x in lines)


def body_lines(doc: fitz.Document) -> list[tuple[int, float, Line]]:
    out = []
    started = False
    for pno in range(doc.page_count):
        rows = []
        for b in doc[pno].get_text('dict')['blocks']:
            if b['type'] != 0:
                continue
            for ln in b['lines']:
                spans = [s for s in ln['spans'] if s['text'].strip()]
                if not spans:
                    continue
                txt = ''.join(s['text'] for s in ln['spans']).strip()
                x0, y0 = ln['bbox'][0], ln['bbox'][1]
                if not txt or not (BODY_X_MIN < x0 < BODY_X_MAX):
                    continue
                bold_all = all(s['flags'] & BOLD_FLAG for s in spans)
                bolds = [s['text'].strip() for s in spans
                         if (s['flags'] & BOLD_FLAG) and s['text'].strip()]
                rows.append((y0, Line(txt, bold_all, [] if bold_all else bolds)))
        rows.sort(key=lambda r: r[0])
        for y0, line in rows:
            if not started:
                if line.text.startswith(START_MARK):
                    started = True
                continue
            if CHROME.match(line.text):
                continue
            out.append((pno, y0, line))
    return out


def looks_like_byline(text: str) -> bool:
    """整行就是一個人名或 `By …`，而且很短。內文換行的句子長度都在 90 字以上，不會誤判。"""
    t = text.strip()
    return len(t) <= 60 and BYLINE.match(t) is not None


def body_blocks(doc: fitz.Document) -> list[Block]:
    """依版面切塊：垂直間距拉開、或「中文／英文」「整行粗體與否」換了，就是新的一塊。

    只看間距不夠。段落與緊接其後的字彙表同樣是 18pt，標題與作者也是 18pt。
    R5 還多一層：標題與作者之間夾了一行副標，三行都是 18pt，所以作者那一行要另外強制斷開。"""
    blocks: list[list[Line]] = []
    prev = None
    for pno, y0, line in body_lines(doc):
        new = (
            prev is None
            or pno != prev[0]
            or (y0 - prev[1]) > BLOCK_GAP
            or line.cjk != prev[2].cjk
            or line.bold != prev[2].bold
            or (looks_like_byline(line.text) and not looks_like_byline(prev[2].text))
        )
        if new:
            blocks.append([line])
        else:
            blocks[-1].append(line)
        prev = (pno, y0, line)
    return [Block(b) for b in blocks]


def is_glossary(text: str) -> bool:
    return bool(CJK.search(text)) and (' / ' in text or GLOSS_ENTRY.match(text) is not None)


def parse_glossary(text: str) -> list[dict]:
    out = []
    for raw in text.split(' / '):
        item = raw.strip().rstrip('/').strip()
        if not item:
            continue
        m = GLOSS_ENTRY.match(item)
        if m:
            word, pos, zh = m.group(1).strip(), m.group(2).strip(), m.group(3).strip()
        elif '即' in item:
            # 「NGO 即 nongovernmental organization 非政府組織」這種沒有詞性標記的說明
            word, _, rest = item.partition('即')
            word, pos, zh = word.strip(), '', rest.strip()
        else:
            continue
        if word and zh:
            out.append({'word': word, 'pos': pos, 'zh': zh})
    return out


SUFFIXES = ('', 's', 'es', 'ed', 'd', 'ing', 'ies', 'ly', 'er', "'s", '’s')


def surface_forms(word: str, bolds: list[str]) -> list[str] | None:
    """文章裡被加粗的片段就是該畫底線的表面形。只收「原形加上常見字尾」的，
    避免把別的單字誤掛到這個詞條底下。"""
    base = word.lower().strip()
    if ' ' in base:
        return None
    want = {base + s for s in SUFFIXES}
    if base.endswith('y'):
        want |= {base[:-1] + 'ies', base[:-1] + 'ied'}
    found = []
    for frag in bolds:
        f = frag.strip().strip('.,;:!?"“”()').lower()
        if f in want:
            found.append(frag.strip().strip('.,;:!?"“”()'))
    forms = sorted(set(found), key=str.lower)
    if not forms or forms == [word]:
        return None
    return forms


def split_articles(blocks: list) -> list[dict]:
    """以「整行粗體的標題塊 ＋ 緊接的作者塊」為界切成多篇。"""
    marks = []
    for i, b in enumerate(blocks):
        if b.cjk or not b.bold or len(b.text) > 140:
            continue
        # 標題之後最多允許夾一行副標，再來才是作者
        for skip in (1, 2):
            nxt = blocks[i + skip] if i + skip < len(blocks) else None
            if nxt is None or nxt.cjk or nxt.bold:
                break
            if looks_like_byline(nxt.text):
                marks.append((i, b.text.strip(), nxt.text.strip(), i + skip + 1))
                break

    arts = []
    for k, (i, title, author, body_at) in enumerate(marks):
        end = marks[k + 1][0] if k + 1 < len(marks) else len(blocks)
        body = blocks[body_at:end]
        paras, words, bolds = [], [], []
        for b in body:
            if b.cjk and is_glossary(b.text):
                words.extend(parse_glossary(b.text))
            elif b.bold:
                paras.append('## ' + b.text)
            elif b.cjk:
                continue
            else:
                paras.append(b.text)
                bolds.extend(b.bolds)
        seen, uniq = set(), []
        for w in words:
            if w['word'].lower() in seen:
                continue
            seen.add(w['word'].lower())
            forms = surface_forms(w['word'], bolds)
            if forms:
                w['match'] = forms
            uniq.append(w)
        arts.append({
            'id': k + 1,
            'title': title,
            'author': re.sub(r'^By\s+', '', author),
            'content': '\n\n'.join(paras),
            'words': uniq,
        })
    return arts


def ts_string(s: str) -> str:
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def emit(code: str, source: str, arts: list[dict]) -> str:
    n = code[1:]
    total_words = sum(len(a['words']) for a in arts)
    lines = [
        "import type { ReadingArticle } from '@/models/reading'",
        '',
        f'export const READING_{code}_META = {{',
        f"  code: '{code}',",
        f"  title: '增補資料 {code} 字彙',",
        f'  source: {ts_string(source)},',
        "  author: '旋元佑',",
        f'  articleCount: {len(arts)},',
        f'  wordCount: {total_words},',
        '}',
        '',
        f'export const READING_{code}: ReadingArticle[] = [',
    ]
    for a in arts:
        lines.append('  {')
        lines.append(f'    id: {a["id"]},')
        lines.append(f'    title: {ts_string(a["title"])},')
        if a['author']:
            lines.append(f'    author: {ts_string(a["author"])},')
        lines.append(f'    topic: {ts_string(source)},')
        body = a['content'].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
        lines.append(f'    content: `{body}`,')
        lines.append('    words: [')
        for w in a['words']:
            parts = [f'word: {ts_string(w["word"])}', f'pos: {ts_string(w["pos"])}',
                     f'zh: {ts_string(w["zh"])}']
            if w.get('match'):
                inner = ', '.join(ts_string(m) for m in w['match'])
                parts.append(f'match: [{inner}]')
            lines.append('      { ' + ', '.join(parts) + ' },')
        lines.append('    ],')
        lines.append('  },')
    lines.append(']')
    lines.append('')
    _ = n
    return '\n'.join(lines)


def main() -> None:
    codes = [a.upper() for a in sys.argv[1:]] or ['R3', 'R4', 'R5']
    for code in codes:
        pdf = os.path.join(SRC_DIR, f'字彙（增補{code}）.pdf')
        doc = fitz.open(pdf)
        head = doc[0].get_text()
        m = re.search(r'Supplementary Readings \d+, from ([^\n]+)', head)
        source = m.group(1).strip() if m else code
        blocks = body_blocks(doc)
        doc.close()
        arts = split_articles(blocks)
        out = os.path.join(OUT_DIR, f'reading-{code.lower()}.ts')
        with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(emit(code, source, arts))
        print(f'{code}  來源 {source:<18} 文章 {len(arts)}  字彙 {sum(len(a["words"]) for a in arts):>4}'
              f'  段落 {sum(a["content"].count(chr(10) * 2) + 1 for a in arts):>3}')
        for a in arts:
            print(f'      {a["id"]}. {a["title"][:52]:<54} {a["author"][:22]:<24} 字彙 {len(a["words"]):>3}')


if __name__ == '__main__':
    main()
