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
}

function emptyNotes(): Record<Subject, number> {
  return Object.fromEntries(SUBJECTS.map((s) => [s, 0])) as Record<Subject, number>
}

/**
 * Derive progress from the completion log. Pass `before` (a YYYY-MM-DD key) to
 * count only days strictly before it — that gives the cursor for picking *today's*
 * content, so finishing today advances tomorrow rather than shifting today's slice.
 */
export function deriveCursors(plan: DailyPlanStore, perDayNewVocab: number, before?: string): Cursors {
  const notes = emptyNotes()
  let vocabDays = 0
  let classics = 0
  for (const [date, st] of Object.entries(plan)) {
    if (before && date >= before) continue
    if (st.newVocab) vocabDays += 1
    if (st.classic) classics += 1
    if (st.notes) for (const s of SUBJECTS) if (st.notes[s]) notes[s] += 1
  }
  return { vocab: vocabDays * perDayNewVocab, notes, classics }
}
