import { rng } from '../util/rng.js';
import { NODES, FOREST_MAP } from '../data/content.js';
import { pine, glowShroom } from './scenery.js';
import { bakeBackground, countFor } from './background.js';

/**
 * Графика леса: тёмная опушка с тропой через все бои и значки боёв.
 * Карта выше экрана (FOREST_MAP), фон рисуется на всю её высоту.
 */
const TOP = FOREST_MAP.top, H = FOREST_MAP.bottom - FOREST_MAP.top;
const K = H / 1200; // во сколько раз больше предметов, чем на фоне высотой в экран
function drawForestBg(g, label, { left, right }) {
  const r = rng(21);
  g.verticalGradient(0x24392b, 0x3d6040);
  g.fillRect(left, TOP, right - left, H);
  for (let i = 0; i < 26 * K; i++) {
    g.fillStyle(0xbfe0cf, 0.035); g.fillEllipse(-120 + r() * 630, TOP + 60 + r() * (H - 100), 220 + r() * 200, 50 + r() * 40);
  }
  for (let i = 0; i < 260 * K; i++) {
    g.fillStyle(r() < 0.5 ? 0x4a7046 : 0x2f4c34, 0.5);
    g.fillEllipse(-120 + r() * 630, TOP + 10 + r() * (H - 20), 5 + r() * 9, 2 + r() * 4);
  }

  // тропа через все узлы
  const pts = [{ x: 205, y: FOREST_MAP.bottom + 200 }, { x: 205, y: FOREST_MAP.bottom + 30 }, { x: 208, y: (FOREST_MAP.bottom + NODES[0].y) / 2 }].concat(NODES.map((n) => ({ x: n.x, y: n.y }))).concat([{ x: 195, y: NODES[8].y - 140 }, { x: 190, y: TOP - 100 }]);
  const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  const path = [];
  for (let k = 1; k < pts.length - 2; k++) {
    for (let t = 0; t < 1; t += 0.06) {
      path.push({ x: cr(pts[k - 1].x, pts[k].x, pts[k + 1].x, pts[k + 2].x, t), y: cr(pts[k - 1].y, pts[k].y, pts[k + 1].y, pts[k + 2].y, t) });
    }
  }
  path.forEach((p) => { g.fillStyle(0x6b5a3e, 1); g.fillEllipse(p.x, p.y, 40, 22); });
  path.forEach((p) => { g.fillStyle(0xa48a5e, 1); g.fillEllipse(p.x, p.y, 34, 17); });
  for (let i = 0; i < 70; i++) {
    const p = path[Math.floor(r() * path.length)];
    g.fillStyle(0x857150, 1); g.fillEllipse(p.x + (r() - 0.5) * 22, p.y + (r() - 0.5) * 8, 5, 3);
  }

  // ели и светящиеся грибы по краям тропы
  const trees = [];
  for (let i = 0; i < 70 * K; i++) {
    const y = TOP + 10 + r() * (H - 20);
    const side = r() < 0.5 ? -1 : 1;
    const near = path.reduce((m, p) => (Math.abs(p.y - y) < Math.abs(m.y - y) ? p : m), path[0]);
    const x = near.x + side * (70 + r() * 230);
    trees.push({ x, y, s: 0.7 + r() * 0.8 });
  }
  trees.sort((a, b) => a.y - b.y).forEach((t) => {
    g.fillStyle(0x000000, 0.18); g.fillEllipse(t.x, t.y + 8 * t.s, 60 * t.s, 12 * t.s);
    const shade = r() < 0.5;
    pine(g, t.x, t.y, t.s, shade ? 0x2f5a3a : 0x3a6a42, 0x1b3324);
  });
  const glow = [0x7de0d0, 0xc8ff9a, 0xffe27a];
  for (let i = 0; i < 34 * K; i++) {
    const p = path[Math.floor(r() * path.length)];
    const side = r() < 0.5 ? -1 : 1;
    glowShroom(g, p.x + side * (30 + r() * 40), p.y + (r() - 0.5) * 30, 0.7 + r() * 0.6, glow[i % 3]);
  }
}

