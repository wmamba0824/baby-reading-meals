(() => {
  const $ = id => document.getElementById(id);
  let loaded = false;
  let busy = false;
  function draw(data) {
    $('meal-grid').replaceChildren();
    const items = Array.isArray(data.items) ? data.items : [];
    for (const item of items) {
      const card = document.createElement('article'); card.className = 'story-card meal-card';
      const label = document.createElement('span'); label.className = 'category-label'; label.textContent = item.kind;
      const title = document.createElement('h2'); title.textContent = item.title;
      const author = document.createElement('p'); author.className = 'meal-author'; author.textContent = `${item.source} · ${item.author || '作者未标注'}`;
      const heading = document.createElement('h3'); heading.textContent = '原文标注的用料';
      const ingredients = document.createElement('p'); ingredients.className = 'description'; ingredients.textContent = item.ingredients?.length ? item.ingredients.join('、') : '原文未提供结构化用料，请查看来源。';
      const source = document.createElement('a'); source.className = 'meal-source'; source.textContent = '查看原文与做法'; source.target = '_blank'; source.rel = 'noopener noreferrer';
      if (/^https:\/\/m\.xiachufang\.com\/recipe\/\d+\/$/.test(item.sourceUrl)) source.href = item.sourceUrl;
      const date = document.createElement('p'); date.className = 'meal-date'; date.textContent = `采集于 ${new Date(item.fetchedAt).toLocaleString('zh-CN')}`;
      card.append(label, title, author, heading, ingredients, source, date); $('meal-grid').append(card);
    }
    $('meal-empty').hidden = items.length > 0;
    $('meal-status').textContent = `${items.length} 条参考${data.updatedAt ? ' · 最近更新 ' + new Date(data.updatedAt).toLocaleString('zh-CN') : ''}`;
  }
  async function load() { draw(window.COMMUNITY_MEALS); loaded = true; $('refresh-meals').disabled = true; }
  $('refresh-meals').disabled = true;
  function route() { if (/^#meals(?:\/day\/\d+)?$/.test(location.hash) && $('community-recipes').open && !loaded) load(); }
  $('community-recipes').addEventListener('toggle', route);
  window.addEventListener('hashchange', route); route();
})();
