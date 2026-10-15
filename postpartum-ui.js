(() => {
  'use strict';
  const guide = window.POSTPARTUM_GUIDE;
  const $ = id => document.getElementById(id);
  const panel = $('postpartum-panel');
  const stageNav = $('postpartum-stages');
  const audienceNav = $('postpartum-audiences');
  if (!guide || !panel || !stageNav || !audienceNav) return;

  const audiences = [['all', '全部'], ['baby', '宝宝'], ['mother', '妈妈']];
  const audienceLabels = Object.fromEntries(audiences);
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const views = [
    {id: 'overview', label: '时间总览'},
    ...guide.stages.map(stage => ({id: stage.id, label: stage.label})),
    {id: 'daily', label: '日常照护'},
    {id: 'sources', label: '全部依据'}
  ];

  function routeHash(view, audience) {
    if (view === 'overview' && audience === 'all') return '#postpartum';
    return `#postpartum/${view}${audience === 'all' ? '' : '/' + audience}`;
  }
  function viewLink(view, audience, label) {
    const link = element('a', label);
    link.href = routeHash(view, audience);
    return link;
  }
  function externalLink(source) {
    const link = element('a', source.name);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }
  function references(ids) {
    const paragraph = element('p', '', 'postpartum-refs');
    paragraph.append(element('span', '依据：'));
    ids.filter(id => guide.sources[id]).forEach((id, index) => {
      if (index) paragraph.append(document.createTextNode(' · '));
      const link = externalLink(guide.sources[id]);
      link.dataset.source = id;
      paragraph.append(link);
    });
    return paragraph;
  }
  function renderItem(item, headingLevel) {
    const card = element('article', '', 'postpartum-card');
    card.dataset.item = item.id;
    card.dataset.audience = item.audience;
    card.dataset.kind = item.kind;
    const meta = element('p', '', 'postpartum-item-meta');
    meta.append(element('span', audienceLabels[item.audience], `postpartum-badge is-${item.audience}`),
      element('span', item.kind, 'postpartum-kind'));
    card.append(meta, element(headingLevel, item.title));
    item.text.forEach(text => card.append(element('p', text)));
    if (item.refs?.length) card.append(references(item.refs));
    return card;
  }
  function renderItems(items, audience, headingLevel) {
    const selected = items.filter(item => audience === 'all' || item.audience === audience);
    const list = element('div', '', 'postpartum-items');
    selected.forEach(item => list.append(renderItem(item, headingLevel)));
    if (!selected.length) list.append(element('p', '这个时间段没有单独列出的相关事项，可查看时间总览或日常照护；具体安排仍按出院医嘱。', 'postpartum-empty'));
    return {list, count: selected.length};
  }
  function renderAlerts() {
    const container = $('postpartum-alerts');
    if (!container || !guide.alerts) return;
    container.replaceChildren();
    for (const audience of ['baby', 'mother']) {
      const section = element('section', '', 'postpartum-alert-group');
      section.append(element('h3', audience === 'baby' ? '宝宝的警示情况' : '妈妈的警示情况'));
      const list = element('ul');
      guide.alerts[audience].forEach(text => list.append(element('li', text)));
      section.append(list);
      container.append(section);
    }
    if (guide.alerts.refs?.length) container.append(references(guide.alerts.refs));
  }
  function renderNavigation(view, audience) {
    stageNav.replaceChildren();
    views.forEach(item => {
      const link = viewLink(item.id, audience, item.label);
      link.dataset.postpartumView = item.id;
      if (view === item.id) link.setAttribute('aria-current', 'page');
      stageNav.append(link);
    });
    audienceNav.replaceChildren();
    audiences.forEach(([value, label]) => {
      const link = viewLink(view, value, label);
      link.dataset.postpartumAudience = value;
      if (audience === value) link.setAttribute('aria-current', 'page');
      audienceNav.append(link);
    });
  }
  function renderSources() {
    panel.append(element('p', '这里列出整个产后时间轴的依据。发布日期、适用范围和本页整理日期分开标注；医院、地区及早产儿等特殊情况的安排可能不同。', 'postpartum-intro'));
    const list = element('ol', '', 'postpartum-source-list');
    Object.entries(guide.sources).forEach(([id, source]) => {
      const item = element('li');
      item.dataset.source = id;
      item.append(externalLink(source), element('p', source.date, 'postpartum-source-meta'), element('p', source.scope));
      list.append(item);
    });
    panel.append(list);
  }
  function render() {
    const hash = location.hash;
    if (hash !== '#postpartum' && !hash.startsWith('#postpartum/')) {
      panel.replaceChildren();
      return;
    }
    const segments = hash.split('/');
    let view = segments[1] || 'overview';
    let audience = segments[2] || 'all';
    const valid = segments.length <= 3 && (segments.length === 1 || !!segments[1]) &&
      (segments.length < 3 || !!segments[2]) && views.some(item => item.id === view) &&
      audiences.some(item => item[0] === audience);
    if (!valid) {
      view = 'overview';
      audience = 'all';
      history.replaceState(null, '', location.pathname + location.search + '#postpartum');
    }
    renderNavigation(view, audience);
    panel.replaceChildren();
    const stage = guide.stages.find(item => item.id === view);
    const label = views.find(item => item.id === view).label;
    const header = element('div', '', 'postpartum-view-header');
    const heading = element('h2', label);
    heading.id = 'postpartum-view-heading';
    heading.tabIndex = -1;
    header.append(heading);
    const actions = element('div', '', 'postpartum-actions');
    const print = element('button', '打印当前内容', 'secondary');
    print.type = 'button';
    print.dataset.postpartumPrint = '';
    print.onclick = () => window.print();
    actions.append(print);
    header.append(actions);
    panel.append(header);
    panel.append(element('p', `整理日期：${guide.reviewed} · 当前筛选：${audienceLabels[audience]}`, 'postpartum-print-title'));
    let count = 0;
    if (view === 'sources') {
      renderSources();
    } else if (view === 'overview') {
      panel.append(element('p', '按出生后的时间顺序查看。医院安排与需要预约的事项请提前确认；日常照护可随时查看，出现警示情况不要等待下一个时间点。', 'postpartum-intro'));
      guide.stages.forEach(item => {
        const section = element('section', '', 'postpartum-stage');
        section.dataset.stage = item.id;
        const title = element('h3', '', 'postpartum-stage-heading');
        title.append(viewLink(item.id, audience, item.label));
        section.append(title, element('p', item.when, 'postpartum-stage-time'), element('p', item.summary));
        const result = renderItems(item.items, audience, 'h4');
        count += result.count;
        section.append(result.list);
        panel.append(section);
      });
      const daily = viewLink('daily', audience, '查看日常照护 →');
      panel.append(daily);
    } else if (view === 'daily') {
      panel.append(element('p', '以下内容贯穿产后照护，不另做月子餐菜单。请结合宝宝情况、妈妈恢复和出院医嘱调整。', 'postpartum-intro'));
      const result = renderItems(guide.daily, audience, 'h3');
      count = result.count;
      panel.append(result.list);
    } else {
      panel.append(element('p', stage.when, 'postpartum-stage-time'), element('p', stage.summary, 'postpartum-intro'));
      const result = renderItems(stage.items, audience, 'h3');
      count = result.count;
      panel.append(result.list);
      panel.append(viewLink('overview', audience, '← 返回时间总览'), document.createTextNode(' · '), viewLink('daily', audience, '查看日常照护'));
    }
    if (view !== 'sources') {
      const status = element('p', `已显示 ${count} 项 · ${audienceLabels[audience]}`, 'postpartum-count');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      header.append(status);
      panel.append(element('p', '时间点用于帮助安排照护，不能代替产科、儿科或社区医护的个体评估。', 'postpartum-intro'));
    }
    document.title = `${label} · 产后时间轴 · Baby`;
    heading.focus({preventScroll: true});
  }
  renderAlerts();
  window.addEventListener('hashchange', render);
  render();
})();
