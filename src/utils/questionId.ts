// The question-id grammar `<SCHOOL>-<YEAR>-<subject>-<number>` (e.g. 'CMU-104-biology-1')
// is a contract with the Python pipeline (build.py: f'{school}-{year}-{subject}-{ex.num}').
// This is the SINGLE place in the web app that knows it — parse here, never ad-hoc split.
import type { School, Subject } from '@/models/question'
import { SCHOOLS, SUBJECTS } from '@/models/question'

export interface ParsedQuestionId {
  school: School
  year: number
  subject: Subject
  number: number
}

/** Parse a question id into its parts, or null if any part is malformed/unknown
 *  (warns in dev so a contract break surfaces instead of silently mis-bucketing). */
export function parseQuestionId(id: string): ParsedQuestionId | null {
  const parts = id.split('-')
  if (parts.length !== 4) return warnNull(id)
  const [school, yearStr, subject, numStr] = parts
  const year = Number(yearStr)
  const number = Number(numStr)
  if (
    !SCHOOLS.includes(school as School) ||
    !SUBJECTS.includes(subject as Subject) ||
    !Number.isFinite(year) ||
    !Number.isFinite(number)
  ) return warnNull(id)
  return { school: school as School, year, subject: subject as Subject, number }
}

/** School code from a question id, or null if unparseable. */
export function schoolOf(id: string): School | null {
  return parseQuestionId(id)?.school ?? null
}

function warnNull(id: string): null {
  if (import.meta.env.DEV) console.warn(`parseQuestionId: malformed question id ${JSON.stringify(id)}`)
  return null
}
