# 字彙上架進度

字彙是跨 session 的長期工程，一次做一批。**開工第一件事讀這張表**，不要重讀全部照片去猜做到哪。
收工前一定要回來更新（`/vocab` skill 第 7 步）。

照片在 `~/Desktop/TCM-exports/英文/英文字彙照片/`。課本分兩部分，兩部分的字**共用同一個字池**
（都進 `src/data/vocab.json`，每日複習才吃得到），只是分組軸不同。

---

## 第一部分 依字首排列 — 已完成

61 組、471 字，照片 IMG_1125–1655。來源檔 `pipeline/data/vocab_prefix/NN-<group>.json`。

| 組 | 字數 | 照片 | 組 | 字數 | 照片 |
| :--- | --: | :--- | :--- | --: | :--- |
| 01 a-/an- | 15 | 1125–1127 | 32 dia- | 4 | 1638 |
| 02 anti- | 7 | 1127 | 33 inter- | 7 | 1638–1639 |
| 03 contra- | 8 | 1128 | 34 micro- | 3 | 1640 |
| 04 dis-/dif- | 20 | 1129–1131 | 35 multi- | 6 | 1640–1641 |
| 05 in-/il-/im-/ir- | 17 | 1131–1133 | 36 poly- | 4 | 1641 |
| 06 un- | 11 | 1133–1134 | 37 omni- | 5 | 1641–1642 |
| 07 non- | 6 | 1135–1136 | 38 bon-/bene- | 8 | 1643 |
| 08 ante- | 8 | 1137 | 39 mal- | 6 | 1644 |
| 09 pre- | 16 | 1137–1139 | 40 mis- | 7 | 1644–1645 |
| 10 post- | 4 | 1140 | 41 dys- | 4 | 1645–1646 |
| 11 ad- | 27 | 1140–1218 | 42 semi- | 5 | 1647 |
| 12 epi- | 4 | 1218–1219 | 43 mono- | 5 | 1647–1648 |
| 13 ob- | 16 | 1219–1221 | 44 sol- | 5 | 1648 |
| 14 pro- | 12 | 1221–1222 | 45 uni- | 6 | 1648–1649 |
| 15 re- | 20 | 1223–1225 | 46 bi- | 7 | 1649–1650 |
| 16 ana- | 3 | 1225 | 47 du- | 6 | 1650 |
| 17 ambi- | 7 | 1226 | 48 tri- | 8 | 1651 |
| 18 peri- | 4 | 1226–1227 | 49 quadr- | 8 | 1651–1652 |
| 19 para- | 6 | 1227 | 50 pent- | 2 | 1652 |
| 20 super-/sur- | 8 | 1228 | 51 quint- | 2 | 1652 |
| 21 sub- | 11 | 1229–1230 | 52 hexa- | 3 | 1652–1653 |
| 22 cata- | 6 | 1230 | 53 sept- | 2 | 1653 |
| 23 ex- | 19 | 1231–1627 | 54 octa- | 2 | 1653 |
| 24 ab- | 4 | 1627 | 55 nona- | 3 | 1653 |
| 25 se- | 4 | 1628 | 56 deca- | 4 | 1653–1654 |
| 26 tele- | 4 | 1629 | 57 cent- | 3 | 1654 |
| 27 de- | 19 | 1629–1631 | 58 kilo- | 3 | 1654 |
| 28 con-/com- | 26 | 1632–1635 | 59 mill- | 2 | 1654–1655 |
| 29 syn-/sym- | 5 | 1635 | 60 mega- | 3 | 1655 |
| 30 per- | 9 | 1636–1637 | 61 giga- | 2 | 1655 |
| 31 trans- | 10 | 1637–1638 | | | |

---

## 第二部分 依字根排列 — 兩批都已完成

照片 IMG_1682 起，一張照片一個書頁。書頁 67 是這一部分的第一頁。
來源檔 `pipeline/data/vocab_root/NN-<root>.json`，group 的 `kind` 為 `root`。

### 第一批：書頁 67–80（IMG_1682–1695）　16 組、95 字　**已完成**

