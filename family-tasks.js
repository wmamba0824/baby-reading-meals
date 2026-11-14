(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const section = $('family-tasks');
  const calendar = window.BABY_TODAY;
  if (!section || !calendar) return;

  const key = 'baby:family-tasks:v1';
  const form = $('family-form');
  const title = $('family-title');
  const date = $('family-date');
  const person = $('family-person');
  const list = $('family-list');
  const status = $('family-status');
  const filters = [...section.querySelectorAll('[data-task-filter]')];
  const sourcePattern = /^#postpartum(?:\/[a-z0-9-]+){0,2}$/;
  let tasks = [];
  let filter = 'today';
  let editing = null;
  let guide = null;
  let lastDay;

  function read() {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const records = JSON.parse(stored);
    if (!Array.isArray(records) || records.some(task => !task ||
      typeof task.id !== 'string' || typeof task.title !== 'string' ||
      typeof task.date !== 'string' || calendar.dateNumber(task.date) === null)) {
      throw new Error('Invalid task records');
    }
    return records;
  }

  function save(change, message) {
    try {
      const next = change(read());
      localStorage.setItem(key, JSON.stringify(next));
      tasks = next;
      status.textContent = message;
      return true;
    } catch {
      status.textContent = '无法保存。请检查浏览器是否允许存储网站数据。';
      return false;
    }
  }

  function reload() {
    try {
      tasks = read();
    } catch {
      status.textContent = '暂时无法读取已保存的待办。';
    }
    render();
  }

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function render() {
    const today = calendar.todayString();
    lastDay = today;
    const due = tasks.filter(task => !task.done && task.date <= today).length;
    const completed = tasks.filter(task => task.completedOn === today).length;
    $('family-count').textContent = `今日待完成 ${due} 项 · 今天完成 ${completed} 项`;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.taskFilter === filter)));
    const visible = tasks.filter(task => {
      if (filter === 'upcoming') return !task.done && task.date > today;
      if (filter === 'today') return task.date === today || task.completedOn === today || (!task.done && task.date < today);
      return true;
    }).sort((a, b) => Number(a.done) - Number(b.done) || a.date.localeCompare(b.date));
    $('family-empty').textContent = visible.length ? '' : {
      today: '今天没有待办。可以加一件小事，或从产后时间轴带入。',
      upcoming: '还没有安排在以后日期的待办。',
      all: '还没有待办。'
    }[filter];
    list.replaceChildren(...visible.map(task => renderTask(task, today)));
  }

  function renderTask(task, today) {
    const item = node('li', '', 'family-task');
    item.dataset.taskId = task.id;
    const check = node('input');
    check.type = 'checkbox';
    check.checked = task.done;
    check.setAttribute('aria-label', `完成：${task.title}`);
    check.addEventListener('change', () => {
      const done = check.checked;
      if (save(records => records.map(current => current.id === task.id ? {
        ...current, done, completedOn: done ? calendar.todayString() : ''
      } : current), done ? '已完成待办。' : '已恢复为未完成。')) {
        render();
        focusTask(task.id, 'input');
      } else {
        check.checked = task.done;
      }
    });
    const body = node('div');
    body.append(node('strong', task.title), node('small', [
      task.date, task.person && `负责人：${task.person}`, !task.done && task.date < today && '已过期'
    ].filter(Boolean).join(' · ')));
    if (sourcePattern.test(task.source || '')) {
      const link = node('a', '查看时间轴依据');
      link.href = task.source;
      body.append(link);
    }
    const edit = node('button', '编辑');
    edit.type = 'button';
    edit.setAttribute('aria-label', `编辑：${task.title}`);
    edit.addEventListener('click', () => openEditor(task));
    item.append(check, body, edit);
    return item;
  }

  function focusTask(id, control) {
    const item = [...list.children].find(row => row.dataset.taskId === id);
    (item?.querySelector(control) || $('family-add')).focus({preventScroll:true});
  }

  function reveal() {
    section.scrollIntoView?.({block:'start'});
  }

  function openEditor(task = null, template = null) {
    editing = task?.id ?? null;
    guide = template?.source || task?.source || null;
    title.value = task?.title ?? template?.title ?? '';
    date.value = task?.date ?? (template ? '' : calendar.todayString());
    person.value = task?.person ?? '';
    $('family-form-title').textContent = task ? '编辑待办' : '新建待办';
    $('family-guide-hint').hidden = !template;
    $('family-delete').hidden = !task;
    form.hidden = false;
    if (!section.closest('[hidden]')) {
      title.focus({preventScroll:true});
      form.scrollIntoView?.({block:'nearest'});
    }
  }

  function closeEditor() {
    const id = editing;
    form.hidden = true;
    editing = null;
    guide = null;
    focusTask(id, 'button');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = title.value.trim();
    if (!name || calendar.dateNumber(date.value) === null) {
      status.textContent = '请填写待办内容和有效日期。';
      return;
    }
    const fields = {title:name, date:date.value, person:person.value.trim(), source:guide};
    const change = records => {
      if (editing) return records.map(task => task.id === editing ? {...task, ...fields} : task);
      const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      return [...records, {id, ...fields, done:false, completedOn:''}];
    };
    if (!save(change, '待办已保存。')) return;
    filter = fields.date > calendar.todayString() ? 'upcoming' : 'today';
    if (tasks.some(task => task.id === editing && task.done)) filter = 'all';
    render();
    closeEditor();
  });

  $('family-add').addEventListener('click', () => openEditor());
  $('family-cancel').addEventListener('click', closeEditor);
  $('family-delete').addEventListener('click', () => {
    if (!editing || !window.confirm('删除这条待办？')) return;
    if (save(records => records.filter(task => task.id !== editing), '待办已删除。')) {
      render();
      closeEditor();
    }
  });
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.taskFilter;
    render();
  }));

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-family-task]');
    if (!button) return;
    openEditor(null, {title:button.dataset.familyTask, source:button.dataset.familySource});
    location.hash = 'family-tasks';
  });
  window.addEventListener('hashchange', () => {
    if (location.hash !== '#family-tasks') return;
    requestAnimationFrame(() => {
      reveal();
      (form.hidden ? section : title).focus({preventScroll:true});
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) reload();
  });
  window.addEventListener('focus', () => {
    if (lastDay !== calendar.todayString()) render();
  });
  section.hidden = false;
  reload();
  if (location.hash === '#family-tasks') requestAnimationFrame(reveal);
})();
