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

/** Record (or increment) a wrong answer. Returns the updated entry. */
export function recordWrong(id: string, choice: OptionLetter[], now: number): WrongEntry {
  const store = read()
  const prev = store[id]
  const entry: WrongEntry = {
    id,
    wrongCount: (prev?.wrongCount ?? 0) + 1,
    lastWrongAt: now,
    lastChoice: choice,
  }
  store[id] = entry
  write(store)
  return entry
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
