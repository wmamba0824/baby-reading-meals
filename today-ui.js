(() => {
  'use strict';
  const model = window.BABY_TODAY;
  const $ = id => document.getElementById(id);
  if (!model || !$('home')) return;
  const PROFILE = 'baby:today:v1', FEEDING = 'baby:feeding:v1';
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const civilToday = () => model.todayString();
  function previousStory() {
    const saved = read('little-story:v1'), records = saved?.records || {};
    const unfinished = window.STORIES.filter(story => records[story.id] && !records[story.id].read)
      .sort((a, b) => (records[b.id].openedAt || 0) - (records[a.id].openedAt || 0))[0];
    return unfinished || window.STORIES.find(story => !records[story.id]?.read) || window.STORIES[0];
  }
  function defaults() {
    return {phase: 'expecting', dueDate: '', birthDate: '', feeding: read(FEEDING) || '', readingStart: civilToday(), readingFirst: previousStory().day};
  }
  const stored = read(PROFILE);
  let configured = stored && typeof stored === 'object' && !model.validate(stored);
  let profile = configured ? {...stored} : defaults();
  const sharedFeeding = read(FEEDING);
  if (['lactating', 'nonlactating'].includes(sharedFeeding)) profile.feeding = sharedFeeding;
  const element = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  function link(label, href, className = 'today-link') {
    const a = element('a', label, className); a.href = href; return a;
  }
  function syncForm() {
    for (const key of ['phase', 'dueDate', 'birthDate', 'feeding', 'readingStart', 'readingFirst']) $('home-' + key).value = profile[key];
    $('home-birthDate').max = civilToday(); $('home-readingStart').max = civilToday();
    phaseFields();
  }
  function phaseFields() {
    const born = $('home-phase').value === 'born';
    $('home-due-field').hidden = born; $('home-birth-field').hidden = !born; $('home-feeding-field').hidden = !born;
    $('home-dueDate').required = !born; $('home-birthDate').required = born; $('home-feeding').required = born;
  }
  function sourceLinks(card, item) {
    const refs = element('p', '依据：', 'today-refs');
    item.refs.forEach((id, i) => {
      const source = window.POSTPARTUM_GUIDE.sources[id]; if (!source) return;
      if (i) refs.append(document.createTextNode(' · '));
      const a = link(source.name, source.url); a.target = '_blank'; a.rel = 'noopener noreferrer'; refs.append(a);
    });
    card.append(refs);
  }
  function careCard(item, href, label) {
    const card = element('article', '', 'today-care-card');
    card.append(element('span', label || (item.audience === 'baby' ? '宝宝' : '妈妈'), 'today-pill'), element('h3', item.title));
    const detail = element('details'); detail.append(element('summary', '展开照护要点'));
    item.text.forEach(text => detail.append(element('p', text))); sourceLinks(detail, item); card.append(detail, link('到时间轴查看 →', href)); return card;
  }
  function renderStory(state) {
    const story = window.STORIES.find(item => item.day === state.storyDay) || window.STORIES[0];
    const box = $('today-story'); box.replaceChildren();
    box.append(element('p', `阅读第 ${story.day} 天${state.storyRound > 1 ? ` · 第 ${state.storyRound} 轮` : ''}`, 'eyebrow'), element('h3', story.title), element('p', story.description));
    const minutes = Math.max(1, Math.ceil(story.paragraphs.join('').length / 180));
    box.append(element('p', `约 ${minutes} 分钟 · 文字朗读，舒服就好`, 'today-muted'), link('读今天的故事 →', '#story/' + story.id, 'today-button'));
    const saved = read('little-story:v1'), records = saved?.records || {};
    const latest = window.STORIES.filter(item => records[item.id] && !records[item.id].read)
      .sort((a, b) => (records[b.id].openedAt || 0) - (records[a.id].openedAt || 0))[0];
    if (latest && latest.id !== story.id) box.append(link(`接着上次读《${latest.title}》`, '#story/' + latest.id));
    box.append(element('p', '阅读日程独立计算；出生或更改预产期不会重置。可重复、跳过或休息。', 'today-muted'));
  }
  function renderMeals(state) {
    const feeding = ['lactating', 'nonlactating'].includes(profile.feeding) ? profile.feeding : 'lactating';
    const current = window.MEAL_NUTRITION.buildDay(state.mealDay, feeding);
    const panel = $('today-meals'); panel.replaceChildren();
    const label = state.mealPreview ? '产后餐谱预览 · 第 1 天' : state.mealCycle ? `家常备餐参考 · 菜单第 ${state.mealDay} 天` : `产后餐谱 · 第 ${state.mealDay} 天`;
    panel.append(element('p', label, 'eyebrow'));
    panel.append(element('p', state.mealPreview ? '宝宝还未出生，先看看产后怎样备餐。这里不是孕期专用食谱，也不会按预产期自动进入月子餐。' : state.mealCycle ? '42 天菜单已走完，以下循环展示家常备餐灵感；不是新的产后恢复阶段。' : '出生当天对应菜单第 1 天；已获准恢复普通饮食后再参考，按食欲、耐受和医嘱调整。', 'today-muted'));
    const selected = configured && ['lactating', 'nonlactating'].includes(profile.feeding);
    panel.append(element('p', `${feeding === 'lactating' ? '哺乳' : '不哺乳'}参考${selected ? '' : ' · 尚未选择份量，仅作预览'}`, 'today-pill'));
    const list = element('dl', '', 'today-menu');
    current.meals.forEach(meal => {
      const row = element('div'); row.append(element('dt', meal.label), element('dd', meal.recipes.map(recipe => recipe.name).join('、'))); list.append(row);
    });
    panel.append(list, link('查看食材用量与详细做法 →', '#meals/day/' + state.mealDay, 'today-button'));
    panel.append(element('p', '这份菜单供成人参考，不是宝宝辅食；有食物过敏、术后进食限制或疾病时需另行调整。', 'today-muted'));
  }
  function renderCare(state) {
    const guide = window.POSTPARTUM_GUIDE, panel = $('today-care'); panel.replaceChildren();
    if (!configured || !state.born) {
      panel.append(element('p', configured ? '宝宝还未出生，今天先把准备做得从容一点。' : '保存预产期或实际出生日期后，这里会显示当前阶段的事项。', 'today-muted'));
      const prepare = [
        ['产前准备', '核对就诊资料、医院联系方式和家属分工。', '#birth/prepare'],
        ['了解生产选择', '把分娩方式、镇痛和医院服务分开了解，带着问题去沟通。', '#birth/methods'],
        ['整理就诊问题', '使用原有清单，把已知情况和需要问医生的问题整理好。', '#birth/checklist']
      ];
      prepare.forEach(([title, description, href]) => { const card = element('article', '', 'today-care-card'); card.append(element('h3', title), element('p', description), link('打开生产指南 →', href)); panel.append(card); });
      return;
    }
    panel.append(element('p', state.upcoming ? '近期准备：先了解满月与之后的安排，不表示这些项目今天必须做。' : '按当前日历阶段核对；不是所有事项都要在今天完成。', 'today-muted'));
    const stages = state.stages.map(id => guide.stages.find(item => item.id === id)).filter(Boolean);
    stages.forEach(stage => {
      const section = element('section', '', 'today-stage');
      section.append(element('h3', stage.label), element('p', stage.when, 'today-muted'));
      const cards = element('div', '', 'today-care-grid');
      // Keep all items in a selected window, including conditional and discharge-based appointments.
      stage.items.forEach(item => cards.append(careCard(item, '#postpartum/' + stage.id + '/' + item.audience)));
      section.append(cards); panel.append(section);
    });
    panel.append(element('p', '小时窗口从实际出生时刻算，社区访视从出院时间算；首页只按日期粗略定位。提前出院、早产或正在治疗时，优先使用医院给的计划。', 'today-muted'));
  }
  function renderDaily(state) {
    const panel = $('today-daily'); panel.replaceChildren();
    if (!configured || !state.born) {
      panel.append(element('p', '给照护留一点空间：今天可以一起读一篇故事，确认谁负责做饭、家务和就诊沟通。', 'today-muted'), link('看看出生后的日常照护 →', '#postpartum/daily')); return;
    }
    const ids = state.age <= 42 ? ['daily-safe-sleep', profile.feeding === 'nonlactating' ? 'daily-formula' : 'daily-feeding', 'daily-mother-body', 'daily-mother-rest'] : ['daily-mother-rest'];
    ids.forEach(id => { const item = window.POSTPARTUM_GUIDE.daily.find(item => item.id === id); if (item) panel.append(careCard(item, '#postpartum/daily/' + item.audience)); });
    if (state.age > 42) panel.append(element('p', '本站宝宝照护内容主要面向出生早期。月龄增长后，请结合儿保、接种与个体随访计划，不把新生儿清单一直套用下去。', 'today-muted'));
  }
  function render() {
    const state = model.state(profile), date = new Date();
    $('today-date').textContent = date.toLocaleDateString('zh-CN', {month: 'long', day: 'numeric', weekday: 'long'});
    let title = '把今天，照顾得暖一点', subtitle = '三餐、一篇故事，还有妈妈和宝宝的小事。';
    if (configured && state.born) { title = `和宝宝一起的第 ${state.age + 1} 天`; subtitle = `宝宝日龄 ${state.age} 天 · 出生当天为 0 天，按本机日历日期计算。`; }
    else if (configured && state.remaining !== null) {
      title = state.remaining > 0 ? `距离预产期还有 ${state.remaining} 天` : state.remaining === 0 ? '今天是预产期，仍然从容准备' : `已过预产期 ${-state.remaining} 天，仍在期待`;
      subtitle = state.gestation >= 0 && state.gestation <= 315 ? `估算孕 ${Math.floor(state.gestation / 7)} 周 + ${state.gestation % 7} 天 · 以产检记录为准。` : '日期仅作日程参考，准确孕周以产检记录为准。';
      if (state.remaining <= 0) subtitle += ' 宝宝出生后，请填写实际出生日期再切换阶段。';
    }
    $('today-heading').textContent = title; $('today-subtitle').textContent = subtitle;
    $('home-settings-label').textContent = configured ? '修改日期与阅读安排' : '设置你家的今天';
    $('today-demo').hidden = !!configured;
    renderStory(state); renderMeals(state); renderCare(state); renderDaily(state);
    $('today-warning-link').href = configured && state.born ? '#postpartum' : '#birth';
    $('today-warning-link').textContent = configured && state.born ? '查看妈妈与宝宝的警示情况 →' : '查看孕产期警示情况 →';
  }
  $('home-phase').addEventListener('change', phaseFields);
  $('home-form').addEventListener('submit', event => {
    event.preventDefault();
    const next = {};
    for (const key of ['phase', 'dueDate', 'birthDate', 'feeding', 'readingStart', 'readingFirst']) next[key] = $('home-' + key).value;
    next.readingFirst = Number(next.readingFirst);
    const error = model.validate(next);
    if (error) { $('home-status').textContent = error; return; }
    profile = next; configured = true;
    let persisted = true;
    try { localStorage.setItem(PROFILE, JSON.stringify(profile)); if (profile.feeding) localStorage.setItem(FEEDING, JSON.stringify(profile.feeding)); }
    catch { persisted = false; }
    render();
    $('home-status').textContent = persisted ? '已保存到当前浏览器，今天的内容更新好了。' : '今天已更新，但浏览器无法保存设置；关闭后可能需要重新填写。';
    window.dispatchEvent(new CustomEvent('baby:feedingchange', {detail: profile.feeding}));
    if (persisted) { $('home-settings').open = false; $('home-settings-summary').focus({preventScroll: true}); }
  });
  window.addEventListener('baby:feedingchange', event => {
    if (!['lactating', 'nonlactating'].includes(event.detail) || profile.feeding === event.detail) return;
    profile.feeding = event.detail; $('home-feeding').value = profile.feeding;
    if (configured) { try { localStorage.setItem(PROFILE, JSON.stringify(profile)); } catch { /* Current session still works. */ } }
    render();
  });
  window.addEventListener('storage', event => {
    if (event.key === PROFILE || event.key === null) { const latest = read(PROFILE); configured = latest && !model.validate(latest); profile = configured ? latest : defaults(); syncForm(); render(); }
    if (event.key === FEEDING) { const value = read(FEEDING); if (['lactating', 'nonlactating'].includes(value)) { profile.feeding = value; $('home-feeding').value = value; render(); } }
  });
  window.addEventListener('hashchange', () => { if (!location.hash || location.hash === '#today') render(); });
  let midnightTimer;
  function scheduleMidnight() {
    clearTimeout(midnightTimer);
    const now = new Date(), tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    midnightTimer = setTimeout(() => { render(); scheduleMidnight(); }, tomorrow - now + 100);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); scheduleMidnight(); } });
  syncForm(); $('home-settings').open = !configured; render(); scheduleMidnight();
})();
