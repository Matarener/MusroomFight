import { BEATS } from '../data/content.js';

/**
 * Правила боя без графики: урон, яд, лечение, выбор цели.
 * Чистые функции — их легко проверить и потом перенести на сервер.
 *
 * Боец в бою: { side: 'P'|'E', el, atk, hp, maxHp, alive, poison }
 */
export const RULES = {
  strongMultiplier: 1.5,   // удар по стихии, которую бьёшь
  weakMultiplier: 0.75,    // удар по стихии, которая бьёт тебя
  critChance: 0.12,
  critMultiplier: 1.5,
  earthArmor: 0.8,         // земляные получают меньше урона
  poisonTurns: 2,
  poisonShare: 0.07,       // доля максимального здоровья за ход яда
  healShare: 0.6,          // древесные лечат долю нанесённого урона
  enemyRandomTarget: 0.3,  // противник иногда бьёт случайную цель
};

/** @returns {{ damage: number, crit: boolean, effect: 'strong'|'weak'|null }} */
export function rollDamage(attacker, target, random = Math.random) {
  let mult = 1;
  let effect = null;
  if (BEATS[attacker.el] === target.el) { mult = RULES.strongMultiplier; effect = 'strong'; }
  else if (BEATS[target.el] === attacker.el) { mult = RULES.weakMultiplier; effect = 'weak'; }
  const crit = random() < RULES.critChance;
  let dmg = attacker.atk * mult * (0.9 + random() * 0.2) * (crit ? RULES.critMultiplier : 1);
  if (target.el === 'earth') dmg *= RULES.earthArmor;
  return { damage: Math.max(1, Math.round(dmg)), crit, effect };
}

export function poisonTick(unit) {
  return Math.max(2, Math.round(unit.maxHp * RULES.poisonShare));
}

/** Самый раненый живой союзник, которого есть смысл лечить. */
export function healTarget(units, side) {
  const hurt = units.filter((u) => u.alive && u.side === side && u.hp < u.maxHp);
  hurt.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
  return hurt[0] || null;
}

export function healAmount(unit, damageDealt) {
  return Math.min(unit.maxHp - unit.hp, Math.max(1, Math.round(damageDealt * RULES.healShare)));
}

/**
 * Цель для автоматического хода: сначала стихия, которую атакующий бьёт, потом самая слабая.
 */
export function pickTarget(attacker, units, random = Math.random) {
  const opp = units.filter((t) => t.alive && t.side !== attacker.side);
  if (!opp.length) return null;
  if (attacker.side === 'E' && random() < RULES.enemyRandomTarget) return opp[(random() * opp.length) | 0];
  opp.sort((x, y) => (BEATS[attacker.el] === y.el) - (BEATS[attacker.el] === x.el) || x.hp - y.hp);
  return opp[0];
}

/** Очередь ходов: игрок и противник по очереди, по порядку мест. */
export function turnOrder(units) {
  const ps = units.filter((u) => u.side === 'P');
  const es = units.filter((u) => u.side === 'E');
  const order = [];
  for (let k = 0; k < Math.max(ps.length, es.length); k++) {
    if (ps[k]) order.push(ps[k]);
    if (es[k]) order.push(es[k]);
  }
  return order;
}
