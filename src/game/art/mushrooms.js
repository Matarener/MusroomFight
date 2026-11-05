/**
 * Детали грибов для скелета: шляпки, ножки, руки и глаза.
 * Все рисуются один раз при запуске и дальше выводятся готовыми картинками.
 *
 * Размеры: ножка 60×88 (низ на y=86), рука 18×40, шляпка 140×78 (край купола на y=66), глаза 48×24.
 */

/** @param {import('../../engine/TextureCache.js').TextureCache} textures */
export function makeMushroomTextures(textures) {
  const tex = (key, w, h, draw) => textures.bakeTopLeft(key, w, h, draw);

  /* ----- боровик, мухомор, древесное ухо и глаза ----- */
  // ножки 60×88, низ на y=86
  const stem = (key, fill, shade, outline, extra) => tex(key, 60, 88, (g) => {
    g.fillStyle(outline, 1); g.fillRoundedRect(4, 2, 52, 86, 22);
    g.fillStyle(fill, 1);    g.fillRoundedRect(7, 5, 46, 79, 19);
    g.fillStyle(shade, 0.45); g.fillRoundedRect(36, 10, 13, 68, 6);
    g.fillStyle(0xf28b82, 0.55); g.fillEllipse(17, 51, 11, 6); g.fillEllipse(43, 51, 11, 6);
    if (extra) extra(g);
  });
  stem('stem_borovik', 0xefe0c1, 0xc9ae80, 0x5a3b20, (g) => {
    g.lineStyle(1, 0xc2a372, 0.7);
    for (let y = 60; y < 82; y += 7) { g.line(12, y, 22, y + 5); g.line(26, y, 36, y + 5); g.line(40, y, 48, y + 4); }
  });
  stem('stem_mukhomor', 0xf7f0e3, 0xd5c8b0, 0x7a2a20, (g) => {
    g.fillStyle(0x7a2a20, 1); g.fillEllipse(30, 27, 60, 14);
    g.fillStyle(0xfffaf0, 1); g.fillEllipse(30, 26, 54, 9);
  });
  stem('stem_woodear', 0xc39a82, 0x8f6652, 0x3f2016);

  // руки 18×40
  const arm = (key, fill, outline) => tex(key, 18, 40, (g) => {
    g.fillStyle(outline, 1); g.fillRoundedRect(2, 1, 14, 38, 7);
    g.fillStyle(fill, 1);    g.fillRoundedRect(4, 3, 10, 34, 5);
  });
  arm('arm_borovik', 0xefe0c1, 0x5a3b20);
  arm('arm_mukhomor', 0xf7f0e3, 0x7a2a20);
  arm('arm_woodear', 0xc39a82, 0x3f2016);

  // шляпки 140×78, край купола на y=66
  tex('cap_borovik', 140, 78, (g) => {
    g.fillStyle(0x6a5228, 1); g.fillEllipse(70, 69, 124, 18);
    g.fillStyle(0xe2c27a, 1); g.fillEllipse(70, 68, 118, 13);
    g.fillStyle(0xc49e55, 1);
    for (let x = 24; x <= 116; x += 9) g.fillCircle(x, 69, 1.6);
    g.fillStyle(0x4b2c15, 1); g.fillEllipse(70, 66, 140, 128);
    g.fillStyle(0x8a5530, 1); g.fillEllipse(70, 66, 132, 120);
    g.fillStyle(0xb07a4c, 0.6); g.fillEllipse(50, 30, 52, 22);
    g.fillStyle(0xd7a777, 0.5); g.fillEllipse(44, 26, 18, 8);
  });
  tex('cap_mukhomor', 140, 78, (g) => {
    g.fillStyle(0xa8977a, 1); g.fillEllipse(70, 69, 124, 18);
    g.fillStyle(0xf4ead6, 1); g.fillEllipse(70, 68, 118, 13);
    g.lineStyle(1, 0xcdbd9e, 1);
    for (let x = 22; x <= 118; x += 6) g.line(x, 64, 70 + (x - 70) * 0.9, 72);
    g.fillStyle(0x6e1a12, 1); g.fillEllipse(70, 66, 140, 128);
    g.fillStyle(0xd2392a, 1); g.fillEllipse(70, 66, 132, 120);
    g.fillStyle(0xe8604c, 0.55); g.fillEllipse(52, 28, 50, 20);
    const spots = [[40, 32, 9], [78, 17, 11], [105, 38, 8], [64, 47, 7], [24, 54, 6], [116, 58, 5], [92, 56, 4]];
    g.fillStyle(0xd9cdb8, 1); spots.forEach(([x, y, r]) => g.fillCircle(x, y + 1, r));
    g.fillStyle(0xfff8ec, 1); spots.forEach(([x, y, r]) => g.fillCircle(x, y, r));
  });
  tex('cap_woodear', 140, 78, (g) => {
    g.fillStyle(0x3a1d13, 1); g.fillEllipse(70, 70, 112, 14);
    const lobes = [[70, 56, 128, 60], [38, 44, 66, 56], [101, 40, 74, 62], [70, 30, 74, 42]];
    g.fillStyle(0x3f2016, 1); lobes.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w + 7, h + 7));
    g.fillStyle(0x6d3a28, 1); lobes.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w, h));
    g.fillStyle(0x9a5a40, 0.45);
    g.fillEllipse(40, 40, 38, 30); g.fillEllipse(98, 34, 44, 34); g.fillEllipse(70, 30, 40, 20);
    g.lineStyle(2, 0x4a2418, 0.7);
    g.line(70, 66, 52, 30); g.line(70, 66, 92, 26); g.line(70, 66, 30, 46);
    g.line(70, 66, 112, 46); g.line(70, 66, 70, 18);
  });

  // глаза 48×24
  const dark = 0x24170f;
  tex('eyes_open', 48, 24, (g) => {
    g.fillStyle(dark, 1); g.fillEllipse(12, 12, 18, 21); g.fillEllipse(36, 12, 18, 21);
    g.fillStyle(0xffffff, 1); g.fillEllipse(12, 12, 14, 17); g.fillEllipse(36, 12, 14, 17);
    g.fillStyle(dark, 1); g.fillCircle(14, 13, 4.6); g.fillCircle(38, 13, 4.6);
    g.fillStyle(0xffffff, 1); g.fillCircle(15.6, 11, 1.7); g.fillCircle(39.6, 11, 1.7);
  });
  tex('eyes_closed', 48, 24, (g) => {
    g.lineStyle(3, dark, 1);
    [12, 36].forEach((x) => { g.strokeArc(x, 9, 7, Math.PI * 0.15, Math.PI * 0.85); });
  });
  tex('eyes_happy', 48, 24, (g) => {
    g.lineStyle(3, dark, 1);
    [12, 36].forEach((x) => { g.strokeArc(x, 17, 7, Math.PI * 1.15, Math.PI * 1.85); });
  });
  tex('eyes_hurt', 48, 24, (g) => {
    g.lineStyle(3, dark, 1);
    g.line(6, 5, 17, 12); g.line(17, 12, 6, 19);
    g.line(42, 5, 31, 12); g.line(31, 12, 42, 19);
  });
  tex('eyes_ko', 48, 24, (g) => {
    g.lineStyle(3, dark, 1);
    g.line(6, 6, 18, 18); g.line(18, 6, 6, 18);
    g.line(30, 6, 42, 18); g.line(42, 6, 30, 18);
  });

  /* ----- остальные грибы отряда: те же формы, другие цвета и узоры ----- */
  const ring = (outline, fill) => (g) => {
    g.fillStyle(outline, 1); g.fillEllipse(30, 27, 60, 14);
    g.fillStyle(fill, 1); g.fillEllipse(30, 26, 54, 9);
  };
  const dome = (key, o) => tex(key, 140, 78, (g) => {
    g.fillStyle(o.gillsOut, 1); g.fillEllipse(70, 69, 124, 18);
    g.fillStyle(o.gills, 1); g.fillEllipse(70, 68, 118, 13);
    if (o.under) o.under(g);
    g.fillStyle(o.outline, 1); g.fillEllipse(70, 66, o.w || 140, o.h || 128);
    g.fillStyle(o.fill, 1); g.fillEllipse(70, 66, (o.w || 140) - 8, (o.h || 128) - 8);
    g.fillStyle(o.hi, 0.6); g.fillEllipse(50, o.h ? 66 - o.h / 2 + 22 : 30, 50, 20);
    if (o.top) o.top(g);
  });

  // Подберёзовик: тёмно-бурая шляпка, белая ножка в тёмных чешуйках
  dome('cap_podberez', { gillsOut: 0x7a6a4e, gills: 0xd8cdb0, outline: 0x3a2412, fill: 0x8f5a30, hi: 0xb07a4c });
  stem('stem_podberez', 0xf2efe6, 0xc9c4b4, 0x3a2412, (g) => {
    g.fillStyle(0x3a3a36, 1);
    [[14, 30], [26, 40], [40, 34], [18, 62], [34, 66], [44, 56], [22, 76], [38, 78]].forEach(([x, y]) => g.fillRoundedRect(x - 4, y, 8, 2.6, 1.3));
  });
  arm('arm_podberez', 0xf2efe6, 0x3a2412);

  // Рыжик: оранжевая шляпка с кольцами
  dome('cap_ryzhik', {
    gillsOut: 0xa8521c, gills: 0xf4a868, outline: 0x6a2e0c, fill: 0xe8822e, hi: 0xffb06a,
    top: (g) => { g.lineStyle(2.4, 0xc0601a, 0.8); g.strokeEllipse(70, 62, 96, 82); g.strokeEllipse(70, 58, 56, 46); },
  });
  stem('stem_ryzhik', 0xf6c690, 0xd99a5c, 0x6a2e0c);
  arm('arm_ryzhik', 0xf6c690, 0x6a2e0c);

  // Бледная поганка: бледно-оливковая шляпка без пятен, белая юбочка
  dome('cap_poganka', {
    gillsOut: 0xb8b8a0, gills: 0xfaf8ee, outline: 0x4a5032, fill: 0xcdd59c, hi: 0xeef2c8,
    top: (g) => { g.fillStyle(0xb8c288, 0.6); g.fillEllipse(78, 26, 30, 12); },
  });
  stem('stem_poganka', 0xfbfaf2, 0xd9d8c6, 0x4a5032, ring(0x4a5032, 0xfffff6));
  arm('arm_poganka', 0xfbfaf2, 0x4a5032);

  // Пантерный мухомор: бурая шляпка с белыми пятнами
  dome('cap_panther', {
    gillsOut: 0xa8977a, gills: 0xf4ead6, outline: 0x3a2412, fill: 0x8a6440, hi: 0xae875e,
    top: (g) => {
      const spots = [[38, 34, 6], [64, 20, 7], [92, 28, 6], [110, 46, 5], [54, 46, 5], [28, 54, 4], [80, 50, 4], [100, 60, 3.5], [44, 22, 3.5]];
      g.fillStyle(0xd9cdb8, 1); spots.forEach(([x, y, r]) => g.fillCircle(x, y + 1, r));
      g.fillStyle(0xfff8ec, 1); spots.forEach(([x, y, r]) => g.fillCircle(x, y, r));
    },
  });
  stem('stem_panther', 0xf7f0e3, 0xd5c8b0, 0x3a2412, ring(0x3a2412, 0xfffaf0));
  arm('arm_panther', 0xf7f0e3, 0x3a2412);

  // Опёнок: медовая шляпка поменьше, тёмный центр и чешуйки
  dome('cap_openok', {
    gillsOut: 0x8a6a3a, gills: 0xf0dcae, outline: 0x4a2c10, fill: 0xd09442, hi: 0xf0c27a, w: 120, h: 104,
    top: (g) => {
      g.fillStyle(0x9a5e24, 0.85); g.fillEllipse(70, 30, 36, 20);
      g.fillStyle(0x6a3e14, 1);
      [[46, 40], [60, 46], [84, 44], [96, 52], [52, 56], [76, 58], [40, 54], [100, 40]].forEach(([x, y]) => g.fillCircle(x, y, 1.8));
    },
  });
  stem('stem_openok', 0xe3c48e, 0xb8955c, 0x4a2c10, ring(0x4a2c10, 0xf3e2b8));
  arm('arm_openok', 0xe3c48e, 0x4a2c10);

  // Вешенка: серая шляпка-ухо с прожилками
  tex('cap_veshenka', 140, 78, (g) => {
    g.fillStyle(0x4a4844, 1); g.fillEllipse(70, 70, 112, 14);
    const lobes = [[70, 54, 132, 58], [34, 44, 64, 52], [104, 42, 72, 58], [70, 30, 78, 40]];
    g.fillStyle(0x3a3834, 1); lobes.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w + 7, h + 7));
    g.fillStyle(0x9c9a92, 1); lobes.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w, h));
    g.fillStyle(0xc8c6bc, 0.55);
    g.fillEllipse(38, 38, 38, 26); g.fillEllipse(100, 34, 44, 30); g.fillEllipse(70, 28, 42, 18);
    g.lineStyle(1.6, 0x6a6862, 0.7);
    for (let a = -1.2; a <= 1.2; a += 0.3) g.line(70, 68, 70 + Math.sin(a) * 58, 68 - Math.cos(a) * 44);
  });
  stem('stem_veshenka', 0xe6e3d8, 0xbab6a8, 0x3a3834);
  arm('arm_veshenka', 0xe6e3d8, 0x3a3834);

  /* ----- босс: ведьмин гриб ----- */
  tex('stem_witch', 60, 88, (g) => {
    g.fillStyle(0x2d1838, 1); g.fillRoundedRect(4, 2, 52, 86, 22);
    g.fillStyle(0xd9cde6, 1); g.fillRoundedRect(7, 5, 46, 79, 19);
    g.fillStyle(0xa797bd, 0.5); g.fillRoundedRect(36, 10, 13, 68, 6);
    g.fillStyle(0x2d1838, 1); g.fillEllipse(30, 26, 60, 14);
    g.fillStyle(0x7d5a9e, 1); g.fillEllipse(30, 25, 54, 9);
    g.fillStyle(0xb48ad8, 0.6); g.fillEllipse(17, 51, 11, 6); g.fillEllipse(43, 51, 11, 6);
  });
  tex('arm_witch', 18, 40, (g) => {
    g.fillStyle(0x2d1838, 1); g.fillRoundedRect(2, 1, 14, 38, 7);
    g.fillStyle(0xd9cde6, 1); g.fillRoundedRect(4, 3, 10, 34, 5);
  });
  tex('cap_witch', 140, 78, (g) => {
    g.fillStyle(0x3a2348, 1); g.fillEllipse(70, 69, 124, 18);
    g.fillStyle(0x6e4b8c, 1); g.fillEllipse(70, 68, 118, 13);
    g.fillStyle(0x24112e, 1); g.fillEllipse(70, 66, 140, 128);
    g.fillStyle(0x6b3fa0, 1); g.fillEllipse(70, 66, 132, 120);
    g.fillStyle(0x8a5cc0, 0.6); g.fillEllipse(52, 28, 50, 20);
    const spots = [[38, 34, 8], [74, 16, 9], [104, 36, 7], [60, 48, 6], [24, 56, 5], [116, 58, 5], [90, 56, 4]];
    g.fillStyle(0x9bf07a, 0.25); spots.forEach(([x, y, r]) => g.fillCircle(x, y, r + 4));
    g.fillStyle(0xc8ff9a, 1); spots.forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.fillStyle(0xf3ffe8, 1); spots.forEach(([x, y, r]) => g.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.35));
  });

  /* ----- тень под персонажем ----- */
  textures.bake('shadow', 100, 24, 50, 12, (g) => { g.fillStyle(0x000000, 0.22); g.fillEllipse(0, 0, 92, 18); });
}
