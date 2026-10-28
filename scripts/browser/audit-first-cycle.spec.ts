import { test, expect, type Page } from '@playwright/test';
import { worldFixtures, fixtureId } from './world-fixtures';
import { QUESTIONS } from '../../src/lib/quiz';
import { twinFixtures, chooseReference, twinResults } from './twin-fixtures';

const base = process.env.MOTION_BASE_URL || 'http://127.0.0.1:3000';
const ordered = [QUESTIONS.find(q => q.id === 'places')!, QUESTIONS.find(q => q.id === 'music')!, ...QUESTIONS.filter(q => !['places', 'music'].includes(q.id))];

async function noAnswerOverlap(page: Page) {
  const overlap = await page.locator('.taste-grid>button').evaluateAll(nodes => {
    const boxes = nodes.map(node => ({ name: node.textContent, r: node.getBoundingClientRect() }));
    return boxes.flatMap((a, i) => boxes.slice(i + 1).filter(b =>
      Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left) > 1 &&
      Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top) > 1
    ).map(b => [a.name, b.name]));
  });
  expect(overlap, 'Answer targets must not intersect neighbouring rows').toEqual([]);
}

test('landscape quiz answer tiles never overlap', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await worldFixtures(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/passport/settings');
  await page.getByRole('button', { name: 'Redo the quiz', exact: true }).click();
  await page.getByRole('button', { name: 'Start my quiz' }).click();
  await expect(page.locator('#quiz-title')).toHaveText('Which would you walk into?');
  await page.screenshot({ path: '.private/audit-72/landscape-quiz.png' });
  await noAnswerOverlap(page);
});

for (const size of [{width:667,height:375}, {width:844,height:390}, {width:320,height:568}, {width:667,height:375,textScale:2}]) {
  test(`all quiz questions and top-up stay reachable ${size.width}x${size.height}${size.textScale?' with doubled text':''}`, async ({page}) => {
    test.setTimeout(60000);
    await worldFixtures(page);
    await page.setViewportSize(size);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(base+'/passport/settings');
    await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();
    await page.getByRole('button',{name:'Start my quiz'}).click();
    for (const q of ordered) {
      await expect(page.locator('#quiz-title')).toHaveText(q.title);
      if(size.textScale) await page.locator('.taste-quiz').evaluate(root=>{
        const textNodes=[...root.querySelectorAll<HTMLElement>('*')].filter(node=>!node.dataset.auditTextSize&&[...node.childNodes].some(child=>child.nodeType===Node.TEXT_NODE&&child.textContent?.trim()));
        const sizes=textNodes.map(node=>[node,parseFloat(getComputedStyle(node).fontSize)] as const);
        for(const [node,size] of sizes){node.style.fontSize=`${size*2}px`;node.dataset.auditTextSize='2';}
      });
      await noAnswerOverlap(page);
      const last = page.locator('.taste-body button').last();
      await last.scrollIntoViewIfNeeded();
      expect(await last.evaluate(node => {
        const r=node.getBoundingClientRect(), body=node.closest('.taste-body')!.getBoundingClientRect();
        return r.top >= body.top-.5 && r.bottom <= body.bottom+.5 && r.right <= innerWidth && r.left >= 0;
      }),q.title+' last answer is reachable inside the reading area').toBe(true);
      await page.getByRole('button',{name:'Skip',exact:true}).click();
    }
    await expect(page.locator('#quiz-title')).toHaveText('Choose 3 favourites to finish');
    await noAnswerOverlap(page);
    const last=page.locator('.taste-topup button').last();
    await last.scrollIntoViewIfNeeded();
    await last.click();
    await expect(last).toHaveAttribute('aria-pressed','true');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
    await page.screenshot({path:`.private/audit-72/quiz-topup-${size.width}.png`});
  });
}

test('guest sees the actual discovery notice before the first place', async ({page})=>{
  await worldFixtures(page,false);
  await page.addInitScript(()=>{localStorage.removeItem('tpd-passport-v2');localStorage.removeItem('beesyde-quiz-v1');});
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/lisbon');
  const notice=page.locator('.city-notice'), card=page.locator('.place-card').first();
  await expect(notice).toHaveText('Fixture');
  await expect(card).toBeVisible();
  expect((await notice.boundingBox())!.y+(await notice.boundingBox())!.height).toBeLessThanOrEqual((await card.boundingBox())!.y);
  await expect(notice).toHaveCount(1);
});

