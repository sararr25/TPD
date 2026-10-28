import { test, expect, type Page } from '@playwright/test';
import { worldFixtures, favourites } from './world-fixtures';
import { QUESTIONS } from '../../src/lib/quiz';
const base = process.env.TPD_BROWSER_BASE || process.env.MOTION_BASE_URL || 'http://127.0.0.1:3000';
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
  await page.goto(base+'/passport/settings');
  await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();
  await expect(page.locator('#quiz-title')).toBeFocused();
  await page.getByRole('button',{name:'Start my quiz'}).click();
  await expect(page.locator('#quiz-title')).toHaveText('Which would you walk into?');
}
async function inViewport(page:Page){
 const readingArea=page.locator('.taste-body');
 const scrollable=await readingArea.evaluate(n=>['auto','scroll'].includes(getComputedStyle(n).overflowY));
 if(scrollable){
  // Short screens deliberately scroll the reading area; each answer must be reachable.
  for(const button of await readingArea.locator('button:visible').all()){
   await button.scrollIntoViewIfNeeded();
   expect(await button.evaluate(n=>{const r=n.getBoundingClientRect(),p=n.closest('.taste-body')!.getBoundingClientRect();return r.top>=p.top-.5&&r.bottom<=p.bottom+.5&&r.left>=0&&r.right<=innerWidth;})).toBe(true);
  }
  const fixed=await page.locator('.taste-top button:visible,.taste-nav button:visible').evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+.5&&r.left>=0&&r.right<=innerWidth+.5;}));
  expect(fixed).toBe(true);
  return;
 }
 const bad=await page.locator('.taste-quiz button:visible').evaluateAll(nodes=>nodes.filter(n=>{const r=n.getBoundingClientRect();return r.top<0||r.bottom>innerHeight+.5||r.left<0||r.right>innerWidth+.5}).map(n=>n.textContent));
 expect(bad).toEqual([]);
 const clipped=await page.locator('.taste-body').evaluate(n=>n.scrollHeight>n.clientHeight+2);
 expect(clipped).toBe(false);
}
for(const size of [{width:320,height:568},{width:390,height:844},{width:812,height:375},{width:1440,height:900}]){
 test(`quiz controls fit ${size.width}x${size.height}`,async({page})=>{
  await page.setViewportSize(size);await open(page);await inViewport(page);await page.screenshot({path:`.private/taste-quiz/places-${size.width}.png`});
  await expect.poll(()=>page.locator('.taste-art').evaluateAll(imgs=>imgs.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
  await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.locator('#quiz-title')).toHaveText('Would this be on your trip playlist?');await inViewport(page);await page.screenshot({path:`.private/taste-quiz/music-${size.width}.png`});
 });
}
test('multiple selections await Continue; manual swipe feedback and undo are clear and silent',async({page})=>{
 await open(page);for(let i=0;i<3;i++)await page.locator('.taste-tile').nth(i).click();
 await page.waitForTimeout(1200);
 await expect(page.locator('#quiz-title')).toHaveText('Which would you walk into?');
 await expect(page.locator('.taste-tile[aria-pressed=true]')).toHaveCount(3);
 await page.getByRole('button',{name:'Continue',exact:true}).click();
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
   for(let i=0;i<q.cards.length;i++){await expect(page.locator('.taste-card h3')).toHaveText(q.cards[i].label);await page.getByRole('button',{name:'Yes',exact:true}).click();}
  }else if(q.kind==='slider'){await page.locator('.taste-stops button').nth(2).click();await page.getByRole('button',{name:'Continue',exact:true}).click();}
  else {await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue',exact:true}).click();}
 }
 await expect(page.locator('#quiz-title')).toHaveText('Your choices are ready.');
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(2);
 await page.getByRole('button',{name:'Build my Passport',exact:true}).click();await expect(page.locator('.taste-status')).toContainText('Try building');
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(2);
 await page.getByRole('button',{name:'Build my Passport',exact:true}).click();await expect(page.locator('.taste-quiz')).toHaveCount(0);
 expect(await page.evaluate(()=>(window as unknown as {audioTones:number}).audioTones)).toBe(5);await expect(page.getByRole('heading',{name:'Your Passport is ready.',exact:true})).toBeFocused();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('beesyde-quiz-v1')||'{}'));expect(Object.keys(saved)).toHaveLength(18);expect(saved.music).toHaveLength(4);expect(attempts).toBe(2);
});
test('mute and keyboard focus stay inside the quiz; Escape closes it',async({page})=>{
 await open(page);await page.getByRole('button',{name:'Sound on',exact:true}).click();
 await page.getByRole('button',{name:'Skip',exact:true}).focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('.taste-quiz')).toHaveCount(0);
});

