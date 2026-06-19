import { describe, it, expect } from 'vitest'
import { deriveCursors } from '@/utils/studyCursor'
import type { DailyPlanStore } from '@/models/progress'

describe('deriveCursors — progress from the completion log', () => {
  it('counts a note completion toward the per-subject cursor and noteDays', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    const c = deriveCursors(plan, 18)
    expect(c.notes.chemistry).toBe(1)
    expect(c.noteDays).toBe(1)
  })

  it('counts weekend completions too — catch-up advances the cursor (no full-day gate)', () => {
    const plan: DailyPlanStore = { '2026-06-28': { notes: { chemistry: true } } } // Sunday
    expect(deriveCursors(plan, 18).notes.chemistry).toBe(1)
  })

  it('noteDays increments once per day regardless of how many subjects were done', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { biology: true, english: true } } }
    const c = deriveCursors(plan, 18)
    expect(c.notes.biology).toBe(1)
    expect(c.notes.english).toBe(1)
    expect(c.noteDays).toBe(1) // one day → one pair-rotation step
  })

  it('vocab = newVocab-days × perDay; classics counts read days', () => {
    const plan: DailyPlanStore = {
      '2026-06-22': { newVocab: true, classic: true },
      '2026-06-23': { newVocab: true },
    }
    const c = deriveCursors(plan, 18)
    expect(c.vocab).toBe(36)
    expect(c.classics).toBe(1)
  })

  it('`before` cutoff excludes that day onward (finishing today advances tomorrow)', () => {
    const plan: DailyPlanStore = { '2026-06-22': { notes: { chemistry: true } } }
    expect(deriveCursors(plan, 18, '2026-06-22').notes.chemistry).toBe(0)
  })

  it('drill counts quiz days only once the first note pass is done', () => {
    const plan: DailyPlanStore = {
      '2026-06-22': { notes: { chemistry: true }, quiz: true }, // pass completes here → this quiz not yet drill
      '2026-06-23': { quiz: true }, // now drill
    }
    expect(deriveCursors(plan, 18, undefined, { chemistry: 1 }).drill).toBe(1)
  })
})
