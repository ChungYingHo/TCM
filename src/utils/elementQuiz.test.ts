import { describe, it, expect } from 'vitest'
import { makeQuestion, checkAnswer, QUIZ_ITEM_IDS, type ElementQuestion } from '@/utils/elementQuiz'
import { ELEMENTS, COMMON_MASS, seriesOf } from '@/models/elements'

/** First seed that yields a question matching `pred` for an item. */
function findQ(itemId: string, pred: (q: ElementQuestion) => boolean): ElementQuestion {
  for (let s = 1; s < 4000; s++) {
    const q = makeQuestion(itemId, s)
    if (q && pred(q)) return q
  }
  throw new Error(`no matching question for ${itemId}`)
}

const seriesOfSym = (sym: string) => seriesOf(ELEMENTS.find((e) => e.sym === sym)!.z)

describe('makeQuestion（週期表地基）', () => {
  it('同種子 → 同題（決定性）', () => {
    expect(makeQuestion('el:6', 42)).toEqual(makeQuestion('el:6', 42))
  })

  it('未知項目回 null；鍵別題已移除', () => {
    expect(makeQuestion('el:999', 1)).toBeNull()
    expect(makeQuestion('bond:NaCl', 1)).toBeNull()
    expect(makeQuestion('bogus', 1)).toBeNull()
  })

  it('QUIZ_ITEM_IDS 全為 el:<z>，每個都出得了題', () => {
    expect(QUIZ_ITEM_IDS).toContain('el:6')
    expect(QUIZ_ITEM_IDS.every((id) => id.startsWith('el:'))).toBe(true)
    for (const id of QUIZ_ITEM_IDS) expect(makeQuestion(id, 7), `no q for ${id}`).not.toBeNull()
  })

  it('Z=1-36 全在題池中', () => {
    for (let z = 1; z <= 36; z++) expect(QUIZ_ITEM_IDS, `el:${z} missing`).toContain(`el:${z}`)
  })

  it('全部選擇題：恰 4 個不重複選項且含正解（全項目 × 多種子）', () => {
    for (const id of QUIZ_ITEM_IDS) {
      for (let s = 1; s <= 40; s++) {
        const q = makeQuestion(id, s)!
        expect(q.choices.length, `${id}@${s}`).toBe(4)
        expect(new Set(q.choices).size, `${id}@${s} dup`).toBe(4)
        expect(q.choices, `${id}@${s} missing answer`).toContain(q.answer)
      }
    }
  })

  it('checkAnswer：只認正解', () => {
    const q = findQ('el:6', () => true)
    expect(checkAnswer(q, q.answer)).toBe(true)
    const wrong = q.choices.find((c) => c !== q.answer)!
    expect(checkAnswer(q, wrong)).toBe(false)
  })

  it('原子序↔元素雙向都會出（看到 6→碳/C、看到碳→6）', () => {
    expect(findQ('el:6', (q) => q.type === 'z2el')).toBeTruthy()
    expect(findQ('el:6', (q) => q.type === 'el2z').answer).toBe('6')
  })

  it('永不問過渡金屬的價電子（Fe 價數多變）', () => {
    for (let s = 1; s < 2000; s++) expect(makeQuestion('el:26', s)?.type).not.toBe('valence')
  })

  it('價電子題：氧 → 6', () => {
    expect(findQ('el:8', (x) => x.type === 'valence').answer).toBe('6')
  })

  it('族題以 A/B 表示：氯 → 7A、鐵 → 8B', () => {
    expect(findQ('el:17', (x) => x.type === 'group').answer).toBe('7A')
    expect(findQ('el:26', (x) => x.type === 'group').answer).toBe('8B')
  })

  it('mass 題只出現在常用原子量元素、且答案＝常用值', () => {
    for (const id of QUIZ_ITEM_IDS) {
      const z = Number(id.slice(3))
      for (let s = 1; s <= 60; s++) {
        if (makeQuestion(id, s)!.type === 'mass') expect(COMMON_MASS[z], `${id} 不在 COMMON_MASS`).toBeDefined()
      }
    }
    expect(findQ('el:17', (x) => x.type === 'mass').answer).toBe('35.5')
  })

  it('系列題：正解為該系列真成員、干擾項不在該系列（Fe 在 3d）', () => {
    const q = findQ('el:26', (x) => x.type === 'series')
    expect(q.subject).toContain('3d')
    expect(q.answer).toBe('Fe')
    expect(seriesOfSym(q.answer)).toBe('3d')
    for (const c of q.choices) if (c !== q.answer) expect(seriesOfSym(c)).not.toBe('3d')
  })
})
