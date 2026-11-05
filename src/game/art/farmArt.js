import { rng } from '../util/rng.js';
import { bakeBackground, countFor, grassTuft, hashRandom } from './background.js';
import { CRYSTALS, PRICES } from '../data/content.js';

/**
 * Графика фермы: поляна, грядки, кристаллы и значки на грядках.
 * Всё запекается один раз; поляна и рамки грядок потом рисуются в статичный слой.
 */
export const BED_W = 156;
export const BED_H = 104;

/* ---------- поляна ---------- */
function drawMeadow(g, label, { left, right }) {
  const r = rng(7);
  const h = hashRandom;
  const from = (step) => Math.floor((left - 40) / step) * step;

  // небо и лес на горизонте — на всю ширину экрана
  g.verticalGradient(0xbfe0cf, 0xe9f1d3);
  g.fillRect(left, -160, right - left, 410);
  g.fillStyle(0xfff6d8, 0.25); g.fillCircle(312, 112, 70);
  g.fillStyle(0xfff6d8, 0.5); g.fillCircle(312, 112, 44);
  for (let x = from(30); x < right + 40; x += 30) {
    g.fillStyle(0x9cbf92, 1);
    g.fillEllipse(x + h(x, 1) * 10, 196 + h(x, 2) * 14, 62, 100 + h(x, 3) * 30);
  }
  for (let x = from(44); x < right + 40; x += 44) {
    const y = 214 + h(x, 4) * 10;
    g.fillStyle(0x4a3424, 1); g.fillRect(x - 3, y, 6, 30);
    g.fillStyle(0x5f8c5a, 1); g.fillEllipse(x + h(x, 5) * 6, y - 18, 64, 88 + h(x, 6) * 24);
    g.fillStyle(0x6f9d67, 1); g.fillEllipse(x - 8, y - 34, 28, 30);
  }

  // земля
  g.verticalGradient(0x86ad63, 0x5b8644);
  g.fillRect(left, 238, right - left, 802);
  g.fillStyle(0x86ad63, 1);
  for (let x = from(16); x < right + 20; x += 16) g.fillEllipse(x, 240 + h(x, 7) * 4, 28, 14);

  // фактура мха
  for (let i = 0; i < 300; i++) {
    const x = -120 + r() * 630, y = 250 + r() * 790;
    g.fillStyle(r() < 0.5 ? 0x6f9a50 : 0x9cc274, r() < 0.5 ? 0.5 : 0.4);
    g.fillEllipse(x, y, 4 + r() * 8, 2 + r() * 4);
  }

  // тропинка
  for (let t = -0.34; t <= 1.0001; t += 0.012) {
    const y = 844 - t * 610;
    const x = 195 + Math.sin(t * 6.2) * 12;
    const w = 58 - t * 26;
    g.fillStyle(0xb39a6c, 1); g.fillEllipse(x, y, w + 6, 22);
  }
  for (let t = -0.34; t <= 1.0001; t += 0.012) {
    const y = 844 - t * 610;
    const x = 195 + Math.sin(t * 6.2) * 12;
    const w = 58 - t * 26;
    g.fillStyle(0xd6bf91, 1); g.fillEllipse(x, y, w, 18);
  }
  for (let i = 0; i < 26; i++) {
    const t = r();
    const y = 844 - t * 600, x = 195 + Math.sin(t * 6.2) * 12 + (r() - 0.5) * (40 - t * 20);
    g.fillStyle(0x9e8862, 1); g.fillEllipse(x, y + 1, 7, 4);
    g.fillStyle(0xc7b28a, 1); g.fillEllipse(x, y, 6, 3.4);
  }

  // кустики травы
  for (let i = 0; i < 80; i++) {
    const x = -120 + r() * 630, y = 250 + r() * 790;
    if (Math.abs(x - 195) < 30) continue;
    const c = r() < 0.5 ? 0x4f7d3c : 0x5e9346;
    g.fillStyle(c, 1);
    g.fillTriangle(x - 5, y, x - 1, y, x - 6, y - 9);
    g.fillTriangle(x - 2, y, x + 2, y, x, y - 12);
    g.fillTriangle(x + 1, y, x + 5, y, x + 6, y - 8);
  }

  // опавшие листья
  const leafColors = [0xd98b3a, 0xc0662f, 0xe0b04a];
  for (let i = 0; i < 36; i++) {
    const x = -120 + r() * 630, y = 260 + r() * 780;
    g.local(x, y, r() * Math.PI, () => {
      g.fillStyle(leafColors[i % 3], 0.95);
      g.fillEllipse(0, 0, 11, 5);
      g.lineStyle(1, 0x7a3f1c, 0.6); g.line(-5, 0, 5, 0);
    });
  }

  // цветочки
  for (let i = 0; i < 24; i++) {
    const x = -120 + r() * 630, y = 260 + r() * 770;
    if (Math.abs(x - 195) < 34) continue;
    const c = r() < 0.5 ? 0xfff8ec : 0xffe27a;
    g.fillStyle(c, 1);
    [[0, -3], [3, 0], [0, 3], [-3, 0]].forEach(([dx, dy]) => g.fillCircle(x + dx, y + dy, 2.2));
    g.fillStyle(0xe0a03a, 1); g.fillCircle(x, y, 1.6);
  }

  // бревно справа с маленькими грибочками
  g.fillStyle(0x000000, 0.15); g.fillEllipse(396, 238, 170, 16);
  g.fillStyle(0x3e2512, 1); g.fillRoundedRect(312, 206, 170, 32, 15);
  g.fillStyle(0x7a5232, 1); g.fillRoundedRect(315, 209, 167, 26, 12);
  g.lineStyle(1.5, 0x5b3a20, 0.8); g.line(336, 215, 372, 215); g.line(346, 227, 392, 227);
  g.fillStyle(0x3e2512, 1); g.fillEllipse(316, 222, 22, 32);
  g.fillStyle(0xd2a874, 1); g.fillEllipse(316, 222, 17, 27);
  g.lineStyle(1.5, 0xa77c4c, 1); g.strokeEllipse(316, 222, 10, 16); g.strokeEllipse(316, 222, 4, 7);
  [[340, 207, 9], [352, 206, 6], [378, 207, 8]].forEach(([x, y, s]) => {
    g.fillStyle(0xf3ead6, 1); g.fillRect(x - 1.5, y - 6, 3, 6);
    g.fillStyle(0x3e2512, 1); g.fillEllipse(x, y - 6, s * 2 + 3, s + 3);
    g.fillStyle(0xe0763a, 1); g.fillEllipse(x, y - 6, s * 2, s);
  });

  // компостная куча слева
  g.fillStyle(0x000000, 0.15); g.fillEllipse(60, 242, 104, 16);
  g.fillStyle(0x3e2512, 1); g.fillEllipse(60, 226, 98, 52);
  g.fillStyle(0x5a3c25, 1); g.fillEllipse(60, 227, 92, 46);
  g.fillStyle(0x6f4b2e, 1); g.fillEllipse(52, 216, 50, 22);
  [[34, 222, 0xd98b3a], [70, 210, 0xe0b04a], [82, 228, 0xc0662f], [52, 236, 0xe0b04a], [62, 220, 0xc0662f]].forEach(([x, y, c]) => {
    g.fillStyle(c, 1); g.fillEllipse(x, y, 10, 5);
  });
  // колышки ограды
  for (let x = 14; x <= 106; x += 23) {
    g.fillStyle(0x3e2512, 1); g.fillRoundedRect(x - 4, 222, 8, 26, 3);
    g.fillStyle(0xa77c4c, 1); g.fillRoundedRect(x - 2.5, 223.5, 5, 23, 2);
  }
  g.fillStyle(0x3e2512, 1); g.fillRect(10, 233, 100, 4);

  // табличка
  g.fillStyle(0x3e2512, 1); g.fillRect(190, 196, 10, 46);
  g.fillStyle(0x8a5a33, 1); g.fillRect(192, 198, 6, 42);
  g.fillStyle(0x000000, 0.15); g.fillEllipse(195, 244, 30, 8);
  g.fillStyle(0x3e2512, 1); g.fillRoundedRect(128, 168, 134, 38, 10);
  g.fillStyle(0xc8945c, 1); g.fillRoundedRect(131, 171, 128, 32, 8);
  g.lineStyle(1.5, 0xa77446, 1); g.line(136, 187, 254, 187);
  g.fillStyle(0x3e2512, 1); g.fillCircle(138, 176, 1.8); g.fillCircle(252, 176, 1.8);
  label(195, 187, 'Грибница', { size: 15, color: '#3e2512', stroke: null });
}

