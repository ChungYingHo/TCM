import type { OptionLetter, QuestionRecord, School } from '@/models/question'
import type { ExamResult } from '@/models/progress'

/**
 * Whether a single chosen letter is correct for a question.
 * IMPORTANT: reads only `award_all` / `correct_answer` — never any LLM-derived field.
 * - award_all (送分): any choice is correct.
 * - otherwise: the choice must be among the correct answers.
 */
export function isChoiceCorrect(q: QuestionRecord, choice: OptionLetter | null): boolean {
  if (q.award_all) return true
  if (!choice) return false
  return q.correct_answer.includes(choice)
}

/** Score a full set of answers (exam mode). Unanswered counts as wrong. */
export function scoreExam(
  questions: QuestionRecord[],
  answers: Record<string, OptionLetter | null>,
): ExamResult {
  const perQuestion: Record<string, boolean> = {}
  let correct = 0
  let answered = 0
  for (const q of questions) {
    const choice = answers[q.id] ?? null
    if (choice) answered += 1
    const ok = isChoiceCorrect(q, choice)
    perQuestion[q.id] = ok
    if (ok) correct += 1
  }
  return { total: questions.length, correct, answered, perQuestion }
}

export interface ExamScoring {
  perQuestion: number // points per question
  wrongPenalty: number // points removed per ANSWERED-wrong question (未作答不扣)
  floorZero: boolean // section score cannot go below 0
}

/**
 * Real per-paper scoring, transcribed verbatim from each exam's printed 作答說明
 * — NEVER guessed (correctness rule: scoring comes from the paper, not the LLM):
 *   每題一律 2 分、未作答不扣分、倒扣以本科零分為下限。
 *   ISU 義守：104–115 歷年皆「答錯倒扣 0.5 分」。
 *   CMU 中國醫 / TCU 慈濟：104–109 不倒扣；110 學年起「答錯倒扣 0.7 分」。
 */
export function examScoring(school: School, year: number): ExamScoring {
  let wrongPenalty = 0
  if (school === 'ISU') wrongPenalty = 0.5
  else if (year >= 110) wrongPenalty = 0.7 // CMU、TCU 自 110 學年起倒扣
  return { perQuestion: 2, wrongPenalty, floorZero: true }
}

export interface ExamScore {
  total: number
  correct: number
  wrong: number // answered but incorrect
  blank: number // unanswered
  points: number // with 倒扣 applied, floored when floorZero
  maxPoints: number
  perQuestion: Record<string, boolean>
}

/** Score an exam under a scoring rule, applying 倒扣 to answered-wrong only. */
export function scoreExamPoints(
  questions: QuestionRecord[],
  answers: Record<string, OptionLetter | null>,
  scoring: ExamScoring,
): ExamScore {
  const perQuestion: Record<string, boolean> = {}
  let correct = 0
  let wrong = 0
  let blank = 0
  for (const q of questions) {
    const choice = answers[q.id] ?? null
    const ok = isChoiceCorrect(q, choice)
    perQuestion[q.id] = ok
    if (ok) correct += 1
    else if (choice) wrong += 1
    else blank += 1
  }
  let points = correct * scoring.perQuestion - wrong * scoring.wrongPenalty
  if (scoring.floorZero) points = Math.max(0, points)
  return {
    total: questions.length,
    correct,
    wrong,
    blank,
    points,
    maxPoints: questions.length * scoring.perQuestion,
    perQuestion,
  }
}

/** Display string for a question's answer (post-errata). */
export function answerLabel(q: QuestionRecord): string {
  if (q.award_all) return '送分（全對）'
  return q.correct_answer.join('、') || '—'
}
