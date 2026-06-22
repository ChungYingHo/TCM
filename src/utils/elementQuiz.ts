// 每日元素「測驗」的出題引擎（純函式、可注入種子 → 可單元測試）。
//
// 一個「題目項目」是 elementSrs 的一張卡，id 形如 `el:<z>`（某元素）。每張卡隨機輪換出
// 老師清單裡的題型：原子序↔元素、中/英/符號、價電子、族(A/B)、週期、常用原子量、3d/4d/5d 系列。
// 全部選擇題（手機打字不方便）。正確性全來自 elements.ts，LLM 不參與。
import type { Element } from '@/models/elements'
import {
  elementByZ,
  groupLabelAB,
  seriesOf,
  COMMON_MASS,
  SERIES,
  QUIZ_CORE_ZS,
} from '@/models/elements'
import { mulberry32, shuffle, sample } from '@/utils/rng'

export type QuestionType = 'z2el' | 'el2z' | 'name' | 'valence' | 'group' | 'period' | 'mass' | 'series'

export interface ElementQuestion {
  itemId: string // 供 elementSrs 評分（el:<z>）
  type: QuestionType
  subject: string // 大字顯示的題幹主體
  prompt: string // 問句
  answer: string // 正解（必為 choices 之一）
  choices: string[] // 4 個選項（已洗牌）
  explain?: string // 作答後顯示的詳解
}

export interface QuizMode {
  key: string
  types: QuestionType[]
  label: string
  example: [string, string]
}

export const QUIZ_MODES: QuizMode[] = [
  { key: 'z', types: ['z2el', 'el2z'], label: '原子序 ↔ 元素', example: ['26', 'Fe 鐵'] },
  { key: 'name', types: ['name'], label: '名稱 ↔ 符號', example: ['Gold', 'Au'] },
  { key: 'mass', types: ['mass'], label: '原子量', example: ['Fe', '55.85'] },
  { key: 'valence', types: ['valence'], label: '價電子', example: ['O', '6'] },
  { key: 'group', types: ['group'], label: '族（A/B）', example: ['Cl', '7A'] },
  { key: 'period', types: ['period'], label: '週期', example: ['Na', '3'] },
  { key: 'series', types: ['series'], label: 'd 系列', example: ['3d', 'Fe'] },
]

/** 所有題目項目 id（逐元素題池）。 */
export const QUIZ_ITEM_IDS: string[] = QUIZ_CORE_ZS.map((z) => `el:${z}`)

/** 一組元素能出哪些題型。 */
export function availableTypesForElements(zs: number[]): Set<QuestionType> {
  const types = new Set<QuestionType>()
  for (const z of zs) {
    const e = elementByZ(z)
    if (e) for (const t of elementTypes(e)) types.add(t)
  }
  return types
}

/** 在指定題型下，有幾個元素能出題。 */
export function quizzableCount(zs: number[], allowedTypes?: QuestionType[]): number {
  if (!allowedTypes?.length) return zs.filter((z) => elementByZ(z)).length
  return zs.filter((z) => {
    const e = elementByZ(z)
    if (!e) return false
    return elementTypes(e).some((t) => allowedTypes.includes(t))
  }).length
}

/** 選項相符即正確。 */
export function checkAnswer(q: ElementQuestion, choice: string): boolean {
  return choice === q.answer
}

// ── 元素題 ──
function elementSubject(e: Element): string {
  return e.zh ? `${e.zh}（${e.sym}）` : e.sym
}

function recap(e: Element): string {
  const ab = groupLabelAB(e)
  return `${elementSubject(e)}　原子序 ${e.z}${ab ? `　${ab} 族` : ''}　第 ${e.period} 週期　${e.config}`
}

function elementTypes(e: Element): QuestionType[] {
  const t: QuestionType[] = ['z2el', 'el2z', 'name', 'group', 'period']
  if (e.valence !== null) t.push('valence')
  if (COMMON_MASS[e.z] !== undefined) t.push('mass')
  if (seriesOf(e.z)) t.push('series')
  return t
}

/** 與 z 相近的其他題池元素（供選項干擾項，較似真）。 */
function neighbours(z: number, rng: () => number): Element[] {
  const others = QUIZ_CORE_ZS.filter((x) => x !== z).sort((a, b) => Math.abs(a - z) - Math.abs(b - z))
  return sample(others.slice(0, 7), 3, rng).map((x) => elementByZ(x)!).filter(Boolean)
}

const AB_GROUP_POOL = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B']

