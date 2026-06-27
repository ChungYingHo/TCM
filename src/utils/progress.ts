// Tracks every answered question (attempts + correctness) in localStorage.
// Powers coverage + mastery analytics. Separate from the wrong-book (which is
// the user's curated review list).

import type { Attempt } from '@/models/progress'
import { createJsonStore } from '@/utils/localStore'
export type { Attempt }

type Store = Record<string, Attempt>

const KEY = 'tcm.progress.v1'

const { read, write } = createJsonStore<Store>(KEY)

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
