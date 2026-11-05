/**
 * Сцена для обложки Mini App 640×360: та же графика, что в игре
 * (поляна, клубок драки, бойцы), расставленная под широкий кадр.
 */
import { Engine, Scene } from '../../src/engine/index.js';
import { SkeletonSprite } from '../../src/skeleton/index.js';
import { MUSHROOM_SKELETON } from '../../src/game/data/skeleton.js';
import { makeMushroomTextures } from '../../src/game/art/mushrooms.js';
import { makeFarmTextures, farmBackground } from '../../src/game/art/farmArt.js';
import { makeTitleTextures } from '../../src/game/art/titleArt.js';

const CLOUD = { x: 320, y: 268 };
const PARTS = [
  ['cap_mukhomor', -74, -62, -0.55, 0.5, true],
  ['cap_borovik', 80, -58, 0.5, 0.5, true],
  ['cap_woodear', 4, -86, 0.08, 0.42, false],
  ['arm_mukhomor', -104, 4, -1.9, 1, true],
  ['arm_borovik', 106, 0, 1.8, 1, true],
  ['arm_woodear', -52, 74, -2.8, 1, true],
  ['arm_borovik', 60, 72, 2.6, 1, true],
  ['stem_podberez', 96, 44, 1.2, 0.38, false],
  ['eyes_hurt', -30, -4, 0.1, 0.75, true],
  ['eyes_ko', 38, 12, -0.15, 0.75, true],
];

class CoverScene extends Scene {
  create() {
    // середина поляны (тропа) — по центру кадра, сверху виден лес на горизонте
    this.sprite(farmBackground(this.textures, this.engine.renderer), 120, -146).setStatic();

    const k = 0.62; // клубок поменьше, чтобы влез под название
    this.sprite('shadow', CLOUD.x, CLOUD.y + 86 * k).setScale(2.2 * k, 1.5 * k).setDepth(CLOUD.y - 2);
    this.sprite('brawl_cloud', CLOUD.x, CLOUD.y).setScale(k).setDepth(CLOUD.y);
    for (const [key, dx, dy, rot, sc, front] of PARTS) {
      this.sprite(key, CLOUD.x + dx * k, CLOUD.y + dy * k).setScale(sc * k).setRotation(rot).setDepth(CLOUD.y + (front ? 2 : -1));
    }
    this.sprite('brawl_word_0', CLOUD.x - 112, CLOUD.y - 46).setScale(0.62).setRotation(-0.2).setDepth(4000);
    this.sprite('brawl_word_1', CLOUD.x + 116, CLOUD.y - 40).setScale(0.58).setRotation(0.18).setDepth(4000);

    const mk = (skin, x, y, dir, anim, size, time = Math.random()) => {
      this.sprite('shadow', x, y + 2).setScale(size * 1.1).setDepth(y - 1);
      const s = this.add(new SkeletonSprite(this.textures, MUSHROOM_SKELETON, skin, x, y));
      s.setScale(size * dir, size).setDepth(y);
      s.play(anim, { mix: 0 });
      s.time = time;
      return s;
    };
    // слева дуэль, справа болельщики и проигравший со звёздочками
    mk('ryzhik', 52, 340, 1, 'strike', 0.5, 0.24);
    mk('openok', 148, 346, -1, 'hurt', 0.5, 0.1);
    mk('mukhomor', 488, 342, -1, 'victory', 0.52, 0.3);
    mk('panther', 590, 350, -1, 'idle', 0.46);
    const loser = mk('poganka', 574, 252, -1, 'defeat', 0.4, 1.05);
    mk('veshenka', 70, 236, 1, 'victory', 0.4, 0.6);
    for (let i = 0; i < 3; i++) {
      const a = 0.6 + (i * Math.PI * 2) / 3;
      this.sprite('dizzy_star', loser.x + 26 + Math.cos(a) * 22, loser.y - 22 + Math.sin(a) * 8).setScale(0.7).setRotation(a).setDepth(3000);
    }
  }
}

async function boot() {
  const engine = new Engine({ container: document.getElementById('game'), designWidth: 640, designHeight: 360, background: '#86ad63' });
  engine.app = { reduceMotion: true };
  await document.fonts.load('700 15px Unbounded');
  await document.fonts.load('700 20px Caveat');
  makeMushroomTextures(engine.textures);
  makeFarmTextures(engine.textures);
  makeTitleTextures(engine.textures);
  engine.register('cover', CoverScene);
  engine.start();
  engine.show('cover');
  // кадр с позами, где все в движении; дальше стоп, чтобы снимок был предсказуемым
  setTimeout(() => { engine.pause(); document.body.dataset.ready = '1'; }, 300);
}
boot();
