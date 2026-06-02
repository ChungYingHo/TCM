# 學士後中醫考古題系統（中國醫 / 義守 / 慈濟）

三校學士後中醫入學考試的歷年（104–115）試題、參考答案與釋疑，整理成一個可針對性複習的網站：依學校/年份/科目/考點標籤刷題、模擬考計分、錯題本、考點趨勢與白話知識筆記。

## 系統組成
- **資料 pipeline**（[`pipeline/`](pipeline/README.md)）：PDF → `src/data/<school>.json` + `public/q/**` 題目截圖。正確答案只由答案卡 + 釋疑決定，不依賴 LLM。
- **網站**（Astro + Svelte + TS + Tailwind/DaisyUI，部署 Vercel）：伺服器端密碼閘門，無資料庫（資料為靜態 JSON）。
- 詳細實作見 plan 檔與 [CLAUDE.md](CLAUDE.md)。

## 本機開發
```bash
npm install
SITE_PASSWORD=jeremy850916 AUTH_SECRET=<隨機字串> npm start   # http://localhost:4321
npm test          # 單元測試 (Vitest)
npm run test:e2e  # E2E (Playwright)
npm run build     # 正式建置 (Vercel)
```
部署到 Vercel 時，在環境變數設定 `SITE_PASSWORD`、`AUTH_SECRET`。

---

## 原始資料整理

三校歷年試題、參考答案與釋疑公告，已整理為統一結構（全英文檔名，相容 iOS GitHub App）。

## 資料夾結構

```
<SCHOOL>/<YEAR>/pre-exams/<exam>.pdf     # 試題
<SCHOOL>/<YEAR>/answers/<answer>.pdf      # 參考答案 + 釋疑
```

- `SCHOOL`：`CMU`（中國醫藥大學）、`ISU`（義守大學）、`TCU`（慈濟大學）
- `YEAR`：民國年 104–115
- 每個年度再分 `pre-exams/`（試題）與 `answers/`（參考答案、釋疑公告）兩個子資料夾。

## 檔名規則

| 檔名 | 內容 |
|------|------|
| `exam_chemistry.pdf` / `exam_chinese.pdf` / `exam_biology.pdf` / `exam_english.pdf` | 各科**試題**（化學 / 國文 / 生物學 / 英文） |
| `exam_all.pdf` | 四科**合一**的試題（義守為此型） |
| `answer_chemistry.pdf` … `answer_english.pdf` | 各科**參考答案** |
| `answer_all.pdf` | 合併在一個檔的參考答案 |
| `clarification.pdf` | **釋疑 / 疑義公告**（答案更正、爭議題說明） |

科目代碼：`chemistry`=化學、`chinese`=國文、`biology`=生物學、`english`=英文、`all`=多科合一。

`exam_*.pdf` 一律放在 `pre-exams/`；`answer_*.pdf` 與 `clarification.pdf` 一律放在 `answers/`。

範例（`CMU/115/`）：
```
CMU/115/
├── pre-exams/
│   ├── exam_chemistry.pdf
│   ├── exam_chinese.pdf
│   ├── exam_biology.pdf
│   └── exam_english.pdf
└── answers/
    ├── answer_chemistry.pdf
    ├── answer_chinese.pdf
    ├── answer_biology.pdf
    ├── answer_english.pdf
    └── clarification.pdf
```

## 各校格式差異（重要：寫 code 處理時請注意）

| 類別 | CMU 中國醫 | ISU 義守 | TCU 慈濟 |
|------|-----------|---------|---------|
| **試題** | 分科 4 檔 | **單一 `exam_all.pdf`（四科合一）** | 分科 4 檔 |
| **答案** | 多數年份為 `answer_all.pdf`（合併）；**107、115 為分科 4 檔**（107 另含一份合併 `answer_all.pdf`） | `answer_all.pdf`（合併） | 分科 4 檔 |
| **釋疑** | 每年 `clarification.pdf` | 每年 `clarification.pdf`（**106 缺**） | 每年 `clarification.pdf` |

### 特例
- **ISU/106**：原始壓縮檔含兩個內容不同的答案檔，保留為 `answer_all.pdf` 與 `answer_all_v2.pdf`；該年無釋疑檔。
- 義守試題與多數 CMU 答案是「四科合一」的單一 PDF，若要分科處理需先依科目切分頁面。

## 原始檔

所有原始 zip / PDF（各校公布時的原始格式）保留於 `_archive/`，未刪除，可隨時回溯。為相容 iOS GitHub App，原本唯一的中文檔名 `115義守試題公告(全).pdf` 已改名為 `115Yishou.pdf`（沿用同資料夾命名慣例），其餘原始檔皆維持公布時的檔名。

## 檔案統計

- CMU：79 個 PDF
- ISU：36 個 PDF
- TCU：108 個 PDF
- 涵蓋年度：104–115（共 12 年）
