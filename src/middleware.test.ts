import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// astro:middleware is aliased to a test stub (vitest.config.ts) so onRequest
// imports cleanly; defineMiddleware there is the identity, so onRequest is the
// raw `(context, next) => ...` handler.
import { onRequest } from '@/middleware'
import { AUTH_COOKIE, makeToken } from '@/utils/authToken'

const NEXT = Symbol('next')

async function run(pathname: string, token?: string) {
  const next = vi.fn(() => NEXT)
  const redirect = vi.fn((to: string) => ({ redirectedTo: to }))
  const context = {
    url: new URL('http://x' + pathname),
    cookies: {
      get: (name: string) =>
        token !== undefined && name === AUTH_COOKIE ? { value: token } : undefined,
    },
    redirect,
  }
  const result = await (onRequest as never as (c: unknown, n: unknown) => unknown)(context, next)
  return { result, next, redirect }
}

beforeEach(() => vi.stubEnv('AUTH_SECRET', 'test-secret'))
afterEach(() => vi.unstubAllEnvs())

describe('auth middleware', () => {
  it('lets public paths through without a cookie', async () => {
    for (const p of ['/', '/api/unlock', '/_astro/app.js', '/_image', '/q/CMU/1.png', '/favicon.ico']) {
      const { result, next, redirect } = await run(p)
      expect(next, p).toHaveBeenCalledOnce()
      expect(redirect, p).not.toHaveBeenCalled()
      expect(result, p).toBe(NEXT)
    }
  })

  it('redirects a gated PAGE to the landing gate when no/invalid token', async () => {
    const { next, redirect } = await run('/study')
    expect(next).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('401s a gated API route when no token', async () => {
    const { result, next } = await run('/api/data/CMU')
    expect(next).not.toHaveBeenCalled()
    const res = result as Response
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'locked' })
  })

  it('lets a request through with a valid token', async () => {
    const { result, next } = await run('/study', makeToken())
    expect(next).toHaveBeenCalledOnce()
    expect(result).toBe(NEXT)
  })

  it('rejects a forged/garbage token like no token', async () => {
    const { next, redirect } = await run('/study', 'deadbeef')
    expect(next).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/')
  })
})
