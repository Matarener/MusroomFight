import { rng } from '../util/rng.js';
import { pine, glowShroom } from './scenery.js';
import { bakeBackground, countFor, grassTuft, hashRandom as h } from './background.js';

/**
 * Фоны мест Зоны: девять глав леса (бои и катсцены).
 * Раскладка как у поля боя: небо и горизонт выше y=380, земля ниже; бойцы стоят на y 500–720.
 * Каждое место — палитра плюс свои предметы. Полосы на всю ширину (небо, горизонт, земля)
 * рисуются по hashRandom, чтобы на широком экране не было швов.
 */

const HORIZON = 380;

/* ---------- общие кусочки ---------- */
function sky(g, { left, right }, top, bottom, haze) {
  g.verticalGradient(top, bottom);
  g.fillRect(left, -160, right - left, HORIZON + 220);
  const from = Math.floor((left - 40) / 160) * 160;
  for (let x = from; x < right + 160; x += 160) {
    g.fillStyle(haze, 0.06); g.fillEllipse(x + h(x, 1) * 80, 100 + h(x, 2) * 240, 260, 50);
  }
}

function ground(g, { left, right }, top, bottom, edge, glade) {
  g.verticalGradient(top, bottom);
  g.fillRect(left, HORIZON, right - left, 660);
  g.fillStyle(edge, 1);
  const from = Math.floor((left - 40) / 16) * 16;
  for (let x = from; x < right + 20; x += 16) g.fillEllipse(x, HORIZON + 2 + h(x, 6) * 4, 28, 14);
  if (glade) {
    g.fillStyle(glade, 0.35); g.fillEllipse(195, 610, 470, 300);
    g.fillStyle(glade, 0.3); g.fillEllipse(195, 610, 330, 200);
  }
}

function treeLine(g, { left, right }, color, dark, y = 330, step = 34, size = 0.9) {
  const from = Math.floor((left - 40) / step) * step;
  for (let x = from; x < right + 40; x += step) pine(g, x + h(x, 3) * 16, y + h(x, 4) * 40, size + h(x, 5) * 0.5, color, dark);
}

function specks(g, r, n, colors, alpha = 0.45, x0 = -120, w = 630) {
  for (let i = 0; i < n; i++) {
    g.fillStyle(colors[i % colors.length], alpha);
    g.fillEllipse(x0 + r() * w, 400 + r() * 640, 4 + r() * 8, 2 + r() * 4);
  }
}

function tufts(g, r, n, colors, x0 = -120, w = 630) {
  for (let i = 0; i < n; i++) grassTuft(g, x0 + r() * w, 400 + r() * 640, colors[i % colors.length]);
}

function rock(g, x, y, w, fill = 0x6f7a6a, hi = 0x9aa592) {
  g.fillStyle(0x000000, 0.15); g.fillEllipse(x, y + 4, w * 1.4, 8);
  g.fillStyle(fill, 1); g.fillEllipse(x, y, w, w * 0.6);
  g.fillStyle(hi, 1); g.fillEllipse(x - w * 0.15, y - w * 0.1, w * 0.6, w * 0.3);
}

/** Голое мёртвое дерево. */
function deadTree(g, x, y, s, color = 0x3a2c22) {
  g.lineStyle(7 * s, color, 1); g.line(x, y, x - 4 * s, y - 70 * s);
  g.lineStyle(4 * s, color, 1);
  g.line(x - 2 * s, y - 40 * s, x - 26 * s, y - 62 * s);
  g.line(x - 3 * s, y - 55 * s, x + 20 * s, y - 80 * s);
  g.line(x - 4 * s, y - 70 * s, x - 14 * s, y - 92 * s);
  g.lineStyle(2.5 * s, color, 1);
  g.line(x - 20 * s, y - 57 * s, x - 30 * s, y - 52 * s);
  g.line(x + 12 * s, y - 70 * s, x + 24 * s, y - 70 * s);
}

