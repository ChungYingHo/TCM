// Word-level spaced repetition (Leitner). Mirrors the wrong-book intervals so the
// user holds ONE mental model of "due for review". New-word PACE is progress-based
// (cursor, see studyCursor.ts); review TIMING is calendar-based (forgetting is), so
// the two are intentionally separate. Synced via cloud.ts under `vocabSrs`.
import type { VocabSrsEntry, VocabSrsStore } from '@/models/progress'

const KEY = 'tcm.vocabSrs.v1'
// Days until next review, indexed by Leitner box (box 1 = tomorrow).
const INTERVALS = [0, 1, 3, 7, 16, 35, 75]
const DAY_MS = 86_400_000
const MAX_BOX = INTERVALS.length - 1

function read(): VocabSrsStore {
  if (typeof localStorage === 'undefined') return {}
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}')
    return v && typeof v === 'object' ? (v as VocabSrsStore) : {}
  } catch {
    return {}
  }
}

function write(store: VocabSrsStore, silent = false): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(store))
  if (!silent && typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:statechange'))
}

const dueAt = (box: number, now: number) => now + INTERVALS[Math.min(box, MAX_BOX)] * DAY_MS

/** Register newly-studied words as box-1 cards (idempotent — won't reset known words). */
export function learn(ids: string[], now = Date.now()): void {
  const store = read()
  let changed = false
  for (const id of ids) {
    if (!store[id]) {
      store[id] = { box: 1, due: dueAt(1, now), ts: now }
      changed = true
    }
  }
  if (changed) write(store)
}

/** Grade a review: known → advance the box (longer interval); unknown → back to box 1. */
export function grade(id: string, known: boolean, now = Date.now()): void {
  const store = read()
  const prev = store[id]
  const box = known ? Math.min((prev?.box ?? 1) + 1, MAX_BOX) : 1
  store[id] = { box, due: dueAt(box, now), ts: now }
  write(store)
}

/** Word ids whose review is due (box-1 cards just learned today are excluded by `since`). */
export function dueIds(now = Date.now()): string[] {
  const store = read()
  return Object.entries(store)
    .filter(([, c]) => c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id)
}

export function getCard(id: string): VocabSrsEntry | undefined {
  return read()[id]
}

/** How many distinct words have ever been studied (mastery breadth). */
export function learnedCount(): number {
  return Object.keys(read()).length
}

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpVocabSrs(): VocabSrsStore {
  return read()
}
export function replaceVocabSrs(store: VocabSrsStore): void {
  write(store && typeof store === 'object' ? store : {}, true)
}
