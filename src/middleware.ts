import { defineMiddleware } from 'astro:middleware'
import { AUTH_COOKIE, verifyToken } from '@/utils/authToken'
import { isPublicPath } from '@/utils/publicPaths'

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  // Landing gate, unlock API, and static assets are open. The allowlist is an
  // explicit prefix/file set (see publicPaths.ts) — NOT "anything with a file
  // extension", which would silently expose gated routes ending in .ext.
  if (isPublicPath(pathname)) {
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
