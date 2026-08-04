import { describe, it, expect, beforeEach } from 'vitest'
import { dumpClassicSrs, replaceClassicSrs } from '@/utils/classicSrs'

beforeEach(() => localStorage.clear())

// 2026-08-05 起這個 store 休眠（每日複習不再排古文），只剩雲端 round-trip 的職責——
// 這條測試守的正是「同步不會把既有的古文複習歷史抹掉」。排班演算法本身由 leitner.test.ts 覆蓋。
describe('classicSrs (休眠中，僅保存既有進度)', () => {
  it('dump/replace round-trips through the cloud layer', () => {
    const snap = { 'guwen-1': { box: 3, due: 1_700_000_000_000, ts: 1_699_000_000_000 } }
    replaceClassicSrs(snap)
    expect(dumpClassicSrs()).toEqual(snap)
  })

  it('replace tolerates a missing / malformed cloud blob', () => {
    replaceClassicSrs(undefined as never)
    expect(dumpClassicSrs()).toEqual({})
  })
})
