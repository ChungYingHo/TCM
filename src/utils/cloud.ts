// Minimal cloud persistence for the wrong-book + progress.
// The Vercel DB is the durable home; localStorage is just a fast local cache.
// On boot we load the DB copy once; on each change we save the whole (tiny) doc
// back (last-write-wins — fine for a single user). No merge / backup / offline
// machinery. If no DB is configured the API reports {disabled} and we stay local.

import type { SyncState } from '@/models/progress'
import { dumpWrong, replaceWrong } from '@/utils/wrongBook'
import { getAttempts, replaceProgress } from '@/utils/progress'
import { getStreak, replaceStreak } from '@/utils/streak'
import { dumpPlan, replacePlan } from '@/utils/dailyPlan'
import { dumpVocabSrs, replaceVocabSrs } from '@/utils/vocabSrs'

export function localSnapshot(): SyncState {
  return {
    wrongbook: dumpWrong(),
    progress: getAttempts(),
    streak: getStreak(),
    plan: dumpPlan(),
    vocabSrs: dumpVocabSrs(),
    updatedAt: Date.now(),
  }
}

function applyServer(s: SyncState): void {
  replaceWrong(s.wrongbook ?? {})
  replaceProgress(s.progress ?? {})
  if (s.streak) replaceStreak(s.streak)
  replacePlan(s.plan ?? {})
  replaceVocabSrs(s.vocabSrs ?? {})
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:cloudloaded'))
}

let timer: ReturnType<typeof setTimeout> | null = null
async function save(): Promise<void> {
  try {
    await fetch('/api/state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ state: localSnapshot() }),
    })
  } catch {
    /* offline / not configured — localStorage keeps the data locally */
  }
}
export function saveDebounced(delay = 800): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { timer = null; void save() }, delay)
}

let started = false
export function bootCloud(): void {
  if (started || typeof window === 'undefined') return
  started = true
  const attach = () => window.addEventListener('tcm:statechange', () => saveDebounced())
  // load the DB copy first, THEN start saving (so we never overwrite with a
  // pre-load stale snapshot)
  fetch('/api/state')
    .then((r) => r.json())
    .then((d) => { if (d?.state) applyServer(d.state) })
    .catch(() => {})
    .finally(attach)
}
