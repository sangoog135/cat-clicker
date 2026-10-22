/* НАСТРОЙКИ И ПЕРЕВОДЫ: имя игрока, язык, применение строк к интерфейсу. */

(function () {

const SETTINGS_KEY = 'catClickerSettings';

function loadSettings() {
  const s = Object.assign({}, DEFAULT_SETTINGS);
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (typeof data.name === 'string') s.name = data.name;
      if (data.lang === 'ru' || data.lang === 'en') s.lang = data.lang;
      if (typeof data.sound === 'boolean') s.sound = data.sound;
    }
  } catch (e) { /* без сохранения — работаем в памяти */ }
  return s;
}

let settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) { /* нечем сохранять */ }
}

/* Перевод по текущему языку. */
function t(key) {
  const table = STRINGS[settings.lang] || STRINGS.ru;
  return table[key] !== undefined ? table[key] : key;
}

/* Проставляет переводы в элементы с data-i18n. */
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.documentElement.lang = settings.lang;
}

function setLang(lang) {
  if (lang !== 'ru' && lang !== 'en') return;
  settings.lang = lang;
  saveSettings();
  applyI18n();
  if (typeof onLangChanged === 'function') onLangChanged();
}

function setName(name) {
  settings.name = String(name || '').slice(0, 16);
  saveSettings();
  if (typeof onNameChanged === 'function') onNameChanged();
}

/* Имя игрока для подстановки в тексты (если не задано — пусто). */
function playerName() {
  return settings.name.trim();
}

/* Звук вкл/выкл. */
function toggleSound() {
  settings.sound = !settings.sound;
  saveSettings();
  if (typeof onSoundChanged === 'function') onSoundChanged();
}

/* Включён ли звук. */
function soundOn() {
  return !!settings.sound;
}

window.getSettings = () => Object.assign({}, settings);
window.setLang = setLang;
window.setName = setName;
window.playerName = playerName;
window.toggleSound = toggleSound;
window.soundOn = soundOn;
window.t = t;
window.applyI18n = applyI18n;

})();