/** Края поляны для широких экранов: трава, листья, цветы и кусты. */
function drawMeadowSides(g, sides, r) {
  const leafColors = [0xd98b3a, 0xc0662f, 0xe0b04a];
  for (const side of sides) {
    const [a, b] = side;
    const x = () => a + r() * (b - a);
    for (let i = countFor(side, 300); i > 0; i--) {
      g.fillStyle(r() < 0.5 ? 0x6f9a50 : 0x9cc274, r() < 0.5 ? 0.5 : 0.4);
      g.fillEllipse(x(), 250 + r() * 790, 4 + r() * 8, 2 + r() * 4);
    }
    for (let i = countFor(side, 80); i > 0; i--) grassTuft(g, x(), 250 + r() * 790, r() < 0.5 ? 0x4f7d3c : 0x5e9346);
    for (let i = countFor(side, 36); i > 0; i--) {
      const lx = x(), ly = 260 + r() * 780, color = leafColors[i % 3];
      g.local(lx, ly, r() * Math.PI, () => {
        g.fillStyle(color, 0.95); g.fillEllipse(0, 0, 11, 5);
        g.lineStyle(1, 0x7a3f1c, 0.6); g.line(-5, 0, 5, 0);
      });
    }
    for (let i = countFor(side, 24); i > 0; i--) {
      const fx = x(), fy = 260 + r() * 770;
      g.fillStyle(r() < 0.5 ? 0xfff8ec : 0xffe27a, 1);
      [[0, -3], [3, 0], [0, 3], [-3, 0]].forEach(([dx, dy]) => g.fillCircle(fx + dx, fy + dy, 2.2));
      g.fillStyle(0xe0a03a, 1); g.fillCircle(fx, fy, 1.6);
    }
    // кусты по краям поляны
    for (let i = countFor(side, 6); i > 0; i--) {
      const bx = x(), by = 300 + r() * 700, s = 0.8 + r() * 0.6;
      g.fillStyle(0x000000, 0.14); g.fillEllipse(bx, by + 10 * s, 60 * s, 12 * s);
      g.fillStyle(0x3f6a34, 1); g.fillEllipse(bx - 14 * s, by, 34 * s, 26 * s); g.fillEllipse(bx + 14 * s, by, 34 * s, 26 * s);
      g.fillStyle(0x4f8040, 1); g.fillEllipse(bx, by - 8 * s, 40 * s, 30 * s);
      g.fillStyle(0x6a9a55, 0.8); g.fillEllipse(bx - 6 * s, by - 14 * s, 16 * s, 9 * s);
    }
  }
}

