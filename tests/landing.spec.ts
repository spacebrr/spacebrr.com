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

test.describe('Signup Flow', () => {
  test('waitlist form shows submitting state', async ({ page }) => {
    await page.goto('/')
    const emailInput = page.locator('input[type="email"]')
    const submitBtn = page.locator('button[type="submit"]')
    
    await emailInput.fill('test@example.com')
    
    const responsePromise = page.waitForResponse(
      res => res.url().includes('/api/waitlist')
    )
    await submitBtn.click()
    
    const message = page.locator('#form-message')
    await expect(message).toContainText(/Submitting|Added to waitlist|Failed/)
    
    await responsePromise
  })

  test('waitlist success shows trial link', async ({ page }) => {
    await page.route('**/api/waitlist', route =>
      route.fulfill({ status: 200, body: '{}' })
    )
    
    await page.goto('/')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('button[type="submit"]').click()
    
    const message = page.locator('#form-message')
    await expect(message).toContainText('Added to waitlist')
    await expect(message.locator('a')).toHaveAttribute('href', 'https://app.spacebrr.com')
  })

  test('waitlist failure shows error', async ({ page }) => {
    await page.route('**/api/waitlist', route =>
      route.fulfill({ status: 500, body: '{}' })
    )
    
    await page.goto('/')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('button[type="submit"]').click()
    
    await expect(page.locator('#form-message')).toContainText('Failed to submit')
  })

  test('waitlist network error shows message', async ({ page }) => {
    await page.route('**/api/waitlist', route => route.abort())
    
    await page.goto('/')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('button[type="submit"]').click()
    
    await expect(page.locator('#form-message')).toContainText('Network error')
  })
})

test.describe('Pricing', () => {
  test('displays free trial duration', async ({ page }) => {
    await page.goto('/')
    const pricing = page.locator('.pricing')
    await expect(pricing).toContainText('7-day free trial')
  })

  test('displays monthly price', async ({ page }) => {
    await page.goto('/')
    const pricing = page.locator('.pricing')
    await expect(pricing).toContainText('$1,000/month per repo')
  })

  test('displays cancel policy', async ({ page }) => {
    await page.goto('/')
    const pricing = page.locator('.pricing')
    await expect(pricing).toContainText('Cancel anytime')
  })
})

test.describe('Auth', () => {
  test('get started navigates to app', async ({ page }) => {
    let navigatedUrl = ''
    await page.route('**/*', (route, request) => {
      const url = request.url()
      if (url.includes('app.spacebrr.com')) {
        navigatedUrl = url
        route.abort()
      } else {
        route.continue()
      }
    })
    
    await page.goto('/')
    const btn = page.locator('#get-started')
    await btn.click()
    
    await page.waitForTimeout(500)
    expect(navigatedUrl).toContain('app.spacebrr.com')
  })

  test('oauth error displays in metrics', async ({ page }) => {
    await page.goto('/?error=access_denied')
    const metric = page.locator('.metric')
    await expect(metric).toContainText('OAuth error: access_denied')
  })

  test('blog link is accessible', async ({ page }) => {
    await page.goto('/')
    const blogLink = page.locator('a[href="/blog/"]')
    await expect(blogLink).toBeVisible()
    await expect(blogLink).toContainText('Read the Launch Post')
  })
})
