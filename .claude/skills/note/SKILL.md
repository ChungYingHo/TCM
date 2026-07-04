---
name: note
description: 把一份「筆記大綱」(＋課本照片) 整理成本專案的一篇考前複習筆記，一次到位。當 Aira 給大綱/課本要我「做筆記、整理筆記、寫某章某節筆記」時使用。四科共用（化學/生物/國文/英文）。
---

# /note — 整理複習筆記（強制流程）

過去同一篇被退稿 4 次，根因都是**執行面**：動筆前沒讀透、沒照大綱、收工前沒自審。這個 skill 把「該做的檢查」變成**非做不可的順序**。**每一步都要真的做，不可跳。**

權威內容規則在 `CLAUDE.md`「筆記撰寫規範 5–9」與 memory `notes-writing-style`、`notes-revision-style-feedback`、`unit-factor-notes-standard`、`pdf-print-pagination`。本檔是**流程＋硬 checklist＋各科查證＋技術備忘**，不重複那些規則的細節，但動筆前要一起讀。

---

## 流程（九步，依序）

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

### 3. 認領考古題（note-claiming）→ 詳見附錄 D
- 撈該科**尚未被認領**的考古題，**逐題讀內容**挑出真屬本篇範圍的，標上本篇標籤（exclusive，其餘維持無標籤）。
- 同時看實際考點：補大綱沒提但常考的高頻點；**冷門/未考過的一句帶過**。某主題若認領出來≈0 題（考很少），那就是 0 題，別硬湊。

### 4. 查證正確性（**勿信 LLM 記憶**）→ 見附錄 B（各科分流）

### 5. Plan Mode 定稿（**先審後寫，必做**）

動筆前**必須先用 `EnterPlanMode` 進入 plan mode**，把整篇筆記的**文字定稿**呈給 Aira 審核修正。

**這不是草稿、不是大綱——是定稿**：
- **所有文字內容直接寫到可以貼進 MDX 的完成度**：散文、定義、公式（KaTeX/mhchem）、表格、條列、例題（題目＋選項＋答案＋解析）、必背 `Memorize` items，全部寫完，Aira 審的是「這些字要不要改」，不是「大概寫什麼」。
- **圖解/新建元件用敘述佔位**：需要新建的圖表、動畫、互動圖解，以 `【元件：<名稱>——<功能描述>；呈現內容：<具體資料/維度/互動行為>】` 格式佔位。這是唯一允許非定稿的部分——因為元件要寫程式，在 plan 階段先描述讓 Aira 確認方向。
- **既有元件的 props 內容是文字，照樣定稿**：`ExampleQuestion`、`WorkedExample`、`Memorize` 等，直接寫出 props 值（題目文字、選項、答案、解析、items 陣列），不用佔位。

**等 Aira 回覆允許（或給修改意見）才進下一步**。被退稿就依意見修改後重新提交，不可跳過直接寫 MDX。

### 6. 寫 MDX → 全程套**附錄 A 硬規則**
- **Aira 審過 plan 才到這步**。把 plan 定稿轉成 `src/pages/<id>.mdx`；reuse 既有元件（附錄 C 清單）；大綱要「圖解」就依 plan 佔位描述**建新元件**。
- Plan 定稿的文字就是最終內容，轉 MDX 時只做格式轉換（加 import、加元件 markup、排版），**不可偷加/偷刪/改寫 plan 審過的文字**。

### 7. 驗證（每次都做）
- **Render**：preview_start `tcm-dev`(4330) → 讀 `.env` 取 `SITE_PASSWORD` → POST `/api/unlock` → `fetch /<slug>` 必須 **200 ＋ 0 個 `katex-error`**（astro check 綠不代表 SSR 不 500，見 memory `mdx-notes-render-verification`）。
- **綠燈**：`npx astro check`(0 error)、`npx eslint <改的.svelte/.ts>`、`npx vitest run`(全綠)。
- ⚠️ 互動點擊/截圖在本機 headless 常因 `client:visible`＋IntersectionObserver 失效而測不到（連既有元件都一樣），非 bug；用 SSR 結構檢查＋請 Aira 實機點。

