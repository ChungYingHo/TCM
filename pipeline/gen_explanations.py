#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Per-question worked-solution DRAFTS for text-based past-exam questions.

Why this is allowed under CLAUDE.md ("正確性不可依賴 LLM"): the correct ANSWER is
NEVER produced here — it stays whatever the answer card / errata already decided. The
LLM only writes the *explanation* of why that known-correct answer is right, anchored
to it, as a non-critical study aid → every solution is flagged `draft: true` and shown
behind an 「AI 草稿」 badge with a "答案以答案卡為準" caveat.

Eligibility: TEXT questions only (question_text present AND every option has text).
Image / chemical-structure questions are SKIPPED — the LLM must not interpret figures,
and the per-question screenshot stays the source of truth for those.

Solutions live in pipeline/data/question_explanations.json (committed cache), merged
into src/data/explanations.json. Filling is incremental & checkpointed, newest exam
years first (most representative), so a partial fill is already useful.

Run:
  python pipeline/gen_explanations.py                 # merge cache -> src/data/explanations.json
  ANTHROPIC_API_KEY=sk-... python pipeline/gen_explanations.py --fill 300
                                                      # draft 300 missing solutions, then merge
"""
from __future__ import annotations
import os
import re
import sys
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tcmpipe import config as C

CACHE = os.path.join(C.ROOT, 'pipeline', 'data', 'question_explanations.json')
OUT = os.path.join(C.WEB_DATA_DIR, 'explanations.json')
SUBJECT_ZH = {'chemistry': '化學', 'chinese': '國文', 'biology': '生物', 'english': '英文'}


def load_json(path: str, default):
    if not os.path.exists(path):
        return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def save_cache(cache: dict) -> None:
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2, sort_keys=True)


def all_questions() -> list[dict]:
    out: list[dict] = []
    for sch in ('CMU', 'ISU', 'TCU'):
        d = load_json(os.path.join(C.WEB_DATA_DIR, f'{sch}.json'), None)
        if d:
            out.extend(d['questions'])
    return out


# stems that point at a drawn compound / figure / table the LLM cannot see → skip,
# even if the stem+options are textual (e.g. 「下列化合物含有幾個掌性中心」+ options 2/3/4/5).
_FIGURE_RE = re.compile(r'下圖|如[下右左]?圖|[右左附前後]圖|圖[中所示例]|據圖|依圖|看圖|'
                        r'下列(化合物|結構|分子|化學式|反應式?|數據|圖|表)|下表|如下(化合物|結構|圖|表)|'
                        r'此(化合物|結構|分子)|該(化合物|結構)')


def eligible(q: dict) -> bool:
    """Text-based, self-contained questions only — never ask the LLM to read a
    figure/structure (per CLAUDE.md), and skip stems that reference one."""
    stem = (q.get('question_text') or '').strip()
    if not stem or _FIGURE_RE.search(stem):
        return False
    opts = q.get('options') or []
    if len(opts) < 2 or not all((o.get('text') or '').strip() for o in opts):
        return False
    return True


def fill(questions: list[dict], cache: dict, limit: int) -> None:
    key = os.environ.get('ANTHROPIC_API_KEY')
    if not key:
        sys.exit('--fill needs ANTHROPIC_API_KEY (solutions are non-critical AI-draft aids).')
    import urllib.request
    base = os.environ.get('ANTHROPIC_BASE_URL', 'https://api.anthropic.com').rstrip('/')
    # newest exam years first (most representative of current style)
    todo = [q for q in questions if eligible(q) and q['id'] not in cache]
    todo.sort(key=lambda q: -int(q['year']))
    todo = todo[:limit]
    print(f'drafting {len(todo)} solutions via API…')
    for i in range(0, len(todo), 10):
        batch = todo[i:i + 10]
        blocks = []
        for q in batch:
            opts = '\n'.join(f"({o['letter']}) {o['text']}" for o in q['options'])
            ans = '、'.join(q.get('correct_answer') or [])
            blocks.append(
                f"id: {q['id']}（{SUBJECT_ZH.get(q['subject'], q['subject'])}）\n"
                f"題目：{q['question_text']}\n選項：\n{opts}\n正確答案（以答案卡為準，不可更改）：{ans}"
            )
        prompt = (
            '你是學士後中醫考試的輔導老師。下面每題都附了「正確答案」（以官方答案卡為準）。'
            '請為每題寫一段精簡、條理清楚、初學者也懂的「詳解」：說明為什麼正解正確、'
            '其餘選項為什麼錯、以及解這類題的關鍵步驟。用繁體中文。'
            '**務必以附上的正確答案為準，不要質疑或更改它**；若某選項牽涉到只有看圖才能判斷的'
            '結構/圖表，就用文字說明判斷原則即可。每題 3–6 句。\n'
            '只回傳一個 JSON 物件，格式 { "題目id": "詳解文字" }，不要其他文字。\n\n'
            + '\n\n'.join(blocks)
        )
        body = json.dumps({
            'model': 'claude-sonnet-4-6',
            'max_tokens': 4000,
            'messages': [{'role': 'user', 'content': prompt}],
        }).encode()
        req = urllib.request.Request(
            f'{base}/v1/messages', data=body,
            headers={'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'},
        )
        try:
            resp = json.load(urllib.request.urlopen(req, timeout=90))
            text = resp['content'][0]['text']
            got = json.loads(text[text.find('{'):text.rfind('}') + 1])
            for qid, sol in got.items():
                if isinstance(sol, str) and sol.strip():
                    cache[qid] = sol.strip()
            print(f'  batch {i // 10 + 1}: +{len(got)}')
            save_cache(cache)  # checkpoint
        except Exception as e:  # noqa: BLE001 — best-effort bulk fill
            print(f'  batch {i // 10 + 1} failed: {e}')


def main() -> None:
    questions = all_questions()
    if not questions:
        sys.exit('no shards found in src/data — run the build first.')
    cache = load_json(CACHE, {})
    if '--fill' in sys.argv:
        fill(questions, cache, int(sys.argv[sys.argv.index('--fill') + 1]))
        cache = load_json(CACHE, {})

    ids = {q['id'] for q in questions}
    solutions = {qid: sol for qid, sol in cache.items() if qid in ids and isinstance(sol, str) and sol.strip()}
    elig = sum(1 for q in questions if eligible(q))
    out = {
        'generated_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'count': len(solutions),
        'eligible': elig,
        'draft': True,  # every solution is an LLM-drafted aid; answer stays from the card
        'solutions': solutions,
    }
    os.makedirs(C.WEB_DATA_DIR, exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'wrote {OUT}: {len(solutions)}/{elig} eligible text questions have a draft '
          f'({elig - len(solutions)} pending — run with --fill + API key)')


if __name__ == '__main__':
    main()
