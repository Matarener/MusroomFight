import { $, $$ } from './ui/dom.js';
import { STORY, STORY_MUSIC } from './data/story.js';

/**
 * Переключение экранов: ферма, отряд, лес, бой, катсцена.
 * Отвечает за то, какая сцена движка показана, какие HTML-слои видны
 * и когда игровой цикл можно поставить на паузу.
 */
export function createRouter(app) {
  const frame = $('#frame');
  const layers = { squad: $('#scr-squad'), forest: $('#forest-ui'), battle: $('#battle-ui'), story: $('#story-ui') };
  const tabs = $$('.tab');
  let screen = null;

  /**
   * Пауза, когда игру не видно: экран отряда целиком HTML,
   * а на ферме и в лесу открытое окно закрывает сцену.
   */
  function syncPause() {
    const covered = screen === 'squad' || (app.sheet.isOpen && screen !== 'battle');
    if (covered) app.engine.pause();
    else app.engine.resume();
  }

  function go(name, arg) {
    if (name === 'shop') { app.toast('Лавку сделаем следующей'); return null; }
    // музыка экрана; у катсцены — по фону её первого кадра
    const music = name === 'story' ? STORY_MUSIC[STORY[arg][0].bg || 'farm']
      : { farm: 'farm', squad: 'farm', forest: 'forest', battle: 'battle' }[name];
    if (music) app.audio.load(music); // если трек ещё не готов, начать рендер сразу
    app.sheet.close();
    const { engine, perf } = app;
    const prev = screen;
    let result = null;
    screen = name;

    frame.dataset.screen = name;
    for (const t of tabs) {
      if (t.dataset.screen === name) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    }
    for (const [key, el] of Object.entries(layers)) if (key !== 'story') el.hidden = key !== name;

    // после смены экрана бывают разовые провалы кадров: качество не трогаем пару секунд
    perf.hold(3000);
    perf.setBlocked(name === 'battle');
    if (prev === 'battle' && name !== 'battle') engine.stopScene('battle');
    if (prev === 'story' && name !== 'story') engine.stopScene('story');

    if (music) app.audio.playMusic(music);

    switch (name) {
      case 'farm': engine.show('farm'); break;
      case 'forest': engine.show('forest'); break;
      case 'battle': engine.show('battle', { node: arg }, { restart: true }); break;
      case 'squad': app.ui.squad.show(); break;
      case 'story': result = engine.show('story', { id: arg }, { restart: true }); break;
    }
    app.ui.hud.render();
    syncPause();
    return result;
  }

  for (const t of tabs) {
    t.addEventListener('click', () => {
      if (t.getAttribute('aria-current') === 'page') return;
      app.sfx('tap');
      go(t.dataset.screen);
    });
  }

  return { go, syncPause, get screen() { return screen; } };
}