### 8. 收工自審（堵最後破口）
- **逐條打勾第 1 步的大綱清單**——每個指定項都確認做了（例題指定有沒有當 inline 知識範例？圖解有沒有真給圖？）。
- 用「**考前 30 秒速查＋忘光的初學者**」雙視角，整篇讀一遍：揪出敘事贅句、未定義術語、前向引用、分號串、講一半的句子、缺單位——**一次全修**（同類問題別被抓第二次）。

### 9. 註冊 + 回報
- `src/models/notes.ts` 加 `NOTES` entry：`subject`、`tags`、`desc`、`group`（**大分類/章**：把相關筆記歸同一標題下，如 `細胞學`／`量子論與原子結構`／`基礎化學`；/notes 依 group 分組顯示，見 `noteGroupsIn`）。
- **本篇標籤＝認領標籤**（同一字串用於 `tags`／`NoteStats tag`／`RelatedQuestions tag`／被認領題的 `concept_tag`，見附錄 D）；`taxonomy.ts` 要有這個標籤。
- **排序未經 Aira 允許不可擅自決定/更動。**
- 工作摘要以「親愛的 Aira」開頭。

---

## 附錄 A — 寫作硬規則 ＋ 禁用語

**這是考前快速複習卡，不是教科書。** 能表格/條列/色塊就別寫長段落。

**禁用語（出現＝退稿；2026-06-27 chem-quantum、2026-07-04 原子光譜/軌域 兩度因下列犯規被退稿，動筆與交稿前都逐條自檢）**：
- 敘事性前言、故事（「這一節是…的源頭」「古典物理撞牆」）。
- **開場「脈絡/roadmap」那一行也不要**（Aira 2026-07-04）：`NoteStats` 後**直接進 `## 一`**，連「脈絡：黑體→光電→…」或**跨篇導覽 blockquote**（如「細胞三部曲：一→二→三」）都刪——分組已由 notes.ts 的 `group` 呈現。
- 元敘述開場白（「本篇考點集中…」「一次理清」「動手玩玩」）。
- **任何引用大綱/課本/老師/照片的痕跡**（「大綱疑問…」「大綱提到」「照片裡那張」「老師用…」「課本合併寫法」「我打不出符號」「承接上一篇」）。大綱夾的問題要**乾淨地當內容回答**，不可寫「大綱問…」。你是在寫筆記，不是回覆大綱。
- **標「考點/最常考/常考/超常考/(概念,考點少)/正是考點」**（Aira 2026-07-04）：Aira 放進大綱的**本來就都是考點**，不需你標，標了＝退稿。
- **破折號 `——`／`--`**（Aira 明講「討厭」）：一律改成。，：或斷句。
- **部落格語氣、反問句、口語鋪陳**（「為什麼會量子化？…就能看懂」「其實」「跟著走就會」）：直接敘述、句子要**通順完整**。
- **補「精確值/多餘資訊」**（Aira 2026-07-04「不在乎精確值」）：如取 90 nm 就 90，不要旁白「精確值 91.2」這種考試用不到的精度。
- **分號（；）串多個重點 → 一律改條列式（bullet）**。徹查 prose、callout、表格 cell、ExampleQuestion steps、元件內 prose。

