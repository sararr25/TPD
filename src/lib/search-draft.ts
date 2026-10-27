import {CITIES,placeCategory,type Choice,type PlaceCategory} from './discovery.ts';
export type SearchDraft={version:1;at:number;city:string;category:PlaceCategory;reference:{id:string;name:string};choices:Choice[];budget:string};
export const searchKey=(owner:string)=>`beesyde-search-v1:${owner}`;
// Never retain signed tokens or old results. Resume must resolve the place again.
export function parseSearch(raw:string|null):SearchDraft|null{
 try{const v=JSON.parse(raw||'null');if(!v||v.version!==1||!Number.isFinite(v.at)||Date.now()-v.at>7*86400000||v.at>Date.now()+60000||!Object.hasOwn(CITIES,v.city)||!placeCategory(v.category)||typeof v.reference?.id!=='string'||v.reference.id.length>200||typeof v.reference.name!=='string'||!v.reference.name.trim()||v.reference.name.length>200||!Array.isArray(v.choices)||v.choices.length>6||!['','1','2','3','4'].includes(v.budget))return null;
 const choices=v.choices.filter((c:Choice)=>typeof c?.tagId==='string'&&c.tagId.length<=160&&['keep','change','ignore'].includes(c.mode));if(choices.length!==v.choices.length)return null;
 return{version:1,at:v.at,city:v.city,category:v.category,reference:{id:v.reference.id,name:v.reference.name},choices,budget:v.budget};}catch{return null;}
}
