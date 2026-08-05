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

  // 這條是 2026-08-05 的回歸測試：積欠很多時**只准動呈現順序，不准動選誰**。
  // 舊版是從整個到期堆純隨機抽 cap 個，逾期最久的字可能連續好幾週都抽不到 —— Aira 反映
  // 「前面的單字正在快速忘記」的主因之一。
  it('積欠超過上限時，取最久沒複習的那一批（不是從整堆隨機抽）', () => {
    const due = Array.from({ length: 50 }, (_, i) => `d${i}`) // 已依 due 由舊到新
    const mon = composeReview(due, [], 30, 100, '2026-06-16')
    const tue = composeReview(due, [], 30, 100, '2026-06-17')
    const oldest = new Set(due.slice(0, 30))

    expect(mon).toHaveLength(30)
    expect(mon.every((id) => oldest.has(id))).toBe(true) // 一定是最舊的 30 個
    expect(tue.every((id) => oldest.has(id))).toBe(true) // 換一天也還是那 30 個
    expect([...mon].sort()).toEqual([...tue].sort()) // 選誰不變
    expect(mon).not.toEqual(tue) // 只有順序每天不同
    // 同一天內穩定（重新 render 不會重洗）
    expect(composeReview(due, [], 30, 100, '2026-06-16')).toEqual(mon)
  })

  it('最舊的先還完才輪到下一批', () => {
    const due = Array.from({ length: 50 }, (_, i) => `d${i}`)
    const first = composeReview(due, [], 30, 100, 'x')
    // 還完前 30 個之後，剩下的 20 個才進得來
    const after = composeReview(due.slice(30), [], 30, 100, 'x')
    expect(new Set(first).has('d49')).toBe(false)
    expect(after).toContain('d49')
  })

  it('returns everything learned when the pool is smaller than the target', () => {
    expect(composeReview([], ['a', 'b'], 60, 100, 'x')).toHaveLength(2)
  })
})
