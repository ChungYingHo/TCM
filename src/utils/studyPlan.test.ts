import { describe, it, expect } from 'vitest'
import { computeToday, type ScheduleData } from '@/utils/studyPlan'
import type { DailyPlanStore } from '@/models/progress'

// Minimal schedule: one subject's notes, a small vocab/classics track. No `pairs` → all
// subjects each day (back-compat). examDate drives taper + finish-by-exam pace.
const schedule: ScheduleData = {
  examDate: '2027-02-01',
  examWindow: 'test',
  perDay: { notesPerSubject: 1, quiz: 2, newVocab: 3, reviewVocabMax: 100 },
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
  it('issues newVocab from the cursor on a weekday', () => {
    const tp = computeToday(schedule, empty, '2026-06-22') // Monday
    expect(tp.dayType).toBe('full')
    expect(tp.newVocabIds).toEqual(['a', 'b', 'c'])
  })

  it('advances the cursor as days are completed', () => {
    const plan: DailyPlanStore = { '2026-06-22': { newVocab: true } }
    expect(computeToday(schedule, plan, '2026-06-23').newVocabIds).toEqual(['d', 'e', 'f'])
  })
})

describe('computeToday — weekend is buffer (still advances notes for catch-up)', () => {
  it('classifies Saturday/Sunday as weekend', () => {
    expect(computeToday(schedule, empty, '2026-06-27').dayType).toBe('weekend') // Sat
    expect(computeToday(schedule, empty, '2026-06-28').dayType).toBe('weekend') // Sun
  })
})

describe('computeToday — pre-exam taper', () => {
  it('stops issuing new vocab during the taper window', () => {
    const tp = computeToday(schedule, empty, '2027-01-25') // < 14 days before examDate
    expect(tp.taper).toBe(true)
    expect(tp.newVocabIds).toEqual([])
  })

  it('still surfaces a classic (cycling review) during taper', () => {
    expect(computeToday(schedule, empty, '2027-01-25').classicId).not.toBeNull()
  })

  it('does not nag "需加速" during the taper (new vocab has stopped)', () => {
    expect(computeToday(schedule, empty, '2027-01-25').pace.onTrack).toBe(true)
  })
})

describe('computeToday — finish-by-exam pace', () => {
  it('is on track when there is plenty of runway before the taper', () => {
    const tp = computeToday(schedule, empty, '2026-06-22')
    expect(tp.pace.onTrack).toBe(true)
    expect(tp.pace.vocabLeft).toBe(6)
  })

  it('flags need-to-accelerate when little runway remains', () => {
    // 6 words left but only ~1 day of runway before the taper → neededPerDay > daily quota (3)
    const tp = computeToday(schedule, empty, '2027-01-17')
    expect(tp.pace.onTrack).toBe(false)
    expect(tp.pace.neededPerDay).toBeGreaterThan(tp.pace.perDay)
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
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true }, quiz: true } }
    const tp = computeToday(drillSchedule, plan, '2026-06-23')
    expect(tp.phase).toBe('drill')
    expect(tp.quizIds).toEqual(['d1', 'd2'])
    expect(tp.notes[0].round).toBe(2)
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
    expect(computeToday(schedule, plan, '2026-06-23').phase).toBe('learn')
  })
})

describe('computeToday — weak-tag slots in the drill', () => {
  const weakSchedule: ScheduleData = {
    ...schedule,
    perDay: { ...schedule.perDay, quizDrill: 4, quizWeak: 2 },
    tracks: { ...schedule.tracks, drill: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'] },
  }
  const passDone: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true }, quiz: true } }

  it('fills weak slots from the lowest-accuracy tag when there is enough history', () => {
    const attempts = { q1: { attempts: 4, correct: 1, lastTs: 0 }, q2: { attempts: 4, correct: 1, lastTs: 0 } }
    const tp = computeToday(weakSchedule, passDone, '2026-06-23', attempts)
    expect(tp.phase).toBe('drill')
    expect(tp.quizIds.slice(0, 2)).toEqual(['d1', 'd2']) // sequential part = quizDrill − quizWeak
    expect(tp.quizWeakCount).toBe(2)
    expect(tp.quizIds.slice(2).every((id) => ['q1', 'q2', 'q3'].includes(id))).toBe(true)
  })

  it("falls back to today's note tags for weak slots when history is too thin", () => {
    const tp = computeToday(weakSchedule, passDone, '2026-06-23', {})
    expect(tp.quizWeakCount).toBe(2)
    expect(tp.quizIds.slice(2).every((id) => ['q1', 'q2', 'q3'].includes(id))).toBe(true)
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

describe('computeToday — weekend = catch-up (advances like a weekday, no forced re-read)', () => {
  const s: ScheduleData = {
    ...schedule,
    tracks: { ...schedule.tracks, notes: { chemistry: ['chem1', 'chem2'], biology: [], chinese: [], english: [] } },
    noteTags: { chem1: 'atoms', chem2: 'bonds' },
    quizPoolByTag: { atoms: ['q1', 'q2', 'q3'], bonds: ['r1', 'r2', 'r3'] },
  }

  it('a weekday advances to the next unread note', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    const tp = computeToday(s, plan, '2026-06-23') // Tue
    expect(tp.dayType).toBe('full')
    expect(tp.notes[0].slug).toBe('chem2')
  })

  it('a weekend also shows the next unread (catch-up), not a forced re-read of a finished note', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } } // chem1 read
    const tp = computeToday(s, plan, '2026-06-28') // Sunday
    expect(tp.dayType).toBe('weekend')
    expect(tp.notes[0].slug).toBe('chem2')
  })
})

describe('computeToday — subject pairing rotates one pair per note-day', () => {
  const paired: ScheduleData = {
    ...schedule,
    pairs: [['biology', 'english'], ['chemistry', 'chinese']],
    tracks: { ...schedule.tracks, notes: { chemistry: ['chem1'], biology: ['bio1'], chinese: ['cn1'], english: ['en1'] } },
    noteTags: { chem1: 'atoms', bio1: 'cell', cn1: 'cnx', en1: 'enx' },
    quizPoolByTag: { atoms: ['q1'], cell: ['c1'], cnx: ['x1'], enx: ['e1'] },
  }

  it('day 1 (noteDays 0) shows pair A: biology + english', () => {
    const tp = computeToday(paired, empty, '2026-06-22')
    expect(tp.notes.map((n) => n.subject).sort()).toEqual(['biology', 'english'])
  })

  it('after a completed note-day, rotates to pair B: chemistry + chinese', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { biology: true, english: true } } }
    const tp = computeToday(paired, plan, '2026-06-23')
    expect(tp.notes.map((n) => n.subject).sort()).toEqual(['chemistry', 'chinese'])
  })

  it('an unfinished day does NOT advance the pair — the sequence rolls forward', () => {
    const tp = computeToday(paired, empty, '2026-06-23') // nothing done on 06-22
    expect(tp.notes.map((n) => n.subject).sort()).toEqual(['biology', 'english'])
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
