import { defineMiddleware } from 'astro:middleware'
import { AUTH_COOKIE, verifyToken } from '@/utils/authToken'

// Routes reachable without the gate: the landing page itself and the unlock API.
const PUBLIC_PATHS = new Set(['/', '/api/unlock'])

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  // Static assets (incl. question images in /q) and the public landing are open.
  if (PUBLIC_PATHS.has(pathname) || isAsset(pathname)) {
    return next()
  }

  const token = context.cookies.get(AUTH_COOKIE)?.value
  if (verifyToken(token)) {
    return next()
  }

  // Gated data API -> 401; gated pages -> send back to the landing gate.
  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'locked' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  return context.redirect('/')
})

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/q/') ||
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/_image') ||
    /\.[a-z0-9]+$/i.test(pathname)
  )
}
