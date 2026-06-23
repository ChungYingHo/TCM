import type { APIRoute } from 'astro'
import { AUTH_COOKIE, makeToken, checkPassword } from '@/utils/authToken'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    password = ''
  }

  if (!checkPassword(password)) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  // Secure cookies are rejected by some browsers over http://localhost, which
  // would silently drop the auth cookie. Only mark Secure on real https.
  const isHttps = new URL(request.url).protocol === 'https:'
  let token: string
  try {
    token = makeToken()
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'server_config' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
  cookies.set(AUTH_COOKIE, token, {
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
