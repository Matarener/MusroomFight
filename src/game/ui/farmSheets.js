import { $, $$, icon, formatTime } from './dom.js';
import { Sheet } from './Sheet.js';
import { CRYSTALS, PRICES } from '../data/content.js';

/**
 * Окна фермы: выбор кристалла для посадки и окно растущего кристалла.
 */
export function createFarmSheets(app) {
  const { state, sheet } = app;
  const farmScene = () => app.engine.getScene('farm');

  function openSeeds(bedIndex) {
    const cards = Object.entries(CRYSTALS).map(([kind, c]) =>
      '<button class="seed" type="button" data-kind="' + kind + '"' + (state.canPlant(kind) ? '' : ' disabled') + '>' +
        icon('g-' + kind, 'seed-gem') +
        '<span class="seed-name">' + c.label + '</span>' +
        '<span class="tag ' + c.el + '">' + c.element + '</span>' +
        '<span class="seed-meta"><span>' + icon('i-clock') + ' ' + c.time + ' с</span>' +
        '<span>×' + c.yield + '</span><span>' + icon('i-spore') + ' ' + c.cost + '</span></span>' +
      '</button>').join('');

    const panel = sheet.open(
      Sheet.head('Что вырастим?', 'Споры: ' + state.spores + '. Кристалл стихии улучшает бойцов этой стихии.') +
      '<div class="seeds">' + cards + '</div>',
    );
    for (const b of $$('[data-kind]', panel)) {
      b.addEventListener('click', () => {
        if (state.plant(bedIndex, b.dataset.kind)) farmScene()?.onPlanted(bedIndex);
        sheet.close();
      });
    }
  }

  function openGrowing(bedIndex) {
    const c = CRYSTALS[state.beds[bedIndex].kind];
    const panel = sheet.open(
      Sheet.head(c.label + ' растёт', 'Осталось <span class="timer-big" id="t-left">' + formatTime(state.bedRemaining(bedIndex)) + '</span>') +
      '<div class="sbtns">' +
        '<button class="sbtn" type="button" id="b-fert"' + (state.spores < PRICES.fertilize ? ' disabled' : '') + '>' +
          '<span>Подкормить спорами<small>Сокращает оставшееся время вдвое</small></span>' +
          '<span class="price">' + PRICES.fertilize + ' ' + icon('i-spore') + '</span></button>' +
        '<button class="sbtn gold" type="button" id="b-now"' + (state.stars < PRICES.instantGrow ? ' disabled' : '') + '>' +
          '<span>Вырастить сейчас<small>Кристалл сразу будет готов</small></span>' +
          '<span class="price">' + PRICES.instantGrow + ' ' + icon('i-star') + '</span></button>' +
      '</div><p class="note">В прототипе звёзды ненастоящие, оплаты нет.</p>',
    );
    $('#b-fert', panel).addEventListener('click', () => {
      if (state.fertilize(bedIndex)) farmScene()?.onFertilized(bedIndex);
      sheet.close();
    });
    $('#b-now', panel).addEventListener('click', () => {
      state.growInstantly(bedIndex);
      sheet.close();
    });

    const left = $('#t-left', panel);
    const timer = setInterval(() => {
      const ms = state.bedRemaining(bedIndex);
      left.textContent = formatTime(ms);
      if (ms <= 0) sheet.close();
    }, 250);
    sheet.onClose(() => clearInterval(timer));
  }

  return { openSeeds, openGrowing };
}
