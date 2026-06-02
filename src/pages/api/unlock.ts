import type { APIRoute } from 'astro'
import { AUTH_COOKIE, makeToken, passwordMatches } from '@/utils/authToken'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    password = ''
  }

  if (!passwordMatches(password)) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  cookies.set(AUTH_COOKIE, makeToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