/** Фон фермы под текущую ширину экрана. */
export function farmBackground(textures, renderer) {
  return bakeBackground(textures, renderer, 'meadow', drawMeadow, drawMeadowSides);
}

/* ---------- грядка ---------- */
function drawBedFrame(g, seed) {
  const r = rng(100 + seed);
  const w = BED_W, h = BED_H, x0 = -w / 2, y0 = -h / 2;
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, h / 2 + 3, w + 12, 22);
  g.fillStyle(0x3e2512, 1); g.fillRoundedRect(x0, y0, w, h, 16);
  g.fillStyle(0x9a6a3e, 1); g.fillRoundedRect(x0 + 3, y0 + 3, w - 6, h - 6, 13);
  g.fillStyle(0xb4824f, 1); g.fillRoundedRect(x0 + 5, y0 + 4, w - 10, 5, 2.5);
  g.lineStyle(2, 0x6e4626, 1);
  [44, 96].forEach((dx) => { g.line(x0 + dx, y0 + 3, x0 + dx, y0 + 12); g.line(x0 + dx + 14, y0 + h - 12, x0 + dx + 14, y0 + h - 3); });
  [h * 0.5].forEach((dy) => { g.line(x0 + 3, y0 + dy, x0 + 12, y0 + dy); g.line(x0 + w - 12, y0 + dy, x0 + w - 3, y0 + dy); });
  g.fillStyle(0x3e2512, 1);
  [[8, 8], [w - 8, 8], [8, h - 8], [w - 8, h - 8]].forEach(([dx, dy]) => g.fillCircle(x0 + dx, y0 + dy, 1.8));
  g.fillStyle(0x3e2512, 1); g.fillRoundedRect(x0 + 11, y0 + 11, w - 22, h - 22, 9);
  g.fillStyle(0x4f3523, 1); g.fillRoundedRect(x0 + 13, y0 + 13, w - 26, h - 26, 8);
  g.lineStyle(2, 0x3f2a1c, 0.7);
  for (let i = 1; i <= 3; i++) {
    const y = y0 + 13 + (h - 26) * (i / 4);
    g.line(x0 + 20, y, x0 + w - 20, y);
  }
  for (let i = 0; i < 46; i++) {
    g.fillStyle(r() < 0.5 ? 0x664632 : 0x3a2618, 1);
    g.fillCircle(x0 + 17 + r() * (w - 34), y0 + 17 + r() * (h - 34), 0.8 + r() * 1.6);
  }
  const moss = [[x0 + 6, y0 + 6], [x0 + w - 8, y0 + h - 6], [x0 + w - 18, y0 + 4], [x0 + 10, y0 + h - 4]];
  moss.forEach(([mx, my], i) => {
    if (r() < 0.35 && i > 1) return;
    g.fillStyle(0x5e9346, 1); g.fillEllipse(mx, my, 18, 9);
    g.fillStyle(0x86b85f, 1); g.fillEllipse(mx - 2, my - 1.5, 10, 5);
  });
}

