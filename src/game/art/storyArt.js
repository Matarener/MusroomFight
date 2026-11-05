/**
 * Персонажи сюжета и мутанты-Светляки.
 *   - Тоша: юный боровичок, шляпка боровика с листком-повязкой;
 *   - Дед Груздь: бледная шляпка-воронка с бахромой и борода;
 *   - Генерал Сморчок: ячеистая шляпка-шишка с зелёным свечением и третьим глазом;
 *   - Светляки: копии обычных грибов с зелёным оттенком, светящимися наростами и глазом на шляпке.
 * Размеры деталей те же, что в mushrooms.js: ножка 60×88, рука 18×40, шляпка 140×78.
 */
import { MUTANT_BASES } from '../data/skeleton.js';

const GLOW = 0x9bf07a;
const GLOW_LIGHT = 0xe6ffd0;

/** Светящийся нарост: ореол, шарик, блик. */
function wart(g, x, y, r) {
  g.fillStyle(GLOW, 0.28); g.fillCircle(x, y, r + 4);
  g.fillStyle(0x2f5a24, 1); g.fillCircle(x, y, r + 1.5);
  g.fillStyle(GLOW, 1); g.fillCircle(x, y, r);
  g.fillStyle(GLOW_LIGHT, 1); g.fillCircle(x - r * 0.35, y - r * 0.35, r * 0.4);
}

/** Третий глаз на шляпке: светящийся зрачок. */
function capEye(g, x, y) {
  g.fillStyle(GLOW, 0.35); g.fillEllipse(x, y, 30, 22);
  g.fillStyle(0x24170f, 1); g.fillEllipse(x, y, 22, 16);
  g.fillStyle(0xfffbe8, 1); g.fillEllipse(x, y, 18, 12);
  g.fillStyle(0x3fbf3a, 1); g.fillCircle(x, y + 0.5, 4.6);
  g.fillStyle(0x24170f, 1); g.fillCircle(x, y + 0.5, 2.2);
  g.fillStyle(0xffffff, 1); g.fillCircle(x - 2.4, y - 2, 1.4);
}