/** Кристалл стихии на земле: три грани. */
function crystal(g, x, y, s, [mid, light, dark]) {
  g.fillStyle(mid, 0.25); g.fillEllipse(x, y - 14 * s, 44 * s, 40 * s);
  g.fillStyle(0x24170f, 1); g.fillPoints([{ x: x - 11 * s, y: y + 1 }, { x: x - 8 * s, y: y - 24 * s }, { x, y: y - 36 * s }, { x: x + 9 * s, y: y - 22 * s }, { x: x + 11 * s, y: y + 1 }]);
  g.fillStyle(mid, 1); g.fillPoints([{ x: x - 9 * s, y }, { x: x - 6 * s, y: y - 22 * s }, { x, y: y - 33 * s }, { x: x + 7 * s, y: y - 21 * s }, { x: x + 9 * s, y }]);
  g.fillStyle(light, 1); g.fillPoints([{ x: x - 6 * s, y: y - 22 * s }, { x, y: y - 33 * s }, { x, y }, { x: x - 9 * s, y }]);
  g.fillStyle(dark, 0.6); g.fillPoints([{ x: x + 2 * s, y }, { x: x + 7 * s, y: y - 21 * s }, { x: x + 9 * s, y }]);
}
const CRYSTAL = [[0xe8a33c, 0xffd98a, 0xa8601a], [0xa765d8, 0xe2c4ff, 0x5e2e8c], [0x3fbf78, 0xb4f2c8, 0x1a7444]];

/** Металлическая решётчатая опора Вышки. */
function lattice(g, x1, y1, x2, y2, w, color, alpha = 1) {
  g.lineStyle(w, color, alpha); g.line(x1, y1, x2, y2);
}
function towerSilhouette(g, cx, base, top, halfBase, halfTop, color, alpha) {
  lattice(g, cx - halfBase, base, cx - halfTop, top, 6, color, alpha);
  lattice(g, cx + halfBase, base, cx + halfTop, top, 6, color, alpha);
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps, t1 = (i + 1) / steps;
    const y0 = base + (top - base) * t0, y1 = base + (top - base) * t1;
    const w0 = halfBase + (halfTop - halfBase) * t0, w1 = halfBase + (halfTop - halfBase) * t1;
    lattice(g, cx - w0, y0, cx + w1, y1, 2.5, color, alpha);
    lattice(g, cx + w0, y0, cx - w1, y1, 2.5, color, alpha);
    lattice(g, cx - w1, y1, cx + w1, y1, 2.5, color, alpha);
  }
}

/* ---------- 1. Опушка: светлый день, ельник, цветы ---------- */
function opushka(g, label, ext) {
  const r = rng(101);
  sky(g, ext, 0x9fd0e8, 0xd9eedc, 0xffffff);
  treeLine(g, ext, 0x4f8a4a, 0x2f5a30, 320, 40, 0.8);
  treeLine(g, ext, 0x3d7040, 0x24442a, 345, 30, 1);
  ground(g, ext, 0x8cbf62, 0x5f8f42, 0x8cbf62, 0xb2d68a);
  specks(g, r, 200, [0x6f9a50, 0x9cc274]);
  tufts(g, r, 50, [0x4f7d3c, 0x5e9346]);
  for (let i = 0; i < 40; i++) {
    const x = -120 + r() * 630, y = 410 + r() * 620;
    g.fillStyle([0xffffff, 0xffe27a, 0xf2a7c6][i % 3], 1); g.fillCircle(x, y, 2.6);
    g.fillStyle(0xffd45c, 1); g.fillCircle(x, y, 1);
  }
  rock(g, 50, 455, 22); rock(g, 340, 470, 16);
  // старая изгородь фермы позади
  g.fillStyle(0x6b4a2c, 1);
  for (let x = -110; x < 120; x += 26) g.fillRect(x, 372, 5, 26);
  g.fillRect(-114, 378, 234, 4); g.fillRect(-114, 389, 234, 4);
}

