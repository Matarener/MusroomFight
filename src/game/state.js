import { Emitter } from '../engine/Emitter.js';

/** Версия формата сохранения: поднять, если поля поменяются несовместимо. */
const SAVE_VERSION = 1;
import {
  SQUAD_SKINS, SPECIES, CRYSTALS, PRICES, TEAM_SIZE, NODES,
  upgradeCost, xpToNextLevel, nodeReward, ELEMENTS,
} from './data/content.js';

/**
 * Состояние игрока и все операции, которые его меняют.
 * Сцены и интерфейс не трогают поля напрямую, а вызывают методы.
 * После любого изменения отправляется событие 'change' со списком изменённых ресурсов,
 * по нему интерфейс обновляет счётчики.
 *
 * Сохранение: toSave() отдаёт снимок для хранилища, restore() применяет его
 * (см. src/game/save.js). Для сервера достаточно заменить тела методов
 * на запросы к API: остальной код игры менять не придётся.
 */
export class GameState extends Emitter {
  constructor() {
    super();
    this.level = 3;
    this.xp = 62;
    this.spores = 6;
    this.stars = 25;
    this.crystals = { earth: 4, poison: 2, wood: 3 };
    this.squad = SQUAD_SKINS.map((skin, i) => ({ id: i + 1, skin, level: skin === 'borovik' ? 2 : 1, xp: (i * 7) % 20 }));
    this.team = [1, 4, 7];
    this.forestCleared = 0;

    const now = Date.now();
    this.beds = [
      { status: 'growing', kind: 'earth',  plantedAt: now - 31000, duration: 30 },
      { status: 'growing', kind: 'poison', plantedAt: now - 30000, duration: 45 },
      { status: 'growing', kind: 'wood',   plantedAt: now - 4000,  duration: 40 },
      { status: 'empty' },
      { status: 'growing', kind: 'earth',  plantedAt: now - 11000, duration: 30 },
      { status: 'locked' },
    ];
  }

  _changed(...what) {
    this.emit('change', what);
  }

  /* ---------- сохранение ---------- */
  /** Снимок всего прогресса: обычный объект, который можно положить в JSON. */
  toSave() {
    return {
      v: SAVE_VERSION,
      level: this.level,
      xp: this.xp,
      spores: this.spores,
      stars: this.stars,
      crystals: { ...this.crystals },
      squad: this.squad.map(({ id, level, xp }) => ({ id, level, xp })),
      team: [...this.team],
      forestCleared: this.forestCleared,
      beds: this.beds.map((b) => ({ ...b })),
    };
  }

  /**
   * Применить сохранённый снимок. Неизвестные и испорченные поля пропускаются,
   * поэтому старое или чужое сохранение не ломает игру.
   * @returns {boolean} удалось ли применить
   */
  restore(data) {
    if (!data || typeof data !== 'object' || data.v !== SAVE_VERSION) return false;
    const num = (v, min = 0) => (Number.isFinite(v) && v >= min ? v : null);
    this.level = num(data.level, 1) ?? this.level;
    this.xp = num(data.xp) ?? this.xp;
    this.spores = num(data.spores) ?? this.spores;
    this.stars = num(data.stars) ?? this.stars;
    for (const el of ELEMENTS) this.crystals[el] = num(data.crystals?.[el]) ?? this.crystals[el];
    if (Array.isArray(data.squad)) {
      for (const saved of data.squad) {
        const f = this.fighter(saved?.id);
        if (!f) continue;
        f.level = num(saved.level, 1) ?? f.level;
        f.xp = num(saved.xp) ?? f.xp;
      }
    }
    if (Array.isArray(data.team)) {
      const team = [...new Set(data.team)].filter((id) => this.fighter(id)).slice(0, TEAM_SIZE);
      if (team.length) this.team = team;
    }
    this.forestCleared = Math.min(NODES.length, num(data.forestCleared) ?? this.forestCleared);
    if (Array.isArray(data.beds) && data.beds.length === this.beds.length) {
      const ok = (b) => b && (b.status === 'empty' || b.status === 'locked'
        || (b.status === 'growing' && CRYSTALS[b.kind] && num(b.plantedAt) !== null && num(b.duration) !== null));
      if (data.beds.every(ok)) this.beds = data.beds.map((b) => ({ ...b }));
    }
    this._changed('level', 'spores', 'stars', 'crystals', 'squad', 'team', 'forest');
    return true;
  }

  /* ---------- опыт игрока ---------- */
  addPlayerXp(n) {
    this.xp += n;
    let leveled = false;
    while (this.xp >= 100) { this.xp -= 100; this.level++; leveled = true; }
    this._changed('level');
    return leveled;
  }

