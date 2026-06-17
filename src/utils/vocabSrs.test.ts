import { beforeEach, describe, expect, it } from 'vitest'
import { dueIds, getCard, grade, learn, touch } from '@/utils/vocabSrs'

const DAY = 86_400_000
const T0 = 1_700_000_000_000

beforeEach(() => localStorage.clear())

describe('vocabSrs.touch — incidental review of reused words', () => {
  it('is a no-op for a word that was never learned (respects new-word cursor pace)', () => {
    touch(['ghost'], T0)
    expect(getCard('ghost')).toBeUndefined()
  })

  it('reschedules a due word at the SAME box (light review, not a box advance)', () => {
    learn(['detect'], T0) // box 1, due T0 + 1 day
    const now = T0 + 5 * DAY // overdue
    expect(dueIds(now)).toContain('detect')
    touch(['detect'], now)
    const c = getCard('detect')!
    expect(c.box).toBe(1) // box unchanged
    expect(c.due).toBe(now + 1 * DAY) // rescheduled at box-1 interval
    expect(dueIds(now)).not.toContain('detect') // cleared from the due queue
  })

  it('never touches a card that is not yet due', () => {
    learn(['maintain'], T0)
    grade('maintain', true, T0) // box 2, due T0 + 3 days
    const before = getCard('maintain')!
    touch(['maintain'], T0 + 1 * DAY) // glimpsed while still not due
    expect(getCard('maintain')).toEqual(before) // untouched
  })
})
