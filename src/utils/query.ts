import type { QuestionRecord } from '@/models/question'
import type { QueryFilter } from '@/models/filters'

/**
 * Intersection filtering: a question matches when it satisfies EVERY active facet
 * (year AND subject AND tag), where within a facet the selected values are a UNION
 * (e.g. subject = chemistry OR biology). School union is handled by the caller
 * choosing which shards to load. An empty facet imposes no constraint.
 */
export function filterQuestions(questions: QuestionRecord[], f: QueryFilter): QuestionRecord[] {
  const years = new Set(f.years)
  const subjects = new Set<string>(f.subjects)
  const tags = new Set(f.tags)
  return questions.filter((q) => {
    if (years.size && !years.has(q.year)) return false
    if (subjects.size && !subjects.has(q.subject)) return false
    if (tags.size && !q.concept_tags.some((t) => tags.has(t))) return false
    return true
  })
}

/** Free-text search over extracted question/option text (CJK-safe substring). */
export function searchQuestions(questions: QuestionRecord[], term: string): QuestionRecord[] {
  const t = term.trim().toLowerCase()
  if (!t) return questions
  return questions.filter((q) => {
    if (q.question_text.toLowerCase().includes(t)) return true
    return q.options.some((o) => o.text.toLowerCase().includes(t))
  })
}
