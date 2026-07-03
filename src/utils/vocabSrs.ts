// Word-level spaced repetition (Leitner). Thin wrapper over the shared Leitner core
// (utils/leitner.ts) — same algorithm as elementSrs, so the user holds ONE mental model
// of "due for review". A new word gets no card until first studied; review TIMING is
// calendar-based (forgetting is time-based). Synced via cloud.ts under `vocabSrs`.
import type { VocabSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

// 複習進度「世代」：整批換字庫時 +1，舊排程（含雲端 blob）一律作廢、單字從當天重新起算。
// 同一個數字同時決定 localStorage key（tcm.vocabSrs.v<N>）與 cloud.ts 的 epoch gate。
// v1→v2（2026-07-04）：舊 3240 GRE 字庫下架、改成老師字根字庫 132 字，複習全部歸零重排。
export const VOCAB_SRS_EPOCH = 2

const srs = createLeitner(`tcm.vocabSrs.v${VOCAB_SRS_EPOCH}`)

export const learn = srs.learn
export const grade = srs.grade
export const touch = srs.touch
export const dueIds = srs.dueIds
export const getCard = srs.getCard

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpVocabSrs(): VocabSrsStore {
  return srs.dump()
}
export function replaceVocabSrs(store: VocabSrsStore): void {
  srs.replace(store)
}
