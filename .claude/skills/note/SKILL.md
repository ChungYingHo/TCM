---
name: note
description: 把一份「筆記大綱」(＋課本照片) 整理成本專案的一篇考前複習筆記，一次到位。當 Aira 給大綱/課本要我「做筆記、整理筆記、寫某章某節筆記」時使用。四科共用（化學/生物/國文/英文）。
---

# /note — 整理複習筆記（強制流程）

過去同一篇被退稿 4 次，根因都是**執行面**：動筆前沒讀透、沒照大綱、收工前沒自審。這個 skill 把「該做的檢查」變成**非做不可的順序**。**每一步都要真的做，不可跳。**

權威內容規則在 `CLAUDE.md`「筆記撰寫規範 5–9」與 memory `notes-writing-style`、`notes-revision-style-feedback`、`unit-factor-notes-standard`、`pdf-print-pagination`。本檔是**流程＋硬 checklist＋各科查證＋技術備忘**，不重複那些規則的細節，但動筆前要一起讀。

---

## 流程（八步，依序）

### 1. 讀透大綱 → 逐項列清單
- **Aira 下 skill 時會附上大綱文件**（檔案/路徑/貼上內容）→ 直接讀他附的那份；他沒附才去 `…/學士後中醫補充資料/<科目>筆記/.content/筆記大綱/` 找。
- 若有課本照片/PDF，**逐張/逐頁讀**。
- 產出一份**「大綱指定項清單」**：每個編號、每個「補：」「例題指定」「圖解」「公式寫法」「(誰發現?)」都列成一條 todo。第 7 步要逐條打勾。
- **嚴格沿用大綱的章節結構與順序**，不可自行重排版型。
- 大綱裡若夾著問題（如「v 是頻率?」「誰發現?」）或註記（「考很少」「同意就跟我說」），**都要在筆記裡回應/處理**，別忽略。

### 2. 讀 2–3 篇同科「通過審核」典範，對齊格式
- 化學：`src/pages/chem-units.mdx`、`chem-atomic-theory.mdx`。
- 生物：`src/pages/bio-cell-1.mdx`～`bio-cell-3.mdx`。
- 國文：`src/pages/cn-*.mdx`（探索/辨識/自測型元件）。英文：`src/pages/en-*.mdx`。
- 看它們：開頭怎麼進（NoteStats 後直接 `## 一`，**無敘事前言**）、表格/條列密度、callout 用法、例題位置。

### 3. 查考古題涵蓋度
- `grep` 主題關鍵字過 `src/data/{CMU,ISU,TCU}.json`（PowerShell 編碼問題就寫小 py 輸出到 scratchpad 再 Read）。
- 看實際考點：補大綱沒提但常考的高頻點；**冷門/未考過的一句帶過**（大綱常會註明「考很少」）。

### 4. 查證正確性（**勿信 LLM 記憶**）→ 見附錄 B（各科分流）

### 5. 寫 MDX → 全程套**附錄 A 硬規則**
- 放 `src/pages/<id>.mdx`；reuse 既有元件（附錄 C 清單）；大綱要「圖解」就**建新元件**別用文字搪塞。

### 6. 驗證（每次都做）
- **Render**：preview_start `tcm-dev`(4330) → 讀 `.env` 取 `SITE_PASSWORD` → POST `/api/unlock` → `fetch /<slug>` 必須 **200 ＋ 0 個 `katex-error`**（astro check 綠不代表 SSR 不 500，見 memory `mdx-notes-render-verification`）。
- **綠燈**：`npx astro check`(0 error)、`npx eslint <改的.svelte/.ts>`、`npx vitest run`(全綠)。
- ⚠️ 互動點擊/截圖在本機 headless 常因 `client:visible`＋IntersectionObserver 失效而測不到（連既有元件都一樣），非 bug；用 SSR 結構檢查＋請 Aira 實機點。

### 7. 收工自審（堵最後破口）
- **逐條打勾第 1 步的大綱清單**——每個指定項都確認做了（例題指定有沒有當 inline 知識範例？圖解有沒有真給圖？）。
- 用「**考前 30 秒速查＋忘光的初學者**」雙視角，整篇讀一遍：揪出敘事贅句、未定義術語、前向引用、分號串、講一半的句子、缺單位——**一次全修**（同類問題別被抓第二次）。

### 8. 註冊 + 回報
- `src/models/notes.ts` 加 `NOTES` entry：`subject`、`tags`、`desc`、`NoteStats tag`。
- **決定 `tags`（主題分類，務必照附錄 D 的步驟做）**：先看同 `subject` 既有 tag、能聚進同主題就重用，否則取一個精準主題詞；別用難度/來源詞。
- `NoteStats tag` 填 `src/models/taxonomy.ts` 裡對應的真 taxonomy tag（與 `tags` 是兩回事）。
- **排序未經 Aira 允許不可擅自決定/更動。**
- 工作摘要以「親愛的 Aira」開頭。

---

