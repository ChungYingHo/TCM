// Word-level spaced repetition (Leitner). Thin wrapper over the shared Leitner core
// (utils/leitner.ts) — same algorithm as elementSrs, so the user holds ONE mental model
// of "due for review". New-word PACE is progress-based (cursor, see studyCursor.ts);
// review TIMING is calendar-based (forgetting is), so the two are intentionally separate.
// Synced via cloud.ts under `vocabSrs`.
import type { VocabSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

const srs = createLeitner('tcm.vocabSrs.v1')

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
