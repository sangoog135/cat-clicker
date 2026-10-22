/* КЛИКЕР "КОТ" — логика игры */

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const SAVE_KEY = 'catClickerSave';
const SPRITES = {
  stand: 'sprites/stand.png',
  // Шаг влево: морда смотрит влево (исходные кадры 2 и 3)
  walkL1: 'sprites/walkL1.png',
  walkL2: 'sprites/walkL2.png',
  // Шаг вправо: морда смотрит вправо (исходные кадры 10 и 11)
  walkR1: 'sprites/walkR1.png',
  walkR2: 'sprites/walkR2.png',
  sit: 'sprites/sit.png',
  happy: 'sprites/happy.png',
  happySit: 'sprites/happySit.png',   // сидит и радуется
  wave: ['sprites/wave1.png', 'sprites/wave2.png', 'sprites/wave3.png']
};

/* ---------- состояние ---------- */

let state = {
  coins: 0,
  total: 0
};

let memoryOnly = false;

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.coins = data.coins || 0;
    state.total = data.total || 0;
  } catch (e) {
    memoryOnly = true;
  }
}

function save() {
  if (memoryOnly) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    memoryOnly = true;
  }
}

/* ---------- форматирование ---------- */

function fmt(n) {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(2) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(2) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2) + 'B';
  return (n / 1e12).toFixed(2) + 'T';
}

/* ---------- экран ---------- */

const cat = $('#cat');
const catImg = $('#catImg');
const catImg2 = $('#catImg2');
const floaters = $('#floaters');

let frontIsA = true;

/* Плавная смена позы: старый спрайт гаснет, новый проявляется. */
function setCat(src) {
  const cur = frontIsA ? catImg : catImg2;
  const next = frontIsA ? catImg2 : catImg;
  if (cur.getAttribute('src') === src) return;
  next.src = src;
  next.style.transition = 'none';
  next.style.opacity = '0';
  void next.offsetWidth; // перезапуск перехода
  next.style.transition = 'opacity 110ms linear';
  next.style.opacity = '1';
  cur.style.transition = 'opacity 110ms linear';
  cur.style.opacity = '0';
  frontIsA = !frontIsA;
}

/* Фон 100x50. Профиль травы — в data.js (GROUND_PROFILE). */
const BG = { w: 100, h: 50, groundY: 38 };

/* Ставит кота на линию травы в точке X экрана (кот идёт по холму). */
function setCatGround(screenX) {
  const game = document.querySelector('.game');
  const stage = $('#stage');
  const wrap = $('#catWrap');
  if (!game || !stage || !wrap) return;
  const gRect = game.getBoundingClientRect();
  const sRect = stage.getBoundingClientRect();
  if (!gRect.width || !gRect.height) return;
  const fx = Math.floor(Math.max(0, Math.min(BG.w - 1, (screenX / gRect.width) * BG.w)));
  const gy = (typeof GROUND_PROFILE !== 'undefined' && GROUND_PROFILE[fx] !== undefined)
    ? GROUND_PROFILE[fx]
    : BG.groundY;
  const yGround = gRect.top + gRect.height * gy / BG.h;
  wrap.style.bottom = Math.round(sRect.bottom - yGround) + 'px';
}

/* Считает линию травы на экране — кот всегда стоит на земле. */
function layout() {
  const game = document.querySelector('.game');
  const stage = $('#stage');
  if (!game || !stage) return;
  const gRect = game.getBoundingClientRect();
  if (!gRect.height) return;
  // По умолчанию — середина экрана.
  setCatGround(gRect.left + gRect.width / 2);
}

window.addEventListener('resize', layout);
window.addEventListener('load', layout);
if (window.ResizeObserver) {
  new ResizeObserver(layout).observe($('#stage'));
}
layout();
setTimeout(layout, 200);

