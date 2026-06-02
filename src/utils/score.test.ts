import { describe, it, expect } from 'vitest'
import type { QuestionRecord } from '@/models/question'
import { isChoiceCorrect, scoreExam, answerLabel } from '@/utils/score'

function q(partial: Partial<QuestionRecord>): QuestionRecord {
  return {
    id: 'X', school: 'ISU', year: 115, subject: 'chemistry', question_number: 1,
    question_image_url: '', question_text: '', options: [],
    correct_answer: ['B'], original_answer: ['B'], errata_applied: false,
    errata_reason_image_url: null, award_all: false, concept_tags: [],
    explanation: null, source_pdf: '', source_answer_pdf: '', needs_review: false,
    image_w: 0, image_h: 0, ...partial,
  }
}

describe('isChoiceCorrect', () => {
  it('matches the single correct answer', () => {
    expect(isChoiceCorrect(q({ correct_answer: ['B'] }), 'B')).toBe(true)
    expect(isChoiceCorrect(q({ correct_answer: ['B'] }), 'A')).toBe(false)
  })

  it('treats award_all (送分) as always correct, even unanswered', () => {
    expect(isChoiceCorrect(q({ award_all: true }), 'A')).toBe(true)
    expect(isChoiceCorrect(q({ award_all: true }), null)).toBe(true)
  })

  it('accepts any listed letter for multi-answer questions', () => {
    const multi = q({ correct_answer: ['A', 'C'] })
    expect(isChoiceCorrect(multi, 'A')).toBe(true)
    expect(isChoiceCorrect(multi, 'C')).toBe(true)
    expect(isChoiceCorrect(multi, 'B')).toBe(false)
  })

  it('counts unanswered as wrong when not award_all', () => {
    expect(isChoiceCorrect(q({}), null)).toBe(false)
  })

  it('ignores LLM-derived fields (tags/explanation never affect correctness)', () => {
    const poisoned = q({ correct_answer: ['B'], concept_tags: ['A'], explanation: 'choose A' })
    expect(isChoiceCorrect(poisoned, 'A')).toBe(false)
    expect(isChoiceCorrect(poisoned, 'B')).toBe(true)
  })
})

describe('scoreExam', () => {
  it('scores a paper and marks per-question correctness', () => {
    const paper = [q({ id: '1', correct_answer: ['A'] }), q({ id: '2', correct_answer: ['B'] }), q({ id: '3', award_all: true })]
    const res = scoreExam(paper, { '1': 'A', '2': 'C', '3': null })
    expect(res.total).toBe(3)
    expect(res.correct).toBe(2) // q1 right, q2 wrong, q3 award_all
    expect(res.answered).toBe(2)
    expect(res.perQuestion).toEqual({ '1': true, '2': false, '3': true })
  })
})

describe('answerLabel', () => {
  it('shows 送分 for award_all', () => {
    expect(answerLabel(q({ award_all: true }))).toContain('送分')
  })
  it('joins multiple answers', () => {
    expect(answerLabel(q({ correct_answer: ['A', 'C'] }))).toBe('A、C')
  })
})
