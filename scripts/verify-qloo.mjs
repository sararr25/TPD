// Small, sequential access/coverage probe. Raw responses stay in ignored .private/.
import { loadEnvFile } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
try { loadEnvFile('.env.local'); } catch { /* environment variables may be supplied */ }
const key = process.env.QLOO_API_KEY;
const base = process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com';
if (!key) throw new Error('Configure QLOO_API_KEY locally.');
if (base.replace(/\/$/,'') !== 'https://hackathon.api.qloo.com') throw new Error('Only the approved hackathon host is permitted.');
await mkdir('.private/qloo', { recursive: true, mode: 0o700 });
const checks = [
 ['search-restaurant', '/search', { query:'Le Baratin Paris', types:'urn:entity:place', take:'3' }],
 ['search-museum', '/search', { query:'Musée d’Orsay Paris', types:'urn:entity:place', take:'3' }],
 ...['Paris','Tokyo','New York'].map(city => [`coverage-${city.toLowerCase().replaceAll(' ','-')}`, '/v2/insights', {'filter.type':'urn:entity:place','filter.location.query':city,'filter.location.radius':'0',take:'5'}]),
];
const summary=[];
for (const [name,path,params] of checks) {
 const url = new URL(path,base); url.search = new URLSearchParams(params).toString();
 let response;
 try { response = await fetch(url, { headers:{'X-Api-Key':key}, redirect:'error', signal:AbortSignal.timeout(20000) }); }
 catch { summary.push({name,status:'network-error'}); console.log(name+': network-error'); break; }
 const raw=await response.text();
 await writeFile(`.private/qloo/${name}.json`,raw,{mode:0o600});
 let data;try{data=JSON.parse(raw)}catch{data={}}
 const entities=data.results?.entities ?? data.results;
 const count=Array.isArray(entities)?entities.length:null;
 const record={name,status:response.status,count,topLevelKeys:Object.keys(data),rateLimitHeaderNames:[...response.headers.keys()].filter(x=>/rate|quota|retry/i.test(x))};
 summary.push(record);console.log(JSON.stringify(record));
 if ([401,403,429].includes(response.status)) break;
}
await writeFile('.private/qloo/access-summary.json',JSON.stringify({checkedAt:new Date().toISOString(),checks:summary},null,2),{mode:0o600});
