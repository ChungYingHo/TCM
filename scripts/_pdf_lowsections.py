# -*- coding: utf-8 -*-
"""print-notes.mjs 的智慧分頁助手：找出「起點被擠在頁尾、又被切到下一頁」的大節標題。

用法：python _pdf_lowsections.py <pdf 路徑>
  stdin  ＝ JSON 陣列，依文件順序排列的大節標題物件 {"t": 標題文字, "l": 階層(2=h2,3=h3)}
  stdout ＝ JSON 陣列，其中該被挪到新頁的標題文字子集

判定（兩條件並列，才不會把「短而已完整顯示」的節亂挪、製造半空白頁）：
  ① spill：本節（此標題～下一個「同階或更高階」標題之間，含其下子標題）內容跨到後一頁，且
  ② cramped：標題起點落在頁面下段（剩餘 < CRAMP_REMAINING，預設約 1/3~1/2 間）。
  兩者都成立才挪到新頁——「只是被切兩段但起點還很高」的長節不挪（它本來就會跨頁，讓它自然流）；
  「起點雖低但整節塞得下、沒被切開」的短節也不挪（已完整顯示，挪了只是浪費）。
  階層感知很重要：h2 底下若緊接 h3，h2 自身的引言常不跨頁，但「h2 整節（含 h3）」才是讀者眼中
  那個被擠在頁尾的新章節。最後只回傳「最外層」被切的標題（巢狀在內的子標題先不回，挪了外層後
  下一輪重新量測——外層挪到頁頂，內層多半就不再 cramped）。

純 CSS 無法依「剩餘空間／是否跨頁」條件分頁，故由外層 print-notes.mjs 量測真實分頁後注入
break-before:page 再重產，反覆到收斂（已挪到頁頂者剩餘≈滿、不再觸發 → 單調收斂）。
"""
import sys
import io
import json
import fitz

# Windows 預設用 cp950 解 stdin/stdout，會把 node 傳來的 UTF-8 中文標題解碼成亂碼 → 比對不到。
# 強制兩端都走 UTF-8（node 端 spawnSync 亦以 utf8 讀寫）。
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

MM = 72 / 25.4
TOP_MARGIN_PT = 16 * MM  # 與 tailwind.css @page margin 同步（上下 16mm）
CRAMP_REMAINING = 0.42  # 標題起點剩餘空間 < 此比例（約 1/3~1/2 間）才算「被擠在頁尾」
AT_TOP_REMAINING = 0.90  # 起點剩餘 > 此值＝已在頁頂（含已挪過去的），不再處理→收斂


def norm(s):
    return ''.join(s.split())


def main():
    pdf_path = sys.argv[1]
    headings = json.loads(sys.stdin.buffer.read().decode('utf-8'))

    doc = fitz.open(pdf_path)
    lines = []  # 依閱讀順序：(頁碼, y0, 頁高, 正規化文字)
    for pi, page in enumerate(doc):
        ph = page.rect.height
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines', []):
                text = ''.join(
                    s['text'] for s in line.get('spans', []) if s['text'].strip()
                ).strip()
                if text:
                    lines.append((pi, line['bbox'][1], ph, norm(text)))
    doc.close()
    if not lines:
        print('[]')
        return

    page_h = lines[0][2]
    bottom = page_h - TOP_MARGIN_PT
    content_h = bottom - TOP_MARGIN_PT

    # 依文件順序逐一定位標題行（整行精確相符優先，其次極短的包含相符）；cursor 只增，
    # 避免標題比對到更前面的重述（如導讀）。
    located = []  # (標題, 階層, 行索引, 頁碼, y0)
    cursor = 0
    for h in headings:
        text, level = h['t'], h['l']
        nh = norm(text)
        if not nh:
            continue
        idx = None
        for k in range(cursor, len(lines)):
            lt = lines[k][3]
            if lt == nh or (nh in lt and len(lt) < len(nh) + 6):
                idx = k
                break
        if idx is None:
            continue
        cursor = idx + 1
        located.append((text, level, idx, lines[idx][0], lines[idx][1]))

    # 階層感知的節尾：下一個「同階或更高階（level 數字 ≤）」標題的行索引。
    def section_end(i):
        level_i = located[i][1]
        for j in range(i + 1, len(located)):
            if located[j][1] <= level_i:
                return located[j][2]
        return len(lines)

    cand = []  # 被切又擠在頁尾的候選：(標題, 階層, 行索引, 節尾行索引)
    for i, (text, level, idx, p_h, y_h) in enumerate(located):
        remaining = (bottom - y_h) / content_h
        if remaining > AT_TOP_REMAINING:  # 已在頁頂（含已挪過去的）→ 不再處理
            continue
        if remaining >= CRAMP_REMAINING:  # 起點還夠高、不算被擠 → 不挪
            continue
        end = section_end(i)
        content = lines[idx + 1:end]
        if content and max(c[0] for c in content) > p_h:  # 本節（含子節）被切到後一頁
            cand.append((text, level, idx, end))

    # 只留「最外層」：丟掉巢狀在另一候選節內的子標題（挪外層後下一輪再評估內層）。
    outer = [
        (text, level)
        for (text, level, idx, end) in cand
        if not any(o_idx < idx < o_end for (_, _, o_idx, o_end) in cand)
    ]
    # 一次只處理「最高階」那層（先把所有 h2 安頓好，h3 留待下一輪依新版面重評；
    # 否則挪了外層 h2 才發現內層 h3 的 break 是多餘的，卻已無法收回 → 多出空白頁）。
    if outer:
        top_level = min(level for (_, level) in outer)
        low = [text for (text, level) in outer if level == top_level]
    else:
        low = []
    print(json.dumps(low, ensure_ascii=False))


if __name__ == '__main__':
    main()
