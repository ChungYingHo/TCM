import { describe, it, expect, beforeEach } from 'vitest'
import { createLeitner } from '@/utils/leitner'

const DAY = 86_400_000
const t0 = 1_700_000_000_000

beforeEach(() => localStorage.clear())

describe('createLeitner (shared SRS core — backs vocab/element/classic)', () => {
  it('learn registers a box-1 card due tomorrow and is idempotent', () => {
    const srs = createLeitner('k.learn')
    srs.learn(['a'], t0)
    expect(srs.getCard('a')).toEqual({ box: 1, due: t0 + DAY, ts: t0 })
    srs.grade('a', true, t0) // advance to box 2
    const advanced = srs.getCard('a')
    srs.learn(['a'], t0 + DAY) // re-learn must NOT reset an existing card
    expect(srs.getCard('a')).toEqual(advanced)
  })

  it('grade advances on known (capped at box 6) and resets to box 1 on unknown', () => {
    const srs = createLeitner('k.grade')
    srs.learn(['a'], t0)
    srs.grade('a', true, t0)
    expect(srs.getCard('a')).toEqual({ box: 2, due: t0 + 3 * DAY, ts: t0 })
    for (let i = 0; i < 10; i++) srs.grade('a', true, t0)
    expect(srs.getCard('a')!.box).toBe(6) // INTERVALS length − 1
    expect(srs.getCard('a')!.due).toBe(t0 + 75 * DAY)
    srs.grade('a', false, t0)
    expect(srs.getCard('a')).toEqual({ box: 1, due: t0 + DAY, ts: t0, lapses: 1 })
  })

  // 一直背不起來的（leech）才是真正的破口，光靠排程再輪幾次沒用——要挑得出來才能特別處理。
  describe('lapses / leechIds（揪出一直記不起來的）', () => {
    it('答不熟才累計，答對不清零', () => {
      const srs = createLeitner('k.lapse')
      srs.learn(['a'], t0)
      expect(srs.getCard('a')!.lapses).toBeUndefined() // 沒錯過就不寫這欄
      srs.grade('a', false, t0)
      srs.grade('a', false, t0)
      expect(srs.getCard('a')!.lapses).toBe(2)
      srs.grade('a', true, t0)
      expect(srs.getCard('a')!.lapses).toBe(2) // 答對不該抹掉「曾經卡住兩次」
    })

    it('leechIds 依錯的次數由多到少，門檻預設 3 次', () => {
      const srs = createLeitner('k.leech')
      srs.learn(['a', 'b', 'c'], t0)
      for (let i = 0; i < 5; i++) srs.grade('a', false, t0)
      for (let i = 0; i < 3; i++) srs.grade('b', false, t0)
      srs.grade('c', false, t0) // 只錯 1 次，不算
      expect(srs.leechIds()).toEqual(['a', 'b'])
      expect(srs.leechIds(1)).toEqual(['a', 'b', 'c'])
      expect(srs.leechIds(6)).toEqual([])
    })

    it('舊資料沒有 lapses 欄也不會爆', () => {
      const srs = createLeitner('k.legacy')
      srs.replace({ old: { box: 2, due: t0, ts: t0 } })
      expect(srs.leechIds()).toEqual([])
      srs.grade('old', false, t0)
      expect(srs.getCard('old')!.lapses).toBe(1)
    })
  })

  it('touch reschedules ONLY an already-learned, currently-due card (same box)', () => {
    const srs = createLeitner('k.touch')
    srs.touch(['x'], t0) // unlearned → no-op
    expect(srs.getCard('x')).toBeUndefined()
    srs.learn(['x'], t0) // due t0+DAY
    srs.touch(['x'], t0) // not yet due → no-op
    expect(srs.getCard('x')!.due).toBe(t0 + DAY)
    srs.touch(['x'], t0 + 2 * DAY) // now due → reschedule at same box
    expect(srs.getCard('x')).toEqual({ box: 1, due: t0 + 3 * DAY, ts: t0 + 2 * DAY })
  })

  it('dueIds returns due cards soonest-first; dump/replace round-trips', () => {
    const srs = createLeitner('k.due')
    srs.learn(['a'], t0)
    srs.learn(['b'], t0 + 5 * DAY)
    expect(srs.dueIds(t0 + 6 * DAY)).toEqual(['a', 'b'])
    expect(srs.dueIds(t0)).toEqual([]) // nothing due yet
    const snap = srs.dump()
    localStorage.clear()
    srs.replace(snap)
    expect(srs.dueIds(t0 + 6 * DAY)).toEqual(['a', 'b'])
  })

  it('distinct storage keys do not collide', () => {
    const a = createLeitner('k.a')
    const b = createLeitner('k.b')
    a.learn(['x'], t0)
    expect(a.getCard('x')).toBeTruthy()
    expect(b.getCard('x')).toBeUndefined()
  })
})
