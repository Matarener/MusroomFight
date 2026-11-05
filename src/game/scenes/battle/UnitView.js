import { SkeletonSprite } from '../../../skeleton/index.js';
import { MUSHROOM_SKELETON, enemyLook } from '../../data/skeleton.js';
import { SPECIES, fighterStats } from '../../data/content.js';

const BASE_SCALE = 0.56;
const BOSS_SCALE = 0.78;
const HP_WIDTH = 58;
export const HURT_TINT = 0xff7a6a;

/**
 * Боец на поле: данные для правил боя плюс его картинки
 * (скелет, тень, кольцо цели, полоска здоровья, значок яда, уровень).
 */
export class UnitView {
  /**
   * @param {import('../BattleScene.js').BattleScene} scene
   * @param {'P'|'E'} side
   * @param {{ skin: string, level: number }} who
   * @param {{ x: number, y: number }} pos
   * @param {object|null} fighter  боец игрока из GameState (для опыта после боя)
   */
  constructor(scene, side, who, pos, fighter) {
    const sp = SPECIES[who.skin];
    const stats = fighterStats(who.skin, who.level);
    this.scene = scene;
    this.side = side;
    this.skin = who.skin;
    /** Скин скелета: у врагов обычные грибы выглядят Светляками-мутантами. */
    this.look = side === 'E' ? enemyLook(who.skin) : who.skin;
    this.level = who.level;
    this.fighter = fighter;
    this.el = sp.el;
    this.atk = stats.atk;
    this.maxHp = stats.hp;
    this.hp = stats.hp;
    this.alive = true;
    this.poison = 0;
    this.home = { x: pos.x, y: pos.y };
    this.size = sp.boss ? BOSS_SCALE : BASE_SCALE;
    this.dir = side === 'P' ? 1 : -1;
    const ringScale = this.size / BASE_SCALE;

    this.shadow = scene.sprite('shadow', pos.x, pos.y + 2).setScale(this.size * 1.2).setDepth(pos.y - 3);
    this.targetRing = scene.sprite('ring_t', pos.x, pos.y + 2).setScale(ringScale).setDepth(pos.y - 2).setVisible(false);

    this.body = scene.add(new SkeletonSprite(scene.textures, MUSHROOM_SKELETON, this.look, pos.x, pos.y));
    this.body.setScale(this.size * this.dir, this.size).setDepth(pos.y);
    this.body.play('idle', { mix: 0 });
    this.body.time = Math.random() * 1.5;
    this.body.prepareFlash(HURT_TINT);

    const hy = pos.y - 150 * this.size - 10;
    this.headY = hy;
    this.hpBg = scene.sprite('hp_bg', pos.x, hy).setDepth(3000);
    this.hpFill = scene.sprite(side === 'P' ? 'hp_p' : 'hp_e', pos.x - HP_WIDTH / 2, hy).setDepth(3001);
    this.drop = scene.sprite('drop', pos.x + 38, hy).setDepth(3002).setVisible(false);
    this.levelLabel = scene.label(String(who.level), { size: 10 }, pos.x - 38, hy).setDepth(3002);

    this.zone = scene.addZone(pos.x, pos.y - 75 * this.size, 150 * this.size, 160 * this.size, () => scene.onUnitTap(this));
  }

  get label() { return SPECIES[this.skin].label; }

  /** Тень следует за корнем скелета и уменьшается в прыжке. */
  updateShadow() {
    const root = this.body.getBonePose('root');
    this.shadow.x = this.body.x + this.body.scaleX * root.x;
    const k = 1 - Math.min(Math.max(0, -root.y), 60) / 140;
    this.shadow.setScale(this.size * 1.2 * k);
  }

  updateHp() {
    const w = Math.round((HP_WIDTH * this.hp) / this.maxHp);
    this.hpFill.visible = w > 0;
    this.hpFill.setCrop(w);
  }

  setPoisoned(turns) {
    this.poison = turns;
    this.drop.visible = turns > 0;
  }

  /** @returns {boolean} погиб ли боец */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.updateHp();
    this.body.flash(HURT_TINT, 120);
    if (this.hp > 0) {
      this.body.play('hurt', { then: 'idle' });
      return false;
    }
    this.alive = false;
    this.setPoisoned(0);
    this.targetRing.visible = false;
    this.zone.enabled = false;
    this.body.play('defeat');
    this.scene.tweens.add({ targets: [this.hpBg, this.hpFill, this.levelLabel], alpha: 0, delay: 500, duration: 400 });
    return true;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.updateHp();
  }
}
