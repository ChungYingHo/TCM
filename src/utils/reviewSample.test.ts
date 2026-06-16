import { describe, it, expect } from 'vitest'
import { seededSample, composeReview } from '@/utils/reviewSample'

const pool = Array.from({ length: 50 }, (_, i) => `w${i}`)

describe('seededSample', () => {
  it('is deterministic for the same seed and rotates across seeds', () => {
    const a = seededSample(pool, 10, '2026-07-01')
    const b = seededSample(pool, 10, '2026-07-01')
    const c = seededSample(pool, 10, '2026-07-02')
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
  })

  it('never duplicates and clamps to the pool size', () => {
    const s = seededSample(pool.slice(0, 5), 10, 'x')
    expect(new Set(s).size).toBe(5)
  })
})

describe('composeReview', () => {
  it('puts due words first and fills with learned words up to the target (when due fits)', () => {
    const out = composeReview(['d1', 'd2'], ['d1', 'd2', ...pool], 10, 100, '2026-07-01')
    expect(out.slice(0, 2)).toEqual(['d1', 'd2'])
    expect(out).toHaveLength(10)
    expect(new Set(out).size).toBe(10) // fill never repeats a due word
  })

  it('caps at the daily TARGET (not max) — a limited batch, not the whole due queue', () => {
    const due = Array.from({ length: 120 }, (_, i) => `d${i}`)
    const out = composeReview(due, due, 30, 100, 'x')
    expect(out).toHaveLength(30) // 120 due, but only 30 reviewed today
    expect(new Set(out).size).toBe(30)
    expect(out.every((id) => due.includes(id))).toBe(true)
  })

  it('shows a RANDOM rotating subset of the due queue — different day → different batch', () => {
    const due = Array.from({ length: 50 }, (_, i) => `d${i}`)
    const mon = composeReview(due, [], 30, 100, '2026-06-16')
    const tue = composeReview(due, [], 30, 100, '2026-06-17')
    expect(mon).toHaveLength(30)
    expect(mon).not.toEqual(tue) // rotates across days
    // stable within the same day (re-renders don't reshuffle)
    expect(composeReview(due, [], 30, 100, '2026-06-16')).toEqual(mon)
  })

  it('returns everything learned when the pool is smaller than the target', () => {
    expect(composeReview([], ['a', 'b'], 60, 100, 'x')).toHaveLength(2)
  })
})
