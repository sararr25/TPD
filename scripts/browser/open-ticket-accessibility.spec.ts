import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {worldFixtures,place} from './world-fixtures';
const base=process.env.MOTION_BASE_URL||'http://127.0.0.1:3220';
async function audit(page:Page){
 await page.evaluate(()=>document.fonts.ready);
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
}
for(const path of ['/','/lisbon','/passport','/passport/settings','/collections'])test(`automated accessibility support ${path}`,async({page})=>{
 await worldFixtures(page);await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+path);await expect(page.locator('main h1').first()).toBeVisible();
 if(path==='/lisbon')await expect(page.locator('.place-card h3').first()).toBeVisible();
 await audit(page);
});
test('automatic quiz and Save dialogs have accessible structure',async({page})=>{
 await worldFixtures(page,false);await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'/passport/settings');await page.getByRole('button',{name:'Redo the quiz',exact:true}).click();await page.getByRole('button',{name:'Start my quiz',exact:false}).click();await audit(page);await page.keyboard.press('Escape');
 await page.goto(base+'/lisbon');await page.getByRole('button',{name:/^Save /}).first().click();await page.getByRole('button',{name:/^Saved /}).first().click();await expect(page.getByRole('dialog',{name:/^Save /})).toBeVisible();await audit(page);
});

test('comparison C passes automated accessibility with long names and unknown values',async({page})=>{
 await worldFixtures(page,false);await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/api/discovery',r=>r.request().postDataJSON().action==='explore'?r.fulfill({json:{results:[0,1].map(i=>({place:{...place,id:`00000000-0000-4000-8000-00000000009${i}`,name:`Long comparison fixture place ${i}`,price:i?null:2},token:'fixture'})),notice:'Fixture',checkedAt:'2026-10-28T12:00:00Z'}}):r.fallback());
 await page.goto(base+'/lisbon');for(const n of [0,1])await page.getByRole('button',{name:`Compare Long comparison fixture place ${n}`,exact:true}).click();await page.getByRole('button',{name:'Compare places',exact:true}).click();await expect(page.getByRole('dialog',{name:'Compare places',exact:true})).toBeVisible();await audit(page);
});
test('City tabs expose one selected state and follow arrow-key navigation',async({page})=>{
 await worldFixtures(page,false);await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/lisbon');
 const first=page.getByRole('tab',{name:'For you',exact:true}),twin=page.getByRole('tab',{name:'Twin',exact:true});
 await first.focus();await page.keyboard.press('ArrowRight');await expect(twin).toBeFocused();await expect(twin).toHaveAttribute('aria-selected','true');await expect(first).toHaveAttribute('tabindex','-1');
 await page.keyboard.press('Home');await expect(first).toBeFocused();await expect(first).toHaveAttribute('aria-selected','true');await expect(first).not.toHaveAttribute('aria-pressed');
});
test('Save controls remain reachable inside a short viewport without background scrolling',async({page})=>{
 await worldFixtures(page);await page.setViewportSize({width:390,height:360});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/lisbon');
 await page.getByRole('button',{name:/^Saved A small fixture/}).click();const dialog=page.getByRole('dialog',{name:/^Save A small fixture/});await dialog.getByText(/^(Add a note|Edit note)$/).click();
 const background=await page.evaluate(()=>scrollY);
 // Native dialog tabbing may visit browser chrome (reported as body), but no page control outside the modal.
 for(let i=0;i<15;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement===document.body||!!document.activeElement?.closest('dialog[open]'))).toBe(true);}
 const close=dialog.getByRole('button',{name:'Close saved place panel'});await close.scrollIntoViewIfNeeded();await expect(close).toBeInViewport();expect(await page.evaluate(()=>scrollY)).toBe(background);
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(page.getByRole('button',{name:/^Saved A small fixture/})).toBeFocused();
});