test('skips lead to explicit favourites top-up; back keeps selections; all added art loads',async({page})=>{
 await open(page);await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Back',exact:true}).click();await expect(page.locator('.taste-tile').first()).toHaveAttribute('aria-pressed','true');
 for(const q of ordered){await expect(page.locator('#quiz-title')).toHaveText(q.title);await page.getByRole('button',{name:'Skip',exact:true}).click();}
 await expect(page.locator('#quiz-title')).toHaveText('Choose 3 favourites to finish');
 await expect(page.getByRole('button',{name:'Build my Passport',exact:true})).toBeDisabled();
 for(let i=0;i<3;i++) {
  await page.locator('.taste-topup button').nth(i).click();
  await expect(page.locator('#quiz-title')).toHaveText(i===2?'Your choices are ready.':`${2-i} more to go`);
  await expect(page.getByText(`${i+1} of 5 selected`,{exact:true})).toBeVisible();
 }
 await expect(page.getByRole('button',{name:'Build my Passport',exact:true})).toBeEnabled();await inViewport(page);
 await page.locator('.taste-topup button').nth(1).click();
 await expect(page.locator('#quiz-title')).toHaveText('1 more to go');
 await expect(page.getByRole('button',{name:'Build my Passport',exact:true})).toBeDisabled();
});

