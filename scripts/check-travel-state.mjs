import assert from 'node:assert/strict';
import {neonConfig} from '@neondatabase/serverless';
import {emptyTravel,validateTravel,organise} from '../src/lib/travel-state.ts';
import {readTravel,writeTravel,deleteTravel} from '../src/lib/server/user-travel-state.ts';
const id='00000000-0000-4000-8000-000000000001';
for(const bad of [null,{}, {...emptyTravel(),visits:[{id:'bad'}]}, {...emptyTravel(),trips:JSON.parse('{"__proto__":{"groups":[],"places":[]}}')}, {...emptyTravel(),visits:Array(101).fill({})}])assert.throws(()=>validateTravel(bad));
const state={version:1,trips:{trip:{groups:['Saturday'],places:[{id,group:'Saturday'}]}},visits:[{id,at:'2026-10-27T00:00:00.000Z',verdict:'again',reason:'Private'}]};
assert.deepEqual(validateTravel({...state,token:'secret'}),state);
assert.deepEqual(organise([{placeId:id},{placeId:'other'}],state.trips.trip).map(i=>i.placeId),['other',id]);
const rows=new Map();process.env.DATABASE_URL='postgres://fixture:fixture@fixture.invalid/fixture';
neonConfig.fetchFunction=async(_url,options)=>{
 const {query,params}=JSON.parse(options.body);let values=[];
 if(query.startsWith('SELECT')){const row=rows.get(params[0]);return Response.json({fields:[{name:'state',dataTypeID:3802},{name:'revision',dataTypeID:23}],rows:row?[[JSON.stringify(row.state),String(row.revision)]]:[]});}
 if(query.startsWith('INSERT')){if(!rows.has(params[0])){rows.set(params[0],{state:JSON.parse(params[1]),revision:1});values=[['1']];}}
 if(query.startsWith('UPDATE')){const row=rows.get(params[0]);if(row?.revision===Number(params[2])){row.state=JSON.parse(params[1]);row.revision++;values=[[String(row.revision)]];}}
 if(query.startsWith('DELETE'))rows.delete(params[0]);
 return Response.json({fields:[{name:'revision',dataTypeID:23}],rows:values});
};
assert.equal((await readTravel('owner-a')).revision,0);
assert.equal((await writeTravel('owner-a',state,0)).revision,1);
await assert.rejects(writeTravel('owner-a',emptyTravel(),0),e=>e.code==='travel_conflict');
await assert.rejects(writeTravel('owner-a',emptyTravel(),5),e=>e.code==='travel_conflict');
assert.equal((await writeTravel('owner-a',emptyTravel(),1)).revision,2);
assert.deepEqual((await readTravel('owner-b')).state,emptyTravel());
await assert.rejects(writeTravel('owner-a',state,-1),e=>e.code==='invalid_request');
await deleteTravel('owner-a');assert.equal((await readTravel('owner-a')).revision,0);
console.log('PASS: private travel projection, limits, group order, atomic revisions/conflicts, owner isolation and deletion; mocked SQL transport only.');
