// 今日胺基酸測驗的出題引擎（純函式、可注入種子 → 可單元測試）。
// 老師重點：結構 ↔ 中文名 ↔ 英文 ↔ 簡寫（三/一字母）四者互相對照——不考分類。
// 做法：每題隨機挑「題幹面向 from」與「作答面向 to」兩個不同面向出題，涵蓋所有兩兩對照：
//   from/to ∈ { 結構, 中文, 英文, 三字母, 一字母 }；其一為「結構」時就出/選結構圖。
// 一個「題目項目」是 aminoAcidSrs 的一張卡，id 形如 `aa:<code1>`。
// 正確性全來自 aminoAcids.ts（結構由 aminoAcidStructure.ts 畫，已對照課本），LLM 不參與。
import type { AminoAcid } from '@/models/aminoAcids'
import { AMINO_ACIDS, AA_CATEGORY_LABEL } from '@/models/aminoAcids'
import { mulberry32, shuffle, sample } from '@/utils/rng'

export type AAQType = 's2x' | 'x2s' | 't2t' // 結構→文字 / 文字→結構 / 文字→文字

/** 一個選項：有 code → 渲染結構圖；有 text → 純文字。 */
export interface AAChoice {
  text?: string
  code?: string
}

export interface AAQuestion {
  itemId: string // 供 aminoAcidSrs 評分（aa:<code1>）
  type: AAQType
  prompt: string
  subjectCode?: string // 以結構圖當題幹
  subjectText?: string // 以文字當題幹
  choices: AAChoice[] // 4 個（含正解，已洗牌）
  answer: number // 正解索引
  explain: string // 作答後詳解
}

/** 所有題目項目 id（20 個胺基酸）。 */
export const QUIZ_ITEM_IDS: string[] = AMINO_ACIDS.map((a) => `aa:${a.code1}`)

const byCode = new Map(AMINO_ACIDS.map((a) => [a.code1, a]))

/** 索引相符即正確（選項可能是結構圖，故用索引而非字串比對）。 */
export function checkAnswer(q: AAQuestion, idx: number): boolean {
  return idx === q.answer
}

// 五個對照面向。'struct' 走結構圖；其餘走文字。
type Facet = 'struct' | 'zh' | 'en' | 'code3' | 'code1'
const FACETS: Facet[] = ['struct', 'zh', 'en', 'code3', 'code1']

function textVal(a: AminoAcid, f: Exclude<Facet, 'struct'>): string {
  return f === 'zh' ? a.zh : f === 'en' ? a.en : f === 'code3' ? a.code3 : a.code1
}
const PROMPT: Record<Facet, string> = {
  struct: '結構是哪一個？',
  zh: '中文名是？',
  en: '英文名是？',
  code3: '三字母簡寫是？',
  code1: '一字母簡寫是？',
}

function recap(a: AminoAcid): string {
  return `${a.zh} ${a.en}（${a.code3}・${a.code1}）｜${AA_CATEGORY_LABEL[a.category]}${a.essential ? '・必需' : ''}｜側鏈 ${a.r}`
}

function makeQ(a: AminoAcid, rng: () => number): AAQuestion {
  const itemId = `aa:${a.code1}`
  const to = FACETS[Math.floor(rng() * FACETS.length)]
  const fromPool = FACETS.filter((f) => f !== to)
  const from = fromPool[Math.floor(rng() * fromPool.length)]
  const nb = sample(AMINO_ACIDS.filter((x) => x.code1 !== a.code1), 3, rng)
  const opts = shuffle([a, ...nb], rng)

  const choices: AAChoice[] = to === 'struct' ? opts.map((x) => ({ code: x.code1 })) : opts.map((x) => ({ text: textVal(x, to) }))
  const subject = from === 'struct' ? { subjectCode: a.code1 } : { subjectText: textVal(a, from) }
  const type: AAQType = from === 'struct' ? 's2x' : to === 'struct' ? 'x2s' : 't2t'

  return { itemId, type, prompt: PROMPT[to], ...subject, choices, answer: opts.indexOf(a), explain: recap(a) }
}

/** 由項目 id + 種子產生一題（種子相同 → 題目相同）。未知 id 回 null。 */
export function makeQuestion(itemId: string, seed: number): AAQuestion | null {
  if (!itemId.startsWith('aa:')) return null
  const a = byCode.get(itemId.slice(3))
  return a ? makeQ(a, mulberry32(seed)) : null
}
