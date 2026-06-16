import { describe, it, expect } from 'vitest'
import type { QuestionRecord } from '@/models/question'
import { filterQuestions, searchQuestions } from '@/utils/query'
import { EMPTY_FILTER } from '@/models/filters'

function q(p: Partial<QuestionRecord>): QuestionRecord {
  return {
    id: Math.random().toString(36), school: 'ISU', year: 115, subject: 'chemistry',
    question_number: 1, question_image_url: '', question_text: '', options: [],
    correct_answer: ['A'], original_answer: ['A'], errata_applied: false,
    errata_reason_image_url: null, award_all: false, concept_tags: [],
    explanation: null, source_pdf: '', source_answer_pdf: '', needs_review: false,
    image_w: 0, image_h: 0, ...p,
  }
}

const data = [
  q({ year: 115, subject: 'chemistry', concept_tags: ['酸鹼平衡'] }),
  q({ year: 114, subject: 'chemistry', concept_tags: ['熱力學'] }),
  q({ year: 115, subject: 'biology', concept_tags: ['光合作用', 'C4與CAM植物'] }),
  q({ year: 113, subject: 'chinese', concept_tags: [] }),
]

describe('filterQuestions', () => {
  it('returns all with an empty filter', () => {
    expect(filterQuestions(data, EMPTY_FILTER)).toHaveLength(4)
  })

  it('intersects facets (year AND subject)', () => {
    const r = filterQuestions(data, { ...EMPTY_FILTER, years: [115], subjects: ['chemistry'] })
    expect(r).toHaveLength(1)
    expect(r[0].concept_tags).toContain('酸鹼平衡')
  })

  it('unions within a facet (subject = chemistry OR biology)', () => {
    const r = filterQuestions(data, { ...EMPTY_FILTER, subjects: ['chemistry', 'biology'] })
    expect(r).toHaveLength(3)
  })

  it('matches a question if it has any selected tag', () => {
    const r = filterQuestions(data, { ...EMPTY_FILTER, tags: ['C4與CAM植物'] })
    expect(r).toHaveLength(1)
    expect(r[0].subject).toBe('biology')
  })

  it('returns empty when a tag matches nothing', () => {
    expect(filterQuestions(data, { ...EMPTY_FILTER, tags: ['不存在'] })).toHaveLength(0)
  })
})

describe('searchQuestions', () => {
  const txt = [
    q({ question_text: '光合作用與葉綠體', options: [] }),
    q({ question_text: '', options: [{ letter: 'A', text: '滴定曲線' }] }),
  ]
  it('matches stem text', () => {
    expect(searchQuestions(txt, '葉綠體')).toHaveLength(1)
  })
  it('matches option text', () => {
    expect(searchQuestions(txt, '滴定')).toHaveLength(1)
  })
  it('returns all on empty term', () => {
    expect(searchQuestions(txt, '   ')).toHaveLength(2)
  })
})
