// Deterministic daily sampling for the review-vocab section: SRS-due words come
// first, then a date-seeded random draw from already-learned (not-due) words fills
// up to the daily target. Seeding by date keeps the list stable across reloads
// within a day while still rotating through the learned pool over time.

import { mulberry32 } from '@/utils/rng'

/** Tiny string hash (FNV-1a) — good enough to seed a PRNG from a date key. */
function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Pick up to `n` items from `items`, deterministically for a given `seedKey`
 *  (partial Fisher–Yates — no duplicates, order randomized). */
export function seededSample<T>(items: T[], n: number, seedKey: string): T[] {
  if (n <= 0 || !items.length) return []
  const rand = mulberry32(hash(seedKey))
  const pool = [...items]
  const take = Math.min(n, pool.length)
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(rand() * (pool.length - i))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, take)
}

/** Compose today's review list: a LIMITED, date-seeded RANDOM batch capped at the daily
 *  target — not the whole due queue. When more words are due than the cap, a random rotating
 *  slice is shown (the rest roll to following days, so it varies day to day instead of dumping
 *  everything). When the due queue fits, all due come first (most-overdue first) and a random
 *  draw from learned-but-not-due words fills the spare capacity. Seeded by date → stable within
 *  a day, rotating across days. NOTE: the spare-capacity fill draws from learned-but-not-due cards,
 *  so words learned today (due tomorrow) CAN surface here — a caller that already lists "today's new
 *  words" elsewhere must exclude those ids itself to avoid showing them twice (see DailyPlan.svelte). */
export function composeReview(
  dueIds: string[],
  learnedIds: string[],
  target: number,
  max: number,
  dateKey: string,
): string[] {
  const cap = Math.max(0, Math.min(target, max))
  if (cap === 0) return []
  if (dueIds.length >= cap) return seededSample(dueIds, cap, dateKey)
  const dueSet = new Set(dueIds)
  const rest = learnedIds.filter((id) => !dueSet.has(id))
  return [...dueIds, ...seededSample(rest, cap - dueIds.length, dateKey)]
}
