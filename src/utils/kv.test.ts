import { afterEach, describe, expect, it, vi } from 'vitest'
import { kvEnabled, kvGet, kvSet } from '@/utils/kv'

// clear both credential pairs so the test env (which may carry neither) is deterministic
function noStore() {
  for (const k of ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'])
    vi.stubEnv(k, '')
}

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('kvEnabled', () => {
  it('is false when no store credentials are set', () => {
    noStore()
    expect(kvEnabled()).toBe(false)
  })
  it('is true with KV_* credentials', () => {
    noStore()
    vi.stubEnv('KV_REST_API_URL', 'https://kv.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'tok')
    expect(kvEnabled()).toBe(true)
  })
  it('is true with UPSTASH_* credentials (the alternate naming)', () => {
    noStore()
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://up.example')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'tok')
    expect(kvEnabled()).toBe(true)
  })
})

describe('kvGet / kvSet', () => {
  it('kvGet returns null and never fetches when unconfigured', async () => {
    noStore()
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    expect(await kvGet('k')).toBeNull()
    expect(f).not.toHaveBeenCalled()
  })

  it('kvGet returns data.result on a 200', async () => {
    noStore()
    vi.stubEnv('KV_REST_API_URL', 'https://kv.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'tok')
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ result: 'hello' }) })))
    expect(await kvGet('k')).toBe('hello')
  })

  it('kvGet throws on a non-ok response', async () => {
    noStore()
    vi.stubEnv('KV_REST_API_URL', 'https://kv.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'tok')
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })))
    await expect(kvGet('k')).rejects.toThrow()
  })

  it('kvSet no-ops when unconfigured', async () => {
    noStore()
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    await kvSet('k', 'v')
    expect(f).not.toHaveBeenCalled()
  })

  it('kvSet POSTs when configured and throws on non-ok', async () => {
    noStore()
    vi.stubEnv('KV_REST_API_URL', 'https://kv.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'tok')
    const ok = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal('fetch', ok)
    await kvSet('k', 'v')
    expect(ok).toHaveBeenCalledWith('https://kv.example/set/k', expect.objectContaining({ method: 'POST' }))
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })))
    await expect(kvSet('k', 'v')).rejects.toThrow()
  })
})
