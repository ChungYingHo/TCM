// Cursors = how far the user has ACTUALLY progressed on each track, derived purely from
// the daily-plan completion log. There is no separate stored cursor: the plan is the
// single source of truth, so this can never drift or double-count. Today's content is
// sliced from these cursors (see studyPlan), which is what makes the schedule a ROLLING
// sequence — a busy day simply doesn't advance, so tomorrow carries over. Progress counts
// on ANY day it was done (a weekday study day OR a weekend catch-up), since both move you
// forward; only resting (doing nothing) leaves the cursor put.
import type { DailyPlanStore } from '@/models/progress'
import type { Subject } from '@/models/question'
import { SUBJECTS } from '@/models/question'

export interface Cursors {
  vocab: number // # words already started (newVocab days × perDay newVocab)
  notes: Record<Subject, number> // # notes completed per subject
  classics: number // # classics read
  drill: number // # completed quiz days that fell in the drill phase (first note pass done)
  noteDays: number // # completed days that advanced notes — drives the subject-pair rotation
}

function emptyNotes(): Record<Subject, number> {
  return Object.fromEntries(SUBJECTS.map((s) => [s, 0])) as Record<Subject, number>
}

/**
 * Derive progress from the completion log. Pass `before` (a YYYY-MM-DD key) to count only
 * days strictly before it — that gives the cursor for picking *today's* content, so
 * finishing today advances tomorrow rather than shifting today's slice.
 *
 * `noteLens` (note-track length per subject) lets the drill counter replay history: a quiz
 * day only counts toward `drill` if the first note pass was already complete at the START
 * of that day — so the drill window starts at question 0 the day the plan switches to drill.
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
  let drill = 0
  let noteDays = 0
  const firstPassDone = () =>
    !!noteLens && SUBJECTS.every((s) => !noteLens[s] || notes[s] >= (noteLens[s] as number))
  for (const date of Object.keys(plan).sort()) {
    if (before && date >= before) continue
    const st = plan[date]
    if (st.quiz && firstPassDone()) drill += 1 // counted BEFORE today's notes → pass must predate the day
    if (st.newVocab) vocabDays += 1
    if (st.classic) classics += 1
    if (st.notes) {
      let advanced = false
      for (const s of SUBJECTS)
        if (st.notes[s]) {
          notes[s] += 1
          advanced = true
        }
      if (advanced) noteDays += 1
    }
  }
  return { vocab: vocabDays * perDayNewVocab, notes, classics, drill, noteDays }
}

/**
 * First-read date per note slug — for the「讀完 M/D」chip. Replays the completion log in
 * order, advancing each subject's note pointer as its notes are marked done, so the slug
 * picked matches the note that day actually served.
 */
export function noteReadDates(
  plan: DailyPlanStore,
  notesBySubject: Partial<Record<Subject, string[]>>,
): Record<string, string> {
  const out: Record<string, string> = {}
  const idx: Record<string, number> = Object.fromEntries(SUBJECTS.map((s) => [s, 0]))
  for (const date of Object.keys(plan).sort()) {
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
