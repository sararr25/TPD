import assert from 'node:assert/strict';
import { register } from 'node:module';
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(s,c,n){try{return await n(s,c)}catch(e){if(s.startsWith('.'))return n(s+'.ts',c);throw e}}`));
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k,v) => store.set(k,v), removeItem: k => store.delete(k) };
globalThis.window = new EventTarget();
const { recordStamp, loadStamps, readLocalStamps, deleteStamps } = await import('../src/lib/stamps-client.ts');
const { parseStamps, stampKey } = await import('../src/lib/stamps.ts');
const city = { kind: 'city', city: 'Lisbon', createdAt: '2026-10-22T08:00:00.000Z' };
const place = { kind: 'place', city: 'Lisbon', placeId: '96296410-62eb-408e-96c6-fd60aaaf9216', name: 'Time Out Market', createdAt: '2026-10-22T09:00:00.000Z' };
await recordStamp(city);
await recordStamp({ ...city, createdAt: '2026-10-22T10:00:00.000Z' });
await recordStamp({ ...place, token: 'secret', note: 'private' });
let local = readLocalStamps();
assert.equal(local.length, 2);
assert.equal(local.find(s => s.kind === 'city').createdAt, city.createdAt);
assert.equal(local.find(s => s.kind === 'place').name, place.name);
assert.ok(!JSON.stringify(local).includes('secret'));
assert.ok(!JSON.stringify(local).includes('private'));
assert.deepEqual(parseStamps('not json'), []);
assert.deepEqual(parseStamps(JSON.stringify([{ ...city, city: 'Unknown' }, { ...place, placeId: 'bad' }])), []);
assert.equal(stampKey(place), 'place:96296410-62eb-408e-96c6-fd60aaaf9216');
let requests = [];
globalThis.fetch = async (_url, init = {}) => {
  requests.push(init);
  return Response.json(init.method === 'POST' ? { stamps: JSON.parse(init.body).stamps } : { stamps: [] });
};
const account = await loadStamps('account-a');
assert.equal(account.length, 2);
assert.equal(readLocalStamps().length, 0);
assert.equal(readLocalStamps('account-b').length, 0);
// A failed account write leaves a retryable copy scoped to that account.
globalThis.fetch = async () => Response.json({error:'unexpected_error'}, {status:500});
await assert.rejects(recordStamp(city, 'account-a'));
assert.equal(readLocalStamps('account-a').length, 1);
assert.equal(readLocalStamps('account-b').length, 0);
assert.equal(readLocalStamps().length, 0);
// A failed guest adoption must never erase the guest's history.
await recordStamp(place);
await assert.rejects(loadStamps('account-b'));
assert.equal(readLocalStamps().length, 1);
await deleteStamps();
assert.equal(readLocalStamps().length, 0);
assert.equal(readLocalStamps('account-a').length, 1);
await assert.rejects(deleteStamps('account-a'));
assert.equal(readLocalStamps('account-a').length, 1);
console.log('PASS: stamps persist and deduplicate, strip tokens/notes, adopt guest history only after success, and isolate account retries.');

// Server input validation is the same public seam as the existing account
// tests: malformed input must fail before any database request.
const { saveUserStamps, readUserStamps } = await import('../src/lib/server/user-stamps.ts');
delete process.env.DATABASE_URL;
for (const bad of [null, {}, [], Array(51).fill(city), [{ ...city, city: 'Unknown' }], [{ ...place, placeId: 'bad' }], [{ ...city, createdAt: 'not a date' }]])
  await assert.rejects(saveUserStamps('user', bad), e => e.code === 'invalid_request');
await assert.rejects(saveUserStamps('user', [city, place]), e => e.code === 'not_configured');
await assert.rejects(readUserStamps('user'), e => e.code === 'not_configured');
assert.equal(requests[0].headers['X-Beesyde-User'], 'account-a');
console.log('PASS: server stamps reject malformed city/place/date/batch input before database use; queued writes identify the intended account.');
