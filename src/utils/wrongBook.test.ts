import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordWrong,
  removeWrong,
  isInWrongBook,
  listWrong,
  clearWrongBook,
  gradeReview,
  dueEntries,
  dueCount,
} from '@/utils/wrongBook'

const DAY = 86_400_000

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

describe('spaced repetition (Leitner scheduling)', () => {
  beforeEach(() => clearWrongBook())

  it('a fresh wrong answer is due immediately (box 1)', () => {
    const now = 10 * DAY
    recordWrong('q1', ['A'], now)
    const e = listWrong()[0]
    expect(e.box).toBe(1)
    expect(e.due).toBe(now)
    expect(dueCount(now)).toBe(1)
  })

  it('a correct review advances the box and pushes the due date out', () => {
    const now = 10 * DAY
    recordWrong('q1', ['A'], now)
    gradeReview('q1', true, now)
    const e = listWrong()[0]
    expect(e.box).toBe(2)
    expect(e.due).toBe(now + 1 * DAY) // INTERVAL_DAYS[2] = 1
    expect(dueCount(now)).toBe(0) // no longer due today
    expect(dueCount(now + 1 * DAY)).toBe(1) // due tomorrow
  })

  it('a wrong review resets to box 1, due now', () => {
    const now = 10 * DAY
    recordWrong('q1', ['A'], now)
    gradeReview('q1', true, now) // box 2
    gradeReview('q1', true, now) // box 3
    gradeReview('q1', false, now) // reset
    const e = listWrong()[0]
    expect(e.box).toBe(1)
    expect(e.due).toBe(now)
  })

  it('the box caps at the longest interval', () => {
    const now = 0
    recordWrong('q1', ['A'], now)
    for (let i = 0; i < 20; i++) gradeReview('q1', true, now)
    const e = listWrong()[0]
    expect(e.box).toBe(7) // INTERVAL_DAYS has 8 entries (boxes 0..7)
    expect(e.due).toBe(now + 75 * DAY)
  })

  it('dueEntries returns only due cards, soonest first', () => {
    const now = 100 * DAY
    recordWrong('soon', ['A'], now)
    recordWrong('later', ['A'], now)
    gradeReview('later', true, now) // due in 1 day
    recordWrong('overdue', ['A'], now - 5 * DAY)
    const due = dueEntries(now).map((e) => e.id)
    expect(due).toEqual(['overdue', 'soon']) // 'later' not yet due
  })

  it('gradeReview is a no-op for unknown ids', () => {
    expect(() => gradeReview('nope', true, 0)).not.toThrow()
    expect(listWrong()).toHaveLength(0)
  })
})
