import {test,expect,type Page} from '@playwright/test';
import {worldFixtures} from './world-fixtures';
import {QUIZ_ORDER} from '../../src/lib/quiz-draft';
const base=process.env.MOTION_BASE_URL||'http://127.0.0.1:3220';
async function open(page:Page,step=1){
 await worldFixtures(page,false);await page.setViewportSize({width:384,height:854});
 await page.addInitScript(step=>localStorage.setItem('beesyde-quiz-draft-v1:guest',JSON.stringify({version:1,updatedAt:Date.now(),step,answers:{},history:{},extra:[]})),step);
 await page.goto(base+'/passport/settings');await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();await page.getByRole('button',{name:'Continue your quiz',exact:true}).click();
 await expect(page.locator('#quiz-title')).toHaveText(QUIZ_ORDER[step].title);
}
for(const mode of ['reduce','no-preference'] as const)test(`a new swipe card clears the previous decision text and overlay (${mode})`,async({page})=>{
 await page.emulateMedia({reducedMotion:mode});await open(page);
 await expect(page.locator('.taste-card h3')).toHaveText('Khruangbin');
 await page.getByRole('button',{name:'Yes',exact:true}).click();
 await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');
 await expect(page.locator('.taste-card>p')).toHaveText('Soul & jazz');
 await expect(page.locator('[data-drag-status]')).toHaveText('Drag right for yes, left for no');
 await expect(page.locator('.taste-card')).not.toHaveAttribute('data-intent',/yes|no/);
 await expect(page.locator('.taste-yes')).toHaveCSS('opacity','0');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.taste-card h3')).toHaveText('Khruangbin');
 await expect(page.locator('[data-drag-status]')).toHaveText('Drag right for yes, left for no');
});
test('automatic questions have no redundant Continue and scale choices are readable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const index=QUIZ_ORDER.findIndex(q=>q.kind==='slider');await open(page,index);
 await expect(page.getByRole('button',{name:'Continue',exact:true})).toHaveCount(0);
 for(const button of await page.locator('.taste-stops button').all()){
  expect(await button.evaluate(n=>parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(16);
  const b=await button.boundingBox();expect(b!.width).toBeGreaterThanOrEqual(200);expect(b!.height).toBeGreaterThanOrEqual(56);
 }
 await page.screenshot({path:'.private/s24-quiz/scale-384.png'});
});

test('Back keeps a completed answer editable without an automatic forward loop',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await open(page,0);for(let i=0;i<3;i++)await page.locator('.taste-tile').nth(i).click();
 await expect(page.locator('#quiz-title')).toHaveText(QUIZ_ORDER[1].title);await page.getByRole('button',{name:'Back',exact:true}).click();
 await expect(page.locator('.taste-tile[aria-pressed=true]')).toHaveCount(3);await expect(page.getByRole('button',{name:'Keep these answers',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Keep these answers',exact:true}).click();await expect(page.locator('#quiz-title')).toHaveText(QUIZ_ORDER[1].title);
});
test('an automatic answer resumes after the page returns to the foreground',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const index=QUIZ_ORDER.findIndex(q=>q.kind==='slider');await open(page,index);
 await page.clock.install();await page.locator('.taste-stops button').nth(2).click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.clock.runFor(2000);
 await expect(page.locator('#quiz-title')).toHaveText(QUIZ_ORDER[index].title);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.clock.runFor(1200);
 await expect(page.locator('#quiz-title')).toHaveText(QUIZ_ORDER[index+1].title);
});

test('swipe title and note stay inside the card above its controls on desktop',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await open(page);await page.setViewportSize({width:1280,height:720});
 await page.getByRole('button',{name:'Yes',exact:true}).click();await expect(page.locator('.taste-card h3')).toHaveText('Nina Simone');
 const card=await page.locator('.taste-card').boundingBox(),controls=await page.locator('.taste-deck-buttons').boundingBox();
 const note=await page.locator('.taste-card>p').boundingBox();expect(note!.y+note!.height).toBeLessThanOrEqual(card!.y+card!.height);expect(card!.y+card!.height).toBeLessThanOrEqual(controls!.y);
 await page.getByRole('button',{name:'No',exact:true}).click();await expect(page.locator('.taste-card h3')).toHaveText('Daft Punk');
});