function floatUp(text, big) {
  const r = cat.getBoundingClientRect();
  const s = $('#stage').getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'floater' + (big ? ' big' : '');
  el.textContent = text;
  el.style.left = (r.left - s.left + r.width / 2 + (Math.random() * 40 - 20)) + 'px';
  el.style.top = (r.top - s.top + r.height * 0.35) + 'px';
  floaters.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

/* ---------- клик ---------- */

let lastClickAt = performance.now();
let happyUntil = 0;
let waveUntil = 0;
let walkFrame = 0;
let walkTimer = 0;

function onCatClick(e) {
  e.preventDefault();
  e.stopPropagation();   // клик по коту не должен ловиться ещё и сценой
  const now = performance.now();
  lastClickAt = now;

  let power = clickPower();
  let big = false;

  // Если кот гуляет — поймать его приятно.
  if (catState === 'walking') {
    big = true;
    floatUp('ПОЙМАЛ!', true);
    if (typeof playSound === 'function') playSound('meow', 0.8);
    catState = 'idle';
    catX = 0;
    cat.style.transform = 'translateX(0)';
  }

  feed(power, big);
}

/* Клик в любом месте сцены — кот садится и радуется. */
function onStageClick(e) {
  lastClickAt = performance.now();
  feed(clickPower(), false);
}

/* Общая реакция на клик: монеты + кот садится и радуется. */
function feed(power, big) {
  const levelBefore = catLevel();
  // Случайные х2: пока длится, мурлыков в два раза больше.
  const mult = x2Until > performance.now() ? BOOM.mult : 1;
  state.coins += power * mult;
  state.total += power * mult;
  if (catLevel() > levelBefore && typeof playSound === 'function') playSound('levelup', 0.6);
  if (typeof playSound === 'function') playSound('purr', 0.7);
  floatUp('+' + fmt(power), big);

  // Анимации
  cat.classList.remove('jump');
  void cat.offsetWidth;
  cat.classList.add('jump');
  happyUntil = performance.now() + CAT.happyTime;

  $('#hint').classList.add('hide');
  updateUI();
}

/* ---------- поведение кота ---------- */

let catState = 'idle';   // idle | walking | sit
let catX = 0;            // смещение от центра, px
let walkDir = 1;         // 1 — вправо, -1 — влево
let turnUntil = 0;       // пауза на разворот
let walkUntil = 0;
let nextWalkAt = performance.now() + CAT.walkEvery * 1000;

function catTick(now, dt) {
  // Радость после клика: кот сидит и радуется
  if (catState === 'idle' && now < happyUntil) {
    setCat(SPRITES.happySit);
    cat.classList.add('happy');
    return;
  }
  cat.classList.remove('happy');

  // Машет в камеру (после престижа)
  if (catState === 'idle' && now < waveUntil) {
    setCat(SPRITES.wave[walkFrame % 3]);
    walkFrame++;
    cat.classList.add('happy');
    return;
  }

  if (catState === 'walking') {
    // Дошёл до края — поворачивается.
    if (now < turnUntil) {
      setCat(SPRITES.stand);
      return;
    }
    catX += walkDir * CAT.walkSpeed * dt;
    const limit = Math.max(40, $('#stage').clientWidth / 2 - 90);
    if (Math.abs(catX) >= limit) {
      catX = walkDir * limit;
      walkDir *= -1;
      turnUntil = now + 350;   // пауза на разворот
    }
    // Делим на масштаб: сдвиг в CSS-пикселях задан в реальных экранах,
    // а translateX на коте умножается масштабом родителя (иначе улетает за экран).
    cat.style.transform = 'translateX(' + (catX / catScale()) + 'px)';
    // Кот идёт по линии травы — точно по холму, а не по воздуху.
    const game = document.querySelector('.game');
    const gRect = game.getBoundingClientRect();
    setCatGround(gRect.left + gRect.width / 2 + catX);
    // Морда всегда смотрит в сторону движения — кот идёт вперёд, а не назад.
    const step = Math.floor(now / 200) % 2;
    if (walkDir > 0) setCat(step ? SPRITES.walkR2 : SPRITES.walkR1);
    else setCat(step ? SPRITES.walkL2 : SPRITES.walkL1);
    return;
  }

  // Давно не кликали — кот садится
  if (now - lastClickAt > CAT.sitAfter * 1000) {
    if (catState !== 'sit') {
      catState = 'sit';
      setCat(SPRITES.sit);
    }
    return;
  }
  if (catState === 'sit') {
    catState = 'idle';
    catX = 0;
    cat.style.transform = 'translateX(0)';
  }
  setCat(SPRITES.stand);
}

function maybeWalk(now) {
  if (catState === 'walking') return;
  if (now < nextWalkAt) return;
  nextWalkAt = now + CAT.walkEvery * 1000 * (0.7 + Math.random() * 0.6);
  catState = 'walking';
  walkDir = Math.random() < 0.5 ? -1 : 1;
  catX = 0;
  cat.style.transform = 'translateX(0)';
}

/* ---------- интерфейс ---------- */

/* Уровень кота: растёт каждые CAT.levelStep мурлыков (без верхней границы). */
function catLevel() {
  return Math.floor(state.total / CAT.levelStep) + 1;
}

/* Сила клика: каждый уровень добавляет +1 мурлык. */
function clickPower() {
  // Максимум 10 мурлыков за клик, даже на большом уровне.
  return Math.min(catLevel(), CAT.clickMax);
}

function updateUI() {
  $('#coins').textContent = fmt(state.coins);
  const lv = $('#level');
  if (lv) lv.textContent = catLevel();
  const pw = $('#perClick');
  if (pw) pw.textContent = fmt(clickPower() * (x2Until > performance.now() ? BOOM.mult : 1));
  // Кот растёт с уровнем (центрирование — через left:50% + margin-left).
  const scale = catScale();
  const wrap = $('#catWrap');
  if (wrap) wrap.style.transform = 'scale(' + scale + ')';
}

/* Насколько кот вырос на текущем уровне. */
function catScale() {
  return Math.min(CAT.levelMaxSize, 1 + (catLevel() - 1) * 0.07);
}

/* Реакция на смену языка (вызывается из i18n.js) */
function onLangChanged() {
  if (typeof refreshIntroDialog === 'function') refreshIntroDialog();
  if (typeof applyI18n === 'function') applyI18n();
  updateLangButtons();
  updateSoundButton();
  updateUI();
}

/* Реакция на смену имени */
function onNameChanged() {
  if (typeof refreshIntroDialog === 'function') refreshIntroDialog();
}

/* Подсветка активного языка */
function updateLangButtons() {
  const lang = (typeof getSettings === 'function') ? getSettings().lang : 'ru';
  const ru = $('#lang-ru');
  const en = $('#lang-en');
  if (ru) ru.classList.toggle('active', lang === 'ru');
  if (en) en.classList.toggle('active', lang === 'en');
}

/* Надпись на кнопке «ЗВУК»: ВКЛ/ВЫКЛ */
function updateSoundButton() {
  const btn = $('#sound-toggle');
  if (!btn) return;
  btn.textContent = (typeof soundOn === 'function' && soundOn()) ? t('on') : t('off');
}

/* ---------- цикл ---------- */

let last = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  maybeWalk(now);
  catTick(now, dt);
  dayNightTick(now);
  boomTick(now);
  requestAnimationFrame(loop);
}

