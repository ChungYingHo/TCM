import { describe, it, expect, beforeEach } from 'vitest'
import { learn, grade, dueIds, getCard, dueCount, dumpElementSrs, replaceElementSrs } from '@/utils/elementSrs'

const DAY = 86_400_000
const t0 = 1_700_000_000_000

beforeEach(() => localStorage.clear())

describe('elementSrs (Leitner)', () => {
  it('learn registers box-1 cards and is idempotent', () => {
    learn(['el:6', 'bond:NaCl'], t0)
    expect(getCard('el:6')).toEqual({ box: 1, due: t0 + DAY, ts: t0 })
    // re-learning must not reset an existing card
    grade('el:6', true, t0 + DAY)
    const advanced = getCard('el:6')!
    learn(['el:6'], t0 + 2 * DAY)
    expect(getCard('el:6')).toEqual(advanced)
  })

  it('grade advances the box when correct, resets to box 1 when wrong', () => {
    learn(['el:6'], t0)
    grade('el:6', true, t0) // box 1 -> 2 (interval 3d)
    expect(getCard('el:6')).toEqual({ box: 2, due: t0 + 3 * DAY, ts: t0 })
    grade('el:6', false, t0 + 3 * DAY) // wrong -> back to box 1 (tomorrow), 並累計一次 lapse
    expect(getCard('el:6')).toEqual({ box: 1, due: t0 + 4 * DAY, ts: t0 + 3 * DAY, lapses: 1 })
  })

  it('caps the box at the longest interval', () => {
    learn(['el:6'], t0)
    for (let i = 0; i < 10; i++) grade('el:6', true, t0)
    expect(getCard('el:6')!.box).toBe(6) // INTERVALS length - 1
    expect(getCard('el:6')!.due).toBe(t0 + 75 * DAY)
  })

  it('dueIds returns only due cards, soonest first; dueCount matches', () => {
    learn(['el:6'], t0) // due t0+1d
    learn(['el:8'], t0 + 5 * DAY) // due t0+6d
    const now = t0 + 7 * DAY
    expect(dueIds(now)).toEqual(['el:6', 'el:8'])
    expect(dueCount(now)).toBe(2)
    expect(dueIds(t0)).toEqual([]) // nothing due yet at t0
  })

  it('dump/replace round-trips without firing a state event', () => {
    learn(['el:6'], t0)
    const snap = dumpElementSrs()
    localStorage.clear()
    replaceElementSrs(snap)
    expect(getCard('el:6')).toEqual({ box: 1, due: t0 + DAY, ts: t0 })
  })
})