function drawMycelium(g, seed) {
  const r = rng(300 + seed);
  g.lineStyle(1.4, 0xf3ead6, 0.8);
  for (let k = 0; k < 11; k++) {
    let x = (r() - 0.5) * 20, y = 6 + (r() - 0.5) * 8;
    const a = r() * Math.PI * 2, len = 16 + r() * 26;
    const points = [{ x, y }];
    for (let s = 1; s <= 3; s++) {
      x += Math.cos(a + (r() - 0.5)) * len / 3;
      y += Math.sin(a + (r() - 0.5)) * len / 3 * 0.55;
      points.push({ x, y });
    }
    g.strokePolyline(points);
    g.fillStyle(0xfff8ec, 0.9); g.fillCircle(x, y, 1.2 + r());
  }
  [[-14, 6, 5.5], [3, 1, 6.5], [17, 9, 4.6]].forEach(([x, y, s]) => {
    g.fillStyle(0x3e2512, 1); g.fillCircle(x, y, s + 1.6);
    g.fillStyle(0xf3ead6, 1); g.fillCircle(x, y, s);
    g.fillStyle(0xfffcf4, 1); g.fillCircle(x - s * 0.35, y - s * 0.35, s * 0.35);
  });
}

/* ---------- кристаллы ---------- */
/** Призма кристалла: светлая и тёмная грани, контур, блик. c = { mid, light, dark } */
function drawShard(g, x, y, w, h, angle, c) {
  const rot = (px, py) => {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    return { x: x + px * ca - py * sa, y: y + px * sa + py * ca };
  };
  const body = [rot(-w / 2, 0), rot(-w / 2, -h * 0.72), rot(0, -h), rot(w / 2, -h * 0.72), rot(w / 2, 0)];
  const out = [rot(-w / 2 - 2.2, 1.5), rot(-w / 2 - 2.2, -h * 0.72 - 1), rot(0, -h - 3), rot(w / 2 + 2.2, -h * 0.72 - 1), rot(w / 2 + 2.2, 1.5)];
  g.fillStyle(0x24170f, 1); g.fillPoints(out);
  g.fillStyle(c.mid, 1); g.fillPoints(body);
  g.fillStyle(c.light, 1); g.fillPoints([rot(-w / 2, 0), rot(-w / 2, -h * 0.72), rot(0, -h), rot(0, 0)]);
  g.fillStyle(c.dark, 0.55); g.fillPoints([rot(w * 0.15, 0), rot(w * 0.15, -h * 0.8), rot(w / 2, -h * 0.72), rot(w / 2, 0)]);
  g.fillStyle(0xffffff, 0.75); g.fillPoints([rot(-w * 0.32, -h * 0.2), rot(-w * 0.32, -h * 0.62), rot(-w * 0.14, -h * 0.74), rot(-w * 0.14, -h * 0.3)]);
}