function makeElementQuestion(e: Element, rng: () => number, allowedTypes?: QuestionType[]): ElementQuestion | null {
  let types = elementTypes(e)
  if (allowedTypes?.length) types = types.filter((t) => allowedTypes.includes(t))
  if (!types.length) return null
  const type = types[Math.floor(rng() * types.length)]
  const id = `el:${e.z}`
  const base = { itemId: id, type, explain: recap(e) } as const
  const nb = neighbours(e.z, rng)

  switch (type) {
    case 'z2el':
      return choiceQ({ ...base, subject: `原子序 ${e.z}`, prompt: '是哪個元素？', answer: elementSubject(e), distractors: nb.map(elementSubject) }, rng)
    case 'el2z':
      return choiceQ({ ...base, subject: elementSubject(e), prompt: '原子序是多少？', answer: String(e.z), distractors: nb.map((x) => String(x.z)) }, rng)
    case 'name':
      return makeNameQuestion(e, base, nb, rng)
    case 'valence':
      return choiceQ({ ...base, subject: elementSubject(e), prompt: '價電子數是多少？',
        answer: String(e.valence), distractors: [1, 2, 3, 4, 5, 6, 7, 8].filter((v) => v !== e.valence).map(String) }, rng)
    case 'group': {
      const ab = groupLabelAB(e)!
      return choiceQ({ ...base, subject: elementSubject(e), prompt: '位於第幾族？（A／B 表示）',
        answer: ab, distractors: AB_GROUP_POOL.filter((g) => g !== ab) }, rng)
    }
    case 'mass': {
      const m = String(COMMON_MASS[e.z])
      const massPool = [...new Set(Object.values(COMMON_MASS).map(String))]
      return choiceQ({ ...base, subject: elementSubject(e), prompt: '常用原子量約為多少？', answer: m, distractors: massPool.filter((x) => x !== m) }, rng)
    }
    case 'series': {
      const k = seriesOf(e.z)!
      const others = (['3d', '4d', '5d'] as const).filter((x) => x !== k).flatMap((x) => SERIES[x])
      return choiceQ({ ...base, subject: `${k} 過渡系列`, prompt: '包含下列哪一個元素？',
        answer: e.sym, distractors: sample(others, 6, rng).map((z) => elementByZ(z)!.sym) }, rng)
    }
    case 'period':
    default:
      return choiceQ({ ...base, subject: elementSubject(e), prompt: '位於第幾週期？',
        answer: String(e.period), distractors: [1, 2, 3, 4, 5, 6, 7].filter((p) => p !== e.period).map(String) }, rng)
  }
}

// 中／英／符號互換：隨機四向之一，全部選擇題。
function makeNameQuestion(
  e: Element,
  base: { itemId: string; type: QuestionType; explain?: string },
  nb: Element[],
  rng: () => number,
): ElementQuestion {
  const dir = Math.floor(rng() * 4)
  switch (dir) {
    case 0: // 符號 → 中文
      return choiceQ({ ...base, subject: e.sym, prompt: '中文名是？', answer: e.zh, distractors: nb.map((x) => x.zh) }, rng)
    case 1: // 符號 → 英文
      return choiceQ({ ...base, subject: e.sym, prompt: '英文名是？', answer: e.en, distractors: nb.map((x) => x.en) }, rng)
    case 2: // 中文 → 符號
      return choiceQ({ ...base, subject: e.zh, prompt: '元素符號是？', answer: e.sym, distractors: nb.map((x) => x.sym) }, rng)
    default: // 英文 → 符號
      return choiceQ({ ...base, subject: e.en, prompt: '元素符號是？', answer: e.sym, distractors: nb.map((x) => x.sym) }, rng)
  }
}

// 組裝 4 個選項（正解 + 干擾項，去重補滿）並洗牌。
function choiceQ(
  q: Omit<ElementQuestion, 'choices'> & { distractors: string[] },
  rng: () => number,
): ElementQuestion {
  const { distractors, ...rest } = q
  const set = [q.answer]
  for (const d of distractors) {
    if (set.length >= 4) break
    if (d && !set.includes(d)) set.push(d)
  }
  return { ...rest, choices: shuffle(set, rng) }
}

/** 由項目 id + 種子產生一題（種子相同 → 題目相同）。未知 id 回 null。 */
export function makeQuestion(itemId: string, seed: number, allowedTypes?: QuestionType[]): ElementQuestion | null {
  const rng = mulberry32(seed)
  if (itemId.startsWith('el:')) {
    const e = elementByZ(Number(itemId.slice(3)))
    return e ? makeElementQuestion(e, rng, allowedTypes) : null
  }
  return null
}