**必做**：
- 公式**帶單位**、unit factor 完整相消（分子分母都寫、標上下相消）。`c (m/s)=ν(1/s)×λ(m)`、`E(J)=h(J·s)×ν(1/s)`。
- **單個 vs 數個公式分開寫**（E₁=hν 與 Eₙ=nhν 各一條，別合一行）。
- **術語/符號首次出現即定義**（中文＋英文＋縮寫＋一句白話）；先講機制再套用。**符號（ψ、σ、Φ…）每次出現都補一句白話**（Aira 會忘），如「波函數 ψ」「$|\psi|^2$＝機率密度」「$\sigma=Zr/a_0$」。
- 句子別講一半（補完因果），且**句子要通順**（別為了精簡寫出不通的斷句）。
- **公式變數照課本寫法、不硬塞在分子上**（Aira 2026-07-04）：如 $\sin\!\big(\tfrac{n\pi}{L}x\big)$，不寫成 $\sin\tfrac{n\pi x}{L}$。
- **未考過的純推導先查考古題再決定放不放**（Aira 2026-07-04）：只放結論、別塞推導過程（例：波耳角動量量子化 $mvr=n\tfrac{h}{2\pi}$ 沒考→刪；波耳半徑 ISU-113 有考→留）。
- **大綱點名的課本大表/大圖一定要做**（Aira 2026-07-04：「不然我給你幹嘛」），如氫原子波函數表、能階圖，不可略、不可用文字搪塞。
- **速查優先用表格、留白別擠**（Aira 2026-07-04）：能表格化就表格化，別堆項目符號牆。**「必背」只放一個 `Memorize`**（表格卡，每則「主題：內容」），不分兩塊、不放「解題方向」。
- **大綱「例題指定」＝放在該段落當 inline 知識範例**（用 `WorkedExample`），不是丟最後例題區；自測練習才用互動 `ExampleQuestion`（選→對→解析，支援複選）。
- 大綱說「圖解」就**做圖**（建小 Svelte 元件，`not-prose` 容器、Svelte 5 runes）。**底線＝元件一定要在 PDF/GoodNotes 顯示完整資訊**（Aira 幾乎都看 PDF，互動在那邊無效）。**互動與否其次、該不該互動由 Claude 自己判斷**——兩條路任選：①**全畫成靜態**（不加 `client:`、純 SSR、最省事、首選）；②**要互動也沒關係**，但**必須附 `print:block` 靜態完整版**（範本＝`ExampleQuestion`）。**唯一禁忌：資訊只藏在互動後面又 `print:hidden`**（PDF 整片空白，如舊版 `VseprShapes`／`SigFig` 之坑，見 memory `pdf-print-pagination`）。
- **中英數字間距＋全形標點（新規範，Aira 2026-07-04）**：中文與英文/數字/符號之間，若非本來一個詞就**空一格**；中文散文一律**全形標點**（，。：、）。例 `微管(microtubule)25nm(最粗,tubulin α+β,中空)` → `微管 (microtubule) 25nm (最粗，tubulin α+β，中空)`。散文括號用全形（），`Memorize` 等密集標註沿用半形 `( )` 但前後空格＋內部逗號改全形。徹查 prose／Memorize／表格 cell／元件 props。
- **生物筆記：名詞統整表（Aira 2026-07-04）**：篇末（`## 考古題` 之前）放一張 `## 名詞統整` 三欄表（`英文（縮寫）｜中文｜一句話`），把整篇專有名詞一次列出（生物多是**專有名詞不熟、非觀念不熟**）。包在 `overflow-x-auto print:overflow-visible`、PDF 會印出。範本＝bio-cell-1/2/3。

**MDX 陷阱**：散文比較符號用 `&lt;`/`&gt;`（裸 `<字母` 會被當 JSX → SSR 500）；display math `$$` 獨立成行；含狀態/箭頭/電荷的化學式用 mhchem `\ce{}`，簡單下標用 Unicode；**`##`/`###` 標題內不放 KaTeX `$...$`**（NoteToc 會把它疊成「RRR」重複字，2026-07-04 修）——標題的符號改用純 Unicode（R、M、ΔS）。

---

## 附錄 B — 各科正確性查證（一律先查證，勿信 LLM）

- **生物**：**權威＝Campbell 生物學中文版**（`…/生物筆記/.content/課本原檔/Campbell生物學中文版_上冊/下冊_壓縮版.pdf`），**優先對照 Campbell、其次才網路**。Campbell 是掃描檔無文字層 → 用 Read tool 開指定 `pages`（會 render 成圖供視覺判讀），或 PyMuPDF 裁圖；**勿用文字抽取、勿由 LLM 判讀結構**（見 memory `bio-campbell-figures`）。
- **化學**：事實/數據對照課本＋上網查可靠來源（教科書、NIST、IUPAC）；結構/圖一律對照不由 LLM 判讀；計算走 unit factor。
- **國文**：**注音、字形、原文、平仄、斷句、作者一律上網查證**，勿憑記憶杜撰；agent 的建議也要查證（常假陽性）；需具體字詞事實卻查不到的，列「待查證」交人工，不硬寫。
- **英文**：用法/搭配/字源對照可靠來源。