/** Друза на трёх стадиях роста: [x, y, ширина, высота, наклон]. */
const CRYSTAL_SHARDS = {
  1: [[-6, 0, 11, 22, -0.25], [7, 2, 9, 16, 0.3]],
  2: [[-14, 2, 12, 30, -0.4], [12, 3, 12, 28, 0.38], [0, 0, 16, 44, 0.02], [-4, 6, 9, 16, -0.9]],
  3: [[-22, 4, 13, 32, -0.55], [20, 5, 13, 30, 0.5], [-10, 1, 16, 50, -0.2], [11, 2, 15, 46, 0.22], [0, 0, 19, 64, 0], [-26, 8, 9, 15, -1.05], [26, 9, 9, 14, 1.0]],
};
export const crystalKey = (kind, stage) => 'cr_' + kind + '_' + stage;

/** @param {import('../../engine/TextureCache.js').TextureCache} textures */
export function makeFarmTextures(textures) {
  textures.bake('bed', BED_W + 20, BED_H + 26, BED_W / 2 + 10, BED_H / 2 + 6, (g) => drawBedFrame(g, 0));
  textures.bake('mycelium', 130, 80, 65, 40, (g) => drawMycelium(g, 0));

  textures.bake('glow', 110, 36, 55, 18, (g) => {
    g.fillStyle(0xfff2a8, 0.18); g.fillEllipse(0, 0, 104, 30);
    g.fillStyle(0xfff6c4, 0.22); g.fillEllipse(0, 0, 64, 16);
  });

  textures.bake('marker', 80, 64, 40, 22, (g, label) => {
    g.fillStyle(0x000000, 0.2); g.fillEllipse(0, 20, 30, 7);
    g.fillStyle(0x3e2512, 1); g.fillCircle(0, 0, 17);
    g.fillStyle(0xfff4dc, 1); g.fillCircle(0, 0, 14);
    g.lineStyle(4.2, 0x4f8a3c, 1); g.line(-7, 0, 7, 0); g.line(0, -7, 0, 7);
    label(0, 31, 'Посадить', { size: 10 });
  });

  textures.bake('lock', 140, 70, 70, 24, (g, label) => {
    [-16, 6].forEach((py, i) => {
      g.fillStyle(0x3e2512, 1); g.fillRoundedRect(-66, py - 1, 132, 22, 6);
      g.fillStyle(i ? 0xb08050 : 0xc0905a, 1); g.fillRoundedRect(-64, py + 1, 128, 18, 5);
      g.lineStyle(1.5, 0x8a5f37, 1); g.line(-56, py + 10, 56, py + 10);
      g.fillStyle(0x3e2512, 1); g.fillCircle(-58, py + 10, 1.8); g.fillCircle(58, py + 10, 1.8);
    });
    g.lineStyle(6, 0x3e2512, 1); g.strokeArc(0, -10, 9, Math.PI, 0);
    g.lineStyle(3, 0xbfc4c8, 1); g.strokeArc(0, -10, 9, Math.PI, 0);
    g.fillStyle(0x3e2512, 1); g.fillRoundedRect(-14, -12, 28, 24, 6);
    g.fillStyle(0xe0b04a, 1); g.fillRoundedRect(-12, -10, 24, 20, 5);
    g.fillStyle(0xf5d27a, 1); g.fillRoundedRect(-10, -8, 8, 4, 2);
    g.fillStyle(0x3e2512, 1); g.fillCircle(0, -1, 3); g.fillRect(-1.3, -1, 2.6, 6);
    g.fillStyle(0x3e2512, 0.88); g.fillRoundedRect(-58, 22, 116, 20, 10);
    label(0, 32, 'Открыть · ' + PRICES.unlockBed + ' спор', { size: 8.5, stroke: null, weight: 500 });
  });

  textures.bake('bubble', 64, 38, 32, 16, (g, label) => {
    g.fillStyle(0x3e2512, 1); g.fillRoundedRect(-30, -14, 60, 26, 12); g.fillTriangle(-20, 8, -6, 8, -22, 20);
    g.fillStyle(0xfff4dc, 1); g.fillRoundedRect(-28, -12, 56, 22, 10); g.fillTriangle(-18, 6, -8, 6, -19.5, 15);
    label(0, -1, 'Готов!', { size: 10, color: '#3e2512', stroke: null });
  });

  textures.bake('bar_bg', 100, 18, 0, 9, (g) => {
    g.fillStyle(0x3e2512, 0.9); g.fillRoundedRect(0, -9, 100, 18, 9);
    g.fillStyle(0x2a1a0e, 1); g.fillRoundedRect(2, -7, 96, 14, 7);
  });
  textures.bake('bar_fill', 96, 14, 0, 7, (g) => {
    g.fillStyle(0x8fd16a, 1); g.fillRoundedRect(0, -7, 96, 14, 7);
    g.fillStyle(0xc7f0a6, 0.6); g.fillRoundedRect(3, -5, 90, 3, 1.5);
  });

  textures.bake('glint', 30, 30, 15, 15, (g) => {
    g.fillStyle(0xffffff, 0.35); g.fillCircle(0, 0, 7);
    g.fillStyle(0xffffff, 1);
    g.fillPoints([{ x: 0, y: -13 }, { x: 2.4, y: -2.4 }, { x: 13, y: 0 }, { x: 2.4, y: 2.4 }, { x: 0, y: 13 }, { x: -2.4, y: 2.4 }, { x: -13, y: 0 }, { x: -2.4, y: -2.4 }]);
  });

  for (const [kind, c] of Object.entries(CRYSTALS)) {
    for (const stage of [1, 2, 3]) {
      textures.bake(crystalKey(kind, stage), 90, 84, 45, 76, (g) => {
        g.fillStyle(0x000000, 0.22); g.fillEllipse(0, 2, 36 + stage * 14, 10);
        g.fillStyle(0x3a2618, 1); g.fillEllipse(0, 1, 20 + stage * 10, 7);
        for (const [x, y, w, h, a] of CRYSTAL_SHARDS[stage]) drawShard(g, x, y, w, h, a, c.faces);
      });
    }
  }
}
