const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = (() => { try { return require('jsdom'); } catch { return require(path.resolve(__dirname, '../../test-runtime/node_modules/jsdom')); } })();
const dir = path.resolve(__dirname, '..');

function setup(hash = '#postpartum') {
  const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
    url: 'https://example.test/baby/' + hash,
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  const errors = [], scrolls = [], storage = [], prints = [], focuses = [];
  w.addEventListener('error', event => errors.push(event.error));
  w.scrollTo = (x, y) => scrolls.push([x, y]);
  w.requestAnimationFrame = callback => callback();
  w.print = () => prints.push(w.location.hash);
  w.fetch = () => { throw Error('Unexpected network request'); };
  w.Storage.prototype.setItem = function (key, value) { storage.push([key, value]); };
  const nativeFocus = w.HTMLElement.prototype.focus;
  w.HTMLElement.prototype.focus = function (options) {
    focuses.push({id: this.id, preventScroll: options?.preventScroll});
    nativeFocus.call(this, options);
  };
  // Read the actual index rather than maintaining a second script order.
  for (const script of w.document.querySelectorAll('script[src]')) {
    const name = script.getAttribute('src').split('?')[0];
    w.eval(fs.readFileSync(path.join(dir, name), 'utf8'));
  }
  const navigate = hash => {
    w.history.replaceState(null, '', hash);
    w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  };
  return {dom, w, errors, scrolls, storage, prints, focuses, navigate,
    $: id => w.document.getElementById(id),
    cards: () => [...w.document.querySelectorAll('#postpartum-panel [data-item]')],
    close: () => dom.window.close()};
}
function assertExclusive(s, visible) {
  for (const id of ['home', 'library', 'reader', 'meals', 'birth', 'postpartum']) {
    assert.equal(s.$(id).hidden, id !== visible, `${id} visibility when ${visible} is active`);
  }
}

test('Postpartum direct link renders the real chronology and is the sole visible module', () => {
  const s = setup();
  const guide = s.w.POSTPARTUM_GUIDE;
  assertExclusive(s, 'postpartum');
  assert.equal(s.$('postpartum-nav').getAttribute('aria-current'), 'page');
  assert.deepEqual([...s.w.document.querySelectorAll('.section-nav a')].map(link => link.id),
    ['today-nav', 'stories-nav', 'birth-nav', 'meals-nav', 'postpartum-nav']);
  assert.deepEqual([...s.$('postpartum-panel').querySelectorAll('[data-stage]')].map(node => node.dataset.stage),
    [...guide.stages].map(stage => stage.id));
  assert.equal(s.cards().length, guide.stages.reduce((sum, stage) => sum + stage.items.length, 0));
  assert.deepEqual(s.scrolls, [[0, 0]]);
  assert.equal(s.focuses.at(-1).id, 'postpartum-view-heading');
  assert.equal(s.focuses.at(-1).preventScroll, true);
  assert.equal(s.$('postpartum-alerts').querySelectorAll('.postpartum-alert-group').length, 2);
  assert.equal(s.errors.length, 0);
  s.close();
});

test('Stage and audience links retain each other without moving the page to the top', () => {
  const s = setup();
  const [first, second] = s.w.POSTPARTUM_GUIDE.stages;
  s.navigate(`#postpartum/${first.id}/baby`);
  assert.equal(s.$('postpartum-view-heading').textContent, first.label);
  assert.ok(s.cards().every(card => card.dataset.audience === 'baby'));
  let secondLink = s.$('postpartum-stages').querySelector(`[data-postpartum-view="${second.id}"]`);
  assert.equal(secondLink.hash, `#postpartum/${second.id}/baby`);
  s.scrolls.length = 0;
  s.navigate(secondLink.hash);
  assert.equal(s.$('postpartum-view-heading').textContent, second.label);
  assert.equal(s.$('postpartum-audiences').querySelector('[aria-current="page"]').dataset.postpartumAudience, 'baby');
  assert.equal(s.$('postpartum-stages').querySelectorAll('[aria-current="page"]').length, 1);
  const mother = s.$('postpartum-audiences').querySelector('[data-postpartum-audience="mother"]');
  assert.equal(mother.hash, `#postpartum/${second.id}/mother`);
  s.navigate(mother.hash);
  assert.ok(s.cards().every(card => card.dataset.audience === 'mother'));
  const daily = s.$('postpartum-stages').querySelector('[data-postpartum-view="daily"]');
  assert.equal(daily.hash, '#postpartum/daily/mother');
  s.navigate(daily.hash);
  assert.equal(s.cards().length, s.w.POSTPARTUM_GUIDE.daily.filter(item => item.audience === 'mother').length);
  assert.deepEqual(s.scrolls, []);
  assert.equal(s.focuses.at(-1).preventScroll, true);
  assert.equal(s.storage.length, 0);
  assert.equal(s.errors.length, 0);
  s.close();
});

