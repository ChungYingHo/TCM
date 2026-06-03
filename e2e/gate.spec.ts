import { test, expect } from '@playwright/test'

test('locked: visiting a gated page redirects to the landing gate', async ({ page }) => {
  await page.goto('/study')
  await expect(page).toHaveURL('/')
  await expect(page.getByPlaceholder('輸入通關密語')).toBeVisible()
})

test('gated data API returns 401 without a cookie', async ({ request }) => {
  const res = await request.get('/api/data/ISU')
  expect(res.status()).toBe(401)
})

test('wrong password shows an error, correct password unlocks', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('輸入通關密語').fill('wrong-password')
  await page.getByRole('button', { name: '進入' }).click()
  await expect(page.getByText('密碼不對，再想想？')).toBeVisible()

  await page.getByPlaceholder('輸入通關密語').fill('test-password')
  await page.getByRole('button', { name: '進入' }).click()
  await expect(page).toHaveURL('/home')
  await expect(page.getByRole('heading', { name: '學習儀表板' })).toBeVisible()
})
