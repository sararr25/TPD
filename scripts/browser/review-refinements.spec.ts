import { test, expect } from "@playwright/test";
import { twinFixtures, chooseReference } from "./twin-fixtures";
import { worldFixtures, place } from "./world-fixtures";
const base = process.env.MOTION_BASE_URL || "http://127.0.0.1:3000";
for (const viewport of [{ width: 375, height: 812 }, { width: 390, height: 844 }]) {
  test(`Home entrance clears bottom navigation at ${viewport.width}`, async ({ page }) => {
    await worldFixtures(page);
    await page.setViewportSize(viewport);
    await page.goto(base);
    const cta = page.getByRole("button", { name: "Open the city", exact: true });
    await expect(cta).toBeVisible();
    await page.waitForTimeout(1500);
    const button = await cta.boundingBox();
    const bar = await page.locator('.tab-bar:visible').boundingBox();
    expect(button!.y + button!.height).toBeLessThanOrEqual(bar!.y);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.locator('.h-entrance').getByRole('button', { name: 'Find its twin', exact: true }).click();
    const twinCta = await page.getByRole('search', { name: 'Twin', exact: true }).getByRole('button', { name: 'Find its twin', exact: true }).boundingBox();
    expect(twinCta!.y + twinCta!.height).toBeLessThanOrEqual(bar!.y);
  });
}
test('cold header reserves auth and navigation before hydration', async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/auth/**', async route => {
    await new Promise(resolve => setTimeout(resolve, 1100));
    await route.fulfill({ json: null });
  });
  await page.goto(base);
  const slot = page.locator('.site-header .auth');
  await expect(slot).toBeVisible();
  const before = await slot.boundingBox();
  const headerBefore = await page.locator('.site-header').boundingBox();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  const after = await slot.boundingBox();
  const headerAfter = await page.locator('.site-header').boundingBox();
  expect(after!.x).toBeCloseTo(before!.x, 0);
  expect(headerAfter!.height).toBeCloseTo(headerBefore!.height, 0);
});

for (const width of [320, 390, 768, 1440]) test(`Twin featured photo, Save and honest connection at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await twinFixtures(page, { delay: 900 });
  await chooseReference(page, base);
  await page.getByRole('button', { name: 'Keep: Quiet', exact: true }).click();
  await page.getByRole('button', { name: 'Keep: Seafood', exact: true }).click();
  await page.getByRole('button', { name: 'Find its twin', exact: true }).click();
  await expect(page.locator('.twin-thread')).toContainText('The starting place');
  await expect(page.locator('.twin-thread')).toHaveAttribute('data-state', 'searching');
  await expect(page.locator('.twin-thread')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('.twin-thread-traits')).toContainText('Quiet');
  await expect(page.locator('.twin-thread-traits')).not.toContainText('Seafood');
  await expect(page.locator('.twin-difference')).toContainText('A smaller room with a different menu.');
  await expect(page.locator('.twin-spotlight .place-photo')).toBeVisible();
  const save = page.locator('.twin-spotlight .save > button');
  await expect(save).toContainText('Save');
  await page.waitForTimeout(800);
  const actions = await save.boundingBox();
  expect(actions!.y + actions!.height).toBeLessThan(width <= 720 ? 787 : 844);
  await page.getByRole('button', { name: /See other matches/ }).click();
  await expect(page.getByRole('heading', { name: 'Other matches 2' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('mobile page entrance waits for its visible chapter and remains static with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await worldFixtures(page);
  await page.goto(base);
  await page.waitForTimeout(1500);
  const bookmark = page.locator('.h-bookmark');
  const stamp = page.locator('.h-stamp');
  // At rest the lower photo/stamp has not already completed its story.
  const bookmarkBefore = await bookmark.evaluate(el => getComputedStyle(el).transform);
  await page.evaluate(() => scrollBy(0, 220));
  const bookmarkBox = await bookmark.boundingBox();
  expect(bookmarkBox!.y).toBeLessThan(844);
  await expect.poll(() => bookmark.evaluate(el => getComputedStyle(el).transform)).not.toBe(bookmarkBefore);
  await page.evaluate(() => scrollTo(0, 0));
  const top = await stamp.boundingBox();
  expect(top!.y).toBeGreaterThan(844);
  await expect(stamp).toHaveCSS('opacity', '0');
  await stamp.scrollIntoViewIfNeeded();
  await expect(stamp).toHaveCSS('opacity', '1');
  await page.waitForTimeout(700);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(bookmark).toHaveCSS('transform', 'none');
  await stamp.scrollIntoViewIfNeeded();
  await expect(stamp).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(bookmark).toHaveCSS('transform', 'none');
  await expect(stamp).toHaveCSS('opacity', '1');
});

test('Delete-only search keeps its actual input in the result story', async ({ page }) => {
  await twinFixtures(page, { delay: 700 });
  await chooseReference(page, base);
  await page.getByRole('button', { name: 'Delete: Seafood', exact: true }).click();
  await page.getByRole('button', { name: 'Find its twin', exact: true }).click();
  await expect(page.locator('.twin-thread-exclusions')).toContainText('Seafood');
  await expect(page.locator('.twin-thread')).toHaveAttribute('data-state', 'success');
  await expect(page.locator('.twin-thread-traits')).toContainText('Twin match 1');
  await expect(page.locator('.twin-thread-exclusions')).toContainText('Seafood');
});

test('cold loads keep layout shift below the review target', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await worldFixtures(page);
    await page.addInitScript(() => {
      const state = { cls: 0, sources: [] as string[] };
      Object.assign(window, { reviewStability: state });
      new PerformanceObserver(list => list.getEntries().forEach(entry => {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean; sources: { node?: Element }[] };
        if (!shift.hadRecentInput) {
          state.cls += shift.value;
          state.sources.push(...(shift.sources ?? []).map(source => source.node?.className || source.node?.nodeName || 'unknown'));
        }
      })).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(base);
    await page.waitForTimeout(3500);
    const measurement = await page.evaluate(() => (window as unknown as { reviewStability: { cls: number; sources: string[] } }).reviewStability);
    expect(measurement.cls, JSON.stringify(measurement)).toBeLessThanOrEqual(.1);
    expect(measurement.sources).not.toContain('auth compact');
    expect(measurement.sources).not.toContain('FOOTER');
    await context.close();
  }
});

test('enlarged text keeps Home action reachable without clipping', async ({ page }) => {
  await worldFixtures(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base);
  // Text-only scaling includes the approved display/UI sizes defined in px,
  // which changing the root rem size alone would leave untouched.
  await page.evaluate(() => {
    const sizes = [...document.querySelectorAll<HTMLElement>('body *')].map(element => {
      const style = getComputedStyle(element);
      return { element, size: parseFloat(style.fontSize), line: parseFloat(style.lineHeight) };
    });
    sizes.forEach(({ element, size, line }) => {
      element.style.fontSize = `${size * 2}px`;
      if (Number.isFinite(line)) element.style.lineHeight = `${line * 2}px`;
    });
  });
  const cta = page.getByRole('button', { name: 'Open the city', exact: true });
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

for(const size of [{width:1440,height:900},{width:1440,height:780},{width:375,height:812}]) test(`both Home entrances start in the first viewport ${size.width}x${size.height}`,async({page})=>{
 await worldFixtures(page);await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/');
 for(const mode of ['Pick a city','Find its twin']) {
  await page.locator('.h-entrance').getByRole('button',{name:mode,exact:true}).click();
  const form=page.getByRole('search',{name:mode==='Pick a city'?'Open a city':'Twin',exact:true});
  const cta=form.getByRole('button',{name:mode==='Pick a city'?'Open the city':'Find its twin',exact:true});
  const box=(await cta.boundingBox())!;const bottom=await page.locator('.tab-bar').evaluate(el=>getComputedStyle(el).display==='none'?innerHeight:el.getBoundingClientRect().top);
  expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(bottom);expect(await page.evaluate(()=>scrollY)).toBe(0);
 }
 await page.screenshot({path:`.private/priorities/home-${size.width}-${size.height}.png`});
});

for(const width of [320,375,768]) test(`Twin choices provide comfortable touch areas at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:812});await twinFixtures(page);await chooseReference(page,base);
 for(const button of await page.locator('.twin-trait-actions button, .twin-price-options button').all()) {
  const r=(await button.boundingBox())!;expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);
 }
 await page.getByRole('button',{name:'Keep: Quiet',exact:true}).click();await expect(page.getByRole('button',{name:'Keep: Quiet',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

for(const guest of [false,true]) test(`mobile City puts results before secondary filters for ${guest?'guests':'Passport owners'}`,async({page})=>{
 await worldFixtures(page);if(guest)await page.addInitScript(()=>{localStorage.removeItem('tpd-passport-v2');localStorage.removeItem('beesyde-quiz-v1');});
 await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/lisbon');
 const card=page.locator('.place-card:not(.skeleton)').first();await expect(card).toBeVisible();await expect.poll(async()=>(await card.boundingBox())?.y ?? Infinity).toBeLessThan(700);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByRole('group',{name:'Filter these results',exact:true})).not.toBeVisible();
 await page.getByRole('button',{name:'Filters',exact:true}).click();await page.getByRole('combobox',{name:'Price up to',exact:true}).selectOption('2');
 await expect(page.getByRole('status').filter({hasText:'Up to €€'})).toBeVisible();await page.getByRole('button',{name:'Hide filters (1)',exact:true}).click();
 await expect(page.getByRole('group',{name:'Filter these results',exact:true})).not.toBeVisible();await expect(page.getByRole('status').filter({hasText:'Up to €€'})).toBeVisible();
 await page.getByRole('button',{name:'Bars',exact:true}).click();await page.getByRole('button',{name:'Restaurants',exact:true}).click();
 await expect(page.getByRole('button',{name:'Filters (1)',exact:true})).toBeVisible();await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 await expect(page.getByRole('button',{name:'Filters',exact:true})).toBeVisible();await expect(page).not.toHaveURL(/price-restaurant/);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`.private/priorities/city-${guest?'guest':'personal'}.png`});
});

test('overlapping map places share a comfortable chooser and keep list numbering',async({page})=>{
 await worldFixtures(page);await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://tiles.openfreemap.org/**',route=>route.fulfill({json:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#e8e9eb'}}]}}));
 await page.route('**/api/discovery',route=>route.request().postDataJSON().action==='explore'?route.fulfill({json:{results:[
  {place:{...place,id:'00000000-0000-4000-8000-000000000071',name:'First map place',lat:38.72,lon:-9.14},token:'fixture'},
  {place:{...place,id:'00000000-0000-4000-8000-000000000072',name:'Second map place',lat:38.72,lon:-9.14},token:'fixture'},
  {place:{...place,id:'00000000-0000-4000-8000-000000000073',name:'Third map place',lat:38.74,lon:-9.18},token:'fixture'},
 ],checkedAt:'2026-10-27',notice:'Fixture',traitsUsed:false}}):route.fallback());
 await page.goto(base+'/lisbon');await page.getByRole('button',{name:'Map',exact:true}).click();
 const cluster=page.getByRole('button',{name:'2 places here. Choose a place.',exact:true});await expect(cluster).toBeVisible();
 for(const b of await page.locator('.map-pin, .maplibregl-ctrl-zoom-in, .maplibregl-ctrl-zoom-out').all()){const r=(await b.boundingBox())!;expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);}
 const boxes=await page.locator('.map-pin').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
 expect(boxes).toHaveLength(2);expect(Math.abs(boxes[0].x-boxes[1].x)>=44||Math.abs(boxes[0].y-boxes[1].y)>=44).toBe(true);
 await page.locator('.city-map').scrollIntoViewIfNeeded();await page.screenshot({path:'.private/priorities/map-chooser.png'});
 await cluster.click();await expect(page.getByRole('dialog',{name:'Choose a place here',exact:true})).toBeVisible();await page.screenshot({path:'.private/priorities/map-popup.png'});await page.keyboard.press('Escape');await expect(cluster).toBeFocused();
 await cluster.click();await page.getByRole('button',{name:'Close popup',exact:true}).click();await expect(cluster).toBeFocused();
 await cluster.click();await page.getByRole('button',{name:'2. Second map place',exact:true}).click();
 await expect(page.getByRole('link',{name:'Second map place',exact:true})).toBeFocused();await expect(page.getByRole('button',{name:'List',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#place-00000000-0000-4000-8000-000000000072 .place-pin')).toHaveText('2');
});

for(const size of [{width:320,height:812},{width:812,height:375}]) test(`City filters remain usable with enlarged text ${size.width}x${size.height}`,async({page})=>{
 await worldFixtures(page);await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/lisbon');
 await expect(page.locator('.place-card').first()).toBeVisible();
 await page.evaluate(()=>{
  const sizes=[...document.querySelectorAll<HTMLElement>('body *')].map(element=>({element,size:parseFloat(getComputedStyle(element).fontSize),line:parseFloat(getComputedStyle(element).lineHeight)}));
  sizes.forEach(({element,size,line})=>{element.style.fontSize=`${size*2}px`;if(Number.isFinite(line))element.style.lineHeight=`${line*2}px`;});
 });
 const toggle=page.getByRole('button',{name:'Filters',exact:true});await toggle.focus();await page.keyboard.press('Enter');
 const price=page.getByRole('combobox',{name:'Price up to',exact:true});await price.selectOption('1');
 await expect(page.getByRole('heading',{name:'No places match this view.',exact:true})).toBeVisible();
 await page.locator('.city-filter-bar').getByRole('button',{name:'Clear filters',exact:true}).click();
 await expect(page.locator('.place-card:not(.skeleton)').first()).toBeVisible();const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,over:[...document.querySelectorAll('body *')].filter(e=>e instanceof HTMLElement&&e.getBoundingClientRect().right>innerWidth+.1&&!e.closest('.toggle-group[aria-label=Category]')).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right})).slice(0,12)}));expect(layout.scroll,JSON.stringify(layout)).toBeLessThanOrEqual(layout.width);
 await expect.poll(()=>page.locator('#city-title').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:`.private/priorities/city-text-${size.width}.png`});
});
