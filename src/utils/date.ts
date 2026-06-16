// Shared date helpers: local-time YYYY-MM-DD keys + study-rhythm classification.
// Kept tiny and dependency-free so both UI and unit tests can use it.

const DAY_MS = 86_400_000

/** Local-time YYYY-MM-DD (timezone-consistent across the whole app). */
export function ymd(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 顯示用中文日期眉題，如「6月11日 星期四」（首頁問候與今日複習共用）。 */
export function zhDateLabel(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' }).format(d)
}

/** 'YYYY-MM-DD' → compact 'M/D' (e.g. '2026-06-15' → '6/15'), for chips/badges. */
export function mdShort(key: string): string {
  const [, m, d] = key.split('-')
  return `${Number(m)}/${Number(d)}`
}

/** Parse a YYYY-MM-DD key back to a local-midnight timestamp. Returns NaN for a
 *  malformed key (wrong arity / non-numeric) so a bad key surfaces instead of silently
 *  resolving to a bogus date. */
export function parseYmd(key: string): number {
  const parts = key.split('-')
  if (parts.length !== 3) return NaN
  const [y, m, d] = parts.map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return NaN
  return new Date(y, m - 1, d).getTime()
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
  lightWeekday: number // 0=Sun … 6=Sat — primary weekly light day (carries the rest cycle)
  restEveryNCycles: number // every Nth light day is framed as a full rest day (0 = never)
  taperLastDays: number // final N days before the exam → review-heavy taper
  bufferWeekday?: number // optional 2nd weekly light/review day (e.g. 6=Sat); always light, never rest
  commuteWeekday?: number // optional BIWEEKLY light day (e.g. 2=Tue): out-of-town every other week
}

export const DEFAULT_RHYTHM: Rhythm = {
  lightWeekday: 0,
  restEveryNCycles: 4,
  taperLastDays: 14,
  bufferWeekday: 6, // Saturday: weekend review/buffer
  commuteWeekday: 2, // every other Tuesday: away in 高雄 → minimal website time
}

/** Classify a date into a rhythm day type (full / light / rest). */
export function dayType(dateKey: string, startKey: string, rhythm: Rhythm = DEFAULT_RHYTHM): DayType {
  const weekday = new Date(parseYmd(dateKey)).getDay()
  if (weekday === rhythm.lightWeekday) {
    const lightIndex = Math.floor(dayDiff(startKey, dateKey) / 7) // which weekly light day this is
    const isRest =
      rhythm.restEveryNCycles > 0 && lightIndex % rhythm.restEveryNCycles === rhythm.restEveryNCycles - 1
    return isRest ? 'rest' : 'light'
  }
  // secondary weekly buffer/review day (weekend catch-up + drill) — always light, never rest
  if (rhythm.bufferWeekday !== undefined && weekday === rhythm.bufferWeekday) return 'light'
  // biweekly commute day: every OTHER occurrence (aligned to the start week, so the start
  // week's commute weekday counts) — away from home → minimal site time, treat as light.
  if (
    rhythm.commuteWeekday !== undefined &&
    weekday === rhythm.commuteWeekday &&
    Math.floor(dayDiff(startKey, dateKey) / 7) % 2 === 0
  )
    return 'light'
  return 'full'
}

/** True inside the pre-exam taper window (review-heavy, ease off new material). */
export function isTaper(dateKey: string, examKey: string, rhythm: Rhythm = DEFAULT_RHYTHM): boolean {
  const left = dayDiff(dateKey, examKey)
  return left >= 0 && left < rhythm.taperLastDays
}

/** Mock-exam day: the Saturday right before each ~monthly rest Sunday. The daily
 *  plan upgrades that day's drill into a timed 50-question block (pacing/stamina
 *  training) without burning the reserved newest-year mock papers. */
export function isMockDay(dateKey: string, startKey: string, rhythm: Rhythm = DEFAULT_RHYTHM): boolean {
  if (new Date(parseYmd(dateKey)).getDay() !== 6) return false
  return dayType(ymd(parseYmd(dateKey) + DAY_MS), startKey, rhythm) === 'rest'
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

/** Count days in [startKey, endKey] inclusive that introduce new vocab: every day that
 *  is NOT in the pre-exam taper. New vocab runs daily — full/light/rest alike（單字每天
 *  不可斷）— only the taper stops new words. Mirrors the vocab cursor's per-day advance
 *  so pace is measured against the same day-set (else a diligent daily user reads "ahead"). */
export function newVocabDays(
  startKey: string, endKey: string, examKey: string, rhythm: Rhythm = DEFAULT_RHYTHM,
): number {
  if (parseYmd(endKey) < parseYmd(startKey)) return 0
  let n = 0
  for (let t = parseYmd(startKey); t <= parseYmd(endKey); t += DAY_MS) {
    if (!isTaper(ymd(t), examKey, rhythm)) n += 1
  }
  return n
}

export type DayKind = 'rest' | 'commute' | 'buffer' | 'taper' | 'light' | 'full'

/** Why today has its intensity — the single source for day labels/badges across the
 *  dashboard and the daily-plan hub (they previously each re-derived this, and the home
 *  page hardcoded the weekdays instead of reading the rhythm). Distinguishes the two
 *  light-day reasons (biweekly 高雄 commute vs weekend buffer) and the pre-exam taper. */
export function dayKind(
  dateKey: string, startKey: string, examKey: string, rhythm: Rhythm = DEFAULT_RHYTHM,
): DayKind {
  const dt = dayType(dateKey, startKey, rhythm)
  if (dt === 'rest') return 'rest'
  if (dt === 'light') {
    const weekday = new Date(parseYmd(dateKey)).getDay()
    if (rhythm.commuteWeekday === weekday) return 'commute'
    if (rhythm.bufferWeekday === weekday) return 'buffer'
    return 'light'
  }
  return isTaper(dateKey, examKey, rhythm) ? 'taper' : 'full'
}
