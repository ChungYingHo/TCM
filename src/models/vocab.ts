// Shape of src/data/vocab.json.
//
// 兩套字庫共用這個形：
//   1. 字根字彙（現行 src/data/vocab.json）—— 依「字首＋字根」拆解記憶的手工字庫，字根/典故
//      經 Etymonline 查證；帶 prefixId / parts / etymology / derivatives，中文（zh）為輔。
//   2. 原字庫（封存於 src/data/vocab-legacy.json）—— 舊的 ECDICT 機器生成 GRE/TOEFL 字，無字根
//      欄位；仍可從 /vocab 的「原字庫」切換懶載瀏覽。
// phonetic 為 KK 音標；example/example_zh 取自課本照片（看不清才 AI 生成，draft:true）。

/** 一個構詞單位（字首／字根／字尾）＋白話字義，如 { text: 'a-', gloss: '無' }。 */
export interface WordPart {
  text: string
  gloss: string
}

/** 衍生字（課本【衍】那一行）。 */
export interface Derivative {
  word: string
  pos?: string
  zh?: string
}

export interface VocabWord {
  id: string // the word itself — stable across regenerations (per-word SRS keys on it)
  word: string
  phonetic: string
  zh: string
  pos: string
  tags: string[] // gre / toefl / ielts / cet6 / ky …
  frq: number // frequency rank (lower = more common; 0 = unranked)
  examCount: number // times it appeared as a 後中 option
  examCorrect: number // times it was the correct answer
  examIds: string[]
  example: string
  example_zh: string
  draft: boolean // example is an AI draft
  // Other exam-seen list-words the example reuses, tagged at build time so the card can
  // highlight them as a tappable mini-review (s = surface form in the example, w = the
  // reused word's id for SRS, zh = short peek gloss). Omitted if none.
  reuses?: { s: string; w: string; zh: string }[]
  // ── 字根字彙專用（原字庫的字沒有這些，故全 optional）──────────────────────────
  prefixId?: string // 對應 PREFIX_GROUPS[].id，用於依字首分組
  parts?: WordPart[] // 字首＋字根拆解（此字庫的主角）
  etymology?: string // 典故／記憶邏輯，經 Etymonline 查證；可空
  derivatives?: Derivative[] // 【衍】衍生字
}

export interface VocabData {
  generated_at: string
  count: number
  withExamples: number
  words: VocabWord[]
}

// ── 構詞分組 —— 單一資料來源（分組相關 UI 一律讀這張表，勿散落硬寫）───────────────
// 依老師教法排序。課本分兩部分：第一部分依「字首」、第二部分依「字根」，由 kind 區分，
// 兩部分的字共用同一個字池（都在 vocab.json），每日複習才吃得到。
// forms 收同一構詞單位的拼寫變體（字首的子音同化如 in-→il-/im-/ir-，字根的異體如 magn/maj）。

export interface PrefixGroup {
  id: string // 穩定 id，對應 VocabWord.prefixId
  forms: string[] // 拼法變體，字首如 ['in-', 'il-', 'im-', 'ir-']，字根如 ['magn', 'maj']
  meaning: string // 白話字義（中文＋英文）
  order: number // 顯示順序（老師教法原序）
  kind?: 'prefix' | 'root' // 省略＝'prefix'（第一部分的 61 組都是字首）
}

/** 課本的兩大部分，/vocab 依此分區顯示。 */
export const GROUP_KINDS = [
  { kind: 'prefix' as const, label: '依字首' },
  { kind: 'root' as const, label: '依字根' },
]

/** 分組的種類，省略 kind 時視為字首。 */
export function groupKind(g: PrefixGroup): 'prefix' | 'root' {
  return g.kind ?? 'prefix'
}

