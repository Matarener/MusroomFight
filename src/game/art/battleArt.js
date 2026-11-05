import { rng } from '../util/rng.js';
import { pine, glowShroom } from './scenery.js';
import { bakeBackground, countFor, grassTuft, hashRandom } from './background.js';

/**
 * Графика боя: поляна, полоски здоровья, кольца выбора цели, надписи над бойцами.
 */
function drawBattleBg(g, label, { left, right }) {
  const r = rng(55);
  const h = hashRandom;
  const from = (step) => Math.floor((left - 40) / step) * step;
  // небо, туман и ельник на горизонте — на всю ширину экрана
  g.verticalGradient(0x2c4634, 0x4f7a4a);
  g.fillRect(left, -160, right - left, 600);
  for (let x = from(160); x < right + 160; x += 160) {
    g.fillStyle(0xbfe0cf, 0.05); g.fillEllipse(x + h(x, 1) * 80, 120 + h(x, 2) * 260, 260, 50);
  }
  for (let x = from(34); x < right + 40; x += 34) pine(g, x + h(x, 3) * 16, 330 + h(x, 4) * 40, 0.9 + h(x, 5) * 0.5, 0x2d5236, 0x1b3324);
  g.verticalGradient(0x7aa35d, 0x557d3d);
  g.fillRect(left, 380, right - left, 660);
  g.fillStyle(0x7aa35d, 1);
  for (let x = from(16); x < right + 20; x += 16) g.fillEllipse(x, 382 + h(x, 6) * 4, 28, 14);
  g.fillStyle(0x93bb70, 0.55); g.fillEllipse(195, 610, 470, 300);
  g.fillStyle(0xa3c77e, 0.4); g.fillEllipse(195, 610, 330, 200);
  for (let i = 0; i < 220; i++) {
    g.fillStyle(r() < 0.5 ? 0x6f9a50 : 0x9cc274, 0.45);
    g.fillEllipse(-120 + r() * 630, 400 + r() * 640, 4 + r() * 8, 2 + r() * 4);
  }
  for (let i = 0; i < 50; i++) {
    const x = -120 + r() * 630, y = 400 + r() * 640;
    g.fillStyle(r() < 0.5 ? 0x4f7d3c : 0x5e9346, 1);
    g.fillTriangle(x - 5, y, x - 1, y, x - 6, y - 9);
    g.fillTriangle(x - 2, y, x + 2, y, x, y - 12);
    g.fillTriangle(x + 1, y, x + 5, y, x + 6, y - 8);
  }
  [[30, 420], [360, 430], [-40, 780], [420, 760], [20, 930], [370, 950]].forEach(([x, y], i) => glowShroom(g, x, y, 1 + (i % 2) * 0.4, [0x7de0d0, 0xffe27a][i % 2]));
  [[60, 450, 22], [330, 470, 18], [15, 820, 26]].forEach(([x, y, w]) => {
    g.fillStyle(0x000000, 0.15); g.fillEllipse(x, y + 4, w * 1.4, 8);
    g.fillStyle(0x6f7a6a, 1); g.fillEllipse(x, y, w, w * 0.6);
    g.fillStyle(0x9aa592, 1); g.fillEllipse(x - w * 0.15, y - w * 0.1, w * 0.6, w * 0.3);
  });
}

/** Края поля боя для широких экранов. */
function drawBattleSides(g, sides, r) {
  for (const side of sides) {
    const [a, b] = side;
    const x = () => a + r() * (b - a);
    for (let i = countFor(side, 220); i > 0; i--) {
      g.fillStyle(r() < 0.5 ? 0x6f9a50 : 0x9cc274, 0.45);
      g.fillEllipse(x(), 400 + r() * 640, 4 + r() * 8, 2 + r() * 4);
    }
    for (let i = countFor(side, 50); i > 0; i--) grassTuft(g, x(), 400 + r() * 640, r() < 0.5 ? 0x4f7d3c : 0x5e9346);
    for (let i = countFor(side, 5); i > 0; i--) glowShroom(g, x(), 420 + r() * 600, 1 + r() * 0.4, i % 2 ? 0x7de0d0 : 0xffe27a);
  }
}

/** Фон боя под текущую ширину экрана. */
export function battleBackground(textures, renderer) {
  return bakeBackground(textures, renderer, 'battle', drawBattleBg, drawBattleSides);
}

/** @param {import('../../engine/TextureCache.js').TextureCache} textures */
export function makeBattleTextures(textures) {
  textures.bake('hp_bg', 62, 12, 31, 6, (g) => {
    g.fillStyle(0x24170f, 0.92); g.fillRoundedRect(-31, -6, 62, 12, 6);
    g.fillStyle(0x3a2617, 1); g.fillRoundedRect(-29, -4, 58, 8, 4);
  });
  textures.bake('hp_p', 58, 8, 0, 4, (g) => {
    g.fillStyle(0x8fd16a, 1); g.fillRoundedRect(0, -4, 58, 8, 4);
    g.fillStyle(0xc7f0a6, 0.7); g.fillRoundedRect(3, -3, 52, 2, 1);
  });
  textures.bake('hp_e', 58, 8, 0, 4, (g) => {
    g.fillStyle(0xf0644c, 1); g.fillRoundedRect(0, -4, 58, 8, 4);
    g.fillStyle(0xffb3a0, 0.7); g.fillRoundedRect(3, -3, 52, 2, 1);
  });
  textures.bake('drop', 14, 16, 7, 8, (g) => {
    g.fillStyle(0x24170f, 1); g.fillCircle(0, 2, 6); g.fillTriangle(-5.4, 0, 5.4, 0, 0, -8);
    g.fillStyle(0xb46ee0, 1); g.fillCircle(0, 2, 4.4); g.fillTriangle(-4, 0.5, 4, 0.5, 0, -5.8);
  });
  textures.bake('ring_a', 96, 30, 48, 15, (g) => {
    g.fillStyle(0xffd45c, 0.25); g.fillEllipse(0, 0, 92, 26);
    g.lineStyle(3, 0xffd45c, 1); g.strokeEllipse(0, 0, 84, 22);
  });
  textures.bake('ring_t', 96, 30, 48, 15, (g) => {
    g.fillStyle(0xff8a70, 0.2); g.fillEllipse(0, 0, 92, 26);
    g.lineStyle(3, 0xff8a70, 1); g.strokeEllipse(0, 0, 84, 22);
  });
  textures.bake('w_strong', 90, 26, 45, 13, (g, label) => label(0, 0, 'Сильно!', { size: 12, color: '#ffd45c' }));
  textures.bake('w_weak', 90, 26, 45, 13, (g, label) => label(0, 0, 'Слабо', { size: 11, color: '#d6dde3' }));
  textures.bake('w_crit', 90, 26, 45, 13, (g, label) => label(0, 0, 'Крит!', { size: 12, color: '#ff9a80' }));
  textures.bake('w_poison', 90, 26, 45, 13, (g, label) => label(0, 0, 'Яд', { size: 11, color: '#d9a8ff' }));
}
