# 交接文件 — 每日讀書系統（給接手的新 session）

> 這份文件讓你**乾淨接手**：先讀完「你必須先懂的架構」，再從「接下來要做的事」挑一項直接動工。
> 完整背景在 `CLAUDE.md`、設計計畫在 `C:\Users\User\.claude\plans\1-header-drifting-ripple.md`、pipeline 細節在 `pipeline/README.md`。

---

## 0. 一句話現況

把網站從「題庫」擴成「**每天打開就能直接讀書、會跟著實際進度自動調整**的讀書中樞」。功能全上線、測試全過、production build 通過。**資料是刻意的「種子／部分填充」**——基礎建設完成，內容（例句、古文、複習文章）只先放了一部分，剩下照下面的步驟補。已 commit（`feat: 每日讀書系統…`）。

---

## 1. 怎麼跑起來、怎麼驗證

```bash
npm install
npm start                 # astro dev，http://localhost:4321
npm test                  # 69 unit tests，應全過
npm run lint              # 應全綠
npm run build             # production build，應 Complete!
```

- **進站密碼**在 `.env` 的 `SITE_PASSWORD`（gitignored，別寫進任何 commit 檔）。本機未驗證者只看到 landing。
- 用 **preview MCP 工具**（`preview_start` 跑 `tcm-dev`）驗證 UI；先 `POST /api/unlock` 帶密碼拿 cookie 再導頁。
- **注意快取陷阱**：`/api/data/[school]` 回 `cache-control: max-age=3600`，改過題庫資料（如 era）後瀏覽器會拿到舊資料最多 1 小時。測試時用 `fetch(url,{cache:'reload'})` 預熱，或換無痕。`<select bind:value>` 在 Svelte 5 要派 **`change`** 事件才會更新（不是 `input`）。
- `preview_screenshot` 在這環境會 timeout（renderer 問題，非頁面問題）——改用 `preview_snapshot`（文字樹）驗證。

---

## 2. 你必須先懂的架構（動「每日複習」前必讀）

**日程是「游標／pace 模型」，不是固定日曆。** 別把它當成「某天 = 某些固定內容」。

- `src/data/schedule.json` 只存：**排序好的軌道**（`tracks.vocab` 依詞頻、`tracks.notes` 依 `TAXONOMY` 教學順序、`tracks.classics` 依考點關聯）＋ **每日目標 `perDay`** ＋ **節奏 `rhythm`** ＋ 每個考點的 **考題候選池 `quizPoolByTag`** ＋ **複習文章 `reviews`**。
- **「今天要讀什麼」= 從你的實際游標往後切片**。游標由 `src/utils/studyCursor.ts#deriveCursors` **純函數推導自完成紀錄**（`tcm.dailyplan.v1`），不另存。所以：忙/累少讀 → 游標不前進 → 明天接續；衝刺 → 游標跳前 → 提早完課。**沒有「某天的計畫」會脫節**。
- **`src/utils/studyPlan.ts#computeToday` 是共用大腦**，被 `DailyPlan.svelte`、`HomeDashboard.svelte`、`/api/progress-summary` 三處共用——改它三處一起變。
- **人性化節奏**在 `src/utils/date.ts`：每週日輕量日（只複習）、約每 4 週一放空日、考前 14 天 taper；**pace 只算「全強度日」**，所以輕量/放空日不會害你被判落後，也不中斷連續天數。
- **資料流**：靜態 JSON（`src/data/*.json`）＋ localStorage（`tcm.*`）＋ 雲端 KV 背景同步（`cloud.ts` → `/api/state`）。同步欄位：`wrongbook/progress/streak/plan/vocabSrs`。

**筆記的現況**（容易誤會）：使用者「自己打字的個人筆記」已**移除**（`utils/notes.ts`、`PersonalNotes`、題目上的 ✎筆記 都刪了）。**69 篇考點筆記文章＋ `/notes` 頁保留**，並改由每日計畫的 dialog 用 `/notes/[slug]?embed=1` 的 **iframe** 帶出（`NoteDialog.svelte` + `openNote()`）。

---

## 3. 接下來要做的事（依優先序，可直接動工）

