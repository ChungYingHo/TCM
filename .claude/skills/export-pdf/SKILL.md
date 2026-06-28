---
name: export-pdf
description: 把筆記重新匯出成 iPad GoodNotes 用的列印級 PDF（到桌面 TCM-exports/），含智慧分頁與逐頁驗證。當 Aira 要「出 PDF／匯出筆記 PDF／重產列印 PDF／更新 GoodNotes 檔」，或改完筆記內容、列印 CSS 後要重產時使用。
---

# /export-pdf — 匯出列印級筆記 PDF（強制流程）

本專案 PDF 改用 **iPad GoodNotes 看（不印紙本）**。權威規則在 `CLAUDE.md`「列印 PDF 分頁（GoodNotes 版）」與 memory `pdf-print-pagination`；本檔是**流程＋驗證 checklist**，不重複規則細節，但動手前要一起讀。

每一步都要真的做，尤其**第 4 步逐頁驗證不可跳**（pdftoppm 在本機不可用，過去靠肉眼看縮圖抓到所有分頁問題）。

---

## 核心機制（先懂再動）

- **產生器**：`scripts/print-notes.mjs`（`npm run pdf`）。用 Playwright headless 開每篇筆記、套列印 CSS、注入思源宋體、`page.pdf()`。
- **輸出**：`~/Desktop/TCM-exports/`，依科目分子夾——`化學/`、`生物/`、`英文/`、`快速複習/`。檔名「序號-標題」。manifest（`NOTES` 陣列）**手動維護**，與 `src/models/notes.ts` 同步。國文目前無筆記。
- **分頁三條**：①葉級單位（圖／公式／卡片／單段／**整張表**）不被切兩半 ②標題不孤懸頁尾（`break-after:avoid`）③**擠在頁尾又被切到下頁的新章節，整節挪到新頁**。
- **第 ③ 條純 CSS 做不到**（無法依「剩餘空間／是否跨頁」條件分頁）：`print-notes.mjs` 產完一份後 spawn `scripts/_pdf_lowsections.py`（PyMuPDF）量**真實分頁**，回傳「起點剩 < ~42% **且** 整節（階層感知：h2 含其 h3）被切到後一頁」的 h2/h3 → 對該標題注入 `break-before:page` 重產 → 反覆收斂（最多 10 輪，只增不減）。

---

## 流程（五步，依序）

### 1. 起 dev server（4330）
- preview_start `tcm-dev`(4330)；或確認已有 `npm start` 跑在 4330（`curl -s -o /dev/null -w "%{http_code}" http://localhost:4330/` 應回 200）。
- 改了筆記/CSS：dev server 的 Vite HMR 會自動更新，直接重產即可（不必重啟）。
- server 在別的 port：`npm run pdf` 前設 `PDF_BASE_URL=http://localhost:<port>`。腳本會自己讀 `.env` 的 `SITE_PASSWORD` 解鎖。

### 2.（只在新增筆記時）補 manifest
- 新筆記要**先**在 `src/models/notes.ts` 註冊；再到 `scripts/print-notes.mjs` 的 `NOTES` 加一筆 `{ dir, href, file }`：`dir`＝科目或「快速複習」（速查/總表類）、`href`＝筆記路由、`file`＝輸出檔名（沿用「序號-標題」）。

### 3. 產 PDF
- 全產：`npm run pdf`。只產某科：`npm run pdf -- 生物 快速複習`（參數＝`dir`，可多個）。
- 終端逐份印「✓ … （N 節挪新頁）」。要看哪些節被挪：前面加 `PDF_DEBUG=1`（印每輪 low/fresh）。

### 4. 逐頁驗證（每次都做）
- 跑 `python scripts/verify_pdf.py`（預設掃 `~/Desktop/TCM-exports`，只掃「科目/檔.pdf」一層）。它會：產各份 4 欄縮圖、跑孤懸標題檢查、印頁數，並列出每張縮圖路徑。
- **Read 它列出的每張縮圖 PNG**，逐份掃三件事：
  1. 圖／公式／表格／卡片**沒被切到頁邊**（整張表完整、公式不破圖）。
  2. 沒有**大片半空白頁**（智慧分頁過度時會冒出來）。
  3. 被挪到新頁的章節，在新頁開頭**乾乾淨淨**、不孤懸。
- **孤懸標題檢查須 `0`**。非 0 就回去查 CSS 的 `break-after:avoid` 是否還在。
- 週期表的 118 格表獨佔一張 A4 橫向頁（`@page pt-landscape`），那頁本來就滿版，**非 bug**。

### 5. 回報
- 摘要以「**親愛的 Aira**」開頭：哪幾科／幾份、各挪了幾節、頁數、驗證結果（縮圖逐份掃過、孤懸 0）。

---

## 常見雷

- **中文亂碼**：`_pdf_lowsections.py`／`verify_pdf.py` 的 stdin/stdout **已強制 UTF-8**（Windows 預設 cp950 會把中文標題解成亂碼 → 比不到、印不出）；node 端 `spawnSync` 用 `encoding:'utf8'`。改 python 腳本勿拿掉這層。
- **分頁過度（半空白頁一堆、頁數爆增）**：`_pdf_lowsections.py` 的判定被放寬了。正解是**兩條件並列**才挪——「起點剩 < `CRAMP_REMAINING`(0.42)」**且**「整節被切到後一頁」——且**階層感知節尾**（h2 算到下一個 h2，否則 h2 引言常不跨頁會漏判 `三` 那種）、**一次只挪最外層最高階**（h2 全安頓好才評 h3，否則挪外層後內層 break 多餘卻收不回）。
- **大圖留白回來了**：有人把 `.note-sec` 加回了 `break-inside:avoid`。**勿加**——那正是 GoodNotes 版要拆掉的（會讓含大圖的整段跳次頁）。`.note-sec` 只留著做首段邊距歸零（`tailwind.css` line ~222）。
- **整張表又被切兩段**：`.prose table` 的 `break-inside:avoid` 被拿掉了，加回去（只有「比一整頁還高」的表才退而靠 `tr/thead` 列間斷、表頭每頁重複）。
- **TCM-exports 裡有 Aira 自己放的檔**（如 `生物/課本原檔/` 的 Campbell）：`verify_pdf.py` **只掃一層**故不會去 render 那上千頁；但**勿**對整個 TCM-exports 做遞迴操作。
- **改完沒重 render 就回報**：筆記是 SSR，分頁更是要看真實 PDF。一律跑完第 4 步才回報。
