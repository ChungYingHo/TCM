import { afterEach, describe, expect, it, vi } from 'vitest'
import { bootCloud, localSnapshot, saveDebounced } from '@/utils/cloud'

// cloud.ts holds module-level boot state (started/loaded) and applyServer is private,
// so the load path is exercised through bootCloud (the public entry). Vitest isolates
// the module per file, and bootCloud's `started` guard means it boots once here.
afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('localSnapshot', () => {
  it('returns the full sync shape with a numeric timestamp', () => {
    const snap = localSnapshot()
    for (const k of ['wrongbook', 'progress', 'plan', 'vocabSrs']) expect(snap).toHaveProperty(k)
    expect(typeof snap.updatedAt).toBe('number')
  })
})

describe('bootCloud', () => {
  it('loads server state, then gates save until that load resolves (regression)', async () => {
    let resolveGet: () => void = () => {}
    const serverState = {
      wrongbook: {}, progress: {},
      streak: { lastDay: '2026-06-17', count: 3, best: 5 },
      plan: { '2026-06-17': { newVocab: true } },
      vocabSrs: {}, updatedAt: 1,
    }
    const fetchMock = vi.fn((_url: string, init?: { method?: string }) => {
      if (init?.method === 'PUT') return Promise.resolve({ ok: true, json: async () => ({}) })
      // the boot GET stays pending until we release it
      return new Promise((res) => { resolveGet = () => res({ json: async () => ({ state: serverState }) }) })
    })
    vi.stubGlobal('fetch', fetchMock)
    let loaded = false
    window.addEventListener('tcm:cloudloaded', () => { loaded = true }, { once: true })
    const puts = () => fetchMock.mock.calls.filter((c) => (c[1] as { method?: string } | undefined)?.method === 'PUT').length

    bootCloud()
    saveDebounced(5)
    await new Promise((r) => setTimeout(r, 30))
    expect(puts()).toBe(0) // gated — initial load not done
    expect(loaded).toBe(false)

    resolveGet() // GET resolves with state → applyServer runs, ready() flips loaded = true
    await new Promise((r) => setTimeout(r, 30))
    expect(loaded).toBe(true) // applyServer dispatched tcm:cloudloaded
    expect(localSnapshot().streak).toMatchObject({ lastDay: '2026-06-17', count: 3 }) // and restored state

    saveDebounced(5)
    await new Promise((r) => setTimeout(r, 30))
    expect(puts()).toBeGreaterThan(0) // saves now that load completed
  })
})
