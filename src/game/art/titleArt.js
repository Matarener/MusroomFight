/**
 * Графика титульного экрана: клубок драки, комиксные выкрики, звёздочки над головой.
 */

/** Облако пыли из пухлых кругов. */
function drawCloud(g) {
  const puffs = [
    [0, 0, 56], [-50, 12, 40], [50, 10, 42], [-28, -30, 36], [30, -32, 38], [0, -44, 30],
    [-70, -14, 26], [72, -12, 28], [-36, 38, 32], [38, 38, 32], [0, 40, 36],
  ];
  // линии движения вокруг клубка
  g.lineStyle(4, 0x6b5a3e, 0.55);
  for (const [x1, y1, x2, y2] of [[-118, -30, -92, -24], [-122, 8, -98, 8], [-112, 44, -90, 36], [96, -40, 122, -48], [100, 0, 126, 2], [94, 40, 118, 50]]) g.line(x1, y1, x2, y2);
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 84, 200, 30);
  g.fillStyle(0x6b5a3e, 1); for (const [x, y, r] of puffs) g.fillCircle(x, y, r + 4);
  g.fillStyle(0xc9b894, 1); for (const [x, y, r] of puffs) g.fillCircle(x, y, r);
  g.fillStyle(0xe2d5b4, 0.9); for (const [x, y, r] of puffs) if (y < 20) g.fillCircle(x - r * 0.2, y - r * 0.28, r * 0.5);
  // мелкие камешки и травинки, вылетающие из драки
  g.fillStyle(0x6b5a3e, 1);
  for (const [x, y, r] of [[-96, -52, 4], [104, -62, 3.5], [-104, 62, 3], [110, 58, 4], [0, -86, 3]]) g.fillCircle(x, y, r);
}

/** Комиксная «звезда»-вспышка с надписью. */
function drawBurst(g, label, text, fill, size) {
  const spikes = 12, R = size, r = size * 0.68;
  const pts = (k) => Array.from({ length: spikes * 2 }, (_, i) => {
    const a = (i / (spikes * 2)) * Math.PI * 2 + 0.2;
    const rr = (i % 2 ? r : R) * k;
    return { x: Math.cos(a) * rr * 1.35, y: Math.sin(a) * rr };
  });
  g.fillStyle(0x24170f, 1); g.fillPoints(pts(1.08));
  g.fillStyle(fill, 1); g.fillPoints(pts(1));
  g.fillStyle(0xffffff, 0.35); g.fillEllipse(-size * 0.3, -size * 0.35, size * 0.9, size * 0.35);
  label(0, 1, text, { size: size * 0.52, color: '#fff8ec', strokeWidth: size * 0.16 });
}

/** Звёздочка для «искр из глаз». */
function drawStar(g) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? 4.2 : 10;
    return { x: Math.cos(a) * rr, y: Math.sin(a) * rr };
  });
  g.fillStyle(0x24170f, 1); g.fillPoints(pts.map((p) => ({ x: p.x * 1.3, y: p.y * 1.3 })));
  g.fillStyle(0xffd45c, 1); g.fillPoints(pts);
}

export const BRAWL_WORDS = [
  ['БАМ!', 0xe8503c], ['ХРЯСЬ!', 0xe0a03a], ['ПЫЩ!', 0x9b6bd0], ['БДЫЩ!', 0x4f8a3c], ['ШМЯК!', 0x3fa0c8],
];

/** @param {import('../../engine/TextureCache.js').TextureCache} textures */
export function makeTitleTextures(textures) {
  textures.bake('brawl_cloud', 270, 220, 135, 105, drawCloud);
  BRAWL_WORDS.forEach(([text, color], i) => textures.bake('brawl_word_' + i, 120, 80, 60, 40, (g, label) => drawBurst(g, label, text, color, 26)));
  textures.bake('dizzy_star', 30, 30, 15, 15, drawStar);
}
