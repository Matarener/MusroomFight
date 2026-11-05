import { $, esc, icon } from './dom.js';
import { SPECIES, TEAM_SIZE, fighterStats, upgradeCost, xpToNextLevel } from '../data/content.js';
import { portraitUrl } from '../art/portraits.js';

const ELEMENT_ORDER = { earth: 0, poison: 1, wood: 2 };

/**
 * Экран отряда: тройка для боя и карточки всех девяти бойцов.
 * Игровой цикл на этом экране стоит на паузе: рисуется только HTML.
 */
export function createSquadScreen(app) {
  const { state, toast, engine } = app;
  const root = $('#scr-squad');
  const portrait = (skin) => portraitUrl(engine.textures, skin);
  const img = (skin, cls = '') =>
    '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + portrait(skin) + '" alt="" width="120" height="138" decoding="async">';

  function slotsHtml() {
    const team = state.teamFighters();
    return Array.from({ length: TEAM_SIZE }, (_, k) => {
      const f = team[k];
      if (!f) return '<div class="slot empty"><span>Пусто</span></div>';
      return '<button class="slot" type="button" data-team="' + f.id + '" aria-label="Убрать из отряда: ' + esc(SPECIES[f.skin].label) + '">' +
        img(f.skin) + '<span class="slot-lvl">' + f.level + '</span></button>';
    }).join('');
  }

  function cardHtml(f) {
    const sp = SPECIES[f.skin];
    const st = fighterStats(f.skin, f.level);
    const inTeam = state.team.includes(f.id);
    const cost = upgradeCost(f.level);
    const xp = Math.round((100 * f.xp) / xpToNextLevel(f.level));
    return '<article class="card' + (inTeam ? ' in' : '') + '">' +
      img(f.skin, 'pt') +
      '<div class="info">' +
        '<div class="row1"><b>' + esc(sp.label) + '</b><span class="lvl-b">ур. ' + f.level + '</span></div>' +
        '<div class="row2"><span class="tag ' + sp.el + '">' + sp.element + '</span>' +
          '<span class="st">' + icon('i-heart') + st.hp + '</span><span class="st">' + icon('i-sword') + st.atk + '</span></div>' +
        '<p class="trait">' + esc(sp.trait) + '</p>' +
        '<div class="xpb" title="Опыт"><i style="width:' + xp + '%"></i></div>' +
      '</div>' +
      '<div class="acts">' +
        '<button class="mbtn' + (inTeam ? ' on' : '') + '" type="button" data-team="' + f.id + '">' + (inTeam ? 'В отряде' : 'Взять в отряд') + '</button>' +
        '<button class="mbtn up" type="button" data-up="' + f.id + '"' + (state.canUpgrade(f) ? '' : ' disabled') + '>' +
          'Улучшить · ' + cost + icon('g-' + sp.el) + '</button>' +
      '</div></article>';
  }

  function render() {
    const list = state.squad.slice().sort((a, b) =>
      (state.team.includes(b.id) - state.team.includes(a.id)) ||
      ELEMENT_ORDER[SPECIES[a.skin].el] - ELEMENT_ORDER[SPECIES[b.skin].el] ||
      a.id - b.id);
    const scroll = $('.cards', root)?.scrollTop || 0;
    root.innerHTML =
      '<div class="scr-head"><h2>Отряд</h2><p>В бой идут любые трое. Кристаллы стихии с фермы улучшают бойцов этой стихии.</p></div>' +
      '<div class="team">' + slotsHtml() + '</div>' +
      '<div class="cards">' + list.map(cardHtml).join('') + '</div>';
    $('.cards', root).scrollTop = scroll;
  }

  root.addEventListener('click', (e) => {
    const up = e.target.closest('[data-up]');
    if (up) {
      const f = state.fighter(Number(up.dataset.up));
      if (state.upgrade(f.id)) { app.sfx('upgrade'); render(); toast(SPECIES[f.skin].label + ' теперь ' + f.level + ' уровня'); }
      return;
    }
    const t = e.target.closest('[data-team]');
    if (!t) return;
    const result = state.toggleTeam(Number(t.dataset.team));
    if (result === 'full') { app.sfx('error'); toast('В отряде уже трое. Сначала уберите кого-нибудь'); }
    else { app.sfx('tap'); render(); }
  });

  return {
    show() { render(); $('.cards', root).scrollTop = 0; },
    render,
  };
}
