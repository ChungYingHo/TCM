---
name: vocab
description: 把老師課本（依字首排列的英文字彙照片）某一組或某幾組字首的單字，整理成本專案 /vocab 的「字根字彙」並上架，一次到位。當 Aira 給英文字彙照片要我「做單字、加某組字首、擴充字彙、上架字彙」時使用。
---

# vocab — 老師字首字彙上架（強制流程）

老師教法＝**字首＋字根辨字、帶典故、配例句記單字**；背中文翻譯最糟。本專案 `/vocab` 的主字庫就是這套：每字＝**字根拆解 chips ＋ 字源典故 ＋ KK 音標 ＋ 課本例句**，中文只作對照。舊的 3240 GRE/TOEFL 機器字庫已下架為「原字庫」（`vocab-legacy.json`，可切換＋附後中命中率）。

專案規則以 repository root 的 `AGENTS.md` 為權威；本 skill 或其他背景資料若與其衝突，一律以 `AGENTS.md` 為準。背景與踩過的坑若目前平台可讀，另見 memory `vocab-prefix-overhaul`。**每一步都要真的做，不可跳。**

---

## 硬規則（違反＝重來）

1. **正確性不信 LLM 記憶**：每字的字首＋字根拆解、典故一律**對 Etymonline 查證**（用可用的網頁搜尋／開啟工具實際讀取來源，不憑記憶）；音標一律**查字典（Wiktionary US IPA）再轉 KK**，不 LLM 猜。
2. **照片一定親自逐頁讀**：把每組轉成「**固定字清單**」（headword＋POS＋中文＋【衍】＋例句＋老師手寫字根提示＋照片頁碼）。**絕不把照片丟給 agent 自由轉錄**——實測會幻覺、照字首「湊字」（見坑 1）。
3. **例句照抄照片**（`draft:false`）；只有看不清/缺才自生並 `draft:true`。中文取照片。
4. **誠實處理陷阱字**：老師依「字首拼法」分組，有些字的字首其實不是該組的義（見附錄 D）——parts 與典故據 Etymonline 誠實標，**不硬套組義**，並在字源點出來（反而是好教學點）。

---

## 主 agent 是司令，不是工人（Aira 2026-09-01）

這個流程一次動輒 300 字、600 次查證，主 agent 自己逐字查會慢、會爆 token、會中途撞額度。
**主 agent 的角色是派工與把關，不是自己下場查。** 分工原則：

| 工作 | 誰做 | 為什麼 |
| :--- | :--- | :--- |
| 讀照片、轉固定字清單 | **主 agent 自己做，不可外包** | 照片會幻覺、會湊字（坑 1）。這是品質的根，必須自己看 |
| Etymonline 字源＋Wiktionary IPA 查證 | **subagent，一組一個，平行派** | 純查證、輸入輸出都固定，最適合外包。可平行 |
| IPA→KK 轉寫、併照片資料、寫來源檔 | **主 agent** | 要對照片原文，且 KK 轉寫錯了沒人抓得到 |
| Build、綠燈、render 驗證 | **主 agent** | 驗收不外包 |

**派工守則**：

- **一次派一批，不要一次派滿**。一批 3 到 5 個 worker，收完再派下一批，主對話才不會被塞爆。
- **prompt 用附錄 E 範本**，兩條鐵律一定要寫進去：①不准再往下派（否則 fan-out、只回狀態不回 JSON）②固定字清單，NEVER 增刪改字。
- **worker 只回 JSON，不回敘述**。收到敘述就退回要求重輸出 consolidated JSON，不要自己補。
- **挑 model**：查證 worker 是機械性工作，用便宜快的 model 即可；只有陷阱字判斷（字首非該組義、拼字更正）值得升級。
- **worker 撞額度或回空**：換另一個 worker 接續已收集的來源，或主 agent 接手該組。**同一方法失敗兩次就換做法**，不要原樣重試。

## 進度要留檔，下次才接得下去（Aira 2026-09-01）

字彙是**跨 session 的長期工程**，一次只做一批。每批收工前**一定要更新 `pipeline/data/vocab_progress.md`**：
哪幾張照片、哪幾個字根／字首組、幾個字，已完成或待做。下次開工第一件事是讀它，不要重讀全部照片去猜做到哪。

## 流程（七步，依序）

### 1. 讀照片 → 每組固定字清單
- Aira 會指定要做哪組字首（或哪幾張照片）。**逐張用可用的影像檢視工具開圖**（照片多為旋轉的課本掃描，仔細讀；含手寫紅/藍字＝老師的字根提示與 Etymonline 出處）。
- 每字記：headword、POS（a./n./v.…）、中文、`【衍】`衍生字（含 POS＋中文）、**底線的英文例句**（照抄）、老師手寫字根提示、照片檔名（如 `IMG_1131`）。
- 一組字首可能**跨頁**（如 dis- 橫跨三頁），也可能一頁含兩組交界——以頁上的字首標題（`dis- (dif-): not, apart`）為準，切乾淨。
- 產出**固定字清單**（此清單就是第 2 步交給 agent 的權威輸入，agent 只能驗證、不得增刪改字）。

