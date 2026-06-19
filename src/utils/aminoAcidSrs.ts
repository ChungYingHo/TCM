// 胺基酸測驗的間隔複習（Leitner）。與 vocabSrs／elementSrs 共用同一核心
// (utils/leitner.ts) —— 同一套「到期複習」心智模型。卡片以測驗項目 id 為鍵：
// `aa:<code1>`（某胺基酸，見 aminoAcidQuiz.ts）。雲端同步於 cloud.ts 的 `aminoAcidSrs`。
import type { AminoAcidSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

const srs = createLeitner('tcm.aminoAcidSrs.v1')

export const learn = srs.learn
export const grade = srs.grade
export const dueIds = srs.dueIds
export const getCard = srs.getCard

/** Count of cards currently due — for the daily-plan summary. */
export function dueCount(now = Date.now()): number {
  return srs.dueIds(now).length
}

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpAminoAcidSrs(): AminoAcidSrsStore {
  return srs.dump()
}
export function replaceAminoAcidSrs(store: AminoAcidSrsStore): void {
  srs.replace(store)
}