### ⭐ A. 補滿單字例句（最高價值，目前 45 / 3215）
音標與中文是 ECDICT 權威來源；**例句**是 LLM 草稿、目前只填了最常考的 45 字。例句存在 **`pipeline/data/vocab_examples.json`**（已 commit，key = 單字，value = `{example, example_zh}`），合併後寫進 `src/data/vocab.json`，每筆 `draft:true`、UI 顯示「AI 草稿例句」。

**做法一（有 API key，最快）：**
```bash
ANTHROPIC_API_KEY=sk-... python pipeline/gen_vocab_examples.py --fill 3000
# 會分批呼叫 API、寫進 cache（每批 checkpoint），再合併出 vocab.json
```
> 上次 session 環境只有 `ANTHROPIC_BASE_URL`、沒有可用 key，所以沒跑。確認 key 可用再跑。

**做法二（自己分批寫，不需 API、不需 ECDICT）：**
```bash
# 1) 列出接下來 50 個沒例句的字（讀 src/data/vocab.json，不需 vocab_base）
python -c "import json; d=json.load(open('src/data/vocab.json',encoding='utf-8')); todo=[w for w in d['words'] if not w['example']][:50]; open('pipeline/out/_todo.txt','w',encoding='utf-8').write(chr(10).join(w['word']+chr(9)+w['zh'] for w in todo)); print('wrote',len(todo))"
# 2) 讀 pipeline/out/_todo.txt，幫每個字寫一句自然例句＋繁中翻譯，加進 pipeline/data/vocab_examples.json
# 3) 合併（會自動 fallback 用 vocab.json 當 base，不需 ECDICT）：
python pipeline/gen_vocab_examples.py
# 4) 驗證
python -c "import json; d=json.load(open('src/data/vocab.json',encoding='utf-8')); print('withExamples', d['withExamples'], '/', d['count'])"
```
重複 1–4 直到補完。**重排名不會弄丟例句**（cache 以單字為 key）。風格參考已寫的 45 字：句子要讓字義一看就懂，繁中翻譯自然。

### ⭐ B. 擴充古文（目前 9 篇 → 目標 60–80 篇《古文觀止》）
新增到 **`pipeline/data/guwen_seed.json`**（schema 看現有 9 篇：`id/title/author/dynasty/era/source/tags/original/translation/annotation[]`）。`original` 用公共領域原文（權威）、`translation`＋`annotation` 是你寫的草稿（會標 `draft:true`）。**依時代分析權重優先補**：先秦最多（49%），其次唐／魏晉南北朝／宋。`era` 要用這幾個 bucket 之一：`先秦/漢/魏晉南北朝/唐/宋/元/明/清/近現代`。
```bash
python pipeline/gen_classics.py      # 重算 examRelevance、輸出 src/data/classics.json
python pipeline/gen_schedule.py      # 古文軌道會更新
```

### B'. 多寫複習文章（目前 2 篇）
在 `src/content/notes/` 加 `kind: review` 的 MDX（看 `review-chem-atoms.mdx`、`review-cn-words.mdx`）。`covers:` 列出涵蓋的考點 tag。寫完跑 `python pipeline/gen_schedule.py`（會掃進 `schedule.json.reviews`，輕量日自動帶出）。建議每科再補 2–3 篇。

### C.（選用，效能）vocab.json 改 lazy-load
`src/data/vocab.json`（約 916KB／gzip 199KB）目前靜態 import 進首頁/今日複習/單字頁，是最大 chunk。可改成 runtime `fetch('/data/vocab.json')` 或拆「索引＋詳情」。手機一次性快取尚可接受，但值得優化。

### D.（選用）提高 era 覆蓋率（目前可判定 22%）
擴充 `pipeline/data/author_dynasty.json`（作者全名／名篇 → 朝代），或對特定題加 `pipeline/overrides/era.json`（若要做覆寫機制需接 `gen_era.py`）。維持「高精準、低召回」原則：只用 ≥2 字的作者/篇名，命中朝代不一致就維持 `null`。改完 `python pipeline/gen_era.py`。

### E.（建議）跑一次正式審查
依 `CLAUDE.md` 規範，對這批大改動跑 `/code-review`、UI 用設計 skill 評審。上一手做了 lint＋69 測試＋build＋逐頁實測，但規模大值得再過一輪。

---

