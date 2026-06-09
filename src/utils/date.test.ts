import { describe, it, expect } from 'vitest'
import { ymd, parseYmd, dayDiff, dayType, fullStudyDays, isTaper, DEFAULT_RHYTHM } from '@/utils/date'

const DAY = 86_400_000

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
})

describe('study rhythm (humane pacing)', () => {
  const start = '2026-06-22'

  it('marks the configured weekday light/rest, every other day full', () => {
    for (let i = 0; i < 14; i++) {
      const key = ymd(parseYmd(start) + i * DAY)
      const weekday = new Date(parseYmd(key)).getDay()
      const t = dayType(key, start)
      if (weekday === DEFAULT_RHYTHM.lightWeekday) expect(['light', 'rest']).toContain(t)
      else expect(t).toBe('full')
    }
  })

  it('turns every Nth light day into a full rest day', () => {
    const lightTypes: string[] = []
    for (let t = parseYmd(start); lightTypes.length < DEFAULT_RHYTHM.restEveryNCycles * 2; t += DAY) {
      if (new Date(t).getDay() === DEFAULT_RHYTHM.lightWeekday) lightTypes.push(dayType(ymd(t), start))
    }
    expect(lightTypes[0]).toBe('light')
    expect(lightTypes[DEFAULT_RHYTHM.restEveryNCycles - 1]).toBe('rest')
  })

  it('fullStudyDays excludes the weekly light day (one per 7-day span)', () => {
    const span = 7
    const end = ymd(parseYmd(start) + (span - 1) * DAY)
    expect(fullStudyDays(start, end)).toBe(span - 1)
  })

  it('isTaper is true only inside the pre-exam window', () => {
    const exam = '2027-02-01'
    expect(isTaper('2027-01-25', exam)).toBe(true) // 7 days out (< 14)
    expect(isTaper('2027-01-01', exam)).toBe(false) // 31 days out
  })
})
