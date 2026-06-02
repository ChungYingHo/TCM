import { describe, it, expect, beforeEach } from 'vitest'
import { recordWrong, removeWrong, isInWrongBook, listWrong, clearWrongBook } from '@/utils/wrongBook'

describe('wrongBook (localStorage-backed)', () => {
  beforeEach(() => clearWrongBook())

  it('records a wrong answer and finds it', () => {
    recordWrong('q1', ['A'], 1000)
    expect(isInWrongBook('q1')).toBe(true)
    expect(listWrong()[0].wrongCount).toBe(1)
  })

  it('increments wrong count on repeat', () => {
    recordWrong('q1', ['A'], 1000)
    recordWrong('q1', ['B'], 2000)
    const e = listWrong().find((x) => x.id === 'q1')!
    expect(e.wrongCount).toBe(2)
    expect(e.lastChoice).toEqual(['B'])
    expect(e.lastWrongAt).toBe(2000)
  })

  it('sorts by wrong count descending (prioritization)', () => {
    recordWrong('q1', ['A'], 1000)
    recordWrong('q2', ['A'], 1000)
    recordWrong('q2', ['A'], 1100)
    expect(listWrong().map((e) => e.id)).toEqual(['q2', 'q1'])
  })

  it('removes an entry', () => {
    recordWrong('q1', ['A'], 1000)
    removeWrong('q1')
    expect(isInWrongBook('q1')).toBe(false)
    expect(listWrong()).toHaveLength(0)
  })

  it('persists across reads (round-trip via storage)', () => {
    recordWrong('q9', ['C'], 5000)
    expect(listWrong().find((e) => e.id === 'q9')?.lastChoice).toEqual(['C'])
  })
})