### 2. 每組派一個查證 worker（Etymonline 字根＋典故＋US IPA）
- **一組一個 research worker，一批 3 到 5 個平行派**（見上方「主 agent 是司令」）；平台真的不能委派時才由主 agent 逐組完成。prompt 用**附錄 E 範本**。
- **兩條非講不可的鐵律寫進 prompt**：①**「不要再委派，自己依序開啟並查證來源」**（否則會 fan-out、只回狀態不回 JSON——坑 2）；②**固定字清單，NEVER 增刪改字，只驗證**。
- worker 回**固定 schema JSON**：`{word, parts:[{text,gloss}], etymology, us_ipa, etymonline_url, notes}`。陷阱字在 `notes` 說明。
- ⚠️ worker 若撞 session 額度或只回狀態列 → 要求同一 worker「輸出 consolidated JSON、別重抓」；若平台不能續訊，改由另一 worker 或主 agent 接續已收集的來源（別原樣重試同一方法 2 次以上）。

### 3. 轉 KK ＋ 併照片資料 → 寫該組來源檔
- 把 worker 的 `us_ipa` **轉 KK**（附錄 B 對照）；`phonetic` 存**不含斜線**（卡片自己包 `/…/`）。
- 併：worker 的 `parts`/`etymology` ＋ 我從照片抄的 `zh`/`pos`/`derivatives`/`example` ＋ 我翻的 `example_zh`。
- 寫 `pipeline/data/vocab_prefix/NN-<group>.json`（`NN`＝該字首在 `PREFIX_GROUPS` 的順序、兩位數；一個檔一個 JSON array）。每字帶 `prefixId`（＝該組 id）與 `sources`（`page`、`etymonline`、`ipa`、`ipaSource`、`phoneticNote`、`example`）供稽核。欄位形見附錄 A、既有檔（如 `04-dis.json`）為範本。
- **parts 顆粒度**：字首 chip 在前，接主字根（透明的用整個母字如 `partial`／`conscious`，不透明的用拉丁/希臘字根如 `path`／`fin`），2–3 個為度；純文法字尾（-able/-ate/-ous…）通常不放 chip。gloss 用簡短中文。

### 4. Build
- `python pipeline/build_vocab_prefix.py`（glob `vocab_prefix/*.json` 依檔名序組成 `src/data/vocab.json`，剝掉 `sources`、補 `id`＝word 與 exam/tag 預設）。印出 `wrote N words`。

### 5. 綠燈
- `npx vitest run src/models/vocab.test.ts`（資料完整性：每字 `prefixId` 合法、`parts` 非空且有 gloss、有 example/zh/音標、`id===word`、無溢出）→ 再 `npm test` 全綠。
- `npm run typecheck`（astro check 0 error）、`npm run lint`（0 error；既有 `{@html}` warning 非本次）。
- 查無重複字：`python -c "import json,collections;w=[x['word'] for x in json.load(open('src/data/vocab.json',encoding='utf-8'))['words']];print([k for k,v in collections.Counter(w).items() if v>1] or 'no dup')"`。

### 6. Render 驗證（一定真的 render）
- 以 port 4330 啟動開發伺服器 → 讀 `.env` 取 `SITE_PASSWORD` → 用可用的瀏覽器控制工具先導到 `/`（landing 公開），再 `POST /api/unlock` 設 cookie → 導 `/vocab`。
- 確認：頁面 `desc` 字數對、字首 chips 全在、`section` 數＝有字的組數、`article` 卡數＝總字數、**0 console error**；抽查幾張卡（含陷阱字）的 parts/字源/衍/例句文字正確；切「原字庫」仍正常（命中率 banner＋懶載）。將 viewport 設為 375px 手機寬實際確認不爆版。
- ⚠️ 若截圖工具在本機 timeout（工具問題非頁面問題），改用瀏覽器的 DOM 與 console 檢查逐項驗證，並誠實回報未取得截圖；不要卡在同一方法。

### 7. 更新進度表 ＋ 回報 + 誠實揭露
- **先更新 `pipeline/data/vocab_progress.md`**（這批做了哪些照片／組／字數，還剩哪些），漏了下次要重猜。
- 工作摘要以「**親愛的 Aira**」開頭。
- **一定要請 Aira 抽查**：①**KK 音標**（由查證過的 US IPA 轉寫；少數整字字典無 IPA，是由母詞＋字尾組合推得，來源記在 `sources`）；②**例句中譯**是我翻的。
- 列出這批的陷阱字/拼字更正等「漂亮案例」。

---

## 附錄 A — 資料模型與檔案位置

