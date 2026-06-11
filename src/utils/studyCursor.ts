// Cursors = how far the user has ACTUALLY progressed on each track, derived
// purely from the daily-plan completion log. There is no separate stored cursor:
// the plan is the single source of truth, so this can never drift or double-count.
// Today's content is sliced from these cursors (see DailyPlan), which is what makes
// the schedule absorb a busy/sprint day instead of desyncing from a fixed calendar.
import type { DailyPlanStore } from '@/models/progress'
import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'

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
): Cursors {
  const notes = emptyNotes()
  let vocabDays = 0
  let classics = 0
  const drillDates: string[] = []
  const firstPassDone = () =>
    !!noteLens && SUBJECTS.every((s) => !noteLens[s] || notes[s] >= (noteLens[s] as number))
  for (const date of Object.keys(plan).sort()) {
    if (before && date >= before) continue
    const st = plan[date]
    if (st.quiz && firstPassDone()) drillDates.push(date)
    if (st.newVocab) vocabDays += 1
    if (st.classic) classics += 1
    if (st.notes) for (const s of SUBJECTS) if (st.notes[s]) notes[s] += 1
  }
  return { vocab: vocabDays * perDayNewVocab, notes, classics, drill: drillDates.length, drillDates }
}
