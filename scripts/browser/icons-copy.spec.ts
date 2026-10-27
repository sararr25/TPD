import { test, expect } from '@playwright/test';
import { worldFixtures, place, favourites } from './world-fixtures';
import { twinFixtures, chooseReference, twinResults } from './twin-fixtures';
const base = process.env.MOTION_BASE_URL || 'http://127.0.0.1:3000';
for (const width of [320, 390, 1440]) test(`partial Passport and operative icons remain readable ${width}`, async ({ page }) => {
  await worldFixtures(page); await page.setViewportSize({width, height:900});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto(base+'/passport');
  await expect(page.locator('.pf-portrait')).toContainText('Your taste,');
  await expect(page.locator('.pf-portrait')).toContainText('Based on 1 of 18 questions');
  await expect(page.getByRole('heading', {name:'Your Beesyde activity'})).toBeVisible();
  await expect(page.getByRole('button', {name:'Add a visited city',exact:true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBe(0);
  await page.goto(base+'/lisbon');
  const save = page.locator('.place-card').first().getByRole('button',{name:/^Saved /});
  await expect(save.locator('svg')).toHaveAttribute('fill','currentColor');
  await expect(save.locator('svg')).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('.place-card').first().getByRole('button',{name:/Not for me/}).locator('svg')).toHaveCount(1);
  await page.locator(".place-card").first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator(".place-card img").first().evaluate((img:HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({path:`.private/priorities/icons-copy-${width}.png`,fullPage:true});
  await page.goto(base+'/passport');
  await page.getByRole('button',{name:'Add what you love',exact:true}).click();
  await expect(page.getByRole('button',{name:'Remove Fixture favourite 1',exact:true}).locator('svg')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth-innerWidth)).toBe(0);
});
test('provider attribution appears once when shared, and unique reasons stay with a place', async ({page}) => {
  await worldFixtures(page, false);
  await page.route('**/api/discovery', route => {
    const body=route.request().postDataJSON();
    if(body.action !== 'explore') return route.fallback();
    return route.fulfill({json:{results:[0,1,2,3].map(n=>({place:{...place,id:`attributed-${n}`,name:`Attributed place ${n}`,evidence:n===3?[]:[favourites[n===2?1:0].entity.id.toUpperCase()]},token:'fixture'})),checkedAt:'2026-10-27T12:00:00Z',traitsUsed:false,notice:'Fixture'}});
  });
  await page.goto(base+'/lisbon');
  await expect(page.locator('.city-recommendation-reason')).toHaveText('Your favourites helped shape these picks: Fixture favourite 1.');
  await expect(page.locator('#place-attributed-0 .place-why')).toHaveCount(0);
  await expect(page.locator('#place-attributed-1 .place-why')).toHaveCount(0);
  await expect(page.locator('#place-attributed-2 .place-why')).toHaveText('Because you like Fixture favourite 2');
  await expect(page.locator('#place-attributed-3 .place-why')).toHaveCount(0);
  await expect(page.locator('#city-trait')).toHaveAccessibleName('Food & atmosphere');
  const card = page.locator('#place-attributed-0');
  await expect(card.getByRole('button',{name:'Save Attributed place 0',exact:true}).locator('svg')).toHaveAttribute('fill','none');
  await card.getByRole('button',{name:'Save Attributed place 0',exact:true}).click();
  await expect(card.getByRole('button',{name:'Saved Attributed place 0',exact:true}).locator('svg')).toHaveAttribute('fill','currentColor');
});
test('Twin recap separates preference from exclusion and exposes higher tiers',async({page})=>{
  await twinFixtures(page);
  await page.route('**/api/discovery',route=>{
    if(route.request().postDataJSON().action!=='swap') return route.fallback();
    return route.fulfill({json:{results:[{...twinResults[0],place:{...twinResults[0].place,price:4}}],checkedAt:'2026-10-27T12:00:00Z',notice:'Fixture'}});
  });
  await chooseReference(page,base);
  await page.getByRole('button',{name:'Delete: Casual',exact:true}).click();
  await expect(page.locator('.twin-choice-recap')).toContainText('Exclude: Casual');
  await expect(page.locator('.twin-help')).toContainText('Your Passport stays the same.');
  await page.getByRole('button',{name:'Find its twin',exact:true}).click();
  await expect(page.locator('.twin-price-comparison')).toBeVisible();
  await expect(page.locator('.twin-price-comparison')).toContainText('Higher price tier · €€€€ vs €€');
  await expect(page.locator('.twin-details')).not.toHaveAttribute('open','');
  await expect(page.locator('.twin-difference')).toContainText('A smaller room');
});
test('successful venue photo follows SPA navigation through Saved and missing detail photo',async({page})=>{
  test.skip(!!process.env.PASSPORT_PRODUCTION,'Uses the existing development-only Place fixture.');
  await worldFixtures(page);
  await page.setViewportSize({width:390,height:900});
  await page.goto(base+'/preview/checks?photo=known');
  await expect.poll(()=>page.locator('.place-hero img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await page.getByRole('navigation',{name:'Main (mobile)',exact:true}).getByRole('link',{name:'Saved',exact:true}).click({force:true});
  await expect(page.locator('.saved-place-photo img')).toHaveAttribute('src','https://images.qloo.com/fixture.jpg');
  await page.goBack();
  await page.getByRole('link',{name:'Check missing detail photo'}).click();
  await expect(page).toHaveURL(base+'/preview/checks');
  await expect(page.locator('.place-hero img')).toHaveAttribute('src','https://images.qloo.com/fixture.jpg');
  await page.reload();
  await expect(page.locator('.place-hero .photo-caption')).toContainText('Lisbon city photo · place photo unavailable');
});

test('favourites without quiz and explicit No answers are described honestly',async({page})=>{
  await worldFixtures(page);
  await page.addInitScript(()=>localStorage.setItem('beesyde-quiz-v1','{}'));
  await page.goto(base+'/passport');
  await expect(page.locator('.pf-first-page')).toContainText('Travel preferences are not filled in yet.');
  await expect(page.getByRole('link',{name:'Add travel preferences',exact:true})).toHaveAttribute('href','/passport/settings');
  await page.evaluate(()=>{localStorage.setItem('beesyde-quiz-v1',JSON.stringify({music:[]}));window.dispatchEvent(new Event('tpd:passport-changed'));});
  // An explicit No to every music card is an answer; a skipped question is absent.
  await expect(page.locator('.pf-portrait')).toContainText('Based on 1 of 18 questions');
});
test('complete Passport keeps its profile; partial and complete share cards render',async({page,request})=>{
  const { QUESTIONS } = await import('../../src/lib/quiz');
  const answers = Object.fromEntries(QUESTIONS.map(q=>[q.id,q.kind==='slider'?3:q.kind==='this-or-that'?'both':[]]));
  await worldFixtures(page);
  await page.addInitScript(answers=>localStorage.setItem('beesyde-quiz-v1',JSON.stringify(answers)),answers);
  await page.goto(base+'/passport');
  await expect(page.locator('.pf-portrait')).toContainText('Based on 18 of 18 questions');
  await expect(page.locator('.pf-portrait')).not.toContainText('A first sketch');
  for(const [name,value] of [['partial',{planning:2}],['complete',answers]] as const){
    const response=await request.get(base+'/api/passport-card?a='+Buffer.from(JSON.stringify(value)).toString('base64url'));
    expect(response.status()).toBe(200); expect(response.headers()['content-type']).toContain('image/png');
    const image=await response.body();expect(image.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
    await import('node:fs/promises').then(fs=>fs.writeFile(`.private/priorities/passport-${name}.png`,image));
  }
});
