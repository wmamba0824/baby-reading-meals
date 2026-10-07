(() => {
  'use strict';
  const plan = window.MEAL_PLAN;
  const $ = id => document.getElementById(id);
  let day = 1;
  let rendered = 0;
  let profile = 'lactating';
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function choose(value) { location.hash = `meals/day/${value}`; }
  function selection(label, value, selected, className) {
    const button = element('button', className, label);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', className === 'week-button' ? `第 ${Math.ceil(value / 7)} 周` : `第 ${value} 天`);
    if (selected) button.setAttribute('aria-current', 'date');
    button.onclick = () => choose(value);
    return button;
  }
  function recipeDetails(recipe) {
    const details = element('details', 'recipe-detail');
    const summary = element('summary', 'recipe-summary');
    summary.append(element('span', 'recipe-name', recipe.name), element('span', 'recipe-time', `约 ${recipe.minutes} 分钟`));
    const body = element('div', 'recipe-body');
    body.append(element('p', 'recipe-serving', '用量：1 位成人参考份量'));
    if (recipe.allergens.length) body.append(element('p', 'recipe-allergens', `含：${recipe.allergens.join('、')}`));
    body.append(element('h4', '', '食材'));
    const ingredients = element('ul', 'ingredient-list');
    recipe.ingredients.forEach(text => ingredients.append(element('li', '', text)));
    body.append(ingredients, element('h4', '', '做法'));
    const steps = element('ol', 'recipe-steps');
    recipe.steps.forEach(text => steps.append(element('li', '', text)));
    body.append(steps);
    if (recipe.tip) body.append(element('p', 'recipe-tip', recipe.tip));
    const provenance = element('details', 'recipe-data');
    provenance.append(element('summary', '', '这道菜的营养数据条目'));
    const links = element('div', 'plan-sources');
    for (const key of new Set(recipe.items.filter(item => item.foodKey).map(item => item.foodKey))) {
      const food = window.FOOD_DATA.foods[key];
      const link = element('a', '', `${food.name} · FDC ${food.fdcId}`);
      link.href = food.url; link.target='_blank'; link.rel='noopener noreferrer'; links.append(link);
    }
    provenance.append(links); body.append(provenance);
    details.append(summary, body);
    return details;
  }
  function render() {
    const current = window.MEAL_NUTRITION.buildDay(day, profile);
    document.querySelectorAll('[data-feeding]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.feeding === profile)));
    $('meal-weeks').replaceChildren(...Array.from({ length: 6 }, (_, index) => selection(`${index + 1} 周`, index * 7 + 1, current.week === index + 1, 'week-button')));
    $('meal-days').replaceChildren(...Array.from({ length: 7 }, (_, index) => {
      const value = (current.week - 1) * 7 + index + 1;
      return selection(String(value), value, day === value, 'day-button');
    }));
    $('day-week').textContent = `第 ${current.week} 周 · 共 42 天`;
    $('day-heading').textContent = `第 ${day} 天 · ${profile === 'lactating' ? '哺乳' : '不哺乳'}参考`;
    $('day-note').textContent = current.note;
    $('day-overview').textContent = `早餐：${current.meals[0].recipes.map(recipe => recipe.name).join('、')} · 当日约 ${Math.round(current.nutrients.kcal / 10) * 10} 千卡`;
    $('previous-day').disabled = day === 1;
    $('next-day').disabled = day === plan.days.length;
    $('day-meals').replaceChildren(...current.meals.map(meal => {
      const card = element('article', 'meal-slot');
      const heading = element('div', 'meal-slot-heading');
      heading.append(element('h3', '', meal.label), element('span', '', `${meal.time} · 时间可调整`));
      const names = meal.recipes.map(recipe => recipe.name).join(' + ');
      card.append(heading, element('p', 'meal-menu', names));
      meal.recipes.forEach(recipe => card.append(recipeDetails(recipe)));
      return card;
    }));
    const units = {kcal:'千卡',protein:'克',fat:'克',carbs:'克',fiber:'克',calcium:'毫克',iron:'毫克',sodium:'毫克'};
    const names = {kcal:'能量',protein:'蛋白质',fat:'脂肪',carbs:'碳水化合物',fiber:'膳食纤维',calcium:'钙',iron:'铁',sodium:'钠'};
    $('nutrition-values').replaceChildren(...Object.entries(current.nutrients).map(([key,value]) => {
      const item=element('div','nutrient');
      const shown = ['kcal','calcium','sodium'].includes(key) ? Math.round(value/10)*10 : Math.round(value*10)/10;
      item.append(element('dt','',names[key]),element('dd','',`约 ${shown} ${units[key]}`)); return item;
    }));
    $('nutrition-difference').textContent = profile === 'lactating' ? `今天的哺乳版比同日不哺乳版多约 ${Math.round(current.extraKcal)} 千卡：主食合计增加 60 克干大米，另加 150 毫升奶和 5 克核桃。` : '不哺乳版保留均衡三餐和加餐，不计入哺乳所需的额外能量；实际食量按体型、活动、食欲和恢复情况调整。';
    const week = window.MEAL_NUTRITION.weekSummary(current.week, profile);
    $('meal-variety').textContent = `今日约 ${current.quality.foodCount} 种主要食材 · 蔬菜约 ${Math.round(current.quality.vegetables)} 克（深色约 ${Math.round(current.quality.darkVegetables)} 克） · 本周约 ${week.foodCount} 种食材、${week.fishMeals} 餐低汞鱼，共约 ${Math.round(week.fishGrams)} 克。`;
    rendered = day;
  }
  $('previous-day').onclick = () => { if (day > 1) choose(day - 1); };
  $('next-day').onclick = () => { if (day < plan.days.length) choose(day + 1); };
  document.querySelectorAll('[data-feeding]').forEach(button => button.onclick = () => {profile=button.dataset.feeding;render();});
  for (const source of plan.sources) {
    const link = element('a', '', source.title); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; $('plan-sources').append(link);
  }
  function route(event) {
    const match = location.hash.match(/^#meals(?:\/day\/(\d+))?$/);
    if (!match) return;
    const requested = Number(match[1] || 1);
    day = Number.isInteger(requested) && requested >= 1 && requested <= plan.days.length ? requested : 1;
    if (day !== rendered) { render(); if (event) $('day-heading').focus({ preventScroll: true }); }
    document.title = `第 ${day} 天月子餐 · Baby`;
  }
  window.addEventListener('hashchange', route);
  route();
})();