## 附錄 A — 寫作硬規則 ＋ 禁用語

**這是考前快速複習卡，不是教科書。** 能表格/條列/色塊就別寫長段落。

**禁用語（出現＝退稿）**：
- 敘事性前言、故事（「這一節是…的源頭」「古典物理撞牆」）。
- 元敘述開場白（「本篇考點集中…」「一次理清」「動手玩玩」）。
- meta 語氣 / 把大綱原話塞進成品（「老師用…」「課本合併寫法」「我打不出符號」）。
- **分號（；）串多個重點 → 一律改條列式（bullet）**。徹查 prose、callout、表格 cell、ExampleQuestion steps、元件內 prose。

**必做**：
- 公式**帶單位**、unit factor 完整相消（分子分母都寫、標上下相消）。`c (m/s)=ν(1/s)×λ(m)`、`E(J)=h(J·s)×ν(1/s)`。
- **單個 vs 數個公式分開寫**（E₁=hν 與 Eₙ=nhν 各一條，別合一行）。
- **術語/符號首次出現即定義**（中文＋英文＋縮寫＋一句白話）；先講機制再套用。
- 句子別講一半（補完因果）。
- **大綱「例題指定」＝放在該段落當 inline 知識範例**（用 `WorkedExample`），不是丟最後例題區；自測練習才用互動 `ExampleQuestion`（選→對→解析，支援複選）。
- 大綱說「圖解」就**做圖**（建小 Svelte 元件，`not-prose` 容器、Svelte 5 runes、`client:visible`）。

**MDX 陷阱**：散文比較符號用 `&lt;`/`&gt;`（裸 `<字母` 會被當 JSX → SSR 500）；display math `$$` 獨立成行；含狀態/箭頭/電荷的化學式用 mhchem `\ce{}`，簡單下標用 Unicode。

---

## 附錄 B — 各科正確性查證（一律先查證，勿信 LLM）

- **生物**：**權威＝Campbell 生物學中文版**（`…/生物筆記/.content/課本原檔/Campbell生物學中文版_上冊/下冊_壓縮版.pdf`），**優先對照 Campbell、其次才網路**。Campbell 是掃描檔無文字層 → 用 Read tool 開指定 `pages`（會 render 成圖供視覺判讀），或 PyMuPDF 裁圖；**勿用文字抽取、勿由 LLM 判讀結構**（見 memory `bio-campbell-figures`）。
- **化學**：事實/數據對照課本＋上網查可靠來源（教科書、NIST、IUPAC）；結構/圖一律對照不由 LLM 判讀；計算走 unit factor。
- **國文**：**注音、字形、原文、平仄、斷句、作者一律上網查證**，勿憑記憶杜撰；agent 的建議也要查證（常假陽性）；需具體字詞事實卻查不到的，列「待查證」交人工，不硬寫。
- **英文**：用法/搭配/字源對照可靠來源。

## 附錄 C — 元件 reuse 清單

**共用結構元件**（一律 reuse）：`NoteStats`、`Memorize`、`KeyPoints`、`SolveApproach`、`ExampleQuestion`（互動自測）、`WorkedExample`（inline 示範卡）。
**主題互動元件**：`src/components/notes/` 已有 ~120 個（化/生/國/英）；做新主題前先 `ls` 找有沒有可重用的，**勿另造同義元件**。量子力學主題已建：`BlackbodyCurve`、`WaveBasics`、`PhotoelectricPlot`、`ColorWheel`、`EmSpectrum`。

## 附錄 D — 標籤 `tags`（主題分類，必照步驟）

`tags` 是**主題分類**：使用者點某 tag，會抓出**同主題的所有相關筆記**。所以它要回答「這篇內容屬於哪個主題」，**不是**難度（基礎/進階）、也**不是**來源（正課/課程）。

決定步驟：
1. 從大綱/內容歸納這篇的**主題**（例：光電效應+黑體+物質波 → `量子力學`；細胞構造 → `細胞`；修辭 → `修辭格`）。
2. **看 `src/models/notes.ts` 裡同 `subject` 已用過的 `tags`**：若已有能涵蓋本篇的主題 tag → **重用它**（這樣點下去才會跟舊筆記聚在一起）；沒有才取一個新的、精準的主題詞。
3. 取詞原則：用「會考/複習時會一起翻」的主題粒度（章級或大概念），別太細（不要一篇一個獨有 tag）、也別太泛。
4. 一篇可給 1～多個 tag（多主題交集時）。
5. **真的拿不定就問 Aira**「這篇你想歸到哪個主題標籤」，別硬塞。

注意：`NoteStats tag`（元件 prop）是**另一回事**——要填 `src/models/taxonomy.ts` 裡的真 taxonomy tag（給考頻統計用），與這裡的 `tags` 不要混。
備忘：化學早期自編基礎篇歷史上用 `基礎`（因內容就是普化基礎），那是「主題」不是「難度」；別把它當成可套到別科的難度詞。
