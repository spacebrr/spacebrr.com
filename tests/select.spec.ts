import { test, expect } from 'playwright/test'

test.describe('Select Page', () => {
  test('redirects to landing without session', async ({ page }) => {
    await page.goto('/select.html')
    await expect(page).toHaveURL('/')
  })

  test('shows subscribe when session exists but no subscription', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('session_id', 'test-session')
    })
    await page.route('**/api/subscription', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ status: 'none' }),
      })
    })
    await page.goto('/select.html')
    await expect(page.locator('.subscribe-box')).toBeVisible()
    await expect(page.locator('#checkout-btn')).toContainText('Subscribe')
  })

  test('shows repos when subscription active', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('session_id', 'test-session')
    })
    await page.route('**/api/subscription', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ status: 'active' }),
      })
    })
    await page.route('**/api/repos', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { name: 'test-repo', full_name: 'user/test-repo', clone_url: 'https://github.com/user/test-repo.git', description: 'Test repo' }
        ]),
      })
    })
    await page.goto('/select.html')
    await expect(page.locator('#heading')).toContainText('Select a repository')
    await expect(page.locator('.repo-name')).toContainText('user/test-repo')
  })

  test('provision flow end-to-end', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('session_id', 'test-session')
    })
    await page.route('**/api/repos', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { name: 'test-repo', full_name: 'user/test-repo', clone_url: 'https://github.com/user/test-repo.git', description: 'Test repo' }
        ]),
      })
    })
    await page.route('**/api/templates', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'growth', name: 'Growth' },
          { id: 'quality', name: 'Quality' }
        ]),
      })
    })
    await page.route('**/api/provision', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ project_id: 'proj_123' }),
      })
    })
    
    await page.route('**/api/subscription', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ status: 'active' }),
      })
    })
    
    await page.goto('/select.html')
    await expect(page.locator('#heading')).toContainText('Select a repository')
    
    await page.locator('#repos .repo').first().click()
    await expect(page.locator('#heading')).toContainText('Choose your goal')
    await expect(page.locator('#templates .repo-name').first()).toContainText('Growth')
    
    await page.locator('#templates .repo').first().click()
    await expect(page.locator('#status')).toContainText('Provisioning')
  })
})
