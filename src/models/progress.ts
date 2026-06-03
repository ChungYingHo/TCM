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

/** A free-text personal note, filed under a concept tag, optionally tied to a question. */
export interface PersonalNote {
  id: string
  tag: string          // concept tag → shows in that note's 我的筆記 section
  questionId: string   // source question ('' if written elsewhere)
  text: string
  ts: number
}

/** Daily study streak (consecutive active days). */
export interface Streak {
  lastDay: string // 'YYYY-MM-DD' (local)
  count: number
  best: number
}

/** The whole persisted user document (stored in the Vercel DB). */
export interface SyncState {
  wrongbook: Record<string, WrongEntry>
  progress: Record<string, Attempt>
  notes: PersonalNote[]
  streak?: Streak
  updatedAt: number
}

export interface Attempt {
  attempts: number
  correct: number
  lastTs: number
}