/* ---------- 2. Старый забор: пасмурно, ржавая сетка, знак ---------- */
function fence(g, label, ext) {
  const r = rng(202);
  sky(g, ext, 0x8a9a96, 0xc6cfc4, 0xffffff);
  treeLine(g, ext, 0x4d6a52, 0x2e4434, 330, 36, 0.9);
  ground(g, ext, 0x8ea46a, 0x60744a, 0x8ea46a, 0xa6b884);
  // сетка-рабица на всю ширину: столбы, проволока, ржавые пятна
  const { left, right } = ext;
  const from = Math.floor((left - 60) / 70) * 70;
  g.lineStyle(1.2, 0x5a5a52, 0.55);
  for (let x = from; x < right + 70; x += 9) { g.line(x, 300, x + 30, 392); g.line(x + 30, 300, x, 392); }
  for (let x = from; x < right + 70; x += 70) {
    const lean = (h(x, 7) - 0.5) * 10;
    g.fillStyle(0x24170f, 1); g.fillRect(x - 4, 290, 8, 106);
    g.fillStyle(0x7a5a3a, 1); g.fillRect(x - 2.5, 292 + lean * 0.1, 5, 102);
    g.lineStyle(2, 0x6a6a60, 1); g.line(x, 296, x + 70, 296 + lean);
    g.fillStyle(0xa0582a, 0.55); g.fillEllipse(x + 30 + h(x, 8) * 20, 330 + h(x, 9) * 40, 18, 10);
  }
  g.lineStyle(2, 0x6a6a60, 1); g.line(left, 392, right, 392);
  // колючая проволока сверху
  g.lineStyle(1.5, 0x4a4a44, 1);
  for (let x = from; x < right + 70; x += 14) { g.line(x, 288, x + 7, 284); g.line(x + 7, 284, x + 14, 288); }
  // жёлтый треугольный знак на столбе посередине
  g.fillStyle(0x24170f, 1); g.fillTriangle(195 - 26, 362, 195 + 26, 362, 195, 316);
  g.fillStyle(0xf0c43a, 1); g.fillTriangle(195 - 21, 358, 195 + 21, 358, 195, 322);
  g.fillStyle(0x24170f, 1); g.fillCircle(195, 346, 3);
  for (let k = 0; k < 3; k++) {
    g.local(195, 346, (k * Math.PI * 2) / 3 - Math.PI / 2, () => g.fillTriangle(5, -4, 5, 4, 15, 0));
  }
  specks(g, r, 200, [0x76885a, 0xa4b47e]);
  tufts(g, r, 60, [0x56693e, 0x6f8450]);
  // обрывок сетки, лежащий в траве
  g.lineStyle(1.2, 0x5a5a52, 0.6);
  for (let k = 0; k < 6; k++) g.line(300 + k * 8, 470, 330 + k * 8, 500);
  rock(g, 70, 470, 20, 0x7a7a72, 0xa8a89c);
}

/* ---------- 3. Рыжий лес: рыжие сосны, янтарное небо ---------- */
function rustForest(g, label, ext) {
  const r = rng(303);
  sky(g, ext, 0xd9894a, 0xf4cf8c, 0xfff0d0);
  treeLine(g, ext, 0xc4582a, 0x7a2e16, 315, 38, 0.8);
  treeLine(g, ext, 0xd8753a, 0x8a3a1a, 345, 30, 1.05);
  ground(g, ext, 0xa89a4e, 0x7a6a34, 0xb0a25a, 0xc2b46a);
  // рыжая хвоя на земле
  for (let i = 0; i < 260; i++) {
    g.fillStyle(r() < 0.5 ? 0xd06a2e : 0xe39a4a, 0.55);
    g.local(-120 + r() * 630, 400 + r() * 640, r() * 3, () => g.fillRect(-5, -0.8, 10, 1.6));
  }
  tufts(g, r, 40, [0x8a7a34, 0x9c8a3e]);
  // пни и светящиеся грибочки
  [[40, 470], [350, 480]].forEach(([x, y]) => {
    g.fillStyle(0x000000, 0.2); g.fillEllipse(x, y + 6, 40, 10);
    g.fillStyle(0x5a3018, 1); g.fillRoundedRect(x - 16, y - 18, 32, 24, 6);
    g.fillStyle(0xe0a060, 1); g.fillEllipse(x, y - 18, 30, 10);
    g.lineStyle(1, 0xa0602a, 1); g.strokeEllipse(x, y - 18, 18, 6);
  });
  [[20, 820], [380, 800], [-60, 600], [450, 620]].forEach(([x, y], i) => glowShroom(g, x, y, 1.2, i % 2 ? 0xffb060 : 0xffe27a));
}

