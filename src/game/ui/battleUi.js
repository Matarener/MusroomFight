import { $, esc, icon } from './dom.js';
import { Sheet } from './Sheet.js';
import { SPECIES, NODES, nodeEnemies, nodeReward } from '../data/content.js';
import { portraitUrl } from '../art/portraits.js';

/**
 * Нижняя панель боя: чей ход, подсказка, кнопки «Авто» и «×2».
 * Настройки авто и скорости сохраняются между боями.
 */
class BattlePanel {
  constructor(app) {
    this.app = app;
    this.auto = false;
    this.speed = 1;
    this.scene = null;
    this.el = {
      title: $('#bt-title'), panel: $('#battle-panel'), portrait: $('#bp-pt'),
      name: $('#bp-name'), hint: $('#bp-hint'), auto: $('#bp-auto'), speed: $('#bp-speed'),
    };
    this.el.auto.addEventListener('click', () => {
      app.sfx('tap');
      this.auto = !this.auto;
      this._sync();
      if (this.scene && !this.scene.over) {
        this.scene.setAuto(this.auto);
        if (this.scene.active) this.turn(this.scene.active);
      }
    });
    this.el.speed.addEventListener('click', () => {
      app.sfx('tap');
      this.speed = this.speed > 1 ? 1 : 2;
      this._sync();
      if (this.scene) this.scene.setSpeed(this.speed);
    });
    $('#bt-flee').addEventListener('click', () => app.router.go('forest'));
  }

  attach(scene) {
    this.scene = scene;
    this.el.title.textContent = NODES[scene.node].boss ? 'Босс опушки' : 'Бой ' + (scene.node + 1) + ' · Опушка';
    this._sync();
    this.turn(null);
  }

  detach(scene) {
    if (this.scene === scene) this.scene = null;
  }

  _sync() {
    this.el.auto.setAttribute('aria-pressed', String(this.auto));
    this.el.speed.setAttribute('aria-pressed', String(this.speed > 1));
  }

  turn(unit) {
    const { portrait, name, hint, panel } = this.el;
    if (!unit) {
      portrait.hidden = true;
      name.textContent = '';
      hint.textContent = this.scene && this.scene.over ? 'Бой окончен' : 'Бой начинается…';
      return;
    }
    portrait.hidden = false;
    const src = portraitUrl(this.app.engine.textures, unit.skin);
    if (portrait.getAttribute('src') !== src) portrait.src = src;
    name.textContent = unit.label + ' · ур. ' + unit.level;
    hint.textContent = unit.side === 'P' ? (this.auto ? 'Ходит сам' : 'Нажмите на противника') : 'Ход противника';
    panel.classList.toggle('enemy', unit.side === 'E');
  }

  attacking(target) {
    this.el.hint.textContent = 'Атакует: ' + target.label;
  }
}

/** Окна перед боем и после него. */
export function createBattleUi(app) {
  const { state, sheet } = app;
  const panel = new BattlePanel(app);
  const portrait = (skin) => portraitUrl(app.engine.textures, skin);

  const mini = (skin, level) => {
    const sp = SPECIES[skin];
    return '<span class="mini"><img src="' + portrait(skin) + '" alt="" width="120" height="138">' +
      '<b>' + esc(sp.label) + '</b><span class="mini-meta"><span class="tag ' + sp.el + '">' + sp.element + '</span> ур. ' + level + '</span></span>';
  };

  function openPrep(node) {
    const enemies = nodeEnemies(node);
    const team = state.teamFighters();
    const reward = nodeReward(node);
    const replay = node < state.forestCleared;
    const spores = replay ? Math.ceil(reward.spores / 2) : reward.spores;

    const panelEl = sheet.open(
      Sheet.head(NODES[node].boss ? 'Босс опушки' : 'Бой ' + (node + 1), replay ? 'Уже пройден: спор дадут вдвое меньше' : 'Опушка, новый бой') +
      '<div class="vs-rows">' +
        '<div class="vs-side"><span class="vs-label">Противники</span><div class="minis">' + enemies.map((e) => mini(e.skin, e.level)).join('') + '</div></div>' +
        '<div class="vs-side"><span class="vs-label">Ваш отряд</span><div class="minis">' +
          (team.length ? team.map((f) => mini(f.skin, f.level)).join('') : '<span class="empty-note">Отряд пуст. Возьмите бойцов на вкладке «Отряд»</span>') +
        '</div></div>' +
      '</div>' +
      '<p class="rule"><span class="tag earth">Земля</span> бьёт <span class="tag poison">Яд</span>, яд бьёт <span class="tag wood">Дерево</span>, дерево бьёт землю</p>' +
      '<div class="reward"><span>Награда</span><b>+' + spores + icon('i-spore') + '</b><b>+' + reward.crystals + icon('g-any') + '</b><b>+' + reward.xp + ' опыта</b></div>' +
      '<button class="sbtn gold go" type="button" id="b-go"' + (team.length ? '' : ' disabled') + '><span>В бой!</span></button>',
    );
    $('#b-go', panelEl).addEventListener('click', () => { app.sfx('tap'); app.router.go('battle', node); });
  }

  function openResult(win, node, result) {
    if (win) {
      const ups = result.levelUps.map((f) => '<li>' + esc(SPECIES[f.skin].label) + ' достиг ' + f.level + ' уровня</li>').join('');
      const r = result.reward;
      const el = sheet.open(
        '<div class="result win"><h2 class="sheet-title">Победа!</h2>' +
        '<div class="reward big"><b>+' + r.spores + icon('i-spore') + '</b><b>+' + r.crystals + icon('g-' + r.crystalEl) + '</b><b>+' + r.xp + ' опыта</b></div>' +
        (ups ? '<ul class="ups">' + ups + '</ul>' : '') +
        (result.first && NODES[node].boss ? '<p class="note">Опушка пройдена! Новые зоны леса появятся в следующих версиях.</p>' : '') +
        '<button class="sbtn gold go" type="button" id="b-next"><span>Дальше</span></button></div>',
        { modal: true },
      );
      app.sfx('victory');
      if (result.levelUps.length) setTimeout(() => app.sfx('levelup'), 1300);
      $('#b-next', el).addEventListener('click', () => app.router.go('forest'));
    } else {
      const el = sheet.open(
        '<div class="result"><h2 class="sheet-title">Отряд отступил</h2>' +
        '<p class="sheet-sub">Улучшите бойцов на вкладке «Отряд» или подберите стихии против этих противников.</p>' +
        '<div class="sbtns"><button class="sbtn gold go" type="button" id="b-again"><span>Ещё раз</span></button>' +
        '<button class="sbtn go" type="button" id="b-squad"><span>К отряду</span></button></div></div>',
        { modal: true },
      );
      app.sfx('defeat');
      $('#b-again', el).addEventListener('click', () => app.router.go('battle', node));
      $('#b-squad', el).addEventListener('click', () => app.router.go('squad'));
    }
  }

  return { panel, openPrep, openResult };
}
