const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = (()=>{try{return require('jsdom');}catch{return require(path.resolve(__dirname,'../../test-runtime/node_modules/jsdom'));}})();
const dir=path.resolve(__dirname,'..');
function setup(hash='#birth') {
  const dom=new JSDOM(fs.readFileSync(path.join(dir,'index.html'),'utf8'),{url:'https://example.test/baby/'+hash,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window; const errors=[]; const scrolls=[]; const storage=[]; const calls=[];
  w.addEventListener('error',event=>errors.push(event.error));
  w.scrollTo=(x,y)=>scrolls.push([x,y]); w.requestAnimationFrame=cb=>cb(); w.print=()=>calls.push('print');
  w.fetch=()=>{throw Error('Unexpected network request');};
  w.Storage.prototype.setItem=function(key,value){storage.push([key,value]);};
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async text=>calls.push(text)}});
  for(const file of ['stories.js','more-stories.js','expanded-stories.js','app.js','meal-plan.js','food-data.js','meal-nutrition.js','meal-plan-ui.js','birth-data.js','birth-checklist.js','birth-ui.js']) w.eval(fs.readFileSync(path.join(dir,file),'utf8'));
  const navigate=hash=>{w.history.replaceState(null,'',hash);w.dispatchEvent(new w.HashChangeEvent('hashchange'));};
  return {dom,w,errors,scrolls,storage,calls,navigate,$:id=>w.document.getElementById(id)};
}
test('Direct links render all topics and clear hidden sections without resetting internal scroll',()=>{
  const s=setup(); assert.equal(s.errors.length,0); assert.equal(s.$('birth').hidden,false);
  assert.equal(s.$('birth-nav').getAttribute('aria-current'),'page'); assert.equal(s.$('meals').hidden,true);assert.equal(s.$('library').hidden,true);
  assert.deepEqual(s.scrolls,[[0,0]]);
  const topics=s.w.BIRTH_GUIDE.topics;
  for(const topic of topics) {s.scrolls.length=0;s.navigate('#birth/'+topic.id);assert.equal(s.$('birth-topic-heading').textContent,topic.title);assert.equal(s.scrolls.length,0);assert.equal(s.$('birth-topics').querySelectorAll('[aria-current=page]').length,1);}
  s.navigate('#birth/missing-topic');assert.equal(s.w.location.hash,'#birth');assert.equal(s.$('birth-topic-heading').textContent,topics[0].title);
  s.navigate('#meals/day/2');assert.equal(s.$('birth').hidden,true);assert.equal(s.$('birth-panel').children.length,0);assert.match(s.$('day-heading').textContent,/第 2 天/);
  s.scrolls.length=0;s.navigate('#birth/recovery');assert.deepEqual(s.scrolls,[[0,0]]);assert.equal(s.$('meals-nav').hasAttribute('aria-current'),false);
  assert.equal(s.errors.length,0);s.dom.window.close();
});
test('The real form generates, copies, prints and clears a private discussion checklist',async()=>{
  const s=setup('#birth/checklist'); const form=s.$('birth-checklist-form');
  form.dispatchEvent(new s.w.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(s.$('birth-result-title').textContent,/补齐/);assert.equal(s.$('birth-result').hidden,false);
  const fill={weeks:'39',urgent:'no',babies:'single',presentation:'head',placenta:'clear',history:'cs',conditions:'none',preference:'pain',service:'special'};
  for(const [key,value] of Object.entries(fill)) form.elements.namedItem(key).value=value;
  form.dispatchEvent(new s.w.Event('submit',{bubbles:true,cancelable:true}));assert.match(s.$('birth-result-title').textContent,/复核/);
  assert.match(s.$('birth-result').textContent,/TOLAC/);assert.match(s.$('birth-result').textContent,/特需费用/);
  const buttons=s.$('birth-result').querySelectorAll('button');buttons[0].click();await Promise.resolve();assert.ok(s.calls[0].includes('子宫切口'));assert.ok(s.calls[0].includes('来源：'));
  buttons[1].click();assert.equal(s.calls.at(-1),'print');assert.equal(s.$('birth-result').querySelector('details').open,true);
  assert.equal(s.storage.length,0,'Health information must not be stored');
  form.elements.namedItem('presentation').value='unknown';form.elements.namedItem('presentation').dispatchEvent(new s.w.Event('change',{bubbles:true}));assert.equal(s.$('birth-result').hidden,true,'An old checklist must not survive edits');
  form.reset();assert.equal(form.elements.namedItem('history').value,'unknown');assert.equal(s.$('birth-result').hidden,true);
  form.elements.namedItem('weeks').value='39';s.navigate('#birth/overview');s.navigate('#birth/checklist');assert.equal(s.$('birth-field-weeks').value,'');
  assert.equal(s.errors.length,0);s.dom.window.close();
});
test('Warning symptoms are shown immediately even when the gestation input is invalid',()=>{
  const s=setup('#birth/checklist');s.$('birth-field-weeks').value='99';s.$('birth-field-urgent').value='yes';
  s.$('birth-field-urgent').dispatchEvent(new s.w.Event('change',{bubbles:true}));
  assert.equal(s.$('birth-result').dataset.type,'urgent');assert.match(s.$('birth-result-title').textContent,/120/);assert.equal(s.$('birth-result').querySelector('ol'),null);
  s.$('birth-field-urgent').value='no';s.$('birth-field-urgent').dispatchEvent(new s.w.Event('change',{bubbles:true}));assert.equal(s.$('birth-result').hidden,true);
  assert.equal(s.errors.length,0);s.dom.window.close();
});
test('Every rendered diagram and same-site link resolves and existing stories stay readable',()=>{
  const s=setup();
  for(const topic of s.w.BIRTH_GUIDE.topics){s.navigate('#birth/'+topic.id);for(const img of s.$('birth-panel').querySelectorAll('img')){assert.ok(img.alt.length>10);assert.ok(fs.existsSync(path.join(dir,img.getAttribute('src'))));}for(const a of s.$('birth-panel').querySelectorAll('a[href^="#birth/"]'))assert.ok(s.w.BIRTH_GUIDE.topics.some(t=>a.hash==='#birth/'+t.id));}
  assert.equal(s.w.STORIES.length,100);s.navigate('#story/'+s.w.STORIES[0].id);assert.equal(s.$('reader').hidden,false);assert.equal(s.$('birth').hidden,true);assert.ok(s.$('reader-body').children.length>0);
  assert.equal(s.errors.length,0);s.dom.window.close();
});
