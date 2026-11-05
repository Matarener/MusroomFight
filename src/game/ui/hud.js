import { $, bump } from './dom.js';
import { ELEMENTS } from '../data/content.js';

/**
 * Верхняя панель (уровень, кристаллы, споры, звёзды) и число на вкладке «Отряд».
 * Обновляется по событию 'change' состояния. Отдельный ресурс можно «заморозить»,
 * чтобы число сменилось позже, например когда кристалл долетит до счётчика.
 */
export function createHud(state) {
  const el = {
    level: $('#lvl'),
    ring: $('#lvl-ring'),
    crystals: Object.fromEntries(ELEMENTS.map((k) => [k, $('#c-' + k)])),
    crystalsBox: $('#r-crystals'),
    spores: $('#r-spores span'),
    sporesBox: $('#r-spores'),
    stars: $('#r-stars span'),
    starsBox: $('#r-stars'),
    squadBadge: $('#squad'),
  };
  const frozen = new Set();
  const shown = {};

  function setText(node, value) {
    const v = String(value);
    if (node.textContent !== v) node.textContent = v;
  }

  function render() {
    setText(el.level, state.level);
    el.ring.style.setProperty('--xp', state.xp);
    el.ring.title = 'Уровень ' + state.level + ', опыт ' + state.xp + ' из 100';
    if (!frozen.has('crystals')) for (const k of ELEMENTS) setText(el.crystals[k], state.crystals[k]);
    if (!frozen.has('spores')) setText(el.spores, state.spores);
    setText(el.stars, state.stars);
    const ready = state.upgradableCount();
    setText(el.squadBadge, ready);
    el.squadBadge.hidden = !ready;
  }

  const boxes = { crystals: el.crystalsBox, spores: el.sporesBox, stars: el.starsBox };
  state.on('change', (what) => {
    render();
    for (const k of what) {
      const box = boxes[k];
      if (box && !frozen.has(k)) {
        // подпрыгивает только счётчик, число в котором выросло
        const v = k === 'crystals' ? ELEMENTS.reduce((s, e) => s + state.crystals[e], 0) : state[k];
        if (shown[k] !== undefined && v > shown[k]) bump(box);
        shown[k] = v;
      }
    }
  });

  render();
  shown.crystals = ELEMENTS.reduce((s, e) => s + state.crystals[e], 0);
  shown.spores = state.spores;
  shown.stars = state.stars;

  return {
    render,
    freeze(key) { frozen.add(key); },
    /** Разморозить и показать актуальное значение; withBump — подпрыгнуть. */
    release(key, withBump = false) {
      frozen.delete(key);
      render();
      if (withBump && boxes[key]) bump(boxes[key]);
      if (key === 'crystals') shown.crystals = ELEMENTS.reduce((s, e) => s + state.crystals[e], 0);
    },
  };
}
