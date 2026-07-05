#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Strip exam-paper chrome (page footers / "缺頁毀損" notice / "背面有試題" /
page numbers) that leaked into question_text and options[].text.

Root cause: extract.parse_stem_options lets the LAST option greedily absorb every
trailing token, so footer text printed just below the final option gets appended
to it (usually D/E). The header/footer regexes were only applied to image crops,
not the extracted display text.

Correctness-first (same contract as refine_text.py): touches ONLY question_text
and options[].text. Never reads or writes correct_answer / original_answer /
errata / concept_tags / images / any other field. The per-question screenshot
remains the source of truth for what the options actually say.

Usage:
  python pipeline/clean_text_junk.py            # dry-run: writes _clean_report.txt
  python pipeline/clean_text_junk.py --apply    # write the cleaned shards
"""
from __future__ import annotations
import os
import re
import sys
import json

HERE = os.path.dirname(os.path.abspath(__file__))
WEB_DATA_DIR = os.path.join(HERE, '..', 'src', 'data')
REPORT = os.path.join(HERE, '_clean_report.txt')
SCHOOLS = ('CMU', 'ISU', 'TCU')

# Each pattern is anchored to the END so it only strips a TRAILING chrome run.
# Ordered: the "缺頁毀損" footer also swallows whatever leaked after it (next-page bleed).
_JUNK_RES = [
    re.compile(r'[（(]?\s*(?:如)?有?缺頁.{0,4}毀損.*$'),            # （如有/有缺頁或毀損，應立即舉手請監試人員補發）…
    re.compile(r'\s*背面(?:還|沒)?有試題.*$'),                     # 背面(還/沒)有試題
    re.compile(r'\s*[二三]、\s*(?:作文題|非選擇題|寫作測驗|問答題|簡答題|申論題).*$'),  # 末選項吃進「二、作文題…」整段
    re.compile(r'\s*[IVX]+\s*[.．]?\s*(?:Cloze|Reading\b).*$'),       # 末選項吃進「III.Cloze / IV Reading…」整段
    re.compile(r'\s*【[A-D]】.*$'),                                 # 末選項吃進閱讀文章標籤【A】-【D】…
    re.compile(r'\s*第\s*\d+\s*頁\s*[,，]?\s*共\s*\d+\s*頁\s*$'),    # 第X頁，共Y頁
    re.compile(r'\s*(?:第\s*\d+\s*)?頁\s*之\s*第\s*\d+\s*頁\s*$'),   # (第X)頁之第Y頁 — never eats a bare digit
    re.compile(r'[（(]?\s*請勿翻[面頁].*$'),                       # 請勿翻面
    re.compile(r'\s*(?:作答無效|測驗結束).*$'),
]
# 題組（reading-group）的下一段閱讀短文常被貼進「前一題的末選項」尾巴（D/E 之後）。
# 只套用到選項、不套用到題幹——合法題組題幹本來就有「閱讀下列文字…」指示，不可誤刪。
_OPT_ONLY_RES = [
    re.compile(r'\s*[※*﹡·]*\s*閱讀[^。]{0,25}?回答第?\s*\d+.*$'),               # 閱讀(下文/後/甲乙兩詩/以下短文…),回答第N題 + 整段文章
    re.compile(r'\s*[※*﹡·]?\s*\d+\s*[-~〜–至]\s*\d+\s*題組.*$'),               # ※35~36題組題 + 整段文章（多為生物）
    re.compile(r'\s*[※*﹡·]*\s*(?:請根據所附資料[，,]?\s*)?回答下列第\s*\d+.*$'),   # 根據所附資料,回答下列第N~M題 + 附圖說明
    re.compile(r'\s*Questions?\s+\d+\s*[-–—~〜]\s*\d+\b.*$', re.I),            # Questions 16-20 + English passage
]
# a stripped suffix is "expected junk" only if it contains one of these
_JUNK_KW = re.compile(r'缺頁|毀損|舉手|補發|背面|請勿|作答無效|測驗結束|頁之第|頁，共|頁,共|作文題|非選擇題|寫作測驗|問答題|簡答題|申論題|Cloze|Reading|【[A-D]】|閱讀|回答第?\s*\d|回答下列第|題組|Questions?\s+\d', re.I)


def clean(text: str | None, is_option: bool = False) -> str:
    if not text:
        return text or ''
    t = text
    for r in _JUNK_RES:
        t = r.sub('', t)
    if is_option:                       # 題組閱讀短文只滲進選項，題幹不動
        for r in _OPT_ONLY_RES:
            t = r.sub('', t)
    return t.strip()


def run(apply: bool) -> None:
    g = {'opt': 0, 'opt_empty': 0, 'opt_recov': 0, 'stem': 0, 'suspicious': 0}
    lines: list[str] = []
    for sch in SCHOOLS:
        path = os.path.join(WEB_DATA_DIR, f'{sch}.json')
        with open(path, encoding='utf-8') as f:
            shard = json.load(f)
        answers_before = [(r['id'], tuple(r.get('correct_answer') or [])) for r in shard['questions']]
        for r in shard['questions']:
            for field, label in ((None, 'STEM'),):
                pass
            old_stem = r.get('question_text') or ''
            ns = clean(old_stem)
            if ns != old_stem:
                g['stem'] += 1
                removed = old_stem[len(os.path.commonprefix([old_stem, ns])):]
                flag = '' if _JUNK_KW.search(removed) else '  <<< SUSPICIOUS'
                if flag:
                    g['suspicious'] += 1
                lines.append(f"{r['id']} STEM{flag}\n  before: {old_stem!r}\n  after : {ns!r}\n  strip : {removed!r}")
                r['question_text'] = ns
            for o in (r.get('options') or []):
                old = o.get('text') or ''
                nt = clean(old, is_option=True)
                if nt == old:
                    continue
                g['opt'] += 1
                g['opt_empty' if not nt else 'opt_recov'] += 1
                removed = old[len(os.path.commonprefix([old, nt])):]
                flag = '' if _JUNK_KW.search(removed) else '  <<< SUSPICIOUS'
                if flag:
                    g['suspicious'] += 1
                lines.append(f"{r['id']} opt {o['letter']}{flag}\n  before: {old!r}\n  after : {nt!r}\n  strip : {removed!r}")
                o['text'] = nt
        answers_after = [(r['id'], tuple(r.get('correct_answer') or [])) for r in shard['questions']]
        assert answers_before == answers_after, f'{sch}: answers changed — aborting'
        if apply:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(shard, f, ensure_ascii=False, separators=(',', ':'))

    with open(REPORT, 'w', encoding='utf-8') as f:
        f.write('\n\n'.join(lines))
    mode = 'APPLIED' if apply else 'DRY-RUN'
    print(f"{mode}: stem={g['stem']}, opt={g['opt']} (recovered={g['opt_recov']}, "
          f"to-empty={g['opt_empty']}), SUSPICIOUS={g['suspicious']}. answers-unchanged=OK")
    print(f"full before/after report -> {REPORT}")


if __name__ == '__main__':
    run('--apply' in sys.argv)
