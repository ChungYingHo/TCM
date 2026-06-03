# CLAUDE.md — 學士後中醫考古題系統

本專案把三校（CMU 中國醫 / ISU 義守 / TCU 慈濟）104–115 年的學士後中醫考古題與解答，轉成一個可針對性複習的系統（題庫刷題 + 考點趨勢 + 知識筆記）。

## 工作流程規範（務必遵守）

1. **每次工作結束**都要做一段工作摘要彙報，且**必須以「親愛的 Aira」開頭**。
2. **每個工作階段在回報前**，先做 **code review + refactor**（用 `/code-review` 與 `/simplify`，UI 相關用設計 skill 評審），確保專案不因分階段開發而風格/結構不一致。
3. **UI/UX 與 RWD 是一級要求**：所有畫面從一開始就以 **mobile-first 響應式**與設計品質開發，不留到最後補。每天會用 4–6 小時、且常在手機/平板上刷題。
4. **正確性不可依賴 LLM**：題目「正確答案」只由答案卡 + 釋疑（errata）決定；LLM 只做非關鍵的概念標籤與筆記草稿，且不得用來辨識化學結構/圖表。
5. **學校資料隔離**：資料、圖片、索引、overrides 一律 per-school 分片，一校資料壞掉不可汙染其他校。

## 程式風格（沿用 Desktop/Aira/Jeremy-and-Aira）

- 套件管理：**npm**。技術棧：Astro + Svelte 5 + TypeScript + Tailwind 4 + DaisyUI + `@astrojs/vercel`。
- ESLint 9 flat config：**單引號、無分號、2 空格縮排、`eqeqeq`、`prefer-const`、禁相對 import（一律走 `@/*` alias）、inline type-imports**。
- `tsconfig` 繼承 `astro/tsconfigs/strict`，alias `@/*` → `src/*`。共用型別放 `src/models/`、共用函數放 `src/utils/`，能抽就抽。
- 平時以 **`npm start`** 啟動開發伺服器（= `astro dev`）。
- 需有 **unit test（Vitest / pytest）** 與 **E2E（Playwright）**。

## 進站密碼

伺服器端 cookie 閘門，密碼**不寫死在程式裡**：放在環境變數 `SITE_PASSWORD`（明文；本機 `.env`／Vercel 環境變數，不進 repo、不進資料庫）。另須設 `AUTH_SECRET` 簽 cookie（公開部署必設，否則可偽造）。未驗證者只看到展示用 landing 頁。

## 重要技術事實（Phase 0 實測修正）

- **中文可用 PyMuPDF 抽取**（三校皆可）。先前「CJK 不可抽」是本機 Xpdf 4.00 `pdftotext` 的限制，**非** PyMuPDF。
- 因此採**文字 + 圖片混合**：抽取題幹文字、選項文字、答案、釋疑理由（供搜尋/標籤/選項/詳解）；同時**渲染每題截圖供忠實顯示**（化學結構/圖表恆正確、且永不被 LLM 解讀）。
- 釋疑檔為結構化表格（考科/題號/釋疑理由/釋疑結果/修正答案），errata 可靠解析並保留 `original_answer`。

## 結構

- 資料 PDF：`<SCHOOL>/<YEAR>/pre-exams|answers/*.pdf`（見 [README.md](README.md)）。原始檔備份於 `_archive/`。
- 資料 pipeline：`pipeline/`（Python；PyMuPDF 渲染 + 切題、答案/釋疑解析、標籤）。
- 網站：Astro 專案（`src/`），消費 pipeline 產出的靜態 JSON + 圖片，無資料庫。

詳細實作計畫見 plan 檔。
