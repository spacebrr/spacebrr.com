import { test, expect } from 'playwright/test'

test.describe('Landing Page', () => {
  test('renders headline', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('h1')
    await expect(page.locator('h1')).toContainText("Your team can't scale fast enough")
  })

  test('renders metrics from API or fallback', async ({ page }) => {
    await page.goto('/')
    const metric = page.locator('.metric')
    await expect(metric).toBeVisible()
    await expect(metric).toContainText('days')
  })

  test('renders waitlist form', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Join Waitlist')
  })

  test('validates email before submit', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('invalid')
    await page.locator('button[type="submit"]').click()
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('get started button links to oauth', async ({ page }) => {
    await page.goto('/')
    const btn = page.locator('#get-started')
    await expect(btn).toContainText('Get Started')
    await expect(btn).toBeVisible()
  })

  test('renders pricing info', async ({ page }) => {
    await page.goto('/')
    const pricing = page.locator('.pricing')
    await expect(pricing).toContainText('$1,000/month')
  })
})
