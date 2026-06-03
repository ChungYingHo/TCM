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

/** The whole persisted user document (stored in the Vercel DB). */
export interface SyncState {
  wrongbook: Record<string, WrongEntry>
  progress: Record<string, Attempt>
  updatedAt: number
}

export interface Attempt {
  attempts: number
  correct: number
  lastTs: number
}
