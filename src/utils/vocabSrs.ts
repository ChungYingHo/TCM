// Word-level spaced repetition (Leitner). Thin wrapper over the shared Leitner core
// (utils/leitner.ts) — same algorithm as elementSrs, so the user holds ONE mental model
// of "due for review". A new word gets no card until first studied; review TIMING is
// calendar-based (forgetting is time-based). Synced via cloud.ts under `vocabSrs`.
import type { VocabSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

// 複習進度「世代」：整批換字庫時 +1，舊排程（含雲端 blob）一律作廢、單字從當天重新起算。
// 同一個數字同時決定 localStorage key（tcm.vocabSrs.v<N>）與 cloud.ts 的 epoch gate。
// v1→v2（2026-07-04）：舊 3240 GRE 字庫下架、改成老師字根字庫 132 字，複習全部歸零重排。
// v2→v3（2026-08-05）：舊排程有 bug——seedSchedule 用日期推算「學過了」，第 12 天整個字庫
//   252 字全被標成已學＋到期，其中兩百多個 Aira 從沒真正學過。那些 box 值不帶任何資訊，留著
//   只會讓「複習」拿她沒學過的字考她。連同 VOCAB_SCHEDULE_START 一起重設，從第一個字重走。
export const VOCAB_SRS_EPOCH = 3

const srs = createLeitner(`tcm.vocabSrs.v${VOCAB_SRS_EPOCH}`)

export const learn = srs.learn
export const grade = srs.grade
export const touch = srs.touch
export const dueIds = srs.dueIds
export const leechIds = srs.leechIds
export const getCard = srs.getCard

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpVocabSrs(): VocabSrsStore {
  return srs.dump()
}
export function replaceVocabSrs(store: VocabSrsStore): void {
  srs.replace(store)
}
