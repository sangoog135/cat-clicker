/* ДАННЫЕ КЛИКЕРА "КОТ" */

/* ---------- Настройки и переводы ---------- */

const STRINGS = {
  ru: {
    coins: 'МУРЛЫКИ',
    hint: 'ПОЖАЛЬ В КОТА!',
    x2: 'Х2 МУРЛЫКИ!',
    intro: 'ЗНАКОМСТВО',
    donate: 'ЗАДОНАТИТЬ',
    reset: 'СБРОС',
    settings: 'НАСТРОЙКИ',
    close: 'ЗАКРЫТЬ',
    name: 'ИМЯ ИГРОКА',
    namePh: 'Как тебя зовут?',
    language: 'ЯЗЫК',
    level: 'УРОВЕНЬ',
    perClick: 'ЗА КЛИК',
    resetConfirm: 'СБРОСИТЬ СЧЁТЧИК?',
    cat: 'КОТ',
    you: 'ТЫ',
    play: 'ИГРАТЬ',
    donateTitle: 'КОТ ПРОСИТ ПОДДЕРЖАТЬ РАЗРАБОТЧИКА',
    donateText: 'СПАСИБО, ЧТО ИГРАЕШЬ! РАЗРАБОТЧИК — SASHA',
    donateBtn: 'ПОДДЕРЖАТЬ',
    settingsTitle: 'НАСТРОЙКИ',
    nameSaved: 'СОХРАНЕНО',
    sound: 'ЗВУК',
    on: 'ВКЛ',
    off: 'ВЫКЛ',
    unlockNote: 'КАТАЛОР ПРИЗОВ ОТКРЫВАЕТСЯ ЗА МУРЛЫКИ',
    tagline: 'САМАЯ СЛОЖНАЯ ИГРА В МИРЕ',
    buy: 'КУПИТЬ',
    owned: 'КУПЛЕНО',
    locked: 'ЗАКРЫТО'
  },
  en: {
    coins: 'PURR POINTS',
    hint: 'PET THE CAT!',
    x2: 'X2 PURRS!',
    intro: 'INTRO',
    donate: 'SUPPORT',
    reset: 'RESET',
    settings: 'SETTINGS',
    close: 'CLOSE',
    name: 'PLAYER NAME',
    namePh: 'What is your name?',
    language: 'LANGUAGE',
    level: 'LEVEL',
    perClick: 'PER CLICK',
    resetConfirm: 'RESET THE SCORE?',
    cat: 'CAT',
    you: 'YOU',
    play: 'PLAY',
    donateTitle: 'THE CAT ASKS YOU TO SUPPORT THE DEV',
    donateText: 'THANKS FOR PLAYING! DEV — SASHA',
    donateBtn: 'SUPPORT',
    settingsTitle: 'SETTINGS',
    nameSaved: 'SAVED',
    sound: 'SOUND',
    on: 'ON',
    off: 'OFF',
    unlockNote: 'PRIZE CATALOG UNLOCKS WITH PURR POINTS',
    tagline: 'THE MOST COMPLEX GAME IN THE WORLD',
    buy: 'BUY',
    owned: 'OWNED',
    locked: 'LOCKED'
  }
};

/* Настройки игрока */
const DEFAULT_SETTINGS = {
  name: '',
  lang: 'ru',
  sound: true
};

/* ---------- Игровые параметры ---------- */

const CAT = {
  walkEvery: 22,       // секунд между прогулками
  walkSpeed: 34,       // пикселей в секунду
  sitAfter: 12,        // секунд без клика — кот садится
  happyTime: 900,      // мс, сколько кот радуется после клика
  levelStep: 100,      // мурлыков на один уровень
  levelMaxSize: 2.4,   // во сколько раз вырастет кот на максимуме
  clickMax: 10         // максимум мурлыков за один клик
};

/* ---------- День и ночь (фон меняется каждые 5 минут) ---------- */

const DAYNIGHT = {
  period: 5 * 60 * 1000   // длительность одной фазы: день или ночь
};

/* ---------- Случайные х2 мурлыки ---------- */

const BOOM = {
  every: 2 * 60 * 1000,   // база: когда снова ловить случайный момент
  span: 60 * 1000,        // сколько длится х2
  mult: 2                 // во сколько раз больше мурлыков
};

/* ---------- Сцена знакомства ---------- */
/* Диалоги: RU и EN. who: 'cat' — кот, 'player' — игрок. */

const INTRO = {
  timings: {
    enter: 700,    // выходит из-за края
    walk: 2200,    // идёт к середине
    stand: 700,    // стоит
    sit: 600       // садится
  },
  dialog: {
    ru: [
      { who: 'cat', text: 'ПРИВЕТ, {name}!' },
      { who: 'cat', text: 'ТЫ МНЕ НРАВИШЬСЯ!' },
      { who: 'cat', text: 'ДАВАЙ ДРУЖИТЬ!' },
      { who: 'cat', text: 'КОРОЧЕ ГОВОРЯ, НА МЕНЯ НАДО КЛИКАТЬ И ДОБЫВАТЬ ОВЧИКИ.' },
      { who: 'cat', text: 'НА МЕНЯ НАДО КЛИКАТЬ! И ЗАДОНАТЬ!' },
      { who: 'cat', text: 'ПОГНАЛИ!' }
    ],
    en: [
      { who: 'cat', text: 'HELLO, {name}!' },
      { who: 'cat', text: 'I LIKE YOU!' },
      { who: 'cat', text: 'LET US BE FRIENDS!' },
      { who: 'cat', text: 'SO, YOU HAVE TO CLICK ME AND GRAB SOME PURRYS.' },
      { who: 'cat', text: 'CLICK ON ME! AND SUPPORT THE DEV!' },
      { who: 'cat', text: "LET'S GO!" }
    ]
  }
};

/* Куда донатить разработчику (ссылка Donatty). */
const DONATE = {
  url: 'https://donatty.com/sanf1j1c',
  dev: 'SASHA'
};

/* ---------- Призы (каталог) ---------- */
/* Открываются за мурлыки. Пока пусто — можно добавить иконки сюда. */

const PRIZES = [
  // { id:'...', name:'...', cost:100, icon:'sprites/...' }
];

/* ---------- Профиль линии травы на фоне (100x50) ---------- */
/* Y травы в каждом столбце — кот идёт по холму, а не по воздуху. */
const GROUND_PROFILE = [47, 46, 45, 44, 43, 42, 42, 41, 41, 40, 40, 40, 40, 40, 39, 39, 39, 39, 39, 38, 38, 38, 38, 38, 38, 38, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 38, 38, 39, 39, 39, 40];
