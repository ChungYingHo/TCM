import { describe, it, expect, beforeEach } from 'vitest'
import { learn, grade, dueIds, dueCount, dumpClassicSrs, replaceClassicSrs } from '@/utils/classicSrs'

const DAY = 86_400_000
const t0 = 1_700_000_000_000

beforeEach(() => localStorage.clear())

describe('classicSrs (古文 spaced repetition)', () => {
  it('learn registers a box-1 card, due the next day (not same day)', () => {
    learn(['guwen-1'], t0)
    expect(dueIds(t0)).toEqual([]) // just read → not due again today
    expect(dueIds(t0 + DAY)).toEqual(['guwen-1']) // resurfaces tomorrow
    expect(dueCount(t0 + DAY)).toBe(1)
  })

  it('記得 pushes the next review out; 不熟 resets to tomorrow', () => {
    learn(['guwen-1'], t0)
    grade('guwen-1', true, t0 + DAY) // known → box 2 (due +3d)
    expect(dueIds(t0 + DAY)).toEqual([])
    expect(dueIds(t0 + 4 * DAY)).toEqual(['guwen-1'])
    grade('guwen-1', false, t0 + 4 * DAY) // unknown → back to box 1 (tomorrow)
    expect(dueIds(t0 + 5 * DAY)).toEqual(['guwen-1'])
  })

  it('dump/replace round-trips (cloud sync)', () => {
    learn(['guwen-1'], t0)
    const snap = dumpClassicSrs()
    localStorage.clear()
    replaceClassicSrs(snap)
    expect(dueCount(t0 + DAY)).toBe(1)
  })
})
