import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/kv', () => ({
  kvEnabled: vi.fn(() => true),
  kvGet: vi.fn(async () => null),
  kvSet: vi.fn(async () => {}),
}))

import { GET, PUT } from '@/pages/api/state'
import { kvEnabled, kvGet, kvSet } from '@/utils/kv'

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
