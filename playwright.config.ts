import { defineConfig, devices } from '@playwright/test'

const PORT = 4321

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    // Vercel adapter has no `astro preview`; run the dev server for E2E.
    command: 'npm start',
    url: `http://localhost:${PORT}`,
    timeout: 180000,
    reuseExistingServer: !process.env.CI,
    // overrides any local .env (process.env wins) so the specs' password is deterministic
    env: { SITE_PASSWORD: 'test-password', AUTH_SECRET: 'test-secret-e2e' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
