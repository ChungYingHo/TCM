// Element-game spaced repetition (Leitner). Thin wrapper over the shared Leitner core
// (utils/leitner.ts) — the exact same model as vocabSrs, so the user holds ONE mental
// model of "due for review" across words and elements. Cards are keyed by quiz-item id
// `el:<z>` (an element; see elementQuiz.ts). Synced via cloud.ts under `elementSrs`.
import type { ElementSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

const srs = createLeitner('tcm.elementSrs.v1')

export const learn = srs.learn
export const grade = srs.grade
export const dueIds = srs.dueIds
export const getCard = srs.getCard

/** Count of cards currently due — for the daily-plan "落後了什麼" buffer summary. */
export function dueCount(now = Date.now()): number {
  return srs.dueIds(now).length
}

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpElementSrs(): ElementSrsStore {
  return srs.dump()
}
export function replaceElementSrs(store: ElementSrsStore): void {
  srs.replace(store)
}
