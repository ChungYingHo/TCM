import { afterEach, describe, expect, it, vi } from 'vitest'
import { bootCloud, localSnapshot, saveDebounced } from '@/utils/cloud'

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('localSnapshot', () => {
  it('returns the full sync shape with a numeric timestamp', () => {
    const snap = localSnapshot()
    for (const k of ['wrongbook', 'progress', 'vocabSrs']) expect(snap).toHaveProperty(k)
    expect(typeof snap.updatedAt).toBe('number')
  })
})

describe('bootCloud', () => {
  it('loads server state, then gates save until that load resolves (regression)', async () => {
    let resolveGet: () => void = () => {}
    const serverState = {
      wrongbook: {}, progress: {},
      vocabSrs: {}, updatedAt: 1,
    }
    const fetchMock = vi.fn((_url: string, init?: { method?: string }) => {
      if (init?.method === 'PUT') return Promise.resolve({ ok: true, json: async () => ({}) })
      return new Promise((res) => { resolveGet = () => res({ json: async () => ({ state: serverState }) }) })
    })
    vi.stubGlobal('fetch', fetchMock)
    let loaded = false
    window.addEventListener('tcm:cloudloaded', () => { loaded = true }, { once: true })
    const puts = () => fetchMock.mock.calls.filter((c) => (c[1] as { method?: string } | undefined)?.method === 'PUT').length

    bootCloud()
    saveDebounced(5)
    await new Promise((r) => setTimeout(r, 30))
    expect(puts()).toBe(0)
    expect(loaded).toBe(false)

    resolveGet()
    await new Promise((r) => setTimeout(r, 30))
    expect(loaded).toBe(true)

    saveDebounced(5)
    await new Promise((r) => setTimeout(r, 30))
    expect(puts()).toBeGreaterThan(0)
  })
})

// 2026-08-24 真實資料遺失：世代閘原本寫成「epoch 不等於現行值就清空」，缺欄位也算不等於。
// 偏偏 api/state.ts 的 PUT 白名單漏收 vocabSrsEpoch，於是雲端永遠沒有這一欄 →
// 每開一次頁就把單字複習進度清光 → 「複習單字」區三週都是空的。
// 清空使用者資料的預設值必須是「不清」：只有明確標了不同世代才丟。
describe('vocabSrs 世代閘', () => {
  const card = { box: 2, due: 1, ts: 1 }

  async function bootWith(serverState: Record<string, unknown>) {
    vi.resetModules()
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: { method?: string }) =>
        init?.method === 'PUT'
          ? Promise.resolve({ ok: true, json: async () => ({}) })
          : Promise.resolve({ json: async () => ({ state: serverState }) }),
      ),
    )
    const cloud = await import('@/utils/cloud')
    const vocabSrs = await import('@/utils/vocabSrs')
    cloud.bootCloud()
    await new Promise((r) => setTimeout(r, 30))
    return vocabSrs.dumpVocabSrs()
  }

  it('雲端沒有世代欄位時保留 vocabSrs（不把複習進度清光）', async () => {
    expect(
      await bootWith({ wrongbook: {}, progress: {}, vocabSrs: { hello: card }, updatedAt: 1 }),
    ).toEqual({ hello: card })
  })

  it('雲端明確標了不同世代才丟棄', async () => {
    expect(
      await bootWith({
        wrongbook: {},
        progress: {},
        vocabSrs: { hello: card },
        vocabSrsEpoch: 999,
        updatedAt: 1,
      }),
    ).toEqual({})
  })
})
