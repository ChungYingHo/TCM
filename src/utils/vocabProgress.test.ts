import { describe, it, expect } from 'vitest'
import { vocabProgress } from '@/utils/vocabProgress'

const card = (box: number, lapses?: number) => ({ box, due: 0, ts: 0, ...(lapses ? { lapses } : {}) })

describe('vocabProgress（我到底真的記得幾個）', () => {
  it('box ≥ 2 才算答對過', () => {
    const p = vocabProgress({ b: card(2), c: card(3), d: card(4), e: card(6) }, 10)
    expect(p.learning).toBe(2) // b, c
    expect(p.solid).toBe(2) // d, e
  })

  // Aira 2026-08-05：「但第一天沒複習單字啊」——排進來還沒測過，不能算成沒過關。
  it('box 1 要分「還沒測過」與「沒過關」：沒答錯紀錄的不算沒過關', () => {
    const p = vocabProgress({ a: card(1), b: card(1, 1), c: card(1, 4) }, 3)
    expect(p.untested).toBe(1) // a：剛排進來
    expect(p.failed).toBe(2) // b、c：真的答錯過
  })

  it('第一天只排了 20 個字：20 個都是「還沒測過」，沒過關為 0', () => {
    const store = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`w${i}`, card(1)]))
    const p = vocabProgress(store, 252)
    expect(p).toMatchObject({ untested: 20, failed: 0, learning: 0, solid: 0, untouched: 232 })
  })

  it('沒進過排程的字算 untouched，不灌進任何一級', () => {
    const p = vocabProgress({ a: card(2) }, 100)
    expect(p.untouched).toBe(99)
    expect(p.untested + p.failed + p.learning + p.solid + p.untouched).toBe(100)
  })

  it('答錯 3 次以上算卡住，與 box 分級並行計算', () => {
    const p = vocabProgress({ a: card(1, 5), b: card(3, 3), c: card(2, 2) }, 3)
    expect(p.stuck).toBe(2) // a、b；c 只錯 2 次
    expect(p.failed).toBe(1) // a
    expect(p.learning).toBe(2) // b、c
  })

  it('空排程：全部算 untouched', () => {
    expect(vocabProgress({}, 252)).toMatchObject({ untested: 0, failed: 0, learning: 0, solid: 0, untouched: 252, stuck: 0 })
  })

  it('排程比字庫大時 untouched 不會變負數', () => {
    expect(vocabProgress({ a: card(2), b: card(2) }, 1).untouched).toBe(0)
  })
})
