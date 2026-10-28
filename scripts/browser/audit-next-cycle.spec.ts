import {test,expect,type Page} from '@playwright/test';
import {worldFixtures,place} from './world-fixtures';
import {twinFixtures,chooseReference,reference} from './twin-fixtures';
const base=process.env.MOTION_BASE_URL||'http://127.0.0.1:3220';
const names=['Carmo','A very long place name for an afternoon with Portuguese and Italian cooking',"Fama d’Alfama"];
async function comparison(page:Page){
 await worldFixtures(page,false);
 await page.route('**/api/discovery',route=>{
  if(route.request().postDataJSON().action!=='explore')return route.fallback();
  return route.fulfill({json:{results:names.map((name,i)=>({place:{...place,id:`00000000-0000-4000-8000-00000000002${i}`,name,address:i===2?null:'42 Fixture Avenue, Lisbon',price:i===2?null:2},token:'fixture'})),notice:'Popular picks, not yet shaped by your taste.',checkedAt:'2026-10-28T12:00:00Z'}});
 });
 await page.goto(base+'/lisbon');
 for(const name of names)await page.getByRole('button',{name:'Compare '+name,exact:true}).click();
 await page.getByRole('button',{name:'Compare places',exact:true}).click();
 return page.getByRole('dialog',{name:'Compare places',exact:true});
}
for(const width of [320,390,768,1440])test(`comparison C keeps names, prices and actions readable at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 const dialog=await comparison(page);await expect(dialog).toBeVisible();
 if(width<=720){
  await expect(dialog.getByRole('heading',{level:3})).toHaveCount(1);
  await expect(dialog.getByRole('list',{name:'Price overview'})).toContainText('Price unknown');
  for(let i=0;i<names.length;i++){
   await dialog.getByRole('button',{name:`Show place ${i+1}: ${names[i]}`,exact:true}).click();
   await expect(dialog.getByRole('button',{name:`Show place ${i+1}: ${names[i]}`,exact:true})).toHaveCSS('color','rgb(255, 255, 255)');
   const heading=dialog.getByRole('heading',{level:3,name:names[i],exact:true});await expect(heading).toBeFocused();
   await expect(dialog.getByRole('button',{name:'Save',exact:true})).toHaveCount(1);
  }
 }else await expect(dialog.getByRole('heading',{level:3})).toHaveCount(3);
 expect(await dialog.evaluate(n=>n.scrollWidth<=n.clientWidth)).toBe(true);
 await page.screenshot({path:`.private/audit-next/comparison-C-${width}.png`});
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Compare places',exact:true})).toBeFocused();
});
test('comparison can minimize across navigation and clear without changing Passport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 const dialog=await comparison(page);await dialog.getByRole('button',{name:'Close comparison'}).click();
 const before=await page.evaluate(()=>localStorage.getItem('tpd-passport-v2'));
 await page.getByRole('button',{name:'Minimize comparison'}).click();
 await expect(page.getByRole('button',{name:'Compare places',exact:true})).not.toBeVisible();
 await page.getByRole('navigation',{name:'Main (mobile)',exact:true}).getByRole('link',{name:'Passport',exact:true}).click();
 await expect(page.locator('.comparison-selected-names')).toContainText(names[0]);
 await page.getByRole('button',{name:'Expand comparison'}).click();await page.getByRole('button',{name:'Clear comparison'}).click();
 await expect(page.getByRole('status').filter({hasText:'Comparison cleared.'})).toBeFocused();
 expect(await page.evaluate(()=>localStorage.getItem('tpd-passport-v2'))).toBe(before);
});
test('City exposes all categories and the first place name above mobile navigation',async({page})=>{
 await worldFixtures(page,false);await page.addInitScript(()=>{localStorage.removeItem('tpd-passport-v2');localStorage.removeItem('beesyde-quiz-v1');});
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'/lisbon');const title=page.locator('.place-card h3').first();await expect(title).toBeVisible();
 const bar=await page.getByRole('navigation',{name:'Main (mobile)',exact:true}).boundingBox();
 const heading=await title.boundingBox();expect(heading!.y+heading!.height).toBeLessThanOrEqual(bar!.y);
 const group=page.getByRole('group',{name:'Category',exact:true});expect(await group.evaluate(n=>n.scrollWidth<=n.clientWidth)).toBe(true);
 for(const name of ['Restaurants','Bars','Cafés','Museums','Hotels','Neighbourhoods'])await expect(group.getByRole('button',{name,exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Explore the Paris events pilot'})).toHaveCount(0);
 await page.screenshot({path:'.private/audit-next/city-first-place-390.png'});
});
test('Twin phases and changing the reference preserve per-search choices deliberately',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const requests=await twinFixtures(page);await page.emulateMedia({reducedMotion:'reduce'});await chooseReference(page,base);
 await expect(page.locator('.twin-steps [aria-current=step]')).toHaveText('2 Preferences');
 await expect(page.getByRole('button',{name:'Search',exact:true})).not.toBeVisible();
 await page.getByRole('button',{name:'Keep: Quiet',exact:true}).click();
 await page.getByRole('button',{name:'Change starting place',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'The restaurant you wanted'})).toBeFocused();
 await page.getByRole('button',{name:'Keep this starting place',exact:true}).click();
 await expect(page.getByRole('button',{name:'Change starting place',exact:true})).toBeFocused();
 await expect(page.getByRole('button',{name:'Keep: Quiet',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(requests.filter(r=>r.action==='swap')).toHaveLength(0);
 await page.getByRole('button',{name:'Find its twin',exact:true}).click();await expect(page.locator('.twin-outcome')).toContainText('3 matches found');
 await expect(page.locator('.twin-steps [aria-current=step]')).toHaveText('3 Matches');
 const photo=await page.locator('.twin-spotlight .place-photo').boundingBox();expect(photo!.height).toBeLessThanOrEqual(100);
});
test('display tags reduce repetition without altering filter identifiers',async({page})=>{
 await worldFixtures(page,false);await page.route('**/api/discovery',route=>{
  if(route.request().postDataJSON().action!=='explore')return route.fallback();
  return route.fulfill({json:{results:[{place:{...place,tags:[{id:'urn:tag:cuisine:qloo:seafood',type:'urn:tag:cuisine:qloo',name:'Seafood'},{id:'urn:tag:specialty_dish:place:fresh_seafood',type:'urn:tag:specialty_dish:place',name:'Fresh seafood'},{id:'urn:tag:ambience:qloo:casual',type:'urn:tag:ambience:qloo',name:'Casual'}]},token:'fixture'}],notice:'Fixture',checkedAt:'2026-10-28T12:00:00Z'}});
 });await page.goto(base+'/lisbon');
 await expect(page.locator('.place-chips').first()).toContainText('Seafood');await expect(page.locator('.place-chips').first()).not.toContainText('Fresh seafood');
 await expect(page.locator('.place-location').first()).toHaveText('Fixture street, Lisbon');
 await expect(page.locator('.place-why')).toHaveCount(0);
 await expect(page.getByRole('combobox',{name:'Food & atmosphere'}).getByRole('option',{name:'Seafood',exact:true})).toHaveAttribute('value','urn:tag:cuisine:qloo:seafood');
});
test('resume sits at the opening line and compare demonstration has one initial action',async({page})=>{
 const requests:string[]=[];await worldFixtures(page,false);await page.addInitScript(()=>localStorage.setItem('beesyde-search-v1:guest',JSON.stringify({version:1,at:Date.now(),city:'Lisbon',category:'restaurant',reference:{id:'fixture',name:'The last starting place'},choices:[],budget:''})));
 await page.route('**/api/discovery',route=>{requests.push(route.request().postDataJSON().action);return route.fallback();});
 await page.goto(base+'/');await expect(page.locator('.h-opening-line').getByRole('link',{name:'Resume search'})).toBeVisible();await expect(page.locator('.h-resume-counts')).toHaveText('0 preferences · 0 exclusions');expect(requests).not.toContain('swap');
 await page.goto(base+'/compare');await expect(page.getByRole('button',{name:'Compare',exact:true})).toHaveCount(1);
});
test('storage status distinguishes local visited cities from account data',async({page})=>{
 await worldFixtures(page,false);await page.goto(base+'/passport/settings');
 await expect(page.locator('.storage-status')).toContainText('Visited-city choices stay on this browser only.');
 await expect(page.locator('.storage-status')).toContainText('Kept on this browser only.');
});
test('two map pins can be read without leaving Map, with close and return context',async({page})=>{
 await worldFixtures(page,false);await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('https://tiles.openfreemap.org/**',route=>route.fulfill({json:{version:8,sources:{},layers:[]}}));
 await page.route('**/api/discovery',route=>route.request().postDataJSON().action==='explore'?route.fulfill({json:{results:[0,1].map(i=>({place:{...place,id:`00000000-0000-4000-8000-00000000009${i}`,name:`Map place ${i+1}`,lat:38.7+i*.04,lon:-9.1-i*.04},token:'fixture'})),notice:'Fixture',checkedAt:'2026-10-28T12:00:00Z'}}):route.fallback());
 await page.goto(base+'/lisbon');await page.getByRole('button',{name:'Map',exact:true}).click();
 const preview=page.getByRole('region',{name:'Selected map place'});
 for(const i of [1,2]){
  await page.getByRole('button',{name:`${i}. Map place ${i}`,exact:true}).click();
  await expect(preview.getByRole('heading',{name:`Map place ${i}`,exact:true})).toBeFocused();
  await expect(page.getByRole('button',{name:'Map',exact:true})).toHaveAttribute('aria-pressed','true');
 }
 const href=await preview.getByRole('link',{name:'Open place',exact:true}).getAttribute('href');
 expect(new URLSearchParams(href!.split('?')[1]).get('returnTo')).toContain('view=map');
 expect(new URLSearchParams(href!.split('?')[1]).get('returnTo')).toContain('map-place=');
 await page.keyboard.press('Escape');await expect(preview).not.toBeVisible();await expect(page.getByRole('button',{name:'2. Map place 2',exact:true})).toBeFocused();
});
test('an offscreen map defers initialisation and keyboard focus activates it',async({page})=>{
 await worldFixtures(page,false);await page.setViewportSize({width:1440,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{window.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}takeRecords(){return []}root=null;rootMargin='0px';thresholds=[];} as unknown as typeof IntersectionObserver;});
 await page.route('https://tiles.openfreemap.org/**',route=>route.fulfill({json:{version:8,sources:{},layers:[]}}));
 await page.route('**/api/discovery',route=>route.request().postDataJSON().action==='explore'?route.fulfill({json:{results:[{place:{...place,lat:38.7,lon:-9.1},token:'fixture'}],notice:'Fixture',checkedAt:'2026-10-28T12:00:00Z'}}):route.fallback());
 await page.goto(base+'/lisbon');const map=page.getByRole('region',{name:'Map of these places',exact:true});await expect(map).toBeVisible();
 await expect(map.locator('.maplibregl-canvas')).toHaveCount(0);await map.focus();await expect(map.locator('.maplibregl-canvas')).toHaveCount(1);
});

test('signed-in storage reports disabled visited sync and failed Passport reads honestly',async({page})=>{
 await worldFixtures(page,false);
 await page.route('**/api/auth/**',r=>r.fulfill({json:{session:{id:'fixture',userId:'storage-owner',expiresAt:'2099-01-01'},user:{id:'storage-owner',name:'Visitor',email:'fixture@example.invalid'}}}));
 await page.route('**/api/passport',r=>r.fulfill({status:503,json:{error:'Fixture unavailable'}}));
 await page.route('**/api/visited-cities',r=>r.fulfill({json:{cities:[],syncAvailable:false}}));
 await page.goto(base+'/passport/settings');
 await expect(page.locator('.storage-status')).toContainText('Account sync for visited cities is not enabled yet.');
 await expect(page.locator('.storage-status')).toContainText('Account storage could not be confirmed.');
 await expect(page.locator('.storage-status')).not.toContainText('Your Passport was loaded from your account.');
});

test('comparison C keeps its selected name and actions reachable with doubled text',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});
 const dialog=await comparison(page);await dialog.getByRole('button',{name:`Show place 2: ${names[1]}`,exact:true}).click();
 await page.evaluate(()=>{document.querySelectorAll('dialog *').forEach(node=>{const el=node as HTMLElement;el.style.fontSize=`${parseFloat(getComputedStyle(el).fontSize)*2}px`;});});
 expect(await dialog.evaluate(n=>n.scrollWidth<=n.clientWidth)).toBe(true);
 await expect(dialog.getByRole('heading',{name:names[1],exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'Save',exact:true}).scrollIntoViewIfNeeded();
 await expect(dialog.getByRole('button',{name:'Save',exact:true})).toBeInViewport();
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});

test('choosing another reference preserves shared Keep and Delete choices',async({page})=>{
 await twinFixtures(page);await chooseReference(page,base);
 await page.getByRole('button',{name:'Keep: Quiet',exact:true}).click();await page.getByRole('button',{name:'Delete: Casual',exact:true}).click();
 await page.getByRole('button',{name:'Change starting place',exact:true}).click();
 const next={...reference,id:'00000000-0000-4000-8000-000000000099',name:'A different starting place',tags:reference.tags.slice(0,3)};
 await page.route('**/api/discovery',r=>r.request().postDataJSON().action==='search'?r.fulfill({json:{choices:[{entity:next,token:'new-fixture'}]}}):r.fallback());
 await page.getByRole('textbox',{name:'The restaurant you wanted'}).fill(next.name);await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('button',{name:'Choose',exact:true}).click();
 await expect(page.getByRole('button',{name:'Keep: Quiet',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'Delete: Casual',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'Ignore: Outdoor',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'Keep: Natural wine',exact:true})).toHaveCount(0);
});

test('delayed longest resume name cannot move the Home book',async({page})=>{
 await worldFixtures(page,false);await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>localStorage.setItem('beesyde-search-v1:guest',JSON.stringify({version:1,at:Date.now(),city:'Lisbon',category:'restaurant',reference:{id:'fixture',name:'A very long restaurant name with seafood Portuguese cuisine and an exceptionally memorable evening '.repeat(2).slice(0,200)},choices:Array.from({length:6},(_,i)=>({tagId:'fixture:'+i,mode:i<3?'keep':'change'})),budget:''})));
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});await page.route('**/api/auth/**',async r=>{await gate;await r.fulfill({json:null});});
 await page.goto(base+'/');const book=page.locator('.h-hero');await expect(book).toBeVisible();await page.evaluate(()=>document.fonts.ready);const before=await book.boundingBox();release();
 await expect(page.getByRole('link',{name:'Resume search',exact:true})).toBeVisible();await expect(page.locator('.h-resume-counts')).toHaveText('3 preferences · 3 exclusions');
 await expect(page.locator('.h-resume-entry strong')).toHaveText(/^Lisbon · /);const after=await book.boundingBox();expect(Math.abs(after!.y-before!.y)).toBeLessThanOrEqual(1);
});