## 4. 資料重新產生（cheatsheet）

ECDICT（約 66MB）是 **gitignored**，clone 後要重抓才能重產單字 base：
```bash
mkdir -p pipeline/data
python -c "import urllib.request as u; u.urlretrieve('https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv','pipeline/data/ecdict.csv')"
python -m pip install opencc        # 簡轉繁
# 產生順序：
python pipeline/gen_vocab_ecdict.py    # → pipeline/out/vocab_base.json（音標/繁中/GRE-TOEFL/後中考過）
python pipeline/gen_vocab_examples.py  # 併例句 → src/data/vocab.json
python pipeline/gen_classics.py        # → src/data/classics.json
python pipeline/gen_era.py             # 國文題加 era（要在 build.py 之後跑，因 build 會重寫 shards）
python pipeline/gen_schedule.py        # → src/data/schedule.json
```
> 只補例句／古文／複習文章時，**不需要**重抓 ECDICT（gen_vocab_examples 會 fallback 用 vocab.json；gen_classics/gen_schedule 不依賴 ECDICT）。

---

## 5. 看學習進度 ＋ 調整後續日程（未來任一 session 都能做）

進度背景同步到雲端 KV。**只讀**撈摘要（免登入 cookie，用站台密碼自驗）：
```bash
curl -H "x-tcm-key: $SITE_PASSWORD" https://<你的網站>/api/progress-summary
```
回傳：考試倒數、各軌進度與超前/落後、近 14 天活動、弱點考點、答對率、今日內容預覽。
**要調整步調**（例如某科持續落後想加重、想改每日字數）：改 `pipeline/gen_schedule.py` 的 `PER_DAY`／`RHYTHM`／排序 → 重跑 `gen_schedule.py` → commit + push（Vercel 自動重佈）。因內容是游標驅動，一般步調漂移**免重排**。

---

## 6. 關鍵檔案地圖

| 區塊 | 檔案 |
|---|---|
| 每日讀書頁 | `src/components/review/DailyPlan.svelte`（＋`DueQuestions`/`QuizQuestions`）、`src/pages/review/index.astro` |
| 排程大腦 | `src/utils/studyPlan.ts`、`studyCursor.ts`、`date.ts`（rhythm）、`dailyPlan.ts`、`vocabSrs.ts` |
| 單字 | `src/components/vocab/{VocabApp,VocabCard,VocabStudy}.svelte`、`src/models/vocab.ts`、`src/data/vocab.json` |
| 古文 | `src/components/classics/{ClassicsList,ClassicReader}.svelte`、`src/pages/classics/`、`src/models/classics.ts`、`src/data/classics.json` |
| 時代分析 | `src/utils/analytics.ts#eraDistribution`、`AnalyticsApp.svelte`、題目 `era` 欄 |
| 筆記 dialog | `src/components/common/{Modal,NoteDialog}.svelte`、`src/utils/noteDialog.ts`、`src/layouts/NoteEmbedLayout.astro`、`src/pages/notes/[...slug].astro`（`?embed=1`） |
| 進度 API | `src/pages/api/progress-summary.ts`、`src/utils/publicPaths.ts` |
| Header/首頁 | `src/components/common/NavBar.astro`（葉子 logo）、`src/components/home/HomeDashboard.svelte` |
| Pipeline | `pipeline/gen_vocab_ecdict.py`/`gen_vocab_examples.py`/`gen_classics.py`/`gen_era.py`/`gen_schedule.py`、`pipeline/tcmpipe/era.py`、`pipeline/data/{author_dynasty,guwen_seed,vocab_examples}.json` |

---

## 7. 工作規範（沿用 CLAUDE.md）

- 直接在 **main** 上做、用 **npm**；Astro + Svelte 5 runes + Tailwind 4 + DaisyUI。
- ESLint：單引號、無分號、2 空格、`eqeqeq`、`prefer-const`、**只走 `@/*` alias**、inline type-import。
- **正確答案不依賴 LLM**；LLM 只做非關鍵輔助（例句、古文翻譯、概念標籤），且**一律標 `draft:true` ＋「AI 草稿」**。
- UI/UX 一級要求、mobile-first；每階段回報前先 code review + refactor，回報以「**親愛的 Aira**」開頭。
