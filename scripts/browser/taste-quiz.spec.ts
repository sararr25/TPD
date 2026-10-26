import { test, expect, type Page } from '@playwright/test';
import { worldFixtures, favourites } from './world-fixtures';
import { QUESTIONS } from '../../src/lib/quiz';
const base = process.env.TPD_BROWSER_BASE || 'http://127.0.0.1:3107';
const ordered = [QUESTIONS.find(q => q.id === 'places')!, QUESTIONS.find(q => q.id === 'music')!, ...QUESTIONS.filter(q => !['places','music'].includes(q.id))];
async function open(page: Page) {
  await worldFixtures(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    (window as unknown as { audioTones: number }).audioTones = 0;
    class FakeAudio {
      state='running';currentTime=0;destination={};
      createOscillator(){return { type:'sine', frequency:{value:0}, connect(){},start(){(window as unknown as {audioTones:number}).audioTones++},stop(){} };}
      createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
      resume(){return Promise.resolve()}close(){return Promise.resolve()}
    }
    Object.defineProperty(window,'AudioContext',{value:FakeAudio,configurable:true});
  });
  await page.goto(base+'/passport');
  await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();
  await expect(page.locator('#quiz-title')).toBeFocused();
  await page.getByRole('button',{name:'Start my quiz'}).click();
  await expect(page.locator('#quiz-title')).toHaveText('Which would you walk into?');
}
async function inViewport(page:Page){
 const bad=await page.locator('.taste-quiz button:visible').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.top<0||r.bottom>innerHeight+.5||r.left<0||r.right>innerWidth+.5}).map(n=>n.textContent));
 expect(bad).toEqual([]);
 const clipped=await page.locator('.taste-body').evaluate(n=>n.scrollHeight>n.clientHeight+2);
 expect(clipped).toBe(false);
}
for(const size of [{width:320,height:568},{width:390,height:844},{width:812,height:375},{width:1440,height:900}]){
 test(`quiz controls fit ${size.width}x${size.height}`,async({page})=>{
  await page.setViewportSize(size);await open(page);await inViewport(page);await page.screenshot({path:`.private/taste-quiz/places-${size.width}.png`});
  await expect.poll(()=>page.locator('.taste-art').evaluateAll(imgs=>imgs.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
  await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue ↗',exact:true}).click();
  await expect(page.locator('#quiz-title')).toHaveText('Would this be on your trip playlist?');await inViewport(page);await page.screenshot({path:`.private/taste-quiz/music-${size.width}.png`});
 });
}
test('third selection advances; manual swipe feedback and undo are clear and silent',async({page})=>{
 await open(page);for(let i=0;i<3;i++)await page.locator('.taste-tile').nth(i).click();
 await expect(page.locator('#quiz-title')).toHaveText('Would this be on your trip playlist?');
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(2);
 const r=(await page.locator('.taste-card').boundingBox())!;await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+90,r.y+r.height/2,{steps:10});
 await expect(page.locator('[data-drag-status]')).toHaveText('YES · Keep — release to confirm');await page.mouse.up();
 await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.taste-card h3')).toHaveText('Khruangbin');
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(2);
 await page.locator('.taste-card').focus();await page.keyboard.press('ArrowLeft');await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');
});
test('full 18-question guest flow retains answers, retries save, and sounds only on successful result',async({page})=>{
 test.setTimeout(90000);await open(page);let attempts=0;
 await page.route('**/api/discovery',async route=>{if(route.request().postDataJSON().action!=='quiz')return route.fallback();attempts++;return attempts===1?route.fulfill({status:503,json:{error:'Fixture save unavailable'}}):route.fulfill({json:{choices:favourites}})});
 for(const q of ordered){
  await expect(page.locator('#quiz-title')).toHaveText(q.title);
  if(q.kind==='swipe'){
   for(let i=0;i<q.cards.length;i++){await expect(page.locator('.taste-card h3')).toHaveText(q.cards[i].label);await page.getByRole('button',{name:'Yes →',exact:true}).click();}
  }else if(q.kind==='slider'){await page.locator('.taste-stops button').nth(2).click();await page.getByRole('button',{name:'Continue ↗',exact:true}).click();}
  else {await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue ↗',exact:true}).click();}
 }
 await expect(page.locator('#quiz-title')).toHaveText('Your choices are ready.');
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(2);
 await page.getByRole('button',{name:'Build my Passport',exact:true}).click();await expect(page.locator('.taste-status')).toContainText('Try building');
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(2);
 await page.getByRole('button',{name:'Build my Passport',exact:true}).click();await expect(page.locator('.taste-quiz')).toHaveCount(0);
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(5);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('beesyde-quiz-v1')||'{}'));expect(Object.keys(saved)).toHaveLength(18);expect(saved.music).toHaveLength(4);expect(attempts).toBe(2);
});
test('mute and keyboard focus stay inside the quiz; Escape closes it',async({page})=>{
 await open(page);await page.getByRole('button',{name:'Sound on',exact:true}).click();
 await page.getByRole('button',{name:'Skip',exact:true}).focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('.taste-quiz')).toHaveCount(0);
});

test('skips lead to explicit favourites top-up; back keeps selections; all added art loads',async({page})=>{
 await open(page);await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue ↗',exact:true}).click();await page.getByRole('button',{name:'← Back',exact:true}).click();await expect(page.locator('.taste-tile').first()).toHaveAttribute('aria-pressed','true');
 for(const q of ordered){await expect(page.locator('#quiz-title')).toHaveText(q.title);await page.getByRole('button',{name:'Skip',exact:true}).click();}
 await expect(page.locator('#quiz-title')).toHaveText('Pick 3 more you’d give a try');
 await expect(page.getByRole('button',{name:'Build my Passport',exact:true})).toBeDisabled();
 for(let i=0;i<3;i++)await page.locator('.taste-topup button').nth(i).click();
 await expect(page.getByRole('button',{name:'Build my Passport',exact:true})).toBeEnabled();await inViewport(page);
});

test('native quiz dialog opens, closes and reopens without stale state',async({page})=>{
 await worldFixtures(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/');
 await page.getByRole('button',{name:'Make your Passport',exact:true}).first().click();
 await expect(page.locator('dialog[open] .taste-quiz')).toBeVisible();await page.getByRole('button',{name:'Start my quiz'}).click();await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);
 await page.getByRole('button',{name:'Make your Passport',exact:true}).first().click();await expect(page.getByRole('button',{name:'Start my quiz'})).toBeVisible();
});
