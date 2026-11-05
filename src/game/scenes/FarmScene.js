import { Scene } from '../../engine/index.js';
import { BedView } from './farm/BedView.js';
import { crystalKey, farmBackground } from '../art/farmArt.js';
import { CRYSTALS, PRICES } from '../data/content.js';

/** Расположение грядок на поляне (центры). */
const BED_POSITIONS = [[100, 340], [290, 340], [100, 478], [290, 478], [100, 616], [290, 616]];
const SOIL_COLOR = 0x8a6a48;
const PLANK_COLOR = 0xc0905a;

/**
 * Ферма: шесть грядок, на которых растут кристаллы стихий.
 */
export class FarmScene extends Scene {
  create() {
    const app = this.app;
    this.bg = this.sprite(farmBackground(this.textures, this.engine.renderer), 0, 0).setStatic();

    this.beds = BED_POSITIONS.map(([x, y], i) => new BedView(this, i, x, y));
    this.flyPool = Array.from({ length: 4 }, () => this.sprite(crystalKey('earth', 3)).setDepth(4800).setVisible(false));

    this.fx = this.particles(160).setDepth(5000);
    this.fx.prepare([SOIL_COLOR, PLANK_COLOR, 0xfff3b0, 0xe8ffd0, ...Object.values(CRYSTALS).map((c) => c.color)]);
    if (!app.reduceMotion) {
      // пылинки в воздухе над поляной
      this.dust = this.fx.addEmitter({
        area: { x: -120, y: 250, w: 630, h: 750 }, every: 520, colors: [0xfff3b0, 0xe8ffd0],
        life: [3500, 6500], speedX: [-6, 6], speedY: [-14, -5], scale: [0.38, 0.08], alpha: [0.85, 0],
      });
    }
    this.sync();
  }

  /** На широком окне фон дорисовывается по бокам. */
  resize() {
    if (!this.bg) return;
    const key = farmBackground(this.textures, this.engine.renderer);
    if (key !== this.bg.key) { this.bg.setTexture(key); this.invalidateStatic(); }
    // пылинки летают по всей видимой ширине
    if (this.dust) {
      const view = this.engine.renderer.visibleWorld();
      this.dust.area.x = Math.min(-120, view.left);
      this.dust.area.w = Math.max(630, view.right - view.left);
      // плотность пылинок одинаковая на любой ширине
      this.dust.every = (520 * 630) / this.dust.area.w;
    }
  }

  burst(x, y, color, count) {
    if (this.app.reduceMotion) return;
    this.fx.burst(x, y, { color, count });
  }

  sync() {
    const now = Date.now();
    for (const b of this.beds) b.sync(now);
  }

  update() {
    this.sync();
  }

  onBedTap(view) {
    const { state, ui } = this.app;
    const i = view.index;
    switch (state.bedStage(i)) {
      case 'ready': this.harvest(view); break;
      case 'empty': ui.farm.openSeeds(i); break;
      case 'spore':
      case 'growing': ui.farm.openGrowing(i); break;
      case 'locked':
        if (state.unlockBed(i)) {
          this.app.sfx('unlock');
          this.burst(view.cx, view.cy, PLANK_COLOR, 22);
          ui.toast('Новая грядка открыта');
        } else {
          this.app.sfx('error');
          ui.toast('Нужно ' + PRICES.unlockBed + ' спор. Их дают за бои в лесу');
        }
        break;
    }
  }

  /** Посадка из окна выбора: эффект земли на грядке. */
  onPlanted(i) {
    this.app.sfx('plant');
    const v = this.beds[i];
    this.burst(v.cx, v.cy + 4, SOIL_COLOR, 12);
  }

  onFertilized(i) {
    this.app.sfx('fertilize');
    const v = this.beds[i];
    this.burst(v.cx, v.cy, SOIL_COLOR, 12);
  }

  harvest(view) {
    const { state, ui } = this.app;
    // счётчик кристаллов обновится, когда кристалл долетит
    ui.hud.freeze('crystals');
    const res = state.harvest(view.index);
    if (!res) { ui.hud.release('crystals'); return; }
    this.app.sfx('harvest');
    this.burst(view.cx, view.cy - 10, CRYSTALS[res.kind].color, 18);

    const land = () => {
      ui.hud.release('crystals', true);
      this.app.sfx(res.leveled ? 'levelup' : 'collect');
      ui.toast(res.leveled ? 'Новый уровень: ' + state.level + '!' : '+' + res.amount + ' · ' + CRYSTALS[res.kind].label);
    };
    const fly = this.flyPool.find((s) => !s.visible);
    if (!fly || this.app.reduceMotion) { land(); return; }

    const target = this.app.hudPoint('#r-crystals');
    fly.setTexture(crystalKey(res.kind, 3)).setPosition(view.cx, view.cy + 22).setScale(1).setAlpha(1).setVisible(true);
    this.tweens.add({
      targets: fly, y: view.cy - 30, scale: 1.15, duration: 260, ease: 'quadOut',
      onComplete: () => this.tweens.add({
        targets: fly, x: target.x, y: target.y, scale: 0.25, alpha: 0.4, duration: 560, ease: 'cubicIn',
        onComplete: () => { fly.visible = false; land(); },
      }),
    });
  }
}
