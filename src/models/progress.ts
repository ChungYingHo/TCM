import type { OptionLetter } from '@/models/question'

/** A wrong-answer-book entry, persisted in localStorage. */
export interface WrongEntry {
  id: string                 // question id
  wrongCount: number
  lastWrongAt: number        // epoch ms
  lastChoice: OptionLetter[] // most recent wrong choice
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

/** The whole persisted user document (stored in the Vercel DB). */
export interface SyncState {
  wrongbook: Record<string, WrongEntry>
  progress: Record<string, Attempt>
  notes: PersonalNote[]
  updatedAt: number
}

export interface Attempt {
  attempts: number
  correct: number
  lastTs: number
}
