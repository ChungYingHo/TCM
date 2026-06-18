// 古文 spaced repetition (Leitner) — thin wrapper over the shared Leitner core, keyed by
// classic id. Read a 古文 today → it resurfaces for active-recall review on the SRS schedule,
// so 語感 is maintained by spaced re-exposure (not just a one-off read). Synced via cloud.ts
// under `classicSrs`. Same model as vocab/element (one mental model of "due for review").
import type { ElementSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

const srs = createLeitner('tcm.classicSrs.v1')

export const learn = srs.learn
export const grade = srs.grade
export const dueIds = srs.dueIds
export const getCard = srs.getCard

/** Count of classics currently due for review — for the weekend 落後清單. */
export function dueCount(now = Date.now()): number {
  return srs.dueIds(now).length
}

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpClassicSrs(): ElementSrsStore {
  return srs.dump()
}
export function replaceClassicSrs(store: ElementSrsStore): void {
  srs.replace(store)
}
