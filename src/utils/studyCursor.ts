// Cursors = how far the user has ACTUALLY progressed on each track, derived
// purely from the daily-plan completion log. There is no separate stored cursor:
// the plan is the single source of truth, so this can never drift or double-count.
// Today's content is sliced from these cursors (see DailyPlan), which is what makes
// the schedule absorb a busy/sprint day instead of desyncing from a fixed calendar.
import type { DailyPlanStore } from '@/models/progress'
import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'
import { dayType, type Rhythm } from '@/utils/date'

export interface Cursors {
  vocab: number // # words already started (newVocab days × perDay newVocab)
  notes: Record<Subject, number> // # notes completed per subject
  classics: number // # classics read
  drill: number // # completed quiz days that fell in the drill phase (first note pass done)
  drillDates: string[] // those days' dates — lets the planner replay how many drill items each consumed
}

function emptyNotes(): Record<Subject, number> {
  return Object.fromEntries(SUBJECTS.map((s) => [s, 0])) as Record<Subject, number>
}

/**
 * Derive progress from the completion log. Pass `before` (a YYYY-MM-DD key) to
 * count only days strictly before it — that gives the cursor for picking *today's*
 * content, so finishing today advances tomorrow rather than shifting today's slice.
 *
 * `noteLens` (note-track length per subject) lets the drill counter replay history:
 * dates are walked in order, and a quiz day only counts toward `drill` if the first
 * note pass was already complete at the START of that day — so the drill window
 * starts at question 0 on the day the plan switches to drill mode.
 */
export function deriveCursors(
  plan: DailyPlanStore,
  perDayNewVocab: number,
  before?: string,
  noteLens?: Partial<Record<Subject, number>>,
  rhythm?: Rhythm,
  startKey?: string,
): Cursors {
  const notes = emptyNotes()
  let vocabDays = 0
  let classics = 0
  const drillDates: string[] = []
  const firstPassDone = () =>
    !!noteLens && SUBJECTS.every((s) => !noteLens[s] || notes[s] >= (noteLens[s] as number))
  // A note "read" only advances forward progress on a FULL day — review days re-read notes
  // you've already finished, so counting them would skip unread notes. (Omitting rhythm/start
  // keeps the old count-every-day behaviour, used by the unit tests.)
  const isFull = (date: string) => !rhythm || !startKey || dayType(date, startKey, rhythm) === 'full'
  for (const date of Object.keys(plan).sort()) {
    if (before && date >= before) continue
    const st = plan[date]
    if (st.quiz && firstPassDone()) drillDates.push(date)
    if (st.newVocab) vocabDays += 1
    if (st.classic) classics += 1
    if (st.notes && isFull(date)) for (const s of SUBJECTS) if (st.notes[s]) notes[s] += 1
  }
  return { vocab: vocabDays * perDayNewVocab, notes, classics, drill: drillDates.length, drillDates }
}

/**
 * First-read date per note slug — for the「讀完 M/D」chip. Replays the completion log on
 * FULL days only (a review-day re-read is not the first read), mirroring how `deriveCursors`
 * advances the note cursor, so the slug picked here matches the note that day actually served.
 */
export function noteReadDates(
  plan: DailyPlanStore,
  notesBySubject: Partial<Record<Subject, string[]>>,
  rhythm: Rhythm,
  startKey: string,
): Record<string, string> {
  const out: Record<string, string> = {}
  const idx: Record<string, number> = Object.fromEntries(SUBJECTS.map((s) => [s, 0]))
  for (const date of Object.keys(plan).sort()) {
    if (dayType(date, startKey, rhythm) !== 'full') continue
    const st = plan[date]
    if (!st.notes) continue
    for (const s of SUBJECTS) {
      if (!st.notes[s]) continue
      const list = notesBySubject[s] || []
      if (list.length && !(list[idx[s] % list.length] in out)) out[list[idx[s] % list.length]] = date
      idx[s] += 1
    }
  }
  return out
}