/* ---------- 4. Болото: тёмная бирюза, светящаяся вода, камыш ---------- */
function swamp(g, label, ext) {
  const r = rng(404);
  sky(g, ext, 0x1f3a3c, 0x46706a, 0xcfeee0);
  const { left, right } = ext;
  for (let x = Math.floor((left - 60) / 90) * 90; x < right + 90; x += 90) deadTree(g, x + h(x, 3) * 40, 360 + h(x, 4) * 20, 0.8 + h(x, 5) * 0.5, 0x223a34);
  ground(g, ext, 0x4f7a52, 0x2f4e3a, 0x4f7a52, null);
  // лужи с зелёным свечением
  [[30, 470, 150, 40], [330, 520, 170, 46], [190, 800, 260, 60], [-60, 700, 140, 40], [460, 760, 160, 44]].forEach(([x, y, w, hh]) => {
    g.fillStyle(0x9bf07a, 0.12); g.fillEllipse(x, y, w + 30, hh + 16);
    g.fillStyle(0x1a3a34, 1); g.fillEllipse(x, y, w, hh);
    g.fillStyle(0x3f8a6a, 1); g.fillEllipse(x, y - 2, w - 10, hh - 10);
    g.fillStyle(0x9bf07a, 0.35); g.fillEllipse(x - w * 0.15, y - hh * 0.15, w * 0.4, hh * 0.25);
  });
  // камыш
  for (let i = 0; i < 26; i++) {
    const x = -120 + r() * 630, y = 420 + r() * 600;
    g.lineStyle(2, 0x3a5a2e, 1); g.line(x, y, x - 2, y - 30); g.line(x + 4, y, x + 6, y - 24);
    g.fillStyle(0x6a4a2a, 1); g.fillRoundedRect(x - 4.5, y - 40, 5, 13, 2.5);
  }
  specks(g, r, 140, [0x3a5e40, 0x5e8a58]);
  // туман у земли
  for (let i = 0; i < 10; i++) { g.fillStyle(0xcfeee0, 0.07); g.fillEllipse(-120 + r() * 630, 420 + r() * 560, 260, 40); }
}

/* ---------- 5. Лагерь Сморчка: палатки из листьев, зелёный костёр, флаги ---------- */
function camp(g, label, ext) {
  const r = rng(505);
  sky(g, ext, 0x3a4a3a, 0x7a8a62, 0xe0f0c0);
  treeLine(g, ext, 0x3a5a36, 0x22361f, 330, 34, 0.95);
  ground(g, ext, 0x7a8a4e, 0x55602e, 0x7a8a4e, 0x8e9c5c);
  // утоптанная площадка
  g.fillStyle(0x8a7a4a, 0.5); g.fillEllipse(195, 620, 420, 260);
  const tent = (x, y, s, fill, dark) => {
    g.fillStyle(0x000000, 0.2); g.fillEllipse(x, y + 4, 120 * s, 16 * s);
    g.fillStyle(0x24170f, 1); g.fillTriangle(x - 60 * s, y + 2, x + 60 * s, y + 2, x, y - 82 * s);
    g.fillStyle(fill, 1); g.fillTriangle(x - 55 * s, y, x + 55 * s, y, x, y - 76 * s);
    g.fillStyle(dark, 1); g.fillTriangle(x - 16 * s, y, x + 16 * s, y, x, y - 44 * s);
    g.lineStyle(2 * s, dark, 0.8); g.line(x - 27 * s, y - 38 * s, x - 40 * s, y); g.line(x + 27 * s, y - 38 * s, x + 40 * s, y);
  };
  tent(20, 420, 0.9, 0x6a9a3a, 0x3a5a1e); tent(370, 415, 0.8, 0x8a7a3a, 0x4a3a1a); tent(-80, 450, 1, 0x5a8a3a, 0x2e4a1a); tent(480, 455, 0.95, 0x7a9a40, 0x3a5a1e);
  // флаги с глазом Светляков
  const flag = (x, y) => {
    g.fillStyle(0x3e2512, 1); g.fillRect(x - 2, y - 90, 4, 90);
    g.fillStyle(0x24170f, 1); g.fillPoints([{ x: x + 2, y: y - 90 }, { x: x + 46, y: y - 80 }, { x: x + 2, y: y - 62 }]);
    g.fillStyle(0x2f5a24, 1); g.fillPoints([{ x: x + 3, y: y - 87 }, { x: x + 40, y: y - 79 }, { x: x + 3, y: y - 66 }]);
    g.fillStyle(0x9bf07a, 1); g.fillEllipse(x + 16, y - 77, 12, 7);
    g.fillStyle(0x24170f, 1); g.fillCircle(x + 16, y - 77, 2);
  };
  flag(120, 420); flag(260, 418);
  // зелёный костёр у края
  const fire = (x, y) => {
    g.fillStyle(0x9bf07a, 0.18); g.fillCircle(x, y - 18, 40);
    g.fillStyle(0x4a3018, 1); g.local(x, y, 0.4, () => g.fillRoundedRect(-22, -4, 44, 8, 4)); g.local(x, y, -0.4, () => g.fillRoundedRect(-22, -4, 44, 8, 4));
    g.fillStyle(0x3fbf3a, 1); g.fillTriangle(x - 14, y - 2, x + 14, y - 2, x, y - 40);
    g.fillStyle(0x9bf07a, 1); g.fillTriangle(x - 9, y - 2, x + 9, y - 2, x + 2, y - 30);
    g.fillStyle(0xe6ffd0, 1); g.fillTriangle(x - 4, y - 2, x + 4, y - 2, x, y - 16);
  };
  fire(-40, 820); fire(440, 800);
  specks(g, r, 160, [0x6a7a3e, 0x9aa868]);
  tufts(g, r, 40, [0x4f5e2a, 0x667838]);
}

