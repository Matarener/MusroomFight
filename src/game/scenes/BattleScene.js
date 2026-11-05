import { Scene } from '../../engine/index.js';
import { UnitView } from './battle/UnitView.js';
import { nodeEnemies, NODES, SPECIES } from '../data/content.js';
import { locationBackground, CHAPTER_LOCATIONS } from '../art/locations.js';
import { rollDamage, poisonTick, healTarget, healAmount, pickTarget, turnOrder, RULES } from '../battle/rules.js';

const SLOTS_PLAYER = [{ x: 98, y: 520 }, { x: 140, y: 615 }, { x: 80, y: 705 }];
const SLOTS_ENEMY = SLOTS_PLAYER.map((p) => ({ x: 390 - p.x, y: p.y }));
const SLOTS_BOSS = [{ x: 318, y: 505 }, { x: 262, y: 625 }, { x: 330, y: 718 }];
const HEAL_COLOR = 0x9be07a;
const POISON_COLOR = '#d9a8ff';
const WORDS = { strong: 'w_strong', weak: 'w_weak', crit: 'w_crit', poison: 'w_poison' };

/** Длительности, мс (идут по игровому времени сцены и ускоряются вместе с ней). */
const T = {
  startDelay: 700,
  playerThink: 260,
  enemyThink: 480,
  dash: 200,
  back: 340,
  afterTurn: 140,
  afterDeath: 800,
  victoryDelay: 450,
  resultDelay: 1500,
};

/**
 * Пошаговый бой три на три. Каждый бой — новый экземпляр сцены (engine.show(..., { restart: true })).
 */
export class BattleScene extends Scene {
  create({ node }) {
    this.node = node;
    this.over = false;
    this.awaitingTarget = false;
    this.active = null;
    this.turn = -1;

    // у каждой главы своё место Зоны
    this.location = CHAPTER_LOCATIONS[node];
    this.bg = this.sprite(locationBackground(this.textures, this.engine.renderer, this.location), 0, 0).setStatic();

    // всё, что появляется в момент удара, создаётся заранее
    this.fx = this.particles(120).setDepth(4500);
    this.fx.prepare([HEAL_COLOR, ...Object.values(SPECIES).map((s) => s.color)]);
    this.numbers = Array.from({ length: 10 }, () => this.label('0', { size: 15 }).setDepth(4200).setVisible(false));
    this.words = Array.from({ length: 6 }, () => this.sprite(WORDS.strong).setDepth(4300).setVisible(false));
    this.activeRing = this.sprite('ring_a').setDepth(5).setVisible(false);
    if (!this.app.reduceMotion) this.tweens.add({ targets: this.activeRing, alpha: 0.55, duration: 600, yoyo: true, repeat: -1 });

    const { state } = this.app;
    this.units = [];
    state.teamFighters().forEach((f, k) => this.units.push(new UnitView(this, 'P', f, SLOTS_PLAYER[k], f)));
    const enemySlots = NODES[node].boss ? SLOTS_BOSS : SLOTS_ENEMY;
    nodeEnemies(node).forEach((e, k) => this.units.push(new UnitView(this, 'E', e, enemySlots[k], null)));
    this.order = turnOrder(this.units);

    this.panel = this.app.ui.battle.panel;
    this.auto = this.panel.auto;
    this.setSpeed(this.panel.speed);
    this.panel.attach(this);
    this.timers.delay(T.startDelay, () => this.nextTurn());
  }

  update() {
    for (const u of this.units) u.updateShadow();
  }

  resize() {
    if (!this.bg) return;
    const key = locationBackground(this.textures, this.engine.renderer, this.location);
    if (key !== this.bg.key) { this.bg.setTexture(key); this.invalidateStatic(); }
  }

  /**
   * ×2 ускоряет в основном ожидание между ходами; сами движения только в 1.4 раза,
   * иначе выпад укладывается в 3–4 кадра и выглядит рывком.
   */
  setSpeed(s) {
    const motion = s > 1 ? 1.4 : 1;
    this.timers.timeScale = s > 1 ? 2.4 : 1;
    this.tweens.timeScale = motion;
    for (const u of this.units) u.body.timeScale = motion;
  }

  setAuto(on) {
    this.auto = on;
    if (on && this.awaitingTarget) {
      this.awaitingTarget = false;
      this.showTargets(false);
      this.attack(this.active, pickTarget(this.active, this.units));
    }
  }

  showTargets(on) {
    for (const u of this.units) u.targetRing.visible = on && u.side === 'E' && u.alive;
  }

  /* ---------- ход ---------- */
  nextTurn() {
    if (this.over || this.checkEnd()) return;
    let u = null;
    for (let n = 0; n < this.order.length; n++) {
      this.turn = (this.turn + 1) % this.order.length;
      if (this.order[this.turn].alive) { u = this.order[this.turn]; break; }
    }
    if (!u) return;
    this.active = u;

    if (u.poison > 0) {
      u.setPoisoned(u.poison - 1);
      this.app.sfx('poison');
      const died = this.dealDamage(u, poisonTick(u), { color: POISON_COLOR, word: WORDS.poison });
      if (died) { this.timers.delay(T.afterDeath, () => this.nextTurn()); return; }
    }

    this.activeRing.setPosition(u.home.x, u.home.y + 2).setScale(u.size / 0.56).setVisible(u.side === 'P');
    this.panel.turn(u);
    if (u.side === 'P' && !this.auto) {
      this.awaitingTarget = true;
      this.showTargets(true);
    } else {
      this.timers.delay(u.side === 'P' ? T.playerThink : T.enemyThink, () => this.attack(u, pickTarget(u, this.units)));
    }
  }

