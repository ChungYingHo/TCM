// Tracks every answered question (attempts + correctness) in localStorage.
// Powers coverage + mastery analytics. Separate from the wrong-book (which is
// the user's curated review list).

import type { Attempt } from '@/models/progress'
export type { Attempt }

type Store = Record<string, Attempt>

const KEY = 'tcm.progress.v1'

let _cache: Store | null = null

function read(): Store {
  if (typeof localStorage === 'undefined') return _cache ?? {}
  if (_cache !== null && localStorage.getItem(KEY) !== null) return _cache
  try {
    _cache = JSON.parse(localStorage.getItem(KEY) || '{}') as Store
  } catch {
    _cache = {}
  }
  return _cache
}

function write(store: Store, silent = false): void {
  _cache = store
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch { /* QuotaExceededError — data stays in memory, retries on next write */ }
  if (!silent && typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:statechange'))
}

/** Raw restore — used by the sync + backup layer (getAttempts() is the snapshot). */
export function replaceProgress(store: Store): void {
  write(store, true)
}

export function recordAttempt(id: string, wasCorrect: boolean, now: number): void {
  const store = read()
  const prev = store[id] ?? { attempts: 0, correct: 0, lastTs: 0 }
  store[id] = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (wasCorrect ? 1 : 0),
    lastTs: now,
  }
  write(store)
}

export function getAttempts(): Store {
  return read()
}

export function clearProgress(): void {
  write({})
}
