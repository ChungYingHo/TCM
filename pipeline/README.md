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
