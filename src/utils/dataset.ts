import type { School, QuestionRecord, SchoolShard, Subject } from '@/models/question'

const cache = new Map<School, QuestionRecord[]>()

/** Lazily fetch a school's shard (gated API), cached in-module. */
export async function loadSchool(school: School): Promise<QuestionRecord[]> {
  const hit = cache.get(school)
  if (hit) return hit
  const res = await fetch(`/api/data/${school}`)
  if (!res.ok) throw new Error(`failed to load ${school}: ${res.status}`)
  const shard = (await res.json()) as SchoolShard
  cache.set(school, shard.questions)
  return shard.questions
}

/** Load and concatenate several schools (union), in the given order. */
export async function loadSchools(schools: School[]): Promise<QuestionRecord[]> {
  const parts = await Promise.all(schools.map(loadSchool))
  return parts.flat()
}

export interface Facets {
  years: number[]
  subjects: Subject[]
  tags: string[]
}

/** Derive available facet values from a question set (instant for ~6k records). */
export function deriveFacets(questions: QuestionRecord[]): Facets {
  const years = new Set<number>()
  const subjects = new Set<Subject>()
  const tags = new Set<string>()
  for (const q of questions) {
    years.add(q.year)
    subjects.add(q.subject)
    for (const t of q.concept_tags) tags.add(t)
  }
  return {
    years: [...years].sort((a, b) => b - a),
    subjects: [...subjects],
    tags: [...tags].sort((a, b) => a.localeCompare(b, 'zh-Hant')),
  }
}
