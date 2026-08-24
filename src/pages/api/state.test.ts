import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/kv', () => ({
  kvEnabled: vi.fn(() => true),
  kvGet: vi.fn(async () => null),
  kvSet: vi.fn(async () => {}),
}))

import { GET, PUT } from '@/pages/api/state'
import { kvEnabled, kvGet, kvSet } from '@/utils/kv'
import { localSnapshot } from '@/utils/cloud'

afterEach(() => vi.clearAllMocks())

describe('GET /api/state', () => {
  it('reports {disabled} when no store is configured', async () => {
    vi.mocked(kvEnabled).mockReturnValue(false)
    expect(await (await GET({} as never)).json()).toEqual({ disabled: true })
  })

  it('returns the stored state when present', async () => {
    vi.mocked(kvEnabled).mockReturnValue(true)
    vi.mocked(kvGet).mockResolvedValue(JSON.stringify({ wrongbook: { a: 1 }, progress: {}, updatedAt: 5 }))
    const body = await (await GET({} as never)).json()
    expect(body.state.wrongbook).toEqual({ a: 1 })
  })

  it('returns the EMPTY doc when the store is empty', async () => {
    vi.mocked(kvEnabled).mockReturnValue(true)
    vi.mocked(kvGet).mockResolvedValue(null)
    const body = await (await GET({} as never)).json()
    expect(body.state).toEqual({ wrongbook: {}, progress: {}, updatedAt: 0 })
  })

  it('502s when the store read throws', async () => {
    vi.mocked(kvEnabled).mockReturnValue(true)
    vi.mocked(kvGet).mockRejectedValue(new Error('down'))
    expect((await GET({} as never)).status).toBe(502)
  })
})

describe('PUT /api/state', () => {
  const put = (body: unknown, raw = false) =>
    PUT({ request: new Request('http://x/api/state', { method: 'PUT', body: raw ? (body as string) : JSON.stringify(body) }) } as never)

  beforeEach(() => vi.mocked(kvEnabled).mockReturnValue(true))

  it('sanitizes a valid body before storing (defaults, type coercion, object guards)', async () => {
    const res = await put({
      state: { wrongbook: { a: 1 }, updatedAt: 9 },
    })
    expect(await res.json()).toEqual({ ok: true })
    const stored = JSON.parse(vi.mocked(kvSet).mock.calls[0][1])
    expect(stored.wrongbook).toEqual({ a: 1 })
    expect(stored.progress).toEqual({})
    expect(stored.updatedAt).toBe(9)
  })

  // 2026-08-24 真實資料遺失：PUT 用手寫白名單逐欄重建 state，漏收了 vocabSrsEpoch 與
  // noteCardSrs。epoch 存不進雲端 → 每次 GET 回來都對不上世代 → cloud.ts 的世代閘把整個
  // 單字複習進度清成空的 → 每日複習的「複習單字」區永遠不出現。Aira 三週只能背不能複習。
  // 這兩條釘住「客戶端存什麼，伺服器就要原封收下什麼」。
  it('存得下 SyncState 的每一個欄位（少收一欄就是資料遺失）', async () => {
    const card = { box: 2, due: 111, ts: 222 }
    const snapshot = {
      wrongbook: { w: 1 },
      progress: { p: 1 },
      vocabSrs: { v: card },
      vocabSrsEpoch: 3,
      elementSrs: { e: card },
      classicSrs: { c: card },
      aminoAcidSrs: { a: card },
      noteCardSrs: { n: card },
      updatedAt: 42,
    }
    await put({ state: snapshot })
    const stored = JSON.parse(vi.mocked(kvSet).mock.calls[0][1])
    for (const [k, v] of Object.entries(snapshot)) {
      expect(stored[k], `PUT 掉了「${k}」，這個欄位永遠存不進雲端`).toEqual(v)
    }
  })

  it('客戶端快照的每個欄位都收得到（新增 store 忘了加白名單就紅燈）', async () => {
    await put({ state: localSnapshot() })
    const stored = JSON.parse(vi.mocked(kvSet).mock.calls[0][1])
    for (const k of Object.keys(localSnapshot())) {
      expect(Object.hasOwn(stored, k), `localSnapshot() 有「${k}」但 PUT 沒收，會靜靜地掉資料`).toBe(true)
    }
  })

  it('400s on a non-JSON body', async () => {
    expect((await put('not json', true)).status).toBe(400)
  })

  it('reports {disabled} when no store is configured', async () => {
    vi.mocked(kvEnabled).mockReturnValue(false)
    expect(await (await put({ state: {} })).json()).toEqual({ disabled: true })
    expect(kvSet).not.toHaveBeenCalled()
  })

  it('502s when the store write throws', async () => {
    vi.mocked(kvSet).mockRejectedValue(new Error('down'))
    expect((await put({ state: {} })).status).toBe(502)
  })
})
