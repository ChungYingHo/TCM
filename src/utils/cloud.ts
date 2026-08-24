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
import { dumpNoteCardSrs, replaceNoteCardSrs } from '@/utils/noteCardSrs'

export function localSnapshot(): SyncState {
  return {
    wrongbook: dumpWrong(),
    progress: getAttempts(),
    vocabSrs: dumpVocabSrs(),
    vocabSrsEpoch: VOCAB_SRS_EPOCH,
    elementSrs: dumpElementSrs(),
    classicSrs: dumpClassicSrs(),
    aminoAcidSrs: dumpAminoAcidSrs(),
    noteCardSrs: dumpNoteCardSrs(),
    updatedAt: Date.now(),
  }
}

function applyServer(s: SyncState): void {
  replaceWrong(s.wrongbook ?? {})
  replaceProgress(s.progress ?? {})
  // 複習進度世代閘：只有雲端**明確標了不同世代**才丟棄 vocabSrs，讓單字從今天重排。
  // 沒有這個欄位時一律保留——「我們可能根本沒寫過這個欄位」不等於「這批資料是舊的」。
  // 原本寫成 `=== VOCAB_SRS_EPOCH`，遇到缺欄位就當作對不上而清空；偏偏 api/state.ts 的
  // PUT 白名單漏收了 vocabSrsEpoch，於是每次開頁都把單字複習進度清光，整整三週
  // 「複習單字」區都是空的（2026-08-24）。清空使用者資料的預設值必須是「不清」。
  const staleEpoch = typeof s.vocabSrsEpoch === 'number' && s.vocabSrsEpoch !== VOCAB_SRS_EPOCH
  replaceVocabSrs(staleEpoch ? {} : (s.vocabSrs ?? {}))
  replaceElementSrs(s.elementSrs ?? {})
  replaceClassicSrs(s.classicSrs ?? {})
  replaceAminoAcidSrs(s.aminoAcidSrs ?? {})
  replaceNoteCardSrs(s.noteCardSrs ?? {})
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