/** Края леса для широких экранов: густой ельник и редкие светящиеся грибы. */
function drawForestSides(g, sides, r) {
  const trees = [];
  for (const side of sides) {
    const [a, b] = side;
    const x = () => a + r() * (b - a);
    for (let i = countFor(side, 10 * K); i > 0; i--) {
      g.fillStyle(0xbfe0cf, 0.035); g.fillEllipse(x(), TOP + 60 + r() * (H - 100), 220 + r() * 200, 50 + r() * 40);
    }
    for (let i = countFor(side, 260 * K); i > 0; i--) {
      g.fillStyle(r() < 0.5 ? 0x4a7046 : 0x2f4c34, 0.5);
      g.fillEllipse(x(), TOP + 10 + r() * (H - 20), 5 + r() * 9, 2 + r() * 4);
    }
    for (let i = countFor(side, 110 * K); i > 0; i--) trees.push({ x: x(), y: TOP + 10 + r() * (H - 20), s: 0.7 + r() * 0.8 });
  }
  trees.sort((p, q) => p.y - q.y).forEach((t) => {
    g.fillStyle(0x000000, 0.18); g.fillEllipse(t.x, t.y + 8 * t.s, 60 * t.s, 12 * t.s);
    pine(g, t.x, t.y, t.s, r() < 0.5 ? 0x2f5a3a : 0x3a6a42, 0x1b3324);
  });
  const glow = [0x7de0d0, 0xc8ff9a, 0xffe27a];
  for (const side of sides) {
    for (let i = countFor(side, 12 * K); i > 0; i--) {
      glowShroom(g, side[0] + r() * (side[1] - side[0]), TOP + 60 + r() * (H - 100), 0.7 + r() * 0.6, glow[i % 3]);
    }
  }
}

/** Фон леса под текущую ширину экрана. */
export function forestBackground(textures, renderer) {
  return bakeBackground(textures, renderer, 'forest', drawForestBg, drawForestSides, FOREST_MAP);
}

/** @param {import('../../engine/TextureCache.js').TextureCache} textures */
export function makeForestTextures(textures) {
  const ring = (g, R, fill, hi) => {
    g.fillStyle(0x000000, 0.25); g.fillEllipse(0, R - 2, R * 1.8, R * 0.6);
    g.fillStyle(0x24170f, 1); g.fillCircle(0, 0, R);
    g.fillStyle(fill, 1); g.fillCircle(0, 0, R - 3);
    g.fillStyle(hi, 0.7); g.fillEllipse(-R * 0.25, -R * 0.4, R * 0.9, R * 0.45);
  };
  const lock = (g, s) => {
    g.lineStyle(3.2 * s, 0x24170f, 1); g.strokeArc(0, -4 * s, 5.5 * s, Math.PI, 0);
    g.fillStyle(0x24170f, 1); g.fillRoundedRect(-8 * s, -4 * s, 16 * s, 13 * s, 3 * s);
    g.fillStyle(0xd0d4cc, 1); g.fillRoundedRect(-6 * s, -2 * s, 12 * s, 9 * s, 2 * s);
    g.fillStyle(0x24170f, 1); g.fillCircle(0, 2 * s, 1.8 * s);
  };
  const cap = (g) => {
    g.fillStyle(0x24112e, 1); g.fillEllipse(0, 6, 40, 34);
    g.fillStyle(0x6b3fa0, 1); g.fillEllipse(0, 6, 35, 29);
    g.fillStyle(0x24112e, 1); g.fillRect(-21, 6, 42, 18);
    g.fillStyle(0xd9cde6, 1); g.fillRoundedRect(-5, 4, 10, 10, 3);
    g.fillStyle(0xc8ff9a, 1); [[-9, -2, 3], [3, -6, 3.4], [10, 1, 2.4]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
  };
  textures.bake('node_done', 64, 64, 32, 30, (g) => ring(g, 22, 0x6fbf55, 0xb4ec92));
  textures.bake('node_open', 64, 64, 32, 30, (g) => {
    g.fillStyle(0xffe27a, 0.25); g.fillCircle(0, 0, 30);
    ring(g, 24, 0xffc93c, 0xfff0a8);
  });
  textures.bake('node_locked', 64, 64, 32, 30, (g) => { ring(g, 21, 0x7f857a, 0xa9aea4); lock(g, 1); });
  textures.bake('nodeb_done', 84, 84, 42, 40, (g) => { ring(g, 30, 0x6fbf55, 0xb4ec92); cap(g); });
  textures.bake('nodeb_open', 84, 84, 42, 40, (g) => {
    g.fillStyle(0xc8ff9a, 0.22); g.fillCircle(0, 0, 40);
    ring(g, 32, 0x9b6bd0, 0xc9a8ee); cap(g);
  });
  textures.bake('nodeb_locked', 84, 84, 42, 40, (g) => { ring(g, 30, 0x7f857a, 0xa9aea4); lock(g, 1.5); });
}
