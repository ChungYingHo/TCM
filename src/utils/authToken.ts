// Server-only. HMAC-signed gate token shared by /api/unlock and middleware.
import { createHmac, timingSafeEqual } from 'node:crypto'

export const AUTH_COOKIE = 'tcm_auth'

function secret(): string {
  return import.meta.env.SITE_PASSWORD || process.env.SITE_PASSWORD || ''
}

function signingKey(): string {
  return import.meta.env.AUTH_SECRET || process.env.AUTH_SECRET || secret() || 'dev-secret'
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

export function passwordMatches(input: string): boolean {
  const want = secret()
  if (!want) return false
  const a = Buffer.from(input)
  const b = Buffer.from(want)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