/* ---------- 6. Заброшенная деревня: домики, колодец, бурьян ---------- */
function village(g, label, ext) {
  const r = rng(606);
  sky(g, ext, 0xb6a9c6, 0xf0d8b6, 0xffffff);
  treeLine(g, ext, 0x4f6e4a, 0x2f4430, 335, 44, 0.85);
  const house = (x, y, s, wall, roof) => {
    g.fillStyle(0x24170f, 1); g.fillRect(x - 42 * s, y - 52 * s, 84 * s, 54 * s);
    g.fillStyle(wall, 1); g.fillRect(x - 39 * s, y - 49 * s, 78 * s, 49 * s);
    g.lineStyle(1.5 * s, 0x5a3a20, 0.6);
    for (let k = 1; k < 5; k++) g.line(x - 39 * s, y - 49 * s + k * 10 * s, x + 39 * s, y - 49 * s + k * 10 * s);
    g.fillStyle(0x24170f, 1); g.fillTriangle(x - 52 * s, y - 48 * s, x + 52 * s, y - 48 * s, x, y - 92 * s);
    g.fillStyle(roof, 1); g.fillTriangle(x - 46 * s, y - 51 * s, x + 46 * s, y - 51 * s, x, y - 87 * s);
    // разбитое окно с досками крест-накрест
    g.fillStyle(0x24170f, 1); g.fillRect(x - 13 * s, y - 38 * s, 26 * s, 20 * s);
    g.fillStyle(0x3a4a4a, 1); g.fillRect(x - 10 * s, y - 35 * s, 20 * s, 14 * s);
    g.lineStyle(3 * s, 0x8a6a40, 1); g.line(x - 14 * s, y - 38 * s, x + 14 * s, y - 18 * s); g.line(x + 14 * s, y - 38 * s, x - 14 * s, y - 18 * s);
  };
  house(-40, 395, 0.9, 0x9a7048, 0x6a5a52); house(110, 385, 0.7, 0x8a6440, 0x5a4a44); house(330, 392, 0.85, 0xa07a4e, 0x70605a); house(500, 400, 0.95, 0x946a44, 0x645450);
  ground(g, ext, 0x8aa45a, 0x5e7a3e, 0x8aa45a, 0x9cb46c);
  // колодец справа
  const wx = 345, wy = 480;
  g.fillStyle(0x000000, 0.2); g.fillEllipse(wx, wy + 6, 76, 14);
  g.fillStyle(0x3e2512, 1); g.fillRect(wx - 30, wy - 76, 5, 70); g.fillRect(wx + 25, wy - 76, 5, 70);
  g.fillStyle(0x24170f, 1); g.fillTriangle(wx - 42, wy - 70, wx + 42, wy - 70, wx, wy - 100);
  g.fillStyle(0x7a4a2a, 1); g.fillTriangle(wx - 36, wy - 72, wx + 36, wy - 72, wx, wy - 96);
  g.fillStyle(0x24170f, 1); g.fillRoundedRect(wx - 34, wy - 30, 68, 34, 8);
  g.fillStyle(0x8a8a80, 1); g.fillRoundedRect(wx - 31, wy - 27, 62, 28, 6);
  g.lineStyle(1.5, 0x5a5a52, 1); for (let k = 1; k < 4; k++) g.line(wx - 31 + k * 16, wy - 27, wx - 31 + k * 16, wy);
  g.fillStyle(0x24170f, 1); g.fillEllipse(wx, wy - 29, 64, 12);
  g.fillStyle(0x2a3a3a, 1); g.fillEllipse(wx, wy - 29, 56, 8);
  // покосившийся плетень слева
  g.lineStyle(3, 0x6b4a2c, 1);
  for (let k = 0; k < 6; k++) g.line(-20 + k * 18, 470, -24 + k * 18 + (k % 2) * 6, 430);
  g.line(-26, 445, 80, 438); g.line(-26, 458, 80, 452);
  specks(g, r, 170, [0x6e8a48, 0xa2b872]);
  // бурьян
  for (let i = 0; i < 70; i++) grassTuft(g, -120 + r() * 630, 400 + r() * 640, i % 2 ? 0x56703a : 0x6e8a46);
}

