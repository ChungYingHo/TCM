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

describe('computeToday — weak-tag slots + monthly mock day', () => {
  const weakSchedule: ScheduleData = {
    ...schedule,
    perDay: { ...schedule.perDay, quizDrill: 4, quizWeak: 2, quizMock: 4 },
    tracks: { ...schedule.tracks, drill: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'] },
  }
  // first note pass (1 chemistry note) completed on day 1 → drill phase afterwards
  const passDone: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true }, quiz: true } }

  it('fills weak slots from the lowest-accuracy tag when there is enough history', () => {
    const attempts = { q1: { attempts: 4, correct: 1, lastTs: 0 }, q2: { attempts: 4, correct: 1, lastTs: 0 } }
    const tp = computeToday(weakSchedule, passDone, '2026-06-23', attempts)
    expect(tp.phase).toBe('drill')
    expect(tp.quizIds.slice(0, 2)).toEqual(['d1', 'd2']) // sequential part shrinks to quizDrill − quizWeak
    expect(tp.quizWeakCount).toBe(2)
    expect(tp.quizIds.slice(2).every((id) => ['q1', 'q2', 'q3'].includes(id))).toBe(true)
  })

  it("falls back to today's note tags for weak slots when history is too thin", () => {
    const tp = computeToday(weakSchedule, passDone, '2026-06-23', {})
    expect(tp.quizWeakCount).toBe(2)
    expect(tp.quizIds.slice(2).every((id) => ['q1', 'q2', 'q3'].includes(id))).toBe(true)
  })

  it('upgrades the Saturday before a rest Sunday to a timed mock block', () => {
    // 2026-07-19 is the 4th Sunday after the 6-22 start (lightIndex 3 → rest), so 7-18 mocks.
    const tp = computeToday(weakSchedule, passDone, '2026-07-18')
    expect(tp.mock).toBe(true)
    expect(tp.quizIds).toHaveLength(4) // quizMock
    expect(tp.quizWeakCount).toBe(0) // mock day = pure sequential block
  })

  it('replays mock days as bigger drill-window consumption', () => {
    const plan: DailyPlanStore = {
      ...passDone,
      '2026-06-23': { quiz: true }, // normal drill day → consumes 2 (quizDrill − quizWeak)
      '2026-07-18': { quiz: true }, // mock day → consumes 4 (quizMock)
    }
    const tp = computeToday(weakSchedule, plan, '2026-07-20')
    expect(tp.quizIds.slice(0, 2)).toEqual(['d7', 'd8']) // window start = 2 + 4 = 6
  })
})

describe('computeToday — test-then-read mini quiz on later note rounds', () => {
  it('attaches no mini quiz on the first pass and 3 questions from the second pass on', () => {
    const first = computeToday(schedule, empty, '2026-06-22')
    expect(first.notes[0].round).toBe(1)
    expect(first.notes[0].miniQuizIds).toEqual([])
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    const second = computeToday(schedule, plan, '2026-06-23')
    expect(second.notes[0].round).toBe(2)
    expect(second.notes[0].miniQuizIds).toEqual(['q1', 'q2', 'q3'])
  })
})

describe('computeToday — review days re-read FINISHED notes only', () => {
  // 2-note chemistry so "review a read one" is distinguishable from "advance to the next".
  const s: ScheduleData = {
    ...schedule,
    tracks: { ...schedule.tracks, notes: { chemistry: ['chem1', 'chem2'], biology: [], chinese: [], english: [] } },
    noteTags: { chem1: 'atoms', chem2: 'bonds' },
    quizPoolByTag: { atoms: ['q1', 'q2', 'q3'], bonds: ['r1', 'r2', 'r3'] },
  }

  it('shows nothing to review on a light day before any note is finished', () => {
    const tp = computeToday(s, empty, '2026-06-28') // first Sunday after the 06-22 start → light
    expect(tp.dayType).toBe('light')
    expect(tp.notes).toEqual([]) // 0 finished → nothing to review (no fake "review" of unread notes)
  })

  it('re-reads a FINISHED note (never the next unread) on a light day, as test-then-read', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } } // only chem1 finished
    const tp = computeToday(s, plan, '2026-06-28')
    expect(tp.dayType).toBe('light')
    expect(tp.notes).toHaveLength(1)
    expect(tp.notes[0].slug).toBe('chem1') // the read note — NOT chem2 (the next unread)
    expect(tp.notes[0].miniQuizIds).toHaveLength(3) // review = retrieval first
  })

  it('still advances to the next NEW note on a full day', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    const tp = computeToday(s, plan, '2026-06-23') // Tuesday → full
    expect(tp.dayType).toBe('full')
    expect(tp.notes[0].slug).toBe('chem2') // forward progress to the unread note
  })
})

describe('computeToday — drill window groups by subject within the day', () => {
  it('keeps same-subject (passage-group) questions adjacent', () => {
    const s: ScheduleData = {
      ...schedule,
      perDay: { ...schedule.perDay, quizDrill: 4, quizWeak: 0 },
      tracks: {
        ...schedule.tracks,
        drill: ['CMU-115-chemistry-1', 'CMU-115-chinese-1', 'CMU-115-chemistry-2', 'CMU-115-chinese-2'],
      },
    }
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    const tp = computeToday(s, plan, '2026-06-23')
    expect(tp.quizIds).toEqual([
      'CMU-115-chemistry-1', 'CMU-115-chemistry-2', // chemistry block, paper order kept
      'CMU-115-chinese-1', 'CMU-115-chinese-2',
    ])
  })
})