主題共三個：表示「位置」、「大小與測量」、「多少」的字根。字全部進了
`pipeline/data/vocab_root/`，`src/data/vocab.json` 由 471 增為 566 字。

課本把好幾個字按外形歸組，查證後其實不同源，各字的 `sources.rootNote` 都誠實記了：

| 字 | 課本歸在 | 真正的字根 |
| :--- | :--- | :--- |
| vaccine | vac（空） | 拉丁 vacca「母牛」，因牛痘疫苗得名 |
| meticulous | meter（測量） | 拉丁 metus「恐懼」 |
| miniature | mini（小） | 拉丁 minium「紅丹顏料」，「小」是後來附加的 |
| recycle | circum／circul（拉丁 circulus） | 希臘 kyklos，同義不同源 |
| rudimentary、erudite | radic（拉丁 radix「根」） | 拉丁 rudis「粗糙、未加工」 |
| found | found（底部） | 是三個同形異源字之一，另兩個是「熔鑄」與 find 的過去式 |

另有兩處課本的詞素標示可訂正：`abridge` 的字首是 ad-（朝向）不是 ab-（離開）；
`moderate` 源自 moderari，與 modus 是同源兄弟而非「modus 加後綴」。

| 字根組 | 字數 | 書頁 |
| :--- | --: | :--- |
| 62 loc（位置） | 5 | 67 |
| 63 centr（中心） | 4 | 67–68 |
| 64 circum／circul（圓、環繞） | 6 | 68–69 |
| 65 found／fund（底部） | 4 | 69 |
| 66 radic／rudi（根） | 4 | 69–70 |
| 67 maxi／magn／maj（大） | 7 | 71 |
| 68 aug（增加、大） | 6 | 71–72 |
| 69 grand（大） | 3 | 72 |
| 70 medi／midi（中間） | 5 | 73 |
| 71 mini（小） | 10 | 73–74 |
| 72 brev／brid（短） | 3 | 74–75 |
| 73 meter（測量） | 5 | 75 |
| 74 mod（方式、尺度） | 6 | 75–76 |
| 75 plet／plen（滿、填） | 9 | 77–78 |
| 76 vac／van／vain（空） | 9 | 78–79 |
| 77 neg／nil／nul（無、否定） | 9 | 79–80 |

### 第二批：書頁 81–106（IMG_1696–1721）　29 組、172 字　**已完成**

照片轉錄、例句中譯、字根組表、Etymonline／IPA 查證**全部完成**（`vocab.ts` order 78–106）。

| 部分 | 狀態 |
| :--- | :--- |
| 照片轉錄（26 頁、172 字） | **完成** → `pipeline/data/vocab_root_wordlist_b2.md` |
| 例句中譯（172 句） | **完成** → `pipeline/data/vocab_root_example_zh_b2.json` |
| 字根組表（29 組，order 78–106） | **完成** → `src/models/vocab.ts` |
| Etymonline／IPA 查證 | **29/29 組**（172 字）→ `pipeline/data/vocab_verify/` |
| 已上架 | 171 字（`vocab.json` 共 **737 字**，disclose 與第一部分重複已去重） |

**29 組全部完成**：neo、prim、val、dign、forc、dur、dynam、potent、salut、luc、grav、
lev、stig、acr、punct、sign、cas、fin、term、und、clud、flu、enni、cur、spars、lav、
fund、chron、journ

2026-09-02 依 Aira 指示採「**一輪約 20 字、查證完就入庫**」的節奏（組裝＋build＋綠燈＋
commit 走完一輪再開下一輪），每輪 3 個 worker，六輪全部完成：

| 輪 | 組（字數） | 小計 | 狀態 |
| :--- | :--- | --: | :--- |
| R1 | lev 5、stig 10、acr 3 | 18 | **完成** |
| R2 | punct 6、sign 4、cas 7 | 17 | **完成** |
| R3 | fin 9、term 6、und 4 | 19 | **完成** |
| R4 | clud 8、flu 9、enni 2 | 19 | **完成** |
| R5 | cur 14、spars 3、lav 5 | 22 | **完成** |
| R6 | fund 7、chron 4、journ 4 | 15 | **完成** |

