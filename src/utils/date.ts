// Shared date helpers: local-time YYYY-MM-DD keys + study-rhythm classification.
// Kept tiny and dependency-free so both UI and unit tests can use it.

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

// The "study day" rolls over at 05:00, not midnight — studying past midnight still counts as
// the previous day until 5 AM. Everything that asks "what day is it for the plan?" (today's
// content, completion log, streak, the date label) goes through todayKey, so the boundary is
// consistent across the whole app.
export const DAY_ROLLOVER_HOURS = 5
export function todayKey(now: number = Date.now()): string {
  return ymd(now - DAY_ROLLOVER_HOURS * 3_600_000)
}

