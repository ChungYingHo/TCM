import { describe, it, expect } from 'vitest'
import { mergeState, type SyncState } from '@/utils/sync'

const s = (partial: Partial<SyncState>): SyncState => ({
  wrongbook: {}, progress: {}, updatedAt: 0, ...partial,
})

describe('mergeState (multi-device union)', () => {
  it('keeps wrong-book entries from both devices', () => {
    const a = s({ wrongbook: { q1: { id: 'q1', wrongCount: 2, lastWrongAt: 100, lastChoice: ['A'] } } })
    const b = s({ wrongbook: { q2: { id: 'q2', wrongCount: 1, lastWrongAt: 50, lastChoice: ['B'] } } })
    const m = mergeState(a, b)
    expect(Object.keys(m.wrongbook).sort()).toEqual(['q1', 'q2'])
  })

  it('takes the larger count and the most recent choice for shared questions', () => {
    const a = s({ wrongbook: { q1: { id: 'q1', wrongCount: 2, lastWrongAt: 100, lastChoice: ['A'] } } })
    const b = s({ wrongbook: { q1: { id: 'q1', wrongCount: 5, lastWrongAt: 200, lastChoice: ['C'] } } })
    const m = mergeState(a, b)
    expect(m.wrongbook.q1.wrongCount).toBe(5)
    expect(m.wrongbook.q1.lastWrongAt).toBe(200)
    expect(m.wrongbook.q1.lastChoice).toEqual(['C']) // newer timestamp wins
  })

  it('merges progress by max, never letting correct exceed attempts', () => {
    const a = s({ progress: { q1: { attempts: 3, correct: 3, lastTs: 100 } } })
    const b = s({ progress: { q1: { attempts: 5, correct: 2, lastTs: 200 } } })
    const m = mergeState(a, b)
    expect(m.progress.q1.attempts).toBe(5)
    expect(m.progress.q1.correct).toBe(3) // max(3,2)=3, capped at attempts 5
    expect(m.progress.q1.lastTs).toBe(200)
  })

  it('caps correct at attempts even across devices', () => {
    const a = s({ progress: { q1: { attempts: 2, correct: 2, lastTs: 10 } } })
    const b = s({ progress: { q1: { attempts: 1, correct: 1, lastTs: 20 } } })
    const m = mergeState(a, b)
    expect(m.progress.q1.correct).toBeLessThanOrEqual(m.progress.q1.attempts)
  })

  it('updatedAt is the max of both', () => {
    expect(mergeState(s({ updatedAt: 5 }), s({ updatedAt: 9 })).updatedAt).toBe(9)
  })
})