/* ---------- 7. Мёртвая дорога: асфальт с трещинами, столбы ---------- */
function road(g, label, ext) {
  const r = rng(707);
  sky(g, ext, 0x6a5a8a, 0xf0a878, 0xffe0c0);
  // столбы с проводами на всю ширину
  const { left, right } = ext;
  const from = Math.floor((left - 100) / 110) * 110;
  for (let x = from; x < right + 110; x += 110) {
    const tilt = (h(x, 2) - 0.5) * 0.25;
    g.local(x, 380, tilt, () => {
      g.fillStyle(0x3a2a22, 1); g.fillRect(-3, -110, 6, 110); g.fillRect(-20, -100, 40, 4);
    });
    g.lineStyle(1.2, 0x3a2a22, 0.8); g.line(x - 18, 282, x + 92, 290 + h(x, 4) * 10); g.line(x + 18, 282, x + 128, 290 + h(x, 4) * 10);
  }
  for (let x = Math.floor((left - 60) / 120) * 120; x < right + 120; x += 120) deadTree(g, x + h(x, 7) * 60, 382, 0.7, 0x4a3a40);
  ground(g, ext, 0x8a8a5a, 0x5e6040, 0x8a8a5a, null);
  // дорога от горизонта вниз, в перспективе
  g.fillStyle(0x3a3a3e, 1); g.fillPoints([{ x: 170, y: HORIZON }, { x: 220, y: HORIZON }, { x: 470, y: 1040 }, { x: -80, y: 1040 }]);
  g.fillStyle(0x5a5a5e, 1); g.fillPoints([{ x: 174, y: HORIZON }, { x: 216, y: HORIZON }, { x: 460, y: 1040 }, { x: -70, y: 1040 }]);
  g.fillStyle(0xe8e0c0, 0.8);
  for (let t = 0.05; t < 1; t += 0.12) {
    const y = HORIZON + t * t * 660, w = 2 + t * 6, hh = 6 + t * 30;
    g.fillRect(195 - w / 2, y, w, hh);
  }
  // трещины и трава сквозь асфальт
  g.lineStyle(1.6, 0x2a2a2e, 1);
  for (let i = 0; i < 16; i++) {
    const t = 0.15 + r() * 0.85, y = HORIZON + t * t * 660, x = 195 + (r() - 0.5) * (40 + t * 440);
    g.line(x, y, x + (r() - 0.5) * 30, y + 8 + r() * 14); g.line(x, y, x + (r() - 0.5) * 24, y - 6);
    grassTuft(g, x + 4, y + 4, 0x6a7a3a);
  }
  specks(g, r, 140, [0x6e704a, 0x9a9a68]);
  // ржавый знак на обочине
  g.fillStyle(0x3a2a22, 1); g.fillRect(28, 420, 4, 60);
  g.fillStyle(0x24170f, 1); g.fillCircle(30, 416, 17);
  g.fillStyle(0xc0482a, 1); g.fillCircle(30, 416, 14);
  g.fillStyle(0xf0e8d8, 1); g.fillRect(21, 413, 18, 6);
  g.fillStyle(0xa0582a, 0.6); g.fillEllipse(36, 422, 10, 6);
}

