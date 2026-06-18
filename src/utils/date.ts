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

// The "study day" rolls over at 05:00, not midnight — studying past midnight still counts as
// the previous day until 5 AM. Everything that asks "what day is it for the plan?" (today's
// content, completion log, streak, the date label) goes through todayKey, so the boundary is
// consistent across the whole app.
export const DAY_ROLLOVER_HOURS = 5
export function todayKey(now: number = Date.now()): string {
  return ymd(now - DAY_ROLLOVER_HOURS * 3_600_000)
}

// ── Study rhythm: clock-based, calendar-decoupled ─────────────────────────────
// The plan is a ROLLING sequence consumed at the user's real pace — content is sliced
// from the completion cursor (see studyCursor.ts), NOT pinned to pre-assigned calendar
// dates. So the ONLY thing we read from the clock is "is today a weekend?": weekdays are
// full study days; weekends are buffer days (catch up if behind, otherwise rest). A
// missed day isn't "lost" — it just doesn't advance the cursor, so the sequence rolls
// forward. The exam date is the single real deadline (drives the pre-exam taper).

export type DayType = 'full' | 'weekend' // full = weekday study; weekend = Sat/Sun buffer

/** Weekday → 'full' (study); Saturday/Sunday → 'weekend' (buffer). Reads the real weekday. */
export function dayType(dateKey: string): DayType {
  const wd = new Date(parseYmd(dateKey)).getDay()
  return wd === 0 || wd === 6 ? 'weekend' : 'full'
}

export const TAPER_DAYS = 14 // final stretch before the exam: review only, stop new material

/** True inside the pre-exam taper window (review-heavy, ease off new material). */
export function isTaper(dateKey: string, examKey: string, taperDays: number = TAPER_DAYS): boolean {
  const left = dayDiff(dateKey, examKey)
  return left >= 0 && left < taperDays
}

export type DayKind = 'weekend' | 'taper' | 'full'

/** Why today has its intensity — the single source for day labels/badges across the
 *  dashboard and the daily-plan hub (so the two never drift). Weekend > taper > full. */
export function dayKind(dateKey: string, examKey: string, taperDays: number = TAPER_DAYS): DayKind {
  if (dayType(dateKey) === 'weekend') return 'weekend'
  return isTaper(dateKey, examKey, taperDays) ? 'taper' : 'full'
}
