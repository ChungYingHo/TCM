// Daily study-plan completion log — per-date flags for each section of 今日複習.
// This is the single source of truth for "how far have I actually got": the
// cursors that drive today's content are DERIVED from it (see studyCursor.ts),
// so a busy day simply doesn't advance and tomorrow carries over. Synced via
// cloud.ts under the SyncState `plan` field.
import type { DailyPlanStore, DayPlanState } from '@/models/progress'
import type { Subject } from '@/models/question'

const KEY = 'tcm.dailyplan.v1'

export type Section = 'quiz' | 'newVocab' | 'reviewVocab' | 'classic' | 'elementQuiz' | 'aminoAcid' | 'wrong' | 'rest'

function read(): DailyPlanStore {
  if (typeof localStorage === 'undefined') return {}
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}')
    return v && typeof v === 'object' ? (v as DailyPlanStore) : {}
  } catch {
    return {}
  }
}

function write(store: DailyPlanStore, silent = false): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(store))
  if (!silent && typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:statechange'))
}

export function getDay(date: string): DayPlanState {
  return read()[date] ?? {}
}

/** Mark a whole-section flag (quiz / newVocab / reviewVocab / classic / rest). */
export function setSectionDone(date: string, section: Section, done: boolean): void {
  const store = read()
  const day = { ...(store[date] ?? {}) }
  day[section] = done
  store[date] = day
  write(store)
}

/** Mark a single subject's note done for the given day. */
export function setNoteDone(date: string, subject: Subject, done: boolean): void {
  const store = read()
  const day = { ...(store[date] ?? {}) }
  day.notes = { ...(day.notes ?? {}), [subject]: done }
  store[date] = day
  write(store)
}

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpPlan(): DailyPlanStore {
  return read()
}
export function replacePlan(store: DailyPlanStore): void {
  write(store && typeof store === 'object' ? store : {}, true)
}
