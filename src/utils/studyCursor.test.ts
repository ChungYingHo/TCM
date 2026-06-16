import { describe, it, expect } from 'vitest'
import { deriveCursors, noteReadDates } from '@/utils/studyCursor'
import type { DailyPlanStore } from '@/models/progress'
import type { Rhythm } from '@/utils/date'

const rhythm: Rhythm = { lightWeekday: 0, restEveryNCycles: 4, taperLastDays: 14 } // Sunday = light
const start = '2026-06-22' // Monday
const notesBySubject = { chemistry: ['chem1', 'chem2', 'chem3'], biology: [], chinese: [], english: [] }

describe('deriveCursors — note reads only advance on full days', () => {
  it('counts a full-day (Mon) note completion toward the cursor', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    expect(deriveCursors(plan, 18, undefined, undefined, rhythm, start).notes.chemistry).toBe(1)
  })

  it('does NOT count a light-day (Sun) note completion — it was a re-read, not new progress', () => {
    const plan: DailyPlanStore = { '2026-06-28': { notes: { chemistry: true } } } // Sunday
    expect(deriveCursors(plan, 18, undefined, undefined, rhythm, start).notes.chemistry).toBe(0)
  })

  it('counts every day when rhythm/start are omitted (back-compat)', () => {
    const plan: DailyPlanStore = { '2026-06-28': { notes: { chemistry: true } } }
    expect(deriveCursors(plan, 18).notes.chemistry).toBe(1)
  })
})

describe('noteReadDates — first-read date per slug', () => {
  it('maps each finished note to the full day it was first read', () => {
    const plan: DailyPlanStore = {
      '2026-06-22': { notes: { chemistry: true } }, // Mon full → chem1
      '2026-06-23': { notes: { chemistry: true } }, // Tue full → chem2
    }
    expect(noteReadDates(plan, notesBySubject, rhythm, start)).toEqual({
      chem1: '2026-06-22',
      chem2: '2026-06-23',
    })
  })

  it('ignores light-day re-reads, so no unread note gets a phantom first-read date', () => {
    const plan: DailyPlanStore = {
      '2026-06-22': { notes: { chemistry: true } }, // Mon full → chem1
      '2026-06-28': { notes: { chemistry: true } }, // Sun light → re-read of chem1, NOT chem2
    }
    expect(noteReadDates(plan, notesBySubject, rhythm, start)).toEqual({ chem1: '2026-06-22' })
  })
})