### 接手怎麼做

1. worker 的 prompt 範本見 `/vocab` skill 附錄 E，字表在 `vocab_root_wordlist_b2.md`，
   每組把該組的字照抄成固定清單，**不准增刪改字**。
2. worker 把 JSON 寫到 `pipeline/data/vocab_verify/<group>.json`（這個目錄現在在 repo 裡，
   不放 scratchpad，因為 Temp 會被清掉）。
3. 收完跑 `python pipeline/assemble_vocab_root.py --b2 --write`，
   再 `python pipeline/build_vocab_prefix.py`。
4. 綠燈與 render 驗證照 AGENTS.md 驗法表。

### 課本中文「不算錯但會背歪」的字（2026-09-02 全表逐字複查 172 字的結果）

`zh` 一律保留課本原文（那是老師上課用的版本），但下列這些字若照字面背會在考題上判斷錯，
複習時要知道差別。這是**通讀全部中文**的結論，不是抽查。
（前 6 條來自 2026-09-02 通讀，後 4 條由 R3 起 worker 查證時順帶抓到。）

| 字 | 課本中文 | 實際上 |
| :--- | :--- | :--- |
| poignant | 刺鼻的，尖酸的，感人的 | 現代英文幾乎只用「令人心酸、深刻動人」。「刺鼻」是古義，課本列它是為了配字根 |
| stimulating | 刺激的 | 中文「刺激」易讀成 thrilling，這個字是「激發思考、富啟發性」 |
| invalid | 無效的；殘廢 | 兩義**重音不同**：形容詞「無效的」/ɪnˈvælɪd/，名詞「病弱者」/ˈɪnvəlɪd/。且「殘廢」是舊譯 |
| forte | 強音，強項 | 兩義**讀音不同**：音樂「強音」/ˈfɔrteɪ/，「強項」/fɔrt/ |
| condign | 恰當的，合適的 | 幾乎只用於刑罰，指「罪有應得的」 |
| claustrophobia | 禁閉恐懼症 | 台灣醫學通用譯名是「幽閉恐懼症」 |
| exterminate | 消滅，終結 | 「終結」誤導。這個字是把整群生物殺光、根除，「使某事結束」是 terminate |
| finality | 確定性 | 易與 certainty（心裡篤定）混。這個字指結果已成定局、不可逆 |
| affinity | 相像，喜好 | 「喜好」太弱。指天生的投緣、親近傾向，不等於一般的 like |
| finalist | 入圍者 | 專指進入最後一輪決賽者，不是任何階段的入選者 |
| exclusive | 獨家的，高檔的 | 只給了兩個引申義。核心義「排他的、互不相容的」（mutually exclusive）沒收進來，那才是常考的 |
| incur | 招致，蒙受，產生 | 「產生」誤導。incur 一定是主體自己招來、自己承受（後果、責任、費用），不能泛指產生某物 |
| curriculum | 課程，課業 | 指整套修業課程規劃，單獨一門課要用 course。複數是 curricula |
| ablution | 盥洗，沐浴 | 首義是宗教儀式性的淨身，日常「梳洗」義多用複數 ablutions |
| journal | 學術期刊 | 只給了最窄的現代義。核心是「日」，日記／日誌／流水帳同樣常考 |
| profuse | 豐富的，大量的 | 漏掉「多到滿出來、近乎過量」的語感（profuse apologies／sweating）|
| perfusion | 布滿，灌注 | 現代英文幾乎專用於醫學的「灌流」，「布滿」是偏字面的舊義 |
| chronic | 慢性的，長期的，習慣性的 | 核心是「長期」不是「嚴重」。「習慣性的」是引申的次要義 |

### 課本詞素標示可訂正（第二批，各字 `sources.rootNote` 都記了）

