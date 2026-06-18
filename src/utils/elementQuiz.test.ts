import { describe, it, expect } from 'vitest'
import { makeQuestion, checkAnswer, QUIZ_ITEM_IDS, type ElementQuestion } from '@/utils/elementQuiz'

/** First seed that yields a question matching `pred` for an item. */
function findQ(itemId: string, pred: (q: ElementQuestion) => boolean): ElementQuestion {
  for (let s = 1; s < 2000; s++) {
    const q = makeQuestion(itemId, s)
    if (q && pred(q)) return q
  }
  throw new Error(`no matching question for ${itemId}`)
}

describe('makeQuestion (all multiple-choice)', () => {
  it('is deterministic for the same seed', () => {
    expect(makeQuestion('el:6', 42)).toEqual(makeQuestion('el:6', 42))
  })

  it('returns null for unknown items', () => {
    expect(makeQuestion('el:999', 1)).toBeNull()
    expect(makeQuestion('bogus', 1)).toBeNull()
  })

  it('QUIZ_ITEM_IDS covers elements and bonds, and every item generates a question', () => {
    expect(QUIZ_ITEM_IDS).toContain('el:6')
    expect(QUIZ_ITEM_IDS).toContain('bond:NaCl')
    for (const id of QUIZ_ITEM_IDS) expect(makeQuestion(id, 7), `no q for ${id}`).not.toBeNull()
  })

  it('every question has exactly 4 unique choices including the answer (all items × many seeds)', () => {
    // Wide seed sweep so a future QUIZ_ELEMENT_ZS edit that collapses a distractor pool
    // (e.g. too-close neighbours sharing a config) fails loudly here, not silently in the UI.
    for (const id of QUIZ_ITEM_IDS) {
      for (let s = 1; s <= 40; s++) {
        const q = makeQuestion(id, s)!
        expect(q.choices.length, `${id}@${s}`).toBe(4)
        expect(new Set(q.choices).size, `${id}@${s} dup`).toBe(4)
        expect(q.choices, `${id}@${s} missing answer`).toContain(q.answer)
      }
    }
  })

  it('checkAnswer: only the exact answer choice is correct', () => {
    const q = makeQuestion('el:6', 1)!
    expect(checkAnswer(q, q.answer)).toBe(true)
    const wrong = q.choices.find((c) => c !== q.answer)!
    expect(checkAnswer(q, wrong)).toBe(false)
  })

  it('never asks valence for a transition metal (Fe has variable valence)', () => {
    for (let s = 1; s < 1500; s++) expect(makeQuestion('el:26', s)?.type).not.toBe('valence')
  })

  it('a carbon config question carries the full config as the answer choice', () => {
    const q = findQ('el:6', (x) => x.type === 'config')
    expect(q.answer).toBe('1s²2s²2p²')
    expect(q.choices).toContain('1s²2s²2p²')
  })

  it('bond question answers the bond type, with 氫鍵 as a distractor', () => {
    const q = findQ('bond:NaCl', (x) => x.type === 'bond')
    expect(q.answer).toBe('離子鍵')
    expect(q.choices).toContain('氫鍵') // the intermolecular-force distractor
    expect(q.choices.length).toBe(4)
  })
})