- **單一資料來源**：`src/models/vocab.ts` — `VocabWord`（含 `prefixId?`/`parts?`/`etymology?`/`derivatives?`，全 optional，新舊兩形相容）、`PREFIX_GROUPS`（11 組 `{id,forms[],meaning,order}`）＋ `prefixById()`。加**新的一組字首**才需在此表加一列。
- 來源檔：`pipeline/data/vocab_prefix/NN-<group>.json`（每組一檔）。組裝器：`pipeline/build_vocab_prefix.py`。出貨：`src/data/vocab.json`。
- 舊字庫：`src/data/vocab-legacy.json`（封存不刪）；懶載路由 `src/pages/api/data/vocab-legacy.ts` ＋ `loadLegacyVocab()`。
- UI：`src/components/vocab/VocabCard.svelte`（雙形相容，`{#if word.parts}` 才顯字根拆解）、`VocabApp.svelte`（字庫切換＋依 `PREFIX_GROUPS` 分組＋原字庫命中率）、`VocabStudy.svelte`（翻卡，正面帶字首提示）。**一律 reuse 勿另造。**

## 附錄 B — US IPA → KK 轉寫對照

存 `phonetic` 時**去掉斜線**、保留 `ˈ`(主重音)/`ˌ`(次重音)。主要轉換：

| US IPA | KK | 例 |
| :-- | :-- | :-- |
| eɪ | e | display /dɪsˈpleɪ/ → `dɪsˈple` |
| oʊ / oː | o | antidote /-doʊt/ → `-dot` |
| iː uː ɑː ɔː | i u ɑ ɔ（去長音） | insomnia /-sɑːm-/ → `-sɑm-` |
| ɹ | r | amorphous /-mɔɹf-/ → `-mɔrf-` |
| 字尾 -y (i) | ɪ（傳統 KK） | atrophy /-fi/ → `-fɪ` |
| 音節性 l̩ / n̩ | əl / ən | noncommittal /-tl̩/ → `-təl` |
| æ ɛ ɪ ʊ ʌ ə ɔ ɑ；aɪ aʊ ɔɪ；ɝ(重) ɚ(輕) | 原樣保留 | — |

字典只給整字沒有的（如 immobilize、untenable），用**母詞 US IPA＋字尾**組合並在 `sources.phoneticNote` 註明。

## 附錄 C — 課本兩大部分與照片位置

照片都在 `~/Desktop/TCM-exports/英文/英文字彙照片/`，檔名 `IMG_nnnn.JPG`，多為**旋轉 90 度的掃描**，且**背面文字會透過來**，逐張仔細讀。

課本分兩部分，本專案的字庫**兩部分共用同一個字池**（都進 `src/data/vocab.json`，每日複習才吃得到），只是分組軸不同：

| 課本 | 分組軸 | group 的 `kind` | 例 |
| :--- | :--- | :--- | :--- |
| 第一部分 通用學術字彙：依**字首**排列 | 字首 | `prefix` | `a-/an-`、`anti-`、`giga-` |
| 第二部分 通用學術字彙：依**字根**排列 | 字根 | `root` | `loc: place`、`centr: center`、`dur: hard, last` |

**哪些做過、哪些還沒做，一律看 `pipeline/data/vocab_progress.md`**，不要靠記憶或重讀全部照片去猜。

## 附錄 D — 陷阱字（依 Etymonline 誠實處理，勿硬套組義）

- **字首非該組義**：`impair`（im-＝in「入/使」，非否定）、`intuit`（in-＝「朝向/在其上」，非否定）、`advance`/`advantage`（d 為 16 世紀誤加，真字根 `abante`＝ab＋ante）、`affordable`（本族英語 `geforðian`，af- 非拉丁 ad-）、`unnerving`（un- 為「去除/反轉」義，非「不」）。→ parts 用真字根、gloss 誠實、typology 點明。
- **字根非表面英文字**：`display`（play＝拉丁 plicare「折」，非 play）、`divide`（vid＝dividere「分」，非 videre「看」——老師手寫常見此誤）。
- **拼字更正**：`arrhythmia`（課本常拼成 arrythmia，正確 `-rrh-`，用正確拼法並在 `sources.spellingNote`/etymology 註記）。
- **義項區分**：`amoral`（與道德無關）≠ `immoral`（不道德）；`disinterested`（公正）≠ `uninterested`（不感興趣）——在典故點出。

## 附錄 E — 查證 worker prompt 範本

> IMPORTANT: Open and inspect the sources YOURSELF, sequentially, with the available web search/open tools. Do NOT delegate further — YOU output the JSON array.
>
> Verify etymology + US pronunciation for a FIXED list of N words (prefix `<X>` = `<義>`). NEVER invent/add/remove words. Every etymology claim MUST come from an Etymonline page you actually opened (`https://www.etymonline.com/word/<word>`); if thin on the root, open the root's page. Also open Wiktionary for a US pronunciation (`https://en.wiktionary.org/wiki/<word>`; Cambridge often 403s).
>
> Output ONLY a JSON array; one object per word: `{ "word", "parts":[{"text","gloss"}], "etymology":"一句繁體中文典故，忠於 Etymonline", "us_ipa":"/.../", "etymonline_url", "notes":"" }`. parts = prefix FIRST (as spelled) then main root(s), SHORT Traditional-Chinese gloss, 2–3 morphemes, confirmed vs Etymonline. notes='' unless spelling/discrepancy/非該組義的陷阱字（明說）. Never fabricate; retry a failed fetch once. Work through ALL N — do not stop early.
>
> Words + teacher root hint: `<逐字：word — 字首(義)+字根(義)；陷阱字特別註記>`
