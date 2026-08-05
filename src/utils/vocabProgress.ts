// 「我到底真的記得幾個字」的客觀讀數。
//
// 2026-08-05 Aira：「我發現我 260 大概只記得前面 1/5」——靠感覺判斷很不準，而且她無法驗證
// 排程修好之後有沒有變好。這裡把 Leitner 的 box 翻成三個看得懂的階段。
//
// 判準：**box ≥ 2 才算真的答對過**。
//
// ⚠️ box 1 有兩種完全不同的來源，2026-08-05 修正前被混成同一格：
//   - 剛排進今日單字、**還沒被測過**（無 lapses）→ 這叫「還沒測過」
//   - 測過但答「不熟」（lapses ≥ 1）→ 這才叫「沒過關」
// Aira：「但第一天沒複習單字啊」——第一天只是把 20 個字排進來，卻顯示「還沒過關 20」，
// 讀起來像她考了 20 個字全錯。兩者要分開才不會冤枉自己。
import type { VocabSrsStore } from '@/models/progress'

export interface VocabProgress {
  /** 字庫總字數。 */
  total: number
  /** 還沒測過：排進排程了但還沒翻卡作答過（box 1、沒答錯紀錄）。 */
  untested: number
  /** 沒過關：翻卡答過「不熟」，被打回 box 1。 */
  failed: number
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
  let untested = 0
  let failed = 0
  let learning = 0
  let solid = 0
  let stuck = 0
  for (const card of Object.values(store)) {
    const lapses = card.lapses ?? 0
    if (card.box >= 4) solid++
    else if (card.box >= 2) learning++
    else if (lapses >= 1) failed++
    else untested++
    if (lapses >= 3) stuck++
  }
  const inSchedule = untested + failed + learning + solid
  return {
    total,
    untested,
    failed,
    learning,
    solid,
    untouched: Math.max(0, total - inSchedule),
    stuck,
  }
}
