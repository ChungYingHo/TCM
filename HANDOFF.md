# 交接文件 — 每日讀書系統（給接手的新 session）

> 這份文件讓你**乾淨接手**：先讀完「你必須先懂的架構」，再從「接下來要做的事」挑一項直接動工。
> 完整背景在 `CLAUDE.md`、設計計畫在 `C:\Users\User\.claude\plans\1-header-drifting-ripple.md`、pipeline 細節在 `pipeline/README.md`。

---

## 0. 一句話現況

把網站從「題庫」擴成「**每天打開就能直接讀書、會跟著實際進度自動調整**的讀書中樞」。功能全上線、測試全過（74 unit tests）、production build 通過。**資料是刻意的「種子／部分填充」**——基礎建設完成，內容（例句、古文、複習文章）只先放了一部分，剩下照下面的步驟補。已 commit（`feat: 每日讀書系統…`）。

> **2026-06-10 二次知識複審＋全修**（報告：`知識驗證/複審報告.md`）。修了：① 古文 6 筆注音/用字（教育部辭典查證）＋胡越回改＋編輯級體例；② 單字 4 句例句、並把選字規則改成「曾為考題正解的字一律收錄」→ 缺字缺口 324→49（餘 49 皆 trivial 或 OCR 錯字）、單字總量 cap 3240、考過字覆蓋 694→1183；③ 程式：考前 14 天 taper 真的停發新單字、每日複習頁的「複習單字」改成可翻卡評分（修好 SRS 死鏈：以前到期字永不消化）、每日新字 16→18（剛好 taper 前學完全部）、reviewVocabMax 70→100、移除無作用的 `classicEveryNDays`、「距考試」改「距完課」並標實際考試 2027/3–4。新增 `pipeline/data/vocab_zh_overrides.json`（ECDICT 釋義補義層，重產不丟）與 `src/utils/studyPlan.test.ts`。

> **2026-06-10 補英/國筆記過少**：英文 9→15、國文 12→15（每日考點輪替從 9/12 天延長到 15 天）。新增英文 6 篇（假設語氣、動名詞與不定詞、主詞動詞一致、冠詞與名詞數、比較與對等結構、易混淆字詞）＋國文 3 篇（通假字與古今字、詞語結構與構詞、標點符號與文意），各 2 個互動元件（共 18 個，與既有 gold-standard 一致）。架構：這 9 個是 **note-only 子標籤**（`taxonomy.ts` entry 帶 `parent`，無 tagger 規則、不汙染 study/analytics 篩選），`gen_schedule.py` 把子標籤的考題池**別名到 parent**、`<NoteStats>` 指向 parent 顯示真實考頻。`solveTemplates.ts` 已為 9 標籤補解題步驟。

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

### ✅ A. 補滿單字例句（已完成：3240 / 3240；2026-06-10 複審後選字規則改版，見 §0）
> **2026-06-09 完成**：用「做法二」（環境無可用 API key）分批補完剩餘 3170 字的例句，依詞頻由高到低。每筆 `draft:true`、UI 顯示「AI 草稿例句」。新增可重用 helper **`pipeline/merge_examples_batch.py`**（把手寫的 `{word:{example,example_zh}}` batch 併進 cache，UTF-8、ASCII-only stdout、會驗證空值）。已過 lint＋69 unit tests＋production build。下面做法保留供日後補新字參考。

音標與中文是 ECDICT 權威來源；**例句**是 LLM 草稿。例句存在 **`pipeline/data/vocab_examples.json`**（已 commit，key = 單字，value = `{example, example_zh}`），合併後寫進 `src/data/vocab.json`，每筆 `draft:true`、UI 顯示「AI 草稿例句」。

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

### ✅ B. 擴充古文（已 9 → 78 篇，達 60–80 目標）
> **2026-06-10 完成**：共新增 69 篇，現分布 先秦 20、宋 14、魏晉南北朝 14、唐 13、漢 6、清 6、明 5（先秦最多，符合時代權重）。古文軌道每 3 天一篇、約 7 個月期程需約 50–75 篇，78 篇足以整段期程不重複。原文取公共領域可靠段落、長篇一律以（節錄）截斷以保正確；草稿用 helper `pipeline/merge_guwen_batch.py` 併入。元曲/近現代屬韻文與新文學，本古文（散文）選讀刻意未收。

新增到 **`pipeline/data/guwen_seed.json`**（schema 看現有 9 篇：`id/title/author/dynasty/era/source/tags/original/translation/annotation[]`）。`original` 用公共領域原文（權威）、`translation`＋`annotation` 是你寫的草稿（會標 `draft:true`）。**依時代分析權重優先補**：先秦最多（49%），其次唐／魏晉南北朝／宋。`era` 要用這幾個 bucket 之一：`先秦/漢/魏晉南北朝/唐/宋/元/明/清/近現代`。
```bash
python pipeline/gen_classics.py      # 重算 examRelevance、輸出 src/data/classics.json
python pipeline/gen_schedule.py      # 古文軌道會更新
```

### ✅ B'. 多寫複習文章（已 2 → 11 篇，每科 2–3）
> **2026-06-10 完成**：化學／生物／國文各 3、英文 2；`covers` 全部對齊 TAXONOMY 考點名稱（已驗證）。要再補沿用下法。

在 `src/content/notes/` 加 `kind: review` 的 MDX（看 `review-chem-atoms.mdx`、`review-cn-words.mdx`）。`covers:` 列出涵蓋的考點 tag。寫完跑 `python pipeline/gen_schedule.py`（會掃進 `schedule.json.reviews`，輕量日自動帶出）。建議每科再補 2–3 篇。

### ✅ C.（效能）vocab.json 已改 lazy-load
> **2026-06-10 完成**：新增受密碼閘保護的 `/api/data/vocab` ＋ `src/utils/vocabData.ts#loadVocab`（模組級 promise 快取）。單字頁、今日複習改 `onMount` 非同步載入＋loading 狀態；首頁改由 `schedule.tracks.{vocab,classics}.length` 取總數（3215／49），完全不抓 vocab。原本 **1,192KB（gzip ~355KB）的 vocab client chunk 消失**、build 不再出現 >500KB 警告；preview 實測 `/`、`/review`、`/vocab` 三頁正常、`/api/data/vocab` 回 200、零 console error。

### ✅ D. 提高 era 覆蓋率（22% → 25%，並新增近現代 bucket）
> **2026-06-10 完成**：擴充 author_dynasty（含台灣國文常考的近現代作家），國文 era-tagged 368→415；多代比較題由原本誤標單代正確改判 None。要再提高沿用下法。

擴充 `pipeline/data/author_dynasty.json`（作者全名／名篇 → 朝代），或對特定題加 `pipeline/overrides/era.json`（若要做覆寫機制需接 `gen_era.py`）。維持「高精準、低召回」原則：只用 ≥2 字的作者/篇名，命中朝代不一致就維持 `null`。改完 `python pipeline/gen_era.py`。

### ✅ E. 已跑正式審查
> **2026-06-10**：對 B/B'/C/D 跑 `/code-review`（medium）＋ preview 逐頁實測；lint＋69 unit tests＋production build 全綠。重點確認：C 的 `/api/data/vocab` 受站台密碼閘保護（`isPublicPath`→false，與 `/api/data/[school]` 一致）。後續若要更嚴格，可再跑雲端 `/code-review ultra`（需你手動觸發、計費）。

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
