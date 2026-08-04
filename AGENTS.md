# AGENTS.md — 學士後中醫考古題系統

本專案把三校（CMU 中國醫 / ISU 義守 / TCU 慈濟）104–115 年的學士後中醫考古題與解答，轉成一個可針對性複習的系統（題庫刷題 + 考點趨勢 + 知識筆記）。

## 工作流程規範（務必遵守）

1. **每次工作結束**都要做一段工作摘要彙報，且**必須以「親愛的 Aira」開頭**。
2. **每個工作階段在回報前**，先完成 **code review + refactor**，修正審查發現，並用 `simplify` skill 消除不必要的複雜度；UI 相關另用設計 skill 評審。無論平台是否提供 `code-review`、`simplify` 或設計 skill，前述品質結果都是必達，確保專案不因分階段開發而風格/結構不一致。
3. **UI/UX 與 RWD 是一級要求**：所有畫面從一開始就以 **mobile-first 響應式**與設計品質開發，不留到最後補。每天會用 4–6 小時、且常在手機/平板上刷題。
4. **正確性不可依賴 LLM**：題目「正確答案」只由答案卡 + 釋疑（errata）決定；LLM 只做非關鍵的概念標籤與筆記草稿，且不得用來辨識化學結構/圖表。
5. **學校資料隔離**：資料、圖片、索引、overrides 一律 per-school 分片，一校資料壞掉不可汙染其他校。
6. **例行工作走強制 skill 入口**：寫新筆記、或改動筆記的節結構／新增節／重寫整節以上 → `note` skill；上架字首單字 → `vocab` skill；重產列印 PDF → `export-pdf` skill。先依同名 skill 的完整流程執行再動手；若平台不能直接呼叫 skill，就讀取該平台的同名 skill adapter 並逐步完成，不憑記憶重建流程。（只改單一表格／錯字／一句話這類局部修補不必走 skill，但仍照下方驗法表驗證。）

## 筆記撰寫規範（務必遵守）

1. **所有數值計算一律用 unit factor（因次分析）**：寫成「已知量 × (目標單位 / 已知單位)」的連乘分數，分子分母都帶單位，標出上下相消，最後只剩目標單位。**不可只寫「代入公式得答案」**；多步驟一律橫著連乘到底再算。溫度有偏移量（+273）不適用乘法因子，需特別標註。典型範例：紅血球→鐵原子、H₂SO₄ g→mol、能量／壓力單位互換（詳見 memory `unit-factor-notes-standard`）。
2. **化學式/算式/公式：網頁與 PDF 必須一致且都正確**。統一用 KaTeX；含狀態/箭頭/電荷的化學方程式用 **mhchem `\ce{}`**（已於 `astro.config.mjs` 啟用），輸出純 HTML+CSS、兩邊共用同一份 KaTeX CSS。簡單下標（H₂O）可用 Unicode。每篇改完都要**真的 render**（筆記是 SSR）確認無 `katex-error`、公式無破圖。
   - **分數一律用 `\dfrac` 的完整橫線，不准出現 inline 的 `÷` 或當除號用的 `/`**（Aira 2026-08-05：「我寧願空間大一點寫出完整的那條橫線」）。除法要寫成**乘以分數**（`÷M` → $\times\frac{1}{M}$）。單位符號（kJ/mol、m/s）、指數裡的分數（$^{3/2}$）、表「或」的斜線（O₂/O₃）不在此限。
   - **必背卡（`Memorize`）的公式也走 KaTeX**：直接在 items 裡寫 `$…$`，伺服器端會渲染（`utils/mathHtml.ts`）。`<code>` 只留給非數學的字面值（單位、`[Ar]4s¹3d⁵`）。⚠️ items 是雙引號 JSX 字串，**反斜線一律寫兩個**（`\\dfrac`）——只寫一個會安靜壞掉，由 `notes.test.ts` 守。
3. **知識正確性**：化學事實/數據對照課本＋自行搜尋網路可靠來源（教科書、NIST、IUPAC…）逐項查證，**不以 LLM 記憶為準**；結構/圖一律對照、不由 LLM 判讀。可依教學判斷主動補充常考/易混淆內容。
4. **列印 PDF（2026-06-28 起 GoodNotes 版，不印紙本）**：PDF 正常輸出、允許段落自然跨頁（`.note-sec` 不綁 `break-inside: avoid`），只保三條：①葉級閱讀單位（圖／公式／例題卡／單段／**整張表**）不被切成兩半；②標題不孤懸頁尾（`break-after: avoid`）；③新章節擠在頁尾又被切到下頁時，整節挪到新頁（純 CSS 做不到，由腳本量測真實分頁後注入 `break-before: page`）。輸出到**桌面 `TCM-exports/`**（依科目／快速複習分子資料夾，非 repo 內）。**重產與逐頁驗證一律走 `export-pdf` skill**（產生機制、常見雷、驗證 checklist 的完整細節都在該 skill 檔），不可只產不驗。

**以下 5–9 為 prose 寫作風格**（對象是「忘光的初學者」；完整版與範例見 memory `notes-writing-style`）：

