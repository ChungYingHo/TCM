import { describe, it, expect } from 'vitest'
import { vocabProgress } from '@/utils/vocabProgress'

const card = (box: number, lapses?: number) => ({ box, due: 0, ts: 0, ...(lapses ? { lapses } : {}) })

describe('vocabProgress（我到底真的記得幾個）', () => {
  it('box ≥ 2 才算答對過；box 1 一律歸「還沒過關」', () => {
    const p = vocabProgress({ a: card(1), b: card(2), c: card(3), d: card(4), e: card(6) }, 10)
    expect(p.notYet).toBe(1) // a
    expect(p.learning).toBe(2) // b, c
    expect(p.solid).toBe(2) // d, e
  })

  it('沒進過排程的字算 untouched，不灌進任何一級', () => {
    const p = vocabProgress({ a: card(2) }, 100)
    expect(p.untouched).toBe(99)
    expect(p.notYet + p.learning + p.solid + p.untouched).toBe(100)
  })

  it('答錯 3 次以上算卡住，與 box 分級並行計算', () => {
    const p = vocabProgress({ a: card(1, 5), b: card(3, 3), c: card(2, 2) }, 3)
    expect(p.stuck).toBe(2) // a、b；c 只錯 2 次
    expect(p.notYet).toBe(1)
    expect(p.learning).toBe(2)
  })

  it('空排程：全部算 untouched', () => {
    expect(vocabProgress({}, 252)).toMatchObject({ notYet: 0, learning: 0, solid: 0, untouched: 252, stuck: 0 })
  })

  it('排程比字庫大時 untouched 不會變負數', () => {
    expect(vocabProgress({ a: card(2), b: card(2) }, 1).untouched).toBe(0)
  })
})
