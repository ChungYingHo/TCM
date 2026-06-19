// 每日元素「測驗」的出題引擎（純函式、可注入種子 → 可單元測試）。
//
// 一個「題目項目」是 elementSrs 的一張卡，id 形如 `el:<z>`（某元素）。每張卡隨機輪換出
// 老師清單裡的題型：原子序↔元素、中/英/符號、價電子、族(A/B)、週期、常用原子量、3d/4d/5d 系列。
// 作答方式隨機輪換選擇／填充。正確性全來自 elements.ts，LLM 不參與。
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
export type InputMode = 'choice' | 'fill'

export interface ElementQuestion {
  itemId: string // 供 elementSrs 評分（el:<z>）
  type: QuestionType
  input: InputMode
  subject: string // 大字顯示的題幹主體
  prompt: string // 問句
  answer: string // 正解（choice 題必為 choices 之一；用於顯示）
  accept: string[] // 可接受的作答（fill 用，已含正規化前的多種寫法）
  choices: string[] // 4 個選項（choice 用，已洗牌；fill 為空陣列）
  explain?: string // 作答後顯示的詳解
}

/** 所有題目項目 id（逐元素題池）。 */
export const QUIZ_ITEM_IDS: string[] = QUIZ_CORE_ZS.map((z) => `el:${z}`)

// 填充作答正規化：去頭尾與內部空白、小寫（符號大小寫不敏感）。中文與數字保持原樣。
function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}

