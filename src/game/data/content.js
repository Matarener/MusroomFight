/**
 * Игровые данные: стихии, бойцы, кристаллы, бои в лесу, цены.
 * Только константы и чистые функции, без состояния и без отрисовки.
 */

/* ---------- стихии ---------- */
export const ELEMENTS = ['earth', 'poison', 'wood'];
export const ELEMENT_NAME = { earth: 'Земля', poison: 'Яд', wood: 'Дерево' };
/** Кто кого бьёт: земля → яд → дерево → земля. */
export const BEATS = { earth: 'poison', poison: 'wood', wood: 'earth' };
export const ELEMENT_TRAIT = {
  earth: 'Крепкий: получает на 20% меньше урона',
  poison: 'Ядовитый: отравляет цель на 2 хода',
  wood: 'Целитель: лечит самого раненого союзника',
};

/* ---------- бойцы ---------- */
export const SPECIES = {
  borovik:  { label: 'Боровик',           el: 'earth',  hp: 64,  atk: 10, color: 0xd9b56b },
  podberez: { label: 'Подберёзовик',      el: 'earth',  hp: 54,  atk: 12, color: 0xc9b48a },
  ryzhik:   { label: 'Рыжик',             el: 'earth',  hp: 58,  atk: 11, color: 0xf09a3a },
  mukhomor: { label: 'Мухомор',           el: 'poison', hp: 46,  atk: 12, color: 0xe8503c },
  poganka:  { label: 'Бледная поганка',   el: 'poison', hp: 40,  atk: 14, color: 0xd6dcae },
  panther:  { label: 'Пантерный мухомор', el: 'poison', hp: 52,  atk: 11, color: 0x9a7a55 },
  woodear:  { label: 'Древесное ухо',     el: 'wood',   hp: 54,  atk: 9,  color: 0xa0634a },
  openok:   { label: 'Опёнок',            el: 'wood',   hp: 46,  atk: 11, color: 0xd9a35a },
  veshenka: { label: 'Вешенка',           el: 'wood',   hp: 62,  atk: 8,  color: 0xb8b8b0 },
  witch:    { label: 'Ведьма Светлячиха', el: 'poison', hp: 118, atk: 11, color: 0x9bf07a, trait: 'Хозяйка Светляков. Отравляет.', boss: true },
  tosha:    { label: 'Тоша',              el: 'earth',  hp: 64,  atk: 10, color: 0xd9b56b, trait: 'Юный боровичок, лидер отряда. Крепкий: получает на 20% меньше урона' },
  smorchok: { label: 'Генерал Сморчок',   el: 'earth',  hp: 88,  atk: 12, color: 0x9bf07a, trait: 'Командир Светляков. Крепкий: получает на 20% меньше урона', boss: true },
};
for (const sp of Object.values(SPECIES)) {
  sp.element = ELEMENT_NAME[sp.el];
  sp.trait = sp.trait || ELEMENT_TRAIT[sp.el];
}
/** Постоянный отряд игрока: девять грибов, по три на стихию. Первый — Тоша, главный герой. */
export const SQUAD_SKINS = ['tosha', 'podberez', 'ryzhik', 'mukhomor', 'poganka', 'panther', 'woodear', 'openok', 'veshenka'];
export const TEAM_SIZE = 3;

export const xpToNextLevel = (level) => 30 * level;
/** Улучшение стоит кристаллы стихии бойца. */
export const upgradeCost = (level) => 2 * level;

export function fighterStats(skin, level) {
  const sp = SPECIES[skin], k = 1 + 0.18 * (level - 1);
  return { hp: Math.round(sp.hp * k), atk: Math.round(sp.atk * k) };
}

/* ---------- кристаллы ---------- */
export const CRYSTALS = {
  earth:  { label: 'Янтарный кристалл',    el: 'earth',  time: 30, cost: 1, yield: 3, color: 0xffc04a, faces: { mid: 0xe8a33c, light: 0xffd98a, dark: 0xa8601a } },
  poison: { label: 'Аметистовый кристалл', el: 'poison', time: 45, cost: 1, yield: 3, color: 0xc98cff, faces: { mid: 0xa765d8, light: 0xe2c4ff, dark: 0x5e2e8c } },
  wood:   { label: 'Изумрудный кристалл',  el: 'wood',   time: 40, cost: 1, yield: 3, color: 0x6fe09a, faces: { mid: 0x3fbf78, light: 0xb4f2c8, dark: 0x1a7444 } },
};
for (const c of Object.values(CRYSTALS)) c.element = ELEMENT_NAME[c.el];

export const PRICES = {
  unlockBed: 15,   // спор за новую грядку
  fertilize: 1,    // спор за ускорение вдвое
  instantGrow: 5,  // звёзд за мгновенный рост
};

/* ---------- лес: девять глав пути через Зону ---------- */
export const CHAPTER_NAMES = [
  'Опушка', 'Старый забор', 'Рыжий лес', 'Болото', 'Лагерь Сморчка',
  'Заброшенная деревня', 'Мёртвая дорога', 'У подножия Вышки', 'Вышка',
];
/** Главы на карте леса: снизу вверх, карта выше экрана и прокручивается. */
const NODE_STEP = 112; // по вертикали между главами, чтобы кружки не налезали друг на друга
export const NODES = Array.from({ length: 9 }, (_, i) => ({
  i,
  boss: i === 8,
  x: Math.round(195 + Math.sin(i * 1.25 + 0.3) * 100),
  y: Math.round(720 - i * NODE_STEP),
}));
/** Высота карты леса (в игровых единицах, как у экрана 390×844). */
export const FOREST_MAP = { top: NODES[8].y - 300, bottom: NODES[0].y + 240 };

const ENEMY_PATTERNS = [
  ['openok', 'podberez'],
  ['poganka', 'veshenka'],
  ['ryzhik', 'panther', 'woodear'],
  ['veshenka', 'openok', 'borovik'],
  ['mukhomor', 'smorchok', 'poganka'], // лагерь Генерала Сморчка
  ['ryzhik', 'woodear', 'panther'],
  ['panther', 'mukhomor', 'openok'],
  ['borovik', 'ryzhik', 'veshenka'],
];

export function nodeEnemies(i) {
  if (NODES[i].boss) return [{ skin: 'poganka', level: 4 }, { skin: 'witch', level: 4 }, { skin: 'veshenka', level: 4 }];
  const level = 1 + Math.floor(i / 2);
  return ENEMY_PATTERNS[i].map((skin, k) => ({ skin, level: level + (k === 0 && i > 3 ? 1 : 0) }));
}

export function nodeReward(i) {
  return { spores: 2 + Math.floor(i / 3) + (NODES[i].boss ? 4 : 0), crystals: NODES[i].boss ? 3 : 1, xp: 18 + i * 4 };
}