test('Every rendered item has its precise source links and the source view includes dates and scope', () => {
  const s = setup();
  const guide = s.w.POSTPARTUM_GUIDE;
  const checkCards = items => {
    const byId = new Map(items.map(item => [item.id, item]));
    for (const card of s.cards()) {
      const item = byId.get(card.dataset.item);
      assert.ok(item, card.dataset.item);
      assert.deepEqual([...card.querySelectorAll('[data-source]')].map(link => link.dataset.source), [...item.refs]);
      for (const link of card.querySelectorAll('[data-source]')) {
        assert.equal(link.href, guide.sources[link.dataset.source].url);
        assert.equal(new URL(link.href).protocol, 'https:');
        assert.equal(link.target, '_blank');
        assert.ok(link.rel.split(' ').includes('noopener'));
        assert.ok(link.rel.split(' ').includes('noreferrer'));
      }
    }
  };
  checkCards(guide.stages.flatMap(stage => stage.items));
  s.navigate('#postpartum/daily');
  checkCards(guide.daily);
  s.navigate('#postpartum/sources/baby');
  const sourceItems = [...s.$('postpartum-panel').querySelectorAll('.postpartum-source-list > li')];
  assert.equal(sourceItems.length, Object.keys(guide.sources).length);
  for (const item of sourceItems) {
    const source = guide.sources[item.dataset.source];
    assert.ok(item.textContent.includes(source.date));
    assert.ok(item.textContent.includes(source.scope));
    assert.equal(item.querySelector('a').href, source.url);
  }
  assert.equal(s.$('postpartum-stages').querySelector('[data-postpartum-view="daily"]').hash, '#postpartum/daily/baby');
  assert.equal(s.errors.length, 0);
  s.close();
});

test('Filtered stages show an explicit empty state, and display text cannot become markup', () => {
  const s = setup();
  const guide = s.w.POSTPARTUM_GUIDE;
  const stage = guide.stages[0];
  stage.items = [];
  s.navigate(`#postpartum/${stage.id}/mother`);
  assert.equal(s.cards().length, 0);
  assert.match(s.$('postpartum-panel').querySelector('.postpartum-empty').textContent, /没有单独列出/);
  guide.daily.push({id: 'test-text', audience: 'baby', kind: '家庭照护', title: '<img src=x onerror=alert(1)>',
    text: ['<script>window.unwanted = true</script>'], refs: [Object.keys(guide.sources)[0]]});
  s.navigate('#postpartum/daily/baby');
  const card = s.$('postpartum-panel').querySelector('[data-item="test-text"]');
  assert.equal(card.querySelector('h3').textContent, '<img src=x onerror=alert(1)>');
  assert.equal(card.querySelectorAll('img,script').length, 0);
  assert.equal(s.w.unwanted, undefined);
  assert.equal(s.errors.length, 0);
  s.close();
});

test('Current-view print does not replace the selection, and invalid routes safely return to overview', () => {
  const s = setup();
  const stage = s.w.POSTPARTUM_GUIDE.stages[1];
  s.navigate(`#postpartum/${stage.id}/baby`);
  const before = s.cards().map(card => card.dataset.item);
  s.$('postpartum-panel').querySelector('[data-postpartum-print]').click();
  assert.deepEqual(s.prints, [`#postpartum/${stage.id}/baby`]);
  assert.deepEqual(s.cards().map(card => card.dataset.item), before);
  assert.equal(s.$('postpartum-panel').querySelectorAll('[data-audience="mother"]').length, 0);
  for (const invalid of ['#postpartum/unknown-stage', '#postpartum/daily/unknown-audience', '#postpartum/daily/baby/extra', '#postpartum//', '#postpartum/daily/']) {
    s.navigate(invalid);
    assert.equal(s.w.location.hash, '#postpartum', invalid);
    assertExclusive(s, 'postpartum');
    assert.equal(s.$('postpartum-stages').querySelector('[aria-current="page"]').dataset.postpartumView, 'overview');
  }
  assert.equal(s.storage.length, 0);
  assert.equal(s.errors.length, 0);
  s.close();
});

test('Existing birth topics, 84 meal profiles and 100 stories remain accessible with no postpartum persistence', () => {
  const s = setup('#postpartum/daily/mother');
  s.navigate('#birth/recovery');
  assertExclusive(s, 'birth');
  assert.ok(s.$('birth-topic-heading').textContent.length > 0);
  assert.equal(s.$('postpartum-panel').children.length, 0);
  for (let day = 1; day <= 42; day++) {
    s.navigate('#meals/day/' + day);
    assertExclusive(s, 'meals');
    assert.match(s.$('day-heading').textContent, new RegExp(`第 ${day} 天`));
    for (const feeding of ['lactating', 'nonlactating']) {
      const menu = s.w.MEAL_NUTRITION.buildDay(day, feeding);
      assert.ok(menu.meals.length > 0);
    }
  }
  // No settings or health information are written by timeline navigation.
  s.navigate('#postpartum/daily/baby');
  assert.equal(s.storage.length, 0);
  assertExclusive(s, 'postpartum');
  assert.equal(s.w.STORIES.length, 100);
  s.navigate('#story/' + s.w.STORIES[0].id);
  assertExclusive(s, 'reader');
  assert.ok(s.$('reader-body').children.length > 0);
  assert.equal(s.$('postpartum-panel').children.length, 0);
  assert.ok(s.storage.every(([key]) => key === 'little-story:v1'), 'Only the existing story reading record may be persisted');
  s.scrolls.length = 0;
  s.navigate('#postpartum');
  assert.deepEqual(s.scrolls, [[0, 0]]);
  assert.equal(s.errors.length, 0);
  s.close();
});
