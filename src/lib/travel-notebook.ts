import {savedItemCity,type SavedList} from './saved.ts';
import type {TripOrder} from './travel-state.ts';
export type Notebook={name:string;exportedAt:string;places:{name:string;city:string|null;address:string|null;group:string}[]};
export function notebookSnapshot(list:SavedList,selected:string[],order?:TripOrder):Notebook{
 const allowed=new Set(selected);return {name:list.name,exportedAt:new Date().toISOString(),places:list.items.filter(i=>allowed.has(i.placeId)).slice(0,100).map(i=>({name:i.name,city:savedItemCity(i,list.name),address:i.address,group:order?.places.find(p=>p.id===i.placeId)?.group||''}))};
}
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function notebookHTML(value:Notebook){
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(value.name)} · Beesyde notebook</title><style>body{font:17px/1.5 system-ui,sans-serif;max-width:900px;margin:auto;padding:32px;color:#1e1630;background:#f8f8f9}h1,h2{color:#7e2b8f}li{break-inside:avoid;margin:24px 0;border-top:1px solid #ccc;padding-top:16px}small{display:block}button{padding:12px}@media print{button{display:none}body{background:white;padding:0}}</style><h1>${escape(value.name)}</h1><p>Beesyde travel notebook · Exported ${escape(new Date(value.exportedAt).toLocaleString('en-GB'))}</p><p>Hours, prices and availability are unverified. Confirm before you go. This is a snapshot, not a booking or offline navigation.</p><button onclick="window.print()">Print notebook</button><ol>${value.places.map(p=>`<li><h2>${escape(p.name)}</h2><p>${escape(p.group||'Ungrouped')}${p.city?' · '+escape(p.city):''}</p><p>${escape(p.address||'Address unavailable — check the place before going.')}</p></li>`).join('')}</ol><p>Private notes and visit feedback are excluded. No maps or venue images are included.</p></html>`;
}
