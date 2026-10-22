/* СЦЕНА ЗНАКОМСТВА — кот выходит, знакомится с игроком, потом начинается игра. */

(function () {

const $ = (s) => document.querySelector(s);

const intro = $('#intro');
const introStage = $('#introStage');
const introCat = $('#introCat');
const introImgA = $('#introImgA');
const introImgB = $('#introImgB');
const dialog = $('#dialog');
const dialogWho = $('#dialogWho');
const dialogText = $('#dialogText');
const introStart = $('#intro-start');

const INTRO_SPRITES = {
  stand: 'sprites/stand.png',
  walkL1: 'sprites/walkL1.png',
  walkL2: 'sprites/walkL2.png',
  walkR1: 'sprites/walkR1.png',
  walkR2: 'sprites/walkR2.png',
  sit: 'sprites/sit.png',
  happy: 'sprites/happy.png',
  wave: ['sprites/wave1.png', 'sprites/wave2.png', 'sprites/wave3.png']
};

/* Фон 100x50, трава начинается с 38-й строки. */
const INTRO_BG = { w: 100, h: 50, groundY: 38 };

let introFrontIsA = true;
let dialogIndex = 0;
let introRunning = false;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* Линия травы — кот всегда стоит на земле. */
function introLayout() {
  const h = introStage.clientHeight;
  if (!h) return;
  introStage.style.setProperty('--intro-ground', Math.round(h * INTRO_BG.groundY / INTRO_BG.h) + 'px');
}

window.addEventListener('resize', introLayout);

/* Плавная смена спрайта. */
function setIntroSprite(src) {
  const cur = introFrontIsA ? introImgA : introImgB;
  const next = introFrontIsA ? introImgB : introImgA;
  if (cur.getAttribute('src') === src) return;
  next.src = src;
  next.style.transition = 'none';
  next.style.opacity = '0';
  void next.offsetWidth;
  next.style.transition = 'opacity 120ms linear';
  next.style.opacity = '1';
  cur.style.transition = 'opacity 120ms linear';
  cur.style.opacity = '0';
  introFrontIsA = !introFrontIsA;
}

/* Плавное движение вручную через requestAnimationFrame.
   CSS-переходы и Web Animations API работают в WebView на Android нестабильно. */
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function moveTo(x, duration) {
  return new Promise((resolve) => {
    const from = currentIntroX;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      currentIntroX = from + (x - from) * easeInOut(t);
      introCat.style.transform = 'translateX(' + currentIntroX + 'px)';
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        currentIntroX = x;
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

let currentIntroX = 0;

/* ---------------- диалог ---------------- */

/* Текущий язык диалогов */
function dialogList() {
  const lang = (typeof getSettings === 'function') ? getSettings().lang : 'ru';
  return INTRO.dialog[lang] || INTRO.dialog.ru;
}

function showDialog(i) {
  const list = dialogList();
  const line = list[i];
  if (!line) return;
  dialogIndex = i;
  const tr = (typeof t === 'function') ? t : (k) => k;
  dialogWho.textContent = line.who === 'cat' ? tr('cat') : tr('you');
  const nm = (typeof playerName === 'function') ? playerName() : '';
  dialogText.textContent = line.text.replace('{name}', nm || tr('you'));
  dialog.hidden = false;
  // Кот говорит — радуется, слушает — сидит.
  setIntroSprite(line.who === 'cat' ? INTRO_SPRITES.happy : INTRO_SPRITES.sit);
  if (typeof playSound === 'function') playSound('blip', 0.5);
}

function nextDialog() {
  if (dialog.hidden) return;
  const list = dialogList();
  if (dialogIndex + 1 < list.length) {
    showDialog(dialogIndex + 1);
  } else {
    dialog.hidden = true;
    introStart.hidden = false;
  }
}

/* ---------------- сцена ---------------- */

async function playIntro(onDone) {
  if (introRunning) return;
  introRunning = true;
  intro.hidden = false;
  introStart.hidden = true;
  dialog.hidden = true;
  dialogIndex = 0;
  introLayout();

  const T = INTRO.timings;
  const w = window.innerWidth;

  // 1. Кот выходит из-за правого края.
  currentIntroX = w / 2 + 120;
  introCat.style.transition = 'none';
  introCat.style.transform = 'translateX(' + currentIntroX + 'px)';
  introCat.style.opacity = '0';
  void introCat.offsetWidth;
  introCat.style.opacity = '1';
  setIntroSprite(INTRO_SPRITES.stand);
  await sleep(T.enter);

  // 2. Идёт к середине (вместе со сменой шагов).
  setIntroSprite(INTRO_SPRITES.walkL1);
  await new Promise((resolve) => {
    const from = currentIntroX;
    const start = performance.now();
    let step = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / T.walk);
      currentIntroX = from + (0 - from) * easeInOut(t);
      introCat.style.transform = 'translateX(' + currentIntroX + 'px)';
      setIntroSprite(step % 2 ? INTRO_SPRITES.walkL2 : INTRO_SPRITES.walkL1);
      step++;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        currentIntroX = 0;
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });

  // 3. Стоит.
  setIntroSprite(INTRO_SPRITES.stand);
  await sleep(T.stand);

  // 4. Садится.
  setIntroSprite(INTRO_SPRITES.sit);
  await sleep(T.sit);

  // 5. Знакомство.
  showDialog(0);
  introRunning = false;
  intro.onDone = onDone;
}

/* Кнопка «ИГРАТЬ» */
function startFromIntro(e) {
  if (e) e.stopPropagation();
  if (intro.hidden) return;
  intro.hidden = true;
  introStart.hidden = true;
  if (typeof intro.onDone === 'function') intro.onDone();
}

introStart.addEventListener('click', startFromIntro);
introStart.addEventListener('touchstart', startFromIntro, { passive: false });

/* Тап по экрану — следующая реплика */
intro.addEventListener('click', (e) => {
  if (introStart.hidden === false) return;
  nextDialog();
});

/* ---------------- запуск ---------------- */

function introSeen() {
  try {
    return localStorage.getItem('catIntroSeen') === '1';
  } catch (e) {
    return false;
  }
}

function markIntroSeen() {
  try {
    localStorage.setItem('catIntroSeen', '1');
  } catch (e) { /* без сохранения — просто покажем сцену заново */ }
}

introLayout();
if (!introSeen()) {
  playIntro(() => {
    markIntroSeen();
    window.dispatchEvent(new Event('intro-done'));
  });
}

window.playIntro = playIntro;
window.introSeen = introSeen;
window.refreshIntroDialog = function () {
  if (!dialog.hidden) showDialog(dialogIndex);
};

})();
