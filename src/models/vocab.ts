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

// ── 字首分組 —— 單一資料來源（字首相關 UI 一律讀這張表，勿散落硬寫）───────────────
// 依老師教法排序；forms 收同一字首的拼寫變體（子音同化造成，如 in-→il-/im-/ir-）。

export interface PrefixGroup {
  id: string // 穩定 id，對應 VocabWord.prefixId
  forms: string[] // 字首拼法變體，如 ['in-', 'il-', 'im-', 'ir-']
  meaning: string // 白話字義（中文＋英文）
  order: number // 顯示順序（老師教法原序）
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
]

const PREFIX_BY_ID: Record<string, PrefixGroup> = Object.fromEntries(
  PREFIX_GROUPS.map((g) => [g.id, g]),
)

/** 依 id 取字首分組（找不到回 undefined）。 */
export function prefixById(id: string): PrefixGroup | undefined {
  return PREFIX_BY_ID[id]
}
