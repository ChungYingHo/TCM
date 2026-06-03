import type { APIRoute } from 'astro'
import { timingSafeEqual } from 'node:crypto'
import { AUTH_COOKIE, makeToken, passwordMatches } from '@/utils/authToken'
import { kvGet } from '@/utils/kv'

export const prerender = false

function eq(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

// Password lives in the DB if set (change it without redeploying); otherwise
// fall back to the SITE_PASSWORD env / built-in default.
async function checkPassword(password: string): Promise<boolean> {
  if (!password) return false
  try {
    const dbPw = await kvGet('tcm:password')
    if (dbPw) return eq(password, dbPw)
  } catch {
    /* store unavailable → fall through to env/default */
  }
  return passwordMatches(password)
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    password = ''
  }

  if (!(await checkPassword(password))) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Secure cookies are rejected by some browsers over http://localhost, which
  // would silently drop the auth cookie. Only mark Secure on real https.
  const isHttps = new URL(request.url).protocol === 'https:'
  cookies.set(AUTH_COOKIE, makeToken(), {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
