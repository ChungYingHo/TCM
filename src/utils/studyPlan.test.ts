import { describe, it, expect } from 'vitest'
import { computeToday, type ScheduleData } from '@/utils/studyPlan'
import type { DailyPlanStore } from '@/models/progress'

// Minimal schedule: one subject's notes, a small vocab/classics track, default-ish rhythm.
const schedule: ScheduleData = {
  range: { start: '2026-06-22', end: '2027-01-31', days: 224 },
  examDate: '2027-02-01',
  examWindow: 'test',
  perDay: { notesPerSubject: 1, quiz: 2, newVocab: 3, reviewVocabMax: 100 },
  rhythm: { lightWeekday: 0, restEveryNCycles: 4, taperLastDays: 14 },
  tracks: {
    vocab: ['a', 'b', 'c', 'd', 'e', 'f'],
    notes: { chemistry: ['chem1'], biology: [], chinese: [], english: [] },
    classics: ['g1', 'g2'],
  },
  noteTags: { chem1: 'atoms' },
  quizPoolByTag: { atoms: ['q1', 'q2', 'q3'] },
  reviews: {},
}

const empty: DailyPlanStore = {}

describe('computeToday — new-vocab slicing', () => {
  it('issues newVocab from the cursor on a normal full day', () => {
    const tp = computeToday(schedule, empty, '2026-06-22') // Monday, in range
    expect(tp.dayType).toBe('full')
    expect(tp.newVocabIds).toEqual(['a', 'b', 'c'])
  })

  it('advances the cursor as days are completed', () => {
    const plan: DailyPlanStore = { '2026-06-22': { newVocab: true } }
    const tp = computeToday(schedule, plan, '2026-06-23')
    expect(tp.newVocabIds).toEqual(['d', 'e', 'f'])
  })
})

describe('computeToday — pre-exam taper', () => {
  it('stops issuing new vocab during the taper window', () => {
    const tp = computeToday(schedule, empty, '2027-01-25') // < 14 days before examDate
    expect(tp.taper).toBe(true)
    expect(tp.newVocabIds).toEqual([])
  })

  it('still surfaces a classic (cycling review) during taper', () => {
    const tp = computeToday(schedule, empty, '2027-01-25')
    expect(tp.classicId).not.toBeNull()
  })
})

describe('computeToday — pace never reads "behind" once the track is done', () => {
  it('caps vocabExpected at the track length', () => {
    // Late in the plan, expected full-days × perDay would exceed the 6-word track.
    const tp = computeToday(schedule, empty, '2027-01-15')
    expect(tp.pace.vocabExpected).toBeLessThanOrEqual(schedule.tracks.vocab.length)
  })
})