  onUnitTap(target) {
    if (!this.awaitingTarget || target.side !== 'E' || !target.alive) return;
    this.awaitingTarget = false;
    this.showTargets(false);
    this.attack(this.active, target);
  }

  /** Подбег и удар начинаются одновременно: гриб прибегает ровно к моменту выпада. */
  attack(a, t) {
    if (!a || !t || this.over) return;
    this.activeRing.visible = false;
    this.panel.attacking(t);
    // выпад в анимации удара — 46 единиц скелета, плюс расстояние до цели
    const stand = { x: t.home.x - a.dir * (46 * a.size + 72 * (t.size / 0.56)), y: t.home.y + 1 };
    a.body.depth = 2500;

    const onEvent = (name) => {
      if (name !== 'hit') return;
      a.body.off('event', onEvent);
      this.resolveHit(a, t);
    };
    const onComplete = (name) => {
      if (name !== 'strike') return;
      a.body.off('complete', onComplete);
      this.tweens.add({
        targets: a.body, x: a.home.x, y: a.home.y, duration: T.back, ease: 'sineInOut',
        onComplete: () => {
          a.body.depth = a.home.y;
          this.timers.delay(T.afterTurn, () => this.nextTurn());
        },
      });
    };
    a.body.on('event', onEvent);
    a.body.on('complete', onComplete);
    a.body.play('strike', { then: 'idle', mix: 0.1 });
    this.app.sfx('dash', { volume: 0.8, rate: 0.9 + Math.random() * 0.2 });
    this.tweens.add({ targets: a.body, x: stand.x, y: stand.y, duration: T.dash, ease: 'sineIn' });
  }

  resolveHit(a, t) {
    const hit = rollDamage(a, t);
    this.app.sfx(hit.crit ? 'crit' : hit.effect === 'weak' ? 'weak' : 'hit', { rate: 0.92 + Math.random() * 0.16 });
    const word = hit.crit ? WORDS.crit : hit.effect ? WORDS[hit.effect] : null;
    this.dealDamage(t, hit.damage, { word });
    if (!this.app.reduceMotion) {
      this.fx.burst(t.home.x, t.home.y - 70 * t.size, { color: SPECIES[a.skin].color, count: hit.crit ? 20 : 12 });
      this.shake(hit.crit ? 150 : 90, hit.crit ? 0.008 : 0.004);
    }
    if (a.el === 'poison' && t.alive) {
      t.setPoisoned(RULES.poisonTurns);
      this.app.sfx('poison', { volume: 0.6 });
    }
    if (a.el === 'wood') {
      const h = healTarget(this.units, a.side);
      if (h) {
        const amount = healAmount(h, hit.damage);
        h.heal(amount);
        this.app.sfx('heal', { volume: 0.8 });
        this.floatNumber(h, '+' + amount, '#9be07a');
        if (!this.app.reduceMotion) this.fx.burst(h.home.x, h.home.y - 40 * h.size, { color: HEAL_COLOR, count: 8 });
      }
    }
  }

  /** @returns {boolean} погиб ли боец */
  dealDamage(u, amount, { color = '#fff8ec', word = null } = {}) {
    this.floatNumber(u, '-' + amount, color);
    if (word) this.floatWord(u, word);
    const died = u.takeDamage(amount);
    if (died) this.timers.delay(400, () => this.app.sfx('faint'));
    return died;
  }

  floatNumber(u, text, color) {
    const label = this.numbers.find((l) => !l.visible);
    if (!label) return;
    const y = u.headY - 16;
    label.setText(text).setColor(color).setPosition(u.home.x + (Math.random() - 0.5) * 14, y).setAlpha(1).setVisible(true);
    this.tweens.add({ targets: label, y: y - 34, alpha: 0, duration: 950, ease: 'cubicOut', onComplete: () => (label.visible = false) });
  }

  floatWord(u, key) {
    const s = this.words.find((w) => !w.visible);
    if (!s) return;
    const y = u.headY - 40;
    s.setTexture(key).setPosition(u.home.x, y).setScale(0.9).setAlpha(1).setVisible(true);
    this.tweens.add({ targets: s, y: y - 18, scale: 1.05, alpha: 0, duration: 1000, ease: 'cubicOut', onComplete: () => (s.visible = false) });
  }

  /* ---------- конец боя ---------- */
  checkEnd() {
    const playerAlive = this.units.some((u) => u.side === 'P' && u.alive);
    const enemyAlive = this.units.some((u) => u.side === 'E' && u.alive);
    if (playerAlive && enemyAlive) return false;
    this.finish(playerAlive);
    return true;
  }

  finish(win) {
    if (this.over) return;
    this.over = true;
    this.awaitingTarget = false;
    this.showTargets(false);
    this.activeRing.visible = false;
    this.panel.turn(null);
    this.timers.delay(T.victoryDelay, () => {
      for (const u of this.units) if (u.alive) u.body.play('victory');
    });
    const result = win
      ? this.app.state.applyBattleWin(this.node, this.units.filter((u) => u.side === 'P').map((u) => ({ fighter: u.fighter, alive: u.alive })))
      : null;
    this.timers.delay(T.resultDelay, () => this.app.ui.battle.openResult(win, this.node, result));
  }

  destroy() {
    this.panel.detach(this);
    super.destroy();
  }
}
