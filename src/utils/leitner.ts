// Generic Leitner spaced-repetition store, keyed by string id. Backs BOTH vocabSrs
// and elementSrs so the "due for review" algorithm lives in exactly one place (the
// two previously held near-identical copies that could drift). Each instance owns its
// own localStorage key; on write it fires `tcm:statechange` so cloud.ts can sync.
import type { VocabSrsEntry } from '@/models/progress'
import { createJsonStore } from '@/utils/localStore'

// Days until next review, indexed by Leitner box (box 1 = tomorrow).
const INTERVALS = [0, 1, 3, 7, 16, 35, 75]
const DAY_MS = 86_400_000
const MAX_BOX = INTERVALS.length - 1

export type LeitnerStore = Record<string, VocabSrsEntry>

export interface Leitner {
  /** Register newly-studied ids as box-1 cards (idempotent — won't reset known cards). */
  learn(ids: string[], now?: number): void
  /** Grade a review: correct → advance the box; wrong → back to box 1. */
  grade(id: string, known: boolean, now?: number): void
  /** Passive review: reschedule at the SAME box, but ONLY for an already-learned, currently-due
   *  card. Never creates a card (keeps new-item pace untouched) and never touches a not-yet-due one. */
  touch(ids: string[], now?: number): void
  /** Ids whose review is due now, soonest first. */
  dueIds(now?: number): string[]
  /** 一直背不起來的（答「不熟」累計 ≥ `min` 次），最慘的排前面。 */
  leechIds(min?: number): string[]
  getCard(id: string): VocabSrsEntry | undefined
  /** Raw snapshot / restore — used by the cloud layer (replace is silent: no state event). */
  dump(): LeitnerStore
  replace(store: LeitnerStore): void
}

export function createLeitner(KEY: string): Leitner {
  const { read, write } = createJsonStore<LeitnerStore>(KEY)

  const dueAt = (box: number, now: number) => now + INTERVALS[Math.min(box, MAX_BOX)] * DAY_MS

  return {
    learn(ids, now = Date.now()) {
      const store = read()
      let changed = false
      for (const id of ids) {
        if (!store[id]) {
          store[id] = { box: 1, due: dueAt(1, now), ts: now }
          changed = true
        }
      }
      if (changed) write(store)
    },
    grade(id, known, now = Date.now()) {
      const store = read()
      const prev = store[id]
      const box = known ? Math.min((prev?.box ?? 1) + 1, MAX_BOX) : 1
      // lapses 只增不減：答對不該把「我曾經卡在這裡 5 次」的事實抹掉，那正是要拿來排優先序的。
      const lapses = (prev?.lapses ?? 0) + (known ? 0 : 1)
      store[id] = lapses ? { box, due: dueAt(box, now), ts: now, lapses } : { box, due: dueAt(box, now), ts: now }
      write(store)
    },
    touch(ids, now = Date.now()) {
      const store = read()
      let changed = false
      for (const id of ids) {
        const c = store[id]
        if (!c || c.due > now) continue // skip unlearned ids and ones not yet due
        store[id] = { box: c.box, due: dueAt(c.box, now), ts: now }
        changed = true
      }
      if (changed) write(store)
    },
    dueIds(now = Date.now()) {
      const store = read()
      return Object.entries(store)
        .filter(([, c]) => c.due <= now)
        .sort((a, b) => a[1].due - b[1].due)
        .map(([id]) => id)
    },
    leechIds(min = 3) {
      return Object.entries(read())
        .filter(([, c]) => (c.lapses ?? 0) >= min)
        .sort((a, b) => (b[1].lapses ?? 0) - (a[1].lapses ?? 0))
        .map(([id]) => id)
    },
    getCard(id) {
      return read()[id]
    },
    dump() {
      return read()
    },
    replace(store) {
      write(store && typeof store === 'object' ? store : {}, true)
    },
  }
}
