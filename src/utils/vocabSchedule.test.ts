import { describe, it, expect } from 'vitest'
import { type VocabWord } from '@/models/vocab'
import { vocabDayIndex, orderedVocab, vocabForDay, VOCAB_PER_DAY, VOCAB_SCHEDULE_START } from '@/utils/vocabSchedule'

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

// 一律用 VOCAB_SCHEDULE_START 推算日期，不寫死。起算日會因為「重新開始背」而移動
// （2026-08-05 就移過一次），寫死的話每次重設都要回來改一輪測試。
const dayAfterStart = (n: number): string =>
  new Date(Date.parse(`${VOCAB_SCHEDULE_START}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)

describe('vocab daily schedule (字根順序、每天 20 個、繞回循環)', () => {
  it('day index anchors at the start date; before it clamps to 0', () => {
    expect(vocabDayIndex(dayAfterStart(0))).toBe(0)
    expect(vocabDayIndex(dayAfterStart(1))).toBe(1)
    expect(vocabDayIndex(dayAfterStart(10))).toBe(10)
    expect(vocabDayIndex(dayAfterStart(-2))).toBe(0)
  })

  it('orderedVocab sorts by prefix-group order, stable within group, drops unknown/none', () => {
    const withNoise = [...scrambled, mk('x', 'zzz'), mk('y', undefined)]
    expect(orderedVocab(withNoise).map((w) => w.id)).toEqual([...aIds, ...bIds])
  })

  it('vocabForDay returns exactly VOCAB_PER_DAY words in 字根 order, advancing 20/day', () => {
    const d0 = vocabForDay(scrambled, dayAfterStart(0)).map((w) => w.id)
    expect(d0).toEqual([...aIds, ...bIds.slice(0, 5)]) // a0..a14 + b0..b4
    expect(d0).toHaveLength(VOCAB_PER_DAY)

    const d1 = vocabForDay(scrambled, dayAfterStart(1)).map((w) => w.id)
    expect(d1).toEqual([...bIds.slice(5), ...aIds]) // 繞回：b5..b9 + a0..a14
    expect(d1).toHaveLength(VOCAB_PER_DAY)
  })

  it('never a short day: every day returns exactly 20 distinct words', () => {
    for (const day of [0, 2, 7, 26].map(dayAfterStart)) {
      const r = vocabForDay(scrambled, day)
      expect(r).toHaveLength(VOCAB_PER_DAY)
      expect(new Set(r.map((w) => w.id)).size).toBe(VOCAB_PER_DAY)
    }
  })

  it('when the whole library has fewer than 20 words, returns them all without duplicates', () => {
    const few = [mk('a0', 'a-an'), mk('a1', 'a-an'), mk('b0', 'anti')]
    expect(vocabForDay(few, dayAfterStart(0)).map((w) => w.id)).toEqual(['a0', 'a1', 'b0'])
    const later = vocabForDay(few, dayAfterStart(3))
    expect(later).toHaveLength(3)
    expect(new Set(later.map((w) => w.id)).size).toBe(3)
  })
})