## 附錄 C — 元件 reuse 清單

**共用結構元件**（一律 reuse）：`NoteStats`、`Memorize`（**單一「必背」表格卡**，每則寫「主題：內容」、元件自動拆兩欄，2026-07-04 起已合併原 Memorize＋KeyPoints）、`ExampleQuestion`（互動自測）、`WorkedExample`（inline 示範卡）。
⚠️ **`KeyPoints`／`SolveApproach` 已刪除（2026-07-04 Aira 定案）**：必背**只用一個 `Memorize`**（別再分「必背」＋「重點整理」兩塊）、筆記**不放「解題方向」**。但 `solveTemplates.ts` 仍要加該 tag 的解題步驟（供答案詳解 `AnswerReveal` 與 `taxonomy.test`，見附錄 D）。
📑 **本篇目錄自動生成（2026-07-04，仿 Jeremy-and-Aira）**：`NoteLayout` 已內建 `NoteToc.astro`＝桌機右側 sticky 側欄＋scroll-spy、手機底部滑出抽屜（由 `Astro.props.headings` 列各 `##`/`###` 錨點、`print:hidden`）。**不用在 MDX 手動加目錄**，只要把 `## 大節` 標題寫好就有跳段與高亮。
**主題互動元件**：`src/components/notes/` 已有 ~120 個（化/生/國/英）；做新主題前先 `ls` 找有沒有可重用的，**勿另造同義元件**。量子力學主題已建：`BlackbodyCurve`、`WaveBasics`、`PhotoelectricPlot`、`ColorWheel`、`EmSpectrum`。

## 附錄 D — 標籤 ＝ 考古題「認領」（note-claiming，Aira 2026-06-28 定案）

**一篇筆記一個標籤，這個字串同時是三件事**：① `/notes` 的瀏覽分類（`notes.ts` 的 `tags`）② 考點統計（`NoteStats tag`）③ **本篇「認領」的考古題的 `concept_tag`**。**三者同一字串**——這就是 Aira 要的「考古題標籤跟筆記標籤同步」。（捨棄舊的「瀏覽 tag ≠ 概念 tag」兩套制。）

**命名慣例（Aira 定案）**：基礎篇（自編）＝`基礎-<主題>`（如 `基礎-熱力學`、`基礎-化學鍵`）；正課篇＝`<主題>` 直接命名（如 `量子力學`，未來正課熱力學就叫 `熱力學`）；生物細胞系列＝`細胞-<子題>`（`細胞-原核與真核`/`細胞-細胞核與胞器`/`細胞-骨架與連結`）。一個 prefix 群一組相關筆記，避免「7 篇都叫基礎沒法分考古」。

**認領模型**：
- 每篇筆記去**該科考古題**裡認領屬於它範圍的題，把那些題的 `concept_tags` 標成**本篇標籤**；**沒被任何筆記認領的題維持無標籤**。
- 認領是 **exclusive**（一題歸一篇、從舊粗標籤移除）→ 別篇不會超綱抓到。
- **效率**：寫新筆記時**只掃「尚未被認領」的題**（還掛舊粗桶 or 無標籤者）；筆記越寫越多、要掃的越少。

