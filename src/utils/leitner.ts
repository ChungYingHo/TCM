// Generic Leitner spaced-repetition store, keyed by string id. Backs BOTH vocabSrs
// and elementSrs so the "due for review" algorithm lives in exactly one place (the
// two previously held near-identical copies that could drift). Each instance owns its
// own localStorage key; on write it fires `tcm:statechange` so cloud.ts can sync.
import type { VocabSrsEntry } from '@/models/progress'

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
  getCard(id: string): VocabSrsEntry | undefined
  /** Raw snapshot / restore — used by the cloud layer (replace is silent: no state event). */
  dump(): LeitnerStore
  replace(store: LeitnerStore): void
}

export function createLeitner(KEY: string): Leitner {
  function read(): LeitnerStore {
    if (typeof localStorage === 'undefined') return {}
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || '{}')
      return v && typeof v === 'object' ? (v as LeitnerStore) : {}
    } catch {
      return {}
    }
  }

  function write(store: LeitnerStore, silent = false): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(KEY, JSON.stringify(store))
    if (!silent && typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:statechange'))
  }

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
      store[id] = { box, due: dueAt(box, now), ts: now }
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