| 字 | 課本標 | Etymonline |
| :--- | :--- | :--- |
| deluge | de-（向下） | dis-（離開）。拉丁 diluvium，拼成 de- 只是古法文改寫 di-，所以 deluge 與 dilute 同字首同字根 |
| designate | de-（向下） | out（向外）。designare 本義是「把記號做到外面來」 |
| determine | de-（向下） | off |
| definition／definite／definitive | de-（向下） | 完全、徹底（加強語氣） |
| compunction | com-（一起） | 加強語氣。意思是「狠狠刺一下良心」 |
| recluse | re-（回） | 加強語氣。且古典拉丁 recludere 本義是「打開」，晚期拉丁才反轉 |
| disclose | dis-（not） | 相反、還原。disclose ＝ un-close ＝ 把關著的打開 |
| occasionally | oc-（朝向） | ob- 在此釋為「向下、離開」 |
| corridor | cor（字首） | 沒有字首，cor 就是字根本身（義大利 correre） |
| current／currency | cur | 拼寫是雙寫 r 的 curr- |
| dilute | di-（分開） | dis- 在 l 前縮成 dī-，不是另一個字首 |
| diurnal | di(day)＋urn(day) | 把「日」算了兩次。只有 di- 是 dies「日」，-urn- 是構成時間形容詞的後綴，本身不表日 |
| sojourn | so-（under） | 字面對但用法不對。此處 sub- 取「稍微、一小段」的時間義，subdiurnare 是「消磨一天」|
| nocturnal | noct(night)＋urn | 不屬本組。字根是 nox／noct「夜」，與本組 dies「日」相反，只共用 -urnus 後綴，課本是刻意放的對照 |

### 兩部分重複收錄的字

課本第一部分（字首）與第二部分（字根）會收到同一個字。`id` 就是 word 本身、
也是 SRS 的 key，兩筆都出貨會讓同一張卡的複習紀錄撞在一起。
`build_vocab_prefix.py` 會**保留先出現的那筆**（＝第一部分，通常已經有複習紀錄）、
把後者捨棄並印出來，`vocab.test.ts` 有一條測試守著，重複就紅燈。

| 字 | 保留在 | 捨棄 | 說明 |
| :--- | :--- | :--- | :--- |
| disclose | dis-（第一部分，IMG_1129） | clud（第二部分，IMG_1713） | 兩處都是課本原有，字沒有漏掉，只是不重複發卡 |

### 完整性怎麼保證（不必人工比對）

- **照片 → 字表**：兩份字表的流水號連續無缺號、無重號（第一批 1–95、第二批 1–172），
  轉錄階段沒掉字。
- **字表 → 出貨**：組裝器逐條走字表，只有「已查證」的才輸出，並把**尚未查證的字逐一印出來**，
  結構上不可能靜默漏字。每次跑都會印 `字表 N 字｜已查證 M`。

### 課本錯誤（字表都已註記並改用正確寫法）

- 書頁 81 innovation 中文印「格新」，正確是「革新」
- 書頁 85 endure 例句印 "endure huger and pain"，正確是 hunger
- 書頁 100 redundant 一則三處印錯：redendancy、redanant organs、"we have ," 多逗號
- 書頁 102 incursion 中文寫成「招致，蒙受」（那是 incur 的意思），正確是「侵入、襲擊」
- 書頁 102 precursor 例句印 "SO is a precursor of acid rain"，正確是 SO₂
- 書頁 102 confusion 中文印「混肴」，正確是「混淆」

### 還沒拿到的照片

書頁 107 之後（Aira 手上還有約 100 張，尚未提供）。

### 派工成本（2026-09-01 實測，排下一批前先看）

一個查證 worker 約 **85k tokens**。這一批 16 組實際花了約 1.3M。**一批派 3 個就好**，
派 4 個以上很容易整批一起撞到 session 額度（這次 16 組裡有 6 組因此全滅要重派）。
worker 一定要把 JSON 寫進 `pipeline/data/vocab_verify/<group>.json`（**repo 內，不是 scratchpad**——
Temp 重開機會被清掉），撞額度時已寫的檔還在。
