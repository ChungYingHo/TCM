// Shared date helpers: local-time YYYY-MM-DD keys + study-rhythm classification.
// Kept tiny and dependency-free so both UI and unit tests can use it.

const DAY_MS = 86_400_000

/** Local-time YYYY-MM-DD (timezone-consistent across the whole app). */
export function ymd(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Parse a YYYY-MM-DD key back to a local-midnight timestamp. */
export function parseYmd(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1).getTime()
}

/** Whole-day difference (b − a) by local calendar date. */
export function dayDiff(aKey: string, bKey: string): number {
  return Math.round((parseYmd(bKey) - parseYmd(aKey)) / DAY_MS)
}

// ── Humane study rhythm ──────────────────────────────────────────────────────
// Studying flat-out every day burns people out. The schedule has a weekly light
// day (review-only, no new material) and an occasional full rest day, so pace is
// measured against full-intensity days only — a light day never marks you behind.

export type DayType = 'full' | 'light' | 'rest'

export interface Rhythm {
  lightWeekday: number // 0=Sun … 6=Sat — this weekday is the weekly light day
  restEveryNCycles: number // every Nth light day is framed as a full rest day (0 = never)
  taperLastDays: number // final N days before the exam → review-heavy taper
}

export const DEFAULT_RHYTHM: Rhythm = { lightWeekday: 0, restEveryNCycles: 4, taperLastDays: 14 }

/** Classify a date into a rhythm day type (full / light / rest). */
export function dayType(dateKey: string, startKey: string, rhythm: Rhythm = DEFAULT_RHYTHM): DayType {
  const weekday = new Date(parseYmd(dateKey)).getDay()
  if (weekday !== rhythm.lightWeekday) return 'full'
  const lightIndex = Math.floor(dayDiff(startKey, dateKey) / 7) // which weekly light day this is
  const isRest =
    rhythm.restEveryNCycles > 0 && lightIndex % rhythm.restEveryNCycles === rhythm.restEveryNCycles - 1
  return isRest ? 'rest' : 'light'
}

/** True inside the pre-exam taper window (review-heavy, ease off new material). */
export function isTaper(dateKey: string, examKey: string, rhythm: Rhythm = DEFAULT_RHYTHM): boolean {
  const left = dayDiff(dateKey, examKey)
  return left >= 0 && left < rhythm.taperLastDays
}

/** Count full-intensity study days in [startKey, endKey] inclusive (excludes light + rest). */
export function fullStudyDays(startKey: string, endKey: string, rhythm: Rhythm = DEFAULT_RHYTHM): number {
  if (parseYmd(endKey) < parseYmd(startKey)) return 0
  let n = 0
  for (let t = parseYmd(startKey); t <= parseYmd(endKey); t += DAY_MS) {
    if (dayType(ymd(t), startKey, rhythm) === 'full') n += 1
  }
  return n
}
