import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkPassword, makeToken, verifyToken } from '@/utils/authToken'

// authToken reads env via functions (not module-load constants), so per-test
// vi.stubEnv is enough — no module re-import needed.
afterEach(() => vi.unstubAllEnvs())

describe('checkPassword', () => {
  it('accepts the configured password, rejects others', () => {
    vi.stubEnv('SITE_PASSWORD', 'open-sesame')
    expect(checkPassword('open-sesame')).toBe(true)
    expect(checkPassword('wrong')).toBe(false)
  })

  it('rejects empty input, and rejects everything when no password is configured', () => {
    vi.stubEnv('SITE_PASSWORD', 'open-sesame')
    expect(checkPassword('')).toBe(false)
    vi.stubEnv('SITE_PASSWORD', '')
    expect(checkPassword('')).toBe(false)
    expect(checkPassword('anything')).toBe(false)
  })
})

describe('makeToken / verifyToken', () => {
  it('round-trips a freshly minted token', () => {
    vi.stubEnv('AUTH_SECRET', 'secret-A')
    expect(verifyToken(makeToken())).toBe(true)
  })

  it('rejects empty, missing, and forged tokens', () => {
    vi.stubEnv('AUTH_SECRET', 'secret-A')
    expect(verifyToken(undefined)).toBe(false)
    expect(verifyToken(null)).toBe(false)
    expect(verifyToken('')).toBe(false)
    expect(verifyToken('deadbeef')).toBe(false)
    expect(verifyToken(makeToken().slice(0, -1))).toBe(false) // truncated
  })

  it('a token signed with one secret does not verify under another', () => {
    vi.stubEnv('AUTH_SECRET', 'secret-A')
    const tokenA = makeToken()
    vi.stubEnv('AUTH_SECRET', 'secret-B')
    expect(makeToken()).not.toBe(tokenA)
    expect(verifyToken(tokenA)).toBe(false) // can't forge across secrets
  })
})

describe('signingKey fail-loud in production', () => {
  it('throws when AUTH_SECRET is missing in a production build (cookie would be forgeable)', () => {
    vi.stubEnv('AUTH_SECRET', '')
    vi.stubEnv('PROD', true)
    expect(() => makeToken()).toThrow(/AUTH_SECRET/)
  })

  it('does not throw in dev (falls back to a dev-only key)', () => {
    vi.stubEnv('AUTH_SECRET', '')
    vi.stubEnv('PROD', false)
    expect(() => makeToken()).not.toThrow()
  })
})