/* ---------- день и ночь ---------- */

/* Фон меняется каждые 5 минут: день — bg.png, ночь — bg2.png. */
let isNight = false;
let phaseUntil = performance.now() + DAYNIGHT.period;

function dayNightTick(now) {
  if (now < phaseUntil) return;
  phaseUntil = now + DAYNIGHT.period;
  isNight = !isNight;
  const game = $('#game');
  if (game) game.classList.toggle('night', isNight);
}

/* ---------- случайные х2 мурлыки ---------- */

/* Раз в 2–4 минуты на минуту включаются двойные мурлыки. */
let x2Until = 0;
let nextX2At = performance.now() + BOOM.every + Math.random() * BOOM.every;

function boomTick(now) {
  if (x2Until <= 0 && now >= nextX2At) {
    x2Until = now + BOOM.span;
    updateUI();
    if (typeof playSound === 'function') playSound('levelup', 0.7);
  } else if (x2Until > 0 && now >= x2Until) {
    x2Until = 0;
    nextX2At = now + BOOM.every + Math.random() * BOOM.every;
    updateUI();
  }
  const badge = $('#x2-badge');
  if (!badge) return;
  if (x2Until > 0) {
    badge.hidden = false;
    badge.textContent = t('x2') + ' ' + Math.ceil((x2Until - now) / 1000);
  } else {
    badge.hidden = true;
  }
}

