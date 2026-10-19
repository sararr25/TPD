// Targeted follow-up; requires access probe. No credentials or raw responses are logged.
import { loadEnvFile } from 'node:process';
import { readFile,writeFile } from 'node:fs/promises';
try{loadEnvFile('.env.local')}catch{}
const base=process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com';
if(base.replace(/\/$/,'')!=='https://hackathon.api.qloo.com'||!process.env.QLOO_API_KEY)throw Error('Configure the approved Qloo environment.');
const search=JSON.parse(await readFile('.private/qloo/search-restaurant.json','utf8'));
const entities=Array.isArray(search.results)?search.results:search.results?.entities;
// Use only an unambiguous name match from the specific reference search.
const seed=entities?.find(e=>e.name?.toLowerCase()==='le baratin');
if(!seed?.entity_id)throw Error('Reference needs manual resolution; no automatic first-result selection.');
const baseline={'filter.type':'urn:entity:place','signal.interests.entities':seed.entity_id,'filter.location.query':'Paris','filter.location.radius':'0',take:'5'};
const checks=[['seeded-baseline','/v2/insights',baseline],['explainability','/v2/insights',{...baseline,'feature.explainability':'true'}],['trends','/v2/insights',{...baseline,'bias.trends':'low'}],['popularity','/v2/insights',{...baseline,'filter.popularity.max':'0.5'}],['external-resy','/v2/insights',{...baseline,'filter.external.exists':'resy'}],['tripadvisor','/v2/insights',{...baseline,'filter.external.tripadvisor.rating.min':'4'}],['tags','/v2/tags',{'filter.query':'restaurant','filter.parents.types':'urn:entity:place',take:'5'}]];
const summary=[];
const only=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7).split(',');
for(const [name,path,params] of checks){
 if(only&&!only.includes(name))continue;
 const url=new URL(path,base);url.search=new URLSearchParams(params).toString();
 let res;try{res=await fetch(url,{headers:{'X-Api-Key':process.env.QLOO_API_KEY},redirect:'error',signal:AbortSignal.timeout(20000)})}catch{summary.push({name,status:'network-error'});break}
 const raw=await res.text();await writeFile(`.private/qloo/${name}.json`,raw,{mode:0o600});
 let data;try{data=JSON.parse(raw)}catch{data={}}
 const list=data.results?.entities??data.results?.tags??data.results;
 const record={name,status:res.status,count:Array.isArray(list)?list.length:null,hasWarning:!!(data.warning||data.warnings||data.query?.explainability?.warning),keys:Object.keys(data),rateLimits:Object.fromEntries([...res.headers].filter(([k])=>/ratelimit/.test(k)))};
 summary.push(record);console.log(JSON.stringify(record));if([401,403,429].includes(res.status))break;
}
await writeFile(`.private/qloo/features${only?'-followup':''}-summary.json`,JSON.stringify({checkedAt:new Date().toISOString(),checks:summary},null,2),{mode:0o600});