/** A choice/fill is correct iff it matches the canonical answer (choice) or any accepted form (fill). */
export function checkAnswer(q: ElementQuestion, choice: string): boolean {
  if (q.input === 'fill') {
    const norm = normalize(choice)
    return q.accept.some((a) => normalize(a) === norm)
  }
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
  if (e.valence !== null) t.push('valence') // 僅主族（過渡價數多變）
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

function makeElementQuestion(e: Element, rng: () => number): ElementQuestion {
  const types = elementTypes(e)
  const type = types[Math.floor(rng() * types.length)]
  const id = `el:${e.z}`
  const base = { itemId: id, type, explain: recap(e) } as const
  const nb = neighbours(e.z, rng)

  switch (type) {
    case 'z2el': {
      // 原子序 → 元素（看到 6 想到碳）。填充可打符號或中文；選擇給「中文（符號）」。
      const fill = rng() < 0.5
      return fill
        ? fillQ({ ...base, input: 'fill', subject: `原子序 ${e.z}`, prompt: '是哪個元素？（填符號或中文）', answer: e.sym, accept: [e.sym, e.zh].filter(Boolean) })
        : choiceQ({ ...base, input: 'choice', subject: `原子序 ${e.z}`, prompt: '是哪個元素？', answer: elementSubject(e), distractors: nb.map(elementSubject) }, rng)
    }
    case 'el2z': {
      // 元素 → 原子序（看到碳想到 6）。
      const fill = rng() < 0.5
      return fill
        ? fillQ({ ...base, input: 'fill', subject: elementSubject(e), prompt: '原子序是多少？', answer: String(e.z), accept: [String(e.z)] })
        : choiceQ({ ...base, input: 'choice', subject: elementSubject(e), prompt: '原子序是多少？', answer: String(e.z), distractors: nb.map((x) => String(x.z)) }, rng)
    }
    case 'name':
      return makeNameQuestion(e, base, nb, rng)
    case 'valence':
      return choiceQ({ ...base, input: 'choice', subject: elementSubject(e), prompt: '價電子數是多少？',
        answer: String(e.valence), distractors: [1, 2, 3, 4, 5, 6, 7, 8].filter((v) => v !== e.valence).map(String) }, rng)
    case 'group': {
      const ab = groupLabelAB(e)!
      return choiceQ({ ...base, input: 'choice', subject: elementSubject(e), prompt: '位於第幾族？（A／B 表示）',
        answer: ab, distractors: AB_GROUP_POOL.filter((g) => g !== ab) }, rng)
    }
    case 'mass': {
      const m = String(COMMON_MASS[e.z])
      const fill = rng() < 0.5
      const massPool = [...new Set(Object.values(COMMON_MASS).map(String))]
      return fill
        ? fillQ({ ...base, input: 'fill', subject: elementSubject(e), prompt: '常用原子量約為多少？', answer: m, accept: [m] })
        : choiceQ({ ...base, input: 'choice', subject: elementSubject(e), prompt: '常用原子量約為多少？', answer: m, distractors: massPool.filter((x) => x !== m) }, rng)
    }
    case 'series': {
      // 反向出題（直接背「某系列有哪些」）：3d 系列包含下列何者？正解為該系列成員、干擾項取自其他系列。
      const k = seriesOf(e.z)!
      const others = (['3d', '4d', '5d'] as const).filter((x) => x !== k).flatMap((x) => SERIES[x])
      return choiceQ({ ...base, input: 'choice', subject: `${k} 過渡系列`, prompt: '包含下列哪一個元素？',
        answer: e.sym, distractors: sample(others, 6, rng).map((z) => elementByZ(z)!.sym) }, rng)
    }
    case 'period':
    default:
      return choiceQ({ ...base, input: 'choice', subject: elementSubject(e), prompt: '位於第幾週期？',
        answer: String(e.period), distractors: [1, 2, 3, 4, 5, 6, 7].filter((p) => p !== e.period).map(String) }, rng)
  }
}

// 中／英／符號互換：隨機四向之一。答案為「符號」時可填充；答案為中／英名（較長）走選擇。
function makeNameQuestion(
  e: Element,
  base: { itemId: string; type: QuestionType; explain?: string },
  nb: Element[],
  rng: () => number,
): ElementQuestion {
  // 給定題幹（中文名或英文名）問「元素符號」：隨機選擇／填充。中文→符號、英文→符號共用。
  const askSymbol = (subject: string): ElementQuestion =>
    rng() < 0.5
      ? fillQ({ ...base, input: 'fill', subject, prompt: '元素符號是？', answer: e.sym, accept: [e.sym] })
      : choiceQ({ ...base, input: 'choice', subject, prompt: '元素符號是？', answer: e.sym, distractors: nb.map((x) => x.sym) }, rng)

  const dir = Math.floor(rng() * 4)
  switch (dir) {
    case 0: // 符號 → 中文
      return choiceQ({ ...base, input: 'choice', subject: e.sym, prompt: '中文名是？', answer: e.zh, distractors: nb.map((x) => x.zh) }, rng)
    case 1: // 符號 → 英文
      return choiceQ({ ...base, input: 'choice', subject: e.sym, prompt: '英文名是？', answer: e.en, distractors: nb.map((x) => x.en) }, rng)
    case 2: // 中文 → 符號
      return askSymbol(e.zh)
    default: // 英文 → 符號
      return askSymbol(e.en)
  }
}

// 收尾（選擇）：組裝 4 個選項（正解 + 干擾項，去重補滿）並洗牌。
function choiceQ(
  q: Omit<ElementQuestion, 'choices' | 'accept'> & { distractors: string[] },
  rng: () => number,
): ElementQuestion {
  const { distractors, ...rest } = q
  const set = [q.answer]
  for (const d of distractors) {
    if (set.length >= 4) break
    if (d && !set.includes(d)) set.push(d)
  }
  return { ...rest, accept: [q.answer], choices: shuffle(set, rng) }
}

// 收尾（填充）：無選項。
function fillQ(q: Omit<ElementQuestion, 'choices'>): ElementQuestion {
  return { ...q, choices: [] }
}

/** 由項目 id + 種子產生一題（種子相同 → 題目相同）。未知 id 回 null。 */
export function makeQuestion(itemId: string, seed: number): ElementQuestion | null {
  const rng = mulberry32(seed)
  if (itemId.startsWith('el:')) {
    const e = elementByZ(Number(itemId.slice(3)))
    return e ? makeElementQuestion(e, rng) : null
  }
  return null
}
