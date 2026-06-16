import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // unlock: shares the browser context cookie jar with page navigations
  const res = await page.request.post('/api/unlock', { data: { password: 'test-password' } })
  expect(res.ok()).toBeTruthy()
})

test('study mode: reveal answer and add to wrong-book', async ({ page }) => {
  await page.goto('/study')
  // wait for data + first question card
  const firstCard = page.locator('article').first()
  await expect(firstCard).toBeVisible({ timeout: 20000 })

  await firstCard.getByRole('button', { name: '一鍵看答案' }).click()
  await expect(firstCard.getByText('正確答案：')).toBeVisible()

  await firstCard.getByRole('button', { name: /加入錯題本/ }).click()
  await expect(firstCard.getByRole('button', { name: /已在錯題本/ })).toBeVisible()

  await page.goto('/wrongbook')
  await expect(page.locator('article').first()).toBeVisible({ timeout: 20000 })
  await expect(page.getByText(/錯 \d+ 次/).first()).toBeVisible()
})

test('exam mode: run a paper and get a score', async ({ page }) => {
  await page.goto('/exam')
  await expect(page.getByRole('heading', { name: '模擬考設定' })).toBeVisible()
  await page.getByRole('button', { name: '開始作答' }).click()

  const firstCard = page.locator('article').first()
  await expect(firstCard).toBeVisible({ timeout: 20000 })
  // answers are hidden during the exam
  await expect(firstCard.getByText('正確答案：')).toHaveCount(0)

  // answer the first question (pick option A) then submit
  await firstCard.getByRole('button', { name: /^A/ }).click()
  await page.getByRole('button', { name: '交卷計分' }).first().click()

  await expect(page.getByRole('heading', { name: '成績' })).toBeVisible()
  // a score in N/M form is shown (tolerant of spacing around the slash)
  await expect(page.getByText(/\d+\s*\/\s*\d+/).first()).toBeVisible()
})
