import type { OptionLetter, Subject } from '@/models/question'

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

/** Daily study streak (consecutive active days). */
export interface Streak {
  lastDay: string // 'YYYY-MM-DD' (local)
  count: number
  best: number
}

/** Per-day completion flags for the daily study plan (一格一段). */
export interface DayPlanState {
  notes?: Partial<Record<Subject, boolean>> // that day's note per subject -> done
  quiz?: boolean
  newVocab?: boolean
  reviewVocab?: boolean
  classic?: boolean
  elementQuiz?: boolean // 今日元素小遊戲完成
  wrong?: boolean // due wrong-questions reviewed
  rest?: boolean // user acknowledged a planned light/rest day (keeps the streak alive)
}
export type DailyPlanStore = Record<string, DayPlanState> // 'YYYY-MM-DD' -> state

/** Word-level spaced-repetition card (Leitner box + next-due). */
export interface VocabSrsEntry {
  box: number // 1 = soonest
  due: number // epoch ms — next review due
  ts: number // last graded
}
export type VocabSrsStore = Record<string, VocabSrsEntry> // word id -> card

/** Element-game spaced-repetition card. Same Leitner shape as vocab; keyed by a
 *  quiz-item id (`el:<z>` for an element, `bond:<formula>` for a bond example). */
export type ElementSrsEntry = VocabSrsEntry
export type ElementSrsStore = Record<string, ElementSrsEntry> // item id -> card
// 古文 SRS reuses the same card shape, keyed by classic id.
export type ClassicSrsStore = ElementSrsStore

/** The whole persisted user document (stored in the Vercel DB). */
export interface SyncState {
  wrongbook: Record<string, WrongEntry>
  progress: Record<string, Attempt>
  streak?: Streak
  plan?: DailyPlanStore
  vocabSrs?: VocabSrsStore
  elementSrs?: ElementSrsStore
  classicSrs?: ClassicSrsStore
  updatedAt: number
}

export interface Attempt {
  attempts: number
  correct: number
  lastTs: number
}
