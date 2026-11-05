import { Scene } from '../../engine/index.js';
import { SkeletonSprite } from '../../skeleton/index.js';
import { MUSHROOM_SKELETON } from '../data/skeleton.js';
import { SPECIES } from '../data/content.js';
import { farmBackground } from '../art/farmArt.js';
import { BRAWL_WORDS } from '../art/titleArt.js';

const CLOUD = { x: 195, y: 540 };
const BG_SHIFT = -112;
/** Что торчит из клубка драки: текстура, смещение от центра, поворот. */
const CLOUD_PARTS = [
  // [текстура, смещение x, y, поворот, масштаб, поверх облака]
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

/**
 * Фон титульного экрана: на поляне идёт грибная драка.
 * В центре клубок пыли, по бокам дерутся, пляшут и лежат без сил.
 */
export class TitleScene extends Scene {
  create() {
    // поляна сдвинута вверх: табличка фермы прячется за названием игры
    this.bg = this.sprite(farmBackground(this.textures, this.engine.renderer), 0, BG_SHIFT).setStatic();
    this.fx = this.particles(90).setDepth(5000);
    this.fx.prepare([0xd8c7a0, 0xfff3b0, ...Object.values(SPECIES).map((s) => s.color)]);

    this._makeBrawl();
    this._makeDuel();
    this._makeBystanders();

    // выкрики над дракой
    this.words = Array.from({ length: 4 }, () => this.sprite('brawl_word_0').setDepth(4000).setVisible(false));
    this.timers.every(520, () => this._popWord());
  }

  resize() {
    if (!this.bg) return;
    const key = farmBackground(this.textures, this.engine.renderer);
    if (key !== this.bg.key) { this.bg.setTexture(key); this.invalidateStatic(); }
  }

  /* ---------- клубок драки ---------- */
  _makeBrawl() {
    this.cloudShadow = this.sprite('shadow', CLOUD.x, CLOUD.y + 86).setScale(2.2, 1.5).setDepth(CLOUD.y - 2);
    this.cloud = this.sprite('brawl_cloud', CLOUD.x, CLOUD.y).setDepth(CLOUD.y);
    // шляпки и кулаки торчат из клубка, часть деталей выглядывает из-за него
    this.parts = CLOUD_PARTS.map(([key, dx, dy, rot, sc, front]) => ({
      sprite: this.sprite(key).setDepth(CLOUD.y + (front ? 2 : -1)).setScale(sc).setRotation(rot),
      dx, dy, rot,
    }));

    if (!this.app.reduceMotion) {
      this.tweens.add({ targets: this.cloud, scaleX: 1.06, scaleY: 0.95, duration: 160, yoyo: true, repeat: -1, ease: 'sineInOut' });
      // мультяшная тряска: всё в клубке дёргается
      this.timers.every(90, () => this._jitter());
      this.timers.every(700, () => this.fx.burst(CLOUD.x + (Math.random() - 0.5) * 150, CLOUD.y + 66, {
        color: 0xd8c7a0, count: 6, speed: [40, 110], angle: [190, 350], life: [400, 800], gravity: 120, scale: [1.4, 0],
      }));
    }
    this._jitter();
  }

  _jitter() {
    const j = (k) => (Math.random() - 0.5) * k;
    this.cloud.x = CLOUD.x + j(6);
    this.cloud.y = CLOUD.y + j(5);
    this.cloud.rotation = j(0.06);
    for (const p of this.parts) {
      p.sprite.x = CLOUD.x + p.dx + j(10);
      p.sprite.y = CLOUD.y + p.dy + j(10);
      p.sprite.rotation = p.rot + j(0.5);
    }
  }

  _popWord() {
    const s = this.words.find((w) => !w.visible);
    if (!s) return;
    const i = (Math.random() * BRAWL_WORDS.length) | 0;
    const side = Math.random() < 0.5 ? -1 : 1;
    s.setTexture('brawl_word_' + i)
      .setPosition(CLOUD.x + side * (70 + Math.random() * 60), CLOUD.y - 60 - Math.random() * 60)
      .setRotation((Math.random() - 0.5) * 0.6).setScale(0.2).setAlpha(1).setVisible(true);
    this.tweens.add({ targets: s, scale: 1, duration: 220, ease: 'backOut' });
    this.tweens.add({ targets: s, alpha: 0, y: s.y - 16, delay: 450, duration: 300, onComplete: () => (s.visible = false) });
    this.fx.burst(s.x, s.y, { color: BRAWL_WORDS[i][1], count: 5, speed: [60, 140], angle: [0, 360], gravity: 80 });
  }

  /* ---------- дуэль внизу слева: бьют друг друга по очереди ---------- */
  _makeDuel() {
    const mk = (skin, x, y, dir) => {
      this.sprite('shadow', x, y + 2).setScale(0.62).setDepth(y - 1);
      const s = this.add(new SkeletonSprite(this.textures, MUSHROOM_SKELETON, skin, x, y));
      s.setScale(0.5 * dir, 0.5).setDepth(y);
      s.play('idle', { mix: 0 });
      s.time = Math.random();
      s.prepareFlash();
      return s;
    };
    this.duel = [mk('ryzhik', 46, 712, 1), mk('openok', 140, 718, -1)];
    this.turn = 0;
    this.timers.every(1300, () => this._duelHit());
  }

  _duelHit() {
    const [a, b] = this.turn % 2 ? [this.duel[1], this.duel[0]] : this.duel;
    this.turn++;
    const onHit = (name) => {
      if (name !== 'hit') return;
      a.off('event', onHit);
      b.play('hurt', { then: 'idle' }).flash();
      this.fx.burst(b.x, b.y - 50, { color: SPECIES[a.skin].color, count: 10 });
      this.shake(80, 0.003);
    };
    a.on('event', onHit);
    a.play('strike', { then: 'idle', mix: 0.1 });
  }

  /* ---------- по краям: победитель пляшет, побеждённый лежит, болельщик прыгает ---------- */
  _makeBystanders() {
    const mk = (skin, x, y, dir, anim, size = 0.46) => {
      this.sprite('shadow', x, y + 2).setScale(size * 1.1).setDepth(y - 1);
      const s = this.add(new SkeletonSprite(this.textures, MUSHROOM_SKELETON, skin, x, y));
      s.setScale(size * dir, size).setDepth(y);
      s.play(anim, { mix: 0 });
      s.time = Math.random();
      return s;
    };
    mk('veshenka', 334, 430, -1, 'victory', 0.42);
    this.loser = mk('poganka', 84, 438, 1, 'defeat', 0.42);
    this.loser.time = 1.05; // сразу лежит
    mk('mukhomor', 300, 712, -1, 'victory', 0.48);
    mk('panther', 356, 722, -1, 'idle', 0.42);

    // звёздочки над тем, кому досталось
    this.stars = Array.from({ length: 3 }, () => this.sprite('dizzy_star').setDepth(3000).setScale(0.8));
    this.starAngle = 0;
  }

  update(dt) {
    this.starAngle += dt * 0.004;
    const cx = this.loser.x - 30, cy = this.loser.y - 24;
    this.stars.forEach((s, i) => {
      const a = this.starAngle + (i * Math.PI * 2) / 3;
      s.x = cx + Math.cos(a) * 26;
      s.y = cy + Math.sin(a) * 9;
      s.depth = Math.sin(a) > 0 ? 3000 : this.loser.depth - 1;
      s.rotation = a * 2;
    });
  }
}
