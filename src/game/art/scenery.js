/**
 * Общие элементы природы: ели и светящиеся грибочки.
 */
export function pine(g, x, y, s, color, dark) {
  g.fillStyle(0x2a1a10, 1); g.fillRect(x - 3 * s, y - 6 * s, 6 * s, 14 * s);
  [[0, 34, 30], [-16, 28, 24], [-30, 20, 17]].forEach(([dy, w, h]) => {
    g.fillStyle(dark, 1); g.fillTriangle(x - w * s - 2, y + dy * s + 1, x + w * s + 2, y + dy * s + 1, x, y + (dy - h - 12) * s - 2);
    g.fillStyle(color, 1); g.fillTriangle(x - w * s, y + dy * s, x + w * s, y + dy * s, x, y + (dy - h - 12) * s);
  });
}
export function glowShroom(g, x, y, s, color) {
  g.fillStyle(color, 0.16); g.fillCircle(x, y - 6 * s, 13 * s);
  g.fillStyle(0xf3ead6, 1); g.fillRect(x - 1.5 * s, y - 7 * s, 3 * s, 7 * s);
  g.fillStyle(0x1d2b20, 1); g.fillEllipse(x, y - 7 * s, 14 * s + 3, 7 * s + 3);
  g.fillStyle(color, 1); g.fillEllipse(x, y - 7 * s, 14 * s, 7 * s);
  g.fillStyle(0xffffff, 0.6); g.fillEllipse(x - 3 * s, y - 9 * s, 4 * s, 2 * s);
}
