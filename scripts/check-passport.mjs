import assert from 'node:assert/strict';
import { parsePassport, SIGNALS } from '../src/lib/passport.ts';
for(const raw of [null,'null','broken','{}','1','"text"'])assert.deepEqual(parsePassport(raw),[]);
assert.deepEqual(parsePassport(JSON.stringify([SIGNALS[0],SIGNALS[0],'<script>',null,1,SIGNALS[1]])),[SIGNALS[0],SIGNALS[1]]);
assert.equal(parsePassport(JSON.stringify(SIGNALS)).length,5);
assert.deepEqual(parsePassport(JSON.stringify(SIGNALS.slice(0,3))),SIGNALS.slice(0,3));
console.log('PASS: Passport storage rejects malformed/unknown data, deduplicates and caps selections.');
