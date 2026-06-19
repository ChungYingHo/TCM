import { describe, it, expect } from 'vitest'
import { makeQuestion, checkAnswer, QUIZ_ITEM_IDS, type AAQuestion } from '@/utils/aminoAcidQuiz'
import { AMINO_ACIDS } from '@/models/aminoAcids'

function findQ(id: string, pred: (q: AAQuestion) => boolean): AAQuestion {
  for (let s = 1; s < 4000; s++) {
    const q = makeQuestion(id, s)
    if (q && pred(q)) return q
  }
  throw new Error(`no matching question for ${id}`)
}

describe('aminoAcidQuiz（結構／中文／英文／簡寫 互換）', () => {
  it('同種子 → 同題（決定性）', () => {
    expect(makeQuestion('aa:S', 42)).toEqual(makeQuestion('aa:S', 42))
  })

  it('未知 id 回 null', () => {
    expect(makeQuestion('el:6', 1)).toBeNull()
    expect(makeQuestion('aa:ZZ', 1)).toBeNull()
    expect(makeQuestion('bogus', 1)).toBeNull()
  })

  it('QUIZ_ITEM_IDS ＝ 20 個 aa:，每個都出得了題', () => {
    expect(QUIZ_ITEM_IDS).toHaveLength(20)
    expect(QUIZ_ITEM_IDS.every((id) => id.startsWith('aa:'))).toBe(true)
    for (const id of QUIZ_ITEM_IDS) expect(makeQuestion(id, 7), id).not.toBeNull()
  })

  it('每題 4 選項、answer 索引有效、只有正解為真、選項同型（全文字或全結構）', () => {
    for (const id of QUIZ_ITEM_IDS) {
      for (let s = 1; s <= 40; s++) {
        const q = makeQuestion(id, s)!
        expect(q.choices.length, `${id}@${s}`).toBe(4)
        expect(q.answer, `${id}@${s}`).toBeGreaterThanOrEqual(0)
        expect(q.answer, `${id}@${s}`).toBeLessThan(4)
        expect(checkAnswer(q, q.answer)).toBe(true)
        for (let k = 0; k < 4; k++) if (k !== q.answer) expect(checkAnswer(q, k)).toBe(false)
        const struct = q.choices.filter((c) => c.code).length
        expect(struct === 0 || struct === 4, `${id}@${s} 選項混型`).toBe(true)
      }
    }
  })

  it('s2x：結構當題幹、文字選項，正解對應該胺基酸的某面向', () => {
    const q = findQ('aa:C', (x) => x.type === 's2x')
    expect(q.subjectCode).toBe('C')
    expect(q.choices.every((c) => c.text && !c.code)).toBe(true)
    const C = AMINO_ACIDS.find((a) => a.code1 === 'C')!
    expect([C.zh, C.en, C.code3, C.code1]).toContain(q.choices[q.answer].text)
  })

  it('x2s：文字當題幹、結構選項，正解結構＝該胺基酸', () => {
    const q = findQ('aa:C', (x) => x.type === 'x2s')
    expect(q.subjectText).toBeTruthy()
    expect(q.choices.every((c) => c.code && !c.text)).toBe(true)
    expect(q.choices[q.answer].code).toBe('C')
  })

  it('只考 結構/中文/英文/簡寫——不出現「分類」題', () => {
    for (let s = 1; s <= 400; s++) expect(makeQuestion('aa:A', s)!.prompt).not.toContain('類')
  })
})
