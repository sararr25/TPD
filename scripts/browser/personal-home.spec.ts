import { test, expect, type Page } from '@playwright/test';
import { favourites, place } from './world-fixtures';
const base = process.env.MOTION_BASE_URL || 'http://127.0.0.1:3000';
async function fixtures(page: Page, options: { profile?: boolean; account?: string; visited?: string[]; sync?: boolean; failure?: boolean } = {}) {
  let account = options.account;
  let visited = options.visited ?? [];
  const writes: { owner: string | undefined; cities: string[] }[] = [];
  const ranks: object[] = [];
  await page.addInitScript(({ profile, favourites }) => {
    if (profile && !localStorage.getItem('tpd-passport-v2')) {
      localStorage.setItem('tpd-passport-v2', JSON.stringify(favourites));
      localStorage.setItem('beesyde-quiz-v1', JSON.stringify({ planning: 2 }));
    }
  }, { profile: options.profile, favourites });
  await page.route(/https:\/\/(?:images\.qloo\.com|(?:upload|thumb)\.wikimedia\.org)\//, route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="#6b4a73"/></svg>' }));
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path.includes('/api/auth/sign-out')) { account = undefined; return route.fulfill({ json: { success: true } }); }
    if (path.startsWith('/api/auth/')) return route.fulfill({ json: account ? { user: { id: account, name: 'Fixture visitor', email: 'fixture@example.invalid' }, session: { id: 'fixture', userId: account, expiresAt: '2099-01-01' } } : null });
    if (path === '/api/passport') return route.fulfill({ json: { passport: options.profile ? favourites : [] } });
    if (path === '/api/quiz') return route.fulfill({ json: { answers: options.profile ? { planning: 2 } : null } });
    if (path === '/api/visited-cities') {
      if (request.method() === 'PUT') {
        const cities = request.postDataJSON().cities;
        writes.push({ owner: request.headers()['x-beesyde-user'], cities });
        visited = cities;
        return route.fulfill({ json: { saved: true } });
      }
      return route.fulfill({ json: { cities: visited, syncAvailable: options.sync ?? false } });
    }
    if (path === '/api/discovery') {
      const body = request.postDataJSON();
      if (body.action === 'cities') {
        ranks.push(body);
        return options.failure ? route.fulfill({ status: 503, json: { error: 'provider_unavailable' } }) : route.fulfill({ json: { cities: [{ city: 'Porto', affinity: .8 }, { city: 'Tokyo', affinity: .9 }, { city: 'Hanoi', affinity: .7 }], checkedAt: '2026-10-25T00:00:00Z' } });
      }
      if (body.action === 'guest') return route.fulfill({ json: { choices: favourites } });
      return route.fulfill({ json: { results: [{ place: { ...place, id: body.category === 'museum' ? favourites[0].entity.id : body.category === 'restaurant' ? favourites[1].entity.id : place.id }, token: 'fixture' }], places: [], checkedAt: '2026-10-25T00:00:00Z' } });
    }
    return route.fulfill({ json: { stamps: [], lists: [], collections: [], hidden: [], votes: [], dismissed: [], feedback: { votes: [], dismissed: [] } } });
  });
  return { writes, ranks, switchAccount: (value: string | undefined) => { account = value; } };
}
const cities = (page: Page) => page.locator('.h-personal-cities:visible .h-city-body strong');
for (const width of [375, 390, 768, 1440]) test(`guest has four approved cities and an immediate all-city route at ${width}`, async ({ page }) => {
  const { ranks } = await fixtures(page);
  await page.setViewportSize({ width, height: 844 });
  await page.goto(base);
  await expect(cities(page)).toHaveText(['Lisbon','Paris','Tokyo','New York']);
  await expect(page.locator('.h-personal-cities:visible .h-grid > li')).toHaveCount(4);
  await expect(page.locator('.h-personal-cities:visible').getByRole('link', { name: 'All cities · 11 →' })).toHaveAttribute('href','/explore');
  expect(ranks).toHaveLength(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await page.locator('.h-personal-cities:visible').getByRole('link', { name: 'All cities · 11 →' }).click();
  await expect(page.locator('.h-grid > li:not([hidden])')).toHaveCount(11);
  await page.getByRole('button', { name: 'Asia', exact: true }).click();
  await expect(page.locator('.h-grid > li:not([hidden])')).toHaveCount(5);
});
test('explicit real visits persist and guide opens never create travel history', async ({ page }) => {
  await fixtures(page);
  await page.goto(base + '/lisbon');
  expect(await page.evaluate(() => localStorage.getItem('beesyde-visited-cities-v1:guest'))).toBeNull();
  await page.goto(base + '/passport');
  await page.getByRole('button', { name: /^(Add stamps|Edit stamps)$/ }).click();
  await page.getByRole('checkbox', { name: 'Phu Quoc', exact: true }).check();
  await page.getByRole('button', { name: 'Save visited cities', exact: true }).click();
  await expect(page.locator('.pf-stamp-status')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /^(Add stamps|Edit stamps)$/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Phu Quoc', exact: true })).toBeChecked();
  await page.goto(base);
  await expect(cities(page)).toHaveText(['Phu Quoc','Lisbon','Paris','Tokyo']);
  await expect(page.locator('.h-personal-cities:visible .h-city-reason').first()).toHaveText('Visited by you');
});
test('verified Passport affinity precedes physical visits; missing scores are not invented', async ({ page }) => {
  await fixtures(page, { profile: true });
  await page.goto(base + '/passport');
  await page.getByRole('button', { name: /^(Add stamps|Edit stamps)$/ }).click();
  await page.getByRole('checkbox', { name: 'Phu Quoc', exact: true }).check();
  await page.getByRole('button', { name: 'Save visited cities', exact: true }).click();
  await page.goto(base);
  await expect(page.locator('.h-personal-cities:visible h2')).toHaveText('Cities for your Passport.');
  await expect(cities(page)).toHaveText(['Tokyo','Porto','Hanoi','Phu Quoc']);
  await expect(page.locator('.h-personal-cities:visible .h-city-reason').last()).toHaveText('Visited by you');
  await expect(page.locator('.h-personal-cities:visible')).not.toContainText('%');
});
test('account writes name their owner; switching accounts masks previous real visits', async ({ page }) => {
  const state = await fixtures(page, { account: 'fixture-user-a', visited: ['Tokyo'], sync: true });
  await page.goto(base + '/passport');
  await page.getByRole('button', { name: /^(Add stamps|Edit stamps)$/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Tokyo', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Paris', exact: true }).check();
  await page.getByRole('button', { name: 'Save visited cities', exact: true }).click();
  await expect(page.locator('.pf-stamp-status')).toBeVisible();
  expect(state.writes).toEqual([{ owner: 'fixture-user-a', cities: ['Paris','Tokyo'] }]);
  state.switchAccount(undefined);
  await page.reload();
  await page.getByRole('button', { name: /^(Add stamps|Edit stamps)$/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Tokyo', exact: true })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Paris', exact: true })).not.toBeChecked();
});
test('affinity failure and unavailable account sync keep honest local fallback', async ({ page }) => {
  const { writes } = await fixtures(page, { profile: true, account: 'fixture-user-a', failure: true });
  await page.goto(base);
  await expect(page.locator('.h-personal-cities:visible')).toContainText('Personal city picks aren’t available right now.');
  await expect(cities(page)).toHaveText(['Lisbon','Paris','Tokyo','New York']);
  await page.goto(base + '/passport');
  await page.getByRole('button', { name: /^(Add stamps|Edit stamps)$/ }).click();
  await page.getByRole('checkbox', { name: 'Barcelona', exact: true }).check();
  await page.getByRole('button', { name: 'Save visited cities', exact: true }).click();
  await expect(page.getByText('Saved on this browser for this account. Account sync is not available yet.', { exact: true })).toBeVisible();
  expect(writes).toHaveLength(0);
  await page.reload();
  await page.getByRole('button', { name: /^(Add stamps|Edit stamps)$/ }).click();
  await expect(page.getByRole('checkbox', { name: 'Barcelona', exact: true })).toBeChecked();
});

test('Home travel editor link opens the current stamp dialog', async ({ page }) => {
 await fixtures(page);
 await page.goto(base);
 await page.getByRole('link', { name: 'Update your visited cities' }).click();
 const dialog = page.getByRole('dialog', { name: 'Add visited city stamps' });
 await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('checkbox', { name: 'Paris', exact: true })).toBeEnabled();
 await dialog.getByRole('button', { name: 'Close', exact: true }).click();
 await expect(dialog).not.toBeVisible();
});

test('expired favourites recovery opens the editing controls', async ({ page }) => {
 await fixtures(page);
 await page.goto(base + '/passport');
 await page.evaluate(() => {
  const entity = { id: '00000000-0000-4000-8000-000000000004', name: 'Expired favourite', type: 'artist', tags: [], evidence: [], image: null, lat: null, lon: null, price: null };
  const token = btoa(JSON.stringify({ expires: 1 })) + '.fixture';
  localStorage.setItem('tpd-passport-v2', JSON.stringify([4,5,6].map(n => ({ entity: { ...entity, id: `00000000-0000-4000-8000-00000000000${n}` }, token }))));
  localStorage.setItem('beesyde-quiz-v1', JSON.stringify({ planning: 2 }));
 });
 await page.reload();
 await page.getByRole('link', { name: 'Refresh favourites', exact: true }).filter({ visible: true }).first().click();
 await expect(page.locator('dialog.pf-editor')).toHaveAttribute('open', '');
 await expect(page.locator('dialog.pf-editor').locator('.passport-editor h1')).toBeFocused();
});
