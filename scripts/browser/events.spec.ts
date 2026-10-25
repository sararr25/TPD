import { test, expect } from "@playwright/test";
import { worldFixtures } from "./world-fixtures";
const base = "http://127.0.0.1:3000";
const payload = {
 supported: true, checkedAt: '2026-10-25T12:00:00Z', bounded: true,
 period: { from: '2026-10-25T12:00:00Z', to: '2026-11-24T12:00:00Z' },
 source: { name: 'Ville de Paris · Que Faire à Paris', url: 'https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/', license: 'ODbL', licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/' },
 events: [0, 1].map(n => ({ id: `fixture-${n}`, title: `Dated event ${n}`, start: `2026-10-${26+n}T19:00:00+01:00`, end: `2026-10-${26+n}T21:00:00+01:00`, timezone: 'Europe/Paris', schedule: 'One evening session', venue: 'Fixture venue', address: 'Fixture street, Paris', lat:48.8, lon:2.3, types:[n ? 'Exhibition' : 'Concert'], price: n ? 'paid' : 'free', priceDetail: '', url: `https://www.paris.fr/evenements/fixture-${n}`, updatedAt:null }))
};
for (const width of [390, 1440]) test(`Events real-date browse and filters ${width}`, async ({ page }) => {
 await worldFixtures(page); await page.setViewportSize({ width, height: 844 });
 await page.route('**/api/events?*', r => r.fulfill({ json: payload }));
 await page.goto(base+'/paris');
 await page.getByRole('button', { name:'Events', exact:true }).click();
 const events = page.locator('.events-explorer');
 await expect(events.getByRole('heading', { name:'Dated event 0' })).toBeVisible();
 await expect(events).toHaveAccessibleName('A date with the city');
 await events.getByRole('combobox', { name:'Admission', exact:true }).selectOption('free');
 await expect(events.getByRole('heading', { name:'Dated event 1' })).toHaveCount(0);
 await events.getByLabel('From', { exact:true }).fill('2026-10-28');
 await expect(events.getByRole('heading', { name:'No events in this selection match' })).toBeVisible();
 await events.getByRole('button', { name:'Clear event filters' }).click();
 await expect(events.locator('.event-card')).toHaveCount(2);
 await events.getByRole('combobox', { name:'Event type', exact:true }).selectOption('Concert');
 await expect(events.locator('.event-card')).toHaveCount(1);
 await expect(events.getByRole('link', { name:'ODbL', exact:true })).toBeVisible();
 expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBe(0);
 await page.screenshot({ path:`.private/twin-ab/events-${width}.png`,fullPage:true });
 await page.goBack(); await expect(page.getByRole('button',{name:'Restaurants',exact:true})).toHaveAttribute('aria-pressed','true');
});
test('unsupported event city and failed agenda are explicit', async ({ page }) => {
 await worldFixtures(page); await page.goto(base+'/lisbon?tab=swap');
 await page.getByRole('button',{name:'Events',exact:true}).click();
 await expect(page.getByRole('link',{name:/Check Lisbon’s official agenda/})).toBeVisible();
 await page.route('**/api/events?*',r=>r.fulfill({status:503,json:{error:'events_unavailable'}}));
 await page.goto(base+'/paris?events=1');
 await expect(page.getByRole('button',{name:'Try events again'})).toBeVisible();
 await expect(page.getByRole('link',{name:/Open the official Paris agenda/})).toBeVisible();
});
