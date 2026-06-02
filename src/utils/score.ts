import type { OptionLetter, QuestionRecord } from '@/models/question'
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

/** Display string for a question's answer (post-errata). */
export function answerLabel(q: QuestionRecord): string {
  if (q.award_all) return '送分（全對）'
  return q.correct_answer.join('、') || '—'
}
