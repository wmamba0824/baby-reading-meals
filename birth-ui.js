(() => {
  'use strict';
  const guide = window.BIRTH_GUIDE;
  const checklist = window.BIRTH_CHECKLIST;
  const $ = id => document.getElementById(id);
  if (!guide || !checklist || !$('birth-panel')) return;
  const el = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
  function refs(ids) {
    const list = el('p', '', 'birth-refs'); list.append(el('span', '依据：'));
    ids.forEach((id, i) => { if (i) list.append(document.createTextNode(' · ')); const source = guide.sources[id]; if (!source) return; const link = el('a', source.name); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; list.append(link); });
    return list;
  }
  function topicLink(id, text) { const link = el('a', text); link.href = id === 'meals' ? '#meals' : `#birth/${id}`; return link; }
  function renderSection(item) {
    const section = el('section', '', 'birth-section'); section.append(el('h3', item.title));
    if (item.kind) section.append(el('p', ['practical','decisionSupport'].includes(item.kind) ? '实用整理 · 供沟通与安排使用' : '本站编辑说明', 'birth-label'));
    if (item.diagram) {
      const figure = el('figure', '', 'birth-figure'); const img = el('img'); img.src = `birth-${item.diagram}.svg`; img.alt = {decision:'从母婴评估到分娩方案和医院服务的共同决策路径',routes:'阴道分娩经宫颈及阴道，剖宫产经腹壁与子宫切口的简化示意',placenta:'示意胎盘未遮挡宫颈内口与覆盖内口的区别，需超声确定',followup:'WHO 建议的四个产后照护接触时点：首24小时、48至72小时、7至14天和第6周'}[item.diagram]; img.width = 900; img.height = item.diagram === 'routes' ? 430 : item.diagram === 'placenta' ? 330 : 240; figure.append(img); figure.append(el('figcaption','本站原创概念图 · 不按解剖比例 · 不用于自行诊断')); section.append(figure);
    }
    item.text?.forEach(text => section.append(el('p', text)));
    if (item.bullets) { const ul = el('ul'); item.bullets.forEach(text => ul.append(el('li',text))); section.append(ul); }
    if (item.cards) { const grid = el('div','','birth-cards'); item.cards.forEach(card => { const node = el('article','','birth-card'); node.append(el('h4',card.title),el('p',card.text)); if (card.link) node.append(topicLink(card.link,'查看内容 →')); grid.append(node); }); section.append(grid); }
    if (item.steps) { const list = el('ol','','birth-steps'); item.steps.forEach(step => { const li = el('li'); li.append(el('span',step.label,'birth-label'),el('h4',step.title),el('p',step.text)); list.append(li); }); section.append(list); }
    if (item.table) { const wrap = el('div','','birth-table-wrap'); wrap.tabIndex = 0; wrap.setAttribute('role','region'); wrap.setAttribute('aria-label',`${item.title}比较表，可横向滚动`); const table = el('table','','birth-table'); const caption = el('caption',item.title); const head = el('thead'); const row = el('tr'); item.table.headers.forEach(text => { const th = el('th',text); th.scope = 'col'; row.append(th); }); head.append(row); const body = el('tbody'); item.table.rows.forEach(values => { const tr = el('tr'); values.forEach((text,i) => { const cell = el(i ? 'td' : 'th',text); if (!i) cell.scope = 'row'; tr.append(cell); }); body.append(tr); }); table.append(caption,head,body); wrap.append(table); section.append(wrap); }
    if (item.link) section.append(topicLink(item.link.topic,item.link.text));
    if (item.refs?.length) section.append(refs(item.refs));
    if (item.allSources) {
      const list = el('ol','','birth-source-list'); Object.values(guide.sources).forEach(source => { const li = el('li'); const a = el('a',source.name); a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a,el('p',`${source.kind} · ${source.date}`,'birth-label'),el('p',source.scope)); list.append(li); }); section.append(list);
    }
    return section;
  }
  let copyText = '';
  function renderForm(container) {
    const form = el('form','','birth-form'); form.id = 'birth-checklist-form'; form.autocomplete = 'off';
    const alertLabel = el('p','请先确认：是否有明显出血、胎动明显减少、破水，或剧烈／持续头痛、视物异常、胸痛、呼吸困难、晕厥、发热 ≥38℃、持续剧烈腹痛、单侧腿肿痛、伤害自己或宝宝的念头？拿不准时直接联系医护。','birth-form-warning'); form.append(alertLabel);
    const field = (key, label, input) => { const wrapper = el('div','','birth-field'); const lab = el('label',label); input.id = `birth-field-${key}`; input.name = key; lab.htmlFor = input.id; wrapper.append(lab,input); return wrapper; };
    const urgent = el('select'); for (const [value,text] of checklist.choices.urgent) { const option = el('option',text); option.value = value; urgent.append(option); } form.append(field('urgent','当前是否有警示症状',urgent));
    const grid = el('div','','birth-fields'); const weeks = el('input'); weeks.type='number'; weeks.min='1'; weeks.max='43'; weeks.step='1'; weeks.inputMode='numeric'; weeks.placeholder='可留空，例如 36'; grid.append(field('weeks','孕周（整周，以产检记录为准）',weeks));
    for (const [key,options] of Object.entries(checklist.choices)) { if (key === 'urgent') continue; const select = el('select'); options.forEach(([value,text]) => { const option = el('option',text); option.value=value; select.append(option); }); grid.append(field(key,checklist.labels[key],select)); }
    form.append(grid);
    const actions = el('div','','birth-actions'); const submit = el('button','生成就诊问题','primary'); submit.type='submit'; const reset = el('button','清除填写','secondary'); reset.type='reset'; actions.append(submit,reset); form.append(actions);
    const result = el('section','','birth-result'); result.id='birth-result'; result.hidden=true; result.setAttribute('aria-labelledby','birth-result-title');
    const live = el('p','','birth-live'); live.id='birth-result-status'; live.setAttribute('role','status'); live.setAttribute('aria-live','polite');
    form.onsubmit = event => {
      event.preventDefault(); if (urgent.value !== 'yes' && !form.reportValidity()) return;
      const data = {}; for (const key of ['weeks',...Object.keys(checklist.choices)]) data[key] = form.elements.namedItem(key).value;
      const value = checklist.build(data); result.replaceChildren(); result.hidden=false; result.dataset.type=value.type;
      const heading = el('h3',value.title); heading.id='birth-result-title'; heading.tabIndex=-1; result.append(heading);
      value.notes.forEach(text => result.append(el('p',text)));
      if (value.type !== 'urgent') {
        const recordDetails = el('details','','birth-records'); recordDetails.append(el('summary','你填写的资料（请核对）')); const ul=el('ul'); value.recorded.forEach(text=>ul.append(el('li',text))); recordDetails.append(ul); result.append(recordDetails);
        if (value.missing.length) result.append(el('p',`仍需核对：${value.missing.join('、')}。`));
        const ol=el('ol'); value.questions.forEach(text=>ol.append(el('li',text))); result.append(ol);
      }
      result.append(refs(value.refs));
      copyText = [value.title,...value.notes,'填写资料：',...value.recorded,...(value.missing.length ? [`待核对：${value.missing.join('、')}`] : []),'就诊问题：',...value.questions.map((text,i)=>`${i+1}. ${text}`),'资料整理日期：'+guide.reviewed,'来源：',...value.refs.map(id=>`${guide.sources[id].name} ${guide.sources[id].url}`)].join('\n');
      const controls=el('div','','birth-actions'); const copy=el('button','复制就诊清单','secondary'); copy.type='button'; const print=el('button','打印清单','secondary'); print.type='button'; print.onclick=()=>{ result.querySelectorAll('details').forEach(details=>details.open=true); window.print(); }; controls.append(copy,print); result.append(controls,el('p','清单含你填写的健康信息，复制或打印后请留意接收对象。','birth-label'));
      copy.onclick=async()=>{ try { await navigator.clipboard.writeText(copyText); live.textContent='已复制就诊清单。'; } catch { const manual=el('textarea'); manual.value=copyText; manual.readOnly=true; manual.rows=12; manual.setAttribute('aria-label','可手动复制的就诊清单'); result.append(manual); manual.focus({preventScroll:true}); manual.select(); live.textContent='自动复制不可用，请在文本框中手动复制。'; } };
      live.textContent=value.type==='urgent' ? '出现警示症状，请现在联系医护。' : '已生成就诊问题，请与产科团队核对。'; heading.focus({preventScroll:true});
    };
    form.onreset=()=>{ copyText=''; result.replaceChildren(); result.hidden=true; live.textContent='已清除填写。'; };
    // Invalidate an old list on edits. A reported emergency bypasses invalid fields.
    form.onchange=()=>{ copyText=''; result.replaceChildren(); result.hidden=true; live.textContent='填写已变化，请重新生成清单。'; if (urgent.value==='yes') form.onsubmit({preventDefault() {}}); };
    container.append(form,live,result);
  }
  const nav=$('birth-topics'); guide.topics.forEach(topic=>{ const a=topicLink(topic.id,topic.label); a.dataset.birthTopic=topic.id; nav.append(a); });
  function route() {
    if (!/^#birth(?:\/[a-z-]+)?$/.test(location.hash)) { copyText=''; $('birth-panel').replaceChildren(); return; }
    const id=location.hash.split('/')[1]||'overview'; const topic=guide.topics.find(item=>item.id===id)||guide.topics[0];
    if (id!==topic.id) history.replaceState(null,'',location.pathname+location.search+'#birth');
    copyText=''; nav.querySelectorAll('a').forEach(a=>{ if (a.dataset.birthTopic===topic.id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    $('birth-panel').replaceChildren(); const heading=el('h2',topic.title); heading.id='birth-topic-heading'; heading.tabIndex=-1; $('birth-panel').append(heading,el('p',topic.intro,'birth-topic-intro'));
    topic.sections.forEach(item=>$('birth-panel').append(renderSection(item))); if (topic.form) renderForm($('birth-panel'));
    document.title=`${topic.label} · 生产指南 · Baby`; heading.focus({preventScroll:true});
  }
  window.addEventListener('hashchange',route); route();
})();
