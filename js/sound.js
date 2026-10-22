/* ЗВУКИ ИГРЫ: маленькие wav-файлы из assets/sounds.
   Проигрываем через Audio с клонами — клики могут звучать внахлёст.
   В WebView на Android Audio работает надёжно; play() без жеста
   пользователя блокируется, но звуки вызываются только из кликов. */

(function () {

  const cache = {};

  function allowed() {
    try {
      const s = (typeof getSettings === 'function') ? getSettings() : { sound: true };
      return s.sound !== false;
    } catch (e) {
      return true;
    }
  }

  window.playSound = function (name, vol) {
    if (!allowed()) return;
    try {
      const src = cache[name] || (cache[name] = new Audio('assets/sounds/' + name + '.wav'));
      const a = src.cloneNode(true);   // клон, чтобы звуки не мешали друг другу
      if (typeof vol === 'number') a.volume = vol;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});   // без звука игра всё равно работает
    } catch (e) { /* тихо играем дальше */ }
  };

})();
