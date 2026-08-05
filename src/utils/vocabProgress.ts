// 「我到底真的記得幾個字」的客觀讀數。
//
// 2026-08-05 Aira：「我發現我 260 大概只記得前面 1/5」——靠感覺判斷很不準，而且她無法驗證
// 排程修好之後有沒有變好。這裡把 Leitner 的 box 翻成三個看得懂的階段。
//
// 判準：**box ≥ 2 才算真的答對過**。box 1 有兩種來源——剛被種進排程還沒測過，或測了沒過關，
// 兩者都還不算會，所以合成「還沒過關」。這是誠實的下限估計，不會灌水。
import type { VocabSrsStore } from '@/models/progress'

export interface VocabProgress {
  /** 字庫總字數。 */
  total: number
  /** 還沒過關：排程裡但從沒答對過（box 1）。 */
  notYet: number
  /** 開始記得：連續答對 1–2 次（box 2–3，下次複習 3–7 天後）。 */
  learning: number
  /** 穩了：連續答對 3 次以上（box 4+，下次複習 16 天以後）。 */
  solid: number
  /** 還沒進過排程（連看都還沒看到）。 */
  untouched: number
  /** 一直記不起來的（答錯累計 ≥ 3 次）。 */
  stuck: number
}

export function vocabProgress(store: VocabSrsStore, total: number): VocabProgress {
  let notYet = 0
  let learning = 0
  let solid = 0
  let stuck = 0
  for (const card of Object.values(store)) {
    if (card.box >= 4) solid++
    else if (card.box >= 2) learning++
    else notYet++
    if ((card.lapses ?? 0) >= 3) stuck++
  }
  const inSchedule = notYet + learning + solid
  return {
    total,
    notYet,
    learning,
    solid,
    untouched: Math.max(0, total - inSchedule),
    stuck,
  }
}
