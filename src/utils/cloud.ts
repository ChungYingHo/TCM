// Minimal cloud persistence for the wrong-book + progress.
// The Vercel DB is the durable home; localStorage is just a fast local cache.
// On boot we load the DB copy once; on each change we save the whole (tiny) doc
// back (last-write-wins — fine for a single user). No merge / backup / offline
// machinery. If no DB is configured the API reports {disabled} and we stay local.

import type { SyncState } from '@/models/progress'
import { dumpWrong, replaceWrong } from '@/utils/wrongBook'
import { getAttempts, replaceProgress } from '@/utils/progress'
import { dumpVocabSrs, replaceVocabSrs, VOCAB_SRS_EPOCH } from '@/utils/vocabSrs'
import { dumpElementSrs, replaceElementSrs } from '@/utils/elementSrs'
import { dumpClassicSrs, replaceClassicSrs } from '@/utils/classicSrs'
import { dumpAminoAcidSrs, replaceAminoAcidSrs } from '@/utils/aminoAcidSrs'

export function localSnapshot(): SyncState {
  return {
    wrongbook: dumpWrong(),
    progress: getAttempts(),
    vocabSrs: dumpVocabSrs(),
    vocabSrsEpoch: VOCAB_SRS_EPOCH,
    elementSrs: dumpElementSrs(),
    classicSrs: dumpClassicSrs(),
    aminoAcidSrs: dumpAminoAcidSrs(),
    updatedAt: Date.now(),
  }
}

function applyServer(s: SyncState): void {
  replaceWrong(s.wrongbook ?? {})
  replaceProgress(s.progress ?? {})
  // 複習進度世代閘：雲端 epoch 對不上（含舊 blob 無此欄）就丟棄舊 vocabSrs，讓單字從今天重排。
  replaceVocabSrs(s.vocabSrsEpoch === VOCAB_SRS_EPOCH ? (s.vocabSrs ?? {}) : {})
  replaceElementSrs(s.elementSrs ?? {})
  replaceClassicSrs(s.classicSrs ?? {})
  replaceAminoAcidSrs(s.aminoAcidSrs ?? {})
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tcm:cloudloaded'))
}

let timer: ReturnType<typeof setTimeout> | null = null
let loaded = false // becomes true once the initial DB load has been attempted
async function save(): Promise<void> {
  // Never PUT before we've loaded the server copy — otherwise a pre-load (possibly
  // empty) local snapshot could clobber real cloud data. The change stays in
  // localStorage and flushes on the next statechange after load.
  if (!loaded) return
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
  const ready = () => {
    loaded = true // enable saving only now — see save()'s guard
    window.addEventListener('tcm:statechange', () => saveDebounced())
  }
  // load the DB copy first, THEN start saving (so we never overwrite with a
  // pre-load stale snapshot)
  fetch('/api/state')
    .then((r) => r.json())
    .then((d) => { if (d?.state) applyServer(d.state) })
    .catch(() => {})
    .finally(ready)
}
