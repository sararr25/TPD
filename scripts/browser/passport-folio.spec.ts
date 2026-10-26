import { test, expect, type Page } from '@playwright/test';
import { favourites, place } from './world-fixtures';
const base=process.env.MOTION_BASE_URL || 'http://127.0.0.1:3191';
async function setup(page:Page, visited:string[]=['Paris','Lisbon']) {
 const requests:Record<string,unknown>[]=[];
 await page.addInitScript(({favourites,visited})=>{
 localStorage.setItem('tpd-passport-v2',JSON.stringify(favourites));
 localStorage.setItem('beesyde-quiz-v1',JSON.stringify({planning:5,rhythm:5,places:['jazz-club','gallery'],dinner:'noodles',crowds:5}));
 if (!localStorage.getItem('beesyde-visited-cities-v1:guest')) localStorage.setItem('beesyde-visited-cities-v1:guest',JSON.stringify({cities:visited,pending:false}));
 },{favourites,visited});
 await page.route('**/api/**',async route=>{
 const path=new URL(route.request().url()).pathname;
 if(path.startsWith('/api/auth/')) return route.fulfill({json:null});
 if(path==='/api/discovery') {const b=route.request().postDataJSON();requests.push(b);return route.fulfill({json:{results:[{place,token:'fixture'}],places:[],notice:'Picked for your Passport.',checkedAt:'2026-10-26',traitsUsed:true}});}
 return route.fulfill({json:{stamps:[],lists:[],collections:[],hidden:[],votes:[],dismissed:[],feedback:{votes:[],dismissed:[]}}});
 });
 return requests;
}
for(const width of [375,768,1440]) test(`folio city stamps and real category links at ${width}`,async({page})=>{
 const requests=await setup(page);await page.setViewportSize({width,height:900});await page.goto(base+'/passport');
 await expect(page.locator('.pf-book:visible')).toBeVisible();
 await expect(page.locator('.pf-city-stamp:visible')).toHaveCount(2);
 await expect(page.getByText('From your answers',{exact:true})).toHaveCount(0);
 await expect(page.locator('.pf-book:visible')).toHaveCSS('opacity','1');
 await expect(page.locator('.pf-city-stamp:visible').last()).toHaveCSS('opacity','1');
 if(width===1440) await page.screenshot({path:'.private/passport-folio-desktop.png',fullPage:true});
 if(width===375) await page.screenshot({path:'.private/passport-folio-mobile.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
 await page.getByRole('button',{name:'Find bars for your evenings'}).click();
 await expect(page.locator('.pf-preview:visible')).toContainText('Picked for your Passport');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
 await page.screenshot({path:`.private/passport-inline-${width}.png`,fullPage:true});
 await page.getByRole('link',{name:'See all matches in Lisbon'}).click();
 await expect(page.locator('.pf-match-heading h1:visible')).toHaveText('Bars for your Passport');
 await expect(page.locator('.pf-match-heading select:visible')).toHaveValue('Lisbon');
 await expect.poll(()=>requests.filter(r=>r.action==='explore').length).toBeGreaterThan(0);
 const request=requests.find(r=>r.action==='explore')!;expect(request.city).toBe('Lisbon');expect(request.category).toBe('bar');expect(request.passport).toHaveLength(3);expect(request.quiz).toMatchObject({rhythm:5});
 await page.locator('.pf-match-heading select:visible').selectOption('Paris');
 await expect.poll(()=>requests.some(r=>r.action==='explore'&&r.city==='Paris')).toBe(true);
});
test('no travel history requires choosing a city; stamp editor persists actual visits',async({page})=>{
 const requests=await setup(page,[]);await page.goto(base+'/passport/matches?category=cafe');
 await expect(page.getByRole('heading',{name:'Where would you like to explore?'})).toBeVisible();expect(requests.filter(r=>r.action==='explore')).toHaveLength(0);
 await page.goto(base+'/passport');await page.getByRole('button',{name:'Add stamps',exact:true}).click();await page.getByRole('checkbox',{name:'Tokyo',exact:true}).check();await page.getByRole('button',{name:'Save visited cities',exact:true}).click();
 await expect(page.locator('.pf-stamp-status')).toBeVisible();await expect(page.locator('.pf-stamp-dialog')).not.toBeVisible();await expect(page.locator('.pf-city-stamp:visible')).toContainText('Tokyo');await page.reload();await expect(page.locator('.pf-city-stamp:visible')).toContainText('Tokyo');
});
test('empty quiz has an honest entry; reduced motion keeps the portrait visible',async({page})=>{
 await setup(page,[]);await page.addInitScript(()=>{localStorage.removeItem('beesyde-quiz-v1');localStorage.removeItem('tpd-passport-v2');});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/passport');
 await expect(page.getByRole('heading',{name:'Make it yours.'})).toBeVisible();
 await expect(page.locator('.pf-insights')).toHaveCount(0);
 await page.getByRole('button',{name:'Make your Passport',exact:true}).click();await expect(page.getByRole('button',{name:'Start my quiz'})).toBeVisible();
});
test('inline preview is deliberate, retries errors and keeps the selected city',async({page})=>{
 const requests=await setup(page,[]);let fail=true;
 await page.route('**/api/discovery',async route=>{const body=route.request().postDataJSON();if(body.action==='explore' && fail){requests.push(body);return route.fulfill({status:503,json:{error:'provider_unavailable'}});}return route.fallback();});
 await page.goto(base+'/passport');expect(requests.filter(r=>r.action==='explore')).toHaveLength(0);
 await page.getByRole('button',{name:'Find bars for your evenings'}).click();
 await expect(page.locator('.pf-preview')).toContainText('Choose a city to see your matches');expect(requests.filter(r=>r.action==='explore')).toHaveLength(0);
 await page.locator('.pf-preview select').selectOption('Tokyo');await expect(page.locator('.pf-preview')).toContainText('We couldn’t load places');
 fail=false;await page.locator('.pf-preview').getByRole('button',{name:'Try again',exact:true}).click();await expect(page.locator('.pf-mini-place')).toHaveCount(1);await expect(page.locator('.pf-preview select')).toHaveValue('Tokyo');
 await page.getByRole('button',{name:'Find bars for your evenings'}).click();await expect(page.locator('.pf-preview')).toHaveCount(0);
 await page.getByRole('button',{name:'More about your taste'}).click();await expect(page.getByRole('button',{name:'Find cafés for your pauses'})).toBeVisible();
});
test('mobile bookmarks move focus and reduced motion preserves the larger illustration',async({page})=>{
 await setup(page);await page.setViewportSize({width:375,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/passport');
 await page.getByRole('button',{name:'Your taste ↓'}).click();await expect(page.locator('#pf-taste')).toBeFocused();await expect(page.locator('.pf-drawing')).toHaveCSS('stroke-dashoffset','0px');
 await page.getByRole('button',{name:'Your travels ↓'}).click();await expect(page.locator('#pf-travels')).toBeFocused();
});
test('preview caps results at three and only explains provider-attributed favourites',async({page})=>{
 await setup(page);await page.route('**/api/discovery',async route=>{if(route.request().postDataJSON().action!=='explore')return route.fallback();return route.fulfill({json:{results:Array.from({length:5},(_,i)=>({place:{...place,id:`20000000-0000-4000-8000-${String(i).padStart(12,'0')}`,name:`Fixture match ${i+1}`,evidence:i===0?[favourites[0].entity.id]:[]},token:'fixture'}))}});});
 await page.goto(base+'/passport');await page.getByRole('button',{name:'Find bars for your evenings'}).click();await expect(page.locator('.pf-mini-place')).toHaveCount(3);await expect(page.locator('.pf-mini-place').first()).toContainText(`Because you like ${favourites[0].entity.name}`);await expect(page.locator('.pf-mini-place').nth(1)).toContainText('Picked for your Passport');
});

test('Passport adds what you love while quiz changes live in settings', async ({ page }) => {
 await setup(page);
 await page.goto(base + '/passport');
 await expect(page.getByRole('button', { name: 'Redo the quiz', exact: true })).toHaveCount(0);
 await page.getByRole('button', { name: 'Add what you love', exact: true }).click();
 const editor = page.getByRole('dialog', { name: 'Add what you love', exact: true });
 await expect(editor).toBeVisible();
 await expect(editor.getByLabel('What kind of favourite?')).toBeVisible();
 await expect(editor.getByRole('button', { name: /quiz/i })).toHaveCount(0);
 await editor.getByRole('button', { name: 'Close editor', exact: true }).click();
 await page.getByRole('link', { name: 'Settings & privacy' }).first().click();
 await page.getByRole('button', { name: 'Redo the quiz', exact: true }).click();
 await expect(page.locator('.quiz-panel[open] .taste-quiz')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button', { name: 'Redo the quiz', exact: true })).toBeFocused();
});
