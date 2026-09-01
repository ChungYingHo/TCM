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

## 第二部分 依字根排列 — 進行中

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

### 第二批：書頁 81–106（IMG_1696–1721）　29 組、172 字　**查證做到 11/29 組**

照片**轉錄全部完成**，例句中譯**全部完成**，字根組也都進了 `vocab.ts`（order 78–106）。
卡在 Etymonline／IPA 查證，29 組做完 11 組。

| 部分 | 狀態 |
| :--- | :--- |
| 照片轉錄（26 頁、172 字） | **完成** → `pipeline/data/vocab_root_wordlist_b2.md` |
| 例句中譯（172 句） | **完成** → `pipeline/data/vocab_root_example_zh_b2.json` |
| 字根組表（29 組，order 78–106） | **完成** → `src/models/vocab.ts` |
| Etymonline／IPA 查證 | **11/29 組**（62 字）→ `pipeline/data/vocab_verify/` |
| 已上架 | 62 字（`vocab.json` 共 628 字） |

**查證完成的 11 組**：neo、prim、val、dign、forc、dur、dynam、potent、salut、luc、grav

**還沒查證的 18 組**（接手就從這裡派 worker，一批 3 到 5 個）：

`lev` `stig` `acr` `punct` `sign` `cas` `fin` `term` `clud`
`flu` `und` `cur` `fund` `lav` `spars` `enni` `chron` `journ`

字數分別是：lev 5、stig 10、acr 3、punct 6、sign 4、cas 7、fin 9、term 6、clud 8、
flu 9、und 4、cur 14、fund 7、lav 5、spars 3、enni 2、chron 4、journ 4，共 110 字。

### 接手怎麼做

1. worker 的 prompt 範本見 `/vocab` skill 附錄 E，字表在 `vocab_root_wordlist_b2.md`，
   每組把該組的字照抄成固定清單，**不准增刪改字**。
2. worker 把 JSON 寫到 `pipeline/data/vocab_verify/<group>.json`（這個目錄現在在 repo 裡，
   不放 scratchpad，因為 Temp 會被清掉）。
3. 收完跑 `python pipeline/assemble_vocab_root.py --b2 --write`，
   再 `python pipeline/build_vocab_prefix.py`。
4. 綠燈與 render 驗證照 AGENTS.md 驗法表。

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
worker 一定要把 JSON 寫進 `scratchpad/vocab_verify/<group>.json`，撞額度時已寫的檔還在。
