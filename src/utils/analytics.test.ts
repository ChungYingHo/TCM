import { describe, it, expect } from 'vitest'
import type { QuestionRecord, School } from '@/models/question'
import type { WrongEntry } from '@/models/progress'
import type { Attempt } from '@/utils/progress'
import { tagTrends, crossSchoolWeights, weaknessClusters, coverage, eraDistribution } from '@/utils/analytics'

let n = 0
function q(p: Partial<QuestionRecord>): QuestionRecord {
  n += 1
  return {
    id: `id-${n}`, school: 'ISU', year: 115, subject: 'biology', question_number: n,
    question_image_url: '', question_text: '', options: [],
    correct_answer: ['A'], original_answer: ['A'], errata_applied: false,
    errata_reason_image_url: null, award_all: false, concept_tags: [],
    explanation: null, source_pdf: '', source_answer_pdf: '', needs_review: false,
    image_w: 0, image_h: 0, ...p,
  }
}

describe('tagTrends', () => {
  it('zero-fills years and flags a rising tag as up', () => {
    const data = [
      q({ year: 104, subject: 'biology', concept_tags: [] }),
      q({ year: 115, subject: 'biology', concept_tags: ['光合作用'] }),
      q({ year: 115, subject: 'biology', concept_tags: ['光合作用'] }),
      q({ year: 114, subject: 'biology', concept_tags: ['光合作用'] }),
    ]
    const t = tagTrends(data, 'biology')
    const photo = t.find((x) => x.tag === '光合作用')!
    expect(photo.total).toBe(3)
    expect(photo.points.map((p) => p.year)).toEqual([104, 114, 115]) // continuous, sorted
    expect(photo.trend).toBe('up')
  })

  it('only counts the requested subject', () => {
    const data = [q({ subject: 'chemistry', concept_tags: ['酸鹼平衡'] })]
    expect(tagTrends(data, 'biology')).toHaveLength(0)
  })
})

describe('crossSchoolWeights', () => {
  it('computes each school\'s share of subject questions for a tag', () => {
    const bySchool: Partial<Record<School, QuestionRecord[]>> = {
      CMU: [q({ school: 'CMU', subject: 'biology', concept_tags: ['光合作用'] }), q({ school: 'CMU', subject: 'biology', concept_tags: [] })],
      ISU: [q({ school: 'ISU', subject: 'biology', concept_tags: ['光合作用'] })],
    }
    const rows = crossSchoolWeights(bySchool, 'biology')
    const photo = rows.find((r) => r.tag === '光合作用')!
    expect(photo.weights.CMU).toBeCloseTo(50) // 1 of 2
    expect(photo.weights.ISU).toBeCloseTo(100) // 1 of 1
  })
})

describe('weaknessClusters', () => {
  it('aggregates wrong counts by concept tag, weakest first', () => {
    const q1 = q({ id: 'q1', subject: 'biology', concept_tags: ['光合作用', '酵素'] })
    const q2 = q({ id: 'q2', subject: 'biology', concept_tags: ['光合作用'] })
    const byId = new Map([['q1', q1], ['q2', q2]])
    const wrong: WrongEntry[] = [
      { id: 'q1', wrongCount: 3, lastWrongAt: 1, lastChoice: ['B'] },
      { id: 'q2', wrongCount: 2, lastWrongAt: 1, lastChoice: ['B'] },
    ]
    const clusters = weaknessClusters(byId, wrong)
    expect(clusters[0].tag).toBe('光合作用')
    expect(clusters[0].wrongCount).toBe(5)
    expect(clusters[0].questionCount).toBe(2)
  })
})

describe('eraDistribution', () => {
  it('counts 國文 questions by era, most-tested first, ignoring null/non-chinese', () => {
    const data = [
      q({ subject: 'chinese', era: '唐' }),
      q({ subject: 'chinese', era: '唐' }),
      q({ subject: 'chinese', era: '先秦' }),
      q({ subject: 'chinese', era: null }), // undetermined — excluded
      q({ subject: 'biology', era: '唐' }), // wrong subject — excluded
    ]
    const dist = eraDistribution(data)
    expect(dist.map((e) => e.era)).toEqual(['唐', '先秦']) // sorted by count desc
    expect(dist[0]).toMatchObject({ era: '唐', count: 2, pct: 67 }) // 2 of 3 determined
    expect(dist[1]).toMatchObject({ era: '先秦', count: 1, pct: 33 })
  })

  it('returns empty when nothing is determinable', () => {
    expect(eraDistribution([q({ subject: 'chinese', era: null })])).toEqual([])
  })
})

describe('coverage', () => {
  it('tracks practiced vs mastered tags per subject', () => {
    const data = [
      q({ id: 'a', subject: 'biology', concept_tags: ['光合作用'] }),
      q({ id: 'b', subject: 'biology', concept_tags: ['酵素'] }),
      q({ id: 'c', subject: 'biology', concept_tags: ['免疫'] }),
    ]
    const attempts: Record<string, Attempt> = {
      a: { attempts: 2, correct: 1, lastTs: 1 }, // practiced + mastered
      b: { attempts: 1, correct: 0, lastTs: 1 }, // practiced only
    }
    const cov = coverage(data, attempts).find((c) => c.subject === 'biology')!
    expect(cov.totalTags).toBe(3)
    expect(cov.practicedTags).toBe(2) // 光合作用 + 酵素
    expect(cov.masteredTags).toBe(1) // 光合作用
    expect(cov.attemptedQuestions).toBe(2)
    expect(cov.correctQuestions).toBe(1)
  })
})
