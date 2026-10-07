const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assetDir = process.argv[2] || path.resolve(__dirname, '..');
const appSource = fs.readFileSync(path.join(assetDir, 'app.js'), 'utf8');

// Run both route handlers and the actual menu buttons; record every scroll reset.
// This checks navigation logic, not browser layout or native scroll anchoring.
function verify(source) {
  class Element {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.hidden = false; this.children = []; this.dataset = {}; this.attributes = {}; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this.attributes[name] = value; }
    toggleAttribute(name, present) { if (present) this.attributes[name] = ''; else delete this.attributes[name]; }
    addEventListener() {}
    focus(options) { assert.equal(options.preventScroll, true); }
  }
  const nodes = new Map();
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id); };
  get('meals').hidden = true;
  const feeding = ['lactating', 'nonlactating'].map(profile => { const node = new Element('button'); node.dataset.feeding = profile; return node; });
  const listeners = new Map();
  const scrolls = [];
  let hash = '#meals/day/1';
  const location = {
    get hash() { return hash; },
    set hash(value) { hash = value ? '#' + String(value).replace(/^#/, '') : ''; },
    pathname: '/', search: ''
  };
  const window = {
    STORIES: [], innerHeight: 800, scrollY: 640,
    addEventListener(name, handler) { if (!listeners.has(name)) listeners.set(name, []); listeners.get(name).push(handler); },
    scrollTo(x, y) { scrolls.push([x, y]); this.scrollY = y; }
  };
  const document = {
    title: '', getElementById: get, createElement: tag => new Element(tag),
    querySelectorAll: selector => selector === '[data-feeding]' ? feeding : [],
    documentElement: {scrollHeight: 5000, style: {setProperty() {}}}
  };
  const context = vm.createContext({window, document, location,
    localStorage: {getItem() {return null;}, setItem() {}}, history: {replaceState() {}},
    requestAnimationFrame: callback => callback(), setTimeout: () => 0, clearTimeout() {}
  });
  for (const file of ['food-data.js', 'meal-plan.js', 'meal-nutrition.js']) vm.runInContext(fs.readFileSync(path.join(assetDir, file), 'utf8'), context, {filename: file});
  vm.runInContext(source, context, {filename: 'app.js'});
  vm.runInContext(fs.readFileSync(path.join(assetDir, 'meal-plan-ui.js'), 'utf8'), context, {filename: 'meal-plan-ui.js'});
  assert.deepEqual(scrolls, [[0, 0]], 'Entering meals should start at the top');
  function dispatch() { for (const handler of listeners.get('hashchange')) handler({type: 'hashchange'}); }
  let checked = 0;
  function stays(action, expectedDay) {
    scrolls.length = 0; window.scrollY = 640;
    action(); dispatch();
    assert.equal(get('day-heading').textContent.startsWith(`第 ${expectedDay} 天 ·`), true);
    assert.equal(scrolls.length, 0, `Day ${expectedDay} navigation must not reset scroll`);
    assert.equal(window.scrollY, 640); checked++;
  }
  for (let week = 0; week < 6; week++) {
    stays(() => get('meal-weeks').children[week].onclick(), week * 7 + 1);
    for (let index = 1; index < 7; index++) stays(() => get('meal-days').children[index].onclick(), week * 7 + index + 1);
  }
  stays(() => get('previous-day').onclick(), 41);
  stays(() => get('next-day').onclick(), 42);
  stays(() => { location.hash = '#meals/day/14'; }, 14); // Browser back/forward uses the same event.
  stays(() => { location.hash = '#meals/day/21'; }, 21);
  scrolls.length = 0; window.scrollY = 640;
  feeding[1].onclick();
  assert.equal(get('day-heading').textContent.includes('不哺乳'), true);
  assert.equal(scrolls.length, 0);
  location.hash = ''; dispatch();
  assert.equal(get('meals').hidden, true);
  scrolls.length = 0; window.scrollY = 640;
  location.hash = '#meals/day/21'; dispatch();
  assert.equal(get('meals').hidden, false);
  assert.deepEqual(scrolls, [[0, 0]], 'Reentering from stories should still start at the top');
  return checked;
}

const internalTransitions = verify(appSource);
const oldSource = appSource.replace("if (enteringMeals) window.scrollTo(0, 0);", "window.scrollTo(0, 0);");
assert.notEqual(oldSource, appSource);
assert.throws(() => verify(oldSource), /must not reset scroll/, 'The regression check must catch the previous behavior');
console.log(JSON.stringify({passed: true, internalTransitions, feedingToggle: true, sectionReentry: true, oldBehaviorRejected: true}));
