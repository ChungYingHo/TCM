import { describe, it, expect } from 'vitest'
import { ymd, parseYmd, todayKey } from '@/utils/date'

describe('ymd / parse', () => {
  it('round-trips a date key', () => {
    expect(ymd(parseYmd('2026-06-22'))).toBe('2026-06-22')
  })
  it('zero-pads month and day', () => {
    expect(ymd(new Date(2026, 0, 5).getTime())).toBe('2026-01-05')
  })
  it('parseYmd returns NaN for a malformed key, a valid timestamp otherwise', () => {
    expect(Number.isNaN(parseYmd(''))).toBe(true)
    expect(Number.isNaN(parseYmd('2026-06'))).toBe(true)
    expect(Number.isNaN(parseYmd('not-a-date'))).toBe(true)
    expect(Number.isNaN(parseYmd('2026-06-22'))).toBe(false)
  })
})

describe('todayKey', () => {
  it('rolls the study day over at 05:00, not midnight', () => {
    const at = (h: number) => new Date(2026, 5, 22, h, 0, 0).getTime()
    expect(todayKey(at(2))).toBe('2026-06-21')
    expect(todayKey(at(4))).toBe('2026-06-21')
    expect(todayKey(at(5))).toBe('2026-06-22')
    expect(todayKey(at(23))).toBe('2026-06-22')
  })
})
