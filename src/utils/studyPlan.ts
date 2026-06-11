// Compute "today's study plan" from the schedule ORDERING + the user's actual cursor.
// Pure + shared by the daily page, the home dashboard, and the progress-summary API,
// so all three agree on what today is and whether you're on pace.
import type { DailyPlanStore } from '@/models/progress'
import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'
import { deriveCursors } from '@/utils/studyCursor'
import { ymd, parseYmd, dayType, fullStudyDays, isTaper, type DayType, type Rhythm } from '@/utils/date'

export interface ScheduleData {
  range: { start: string; end: string; days: number }
  examDate: string
  examWindow?: string
  perDay: {
    notesPerSubject: number
    quiz: number
    quizDrill?: number // drill-phase quiz size (defaults to `quiz` when absent)
    newVocab: number
    reviewVocabMax: number
    reviewVocabTarget?: number // daily review size; due first, random learned words fill up
  }
  rhythm: Rhythm
  tracks: { vocab: string[]; notes: Record<Subject, string[]>; classics: string[]; drill?: string[] }
  noteTags: Record<string, string>
  quizPoolByTag: Record<string, string[]>
  reviews: Record<string, { title: string; subject: Subject; covers: string[] }>
}

export interface PlanNote {
  subject: Subject
  slug: string
  tag: string
  round: number // 1-based pass over this subject's note track (1 = first read)
}

/** learn = first note pass in progress (quiz targets today's notes);
 *  drill = every subject's first pass done (quiz walks the whole bank sequentially). */
export type PlanPhase = 'learn' | 'drill'

export interface TodayPlan {
  date: string
  inRange: boolean
  dayType: DayType
  taper: boolean
  daysToExam: number
  phase: PlanPhase
  notes: PlanNote[]
  quizIds: string[]
  newVocabIds: string[]
  classicId: string | null
  pace: { vocabDone: number; vocabExpected: number; aheadDays: number }
}

const DAY_MS = 86_400_000

/** Deterministically pick n items from a list, rotating the window by `seed`. */
function rotatePick(list: string[], n: number, seed: number): string[] {
  if (list.length <= n) return [...list]
  const start = (Math.abs(seed) * n) % list.length
  return Array.from({ length: n }, (_, i) => list[(start + i) % list.length])
}

export function computeToday(schedule: ScheduleData, plan: DailyPlanStore, today: string): TodayPlan {
  const { tracks, perDay, rhythm, range, examDate } = schedule
  const noteLens = Object.fromEntries(SUBJECTS.map((s) => [s, (tracks.notes[s] || []).length]))
  const cur = deriveCursors(plan, perDay.newVocab, today, noteLens) // cursor BEFORE today
  const inRange = today >= range.start && today <= range.end

  // One note per subject, from each subject's own cursor (cycles for spaced repetition).
  // `round` is the 1-based pass number so later reads can be framed as quick reviews.
  const notes: PlanNote[] = SUBJECTS.map((s) => {
    const list = tracks.notes[s] || []
    if (!list.length) return null
    const slug = list[cur.notes[s] % list.length]
    return { subject: s, slug, tag: schedule.noteTags[slug] || '', round: Math.floor(cur.notes[s] / list.length) + 1 }
  }).filter((n): n is PlanNote => n !== null)

  // Phase: learn = some subject is still on its first note pass; drill = all done.
  const drillTrack = tracks.drill || []
  const firstPassDone = SUBJECTS.every((s) => !noteLens[s] || cur.notes[s] >= noteLens[s])
  const phase: PlanPhase = firstPassDone && drillTrack.length ? 'drill' : 'learn'

  // Today's quiz —
  //  learn phase: questions tagged to today's notes, rotated so repeats bring new items.
  //  drill phase: a sequential window over the whole bank (newest years first), advanced
  //  by completed drill days, so every day is fresh practice material.
  let quizIds: string[]
  if (phase === 'drill') {
    const n = perDay.quizDrill ?? perDay.quiz
    const start = (cur.drill * n) % drillTrack.length
    quizIds = Array.from({ length: Math.min(n, drillTrack.length) }, (_, i) => drillTrack[(start + i) % drillTrack.length])
  } else {
    const seed = SUBJECTS.reduce((a, s) => a + (cur.notes[s] || 0), 0)
    const poolUnion = [...new Set(notes.flatMap((n) => schedule.quizPoolByTag[n.tag] || []))]
    quizIds = rotatePick(poolUnion, perDay.quiz, seed)
  }

  // Pre-exam taper = review only: stop introducing new words (notes/classics keep
  // cycling, which is itself review). New material is sized to finish by taper start.
  const taper = isTaper(today, examDate, rhythm)
  const newVocabIds = taper ? [] : tracks.vocab.slice(cur.vocab, cur.vocab + perDay.newVocab)
  const classicId = tracks.classics.length ? tracks.classics[cur.classics % tracks.classics.length] : null

  // Pace: where the vocab cursor should be, counting only full study days before today.
  // Capped at the track length so finishing the list never reads as "behind".
  const yesterday = ymd(parseYmd(today) - DAY_MS)
  const expectedDays = inRange && yesterday >= range.start ? fullStudyDays(range.start, yesterday, rhythm) : 0
  const vocabExpected = Math.min(tracks.vocab.length, expectedDays * perDay.newVocab)
  const aheadDays = perDay.newVocab ? Math.round((cur.vocab - vocabExpected) / perDay.newVocab) : 0
  const daysToExam = Math.max(0, Math.round((parseYmd(examDate) - parseYmd(today)) / DAY_MS))

  return {
    date: today,
    inRange,
    dayType: dayType(today, range.start, rhythm),
    taper,
    daysToExam,
    phase,
    notes,
    quizIds,
    newVocabIds,
    classicId,
    pace: { vocabDone: cur.vocab, vocabExpected, aheadDays },
  }
}
