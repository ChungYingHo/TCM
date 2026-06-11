// Deterministic daily sampling for the review-vocab section: SRS-due words come
// first, then a date-seeded random draw from already-learned (not-due) words fills
// up to the daily target. Seeding by date keeps the list stable across reloads
// within a day while still rotating through the learned pool over time.

/** Tiny string hash (FNV-1a) — good enough to seed a PRNG from a date key. */
function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 — small deterministic PRNG. */
function prng(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pick up to `n` items from `items`, deterministically for a given `seedKey`
 *  (partial Fisher–Yates — no duplicates, order randomized). */
export function seededSample<T>(items: T[], n: number, seedKey: string): T[] {
  if (n <= 0 || !items.length) return []
  const rand = prng(hash(seedKey))
  const pool = [...items]
  const take = Math.min(n, pool.length)
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(rand() * (pool.length - i))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, take)
}

/** Compose today's review list: due ids first (already weakness-ordered), then a
 *  date-seeded random fill from learned-but-not-due ids, capped at `max`. */
export function composeReview(
  dueIds: string[],
  learnedIds: string[],
  target: number,
  max: number,
  dateKey: string,
): string[] {
  const due = dueIds.slice(0, max)
  const need = Math.min(target, max) - due.length
  if (need <= 0) return due
  const dueSet = new Set(due)
  const rest = learnedIds.filter((id) => !dueSet.has(id))
  return [...due, ...seededSample(rest, need, dateKey)]
}