/* ---------- старт ---------- */

let gameStarted = false;

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  window.gameReady = true;

  // Показываем игру (до этого был только экран знакомства).
  $('#game').hidden = false;

  load();
  if (typeof applyI18n === 'function') applyI18n();
  updateLangButtons();
  updateUI();
  cat.addEventListener('click', onCatClick);
  cat.addEventListener('touchstart', onCatClick, { passive: false });
  // Клик в любом месте сцены тоже кормит кота.
  const stage = $('#stage');
  stage.addEventListener('click', onStageClick);
  stage.addEventListener('touchstart', (e) => {
    if (e.target.closest('.cat')) return;
    onStageClick(e);
  }, { passive: false });

  // Поддержка разработчика
  const donateBtn = $('#donate-btn');
  if (donateBtn) {
    donateBtn.addEventListener('click', () => {
      const has = typeof DONATE !== 'undefined' && DONATE.url;
      $('#donate-text').textContent = has
        ? 'СПАСИБО, ЧТО ПОДДЕРЖИВАЕШЬ РАЗРАБОТЧИКА!'
        : 'СПАСИБО, ЧТО ИГРАЕШЬ! ' + (typeof DONATE !== 'undefined' ? DONATE.dev : '');
      $('#donate-go').hidden = !has;
      $('#donate-modal').hidden = false;
    });
  }
  $('#donate-close').addEventListener('click', () => { $('#donate-modal').hidden = true; });
  $('#donate-go').addEventListener('click', () => {
    if (typeof DONATE !== 'undefined' && DONATE.url) {
      window.open(DONATE.url, '_blank');
    }
  });
  // Сброс прогресса
  $('#reset-btn').addEventListener('click', () => {
    state = { coins: 0, total: 0 };
    updateUI();
    save();
  });

  const introBtn = $('#intro-btn');
  if (introBtn) {
    introBtn.addEventListener('click', () => {
      if (typeof playIntro === 'function') playIntro(() => {});
    });
  }

  // --- Настройки: имя и язык ---
  const settingsBtn = $('#settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      $('#name-input').value = (typeof playerName === 'function') ? playerName() : '';
      updateLangButtons();
      updateSoundButton();
      $('#settings-modal').hidden = false;
    });
  }
  $('#settings-close').addEventListener('click', () => { $('#settings-modal').hidden = true; });
  const soundBtn = $('#sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (typeof toggleSound === 'function') toggleSound();
      updateSoundButton();
    });
  }
  $('#name-input').addEventListener('change', (e) => {
    if (typeof setName === 'function') setName(e.target.value);
  });
  $('#lang-ru').addEventListener('click', () => {
    if (typeof setLang === 'function') setLang('ru');
    updateLangButtons();
  });
  $('#lang-en').addEventListener('click', () => {
    if (typeof setLang === 'function') setLang('en');
    updateLangButtons();
  });


  // Сохранение
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  requestAnimationFrame(loop);
}

// Игра стартует после сцены знакомства (или сразу, если она уже была).
if (typeof introSeen === 'function' && introSeen()) {
  startGame();
} else {
  window.addEventListener('intro-done', startGame);
}
