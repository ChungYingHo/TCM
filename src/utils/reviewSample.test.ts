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
  it('puts due words first and fills with learned words up to the target', () => {
    const out = composeReview(['d1', 'd2'], ['d1', 'd2', ...pool], 10, 100, '2026-07-01')
    expect(out.slice(0, 2)).toEqual(['d1', 'd2'])
    expect(out).toHaveLength(10)
    expect(new Set(out).size).toBe(10) // fill never repeats a due word
  })

  it('caps at max when the due queue alone exceeds it', () => {
    const due = Array.from({ length: 120 }, (_, i) => `d${i}`)
    expect(composeReview(due, due, 60, 100, 'x')).toHaveLength(100)
  })

  it('returns everything learned when the pool is smaller than the target', () => {
    expect(composeReview([], ['a', 'b'], 60, 100, 'x')).toHaveLength(2)
  })
})
