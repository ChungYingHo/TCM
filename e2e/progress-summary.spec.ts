import { test, expect } from '@playwright/test'

// /api/progress-summary lives on the PUBLIC allowlist (so a later headless session can
// curl it) but self-authenticates with the site password via x-tcm-key / ?key=. This is
// a second, independent auth surface — guard it end-to-end.
test('progress-summary rejects missing / wrong keys and accepts the right one', async ({ request }) => {
  // no key → 401 (even though it's on the public-paths allowlist, it self-auths)
  expect((await request.get('/api/progress-summary')).status()).toBe(401)

  // wrong key → 401
  const wrong = await request.get('/api/progress-summary', { headers: { 'x-tcm-key': 'not-the-password' } })
  expect(wrong.status()).toBe(401)

  // correct key (E2E SITE_PASSWORD, injected by playwright.config webServer.env) → 200
  const ok = await request.get('/api/progress-summary', { headers: { 'x-tcm-key': 'test-password' } })
  expect(ok.status()).toBe(200)
  expect(await ok.json()).toHaveProperty('asOf')

  // ?key= query param is an accepted alternative to the header
  const viaQuery = await request.get('/api/progress-summary?key=test-password')
  expect(viaQuery.status()).toBe(200)
})
