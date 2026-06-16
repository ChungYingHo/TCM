import type { School, QuestionRecord, SchoolShard, Subject } from '@/models/question'
import { SCHOOLS } from '@/models/question'
import { schoolOf } from '@/utils/questionId'

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

/** Per-school records, tolerating a broken shard: a failed shard is logged and skipped
 *  instead of rejecting the whole batch, so one school can never blank the rest
 *  (per-school isolation on the READ side, mirroring the on-disk sharding). */
export async function loadBySchool(schools: School[] = SCHOOLS): Promise<Map<School, QuestionRecord[]>> {
  const settled = await Promise.allSettled(schools.map(loadSchool))
  const out = new Map<School, QuestionRecord[]>()
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') out.set(schools[i], r.value)
    else console.error(`dataset: shard ${schools[i]} unavailable, skipping —`, r.reason)
  })
  return out
}

/** Load and concatenate several schools (union). Resilient: skips a failed shard. */
export async function loadSchools(schools: School[]): Promise<QuestionRecord[]> {
  return [...(await loadBySchool(schools)).values()].flat()
}

/** Resolve specific question ids to their records, loading ONLY the schools those ids
 *  reference (ids self-describe their school). A corrupt shard drops just its own ids —
 *  it never blanks the whole queue (the old loadSchools([...all]) + Promise.all did). */
export async function loadByIds(ids: string[]): Promise<Map<string, QuestionRecord>> {
  const schools = [...new Set(ids.map(schoolOf).filter((s): s is School => s !== null))]
  const map = new Map<string, QuestionRecord>()
  for (const qs of (await loadBySchool(schools)).values()) for (const q of qs) map.set(q.id, q)
  return map
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
