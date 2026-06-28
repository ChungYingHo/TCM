# -*- coding: utf-8 -*-
"""列印 PDF 逐頁驗證：產各份 4 欄縮圖 + 掃孤懸標題 + 頁數。

用法：python scripts/verify_pdf.py [pdf 根目錄] [縮圖輸出目錄]
  pdf 根目錄    預設 ~/Desktop/TCM-exports（只掃「科目/檔.pdf」一層，不遞迴——
                避免把 Aira 自己放進去的課本原檔等子資料夾也 render）
  縮圖輸出目錄  預設 <暫存>/tcm_pdf_check

機制：Read 內建的 pdftoppm 在本機不可用，故用 PyMuPDF render PNG。本腳本只「列出該看什麼」，
真正的判斷要靠人用 Read 開縮圖逐份掃（圖/公式/表/卡片有沒有被切到頁邊、有沒有半空白頁、
被挪到新頁的章節在新頁開頭是否乾淨）。孤懸標題是程式化的輔助警告。
"""
import sys
import io
import os
import glob
import tempfile
import statistics
import fitz
from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')  # Windows cp950 → 中文檔名會亂碼


def montage(doc, out_path, cols=4, dpi=80):
    thumbs = []
    for page in doc:
        pix = page.get_pixmap(dpi=dpi)
        thumbs.append(Image.frombytes('RGB', [pix.width, pix.height], pix.samples))
    if not thumbs:
        return
    rows = (len(thumbs) + cols - 1) // cols
    w = max(t.width for t in thumbs)
    h = max(t.height for t in thumbs)
    pad = 6
    canvas = Image.new('RGB', (cols * w + (cols + 1) * pad, rows * h + (rows + 1) * pad), (190, 190, 190))
    for i, t in enumerate(thumbs):
        r, c = divmod(i, cols)
        canvas.paste(t, (pad + c * (w + pad), pad + r * (h + pad)))
    canvas.save(out_path)


def orphan_headings(doc):
    """回傳孤懸標題清單：非末頁、頁面底部 12% 的最後一行是大字體（>= body*1.25）。"""
    sizes = []
    for pg in doc:
        for b in pg.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                for s in l.get('spans', []):
                    if s['text'].strip():
                        sizes.append(round(s['size'], 1))
    if not sizes:
        return []
    body = statistics.median(sizes)
    flags = []
    for i, pg in enumerate(doc):
        if i == len(doc) - 1:
            continue
        H = pg.rect.height
        spans = []
        for b in pg.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                for s in l.get('spans', []):
                    if s['text'].strip():
                        spans.append((l['bbox'][1], l['bbox'][3], s['size'], s['text'].strip()))
        if not spans:
            continue
        spans.sort()
        y1, y3, sz, txt = spans[-1]
        if sz >= body * 1.25 and y3 >= H * 0.88:
            flags.append((i + 1, txt[:30]))
    return flags


def main():
    home = os.path.expanduser('~')
    root = sys.argv[1] if len(sys.argv) > 1 else os.path.join(home, 'Desktop', 'TCM-exports')
    mont_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(tempfile.gettempdir(), 'tcm_pdf_check')
    os.makedirs(mont_dir, exist_ok=True)

    # 只掃「科目/檔.pdf」一層（不遞迴），避免把 Aira 自己放的課本原檔等子資料夾也 render。
    pdfs = sorted(glob.glob(os.path.join(root, '*', '*.pdf')))
    if not pdfs:
        print(f'找不到 PDF：{root}')
        return

    total_orphans = 0
    print(f'PDF 根目錄：{root}')
    print(f'縮圖輸出：{mont_dir}\n')
    for p in pdfs:
        doc = fitz.open(p)
        rel = os.path.relpath(p, root)
        name = rel.replace(os.sep, '__').replace('.pdf', '')
        out = os.path.join(mont_dir, name + '.png')
        montage(doc, out)
        orphans = orphan_headings(doc)
        total_orphans += len(orphans)
        flag = ''
        if orphans:
            flag += '  ⚠ 孤懸標題 ' + '；'.join(f'p{pg}「{t}」' for pg, t in orphans)
        print(f'{len(doc):2d}p  {rel}{flag}')
        print(f'      → {out}')
        doc.close()

    print(f'\n孤懸標題：{total_orphans}（須 0）。')
    print('下一步：Read 上面每張縮圖逐份掃（切頁邊？半空白頁？挪頁章節開頭乾淨？）。')


if __name__ == '__main__':
    main()
