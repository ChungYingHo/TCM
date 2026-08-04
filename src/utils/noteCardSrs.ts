// 必背回想卡的間隔複習（Leitner）。跟 vocabSrs／elementSrs 一樣是共用核心
// （utils/leitner.ts）的薄包裝，「什麼時候該複習」只有一份實作。卡片 id 由
// utils/noteReview.ts 產生（`<slug>-m-<n>`）。經 cloud.ts 以 `noteCardSrs` 同步。
import type { NoteCardSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

const srs = createLeitner('tcm.noteCardSrs.v1')

export const learn = srs.learn
export const grade = srs.grade
export const dueIds = srs.dueIds
export const getCard = srs.getCard

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpNoteCardSrs(): NoteCardSrsStore {
  return srs.dump()
}
export function replaceNoteCardSrs(store: NoteCardSrsStore): void {
  srs.replace(store)
}
