// 每日元素小遊戲的出題引擎（純函式、可注入種子 → 可單元測試）。全部是「選擇題」。
//
// 一個「題目項目」是 elementSrs 的一張卡，id 形如：
//   el:<z>        某元素（問原子序/符號/組態/縮寫/價電子/族/週期，隨機輪換）
//   bond:<formula> 某化合物（問鍵別）
// 正確性全來自 elements.ts 與 bonds.ts，LLM 不參與。
import type { Element } from '@/models/elements'
import { elementByZ, QUIZ_ELEMENT_ZS } from '@/models/elements'
import { BOND_EXAMPLES, BOND_TYPE_LABEL, type BondExample } from '@/models/bonds'

export type QuestionType = 'z' | 'sym' | 'config' | 'shorthand' | 'valence' | 'group' | 'period' | 'bond'

export interface ElementQuestion {
  itemId: string // 供 elementSrs 評分
  type: QuestionType
  subject: string // 大字顯示的「題幹主體」（元素／化合物；sym 題會藏住身分）
  prompt: string // 問句
  answer: string // 正解（也必為 choices 之一）
  choices: string[] // 4 個選項（含正解，已洗牌）
  explain?: string // 作答後顯示的詳解
}

/** 所有題目項目 id（元素 + 鍵別）。 */
export const QUIZ_ITEM_IDS: string[] = [
  ...QUIZ_ELEMENT_ZS.map((z) => `el:${z}`),
  ...BOND_EXAMPLES.map((b) => `bond:${b.formula}`),
]

// ── 種子隨機（mulberry32）：同 seed → 同題，測試可重現 ──
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample<T>(pool: T[], n: number, rng: () => number): T[] {
  return shuffle(pool, rng).slice(0, n)
}

/** A choice is correct iff it equals the canonical answer. */
export function checkAnswer(q: ElementQuestion, choice: string): boolean {
  return choice === q.answer
}

// ── 元素題 ──
function elementSubject(e: Element): string {
  return e.zh ? `${e.zh}（${e.sym}）` : e.sym
}

function elementTypes(e: Element): QuestionType[] {
  const t: QuestionType[] = ['z', 'sym', 'config', 'shorthand', 'period']
  if (e.valence !== null) t.push('valence')
  if (e.group !== null) t.push('group')
  return t
}

/** 與 z 相近的其他題池元素（供選項干擾項，較似真）。 */
function neighbours(z: number, rng: () => number): Element[] {
  const others = QUIZ_ELEMENT_ZS.filter((x) => x !== z).sort((a, b) => Math.abs(a - z) - Math.abs(b - z))
  return sample(others.slice(0, 7), 3, rng).map((x) => elementByZ(x)!).filter(Boolean)
}

const GROUP_POOL = [1, 2, 3, 8, 11, 12, 13, 14, 15, 16, 17, 18]

function makeElementQuestion(e: Element, rng: () => number): ElementQuestion {
  const types = elementTypes(e)
  const type = types[Math.floor(rng() * types.length)]
  const id = `el:${e.z}`
  const recap = `${elementSubject(e)}　原子序 ${e.z}　${e.config}`
  const base = { itemId: id, type, explain: recap } as const
  const nb = neighbours(e.z, rng)

  switch (type) {
    case 'z':
      return finish({ ...base, subject: elementSubject(e), prompt: '原子序是多少？',
        answer: String(e.z), distractors: nb.map((x) => String(x.z)) }, rng)
    case 'sym':
      return finish({ ...base, subject: `原子序 ${e.z}`, prompt: '是哪一個元素？（元素符號）',
        answer: e.sym, distractors: nb.map((x) => x.sym) }, rng)
    case 'config':
      return finish({ ...base, subject: elementSubject(e), prompt: '完整電子組態是？',
        answer: e.config, distractors: nb.map((x) => x.config) }, rng)
    case 'shorthand':
      return finish({ ...base, subject: elementSubject(e), prompt: '貴氣體簡寫組態是？',
        answer: e.shorthand, distractors: nb.map((x) => x.shorthand) }, rng)
    case 'valence':
      return finish({ ...base, subject: elementSubject(e), prompt: '價電子數是多少？',
        answer: String(e.valence), distractors: [1, 2, 3, 4, 5, 6, 7, 8].filter((v) => v !== e.valence).map(String) }, rng)
    case 'group':
      return finish({ ...base, subject: elementSubject(e), prompt: '位於第幾族？',
        answer: String(e.group), distractors: GROUP_POOL.filter((g) => g !== e.group).map(String) }, rng)
    case 'period':
    default:
      return finish({ ...base, subject: elementSubject(e), prompt: '位於第幾週期？',
        answer: String(e.period), distractors: [1, 2, 3, 4, 5, 6, 7].filter((p) => p !== e.period).map(String) }, rng)
  }
}

// ── 鍵別題 ──
function makeBondQuestion(b: BondExample, rng: () => number): ElementQuestion {
  const answer = BOND_TYPE_LABEL[b.type]
  return finish(
    {
      itemId: `bond:${b.formula}`,
      type: 'bond',
      subject: `${b.formula}（${b.name}）`,
      prompt: '主要以哪一種鍵結合？',
      answer,
      // 氫鍵：常見干擾項（它是分子間作用力，非鍵的種類）。
      distractors: [BOND_TYPE_LABEL.ionic, BOND_TYPE_LABEL.covalent, BOND_TYPE_LABEL.metallic, '氫鍵'].filter((x) => x !== answer),
      explain: b.why,
    },
    rng,
  )
}

// 收尾：組裝 4 個選項（正解 + 干擾項，去重補滿）並洗牌。
function finish(
  q: Omit<ElementQuestion, 'choices'> & { distractors: string[] },
  rng: () => number,
): ElementQuestion {
  const { distractors, ...rest } = q
  const set = [q.answer]
  for (const d of distractors) {
    if (set.length >= 4) break
    if (!set.includes(d)) set.push(d)
  }
  return { ...rest, choices: shuffle(set, rng) }
}

/** 由項目 id + 種子產生一題（種子相同 → 題目相同）。未知 id 回 null。 */
export function makeQuestion(itemId: string, seed: number): ElementQuestion | null {
  const rng = mulberry32(seed)
  if (itemId.startsWith('el:')) {
    const e = elementByZ(Number(itemId.slice(3)))
    return e ? makeElementQuestion(e, rng) : null
  }
  if (itemId.startsWith('bond:')) {
    const b = BOND_EXAMPLES.find((x) => x.formula === itemId.slice(5))
    return b ? makeBondQuestion(b, rng) : null
  }
  return null
}
