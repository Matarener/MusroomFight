import { Scene } from '../../engine/index.js';
import { SkeletonSprite } from '../../skeleton/index.js';
import { MUSHROOM_SKELETON } from '../data/skeleton.js';
import { NODES } from '../data/content.js';
import { forestBackground } from '../art/forestArt.js';

/**
 * Лес: тропа из девяти боёв, в конце босс. У текущего боя стоит лидер отряда.
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
        area: { x: -120, y: 80, w: 630, h: 920 }, every: 420, colors: [0xe9ff9a, 0xfff3b0],
        life: [3000, 6000], speedX: [-10, 10], speedY: [-10, 6], scale: [0.45, 0.1], alpha: [0.9, 0],
      });
    }
    this.leader = null;
    this.pulse = null;
  }

  resize() {
    if (!this.bg) return;
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
  }

  onNodeTap(n) {
    const { state, ui } = this.app;
    if (!state.isNodeOpen(n.i)) {
      ui.toast('Сначала пройдите бой ' + (state.forestCleared + 1));
      return;
    }
    ui.battle.openPrep(n.i);
  }
}