/** @param {import('../../engine/TextureCache.js').TextureCache} textures */
export function makeStoryTextures(textures) {
  const tex = (key, w, h, draw) => textures.bakeTopLeft(key, w, h, draw);

  /* ----- Тоша: боровик с листком, повязанным на шляпку ----- */
  textures.derive('cap_tosha', 'cap_borovik', {}, (g) => {
    g.local(98, 26, 0.5, () => {
      g.fillStyle(0x24411a, 1); g.fillEllipse(0, 0, 42, 20);
      g.fillStyle(0x6fb94a, 1); g.fillEllipse(0, 0, 37, 15);
      g.lineStyle(1.6, 0x3f7a2a, 1); g.line(-16, 0, 16, 0);
      g.line(-6, 0, -1, -5); g.line(2, 0, 7, -5); g.line(-6, 0, -1, 5); g.line(2, 0, 7, 5);
    });
    // завязка листка
    g.fillStyle(0x24411a, 1); g.fillCircle(80, 38, 4.5);
    g.fillStyle(0x6fb94a, 1); g.fillCircle(80, 38, 3);
  });
  textures.derive('stem_tosha', 'stem_borovik');
  textures.derive('arm_tosha', 'arm_borovik');

  /* ----- Дед Груздь: бледная воронка с бахромой, седая борода ----- */
  tex('cap_gruzd', 140, 78, (g) => {
    g.fillStyle(0x6e5a36, 1); g.fillEllipse(70, 68, 128, 18);
    g.fillStyle(0xf2e6c4, 1); g.fillEllipse(70, 67, 122, 13);
    // воронка: широкая чаша, края загнуты вниз
    g.fillStyle(0x5a4626, 1); g.fillEllipse(70, 50, 140, 52); g.fillRect(4, 50, 132, 16); g.fillEllipse(70, 64, 140, 14);
    g.fillStyle(0xf3e7c2, 1); g.fillEllipse(70, 50, 132, 45); g.fillRect(8, 50, 124, 13); g.fillEllipse(70, 62, 132, 10);
    // вдавленная серединка и концентрические круги
    g.fillStyle(0xd8c48e, 1); g.fillEllipse(70, 42, 70, 18);
    g.fillStyle(0xc2a96e, 1); g.fillEllipse(70, 40, 40, 9);
    g.lineStyle(1.4, 0xc9b27a, 0.8); g.strokeEllipse(70, 44, 104, 28); g.strokeEllipse(70, 46, 120, 36);
    // бахрома по краю
    g.fillStyle(0xfffaf0, 1);
    for (let x = 10; x <= 130; x += 8) g.fillEllipse(x, 70, 6, 8);
    g.fillStyle(0xfffcf2, 0.6); g.fillEllipse(44, 34, 30, 8);
  });
  tex('stem_gruzd', 60, 88, (g) => {
    g.fillStyle(0x5a4626, 1); g.fillRoundedRect(4, 2, 52, 86, 22);
    g.fillStyle(0xeee2c2, 1); g.fillRoundedRect(7, 5, 46, 79, 19);
    g.fillStyle(0xc9b788, 0.45); g.fillRoundedRect(36, 10, 13, 68, 6);
    // брови
    g.fillStyle(0xfffaf0, 1); g.fillEllipse(17, 29, 16, 6); g.fillEllipse(43, 29, 16, 6);
    // борода ниже глаз
    const beard = [[30, 64, 40, 30], [18, 58, 20, 18], [42, 58, 20, 18], [30, 76, 24, 16], [22, 72, 16, 14], [38, 72, 16, 14]];
    g.fillStyle(0x8f8a7c, 1); beard.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w + 4, h + 4));
    g.fillStyle(0xfbf8ef, 1); beard.forEach(([x, y, w, h]) => g.fillEllipse(x, y, w, h));
    g.fillStyle(0xd9d4c6, 1); g.fillEllipse(30, 56, 22, 5);
    g.fillStyle(0xf28b82, 0.5); g.fillEllipse(13, 50, 9, 5); g.fillEllipse(47, 50, 9, 5);
  });
  tex('arm_gruzd', 18, 40, (g) => {
    g.fillStyle(0x5a4626, 1); g.fillRoundedRect(2, 1, 14, 38, 7);
    g.fillStyle(0xeee2c2, 1); g.fillRoundedRect(4, 3, 10, 34, 5);
  });

  /* ----- Генерал Сморчок: ячеистая шишка, светится, третий глаз ----- */
  tex('cap_smorchok', 140, 78, (g) => {
    g.fillStyle(0x6a5a3c, 1); g.fillEllipse(70, 70, 84, 14);
    g.fillStyle(GLOW, 0.25); g.fillEllipse(70, 42, 104, 84);
    g.fillStyle(0x2a1a0c, 1); g.fillEllipse(70, 46, 86, 72); g.fillRect(27, 46, 86, 24);
    g.fillStyle(0x7a5530, 1); g.fillEllipse(70, 46, 80, 66); g.fillRect(30, 46, 80, 21);
    // ячейки
    g.fillStyle(0x3e2512, 1);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 40 + col * 15 + (row % 2) * 7, y = 22 + row * 12;
        if (Math.abs(x - 70) < 40 - row * 2) g.fillEllipse(x, y, 10, 8);
      }
    }
    g.fillStyle(0xa77a46, 0.5); g.fillEllipse(54, 26, 18, 10);
    wart(g, 42, 30, 4); wart(g, 100, 40, 3.5);
    capEye(g, 70, 54);
    // генеральская кокарда
    g.fillStyle(0x24170f, 1); g.fillCircle(70, 12, 7);
    g.fillStyle(0xffd45c, 1); g.fillCircle(70, 12, 5);
  });
  textures.derive('stem_smorchok', 'stem_podberez', { tint: GLOW, strength: 0.12 });
  textures.derive('arm_smorchok', 'arm_podberez', { tint: GLOW, strength: 0.12 });

  /* ----- Светляки: зеленоватые копии обычных грибов ----- */
  for (const base of MUTANT_BASES) {
    textures.derive('cap_m_' + base, 'cap_' + base, { tint: GLOW, strength: 0.22 }, (g) => {
      wart(g, 34, 40, 4.5); wart(g, 108, 34, 3.5); wart(g, 88, 18, 3);
      capEye(g, 70, 46);
    });
    textures.derive('stem_m_' + base, 'stem_' + base, { tint: GLOW, strength: 0.2 }, (g) => wart(g, 46, 70, 3));
    textures.derive('arm_m_' + base, 'arm_' + base, { tint: GLOW, strength: 0.2 });
  }

  /* ----- затемнение кадра: маленький квадрат, растягивается на весь экран ----- */
  const shade = (key, color) => textures.bake(key, 8, 8, 0, 0, (g) => { g.fillStyle(color, 1); g.fillRect(0, 0, 8, 8); }, 1);
  shade('story_dark', 0x0b0f1c);   // ночь и темнота
  shade('story_glow', GLOW);       // зелёная Вспышка
  shade('story_dawn', 0xffd9a0);   // тёплый рассвет
}