/* ---------- 8. У подножия Вышки: трещины со свечением, кристаллы, опоры ---------- */
function towerFoot(g, label, ext) {
  const r = rng(808);
  sky(g, ext, 0x26303e, 0x5a6a5a, 0xcfe8c0);
  // огромные опоры Вышки уходят в небо
  towerSilhouette(g, 195, 390, -160, 230, 120, 0x1a2228, 0.9);
  g.fillStyle(0x9bf07a, 0.08); g.fillEllipse(195, 300, 520, 300);
  ground(g, ext, 0x6a6a52, 0x44443a, 0x6a6a52, null);
  // трещины в земле с зелёным светом
  const crack = (pts) => {
    g.lineStyle(9, 0x9bf07a, 0.18); g.strokePolyline(pts);
    g.lineStyle(4, 0x24170f, 1); g.strokePolyline(pts);
    g.lineStyle(1.6, 0x9bf07a, 1); g.strokePolyline(pts);
  };
  crack([{ x: -120, y: 520 }, { x: -40, y: 540 }, { x: 10, y: 600 }, { x: 80, y: 640 }, { x: 120, y: 760 }]);
  crack([{ x: 510, y: 560 }, { x: 440, y: 580 }, { x: 380, y: 660 }, { x: 330, y: 700 }]);
  crack([{ x: 160, y: 1040 }, { x: 200, y: 930 }, { x: 260, y: 880 }, { x: 250, y: 800 }]);
  // гроздья кристаллов
  [[40, 470, 1], [350, 480, 1.1], [-60, 820, 1.3], [450, 840, 1.2], [200, 1000, 1]].forEach(([x, y, s], i) => {
    crystal(g, x - 14 * s, y + 4, s * 0.8, CRYSTAL[(i + 1) % 3]);
    crystal(g, x, y, s, CRYSTAL[i % 3]);
    crystal(g, x + 15 * s, y + 6, s * 0.7, CRYSTAL[(i + 2) % 3]);
  });
  for (let i = 0; i < 160; i++) { g.fillStyle(r() < 0.5 ? 0x5a5a46 : 0x7a7a5e, 0.5); g.fillEllipse(-120 + r() * 630, 400 + r() * 640, 4 + r() * 8, 2 + r() * 4); }
  rock(g, 110, 455, 20, 0x5a5a52, 0x7e7e72); rock(g, 280, 445, 16, 0x5a5a52, 0x7e7e72);
}

/* ---------- 9. Вышка: ночь, звёзды, металлическая площадка, гора кристаллов ---------- */
/* dawn — та же Вышка на рассвете, в финале, когда сияние погасло */
function tower(g, label, ext, dawn = false) {
  const r = rng(909);
  const { left, right } = ext;
  if (dawn) sky(g, ext, 0x8a8ac0, 0xffc890, 0xfff0d8);
  else sky(g, ext, 0x0e1424, 0x2a3a4a, 0x9bf07a);
  for (let i = 0; i < (dawn ? 0 : 90); i++) {
    const x = left + h(i * 37.1, 11) * (right - left), y = -150 + h(i * 13.7, 12) * 480;
    g.fillStyle(0xffffff, 0.4 + h(i, 13) * 0.6); g.fillCircle(x, y, 0.8 + h(i, 14) * 1.4);
  }
  // гора светящихся кристаллов за площадкой
  if (dawn) { g.fillStyle(0xfff0b0, 0.5); g.fillCircle(300, 250, 60); }
  g.fillStyle(0x9bf07a, dawn ? 0.04 : 0.12); g.fillEllipse(195, 300, 560, 320);
  g.fillStyle(0x9bf07a, dawn ? 0.05 : 0.15); g.fillEllipse(195, 330, 340, 180);
  [[110, 380, 1.6], [195, 370, 2.4], [280, 382, 1.7], [150, 385, 1.2], [245, 388, 1.3], [60, 392, 1.1], [330, 392, 1.1]].forEach(([x, y, s], i) => crystal(g, x, y, s, CRYSTAL[i % 3]));
  // верх Вышки: перила и балки
  g.lineStyle(4, 0x3a4a52, 1);
  g.line(left, 360, right, 360); g.line(left, 330, right, 330);
  for (let x = Math.floor((left - 40) / 40) * 40; x < right + 40; x += 40) { g.line(x, 330, x, 392); g.lineStyle(2, 0x3a4a52, 1); g.line(x, 330, x + 40, 360); g.lineStyle(4, 0x3a4a52, 1); }
  // металлическая площадка
  g.verticalGradient(dawn ? 0x7a7a80 : 0x4a5660, dawn ? 0x4a4a52 : 0x2a323a);
  g.fillRect(left, 392, right - left, 650);
  g.lineStyle(1.5, 0x1e252c, 1);
  for (let y = 430; y < 1040; y += 44) g.line(left, y, right, y);
  for (let x = Math.floor((left - 40) / 80) * 80; x < right + 80; x += 80) g.line(x, 392, x, 1040);
  g.fillStyle(0x6a7680, 1);
  for (let y = 436; y < 1040; y += 44) for (let x = Math.floor((left - 40) / 80) * 80 + 6; x < right + 80; x += 80) { g.fillCircle(x, y, 1.6); g.fillCircle(x + 68, y, 1.6); }
  // зелёные лужицы света и осколки
  g.fillStyle(dawn ? 0xffd9a0 : 0x9bf07a, 0.12); g.fillEllipse(195, 620, 460, 260);
  for (let i = 0; i < 14; i++) crystal(g, -120 + r() * 630, 430 + r() * 600, 0.35 + r() * 0.3, CRYSTAL[i % 3]);
}

