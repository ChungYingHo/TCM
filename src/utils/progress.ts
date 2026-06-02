// Tracks every answered question (attempts + correctness) in localStorage.
// Powers coverage + mastery analytics. Separate from the wrong-book (which is
// the user's curated review list).

export interface Attempt {
  attempts: number
  correct: number // times answered correctly
  lastTs: number
}

type Store = Record<string, Attempt>

const KEY = 'tcm.progress.v1'

function read(): Store {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store
  } catch {
    return {}
  }
}

function write(store: Store): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(store))
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
