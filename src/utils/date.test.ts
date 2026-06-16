import { describe, it, expect } from 'vitest'
import { ymd, parseYmd, dayDiff, dayType, fullStudyDays, newVocabDays, isTaper, DEFAULT_RHYTHM } from '@/utils/date'

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

  it('marks Sun + Sat + biweekly-Tue light/rest, other weekdays full', () => {
    for (let i = 0; i < 21; i++) {
      const key = ymd(parseYmd(start) + i * DAY)
      const weekday = new Date(parseYmd(key)).getDay()
      const t = dayType(key, start)
      if (weekday === DEFAULT_RHYTHM.lightWeekday || weekday === DEFAULT_RHYTHM.bufferWeekday)
        expect(['light', 'rest']).toContain(t) // Sun (light/rest cycle) + Sat (weekend buffer)
      else if (weekday === DEFAULT_RHYTHM.commuteWeekday && Math.floor(dayDiff(start, key) / 7) % 2 === 0)
        expect(t).toBe('light') // every other Tuesday (高雄 commute)
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

  it('fullStudyDays counts only full days (excludes Sun, Sat, biweekly Tue)', () => {
    // start = 2026-06-22 (Mon); span 06-22..06-28: Tue(commute)+Sat+Sun light → Mon/Wed/Thu/Fri full = 4
    const end = ymd(parseYmd(start) + 6 * DAY)
    expect(fullStudyDays(start, end)).toBe(4)
  })

  it('newVocabDays counts every non-taper day (full/light/rest alike)', () => {
    const exam = '2027-02-01'
    // 06-22..06-28 is far from the exam → no taper → all 7 days introduce vocab
    expect(newVocabDays(start, ymd(parseYmd(start) + 6 * DAY), exam)).toBe(7)
    // a window fully inside the 14-day taper introduces none
    expect(newVocabDays('2027-01-25', '2027-01-28', exam)).toBe(0)
  })

  it('isTaper is true only inside the pre-exam window', () => {
    const exam = '2027-02-01'
    expect(isTaper('2027-01-25', exam)).toBe(true) // 7 days out (< 14)
    expect(isTaper('2027-01-01', exam)).toBe(false) // 31 days out
  })
})