  /* ---------- ферма ---------- */
  bedStage(i, now = Date.now()) {
    const b = this.beds[i];
    if (b.status !== 'growing') return b.status;
    const p = this.bedProgress(i, now);
    return p >= 1 ? 'ready' : p < 0.25 ? 'spore' : 'growing';
  }

  bedProgress(i, now = Date.now()) {
    const b = this.beds[i];
    if (b.status !== 'growing') return 0;
    return Math.min(1, (now - b.plantedAt) / (b.duration * 1000));
  }

  bedRemaining(i, now = Date.now()) {
    const b = this.beds[i];
    if (b.status !== 'growing') return 0;
    return Math.max(0, b.plantedAt + b.duration * 1000 - now);
  }

  canPlant(kind) {
    return this.spores >= CRYSTALS[kind].cost;
  }

  plant(i, kind) {
    if (!this.canPlant(kind) || this.beds[i].status !== 'empty') return false;
    this.spores -= CRYSTALS[kind].cost;
    this.beds[i] = { status: 'growing', kind, plantedAt: Date.now(), duration: CRYSTALS[kind].time };
    this._changed('spores');
    return true;
  }

  /** @returns {{ kind, amount, leveled } | null} */
  harvest(i) {
    if (this.bedStage(i) !== 'ready') return null;
    const kind = this.beds[i].kind;
    const amount = CRYSTALS[kind].yield + (Math.random() < 0.25 ? 1 : 0);
    this.beds[i] = { status: 'empty' };
    this.crystals[kind] += amount;
    const leveled = this.addPlayerXp(10);
    this._changed('crystals');
    return { kind, amount, leveled };
  }

  fertilize(i) {
    if (this.spores < PRICES.fertilize || this.beds[i].status !== 'growing') return false;
    this.spores -= PRICES.fertilize;
    this.beds[i].plantedAt -= this.bedRemaining(i) / 2;
    this._changed('spores');
    return true;
  }

  growInstantly(i) {
    if (this.stars < PRICES.instantGrow || this.beds[i].status !== 'growing') return false;
    this.stars -= PRICES.instantGrow;
    this.beds[i].plantedAt = Date.now() - this.beds[i].duration * 1000;
    this._changed('stars');
    return true;
  }

  unlockBed(i) {
    if (this.spores < PRICES.unlockBed || this.beds[i].status !== 'locked') return false;
    this.spores -= PRICES.unlockBed;
    this.beds[i] = { status: 'empty' };
    this._changed('spores');
    return true;
  }

  /* ---------- отряд ---------- */
  fighter(id) {
    return this.squad.find((f) => f.id === id) || null;
  }

  teamFighters() {
    return this.team.map((id) => this.fighter(id)).filter(Boolean);
  }

  /** @returns {'added'|'removed'|'full'} */
  toggleTeam(id) {
    const i = this.team.indexOf(id);
    if (i >= 0) { this.team.splice(i, 1); this._changed('team'); return 'removed'; }
    if (this.team.length >= TEAM_SIZE) return 'full';
    this.team.push(id);
    this._changed('team');
    return 'added';
  }

  canUpgrade(f) {
    return this.crystals[SPECIES[f.skin].el] >= upgradeCost(f.level);
  }

  upgradableCount() {
    return this.squad.filter((f) => this.canUpgrade(f)).length;
  }

  upgrade(id) {
    const f = this.fighter(id);
    if (!f || !this.canUpgrade(f)) return false;
    this.crystals[SPECIES[f.skin].el] -= upgradeCost(f.level);
    f.level++;
    this._changed('crystals', 'squad');
    return true;
  }

  /* ---------- лес ---------- */
  isNodeOpen(i) {
    return i <= this.forestCleared;
  }

  /**
   * Начислить награду за победу.
   * @param {number} node
   * @param {{ fighter: object, alive: boolean }[]} survivors  бойцы игрока после боя
   */
  applyBattleWin(node, survivors) {
    const reward = { ...nodeReward(node) };
    const first = node === this.forestCleared;
    if (first) this.forestCleared = Math.min(NODES.length, this.forestCleared + 1);
    else reward.spores = Math.ceil(reward.spores / 2);

    this.spores += reward.spores;
    reward.crystalEl = ELEMENTS[(Math.random() * ELEMENTS.length) | 0];
    this.crystals[reward.crystalEl] += reward.crystals;
    this.addPlayerXp(8);

    const levelUps = [];
    for (const { fighter, alive } of survivors) {
      fighter.xp += alive ? reward.xp : Math.round(reward.xp / 2);
      while (fighter.xp >= xpToNextLevel(fighter.level)) {
        fighter.xp -= xpToNextLevel(fighter.level);
        fighter.level++;
        levelUps.push(fighter);
      }
    }
    this._changed('spores', 'crystals', 'squad', 'forest');
    return { reward, levelUps, first };
  }
}
