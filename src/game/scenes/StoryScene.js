import { Scene } from '../../engine/index.js';
import { SkeletonSprite } from '../../skeleton/index.js';
import { MUSHROOM_SKELETON } from '../data/skeleton.js';
import { ACTORS, STORY } from '../data/story.js';
import { farmBackground } from '../art/farmArt.js';
import { forestBackground } from '../art/forestArt.js';
import { locationBackground, LOCATION_IDS } from '../art/locations.js';

const GROUND_Y = 600;               // где стоят персонажи (над облачком с репликой)
const MOOD_ALPHA = { dark: 0.85, night: 0.58 };
/** Фон кадра: ферма, карта леса или одно из мест Зоны (art/locations.js). */
function background(textures, renderer, name) {
  if (name === 'farm') return farmBackground(textures, renderer);
  if (name === 'forest') return forestBackground(textures, renderer);
  return locationBackground(textures, renderer, LOCATION_IDS.includes(name) ? name : 'opushka');
}
/** Анимации, после которых персонаж возвращается в покой. Остальные держатся (победа, лежит без сил). */
const ONE_SHOT = new Set(['attack', 'strike', 'hurt']);

/**
 * Катсцена: фон из игры, персонажи на скелетах, освещение и вспышки.
 * Реплики и кнопки — HTML поверх (ui/storyUi.js), он же переключает кадры через showPanel.
 */
export class StoryScene extends Scene {
  create({ id }) {
    this.panels = STORY[id];
    this.bgName = this.panels[0].bg || 'farm';
    this.bg = this.sprite(background(this.textures, this.engine.renderer, this.bgName), 0, 0).setStatic();

    this.actors = new Map(); // id → { body, shadow }
    this.dawn = this.sprite('story_dawn', 0, 0).setDepth(9000).setAlpha(0);
    this.dark = this.sprite('story_dark', 0, 0).setDepth(9001).setAlpha(0);
    this.glow = this.sprite('story_glow', 0, 0).setDepth(9002).setAlpha(0);
    this.moodTweens = [];
    this.index = -1;
  }

  resize() {
    if (!this.bg) return;
    this._setBackground(this.bgName);
    // затемнение растягивается на всю видимую часть мира
    const v = this.engine.renderer.visibleWorld();
    for (const s of [this.dawn, this.dark, this.glow]) {
      s.setPosition(v.left - 4, v.top - 4).setScale((v.right - v.left + 8) / 8, (v.bottom - v.top + 8) / 8);
    }
  }

  _setBackground(name) {
    this.bgName = name;
    const key = background(this.textures, this.engine.renderer, name);
    if (key !== this.bg.key) { this.bg.setTexture(key); this.invalidateStatic(); }
  }

  get count() { return this.panels.length; }

  /** Показать кадр i: фон, освещение, кто в кадре и что делает. */
  showPanel(i) {
    const p = this.panels[i];
    const instant = this.index < 0;
    this.index = i;
    if (p.bg && p.bg !== this.bgName) this._setBackground(p.bg);
    this._mood(p.mood, instant);
    if (p.flash) this._flash();

    const cast = p.cast || {};
    for (const [id, actor] of this.actors) {
      if (!(id in cast)) this._leave(id, actor);
    }
    for (const [id, [x, anim = 'idle', dir = 1]] of Object.entries(cast)) {
      const actor = this.actors.get(id) || this._enter(id, x, dir, instant);
      this._direct(actor, x, anim, dir, id === p.say);
    }
  }

  _enter(id, x, dir, instant) {
    const def = ACTORS[id];
    const shadow = this.sprite('shadow', x, GROUND_Y + 2).setScale(def.scale * 1.15).setDepth(GROUND_Y - 1).setAlpha(0);
    const body = this.add(new SkeletonSprite(this.textures, MUSHROOM_SKELETON, def.skin, x - dir * 30, GROUND_Y));
    body.setScale(def.scale * dir, def.scale).setDepth(GROUND_Y + x / 1000).setAlpha(0);
    body.play('idle', { mix: 0 });
    body.time = Math.random();
    const actor = { body, shadow, def, x, dir, anim: 'idle' };
    this.actors.set(id, actor);
    const d = instant ? 1 : 260;
    this.tweens.add({ targets: [body, shadow], alpha: 1, duration: d });
    return actor;
  }

  _leave(id, actor) {
    this.actors.delete(id);
    this.tweens.killTweensOf(actor.body);
    this.tweens.add({
      targets: [actor.body, actor.shadow], alpha: 0, duration: 220,
      onComplete: () => { this.remove(actor.body); this.remove(actor.shadow); },
    });
  }

  _direct(actor, x, anim, dir, speaking) {
    const { body, shadow, def } = actor;
    if (actor.x !== x || body.x !== x) {
      this.tweens.add({ targets: body, x, duration: 380, ease: 'sineInOut' });
      this.tweens.add({ targets: shadow, x, duration: 380, ease: 'sineInOut' });
      body.depth = GROUND_Y + x / 1000;
      this.markSortDirty();
      actor.x = x;
    }
    if (actor.dir !== dir) { body.scaleX = def.scale * dir; actor.dir = dir; }
    if (actor.anim !== anim || ONE_SHOT.has(anim)) {
      body.play(anim, ONE_SHOT.has(anim) ? { then: 'idle', mix: 0.1 } : { mix: 0.15 });
      actor.anim = ONE_SHOT.has(anim) ? 'idle' : anim;
    }
    // говорящий слегка подпрыгивает
    if (speaking && !this.app.reduceMotion) {
      this.tweens.add({ targets: body, y: GROUND_Y - 10, duration: 120, yoyo: true, ease: 'quadOut' });
    }
  }

  _mood(mood, instant) {
    for (const t of this.moodTweens) t.stop();
    const d = instant ? 1 : 450;
    this.moodTweens = [
      this.tweens.add({ targets: this.dark, alpha: MOOD_ALPHA[mood] || 0, duration: d }),
      this.tweens.add({ targets: this.dawn, alpha: mood === 'dawn' ? 0.22 : 0, duration: d }),
    ];
  }

  _flash() {
    this.glow.alpha = 0.9;
    this.tweens.add({ targets: this.glow, alpha: 0, duration: 900, ease: 'quadIn' });
    this.shake(260, 0.01);
  }
}