export const PREFIX_GROUPS: PrefixGroup[] = [
  { id: 'a-an', forms: ['a-', 'an-'], meaning: '沒有、無（without）', order: 1 },
  { id: 'anti', forms: ['anti-'], meaning: '反、對抗（against）', order: 2 },
  { id: 'contra', forms: ['contra-', 'counter-'], meaning: '相反、對抗（against）', order: 3 },
  { id: 'dis-dif', forms: ['dis-', 'dif-'], meaning: '不、分開（not, apart）', order: 4 },
  { id: 'in-not', forms: ['in-', 'il-', 'im-', 'ir-'], meaning: '不（否定 not）', order: 5 },
  { id: 'un', forms: ['un-'], meaning: '不（not）', order: 6 },
  { id: 'non', forms: ['non-'], meaning: '非、不（not）', order: 7 },
  { id: 'ante', forms: ['ante-'], meaning: '之前（before）', order: 8 },
  { id: 'pre', forms: ['pre-'], meaning: '之前（before）', order: 9 },
  { id: 'post', forms: ['post-'], meaning: '之後（after）', order: 10 },
  { id: 'ad', forms: ['ad-'], meaning: '朝向、去（to, toward）', order: 11 },
  { id: 'epi', forms: ['epi-'], meaning: '在上、在旁（upon, on）', order: 12 },
  { id: 'ob', forms: ['ob-', 'oc-', 'of-', 'op-'], meaning: '朝向、對抗（toward, against）', order: 13 },
  { id: 'pro', forms: ['pro-'], meaning: '之前、向前、贊成（before, forward, for）', order: 14 },
  { id: 're', forms: ['re-'], meaning: '回、再（back, again）', order: 15 },
  { id: 'ana', forms: ['ana-'], meaning: '再、往上、回（again, up, back）', order: 16 },
  { id: 'ambi', forms: ['ambi-', 'amphi-'], meaning: '兩者、周圍（both, around）', order: 17 },
  { id: 'peri', forms: ['peri-'], meaning: '周圍、環繞（around）', order: 18 },
  { id: 'para', forms: ['para-'], meaning: '在旁、並列（beside）', order: 19 },
  { id: 'super', forms: ['sur-', 'super-'], meaning: '在上、超過（over, above）', order: 20 },
  { id: 'sub', forms: ['sub-', 'suc-', 'sup-'], meaning: '在下、之後（under, after）', order: 21 },
  { id: 'cata', forms: ['cata-'], meaning: '向下（down）', order: 22 },
  { id: 'ex', forms: ['ex-', 'e-', 'ec-', 'ef-'], meaning: '向外、加強（out, intensifier）', order: 23 },
  { id: 'ab', forms: ['ab-', 'abs-'], meaning: '離開、脫離（away, from）', order: 24 },
  { id: 'se', forms: ['se-'], meaning: '分開（apart）', order: 25 },
  { id: 'tele', forms: ['tele-'], meaning: '遠（far）', order: 26 },
  { id: 'de', forms: ['de-'], meaning: '不、向下、離開、加強（not, down, away, intensifier）', order: 27 },
  { id: 'con', forms: ['con-', 'com-', 'col-', 'cor-', 'co-'], meaning: '共同、加強（together, intensifier）', order: 28 },
  { id: 'syn', forms: ['syn-', 'sym-'], meaning: '相同、共同（same, together）', order: 29 },
  { id: 'per', forms: ['per-'], meaning: '穿過、加強（through, intensifier）', order: 30 },
  { id: 'trans', forms: ['trans-'], meaning: '橫越（across）', order: 31 },
  { id: 'dia', forms: ['dia-'], meaning: '穿過、橫越（through, across）', order: 32 },
  { id: 'inter', forms: ['inter-'], meaning: '之間（between）', order: 33 },
  { id: 'micro', forms: ['micro-'], meaning: '微小（tiny）', order: 34 },
  { id: 'multi', forms: ['multi-'], meaning: '多（many）', order: 35 },
  { id: 'poly', forms: ['poly-'], meaning: '多（many）', order: 36 },
  { id: 'omni', forms: ['omni-'], meaning: '全部（all）', order: 37 },
  { id: 'bon', forms: ['bon-', 'bene-'], meaning: '好（good）', order: 38 },
  { id: 'mal', forms: ['mal-', 'male-'], meaning: '壞（bad）', order: 39 },
  { id: 'mis', forms: ['mis-'], meaning: '壞、錯（bad, wrong）', order: 40 },
  { id: 'dys', forms: ['dys-'], meaning: '壞、不良（bad）', order: 41 },
  { id: 'semi', forms: ['semi-', 'demi-', 'hemi-'], meaning: '一半（half）', order: 42 },
  { id: 'mono', forms: ['mono-'], meaning: '一（one）', order: 43 },
  { id: 'sol', forms: ['sol-'], meaning: '一（one）', order: 44 },
  { id: 'uni', forms: ['uni-'], meaning: '一（one）', order: 45 },
  { id: 'bi', forms: ['bi-'], meaning: '二（two）', order: 46 },
  { id: 'du', forms: ['du-', 'dou-'], meaning: '二（two）', order: 47 },
  { id: 'tri', forms: ['tri-'], meaning: '三（three）', order: 48 },
  { id: 'quadr', forms: ['quadr-', 'quart-'], meaning: '四（four）', order: 49 },
  { id: 'pent', forms: ['pent-'], meaning: '五（five）', order: 50 },
  { id: 'quint', forms: ['quint-'], meaning: '五（five）', order: 51 },
  { id: 'hexa', forms: ['hexa-', 'sexa-'], meaning: '六（six）', order: 52 },
  { id: 'sept', forms: ['sept-', 'hept-'], meaning: '七（seven）', order: 53 },
  { id: 'octa', forms: ['octa-'], meaning: '八（eight）', order: 54 },
  { id: 'nona', forms: ['nona-', 'nano-'], meaning: '九（nine）', order: 55 },
  { id: 'deca', forms: ['deca-'], meaning: '十（ten）', order: 56 },
  { id: 'cent', forms: ['cent-'], meaning: '百（hundred）', order: 57 },
  { id: 'kilo', forms: ['kilo-'], meaning: '千（thousand）', order: 58 },
  { id: 'mill', forms: ['mill-'], meaning: '千（thousand）', order: 59 },
  { id: 'mega', forms: ['mega-'], meaning: '百萬、巨大（million, great）', order: 60 },
  { id: 'giga', forms: ['giga-'], meaning: '十億、巨大（billion, giant）', order: 61 },
  // ── 第二部分：依字根排列（課本書頁 67 起）─────────────────────────────────────
  // 表示「位置」的字根
  { id: 'loc', forms: ['loc'], meaning: '位置（place）', order: 62, kind: 'root' },
  { id: 'centr', forms: ['centr'], meaning: '中心（center）', order: 63, kind: 'root' },
  { id: 'circum', forms: ['circum', 'circul'], meaning: '圓、環繞（circle, around）', order: 64, kind: 'root' },
  { id: 'found', forms: ['found', 'fund'], meaning: '底部（bottom）', order: 65, kind: 'root' },
  { id: 'radic', forms: ['radic', 'rudi'], meaning: '根（root）', order: 66, kind: 'root' },
  // 表示「大小」與「測量」的字根
  { id: 'maxi', forms: ['maxi', 'magn', 'maj'], meaning: '大（great）', order: 67, kind: 'root' },
  { id: 'aug', forms: ['aug'], meaning: '增加、大（increase, great）', order: 68, kind: 'root' },
  { id: 'grand', forms: ['grand'], meaning: '大（great）', order: 69, kind: 'root' },
  { id: 'medi', forms: ['medi', 'midi'], meaning: '中間（middle）', order: 70, kind: 'root' },
  { id: 'mini', forms: ['mini'], meaning: '小（small）', order: 71, kind: 'root' },
  { id: 'brev', forms: ['brev', 'brid'], meaning: '短（short）', order: 72, kind: 'root' },
  { id: 'meter', forms: ['meter'], meaning: '測量（measure）', order: 73, kind: 'root' },
  { id: 'mod', forms: ['mod'], meaning: '方式、尺度（manner, measure）', order: 74, kind: 'root' },
  // 表示「多少」的字根
  { id: 'plet', forms: ['plet', 'plen'], meaning: '滿、填（full, fill）', order: 75, kind: 'root' },
  { id: 'vac', forms: ['vac', 'van', 'vain'], meaning: '空（empty）', order: 76, kind: 'root' },
  { id: 'neg', forms: ['neg', 'nil', 'nul'], meaning: '無、否定（no, nothing）', order: 77, kind: 'root' },
  // 表示「新」與「第一」的字根
  { id: 'neo', forms: ['neo', 'nov'], meaning: '新（new）', order: 78, kind: 'root' },
  { id: 'prim', forms: ['prim'], meaning: '第一、最初（first）', order: 79, kind: 'root' },
  // 表示「力量」與「價值」的字根
  { id: 'val', forms: ['val', 'vail'], meaning: '價值、強（worth, strong）', order: 80, kind: 'root' },
  { id: 'dign', forms: ['dign'], meaning: '價值（worth）', order: 81, kind: 'root' },
  { id: 'forc', forms: ['forc', 'fort'], meaning: '強（strong）', order: 82, kind: 'root' },
  { id: 'dur', forms: ['dur'], meaning: '硬、持久（hard, last）', order: 83, kind: 'root' },
  { id: 'dynam', forms: ['dynam'], meaning: '力（power）', order: 84, kind: 'root' },
  { id: 'potent', forms: ['potent'], meaning: '力（power）', order: 85, kind: 'root' },
  { id: 'salut', forms: ['salut', 'san'], meaning: '健康（health）', order: 86, kind: 'root' },
  // 表示「光明」的字根
  { id: 'luc', forms: ['luc', 'lumin'], meaning: '光（light）', order: 87, kind: 'root' },
  // 表示「重」與「輕」的字根
  { id: 'grav', forms: ['grav'], meaning: '重（heavy）', order: 88, kind: 'root' },
  { id: 'lev', forms: ['lev'], meaning: '輕（light）', order: 89, kind: 'root' },
  // 表示「尖銳」與「刺激」的字根
  { id: 'stig', forms: ['stig', 'sting', 'stinct'], meaning: '刺、記號（prick, mark）', order: 90, kind: 'root' },
  { id: 'acr', forms: ['acr', 'acu'], meaning: '尖銳（sharp）', order: 91, kind: 'root' },
  { id: 'punct', forms: ['punct'], meaning: '刺、穿（prick, pierce）', order: 92, kind: 'root' },
  // 表示「記號」的字根
  { id: 'sign', forms: ['sign'], meaning: '記號（mark）', order: 93, kind: 'root' },
  // 表示「發生與結束」的字根
  { id: 'cas', forms: ['cas', 'cad', 'cid'], meaning: '落下、發生（fall, befall）', order: 94, kind: 'root' },
  { id: 'fin', forms: ['fin'], meaning: '結束、界限（end, limit）', order: 95, kind: 'root' },
  { id: 'term', forms: ['term', 'termin'], meaning: '結束、界限（end, limit）', order: 96, kind: 'root' },
  { id: 'clud', forms: ['clud', 'clus'], meaning: '關閉（close）', order: 97, kind: 'root' },
  // 表示「流動」的字根
  { id: 'flu', forms: ['flu'], meaning: '流（flow）', order: 98, kind: 'root' },
  { id: 'und', forms: ['und', 'ound'], meaning: '流、波（flow, wave）', order: 99, kind: 'root' },
  { id: 'cur', forms: ['cur', 'cour'], meaning: '跑（run）', order: 100, kind: 'root' },
  { id: 'fund', forms: ['fund', 'fus'], meaning: '傾倒、熔（pour, melt）', order: 101, kind: 'root' },
  { id: 'lav', forms: ['lav', 'luv'], meaning: '洗（wash）', order: 102, kind: 'root' },
  // 表示「分散」的字根
  { id: 'spars', forms: ['spars', 'spers'], meaning: '散（scatter）', order: 103, kind: 'root' },
  // 表示「年」與「時間」的字根
  { id: 'enni', forms: ['enni', 'annu'], meaning: '年（year）', order: 104, kind: 'root' },
  { id: 'chron', forms: ['chron'], meaning: '時間（time）', order: 105, kind: 'root' },
  { id: 'journ', forms: ['journ', 'urn'], meaning: '日（day）', order: 106, kind: 'root' },
]

const PREFIX_BY_ID: Record<string, PrefixGroup> = Object.fromEntries(
  PREFIX_GROUPS.map((g) => [g.id, g]),
)

/** 依 id 取字首分組（找不到回 undefined）。 */
export function prefixById(id: string): PrefixGroup | undefined {
  return PREFIX_BY_ID[id]
}
