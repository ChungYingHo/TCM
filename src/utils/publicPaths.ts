// Pure path-gating rules for the auth middleware. Kept free of the
// `astro:middleware` virtual module so it can be unit-tested directly.

// Pages/endpoints reachable WITHOUT the cookie gate: the landing page and the
// unlock endpoint itself. Everything else requires the auth cookie.
const PUBLIC_PATHS = new Set(['/', '/api/unlock'])

// Public static assets, served openly: Astro build output (/_astro/), the
// on-demand image endpoint (/_image), and the question images (/q/).
const PUBLIC_ASSET_PREFIXES = ['/_astro/', '/_image', '/q/']

// A short allowlist of conventional root static files. Listed explicitly
// instead of the old "any path ending in .ext" rule — that catch-all would
// silently expose any future gated route whose URL happens to end in an
// extension (e.g. /api/data/ISU.json, /notes/secret.json).
const PUBLIC_ROOT_FILES = new Set([
  '/favicon.ico',
  '/favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap-index.xml',
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
])

/** True for paths that bypass the password gate (landing, unlock, static assets). */
export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname) || PUBLIC_ROOT_FILES.has(pathname)) return true
  return PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