test('native quiz dialog resumes a draft and restarts only deliberately',async({page})=>{
 await worldFixtures(page);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/');
 await page.getByRole('button',{name:'Make your Passport',exact:true}).first().click();
 await expect(page.locator('dialog[open] .taste-quiz')).toBeVisible();await page.getByRole('button',{name:'Start my quiz'}).click();await page.keyboard.press('Escape');await expect(page.locator('dialog[open]')).toHaveCount(0);
 await page.getByRole('button',{name:'Make your Passport',exact:true}).first().click();
 await expect(page.getByRole('button',{name:'Continue your quiz',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Start again',exact:true}).click();
 await expect(page.locator('#quiz-title')).toHaveText('Which would you walk into?');
});

test('first Passport quiz uses the shared modal and returns focus after Escape',async({page})=>{
 await worldFixtures(page);await page.addInitScript(()=>{localStorage.removeItem('beesyde-quiz-v1');localStorage.removeItem('tpd-passport-v2');});
 await page.goto(base+'/passport');const trigger=page.getByRole('button',{name:'Make your Passport',exact:true});await trigger.click();
 const dialog=page.getByRole('dialog',{name:'Make your Passport',exact:true});await expect(dialog).toBeVisible();
 await page.locator('.site-header .brand').evaluate((node:HTMLElement)=>node.focus());
 await expect(page.locator('#quiz-title')).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
});

test('draft survives refresh with selections and mute; successful completion removes it',async({page})=>{
 await open(page);await page.getByRole('button',{name:'Sound on',exact:true}).click();await page.locator('.taste-tile').first().click();
 await page.reload();await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();
 await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();await page.getByRole('button',{name:'Continue your quiz',exact:true}).click();
 await expect(page.locator('.taste-tile').first()).toHaveAttribute('aria-pressed','true');
 await page.route('**/api/discovery',async route=>route.request().postDataJSON().action==='quiz'?route.fulfill({json:{choices:favourites}}):route.fallback());
 for(const q of ordered){await expect(page.locator('#quiz-title')).toHaveText(q.title);await page.getByRole('button',{name:'Skip',exact:true}).click();}
 for(let i=0;i<3;i++)await page.locator('.taste-topup button').nth(i).click();
 await page.getByRole('button',{name:'Build my Passport',exact:true}).click();await expect(page.getByRole('heading',{name:'Your Passport is ready.'})).toBeVisible();
 await page.getByRole('button',{name:'Back to where I was',exact:true}).click();await page.getByRole('button',{name:/^(Redo|Take) the quiz$/}).click();
 await expect(page.getByRole('button',{name:'Continue your quiz',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Start my quiz'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();
});

test('top-up favourites remain unique after Back revises a music answer',async({page})=>{
 test.setTimeout(60000);await open(page);
 let submitted:string[]=[];
 await page.route('**/api/discovery',async route=>{const body=route.request().postDataJSON();if(body.action!=='quiz')return route.fallback();submitted=body.cards;return route.fulfill({json:{choices:favourites}})});
 for(const q of ordered){await expect(page.locator('#quiz-title')).toHaveText(q.title);await page.getByRole('button',{name:'Skip',exact:true}).click();}
 for(let i=0;i<3;i++)await page.locator('.taste-topup button').nth(i).click();
 for(let i=18;i>1;i--)await page.getByRole('button',{name:'Back',exact:true}).click();
 await expect(page.locator('#quiz-title')).toHaveText('Would this be on your trip playlist?');await page.getByRole('button',{name:'Yes',exact:true}).click();await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');await page.getByRole('button',{name:'Continue',exact:true}).click();
 for(const q of ordered.slice(2)){await expect(page.locator('#quiz-title')).toHaveText(q.title);await page.getByRole('button',{name:'Skip',exact:true}).click();}
 await page.getByRole('button',{name:'Build my Passport',exact:true}).click();await expect(page.locator('.taste-quiz')).toHaveCount(0);expect(submitted.length).toBe(3);expect(new Set(submitted).size).toBe(3);
});

test('Skip cannot reset a deck during its animated exit; runtime reduced motion clears transforms',async({page})=>{
 await open(page);await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{const root=document.querySelector('.taste-quiz')!;const buttons=[...root.querySelectorAll('button')];buttons.find(b=>b.textContent?.trim()==='Yes')!.click();buttons.find(b=>b.textContent==='Skip')!.click()});
 await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');await expect(page.locator('#quiz-title')).toHaveText('Would this be on your trip playlist?');
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.locator('.taste-body').evaluate(el=>getComputedStyle(el).transform)).toBe('none');await expect(page.locator('.taste-card')).toHaveCSS('transform','none');
});

test('resuming a swipe retains the next card and Undo history',async({page})=>{
 await open(page);await page.locator('.taste-tile').first().click();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByRole('button',{name:'Yes',exact:true}).click();await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();await page.getByRole('button',{name:'Continue your quiz',exact:true}).click();
 await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.taste-card h3')).toHaveText('Khruangbin');
});

test('deleting a local Passport also removes its unfinished quiz',async({page})=>{
 await open(page);await page.locator('.taste-tile').first().click();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Delete my local Passport',exact:true}).click();await page.getByRole('button',{name:'Delete Passport',exact:true}).click();
 await page.getByRole('button',{name:'Take the quiz',exact:true}).click();await expect(page.getByRole('button',{name:'Continue your quiz',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Start my quiz'})).toBeVisible();
});

for(const invalid of ['different owner','expired','malformed']) test(`quiz ignores a ${invalid} draft`,async({page})=>{
 await worldFixtures(page);
 await page.addInitScript(invalid=>{
  const value={version:1,updatedAt:invalid==='expired'?0:Date.now(),step:1,answers:{places:['bookstore']},history:{},extra:[]};
  localStorage.setItem(`beesyde-quiz-draft-v1:${invalid==='different owner'?'another-owner':'guest'}`,invalid==='malformed'?'{broken':JSON.stringify(value));
 },invalid);
 await page.goto(base+'/passport/settings');await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();
 await expect(page.getByRole('button',{name:'Continue your quiz',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Start my quiz'})).toBeVisible();
});

test('storage failure is explained while current answers remain usable',async({page})=>{
 await open(page);await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Storage blocked','QuotaExceededError');};});
 await page.locator('.taste-tile').first().click();await expect(page.locator('.taste-status')).toContainText('Progress can’t be saved on this browser');
 await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.locator('#quiz-title')).toHaveText('Would this be on your trip playlist?');
});

test('top-up draft resumes on a small phone with selections and accurate count',async({page})=>{
 await page.setViewportSize({width:320,height:568});await open(page);
 for(const q of ordered){await expect(page.locator('#quiz-title')).toHaveText(q.title);await page.getByRole('button',{name:'Skip',exact:true}).click();}
 for(let i=0;i<3;i++)await page.locator('.taste-topup button').nth(i).click();await inViewport(page);
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();
 await page.screenshot({path:'.private/taste-quiz/resume-320.png'});await page.getByRole('button',{name:'Continue your quiz',exact:true}).click();
 await expect(page.locator('.taste-topup [aria-pressed=true]')).toHaveCount(3);await expect(page.locator('#quiz-title')).toHaveText('Your choices are ready.');
 await expect(page.getByText('3 of 5 selected',{exact:true})).toBeVisible();await inViewport(page);
 await page.screenshot({path:'.private/taste-quiz/topup-320.png'});
});

test('account drafts remain separate and can only be resumed by their owner',async({page})=>{
 await worldFixtures(page);let owner='draft-owner-one';
 await page.route('**/api/auth/**',route=>route.fulfill({json:{session:{id:'fixture',userId:owner,expiresAt:'2099-01-01'},user:{id:owner,name:'Fixture visitor',email:'test@example.invalid'}}}));
 await page.route('**/api/passport',route=>route.fulfill({json:{passport:favourites}}));
 await page.route('**/api/quiz',route=>route.fulfill({json:{answers:{planning:2}}}));
 await page.goto(base+'/passport/settings');await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();await page.getByRole('button',{name:'Start my quiz'}).click();
 await page.locator('.taste-tile').first().click();await page.keyboard.press('Escape');
 owner='draft-owner-two';await page.reload();await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();
 await expect(page.getByRole('button',{name:'Continue your quiz',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Start my quiz'})).toBeVisible();await page.keyboard.press('Escape');
 owner='draft-owner-one';await page.reload();await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();await page.getByRole('button',{name:'Continue your quiz',exact:true}).click();
 await expect(page.locator('.taste-tile').first()).toHaveAttribute('aria-pressed','true');
});
