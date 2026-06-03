// Local-first cloud sync for the wrong-book + answer progress.
//
// localStorage stays the source of truth for instant/offline use; this layer
// pulls/merges the server copy on load + tab focus and debounce-pushes local
// changes. Multi-device merges are a UNION (wrong-book kept, per-question counts
// take the larger value), so one device never silently overwrites another.
// If the server has no store configured it reports {disabled} and we stay local.

import type { WrongEntry, Attempt } from '@/models/progress'
import { dumpWrong, replaceWrong } from '@/utils/wrongBook'
import { getAttempts, replaceProgress } from '@/utils/progress'

export interface SyncState {
  wrongbook: Record<string, WrongEntry>
  progress: Record<string, Attempt>
  updatedAt: number
}

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error'

/** Union merge — never loses data across devices. */
export function mergeState(a: SyncState, b: SyncState): SyncState {
  const wrongbook: Record<string, WrongEntry> = { ...a.wrongbook }
  for (const [id, e] of Object.entries(b.wrongbook)) {
    const cur = wrongbook[id]
    if (!cur) { wrongbook[id] = e; continue }
    const newer = e.lastWrongAt >= cur.lastWrongAt ? e : cur
    wrongbook[id] = {
      id,
      wrongCount: Math.max(cur.wrongCount, e.wrongCount),
      lastWrongAt: Math.max(cur.lastWrongAt, e.lastWrongAt),
      lastChoice: newer.lastChoice,
    }
  }
  const progress: Record<string, Attempt> = { ...a.progress }
  for (const [id, p] of Object.entries(b.progress)) {
    const cur = progress[id]
    if (!cur) { progress[id] = p; continue }
    const attempts = Math.max(cur.attempts, p.attempts)
    progress[id] = {
      attempts,
      correct: Math.min(attempts, Math.max(cur.correct, p.correct)),
      lastTs: Math.max(cur.lastTs, p.lastTs),
    }
  }
  return { wrongbook, progress, updatedAt: Math.max(a.updatedAt, b.updatedAt) }
}

export function localSnapshot(): SyncState {
  return { wrongbook: dumpWrong(), progress: getAttempts(), updatedAt: Date.now() }
}

/** Write a state into localStorage WITHOUT triggering a push, then refresh UIs. */
function applyLocal(s: SyncState): void {
  replaceWrong(s.wrongbook)
  replaceProgress(s.progress)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:synced'))
}

/** Merge an incoming state into local (used by cloud pull + backup import). */
export function mergeIntoLocal(incoming: Partial<SyncState>): SyncState {
  const merged = mergeState(localSnapshot(), {
    wrongbook: incoming.wrongbook ?? {},
    progress: incoming.progress ?? {},
    updatedAt: incoming.updatedAt ?? 0,
  })
  applyLocal(merged)
  return merged
}

// ── status ────────────────────────────────────────────────────────────────
let status: SyncStatus = 'local'
export function getSyncStatus(): SyncStatus { return status }
function setStatus(s: SyncStatus): void {
  status = s
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tcm:syncstatus', { detail: s }))
}

// ── cloud calls ─────────────────────────────────────────────────────────────
async function pull(): Promise<void> {
  try {
    setStatus('syncing')
    const res = await fetch('/api/state', { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    if (data?.disabled) { setStatus('local'); return }
    if (data?.state) mergeIntoLocal(data.state)
    setStatus('synced')
  } catch {
    setStatus('error')
  }
}

async function push(): Promise<void> {
  try {
    setStatus('syncing')
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ state: localSnapshot() }),
    })
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    if (data?.disabled) { setStatus('local'); return }
    if (data?.state) applyLocal(data.state) // server-merged truth
    setStatus('synced')
  } catch {
    setStatus('error')
  }
}

let timer: ReturnType<typeof setTimeout> | null = null
export function pushDebounced(delay = 1500): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { timer = null; void push() }, delay)
}
function flush(): void {
  if (timer) { clearTimeout(timer); timer = null }
  void push()
}

let started = false
export function initSync(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void pull()
  window.addEventListener('tcm:statechange', () => pushDebounced())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
    else void pull()
  })
}
