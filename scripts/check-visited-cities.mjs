import assert from 'node:assert/strict';
import { loadVisited, saveVisited, readVisited, clearVisited, deleteVisited } from '../src/lib/visited-cities-client.ts';
const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
globalThis.window={dispatchEvent:()=>true};
let calls=[];
globalThis.fetch=async(_url,options)=>{calls.push(options);return Response.json({cities:['Tokyo'],syncAvailable:false});};
assert.deepEqual((await loadVisited('guest')).cities,[]);assert.equal(calls.length,0);
await saveVisited('guest',['Lisbon'],false);
assert.deepEqual((await loadVisited('guest')).cities,['Lisbon']);
assert.deepEqual((await loadVisited('account-a')).cities,[]);
assert.deepEqual((await loadVisited('account-b')).cities,[]);
await saveVisited('account-a',['Phu Quoc'],false);
assert.deepEqual(readVisited('account-a').cities,['Phu Quoc']);assert(readVisited('account-a').pending);
assert.deepEqual(readVisited('guest').cities,['Lisbon']);
assert.deepEqual(readVisited('account-b').cities,[]);
assert(calls.every(c=>c.method==='GET'));
globalThis.fetch=async()=>Response.json({cities:['Tokyo'],syncAvailable:true});
assert.deepEqual((await loadVisited('account-a')).cities,['Phu Quoc']);
globalThis.fetch=async()=>new Response('{}',{status:503});
await assert.rejects(saveVisited('account-a',['Paris'],true));
assert.deepEqual(readVisited('account-a').cities,['Paris']);assert(readVisited('account-a').pending);
const writes=[];
globalThis.fetch=async(_url,options)=>{writes.push(JSON.parse(options.body).cities);return Response.json({saved:true});};
await Promise.all([saveVisited('account-a',['Lisbon'],true),saveVisited('account-a',['Tokyo'],true)]);
assert.deepEqual(writes,[['Lisbon'],['Tokyo']]);assert.deepEqual(readVisited('account-a').cities,['Tokyo']);assert.equal(readVisited('account-a').pending,false);
// A GET started while PUT is pending must not restore the old server snapshot
// after that PUT has successfully committed and cleared the pending flag.
let resolvePut, resolveStaleRead;
globalThis.fetch=(_url,options)=>new Promise(resolve=>{
  if(options.method==='PUT') resolvePut=resolve; else resolveStaleRead=resolve;
});
const saving = saveVisited('account-a',['Paris'],true);
const staleRead = loadVisited('account-a');
await new Promise(resolve=>setImmediate(resolve));
resolvePut(Response.json({saved:true})); await saving;
resolveStaleRead(Response.json({cities:['Tokyo'],syncAvailable:true}));
assert.deepEqual((await staleRead).cities,['Paris'],'a pre-commit GET must not undo the successful save');
assert.deepEqual(readVisited('account-a').cities,['Paris']);
// An older account read cannot resurrect data erased on this browser.
let resolveRead;
globalThis.fetch=()=>new Promise(resolve=>{resolveRead=resolve;});
const pending=loadVisited('account-a');clearVisited('account-a');resolveRead(Response.json({cities:['Tokyo'],syncAvailable:true}));
assert.deepEqual((await pending).cities,[]);
globalThis.fetch=async(_url,options)=>{assert.equal(options.headers['X-Beesyde-User'],'account-a');assert.equal(options.method,'DELETE');return Response.json({deleted:true});};
await deleteVisited('account-a');assert.deepEqual(readVisited('account-a').cities,[]);
console.log('PASS: real visits are explicit, guest/account copies isolated, failures retain retry drafts, queued writes preserve order, late reads cannot undo deletion and account requests name the intended owner.');
