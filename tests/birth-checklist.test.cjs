const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {build,normalized,choices} = require('../birth-checklist.js');
const known = {urgent:'no',weeks:'39',babies:'single',presentation:'head',placenta:'clear',history:'none',conditions:'none',advice:'unknown',preference:'unknown',service:'ordinary'};
test('Unknown information never clears somebody for vaginal birth', () => {
  const empty=build(); assert.equal(empty.type,'incomplete'); assert.ok(empty.missing.includes('准确孕周'));
  assert.equal(build({...known,presentation:'unknown'}).type,'incomplete');
  const full=build(known); assert.equal(full.type,'discussion'); assert.match(full.title,/不能确定/);
  assert.ok(!('probability' in full));
});
test('Reported warning signs override apparently favorable or specialist factors',()=>{
  for(const placenta of ['clear','covering','accreta','unknown']) {
    const output=build({...known,urgent:'yes',weeks:'invalid',placenta});
    assert.equal(output.type,'urgent'); assert.match(output.title,/120/); assert.equal(output.questions.length,0);
  }
});
test('Unknown symptoms stay unknown, regardless of complete obstetric fields',()=>{
  const output=build({...known,urgent:'unknown'}); assert.equal(output.type,'incomplete'); assert.ok(output.missing.includes('当前症状是否需要及时就医'));
});
test('Placental, uterine and presentation concerns produce discussion points',()=>{
  for(const changes of [{placenta:'covering'},{placenta:'accreta'},{presentation:'transverse'},{history:'rupture'}]) assert.equal(build({...known,...changes}).type,'specialist');
  for(const changes of [{placenta:'low'},{presentation:'breech'},{history:'cs'},{history:'surgery'},{babies:'multiple'},{conditions:'bp'},{conditions:'sugar'}]) assert.equal(build({...known,...changes}).type,'review');
  const scar=build({...known,history:'cs'}); assert.ok(scar.questions.some(text=>text.includes('子宫切口'))); assert.ok(scar.refs.includes('vbac'));
  assert.ok(build({...known,presentation:'breech'}).questions.some(text=>text.includes('外倒转')));
});
test('Gestation and preferences change questions without deciding a mode',()=>{
  assert.ok(build({...known,weeks:'41'}).questions.some(text=>text.includes('引产')));
  assert.ok(build({...known,weeks:'32'}).questions.some(text=>text.includes('复查胎位')));
  assert.ok(build({...known,preference:'pain'}).questions.some(text=>text.includes('麻醉评估')));
  assert.ok(build({...known,advice:'cs'}).questions.some(text=>text.includes('具体指征')));
  assert.equal(build({...known,preference:'cs'}).type,'discussion');
});
test('Unrecognized, invalid and unnecessary personal input is not reproduced',()=>{
  const input={...known,weeks:'39<script>',presentation:'safe',name:'private name',id:'private id'};
  const n=normalized(input); assert.equal(n.weeks,null); assert.equal(n.presentation,'unknown');
  assert.doesNotMatch(JSON.stringify(build(input)),/private|script|safe/);
  for(const invalid of ['0','44','-1','Infinity','39.5','1e1','']) assert.equal(normalized({weeks:invalid}).weeks,null);
});
test('All guide sections and checklist branches refer to real primary sources',()=>{
  const sandbox={window:{}}; vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../birth-data.js'),'utf8'),sandbox);
  const guide=sandbox.window.BIRTH_GUIDE; assert.equal(guide.topics.length,8); assert.ok(Object.keys(guide.sources).length>=20);
  const ids=new Set(guide.topics.map(topic=>topic.id)); assert.equal(ids.size,guide.topics.length);
  const used=new Set();
  for(const topic of guide.topics) for(const section of topic.sections) {
    if(section.text || section.bullets || section.steps || section.table) assert.ok(section.kind || section.refs?.length,`${topic.id}: ${section.title} lacks a source or editorial label`);
    for(const id of section.refs||[]) {assert.ok(guide.sources[id],id);used.add(id);}
    for(const card of section.cards||[]) if(card.link) assert.ok(ids.has(card.link));
  }
  for(const [field,options] of Object.entries(choices)) for(const [value] of options) for(const id of build({...known,[field]:value}).refs) assert.ok(guide.sources[id],id);
  for(const [id,source] of Object.entries(guide.sources)) { assert.ok(used.has(id),`${id} is not used`); assert.match(source.url,/^https:\/\/(www\.)?(who\.int|nice\.org\.uk|cspm\.cma\.org\.cn|app\.www\.gov\.cn|nhsa\.gov\.cn|ylbz\.nx\.gov\.cn|rcog\.org\.uk|nhs\.uk|kentandmedwaylms\.nhs\.uk|ncbi\.nlm\.nih\.gov|cdc\.gov)\//); }
  assert.match(guide.sources.vbac.date,/2026-07/);
  for(const name of ['decision','routes','placenta','followup']) assert.ok(fs.existsSync(path.join(__dirname,`../birth-${name}.svg`)));
});
