// 胺基酸測驗的間隔複習（Leitner），與 vocabSrs／elementSrs 共用同一核心 (utils/leitner.ts)。
//
// 2026-08-05 起**休眠**：胺基酸小遊戲已移除（Aira：差不多熟了，改跟其他化學一起用必背卡排班，
// 見 /api/note-review）。這個 store 保留只為**不要在下次雲端同步時把既有的複習歷史抹掉**——
// cloud.ts 仍會 dump/replace 它。沒有任何 UI 會再寫入。
import type { AminoAcidSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

const srs = createLeitner('tcm.aminoAcidSrs.v1')

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpAminoAcidSrs(): AminoAcidSrsStore {
  return srs.dump()
}
export function replaceAminoAcidSrs(store: AminoAcidSrsStore): void {
  srs.replace(store)
}