/* ---------- края для широких экранов ---------- */
const SIDES = {
  opushka: [[0x6f9a50, 0x9cc274], [0x4f7d3c, 0x5e9346]],
  fence: [[0x76885a, 0xa4b47e], [0x56693e, 0x6f8450]],
  rust: [[0xd06a2e, 0xe39a4a], [0x8a7a34, 0x9c8a3e]],
  swamp: [[0x3a5e40, 0x5e8a58], [0x3a5a2e, 0x2e4a24]],
  camp: [[0x6a7a3e, 0x9aa868], [0x4f5e2a, 0x667838]],
  village: [[0x6e8a48, 0xa2b872], [0x56703a, 0x6e8a46]],
  road: [[0x6e704a, 0x9a9a68], [0x5a6a32, 0x6a7a3a]],
  towerFoot: [[0x5a5a46, 0x7a7a5e], [0x4a4a3a, 0x5a5a46]],
  tower: [[0x3a4650, 0x4a5660], [0x2a323a, 0x323a42]],
  towerDawn: [[0x6a6a72, 0x7a7a80], [0x4a4a52, 0x5a5a62]],
};

function sidesFor(id) {
  const [speckColors, tuftColors] = SIDES[id];
  return (g, sides, r) => {
    for (const side of sides) {
      const [a, b] = side;
      const x = () => a + r() * (b - a);
      for (let i = countFor(side, 200); i > 0; i--) { g.fillStyle(speckColors[i % 2], 0.45); g.fillEllipse(x(), 400 + r() * 640, 4 + r() * 8, 2 + r() * 4); }
      if (id !== 'tower' && id !== 'towerDawn') for (let i = countFor(side, 50); i > 0; i--) grassTuft(g, x(), 400 + r() * 640, tuftColors[i % 2]);
      if (id === 'towerFoot' || id === 'tower' || id === 'towerDawn') for (let i = countFor(side, 4); i > 0; i--) crystal(g, x(), 440 + r() * 560, 0.6 + r() * 0.5, CRYSTAL[i % 3]);
      if (id === 'swamp' || id === 'rust') for (let i = countFor(side, 4); i > 0; i--) glowShroom(g, x(), 440 + r() * 560, 1.1, id === 'swamp' ? 0x9bf07a : 0xffb060);
    }
  };
}

const DRAW = { opushka, fence, rust: rustForest, swamp, camp, village, road, towerFoot, tower, towerDawn: (g, l, e) => tower(g, l, e, true) };

/** Место каждой главы (по порядку боёв в лесу). */
export const CHAPTER_LOCATIONS = ['opushka', 'fence', 'rust', 'swamp', 'camp', 'village', 'road', 'towerFoot', 'tower'];
export const LOCATION_IDS = Object.keys(DRAW);

let lastKey = null;

/**
 * Фон места под текущую ширину экрана. В памяти держится только последний фон места:
 * фоны большие, а нужны по одному (бой или катсцена).
 * @returns {string} ключ текстуры
 */
export function locationBackground(textures, renderer, id) {
  const key = bakeBackground(textures, renderer, 'loc_' + id, DRAW[id], sidesFor(id));
  if (lastKey && lastKey !== key && !lastKey.startsWith('loc_' + id + ':')) textures.delete(lastKey);
  lastKey = key;
  return key;
}
