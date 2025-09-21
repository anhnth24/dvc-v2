import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('DVC v2 Frontend');
});
