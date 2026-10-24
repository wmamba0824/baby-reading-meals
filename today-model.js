/* Calendar dates are compared as civil dates, never as elapsed 24-hour periods. */
(() => {
  'use strict';
  const DAY = 86400000;
  function dateNumber(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 1900 || year > 2200) return null;
    const time = Date.UTC(year, month - 1, day), checked = new Date(time);
    return checked.getUTCFullYear() === year && checked.getUTCMonth() === month - 1 && checked.getUTCDate() === day ? time / DAY : null;
  }
  function todayString(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  function validate(input, now = new Date()) {
    const today = dateNumber(todayString(now));
    if (!input || !['expecting', 'born'].includes(input.phase)) return '请选择目前的阶段。';
    const chosen = dateNumber(input.phase === 'born' ? input.birthDate : input.dueDate);
    if (chosen === null) return input.phase === 'born' ? '请填写有效的实际出生日期。' : '请填写有效的预产期。';
    if (input.phase === 'born' && chosen > today) return '实际出生日期不能晚于今天；尚未出生时请选择“还在期待”。';
    if (input.phase === 'born' && !['lactating', 'nonlactating'].includes(input.feeding)) return '请选择哺乳或不哺乳参考；混合喂养可选接近的参考，并按实际需要调整。';
    const start = dateNumber(input.readingStart);
    if (start === null || start > today) return '阅读开始日期须为今天或过去的有效日期。';
    if (!Number.isInteger(Number(input.readingFirst)) || Number(input.readingFirst) < 1 || Number(input.readingFirst) > 100) return '故事起点请选择第 1～100 篇。';
    return '';
  }
  function state(profile, now = new Date()) {
    const today = todayString(now), civilToday = dateNumber(today);
    const born = profile.phase === 'born' && dateNumber(profile.birthDate) !== null && dateNumber(profile.birthDate) <= civilToday;
    const age = born ? civilToday - dateNumber(profile.birthDate) : null;
    const due = dateNumber(profile.dueDate);
    const remaining = !born && due !== null ? due - civilToday : null;
    const gestation = remaining === null ? null : 280 - remaining;
    const readStart = dateNumber(profile.readingStart);
    const elapsed = readStart === null ? 0 : Math.max(0, civilToday - readStart);
    const first = Math.min(100, Math.max(1, Number(profile.readingFirst) || 1));
    const readingTotal = first - 1 + elapsed;
    let stages = [];
    if (born) {
      if (age <= 2) stages = age === 0 ? ['first-day', 'day-2-3', 'week-1'] : ['day-2-3', 'week-1'];
      else if (age < 7) stages = ['week-1'];
      else if (age <= 14) stages = ['week-2', 'week-1'];
      else if (age < 28) stages = ['month-1'];
      else if (age < 35) stages = ['month-1', 'week-6'];
      else if (age <= 42) stages = ['week-6'];
      else stages = ['later'];
    }
    return {today, born, age, remaining, gestation, stages, upcoming: born && age > 14 && age < 28,
      mealDay: born ? age % 42 + 1 : 1, mealPreview: !born, mealCycle: born && age >= 42,
      storyDay: readingTotal % 100 + 1, storyRound: Math.floor(readingTotal / 100) + 1};
  }
  window.BABY_TODAY = {dateNumber, todayString, validate, state};
})();
