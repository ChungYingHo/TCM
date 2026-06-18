import { describe, it, expect } from 'vitest'
import { ymd, parseYmd, dayDiff, dayType, dayKind, isTaper, TAPER_DAYS, todayKey } from '@/utils/date'

describe('ymd / parse / diff', () => {
  it('round-trips a date key', () => {
    expect(ymd(parseYmd('2026-06-22'))).toBe('2026-06-22')
  })
  it('zero-pads month and day', () => {
    expect(ymd(new Date(2026, 0, 5).getTime())).toBe('2026-01-05')
  })
  it('counts whole days between dates (signed)', () => {
    expect(dayDiff('2026-06-22', '2026-06-29')).toBe(7)
    expect(dayDiff('2026-06-29', '2026-06-22')).toBe(-7)
  })
  it('parseYmd returns NaN for a malformed key, a valid timestamp otherwise', () => {
    expect(Number.isNaN(parseYmd(''))).toBe(true)
    expect(Number.isNaN(parseYmd('2026-06'))).toBe(true)
    expect(Number.isNaN(parseYmd('not-a-date'))).toBe(true)
    expect(Number.isNaN(parseYmd('2026-06-22'))).toBe(false)
  })
})

describe('study rhythm (clock-based, calendar-decoupled)', () => {
  it('weekdays are full study days; Saturday/Sunday are weekend buffer', () => {
    expect(dayType('2026-06-22')).toBe('full') // Monday
    expect(dayType('2026-06-17')).toBe('full') // Wednesday
    expect(dayType('2026-06-16')).toBe('full') // Tuesday — no more biweekly 高雄 special-casing
    expect(dayType('2026-06-20')).toBe('weekend') // Saturday
    expect(dayType('2026-06-21')).toBe('weekend') // Sunday
  })

  it('isTaper is true only inside the pre-exam window', () => {
    const exam = '2027-02-01'
    expect(isTaper('2027-01-25', exam)).toBe(true) // 7 days out (< 14)
    expect(isTaper('2027-01-01', exam)).toBe(false) // 31 days out
    expect(TAPER_DAYS).toBe(14)
  })

  it('dayKind: weekend takes precedence, then taper, then full', () => {
    const exam = '2027-02-01'
    expect(dayKind('2026-06-20', exam)).toBe('weekend') // Sat, far from exam
    expect(dayKind('2026-06-17', exam)).toBe('full') // Wed, far from exam
    expect(dayKind('2027-01-20', exam)).toBe('taper') // Wed inside the 14-day taper
    expect(dayKind('2027-01-23', exam)).toBe('weekend') // Sat inside the taper → still weekend
  })

  it('todayKey rolls the study day over at 05:00, not midnight', () => {
    const at = (h: number) => new Date(2026, 5, 22, h, 0, 0).getTime() // June 22 (local), hour h
    expect(todayKey(at(2))).toBe('2026-06-21') // 02:00 → still the 21st (late-night study)
    expect(todayKey(at(4))).toBe('2026-06-21') // 04:00 → still the 21st
    expect(todayKey(at(5))).toBe('2026-06-22') // 05:00 → flips to the 22nd
    expect(todayKey(at(23))).toBe('2026-06-22') // 23:00 → the 22nd
  })
})
