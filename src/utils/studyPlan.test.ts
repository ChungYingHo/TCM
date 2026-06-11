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

describe('computeToday — learn → drill phase', () => {
  const drillSchedule: ScheduleData = {
    ...schedule,
    perDay: { ...schedule.perDay, quizDrill: 2 },
    tracks: { ...schedule.tracks, drill: ['d1', 'd2', 'd3', 'd4', 'd5'] },
  }

  it('stays in learn phase (tag-targeted quiz) until the first note pass is done', () => {
    const tp = computeToday(drillSchedule, empty, '2026-06-22')
    expect(tp.phase).toBe('learn')
    expect(tp.quizIds.every((id) => id.startsWith('q'))).toBe(true)
    expect(tp.notes[0].round).toBe(1)
  })

  it('switches to drill and starts the bank at question 0 (pre-switch quiz days do not advance it)', () => {
    // Day 1: note done (finishes the 1-note chemistry pass) AND a learn-phase quiz done.
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true }, quiz: true } }
    const tp = computeToday(drillSchedule, plan, '2026-06-23')
    expect(tp.phase).toBe('drill')
    expect(tp.quizIds).toEqual(['d1', 'd2']) // learn-phase quiz day didn't consume the drill window
    expect(tp.notes[0].round).toBe(2) // second pass is labeled as round 2
  })

  it('advances the drill window by completed drill days and wraps at the end', () => {
    const plan: DailyPlanStore = {
      '2026-06-22': { notes: { chemistry: true }, quiz: true },
      '2026-06-23': { quiz: true }, // drill day 1
      '2026-06-24': { quiz: true }, // drill day 2
    }
    const tp = computeToday(drillSchedule, plan, '2026-06-25')
    expect(tp.quizIds).toEqual(['d5', 'd1']) // start = (2×2) % 5 = 4 → wraps
  })

  it('falls back to learn mode when the schedule has no drill track', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    const tp = computeToday(schedule, plan, '2026-06-23')
    expect(tp.phase).toBe('learn')
  })
})
