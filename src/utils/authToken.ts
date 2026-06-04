// Server-only. HMAC-signed gate token shared by /api/unlock and middleware.
import { createHmac, timingSafeEqual } from 'node:crypto'

export const AUTH_COOKIE = 'tcm_auth'

// Gate password + cookie-signing secret come from env only — no hardcoded
// default. process.env first so Vercel / Playwright injection overrides a local
// .env; static property access keeps Vite happy.
const sitePassword = () => process.env.SITE_PASSWORD || import.meta.env.SITE_PASSWORD || ''
const authSecret = () => process.env.AUTH_SECRET || import.meta.env.AUTH_SECRET || ''

function eq(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/** Verify the gate password against the SITE_PASSWORD env (plaintext). */
export function checkPassword(input: string): boolean {
  const want = sitePassword()
  return !!input && !!want && eq(input, want)
}

// HMAC key for the gate cookie. MUST be set (AUTH_SECRET) in any public deploy —
// otherwise the cookie is forgeable.
function signingKey(): string {
  const secret = authSecret()
  if (secret) return secret
  // Fail loud in production rather than silently signing with a guessable key.
  // The weak fallback below is for local dev / e2e only (never reached in prod).
  if (import.meta.env.PROD) {
    throw new Error('AUTH_SECRET is required in production: the gate cookie would otherwise be forgeable.')
  }
  return sitePassword() || 'dev-only-insecure'
}

/** Token proves "unlocked" without storing the password itself. */
export function makeToken(): string {
  return createHmac('sha256', signingKey()).update('unlocked-v1').digest('hex')
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false
  const expected = makeToken()
  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
