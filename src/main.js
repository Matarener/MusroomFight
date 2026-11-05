import { Engine, PerfMonitor, AudioManager } from './engine/index.js';
import { GameState } from './game/state.js';
import { makeMushroomTextures } from './game/art/mushrooms.js';
import { makeFarmTextures } from './game/art/farmArt.js';
import { makeForestTextures, forestBackground } from './game/art/forestArt.js';
import { makeBattleTextures, battleBackground } from './game/art/battleArt.js';
import { portraitUrl } from './game/art/portraits.js';
import { SKIN_NAMES } from './game/data/skeleton.js';
import { FarmScene } from './game/scenes/FarmScene.js';
import { ForestScene } from './game/scenes/ForestScene.js';
import { BattleScene } from './game/scenes/BattleScene.js';
import { TitleScene } from './game/scenes/TitleScene.js';
import { makeTitleTextures } from './game/art/titleArt.js';
import { createTitleScreen } from './game/ui/titleScreen.js';
import { Sheet } from './game/ui/Sheet.js';
import { createToast } from './game/ui/toast.js';
import { createUi } from './game/ui/index.js';
import { createRouter } from './game/router.js';
import { $ } from './game/ui/dom.js';
import { Settings, QUALITY_RATIO } from './game/settings.js';
import { SOUNDS } from './game/audio/sounds.js';
import { MUSIC } from './game/audio/music.js';

/**
 * Точка входа: собирает движок, состояние, интерфейс и сцены.
 *
 * Общий контекст app передаётся сценам (scene.app) и модулям интерфейса:
 *   app.engine, app.perf, app.audio, app.settings, app.state, app.sheet, app.toast, app.ui, app.router
 *   app.sfx(name) — проиграть звук
 */
async function boot() {
  const frame = $('#frame');
  const engine = new Engine({ container: $('#game'), designWidth: 390, designHeight: 844, background: '#86ad63' });
  const audio = new AudioManager();
  for (const [name, def] of Object.entries(SOUNDS)) audio.define(name, def);
  for (const [name, def] of Object.entries(MUSIC)) audio.define(name, def);
  audio.unlockOnGesture();

  const app = {
    engine,
    audio,
    settings: new Settings(),
    perf: new PerfMonitor(engine),
    sfx: (name, opts) => audio.play(name, opts),
    state: new GameState(),
    reduceMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    toast: createToast($('#toast')),

    /** Игровые координаты центра HTML-элемента (куда лететь кристаллу). */
    hudPoint(selector) {
      const canvas = engine.renderer.dynamicCanvas.getBoundingClientRect();
      const r = $(selector).getBoundingClientRect();
      return engine.renderer.screenToWorld(r.left + r.width / 2 - canvas.left, r.top + r.height / 2 - canvas.top);
    },
  };
  engine.app = app;
  app.sheet = new Sheet($('#sheet'), {
    onChange: (open, modal) => {
      if (open && !modal) app.sfx('open');
      if (app.router) app.router.syncPause();
    },
  });
  applySettings(app);
  app.settings.on('change', (key) => applySettings(app, key));

  // размер элементов интерфейса: одна игровая единица в CSS-пикселях
  engine.events.on('resize', (r) => frame.style.setProperty('--u', r.zoom / r.pixelRatio + 'px'));

  // подписи на текстурах рисуются шрифтом Unbounded: ждём его, но не дольше 1.5 с
  if (document.fonts?.load) {
    const fonts = Promise.all([document.fonts.load('700 15px Unbounded'), document.fonts.load('700 20px Caveat')]);
    await Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
  }
  // для титульного экрана нужны только грибы, поляна и облако драки
  makeMushroomTextures(engine.textures);
  makeFarmTextures(engine.textures);
  makeTitleTextures(engine.textures);

  app.ui = createUi(app);
  app.router = createRouter(app);
  engine
    .register('title', TitleScene)
    .register('farm', FarmScene)
    .register('forest', ForestScene)
    .register('battle', BattleScene);

  engine.start();
  engine.show('title');
  $('#loading').hidden = true;
  const title = createTitleScreen(app);

  // остальное готовится, пока на титульном экране идёт драка
  const frame2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const steps = [
    ['Рисуем портреты бойцов…', () => SKIN_NAMES.forEach((s) => portraitUrl(engine.textures, s))],
    ['Сажаем лес…', () => { makeForestTextures(engine.textures); forestBackground(engine.textures, engine.renderer); }],
    ['Вытаптываем поле боя…', () => { makeBattleTextures(engine.textures); battleBackground(engine.textures, engine.renderer); }],
    ['Настраиваем звуки…', () => audio.preload(Object.keys(SOUNDS))],
  ];
  for (let i = 0; i < steps.length; i++) {
    title.progress(i / steps.length, steps[i][0]);
    await frame2(); // дать кадрам анимации отрисоваться между тяжёлыми шагами
    await steps[i][1]();
  }
  title.progress(1, 'Готово!');
  await frame2();

  title.ready(() => {
    app.router.go('farm');
    engine.stopScene('title');
  });
  // музыка рендерится в фоне: сначала трек фермы, потом остальные
  audio.preload(['farm', 'forest', 'battle']);
  setTimeout(() => app.perf.measureScreenHz().then(() => app.ui.fps.renderHz()), 2500);

  window.gribnica = app; // для отладки из консоли
}

/**
 * Применить настройки к движку и звуку.
 * @param {string} [key]  какая настройка изменилась; без неё применяются все
 */
function applySettings(app, key) {
  const { engine, perf, audio, settings } = app;
  const v = settings.values;
  const all = !key;
  if (all || key === 'quality') {
    perf.adaptive = v.quality === 'auto';
    engine.setFixedPixelRatio(v.quality === 'auto' ? null : QUALITY_RATIO[v.quality]);
  }
  if (all || key === 'fpsLimit') perf.setLimit(v.fpsLimit);
  if (all || key === 'effects') engine.effectsEnabled = v.effects;
  if (all || key === 'shake') engine.shakeEnabled = v.shake;
  if (all || key === 'music') audio.setMusicVolume(v.music);
  if (all || key === 'sounds') audio.setSfxVolume(v.sounds);
}

boot();