test('new Passport offers one early quiz entry and retains the book structure',async({page})=>{
  await worldFixtures(page,false);
  await page.addInitScript(()=>{localStorage.removeItem('tpd-passport-v2');localStorage.removeItem('beesyde-quiz-v1');});
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/passport');
  const start=page.getByRole('button',{name:'Make your Passport',exact:true});
  await expect(start).toHaveCount(1);
  await expect(start).toBeVisible();
  expect((await start.boundingBox())!.y+(await start.boundingBox())!.height).toBeLessThan(780);
  expect(await page.locator('.pf-left').evaluate(node=>!!(node.compareDocumentPosition(document.querySelector('.pf-analysis')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await start.click();
  await expect(page.getByRole('button',{name:'Start my quiz'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(start).toBeFocused();
});

test('Settings puts taste first and cannot reset empty trip metadata',async({page})=>{
  await worldFixtures(page,false);
  await page.goto(base+'/passport/settings');
  await expect(page.locator('main h2').first()).toHaveText('Your taste profile');
  await expect(page.getByRole('button',{name:'Clear trip organisation and visits',exact:true})).toBeDisabled();
  await expect(page.getByText('There’s no trip organisation or visit feedback to clear yet.',{exact:true})).toBeVisible();
});

test('trip reset requires deliberate confirmation and preserves Saved and quiz',async({page})=>{
  await worldFixtures(page);
  await page.addInitScript(({fixtureId})=>localStorage.setItem('beesyde-travel-v1:guest',JSON.stringify({version:1,trips:{test:{groups:['Saturday'],places:[{id:fixtureId,group:'Saturday'}]}},visits:[]})),{fixtureId});
  await page.goto(base+'/passport/settings');
  const original=await page.evaluate(()=>({quiz:localStorage.getItem('beesyde-quiz-v1'),saved:localStorage.getItem('beesyde-lists-v1')}));
  const trigger=page.getByRole('button',{name:'Clear trip organisation and visits',exact:true});
  await trigger.click();
  const dialog=page.getByRole('dialog',{name:'Clear trip organisation and visits?',exact:true});
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button',{name:'Keep my trip data',exact:true}).click();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('beesyde-travel-v1:guest')!).trips.test.groups)).toEqual(['Saturday']);
  await trigger.click();
  await dialog.getByRole('button',{name:'Clear organisation and visits',exact:true}).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeDisabled();
  expect(await page.evaluate(()=>({quiz:localStorage.getItem('beesyde-quiz-v1'),saved:localStorage.getItem('beesyde-lists-v1')}))).toEqual(original);
});

test('featured Twin actions explain their visible meaning',async({page})=>{
  await twinFixtures(page);
  await page.route('**/api/discovery',route=>{
    if(route.request().postDataJSON().action!=='swap')return route.fallback();
    return route.fulfill({json:{results:twinResults.map(item=>({...item,place:{...item.place,lat:38.71,lon:-9.14}})),notice:'Fixture',checkedAt:'2026-10-28T12:00:00Z'}});
  });
  await page.setViewportSize({width:320,height:812});
  await page.emulateMedia({reducedMotion:'reduce'});
  await chooseReference(page,base);
  await page.getByRole('button',{name:'Find its twin',exact:true}).click();
  const featured=page.locator('.twin-spotlight');
  await expect(featured.getByRole('button',{name:/Not for me/})).toContainText('Not for me');
  await expect(featured.getByRole('link',{name:/Directions/})).toContainText('Directions');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
  await page.screenshot({path:'.private/audit-72/twin-actions-320.png'});
});

test('place actions precede the secondary Passport prompt',async({page})=>{
  test.skip(!!process.env.PASSPORT_PRODUCTION,'Uses the development-only Place fixture.');
  await worldFixtures(page,false);
  await page.addInitScript(()=>{localStorage.removeItem('tpd-passport-v2');localStorage.removeItem('beesyde-quiz-v1');});
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/preview/checks?photo=known');
  const primary=page.locator('.place-page-actions').getByRole('link',{name:'Find its twin',exact:true});
  const quiz=page.locator('.place-passport-prompt').getByRole('button',{name:'Make your Passport',exact:true});
  await expect(primary).toHaveClass(/btn-primary/);
  await expect(quiz).toHaveClass(/btn-quiet/);
  expect(await primary.evaluate(node=>!!(node.compareDocumentPosition(document.querySelector('.place-passport-prompt')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await primary.scrollIntoViewIfNeeded();
  await page.screenshot({path:'.private/audit-72/place-actions-390.png'});
});
