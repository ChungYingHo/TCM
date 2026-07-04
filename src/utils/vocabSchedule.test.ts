import { describe, it, expect } from 'vitest'
import { PREFIX_GROUPS, type VocabWord } from '@/models/vocab'
import { vocabDayIndex, prefixGroupForDay, vocabForDay } from '@/utils/vocabSchedule'

const ordered = [...PREFIX_GROUPS].sort((a, b) => a.order - b.order)

const mk = (id: string, prefixId: string): VocabWord =>
  ({
    id, word: id, phonetic: '', zh: '', pos: '', tags: [], frq: 0,
    examCount: 0, examCorrect: 0, examIds: [], example: '', example_zh: '', draft: false, prefixId,
  }) as VocabWord

describe('vocab daily schedule (prefix order, from 2026-07-06)', () => {
  it('day index anchors at the start date; before it clamps to 0', () => {
    expect(vocabDayIndex('2026-07-06')).toBe(0)
    expect(vocabDayIndex('2026-07-07')).toBe(1)
    expect(vocabDayIndex('2026-07-16')).toBe(10)
    expect(vocabDayIndex('2026-07-04')).toBe(0)
  })

  it('advances one prefix group per day in teacher order, cycling after the last', () => {
    expect(prefixGroupForDay('2026-07-06').id).toBe(ordered[0].id)
    expect(prefixGroupForDay('2026-07-07').id).toBe(ordered[1].id)
    expect(prefixGroupForDay('2026-07-16').id).toBe(ordered[ordered.length - 1].id)
    expect(prefixGroupForDay('2026-07-17').id).toBe(ordered[0].id)
  })

  it('vocabForDay returns only the current group\'s words, in list order', () => {
    const words = [mk('w1', ordered[0].id), mk('w2', ordered[1].id), mk('w3', ordered[0].id)]
    expect(vocabForDay(words, '2026-07-06').map((w) => w.id)).toEqual(['w1', 'w3'])
    expect(vocabForDay(words, '2026-07-07').map((w) => w.id)).toEqual(['w2'])
  })
})
