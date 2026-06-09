# 資料處理 Pipeline

把三校 PDF 轉成網站用的靜態資料：`src/data/<school>.json`（題庫分片）、`src/data/index/<school>.idx.json`（查詢索引）、`public/q/**`（每題截圖）。

## 核心原則
- **正確答案不依賴 LLM**：只由答案卡（`answers/`）+ 釋疑（`clarification.pdf`）決定。
- **文字 + 圖片混合**：用 PyMuPDF 抽取題幹/選項/答案/釋疑文字（供搜尋、標籤、選項、詳解）；同時渲染每題截圖供忠實顯示（化學結構/圖表恆正確，永不被 LLM 解讀）。
- **學校資料隔離**：per-school 分片，互不汙染。

## 執行
```bash
python -m pip install pymupdf pillow pydantic
python -m tcmpipe.build            # 全部三校
python -m tcmpipe.build ISU        # 單一學校
```
產物：`src/data/*.json`、`public/q/**`、`pipeline/out/qa/*.json`（品質報告）。

## 模組
- `extract.py` 渲染 + 切題（題號錨點）+ 抽取題幹/選項
- `answers.py` 三校答案卡解析（自動辨識 `N L` 與 TCU 的「數字列＋字母列」格式）
- `errata.py` 釋疑表格解析（保守覆寫，永遠保留 `original_answer`）
- `tags.py` 離線關鍵字標籤（受控詞彙，無 API 依賴、無幻覺）
- `build.py` 編排 + 合併 + 輸出 + 去重 + QA

## 已知缺口（由 QA 報告標記 `needs_review`）
- **107 學年度的答案是掃描影像（無文字層）**：CMU、ISU 該年題目有了、但答案待補。可日後 OCR 或在 `pipeline/overrides/<school>.json` 手動補上。TCU 107 為文字檔，正常。
- **英文閱讀測驗**部分子題（題號在閱讀段落下方）未被切出：題目可能缺幾題，答案不受影響。
- **重複題號**：少數年份因雜散錨點產生重複題號，已自動加後綴並標記 `needs_review`。

## 人工修正（Overrides）
`pipeline/overrides/<school>.json`：`{ "<question id>": { 欄位: 值 } }`。在 `build_dataset` 最後套用、跨重跑保留。例如補 107 答案：
```json
{ "ISU-107-chemistry-1": { "correct_answer": ["B"], "needs_review": false } }
```

---

# 讀書系統資料（單字 / 古文 / 日程 / 時代）

題庫之外，網站的「每日讀書計畫」「單字表」「古文選讀」「時代分析」也吃靜態資料，由下列腳本產生。**LLM 只做非關鍵輔助（例句、白話翻譯、概念標籤），正確答案永不依賴 LLM。**

## 一次性下載（gitignored，不進 repo）
- **ECDICT**（英中字典，約 66MB，含 GRE/TOEFL 標記＋音標＋中譯）：
  ```bash
  mkdir -p pipeline/data
  python -c "import urllib.request as u; u.urlretrieve('https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv','pipeline/data/ecdict.csv')"
  python -m pip install opencc   # 簡轉繁（s2twp，台灣用詞）
  ```

## 產生順序
```bash
python pipeline/gen_vocab_ecdict.py      # ECDICT → pipeline/out/vocab_base.json（音標/中譯/GRE-TOEFL/後中考過次數）
python pipeline/gen_vocab_examples.py    # 併例句快取 → src/data/vocab.json（例句缺的可日後補）
python pipeline/gen_classics.py          # 古文觀止精選 → src/data/classics.json
python pipeline/gen_era.py               # 國文題加 era 欄（時代分析，需在 build 之後）
python pipeline/gen_schedule.py          # → src/data/schedule.json（軌道排序＋pace＋每日考題池＋複習文章）
```

## 例句補齊（3000 字）
`src/data/vocab.json` 的例句是 LLM 草稿（`draft:true`、UI 標「AI 草稿例句」），存在 `pipeline/data/vocab_examples.json`（已 commit，重排名不會弄丟）。補齊全部：
```bash
ANTHROPIC_API_KEY=sk-... python pipeline/gen_vocab_examples.py --fill 3000
```

## 時代分析（era）
- `pipeline/data/author_dynasty.json`：作者/名篇 → 朝代對照表（高精準、低召回）。
- `pipeline/tcmpipe/era.py`：只在命中的作者/篇名「一致指向同一朝代」時才標註，否則 `null`。
- 改對照表後重跑 `python pipeline/gen_era.py`。

## 日程是「游標 / pace 模型」，不是固定日曆
`schedule.json` 只存**內容排序＋每日目標＋人性化節奏**；每天實際內容由前端依使用者「實際完成進度（游標）」切片，所以忙/衝刺自動吸收。`rhythm`：每週一輕量日（只複習）、約每 4 週一放空日、考前兩週 taper；pace 以「全強度讀書日」計。

## 看學習情況 ＋ 後續日程調整（給未來任一 session）
進度背景同步到雲端 KV。任何 session 都能**只讀**撈取學習摘要（免登入 cookie，用站台密碼自驗）：
```bash
curl -H "x-tcm-key: $SITE_PASSWORD" https://<site>/api/progress-summary
```
回傳：考試倒數、各軌進度與超前/落後、近 14 天活動、弱點考點、答對率、今日內容預覽。
**要調整後續日程**（例如某科持續落後想加重）：① 撈 summary ② 改 `gen_schedule.py` 的 `PER_DAY`／排序，重跑 `gen_schedule.py` ③ commit + push（Vercel 自動重佈）。因內容是游標驅動，一般步調漂移免重排。

## 複習文章
`src/content/notes/*.mdx` 中 `kind: review` 的是跨考點複習摘要（`covers` 列涵蓋考點）。`gen_schedule.py` 會掃描並填入 `schedule.json.reviews`，輕量日於每日計畫帶出。
