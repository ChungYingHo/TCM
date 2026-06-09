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
  perDay: { notesPerSubject: number; quiz: number; newVocab: number; classicEveryNDays: number; reviewVocabMax: number }
  rhythm: Rhythm
  tracks: { vocab: string[]; notes: Record<Subject, string[]>; classics: string[] }
  noteTags: Record<string, string>
  quizPoolByTag: Record<string, string[]>
  reviews: Record<string, { title: string; subject: Subject; covers: string[] }>
}

export interface PlanNote {
  subject: Subject
  slug: string
  tag: string
}

export interface TodayPlan {
  date: string
  inRange: boolean
  dayType: DayType
  taper: boolean
  daysToExam: number
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
  const cur = deriveCursors(plan, perDay.newVocab, today) // cursor BEFORE today
  const inRange = today >= range.start && today <= range.end

  // One note per subject, from each subject's own cursor (cycles for spaced repetition).
  const notes: PlanNote[] = SUBJECTS.map((s) => {
    const list = tracks.notes[s] || []
    if (!list.length) return null
    const slug = list[cur.notes[s] % list.length]
    return { subject: s, slug, tag: schedule.noteTags[slug] || '' }
  }).filter((n): n is PlanNote => n !== null)

  // Today's quiz: questions tagged to today's notes, rotated so repeats bring new items.
  const seed = SUBJECTS.reduce((a, s) => a + (cur.notes[s] || 0), 0)
  const poolUnion = [...new Set(notes.flatMap((n) => schedule.quizPoolByTag[n.tag] || []))]
  const quizIds = rotatePick(poolUnion, perDay.quiz, seed)

  const newVocabIds = tracks.vocab.slice(cur.vocab, cur.vocab + perDay.newVocab)
  const classicId = tracks.classics.length ? tracks.classics[cur.classics % tracks.classics.length] : null

  // Pace: where the vocab cursor should be, counting only full study days before today.
  const yesterday = ymd(parseYmd(today) - DAY_MS)
  const expectedDays = inRange && yesterday >= range.start ? fullStudyDays(range.start, yesterday, rhythm) : 0
  const vocabExpected = expectedDays * perDay.newVocab
  const aheadDays = perDay.newVocab ? Math.round((cur.vocab - vocabExpected) / perDay.newVocab) : 0
  const daysToExam = Math.max(0, Math.round((parseYmd(examDate) - parseYmd(today)) / DAY_MS))

  return {
    date: today,
    inRange,
    dayType: dayType(today, range.start, rhythm),
    taper: isTaper(today, examDate, rhythm),
    daysToExam,
    notes,
    quizIds,
    newVocabIds,
    classicId,
    pace: { vocabDone: cur.vocab, vocabExpected, aheadDays },
  }
}
