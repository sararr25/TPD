import assert from 'node:assert/strict';
import {register} from 'node:module';
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(s.startsWith('.'))return n(s+'.ts',c);throw e}}`));
const a=await import('../src/lib/account.ts');
const {notebookSnapshot,notebookHTML}=await import('../src/lib/travel-notebook.ts');
const cache=new Map();globalThis.localStorage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v),removeItem:k=>cache.delete(k)};
const id='abcdef00-abcd-4000-8000-abcdefabcdef',feedback={votes:[{id,name:'PRIVATE VOTE',vote:1,tags:[]}],dismissed:[]};
cache.set('beesyde-feedback-v1',JSON.stringify(feedback));cache.set(a.HIDDEN_KEY,JSON.stringify([{id,name:'PRIVATE LEGACY HIDE'}]));
const requests=[];globalThis.fetch=async(path,options)=>{requests.push({path,...options});return Response.json(path==='/api/feedback'?{feedback:null}:{hidden:[]});};
assert.deepEqual(await a.loadFeedback(true,'owner-b'),{votes:[],dismissed:[]});assert.equal(requests.filter(r=>r.method==='PUT').length,0);
await a.saveFeedback(feedback,true,'owner-a');assert.equal(requests.at(-1).headers['X-Beesyde-User'],'owner-a');assert.equal(cache.get(a.feedbackKey('owner-b')),undefined);assert.equal(cache.get(a.feedbackKey()),JSON.stringify(feedback));
await a.hidePlace({id,name:'A private place'},'fixture',true,'owner-a');assert.deepEqual(await a.loadHidden(true,'owner-b'),[]);
for(const fn of [a.deleteAccountPassport,a.deleteAccountQuiz,a.deleteAccountFeedback,a.deleteAccount]){await assert.rejects(fn(),/Wait for your account/);await fn('owner-a');assert.equal(requests.at(-1).headers['X-Beesyde-User'],'owner-a');}
const list={id:'PRIVATE ACCOUNT LIST ID',name:'My trip',local:true,items:[{placeId:id.toUpperCase(),name:'<script>PRIVATE XSS</script>',address:'Public address',note:'SECRET NOTE',token:'SECRET TOKEN',savedAt:'SECRET DATE'}]};
const notebook=notebookSnapshot(list,[id],{groups:['Saturday'],places:[{id,group:'Saturday'}]});assert.equal(notebook.places[0].group,'Saturday');const html=notebookHTML(notebook);for(const hidden of ['SECRET','PRIVATE ACCOUNT LIST ID','<script>'])assert.ok(!html.includes(hidden));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('Public address'));
console.log('PASS: intended-owner reads/writes/deletes, isolated account caches, no legacy adoption, case-insensitive notebook selection and escaped public-only export; mocked requests only.');
