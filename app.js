(() => {
  'use strict';
  const stories = window.STORIES;
  const $ = id => document.getElementById(id);
  const key = 'little-story:v1';
  let storageAvailable = true;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch { saved = {}; }
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  const ids = new Set(stories.map(story => story.id));
  const favorites = new Set(Array.isArray(saved.favorites) ? saved.favorites.filter(id => ids.has(id)) : []);
  const records = {};
  if (saved.records && typeof saved.records === 'object') {
    for (const [id, record] of Object.entries(saved.records)) {
      if (ids.has(id) && record && typeof record === 'object') records[id] = {
        openedAt: Number.isFinite(record.openedAt) ? record.openedAt : 0,
        progress: Number.isFinite(record.progress) ? Math.min(1, Math.max(0, record.progress)) : 0,
        read: record.read === true
      };
    }
  }
  let fontSize = [18, 20, 22, 24, 26, 28, 30].includes(saved.fontSize) ? saved.fontSize : 22;
  let category = '全部';
  let view = 'all';
  let block = 0;
  let current = null;
  let restoring = false;
  let scrollTimer;
  let toastTimer;
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 3500); }
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ favorites: [...favorites], records, fontSize })); }
    catch { if (storageAvailable) toast('浏览器无法保存记录，本次仍可正常阅读。'); storageAvailable = false; }
  }
  function length(story) { return story.paragraphs.join('').replace(/\s/g, '').length; }
  function duration(story) { return Math.max(1, Math.ceil(length(story) / 180)); }
  function meta(story) { return `第 ${story.day} 天 · 约 ${duration(story)} 分钟 · ${length(story)} 字`; }
  function status(record) { return record?.read ? '已读完' : record ? `读到 ${Math.round(record.progress * 100)}%` : ''; }
  function button(text, className, action) { const element = document.createElement('button'); element.textContent = text; element.className = className; element.addEventListener('click', action); return element; }
  function toggleFavorite(id) { favorites.has(id) ? favorites.delete(id) : favorites.add(id); save(); render(); if (current) syncReader(); toast(favorites.has(id) ? '已收藏这个故事' : '已取消收藏'); }
  function render() {
    document.querySelectorAll('[data-category]').forEach(element => { if (element.tagName === 'BUTTON') element.setAttribute('aria-pressed', String(category === element.dataset.category)); });
    document.querySelectorAll('[data-view]').forEach(element => element.setAttribute('aria-pressed', String(view === element.dataset.view)));
    let filtered = stories.filter(story => (!block || Math.ceil(story.day / 10) === block) && (category === '全部' || story.category === category) && (view === 'all' || (view === 'favorites' ? favorites.has(story.id) : !!records[story.id])));
    if (view === 'history') filtered = filtered.sort((a, b) => records[b.id].openedAt - records[a.id].openedAt);
    $('story-count').textContent = `${filtered.length} / ${stories.length} 篇 · ${view === 'history' ? '按最近阅读' : '按阅读天数顺序'}`;
    $('story-grid').replaceChildren();
    for (const story of filtered) {
      const card = document.createElement('article'); card.className = 'story-card'; card.dataset.category = story.category;
      const top = document.createElement('div'); top.className = 'card-top';
      const label = document.createElement('span'); label.className = 'category-label'; label.textContent = `第 ${String(story.day).padStart(3, '0')} 天 · ${story.category}`;
      const favorite = button(favorites.has(story.id) ? '★' : '☆', 'favorite-button', () => toggleFavorite(story.id)); favorite.setAttribute('aria-label', `${favorites.has(story.id) ? '取消收藏' : '收藏'}《${story.title}》`); favorite.setAttribute('aria-pressed', String(favorites.has(story.id))); top.append(label, favorite);
      const heading = document.createElement('h3'); const link = document.createElement('a'); link.href = `#story/${story.id}`; link.textContent = story.title; heading.append(link);
      const description = document.createElement('p'); description.className = 'description'; description.textContent = story.description;
      const bottom = document.createElement('div'); bottom.className = 'card-bottom';
      const information = document.createElement('span'); information.className = 'card-meta'; information.textContent = meta(story);
      if (records[story.id]) { const badge = document.createElement('span'); badge.className = 'read-status'; badge.textContent = status(records[story.id]); information.append(badge); }
      bottom.append(information, button('读这个故事', 'read-link', () => location.hash = `story/${story.id}`)); card.append(top, heading, description, bottom); $('story-grid').append(card);
    }
    $('empty').hidden = filtered.length > 0;
    $('empty-title').textContent = view === 'favorites' ? '这里还没有收藏的故事' : view === 'history' ? '这里还没有阅读记录' : '这里还没有故事';
    $('empty-text').textContent = category !== '全部' ? '试试其他主题，或查看全部故事。' : view === 'favorites' ? '点一下故事旁的星星，把喜欢的故事留在这里。' : '选一个喜欢的故事，开始今天的阅读。';
    const latest = stories.filter(story => records[story.id] && !records[story.id].read).sort((a, b) => records[b.id].openedAt - records[a.id].openedAt)[0];
    $('continue-section').hidden = !latest;
    if (latest) { $('continue-title').textContent = latest.title; $('continue-meta').textContent = `${meta(latest)} · ${status(records[latest.id])}`; $('continue-button').onclick = () => location.hash = `story/${latest.id}`; }
  }
  function syncReader() {
    document.documentElement.style.setProperty('--reader-size', `${fontSize}px`);
    $('font-label').textContent = `${fontSize}`;
    $('smaller').disabled = fontSize <= 18; $('larger').disabled = fontSize >= 30;
    if (!current) return;
    $('reader-favorite').textContent = favorites.has(current.id) ? '已收藏' : '收藏故事';
    $('reader-favorite').setAttribute('aria-pressed', String(favorites.has(current.id)));
    $('mark-read').textContent = records[current.id]?.read ? '已读完' : '标记为已读';
    $('mark-read').disabled = records[current.id]?.read === true;
  }
  function rememberProgress() {
    if (!current || restoring) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    records[current.id].progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    save();
  }
  function route() {
    clearTimeout(scrollTimer); rememberProgress();
    const id = location.hash.startsWith('#story/') ? location.hash.slice(7) : '';
    const story = stories.find(item => item.id === id);
    current = story || null;
    const isMeals = /^#meals(?:\/day\/\d+)?$/.test(location.hash);
    const isBirth = /^#birth(?:\/[a-z-]+)?$/.test(location.hash);
    const enteringMeals = isMeals && $('meals').hidden;
    const enteringBirth = isBirth && $('birth').hidden;
    $('library').hidden = !!story || isMeals || isBirth; $('reader').hidden = !story; $('meals').hidden = !isMeals; $('birth').hidden = !isBirth;
    const activeNav = isBirth ? 'birth-nav' : isMeals ? 'meals-nav' : 'stories-nav';
    for (const navId of ['stories-nav', 'meals-nav', 'birth-nav']) { $(navId).toggleAttribute('aria-current', navId === activeNav); if (navId === activeNav) $(navId).setAttribute('aria-current', 'page'); }
    if (isBirth) { restoring = false; document.title = '生产指南 · Baby'; if (enteringBirth) window.scrollTo(0, 0); return; }
    if (isMeals) { restoring = false; document.title = '42 天月子餐 · Baby'; if (enteringMeals) window.scrollTo(0, 0); return; }
    if (!story) { restoring = false; document.title = 'Baby · 育儿与陪伴'; render(); window.scrollTo(0, 0); if (id) { toast('这个故事不存在，已返回书架。'); history.replaceState(null, '', location.pathname + location.search); } return; }
    const previous = records[id] || { progress: 0, read: false };
    records[id] = { ...previous, openedAt: Date.now() }; save();
    $('next-story').textContent = story.day === stories.length ? '从第 1 天再读' : '读下一天';
    $('reader-title').textContent = story.title; $('reader-category').textContent = `${story.category}故事`;
    $('reader-meta').textContent = `${meta(story)} · 原创故事`;
    $('reader-body').replaceChildren(...story.paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    document.title = `${story.title} · Baby`; syncReader();
    restoring = true;
    requestAnimationFrame(() => { if (current?.id !== id) return; $('reader-title').focus({ preventScroll: true }); const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); window.scrollTo(0, previous.read ? 0 : max * previous.progress); requestAnimationFrame(() => { restoring = false; }); });
  }
  document.querySelectorAll('.categories button').forEach(element => element.addEventListener('click', () => { category = element.dataset.category; render(); }));
  document.querySelectorAll('[data-view]').forEach(element => element.addEventListener('click', () => { view = view === element.dataset.view ? 'all' : element.dataset.view; render(); }));
  $('reading-block').onchange = event => { block = Number(event.target.value); render(); };
  $('reset-filter').onclick = () => { category = '全部'; view = 'all'; block = 0; $('reading-block').value = '0'; render(); };
  $('back').onclick = () => location.hash = '';
  $('reader-favorite').onclick = () => current && toggleFavorite(current.id);
  function resizeFont(delta) { rememberProgress(); const progress = current ? records[current.id].progress : 0; fontSize = Math.max(18, Math.min(30, fontSize + delta)); restoring = true; syncReader(); if (current) { const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight); window.scrollTo(0, max * progress); } save(); requestAnimationFrame(() => restoring = false); }
  $('smaller').onclick = () => resizeFont(-2); $('larger').onclick = () => resizeFont(2);
  $('mark-read').onclick = () => { if (!current) return; records[current.id].read = true; records[current.id].progress = 1; save(); syncReader(); toast('已记下，今天又读完了一个故事。'); };
  $('next-story').onclick = () => { if (current) location.hash = `story/${stories[(stories.indexOf(current) + 1) % stories.length].id}`; };
  window.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(rememberProgress, 180); }, { passive: true });
  window.addEventListener('pagehide', rememberProgress);
  window.addEventListener('hashchange', route);
  route();
})();
