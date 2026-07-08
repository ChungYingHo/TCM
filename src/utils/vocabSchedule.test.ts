import { describe, it, expect } from 'vitest'
import { type VocabWord } from '@/models/vocab'
import { vocabDayIndex, orderedVocab, vocabForDay, seenVocabIds, VOCAB_PER_DAY } from '@/utils/vocabSchedule'

const mk = (id: string, prefixId: string | undefined): VocabWord =>
  ({
    id, word: id, phonetic: '', zh: '', pos: '', tags: [], frq: 0,
    examCount: 0, examCorrect: 0, examIds: [], example: '', example_zh: '', draft: false, prefixId,
  }) as VocabWord

// 兩個真實字首組：'a-an'（order 1）15 字、'anti'（order 2）10 字，共 25 字。
// 輸入故意交錯，以驗證 orderedVocab 真的依組排序、且組內維持輸入順序。
const aIds = Array.from({ length: 15 }, (_, i) => `a${i}`)
const bIds = Array.from({ length: 10 }, (_, i) => `b${i}`)
const scrambled: VocabWord[] = []
for (let i = 0; i < 15; i++) {
  scrambled.push(mk(aIds[i], 'a-an'))
  if (i < 10) scrambled.push(mk(bIds[i], 'anti'))
}

describe('vocab daily schedule (字根順序、每天 20 個、繞回循環，from 2026-07-06)', () => {
  it('day index anchors at the start date; before it clamps to 0', () => {
    expect(vocabDayIndex('2026-07-06')).toBe(0)
    expect(vocabDayIndex('2026-07-07')).toBe(1)
    expect(vocabDayIndex('2026-07-16')).toBe(10)
    expect(vocabDayIndex('2026-07-04')).toBe(0)
  })

  it('orderedVocab sorts by prefix-group order, stable within group, drops unknown/none', () => {
    const withNoise = [...scrambled, mk('x', 'zzz'), mk('y', undefined)]
    expect(orderedVocab(withNoise).map((w) => w.id)).toEqual([...aIds, ...bIds])
  })

  it('vocabForDay returns exactly VOCAB_PER_DAY words in 字根 order, advancing 20/day', () => {
    const d0 = vocabForDay(scrambled, '2026-07-06').map((w) => w.id)
    expect(d0).toEqual([...aIds, ...bIds.slice(0, 5)]) // a0..a14 + b0..b4
    expect(d0).toHaveLength(VOCAB_PER_DAY)

    const d1 = vocabForDay(scrambled, '2026-07-07').map((w) => w.id)
    expect(d1).toEqual([...bIds.slice(5), ...aIds]) // 繞回：b5..b9 + a0..a14
    expect(d1).toHaveLength(VOCAB_PER_DAY)
  })

  it('never a short day: every day returns exactly 20 distinct words', () => {
    for (const day of ['2026-07-06', '2026-07-08', '2026-07-13', '2026-08-01']) {
      const r = vocabForDay(scrambled, day)
      expect(r).toHaveLength(VOCAB_PER_DAY)
      expect(new Set(r.map((w) => w.id)).size).toBe(VOCAB_PER_DAY)
    }
  })

  it('when the whole library has fewer than 20 words, returns them all without duplicates', () => {
    const few = [mk('a0', 'a-an'), mk('a1', 'a-an'), mk('b0', 'anti')]
    expect(vocabForDay(few, '2026-07-06').map((w) => w.id)).toEqual(['a0', 'a1', 'b0'])
    const later = vocabForDay(few, '2026-07-09')
    expect(later).toHaveLength(3)
    expect(new Set(later.map((w) => w.id)).size).toBe(3)
  })
})

describe('seenVocabIds（起算日至今看過的字，用於回填 SRS 種子）', () => {
  it('day 0 = 只有第一天那 20 個字', () => {
    expect(seenVocabIds(scrambled, '2026-07-06')).toEqual([...aIds, ...bIds.slice(0, 5)])
  })

  it('跨日累積聯集去重；第二天即涵蓋全部 25 字、之後恆為全部', () => {
    expect(seenVocabIds(scrambled, '2026-07-07')).toEqual([...aIds, ...bIds])
    expect(seenVocabIds(scrambled, '2026-08-01')).toEqual([...aIds, ...bIds])
  })

  it('起算日之前一律當 day 0（只有第一天的字）', () => {
    expect(seenVocabIds(scrambled, '2026-07-04')).toEqual([...aIds, ...bIds.slice(0, 5)])
  })

  it('空字庫回空陣列', () => {
    expect(seenVocabIds([], '2026-07-09')).toEqual([])
  })
})
