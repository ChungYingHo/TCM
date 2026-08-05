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

/** Compose today's review list: a LIMITED batch capped at the daily target — not the whole
 *  due queue.
 *
 *  積欠很多時取「**最久沒複習的優先**」（`dueIds` 已依 due 由舊到新排好），只把**呈現順序**
 *  打散讓每天不會一模一樣。2026-08-05 修：原本這裡是 `seededSample(dueIds, cap)`＝從整個到期
 *  堆裡**純隨機**抽，等於丟掉了逾期排序——Aira 反映「前面的單字正在快速忘記」，這是主因之一：
 *  到期 200 多個、每天只抽 60 個，某個字純靠運氣可以連續好幾週抽不到。
 *
 *  到期數塞得下時，所有到期的排前面（最久沒複習優先），再從「學過但還沒到期」的字隨機補滿。
 *  NOTE: 補滿是從 learned-but-not-due 抽，所以今天剛學的字（明天到期）可能出現在這裡——已經
 *  另外列出「今日單字」的呼叫端要自己把那些 id 濾掉，避免同一天上下重複（見 DailyPlan.svelte）。 */
export function composeReview(
  dueIds: string[],
  learnedIds: string[],
  target: number,
  max: number,
  dateKey: string,
): string[] {
  const cap = Math.max(0, Math.min(target, max))
  if (cap === 0) return []
  // 逾期最久的先還，順序打散只是為了每天翻起來不完全一樣。
  if (dueIds.length >= cap) return seededSample(dueIds.slice(0, cap), cap, dateKey)
  const dueSet = new Set(dueIds)
  const rest = learnedIds.filter((id) => !dueSet.has(id))
  return [...dueIds, ...seededSample(rest, cap - dueIds.length, dateKey)]
}
