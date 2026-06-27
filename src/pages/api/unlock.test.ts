import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/pages/api/unlock'
import { AUTH_COOKIE, verifyToken } from '@/utils/authToken'

beforeEach(() => {
  vi.stubEnv('SITE_PASSWORD', 'open-sesame')
  vi.stubEnv('AUTH_SECRET', 'test-secret')
  vi.stubEnv('PROD', false)
})
afterEach(() => vi.unstubAllEnvs())

type CookieSet = { name: string; value: string; opts: Record<string, unknown> }

function call(body: unknown, { raw = false, url = 'http://x/api/unlock' } = {}) {
  const sets: CookieSet[] = []
  const cookies = { set: (name: string, value: string, opts: Record<string, unknown>) => sets.push({ name, value, opts }) }
  const request = new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ? (body as string) : JSON.stringify(body),
  })
  return { res: POST({ request, cookies } as never), sets }
}

describe('POST /api/unlock', () => {
  it('sets a verifiable, hardened cookie on the correct password', async () => {
    const { res, sets } = call({ password: 'open-sesame' })
    const r = await res
    expect(r.status).toBe(200)
    expect(await r.json()).toEqual({ ok: true })
    expect(sets).toHaveLength(1)
    const c = sets[0]
    expect(c.name).toBe(AUTH_COOKIE)
    expect(verifyToken(c.value)).toBe(true)
    expect(c.opts).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
  })

  it('marks the cookie Secure only over https', async () => {
    const http = call({ password: 'open-sesame' })
    await http.res
    expect(http.sets[0].opts.secure).toBe(false)
    const https = call({ password: 'open-sesame' }, { url: 'https://x/api/unlock' })
    await https.res
    expect(https.sets[0].opts.secure).toBe(true)
  })

  it('401s and sets no cookie on a wrong password', async () => {
    const { res, sets } = call({ password: 'nope' })
    const r = await res
    expect(r.status).toBe(401)
    expect(await r.json()).toEqual({ ok: false })
    expect(sets).toHaveLength(0)
  })

  it('401s on a missing/non-string password and on a non-JSON body', async () => {
    expect((await call({}).res).status).toBe(401)
    expect((await call({ password: 123 }).res).status).toBe(401)
    expect((await call('not json', { raw: true }).res).status).toBe(401)
  })

  it('500s (server_config) when token minting fails — AUTH_SECRET missing in prod', async () => {
    vi.stubEnv('AUTH_SECRET', '')
    vi.stubEnv('PROD', true)
    const { res, sets } = call({ password: 'open-sesame' })
    const r = await res
    expect(r.status).toBe(500)
    expect(await r.json()).toEqual({ ok: false, error: 'server_config' })
    expect(sets).toHaveLength(0)
  })
})
