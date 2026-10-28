import {test,expect} from '@playwright/test';
import {worldFixtures} from './world-fixtures';
const base=process.env.MOTION_BASE_URL||'http://127.0.0.1:3220';
const logo='<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect x="1" y="1" width="398" height="398" fill="white" stroke="#1e1630" stroke-width="12"/><text x="200" y="210" text-anchor="middle" font-size="40">Fixture mark</text></svg>';
test('provider images remain whole on list, Saved and Place, with city fallback distinct',async({page})=>{
 await worldFixtures(page);await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://images.qloo.com/**',r=>r.fulfill({contentType:'image/svg+xml',body:logo}));
 await page.goto(base+'/lisbon');const card=page.locator('.place-photo img').first();await expect(card).toBeVisible();await expect(card).toHaveCSS('object-fit','contain');const src=await card.getAttribute('src');await page.screenshot({path:'.private/open-tickets/whole-image-city.png'});
 await page.getByRole('navigation',{name:'Main (mobile)',exact:true}).getByRole('link',{name:'Saved',exact:true}).click();const saved=page.locator('.saved-place-photo img').first();await expect(saved).toHaveAttribute('src',src!);await expect(saved).toHaveCSS('object-fit','contain');
 if(!process.env.PASSPORT_PRODUCTION){
  await page.goto(base+'/preview/checks?photo=known');const detail=page.locator('.place-hero img:visible');await expect(detail).toHaveCount(1);await expect(detail).toHaveCSS('object-fit','contain');await expect(detail).toHaveAttribute('src',src!);
 }
 await page.route('https://images.qloo.com/**',r=>r.abort());await page.goto(base+'/lisbon');await expect(page.locator('.photo-caption').first()).toContainText('city photo');await expect(page.locator('.place-photo img').first()).toHaveCSS('object-fit','cover');
});

test('a pointer on the contained image reaches the place link',async({page})=>{
 await worldFixtures(page,false);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/lisbon');
 const photo=page.locator('.place-photo').first();await photo.scrollIntoViewIfNeeded();
 const link=photo.locator('a');const href=await link.getAttribute('href');
 await link.evaluate(anchor=>anchor.addEventListener('click',event=>{event.preventDefault();(window as unknown as {clickedPhoto:string}).clickedPhoto=(anchor as HTMLAnchorElement).getAttribute('href')||'';},{once:true}));
 const box=await photo.boundingBox();await page.mouse.click(box!.x+box!.width/2,box!.y+box!.height/2);
 expect(await page.evaluate(()=>(window as unknown as {clickedPhoto?:string}).clickedPhoto)).toBe(href);
});
