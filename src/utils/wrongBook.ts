import type { OptionLetter } from '@/models/question'
import type { WrongEntry } from '@/models/progress'

const KEY = 'tcm.wrongbook.v1'

type Store = Record<string, WrongEntry>

function read(): Store {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store
  } catch {
    return {}
  }
}

function write(store: Store, silent = false): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(store))
  if (!silent && typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:statechange'))
}

/** Raw snapshot / restore — used by the sync + backup layer. */
export function dumpWrong(): Store {
  return read()
}
export function replaceWrong(store: Store): void {
  write(store, true)
}

// Leitner intervals (days) indexed by box (box 0 unused). Box 1 = due now; each
// correct review promotes a box and pushes the next review further out. A wrong
// answer (or failed review) resets to box 1, due now.
const INTERVAL_DAYS = [0, 0, 1, 3, 7, 16, 35, 75]
const DAY = 86_400_000

/** Record (or increment) a wrong answer. Resets the SRS card to "due now". */
export function recordWrong(id: string, choice: OptionLetter[], now: number): WrongEntry {
  const store = read()
  const prev = store[id]
  const entry: WrongEntry = {
    id,
    wrongCount: (prev?.wrongCount ?? 0) + 1,
    lastWrongAt: now,
    lastChoice: choice,
    due: now,
    box: 1,
  }
  store[id] = entry
  write(store)
  return entry
}

/** Grade a review: correct → advance the box (longer interval); wrong → reset to box 1. */
export function gradeReview(id: string, correct: boolean, now = Date.now()): void {
  const store = read()
  const e = store[id]
  if (!e) return
  const box = correct ? Math.min((e.box ?? 1) + 1, INTERVAL_DAYS.length - 1) : 1
  e.box = box
  e.due = now + INTERVAL_DAYS[box] * DAY
  store[id] = e
  write(store)
}

/** Entries due for review now, soonest first. */
export function dueEntries(now = Date.now()): WrongEntry[] {
  return Object.values(read())
    .filter((e) => (e.due ?? e.lastWrongAt) <= now)
    .sort((a, b) => (a.due ?? a.lastWrongAt) - (b.due ?? b.lastWrongAt))
}

export function dueCount(now = Date.now()): number {
  return dueEntries(now).length
}

export function removeWrong(id: string): void {
  const store = read()
  delete store[id]
  write(store)
}

export function isInWrongBook(id: string): boolean {
  return !!read()[id]
}

/** All entries, most-wrong first (drives future prioritized review). */
export function listWrong(): WrongEntry[] {
  return Object.values(read()).sort(
    (a, b) => b.wrongCount - a.wrongCount || b.lastWrongAt - a.lastWrongAt,
  )
}

export function clearWrongBook(): void {
  write({})
}
