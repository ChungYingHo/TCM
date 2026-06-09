import type { QuestionRecord, School, Subject } from '@/models/question'
import type { Attempt } from '@/utils/progress'
import type { WrongEntry } from '@/models/progress'

export type Trend = 'up' | 'down' | 'stable'

export interface TagTrend {
  tag: string
  total: number
  points: { year: number; count: number }[] // continuous over the subject's years
  trend: Trend
}

function classifyTrend(points: { year: number; count: number }[]): Trend {
  if (points.length < 3) return 'stable'
  const mid = Math.floor(points.length / 2)
  const avg = (arr: { count: number }[]) =>
    arr.reduce((s, p) => s + p.count, 0) / Math.max(1, arr.length)
  const early = avg(points.slice(0, mid))
  const late = avg(points.slice(mid))
  if (late >= early * 1.25 && late - early >= 0.5) return 'up'
  if (late <= early * 0.75 && early - late >= 0.5) return 'down'
  return 'stable'
}

/** Per-tag yearly frequency (zero-filled over the subject's year span) + trend. */
export function tagTrends(questions: QuestionRecord[], subject: Subject): TagTrend[] {
  const subset = questions.filter((q) => q.subject === subject)
  const years = [...new Set(subset.map((q) => q.year))].sort((a, b) => a - b)
  const counts = new Map<string, Map<number, number>>()
  for (const q of subset) {
    for (const tag of q.concept_tags) {
      const m = counts.get(tag) ?? new Map<number, number>()
      m.set(q.year, (m.get(q.year) ?? 0) + 1)
      counts.set(tag, m)
    }
  }
  const out: TagTrend[] = []
  for (const [tag, m] of counts) {
    const points = years.map((y) => ({ year: y, count: m.get(y) ?? 0 }))
    const total = points.reduce((s, p) => s + p.count, 0)
    out.push({ tag, total, points, trend: classifyTrend(points) })
  }
  return out.sort((a, b) => b.total - a.total)
}

export interface CrossSchoolRow {
  tag: string
  total: number
  weights: Partial<Record<School, number>> // % of that school's subject questions
}

/** Same concept's weight (share of subject questions) across schools. */
export function crossSchoolWeights(
  bySchool: Partial<Record<School, QuestionRecord[]>>,
  subject: Subject,
): CrossSchoolRow[] {
  const schools = Object.keys(bySchool) as School[]
  const subjectTotals = new Map<School, number>()
  const tagCounts = new Map<string, Partial<Record<School, number>>>()
  for (const school of schools) {
    const subset = (bySchool[school] ?? []).filter((q) => q.subject === subject)
    subjectTotals.set(school, subset.length)
    for (const q of subset) {
      for (const tag of q.concept_tags) {
        const row = tagCounts.get(tag) ?? {}
        row[school] = (row[school] ?? 0) + 1
        tagCounts.set(tag, row)
      }
    }
  }
  const rows: CrossSchoolRow[] = []
  for (const [tag, counts] of tagCounts) {
    const weights: Partial<Record<School, number>> = {}
    let total = 0
    for (const school of schools) {
      const c = counts[school] ?? 0
      total += c
      const denom = subjectTotals.get(school) ?? 0
      weights[school] = denom ? (c / denom) * 100 : 0
    }
    rows.push({ tag, total, weights })
  }
  return rows.sort((a, b) => b.total - a.total)
}

export interface WeakCluster {
  tag: string
  subject: Subject
  wrongCount: number
  questionCount: number
}

/** Cluster the wrong-book by concept tag -> weakest topics first. */
export function weaknessClusters(
  byId: Map<string, QuestionRecord>,
  wrong: WrongEntry[],
): WeakCluster[] {
  const agg = new Map<string, { subject: Subject; wrong: number; qs: Set<string> }>()
  for (const entry of wrong) {
    const q = byId.get(entry.id)
    if (!q) continue
    for (const tag of q.concept_tags) {
      const cur = agg.get(tag) ?? { subject: q.subject, wrong: 0, qs: new Set<string>() }
      cur.wrong += entry.wrongCount
      cur.qs.add(entry.id)
      agg.set(tag, cur)
    }
  }
  return [...agg.entries()]
    .map(([tag, v]) => ({ tag, subject: v.subject, wrongCount: v.wrong, questionCount: v.qs.size }))
    .sort((a, b) => b.wrongCount - a.wrongCount || b.questionCount - a.questionCount)
}

export interface EraCount {
  era: string
  count: number
  pct: number // share of era-determined 國文 questions
}

/** 國文 questions grouped by detectable era/dynasty (era=null is left out — only the
 *  determinable subset is reported). Sorted most-tested first → which era to focus on. */
export function eraDistribution(questions: QuestionRecord[]): EraCount[] {
  const counts = new Map<string, number>()
  let determined = 0
  for (const q of questions) {
    if (q.subject !== 'chinese' || !q.era) continue
    counts.set(q.era, (counts.get(q.era) ?? 0) + 1)
    determined += 1
  }
  return [...counts.entries()]
    .map(([era, count]) => ({ era, count, pct: determined ? Math.round((count / determined) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
}

export interface SubjectCoverage {
  subject: Subject
  totalTags: number
  practicedTags: number
  masteredTags: number
  totalQuestions: number
  attemptedQuestions: number
  correctQuestions: number
}

/** Coverage / mastery per subject, to expose illusion-of-review blind spots. */
export function coverage(
  questions: QuestionRecord[],
  attempts: Record<string, Attempt>,
): SubjectCoverage[] {
  const bySubject = new Map<Subject, QuestionRecord[]>()
  for (const q of questions) {
    const arr = bySubject.get(q.subject) ?? []
    arr.push(q)
    bySubject.set(q.subject, arr)
  }
  const out: SubjectCoverage[] = []
  for (const [subject, qs] of bySubject) {
    const allTags = new Set<string>()
    const practiced = new Set<string>()
    const mastered = new Set<string>()
    let attemptedQ = 0
    let correctQ = 0
    for (const q of qs) {
      q.concept_tags.forEach((t) => allTags.add(t))
      const a = attempts[q.id]
      if (a && a.attempts > 0) {
        attemptedQ += 1
        q.concept_tags.forEach((t) => practiced.add(t))
      }
      if (a && a.correct > 0) {
        correctQ += 1
        q.concept_tags.forEach((t) => mastered.add(t))
      }
    }
    out.push({
      subject,
      totalTags: allTags.size,
      practicedTags: practiced.size,
      masteredTags: mastered.size,
      totalQuestions: qs.length,
      attemptedQuestions: attemptedQ,
      correctQuestions: correctQ,
    })
  }
  return out
}
