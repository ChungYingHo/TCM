import type { OptionLetter } from '@/models/question'

/** A wrong-answer-book entry, persisted in localStorage. Doubles as the spaced-
 *  repetition card: `due` is when it should next be reviewed, `box` the Leitner level. */
export interface WrongEntry {
  id: string                 // question id
  wrongCount: number
  lastWrongAt: number        // epoch ms
  lastChoice: OptionLetter[] // most recent wrong choice
  due?: number               // epoch ms — next review due (defaults to lastWrongAt)
  box?: number               // Leitner box (1 = soonest)
}

export interface ExamResult {
  total: number
  correct: number
  answered: number
  perQuestion: Record<string, boolean> // question id -> correct?
}

/** Word-level spaced-repetition card (Leitner box + next-due). */
export interface VocabSrsEntry {
  box: number // 1 = soonest
  due: number // epoch ms — next review due
  ts: number // last graded
  /** 累計答「不熟」的次數。用來揪出一直背不起來的（SRS 術語 leech）——那些才是該回去
   *  補筆記或換記法的，光靠排程再輪幾次也沒用。舊資料沒有這欄，視為 0。 */
  lapses?: number
}
export type VocabSrsStore = Record<string, VocabSrsEntry> // word id -> card

/** Element-game spaced-repetition card. Same Leitner shape as vocab; keyed by a
 *  quiz-item id (`el:<z>` for an element, `bond:<formula>` for a bond example). */
export type ElementSrsEntry = VocabSrsEntry
export type ElementSrsStore = Record<string, ElementSrsEntry> // item id -> card
// 古文 SRS reuses the same card shape, keyed by classic id.
export type ClassicSrsStore = ElementSrsStore
// 胺基酸 SRS reuses the same card shape, keyed by `aa:<code1>`.
export type AminoAcidSrsStore = ElementSrsStore
// 必背回想卡 SRS reuses the same card shape, keyed by `<note-slug>-m-<n>`。
export type NoteCardSrsStore = ElementSrsStore

/** The whole persisted user document (stored in the Vercel DB). */
export interface SyncState {
  wrongbook: Record<string, WrongEntry>
  progress: Record<string, Attempt>
  vocabSrs?: VocabSrsStore
  vocabSrsEpoch?: number // 複習進度世代；與 cloud.ts 對不上就丟棄舊 vocabSrs（見 vocabSrs.ts）
  elementSrs?: ElementSrsStore
  classicSrs?: ClassicSrsStore
  aminoAcidSrs?: AminoAcidSrsStore
  noteCardSrs?: NoteCardSrsStore
  updatedAt: number
}

export interface Attempt {
  attempts: number
  correct: number
  lastTs: number
}
