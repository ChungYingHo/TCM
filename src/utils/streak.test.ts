import { describe, it, expect, beforeEach } from 'vitest'
import { getStreak, touchStreak, replaceStreak } from '@/utils/streak'

const DAY = 86_400_000
// a fixed local noon, so day boundaries don't depend on the test runner's TZ edge cases
const at = (dayOffset: number) => new Date(2026, 0, 10, 12, 0, 0).getTime() + dayOffset * DAY

describe('study streak', () => {
  beforeEach(() => localStorage.clear())

  it('starts at zero', () => {
    expect(getStreak()).toEqual({ lastDay: '', count: 0, best: 0 })
  })

  it('first activity sets the streak to 1', () => {
    touchStreak(at(0))
    expect(getStreak().count).toBe(1)
    expect(getStreak().best).toBe(1)
  })

  it('is idempotent within the same day', () => {
    touchStreak(at(0))
    touchStreak(at(0) + 3 * 3600_000) // 3h later, same day
    expect(getStreak().count).toBe(1)
  })

  it('consecutive days increment the count', () => {
    touchStreak(at(0))
    touchStreak(at(1))
    touchStreak(at(2))
    expect(getStreak().count).toBe(3)
    expect(getStreak().best).toBe(3)
  })

  it('a skipped day resets the count but preserves the best', () => {
    touchStreak(at(0))
    touchStreak(at(1)) // count 2, best 2
    touchStreak(at(3)) // gap → reset to 1
    const s = getStreak()
    expect(s.count).toBe(1)
    expect(s.best).toBe(2)
  })

  it('replaceStreak restores a synced snapshot', () => {
    replaceStreak({ lastDay: '2026-01-01', count: 5, best: 9 })
    expect(getStreak()).toEqual({ lastDay: '2026-01-01', count: 5, best: 9 })
  })
})
