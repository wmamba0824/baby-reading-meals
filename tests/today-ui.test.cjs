const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = (() => { try { return require('jsdom'); } catch { return require(path.resolve(__dirname, '../../test-runtime/node_modules/jsdom')); } })();
const dir = path.resolve(__dirname, '..');
const assets = ['stories.js','more-stories.js','expanded-stories.js','app.js','meal-plan.js','food-data.js','meal-nutrition.js','meal-plan-ui.js','birth-data.js','birth-checklist.js','birth-ui.js','postpartum-data.js','postpartum-ui.js','today-model.js','today-ui.js'];
function setup({hash = '', seed = {}, blocked = false} = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(dir,'index.html'),'utf8'), {url:'https://example.test/baby/' + hash, runScripts:'outside-only', pretendToBeVisual:true});
  const w = dom.window, errors = [], scrolls = [], writes = [];
  w.addEventListener('error', e => errors.push(e.error));
  w.scrollTo = (x,y) => scrolls.push([x,y]); w.requestAnimationFrame = cb => cb();
  for (const [key, value] of Object.entries(seed)) w.localStorage.setItem(key, JSON.stringify(value));
  const original = w.Storage.prototype.setItem;
  w.Storage.prototype.setItem = function(key,value) { if (blocked) throw new Error('storage blocked'); writes.push(key); return original.call(this,key,value); };
  w.fetch = () => { throw Error('Unexpected network request'); };
  for (const file of assets) w.eval(fs.readFileSync(path.join(dir,file),'utf8'));
  const $ = id => w.document.getElementById(id);
  const navigate = hash => { w.history.replaceState(null,'',hash); w.dispatchEvent(new w.HashChangeEvent('hashchange')); };
  const fill = values => { for (const [key,value] of Object.entries(values)) $('home-'+key).value=value; $('home-phase').dispatchEvent(new w.Event('change')); $('home-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true})); };
  return {dom,w,$,navigate,fill,errors,scrolls,writes};
}
const localDate = (year,month,day) => new Date(year,month-1,day,12);
test('civil dates, leap years and stage boundaries do not depend on elapsed hours', () => {
  const s = setup(), m = s.w.BABY_TODAY;
  assert.equal(m.dateNumber('2024-02-29') + 1, m.dateNumber('2024-03-01'));
  for (const invalid of ['2023-02-29','2026-13-01','2026-02-30','not-a-date','2026-1-1']) assert.equal(m.dateNumber(invalid),null);
  const p = {phase:'born',birthDate:'2026-10-01',feeding:'nonlactating',readingStart:'2026-09-01',readingFirst:1};
  for (const [day, age, meal, stage] of [[1,0,1,'first-day'],[3,2,3,'day-2-3'],[8,7,8,'week-2'],[16,15,16,'month-1'],[29,28,29,'month-1']]) {
    const state = m.state(p,localDate(2026,10,day));
    assert.equal(state.age,age);assert.equal(state.mealDay,meal);assert.ok(state.stages.includes(stage));
  }
  const day43 = m.state(p,localDate(2026,11,12)); assert.equal(day43.age,42);assert.equal(day43.mealDay,1);assert.equal(day43.mealCycle,true);
  const week7 = m.state(p,localDate(2026,11,13));assert.deepEqual(Array.from(week7.stages),['later']);
  assert.equal(m.state({...p,phase:'expecting',dueDate:'2026-10-01'},localDate(2026,10,24)).born,false,'An overdue date must never imply birth');
  assert.equal(m.state({...p,readingStart:'2026-10-01',readingFirst:100},localDate(2026,10,2)).storyDay,1);
  assert.equal(m.state({...p,birthDate:'2026-09-12'},localDate(2026,10,2)).storyDay,m.state(p,localDate(2026,10,2)).storyDay,'Birthday cannot reset reading');
  assert.match(m.validate({...p,birthDate:'2026-11-01'},localDate(2026,10,24)),/不能晚于/);
  s.dom.window.close();
});
test('default homepage leaves all four original sections accessible and preserves deep links', () => {
  const s = setup();assert.equal(s.$('home').hidden,false);assert.equal(s.$('library').hidden,true);
  assert.equal(s.$('today-nav').getAttribute('aria-current'),'page');assert.equal(s.writes.length,0,'Do not store visitor health dates implicitly');
  for (const [hash,id] of [['#stories','library'],['#birth/prepare','birth'],['#meals/day/2','meals'],['#postpartum/week-2/baby','postpartum']]) {
    s.navigate(hash); assert.equal(s.$(id).hidden,false,hash);assert.equal(s.$('home').hidden,true,hash);
    assert.equal(s.w.document.querySelectorAll('.section-nav [aria-current="page"]').length,1);
  }
  s.scrolls.length=0;s.navigate('#meals/day/3');s.scrolls.length=0;s.navigate('#meals/day/4');assert.equal(s.scrolls.length,0,'Keep existing no-jump day navigation');
  s.navigate('#story/'+s.w.STORIES[0].id);s.$('back').click();s.navigate('#stories');assert.equal(s.$('library').hidden,false);
  s.navigate('#today');assert.equal(s.$('home').hidden,false);assert.equal(s.errors.length,0);s.dom.window.close();
});
test('saving birth settings changes meals and care, preserves existing reader records, and persists across reloads', () => {
  const s = setup({seed:{'little-story:v1':{favorites:['little-lamp'],records:{'little-lamp':{read:false,progress:.4,openedAt:1}},fontSize:24}}});
  const today=s.w.BABY_TODAY.todayString(), old=s.w.localStorage.getItem('little-story:v1');
  s.fill({phase:'born',birthDate:today,feeding:'nonlactating'});
  assert.match(s.$('today-subtitle').textContent,/日龄 0 天/);assert.match(s.$('today-meals').textContent,/第 1 天/);
  assert.ok(s.$('today-care').querySelector('[href="#postpartum/first-day/baby"]'));
  assert.match(s.$('today-daily').textContent,/配方奶/);assert.equal(s.w.localStorage.getItem('little-story:v1'),old);
  assert.equal(s.$('home-settings').open,false);assert.match(s.$('home-status').textContent,/已保存/);
  s.navigate('#meals/day/1');assert.equal(s.w.document.querySelector('[data-feeding="nonlactating"]').getAttribute('aria-pressed'),'true');
  s.w.document.querySelector('[data-feeding="lactating"]').click();s.navigate('#today');assert.match(s.$('today-meals').textContent,/哺乳参考/);assert.equal(s.$('home-feeding').value,'lactating');
  const saved=JSON.parse(s.w.localStorage.getItem('baby:today:v1'));
  const reload=setup({seed:{'baby:today:v1':saved,'baby:feeding:v1':'lactating'}});assert.match(reload.$('today-subtitle').textContent,/日龄 0 天/);assert.equal(reload.$('home-settings').open,false);
  assert.equal(s.errors.length,0);assert.equal(reload.errors.length,0);s.dom.window.close();reload.dom.window.close();
});
test('unborn, invalid, unavailable storage and older infants show honest states', () => {
  const s=setup({blocked:true}), today=s.w.BABY_TODAY.todayString();
  s.fill({phase:'born',birthDate:'2199-01-01',feeding:'nonlactating'});assert.match(s.$('home-status').textContent,/不能晚于/);assert.equal(s.$('today-demo').hidden,false);
  s.fill({phase:'expecting',dueDate:today});assert.match(s.$('today-heading').textContent,/今天是预产期/);assert.match(s.$('today-meals').textContent,/产后餐谱预览/);assert.match(s.$('home-status').textContent,/无法保存/);assert.equal(s.$('today-care').querySelectorAll('[href="#postpartum/first-day/baby"]').length,0);
  s.fill({phase:'born',birthDate:'2025-01-01',feeding:'nonlactating'});assert.match(s.$('today-meals').textContent,/不是新的产后恢复阶段/);assert.match(s.$('today-daily').textContent,/不把新生儿清单一直套用/);
  assert.equal(s.errors.length,0);s.dom.window.close();
});
