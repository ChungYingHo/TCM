// Daily study streak — consecutive days with at least one answered question.
// Touched on every recorded attempt; cached in localStorage, synced via cloud.ts.
import type { Streak } from '@/models/progress'
import { ymd, parseYmd, todayKey } from '@/utils/date'

const KEY = 'tcm.streak.v1'
const EMPTY: Streak = { lastDay: '', count: 0, best: 0 }

export function getStreak(): Streak {
  if (typeof localStorage === 'undefined') return { ...EMPTY }
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...EMPTY }
  }
}

function save(s: Streak): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(s))
}

/** Register activity for `now`; advances the streak across consecutive days. */
export function touchStreak(now = Date.now()): void {
  const s = getStreak()
  const today = todayKey(now) // 5 AM rollover — same boundary as the daily plan
  if (s.lastDay === today) return
  const yesterday = ymd(parseYmd(today) - 86_400_000)
  s.count = s.lastDay === yesterday ? s.count + 1 : 1
  s.best = Math.max(s.best, s.count)
  s.lastDay = today
  save(s) // silent — the accompanying progress write triggers the cloud save
}

export function replaceStreak(s: Streak): void {
  save({ ...EMPTY, ...s })
}
