import { describe, it, expect } from 'vitest'
import type { QuestionRecord } from '@/models/question'
import { isChoiceCorrect, scoreExam, scoreExamPoints, examScoring, answerLabel } from '@/utils/score'

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

describe('examScoring (real 倒扣 rules, transcribed from the papers)', () => {
  it('ISU always deducts 0.5 per wrong', () => {
    expect(examScoring('ISU', 104)).toEqual({ perQuestion: 2, wrongPenalty: 0.5, floorZero: true })
    expect(examScoring('ISU', 115).wrongPenalty).toBe(0.5)
  })

  it('CMU/TCU do not deduct before 110, deduct 0.7 from 110', () => {
    expect(examScoring('CMU', 109).wrongPenalty).toBe(0)
    expect(examScoring('CMU', 110).wrongPenalty).toBe(0.7)
    expect(examScoring('TCU', 108).wrongPenalty).toBe(0)
    expect(examScoring('TCU', 113).wrongPenalty).toBe(0.7)
  })
})

describe('scoreExamPoints (倒扣 applied to answered-wrong only)', () => {
  const paper = [
    q({ id: '1', correct_answer: ['A'] }),
    q({ id: '2', correct_answer: ['B'] }),
    q({ id: '3', correct_answer: ['C'] }),
    q({ id: '4', correct_answer: ['D'] }),
  ]

  it('ISU: 2 correct, 1 wrong, 1 blank → 4 − 0.5 = 3.5 (blank not penalized)', () => {
    const s = scoreExamPoints(paper, { '1': 'A', '2': 'B', '3': 'A', '4': null }, examScoring('ISU', 115))
    expect(s.correct).toBe(2)
    expect(s.wrong).toBe(1)
    expect(s.blank).toBe(1)
    expect(s.points).toBe(3.5)
    expect(s.maxPoints).toBe(8)
  })

  it('no-倒扣 paper (CMU 108): wrong answers cost nothing', () => {
    const s = scoreExamPoints(paper, { '1': 'A', '2': 'X' as never, '3': null, '4': null }, examScoring('CMU', 108))
    expect(s.points).toBe(2) // only the 1 correct counts; wrong/blank = 0
  })

  it('floors at zero (cannot go negative)', () => {
    const allWrong = scoreExamPoints(paper, { '1': 'B', '2': 'A', '3': 'A', '4': 'A' }, examScoring('CMU', 113))
    expect(allWrong.wrong).toBe(4)
    expect(allWrong.points).toBe(0) // 0 correct − 4×0.7 = −2.8 → floored to 0
  })

  it('award_all (送分) counts correct regardless of choice', () => {
    const withBonus = [...paper, q({ id: '5', award_all: true })]
    const s = scoreExamPoints(withBonus, { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': null }, examScoring('ISU', 115))
    expect(s.correct).toBe(5)
    expect(s.points).toBe(10)
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
