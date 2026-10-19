// Logic smoke checks only: this is not a browser, layout or accessibility test.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('design-mockups/A4-product-prototype.html', 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function session(raw, failStorage = false) {
  const elements = {};
  const storage = new Map(raw === undefined ? [] : [['tpd-design-v1', raw]]);
  const element = () => ({innerHTML:'', textContent:'', addEventListener(){}, setAttribute(){}, insertAdjacentHTML(_, value){this.innerHTML += value}, showModal(){this.open=true}, close(){this.open=false}});
  const context = {
    document: {querySelector: key => elements[key] ??= element(), querySelectorAll: () => []},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem(key, value){if(failStorage) throw Error('unavailable');storage.set(key,value)},
      removeItem(key){if(failStorage) throw Error('unavailable');storage.delete(key)}
    }, location:{hash:''}, window:{addEventListener(){},scrollTo(){}}
  };
  vm.createContext(context);vm.runInContext(source,context);
  return {context, elements, storage, run: code => vm.runInContext(code,context)};
}
for(const raw of ['broken','null','[]','{"selected":{},"saved":"bad"}']){
  const s=session(raw);assert.equal(s.run('selected.size'),0);assert.equal(s.run('saved.length'),0);
}
const dirty=session(JSON.stringify({selected:['<script>','Khruangbin','Khruangbin'],saved:[0,0,9,'1',-1]}));
assert.equal(dirty.run('selected.size'),1);assert.equal(dirty.run('saved.length'),1);
const first=session();first.run("selected=new Set(signals.slice(0,3)); saved=[1]; persist()");
const reloaded=session(first.storage.get('tpd-design-v1'));
assert.equal(reloaded.run('selected.size'),3);assert.equal(reloaded.run('saved[0]'),1);
reloaded.elements['#confirmErase'].onclick();
assert.equal(reloaded.run('selected.size'),0);assert.equal(reloaded.run('saved.length'),0);
assert.equal(reloaded.storage.has('tpd-design-v1'),false);
const unavailable=session(undefined,true);unavailable.run('persist();render()');
assert.match(unavailable.elements['#app'].innerHTML,/Storage is unavailable/);
const s=session();
for(const route of ['welcome','passport','guest','swap','results','detail-0','detail-1','detail-2','collections','compare','states',...['loading','empty','coverage','quota','reference','error'].map(x=>'state-'+x)]){
 s.context.location.hash='#'+route;s.run('render()');assert.ok(s.elements['#app'].innerHTML.includes('Delete my local data'),route);
}
console.log('PASS: malformed storage, allowlisted values, deduplication, persistence, deletion, storage failure and 17 routes. Browser acceptance remains open.');
