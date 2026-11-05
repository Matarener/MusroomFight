import { Scene } from '../../engine/index.js';
import { SkeletonSprite } from '../../skeleton/index.js';
import { MUSHROOM_SKELETON } from '../data/skeleton.js';
import { NODES, FOREST_MAP } from '../data/content.js';
import { forestBackground } from '../art/forestArt.js';

/**
 * Лес: тропа из девяти боёв, в конце босс. У текущего боя стоит лидер отряда.
 * Карта выше экрана: прокручивается пальцем или колёсиком, при входе — к текущей главе.
 */
export class ForestScene extends Scene {
  create() {
    this.bg = this.sprite(forestBackground(this.textures, this.engine.renderer), 0, 0).setStatic();

    this.nodes = NODES.map((n) => {
      const sprite = this.sprite(n.boss ? 'nodeb_locked' : 'node_locked', n.x, n.y).setDepth(100);
      const number = n.boss ? null : this.label(String(n.i + 1), { size: 13 }, n.x, n.y).setDepth(101);
      this.addZone(n.x, n.y, 64, 64, () => this.onNodeTap(n));
      return { n, sprite, number };
    });

    this.fx = this.particles(80).setDepth(5000);
    if (!this.app.reduceMotion) {
      this.dust = this.fx.addEmitter({
        area: { x: -120, y: FOREST_MAP.top, w: 630, h: FOREST_MAP.bottom - FOREST_MAP.top }, every: 420, colors: [0xe9ff9a, 0xfff3b0],
        life: [3000, 6000], speedX: [-10, 10], speedY: [-10, 6], scale: [0.45, 0.1], alpha: [0.9, 0],
      });
    }
    this.leader = null;
    this.pulse = null;
    this.scroll = 0;   // прокрутка карты, в игровых единицах
    this.fling = 0;    // скорость прокрутки после того, как палец отпустили, ед/мс
    this.lastDrag = 0;
  }

  /** Пределы прокрутки: видимая часть не выходит за карту. */
  _limits() {
    const r = this.engine.renderer;
    const saved = r.scrollY;
    r.scrollY = 0;
    const v = r.visibleWorld();
    r.scrollY = saved;
    const min = FOREST_MAP.top - v.top, max = FOREST_MAP.bottom - v.bottom;
    const mid = (v.top + v.bottom) / 2;
    return min <= max ? { min, max, mid } : { min: (min + max) / 2, max: (min + max) / 2, mid };
  }

  _scrollTo(y) {
    const { min, max } = this._limits();
    const s = Math.max(min, Math.min(max, y));
    if (s !== this.scroll) { this.scroll = s; this.invalidateStatic(); }
    this.engine.renderer.scrollY = this.scroll;
    return s;
  }

  /** Палец или колёсико сдвинули карту на dy игровых единиц. */
  handleDrag(dy) {
    const now = performance.now();
    const dt = Math.max(8, now - this.lastDrag);
    this.fling = now - this.lastDrag < 100 ? Math.max(-3, Math.min(3, dy / dt)) : 0;
    if (!this.held) this.fling = 0; // колёсико — без инерции
    this.lastDrag = now;
    this._scrollTo(this.scroll + dy);
  }

  /** Палец отпустили после перетаскивания: если он перед этим стоял, карта не едет дальше. */
  handleRelease() {
    this.held = false;
    if (performance.now() - this.lastDrag > 80) this.fling = 0;
  }

  handlePress(x, y) {
    this.fling = 0;
    this.held = true;
    super.handlePress(x, y);
  }

  handleTap(x, y) {
    this.held = false;
    super.handleTap(x, y);
  }

  /** Показать главу i посередине экрана. */
  _center(i) {
    this.fling = 0;
    this._scrollTo(NODES[i].y - this._limits().mid);
  }

  update(dt) {
    // инерция: после отпускания пальца карта ещё немного едет
    if (!this.fling || this.held) return;
    const before = this.scroll;
    if (this._scrollTo(this.scroll + this.fling * dt) === before) { this.fling = 0; return; }
    this.fling *= Math.pow(0.994, dt);
    if (Math.abs(this.fling) < 0.02) this.fling = 0;
  }

  resize() {
    if (!this.bg) return;
    this._scrollTo(this.scroll);
    const key = forestBackground(this.textures, this.engine.renderer);
    if (key !== this.bg.key) { this.bg.setTexture(key); this.invalidateStatic(); }
    // пылинки летают по всей видимой ширине
    if (this.dust) {
      const view = this.engine.renderer.visibleWorld();
      this.dust.area.x = Math.min(-120, view.left);
      this.dust.area.w = Math.max(630, view.right - view.left);
      // плотность пылинок одинаковая на любой ширине
      this.dust.every = (420 * 630) / this.dust.area.w;
    }
  }

  /** Каждый показ сцены: обновить пройденные бои и лидера отряда. */
  wake() {
    const cleared = this.app.state.forestCleared;
    if (this.pulse) { this.pulse.stop(); this.pulse = null; }

    for (const { n, sprite, number } of this.nodes) {
      const st = n.i < cleared ? 'done' : n.i === cleared ? 'open' : 'locked';
      sprite.setTexture((n.boss ? 'nodeb_' : 'node_') + st).setScale(1);
      if (number) number.visible = st !== 'locked';
      if (st === 'open' && !this.app.reduceMotion) {
        this.pulse = this.tweens.add({ targets: sprite, scale: 1.12, duration: 700, yoyo: true, repeat: -1, ease: 'sineInOut' });
      }
    }

    if (this.leader) { this.leader.destroy(); this.leader = null; }
    const lead = this.app.state.teamFighters()[0];
    if (lead) {
      const n = NODES[Math.min(cleared, NODES.length - 1)];
      const side = n.x > 195 ? -1 : 1;
      this.leader = this.add(new SkeletonSprite(this.textures, MUSHROOM_SKELETON, lead.skin, n.x + side * 44, n.y + 22));
      this.leader.setScale(0.32 * side, 0.32).setDepth(99);
      this.leader.play('idle');
    }
    this.app.ui.forestTitle();
    this._center(Math.min(cleared, NODES.length - 1));
  }

  onNodeTap(n) {
    const { state, ui } = this.app;
    if (!state.isNodeOpen(n.i)) {
      ui.toast('Сначала пройдите бой ' + (state.forestCleared + 1));
      return;
    }
    // перед первым боем главы — сцена сюжета, потом окно боя
    const open = () => ui.battle.openPrep(n.i);
    if (n.i === state.forestCleared && this.app.story.maybe('ch' + (n.i + 1) + '_before', () => { this.app.router.go('forest'); open(); })) return;
    open();
  }
}
