import {test,expect} from '@playwright/test';
import {worldFixtures} from './world-fixtures';
const base=process.env.MOTION_BASE_URL||'http://127.0.0.1:3220';
for(const reduced of [false,true])test(`theatre city settles, pauses and respects reduced motion (${reduced})`,async({page})=>{
 await worldFixtures(page,false);await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
 await page.goto(base+'/passport/settings');await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();await page.getByRole('button',{name:/Start my quiz/}).click();
 const scene=page.locator('.taste-stage-art'),piece=scene.locator('[data-scene-piece]').first(),dot=scene.locator('.taste-city-traveller');
 await expect(scene).toHaveAttribute('aria-hidden','true');
 await expect(piece).toHaveCSS('opacity','1');await expect(piece).toHaveCSS('transform','none');
 await page.locator('.taste-tile').first().click();
 if(reduced){await expect(dot).toHaveCSS('opacity','0');await expect(dot).toHaveCSS('transform','none');return;}
 await expect(dot).toHaveCSS('opacity','1');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const paused=await dot.evaluate(n=>getComputedStyle(n).transform);
 await page.waitForTimeout(250);expect(await dot.evaluate(n=>getComputedStyle(n).transform)).toBe(paused);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(()=>dot.evaluate(n=>getComputedStyle(n).transform)).not.toBe(paused);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(dot).toHaveCSS('opacity','0');
 await expect.poll(()=>dot.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).isIdentity)).toBe(true);
 const still=await dot.evaluate(n=>getComputedStyle(n).transform);await page.waitForTimeout(250);expect(await dot.evaluate(n=>getComputedStyle(n).transform)).toBe(still);
 await page.getByRole('button',{name:'Close quiz',exact:true}).click();await expect(scene).toHaveCount(0);
});