**寫筆記時的認領 SOP**：
1. 撈出該科**尚未被細標籤認領**的考古題（id＋題幹＋選項；PowerShell 編碼問題就用 py 輸出到 scratchpad 再 Read）。
2. **逐題讀內容判斷**是否真屬本篇範圍。⚠️ **嚴格、勿用關鍵字硬湊**：沾邊但屬別篇的不算（寫「光電效應」篇時，波耳模型／氫原子光譜／量子數／軌域／核化學都**不是**這篇，留給各自的篇；「量子」二字會誤抓軌域/光譜題）。**逐題看內容是鐵則——只改標籤不看內容一樣超綱**（Aira 原話）。
   - ⚠️ **判準＝「解這題實際要用到哪一篇教的技能/概念」，不是題目表面包裝什麼**（Aira 2026-06-28）。大概念包裝的題，骨子裡可能只用一套基礎技能 → 歸那篇基礎篇。例：題目看似「酸鹼綜合反應」，但解題其實只需基礎 unit factor（不必真的處理酸鹼平衡）→ 歸 **chem-units（基礎單位/因次）**，不歸酸鹼。判每題時都先問：「真正解這題要動用哪篇教的東西？」，能用更基礎的篇解就歸更基礎那篇。
   - 一題若沒有任何現成筆記教它解法 → 維持無標籤（等那篇寫出來再認領）。
3. 認領：在 `pipeline/overrides/concept_tags.json` 設 `id → ["本篇標籤"]`（curated、wins last，tagger 重跑也蓋不掉）。
   - **大桶（>100 題）用平行 agent 逐題讀題幹+選項分類、你核對**（dump 到 scratchpad；每 agent 回 `{decisions:{id:{tag,reason}}}`）。
   - **雙標籤題**：認領是 exclusive（設成單一 `[本篇標籤]`）。若該題還屬「尚無筆記」的概念（如光譜/配位），exclusive 會讓那 legacy 桶少算幾題——沒關係，之後那篇掃「無標籤」會撈回；但若要 legacy 桶完整給 /study 篩選，改用「只剝舊基礎桶、保留其他 legacy tag」（用 `tags_backup.json` 原 tag 減去要退役的桶）。
4. **接系統（缺一就破測試/功能，務必全做）**：
   - `src/models/taxonomy.ts` 加 `{ tag:'本篇標籤', slug:'<src/pages id>', short:'…', claimed: true }`——**`claimed: true` 必加**（讓 `taxonomy.test` 改驗 `notes.ts`、不綁 deprecated 筆記）。
   - `src/models/solveTemplates.ts` 加 `'本篇標籤': [...3–4 步解題方向...]`（否則 `taxonomy.test` #7「每 tag 要解題步驟」失敗）。
   - `src/models/notes.ts` 該篇 `tags: ['本篇標籤']`。
   - 筆記 MDX：`<NoteStats tag="本篇標籤" client:load />`、**篇末必放考古題區**（`## 考古題` ＋ `<RelatedQuestions tag="本篇標籤" limit={10} client:load />`）。**2026-07-04 起考古題會印進 PDF**（`QuestionCard` 內建 `hidden print:block` 靜態版：題幹圖＋選項＋正解＋詳解），故 `## 考古題` **不再包 `print:hidden`**。題庫不足 10 就全放、0 題會自動顯示「尚未考過」。
   - **工具頁（.astro，如週期表/胺基酸）也當正常筆記**：在 `<NotePager />` 前加「**例題**」section（`ExampleQuestion` 自測題、`client:visible`）＋「**考古題**」section（`RelatedQuestions` limit 10、`client:load`），且 `page-kicker` 寫成 `筆記 · <本篇標籤>`（這類頁用 `Layout` 非 `NoteLayout`，kicker 是寫死的要手動改）。即「claude 例題＋考古題」兩區跟 prose 筆記一致。
5. `cd pipeline && python -m retag` 重生 `src/data/<school>.json`＋index → **綠燈全跑**：`vitest`(含 taxonomy.test)、`cd pipeline && python -m pytest`、`npx astro check`、該篇 `fetch /<slug>` render 200。備份 `pipeline/overrides/concept_tags.json` 後再動。

**誠實**：主題若考很少（如光電效應，三校近年實測≈0 題），認領完就是 0–幾題，NoteStats 顯示低頻/0——**這才對，勝過硬塞整桶超綱題**。

**漸進（Aira：不是現在、不是一次做）**：舊粗標籤（如「原子結構與核化學」160 題）暫留在未認領題上當 legacy，隨每篇新筆記認領而縮小；先補現有幾篇，最終「正規拆桶」＝每題都被某篇認領或維持無標籤。**勿一次重標全部。**
