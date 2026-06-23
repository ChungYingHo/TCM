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
