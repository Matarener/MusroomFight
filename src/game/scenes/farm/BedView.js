import { BED_W, BED_H, crystalKey } from '../../art/farmArt.js';
import { CRYSTALS } from '../../data/content.js';

const formatTime = (ms) => {
  const s = Math.ceil(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};

/**
 * Отображение одной грядки. Само состояние живёт в GameState.beds[index];
 * BedView каждый кадр сверяется с ним и переключает картинки при смене стадии.
 *
 * Стадии: locked → empty → spore → growing → ready → (сбор) → empty.
 */
export class BedView {
  constructor(scene, index, cx, cy) {
    this.scene = scene;
    this.state = scene.app.state;
    this.index = index;
    this.cx = cx;
    this.cy = cy;
    this.stage = null;
    this.crystalStage = 0;
    this.readyAt = 0;
    this.lastSecond = -1;
    this.lastBarWidth = -1;

    const s = scene, d = cy, reduce = scene.app.reduceMotion;
    // рамка неподвижна: рисуется в статичный слой
    s.sprite('bed', cx, cy).setDepth(d).setFlipX(index % 2 === 1).setStatic();

    this.mycelium = s.sprite('mycelium', cx, cy).setDepth(d + 1).setFlipX(index % 2 === 0);
    this.glow = s.sprite('glow', cx, cy + 18).setDepth(d + 1);
    this.crystal = s.sprite(crystalKey('earth', 1), cx, cy + 22).setDepth(d + 20);
    this.glint = s.sprite('glint', cx, cy - 30).setDepth(d + 21).setScale(0.4);
    this.lock = s.sprite('lock', cx, cy).setDepth(d + 2);
    this.marker = s.sprite('marker', cx, cy - 6).setDepth(d + 30);
    this.bubble = s.sprite('bubble', cx + 50, cy - 46).setDepth(d + 60);

    const by = cy + BED_H / 2 + 15;
    this.barBg = s.sprite('bar_bg', cx - 50, by).setDepth(d + 40);
    this.barFill = s.sprite('bar_fill', cx - 48, by).setDepth(d + 40);
    this.timer = s.label('', { size: 9.5 }, cx, by).setDepth(d + 41);

    if (!reduce) {
      s.tweens.add({ targets: this.glow, alpha: 0.35, duration: 900, yoyo: true, repeat: -1, ease: 'sineInOut' });
      s.tweens.add({ targets: this.marker, y: cy - 10, duration: 1100, yoyo: true, repeat: -1, ease: 'sineInOut' });
      s.tweens.add({ targets: this.bubble, y: cy - 50, duration: 700, yoyo: true, repeat: -1, ease: 'sineInOut' });
      s.tweens.add({
        targets: this.glint, scale: 1, alpha: 0.2, rotation: Math.PI / 2,
        duration: 1100, yoyo: true, repeat: -1, ease: 'sineInOut', delay: index * 170,
      });
    }

    s.addZone(cx, cy, BED_W, BED_H, () => s.onBedTap(this), () => this.press());
  }

  /** Короткое «нажатие» содержимого грядки. */
  press() {
    if (this.scene.app.reduceMotion) return;
    const target = this.stage === 'empty' ? this.marker : this.stage === 'locked' ? this.lock : this.crystal;
    if (!target.visible) return;
    const base = target.scaleX;
    this.scene.tweens.add({ targets: target, scale: base * 0.94, duration: 70, yoyo: true });
  }

  sync(now) {
    const stage = this.state.bedStage(this.index, now);
    if (stage !== this.stage) this._enter(stage);
    if (stage !== 'spore' && stage !== 'growing') return;

    const bed = this.state.beds[this.index];
    const p = this.state.bedProgress(this.index, now);
    if (stage === 'growing') {
      const cs = p < 0.6 ? 1 : 2;
      if (cs !== this.crystalStage) { this.crystalStage = cs; this.crystal.setTexture(crystalKey(bed.kind, cs)); }
      this.crystal.setScale(0.62 + ((p - 0.25) / 0.75) * 0.3);
    }
    // таймер и полоска меняются, только когда реально изменилось значение
    const remaining = this.state.bedRemaining(this.index, now);
    const sec = Math.ceil(remaining / 1000);
    if (sec !== this.lastSecond) { this.lastSecond = sec; this.timer.setText(formatTime(remaining)); }
    const w = Math.max(14, Math.round(96 * p));
    if (w !== this.lastBarWidth) { this.lastBarWidth = w; this.barFill.setCrop(w); }
  }

  _enter(stage) {
    const prev = this.stage;
    this.stage = stage;
    const bed = this.state.beds[this.index];
    const growingBar = stage === 'spore' || stage === 'growing';

    this.lock.visible = stage === 'locked';
    this.marker.visible = stage === 'empty';
    this.mycelium.visible = stage === 'spore';
    this.glow.visible = stage === 'ready';
    this.bubble.visible = stage === 'ready';
    this.glint.visible = stage === 'ready';
    this.barBg.visible = this.barFill.visible = this.timer.visible = growingBar;
    this.crystal.visible = stage === 'growing' || stage === 'ready';
    this.lastSecond = -1;
    this.lastBarWidth = -1;
    this.crystalStage = 0;

    if (stage === 'ready') {
      this.crystal.setTexture(crystalKey(bed.kind, 3));
      this.glint.setPosition(this.cx - 8 + (this.index % 2) * 14, this.cy - 30);
      if (prev === 'growing' || prev === 'spore') {
        // кристалл «выпрыгивает» и рассыпает искры своего цвета
        this.crystal.setScale(0.7);
        this.scene.tweens.add({ targets: this.crystal, scale: 1, duration: 420, ease: 'backOut' });
        this.scene.burst(this.cx, this.cy - 10, CRYSTALS[bed.kind].color, 14);
        this.scene.app.sfx('ready', { volume: 0.7, throttle: 200 });
      } else {
        this.crystal.setScale(1);
      }
    }
  }
}
