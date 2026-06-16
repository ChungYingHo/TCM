import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  const res = await page.request.post('/api/unlock', { data: { password: 'test-password' } })
  expect(res.ok()).toBeTruthy()
})

// The daily-plan hub (/review, 今日複習) is the app's centerpiece — the cursor-driven
// schedule. Earlier E2E only checked the dashboard heading on unlock; this asserts the
// hub itself renders and loads today's content past the loading spinner.
test('daily plan hub renders today\'s study sections', async ({ page }) => {
  await page.goto('/review')
  await expect(page.getByRole('heading', { name: '今日複習' })).toBeVisible()
  await expect(page.getByText(/距完課 \d+ 天/)).toBeVisible()
  // content loads (vocab fetched) → the progress counter replaces the spinner
  await expect(page.getByText(/今日進度 \d+\/\d+/)).toBeVisible({ timeout: 20000 })
})