5. **術語第一次出現就定義**：完整中文＋英文＋縮寫＋一句白話（範本：「游離能（Ionization Energy，IE）是把原子最外層電子拔掉所需的能量。」）。**表格／互動元件裡用到的術語、符號、記號（[Ar]、↑↓、p³、Å、eV…）必先在散文定義過**，不可先用後定義；**先講機制（為什麼成立）再套用**，勿斷言規則就立刻拿來用。
6. **白話＝精準好讀的定義，不是廢話填充**。剔除 **AI 腔**（「動手玩玩看」「跟著走就會」「其實…」）與**元敘述開場白**（「本篇考點集中在…」「一次理清」）——整篇都是考點，直接進內容，語氣像乾淨的教科書／犀利的人類老師。「不夠詳細」指缺定義／缺「為什麼」，補實質不是堆字。
7. **速查化**：能用**條列／表格**呈現就別寫長段落；**能用推導／計算取代死背就教方法**（如溫標換算教「兩參考點比例相同」的線性法，而非三條死公式）；**每段步驟／公式旁放即時 worked example（callout）**示範，篇末另放互動例題作練習。
8. **完稿後以「全篇、一次」用純初學者視角自審**：逐節、表格、引言、例題、元件說明全讀過，列出**所有**未定義術語／未解釋符號／前向引用／缺「為什麼」／AI 腔，一次全修——勿只修使用者剛好指到的那一處（同類問題不該被抓第二次）。
9. **結構與元件沿用黃金範本**：**NoteStats 後直接進 `## 一`（不放脈絡／roadmap 開場，Aira 2026-07-04）** → 每概念一個 `##` 大節（一、二、三…）→ 白話解釋在公式前 → 例題用互動 `ExampleQuestion`（選→對→解析）→ 篇末**必背只放一個表格式 `Memorize`**（不分兩塊、不放解題方向）。既有元件（`NoteStats`／`Memorize`／`ExampleQuestion`／`WorkedExample`／`VseprShapes`…）**一律重用勿另造**（`KeyPoints`／`SolveApproach` 2026-07-04 已刪）。

## 程式風格（沿用 Desktop/Aira/Jeremy-and-Aira）

- 套件管理：**npm**。技術棧：Astro + Svelte 5 + TypeScript + Tailwind 4 + DaisyUI + `@astrojs/vercel`。
- ESLint 9 flat config：**單引號、無分號、2 空格縮排、`eqeqeq`、`prefer-const`、禁相對 import（一律走 `@/*` alias）、inline type-imports**。
- `tsconfig` 繼承 `astro/tsconfigs/strict`，alias `@/*` → `src/*`。共用型別放 `src/models/`、共用函數放 `src/utils/`，能抽就抽。
- 平時以 **`npm start`** 啟動開發伺服器（= `astro dev`）。
- 需有 **unit test（Vitest / pytest）** 與 **E2E（Playwright）**。

## 驗法（綠燈，改動後必跑）

| 改動類型 | 必跑 |
| :--- | :--- |
| 任何前端／TS 改動 | `npm run lint`＋`npm run typecheck`＋`npm test`（三者零錯誤） |
| **push 前（任何改動）** | **`npm run build` 必須成功**。lint／typecheck／`astro check`／vitest 全綠**仍可能** build 紅燈（MDX 的 acorn 解析錯誤只有 build 抓得到），Vercel 就是跑這個 |
| pipeline（Python）改動 | `cd pipeline && python -m pytest` |
| 筆記／MDX 改動 | 真的 SSR render：dev server（port 4330）→ 用 `.env` 的 `SITE_PASSWORD` POST `/api/unlock` → fetch 該頁須 **200 且 0 個 `katex-error`**。`astro check` 全綠**不代表**不會 SSR 500（裸 `<字母` 會被當 JSX），散文比較符號寫 `&lt;`/`&gt;` |
| **用腳本批次改 MDX** | marker 必須整行精確比對，且先 assert `lines.count(marker) == 1`；只比對片段會改到同字串的其他出現處，且被改壞的區段不會有任何測試抓到 |
| UI／版面改動 | 375px 手機寬＋最極端真實資料（長字串、空資料、超多筆）實際 render，不可只 code review |
| 列印 PDF 相關改動 | 走 `export-pdf` skill 的逐頁驗證步驟 |

驗收對照「當初的驗收條件」逐條打勾，不是對照「自己做了什麼」。

## 進站密碼

伺服器端 cookie 閘門，密碼**不寫死在程式裡**：放在環境變數 `SITE_PASSWORD`（明文；本機 `.env`／Vercel 環境變數，不進 repo、不進資料庫）。另須設 `AUTH_SECRET` 簽 cookie（公開部署必設，否則可偽造）。未驗證者只看到展示用 landing 頁。

## 重要技術事實（Phase 0 實測修正）

- **中文可用 PyMuPDF 抽取**（三校皆可）。先前「CJK 不可抽」是本機 Xpdf 4.00 `pdftotext` 的限制，**非** PyMuPDF。
- 因此採**文字 + 圖片混合**：抽取題幹文字、選項文字、答案、釋疑理由（供搜尋/標籤/選項/詳解）；同時**渲染每題截圖供忠實顯示**（化學結構/圖表恆正確、且永不被 LLM 解讀）。
- 釋疑檔為結構化表格（考科/題號/釋疑理由/釋疑結果/修正答案），errata 可靠解析並保留 `original_answer`。

## 結構

- 資料 PDF：`exams/<SCHOOL>/<YEAR>/pre-exams|answers/*.pdf`（見 [README.md](README.md)）。原始檔備份於 `_archive/`。
- 資料 pipeline：`pipeline/`（Python；PyMuPDF 渲染 + 切題、答案/釋疑解析、標籤）。
- 網站：Astro 專案（`src/`），消費 pipeline 產出的靜態 JSON + 圖片，無資料庫。

詳細實作計畫見 plan 檔。
