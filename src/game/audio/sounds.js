import { tone, noise, bell, marimba, mixBus, note, midi } from '../../engine/audio/synth.js';

/**
 * Звуки действий. Каждый — короткая функция синтеза, отрендеренная один раз в буфер.
 * Названия используются в игре: app.sfx('harvest').
 */
const n = (name) => midi(note(name));

/** Обёртка: общая шина с лёгкой реверберацией для всех звуков. */
const sfx = (duration, render, room = 0.18, peak = 0.7) => ({
  duration,
  peak,
  render: (ctx, out) => render(ctx, mixBus(ctx, out, { volume: 0.9, room, roomSize: 0.9 })),
});

export const SOUNDS = {
  /** Нажатие на кнопку или вкладку: деревянный щелчок. */
  tap: sfx(0.15, (c, o) => marimba(c, o, 0, n('A5'), 0.22, 0.12), 0.05, 0.4),

  /** Открытие окна. */
  open: sfx(0.25, (c, o) => tone(c, o, { freq: 520, to: 820, slide: 0.08, type: 'sine', vol: 0.18, decay: 0.16 }), 0.1, 0.35),

  /** Нельзя: не хватает ресурсов, отряд полон. */
  error: sfx(0.35, (c, o) => {
    tone(c, o, { t: 0, freq: n('E4'), type: 'triangle', vol: 0.2, decay: 0.12 });
    tone(c, o, { t: 0.1, freq: n('C4'), type: 'triangle', vol: 0.2, decay: 0.2 });
  }, 0.05, 0.5),

  /** Посадка: глухой удар по земле и шорох. */
  plant: sfx(0.5, (c, o) => {
    tone(c, o, { freq: 160, to: 70, slide: 0.15, type: 'sine', vol: 0.4, decay: 0.25 });
    noise(c, o, { vol: 0.2, decay: 0.25, filter: { type: 'lowpass', freq: 1200, to: 300 } });
    marimba(c, o, 0.08, n('G4'), 0.12, 0.3);
  }),

  /** Подкормка спорами: шорох и восходящий тон. */
  fertilize: sfx(0.7, (c, o) => {
    noise(c, o, { vol: 0.14, attack: 0.04, decay: 0.4, filter: { type: 'bandpass', freq: 1500, to: 4000, q: 1.5 } });
    tone(c, o, { freq: n('C5'), to: n('G5'), slide: 0.35, type: 'sine', vol: 0.12, attack: 0.05, decay: 0.45 });
  }),

  /** Кристалл созрел. */
  ready: sfx(1.0, (c, o) => {
    bell(c, o, 0, n('E6'), 0.12, 0.6);
    bell(c, o, 0.09, n('B6'), 0.1, 0.7);
  }, 0.3),

  /** Сбор кристалла: звонкое арпеджио с искрами. */
  harvest: sfx(1.2, (c, o) => {
    ['C6', 'E6', 'G6', 'C7'].forEach((x, i) => bell(c, o, i * 0.055, n(x), 0.12, 0.5));
    noise(c, o, { t: 0.02, vol: 0.06, attack: 0.02, decay: 0.5, filter: { type: 'highpass', freq: 6000 } });
  }, 0.3),

  /** Кристалл долетел до счётчика. */
  collect: sfx(0.6, (c, o) => {
    bell(c, o, 0, n('G6'), 0.13, 0.35);
    bell(c, o, 0.05, n('D7'), 0.08, 0.3);
  }, 0.2),

  /** Открыта новая грядка: деревянный стук и аккорд. */
  unlock: sfx(1.2, (c, o) => {
    noise(c, o, { vol: 0.25, decay: 0.12, filter: { type: 'bandpass', freq: 600, q: 2 } });
    marimba(c, o, 0.05, n('C5'), 0.2, 0.5);
    ['E5', 'G5', 'C6'].forEach((x, i) => bell(c, o, 0.15 + i * 0.07, n(x), 0.1, 0.7));
  }, 0.3),

  /** Боец улучшен. */
  upgrade: sfx(1.1, (c, o) => {
    ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((x, i) => marimba(c, o, i * 0.06, n(x), 0.16, 0.4));
    noise(c, o, { t: 0.25, vol: 0.05, attack: 0.05, decay: 0.5, filter: { type: 'highpass', freq: 7000 } });
  }, 0.3),

  /** Новый уровень игрока или бойца. */
  levelup: sfx(1.6, (c, o) => {
    [['C5', 0], ['E5', 0.1], ['G5', 0.2], ['C6', 0.32]].forEach(([x, t]) => {
      tone(c, o, { t, freq: n(x), type: 'square', vol: 0.07, attack: 0.01, sustain: 0.6, hold: 0.12, release: 0.1, filter: { type: 'lowpass', freq: 3000 } });
      marimba(c, o, t, n(x), 0.14, 0.4);
    });
    ['C6', 'E6', 'G6'].forEach((x) => bell(c, o, 0.45, n(x), 0.08, 1.0));
  }, 0.35),

  /* ---------- бой ---------- */

  /** Рывок к противнику. */
  dash: sfx(0.35, (c, o) => noise(c, o, { vol: 0.16, attack: 0.03, decay: 0.2, filter: { type: 'bandpass', freq: 600, to: 2600, q: 1.2, time: 0.2 } }), 0.05, 0.4),

  /** Удар. */
  hit: sfx(0.4, (c, o) => {
    tone(c, o, { freq: 180, to: 60, slide: 0.12, type: 'sine', vol: 0.5, decay: 0.2 });
    noise(c, o, { vol: 0.25, decay: 0.1, filter: { type: 'lowpass', freq: 2500, to: 500 } });
  }, 0.08),

  /** Критический удар: удар плюс звонкий щелчок. */
  crit: sfx(0.7, (c, o) => {
    tone(c, o, { freq: 220, to: 55, slide: 0.15, type: 'sine', vol: 0.55, decay: 0.25 });
    noise(c, o, { vol: 0.3, decay: 0.08, filter: { type: 'highpass', freq: 2000 } });
    bell(c, o, 0.02, n('A6'), 0.12, 0.4);
  }, 0.2),

  /** Слабый удар по сильной стихии. */
  weak: sfx(0.3, (c, o) => {
    tone(c, o, { freq: 140, to: 90, slide: 0.1, type: 'sine', vol: 0.3, decay: 0.15 });
    noise(c, o, { vol: 0.1, decay: 0.08, filter: { type: 'lowpass', freq: 900 } });
  }, 0.05, 0.45),

  /** Яд: булькающие пузыри. */
  poison: sfx(0.7, (c, o) => {
    [0, 0.09, 0.2].forEach((t, i) => tone(c, o, { t, freq: 300 + i * 90, to: 700 + i * 120, slide: 0.07, type: 'sine', vol: 0.14, decay: 0.12 }));
    noise(c, o, { vol: 0.05, attack: 0.05, decay: 0.4, filter: { type: 'lowpass', freq: 600 } });
  }, 0.15),

  /** Лечение: мягкий восходящий перезвон. */
  heal: sfx(1.0, (c, o) => {
    ['G5', 'B5', 'D6'].forEach((x, i) => bell(c, o, i * 0.08, n(x), 0.09, 0.6));
    tone(c, o, { freq: n('G4'), type: 'sine', vol: 0.07, attack: 0.1, sustain: 0.8, hold: 0.25, release: 0.3 });
  }, 0.35),

  /** Боец выбыл. */
  faint: sfx(0.9, (c, o) => {
    tone(c, o, { freq: n('A4'), to: n('A2'), slide: 0.6, type: 'triangle', vol: 0.18, decay: 0.7 });
    noise(c, o, { t: 0.55, vol: 0.18, decay: 0.15, filter: { type: 'lowpass', freq: 500 } });
  }, 0.15),

  /** Победа. */
  victory: sfx(2.2, (c, o) => {
    const seq = [['G4', 0], ['C5', 0.12], ['E5', 0.24], ['G5', 0.36], ['E5', 0.5], ['G5', 0.62]];
    for (const [x, t] of seq) {
      tone(c, o, { t, freq: n(x), type: 'square', vol: 0.07, attack: 0.01, sustain: 0.6, hold: 0.1, release: 0.08, filter: { type: 'lowpass', freq: 3200 } });
      marimba(c, o, t, n(x), 0.14, 0.35);
    }
    ['C5', 'E5', 'G5', 'C6'].forEach((x) => {
      tone(c, o, { t: 0.78, freq: n(x), type: 'triangle', vol: 0.08, attack: 0.02, sustain: 0.8, hold: 0.6, release: 0.5 });
      bell(c, o, 0.78, n(x) * 2, 0.05, 1.2);
    });
  }, 0.35),

  /** Поражение. */
  defeat: sfx(2.0, (c, o) => {
    [['E4', 0], ['D4', 0.25], ['C4', 0.5], ['B3', 0.8]].forEach(([x, t], i) =>
      tone(c, o, { t, freq: n(x), type: 'triangle', vol: 0.16, attack: 0.02, sustain: 0.7, hold: i === 3 ? 0.6 : 0.18, release: 0.3 }));
    tone(c, o, { t: 0.8, freq: n('E3'), type: 'sine', vol: 0.12, attack: 0.05, sustain: 0.7, hold: 0.6, release: 0.4 });
  }, 0.4),
};
