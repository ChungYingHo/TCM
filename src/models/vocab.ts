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
]

const PREFIX_BY_ID: Record<string, PrefixGroup> = Object.fromEntries(
  PREFIX_GROUPS.map((g) => [g.id, g]),
)

/** 依 id 取字首分組（找不到回 undefined）。 */
export function prefixById(id: string): PrefixGroup | undefined {
  return PREFIX_BY_ID[id]
}
