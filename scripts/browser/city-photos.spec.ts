import { test, expect } from '@playwright/test';
import { worldFixtures } from './world-fixtures';
const base = process.env.MOTION_BASE_URL || 'http://127.0.0.1:3000';
test('approved city sources have visible attribution and cover every supported city', async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/photo-credits');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The cities, through their lenses.');
  await expect(page.locator('.photo-credit-list > li')).toHaveCount(11);
  await expect(page.locator('.photo-credit-list').getByRole('heading', { name: 'Phu Quoc', exact: true })).toBeVisible();
  for (const card of await page.locator('.photo-credit-list > li').all()) {
    await expect(card.getByRole('link')).toHaveCount(2);
    await expect(card).toContainText('Photograph:');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await page.goto(base + '/explore');
  await expect(page.locator('.h-grid > li:not([hidden])')).toHaveCount(11);
  await expect(page.locator('[data-city="phu-quoc"] img:visible')).toHaveAttribute('src', /wikimedia/);
  await expect(page.locator('footer').getByRole('link', { name: 'Photo credits', exact: true })).toHaveAttribute('href', '/photo-credits');
});
