import { $ } from './dom.js';
import { createHud } from './hud.js';
import { createFarmSheets } from './farmSheets.js';
import { createSquadScreen } from './squadScreen.js';
import { createBattleUi } from './battleUi.js';
import { createFpsMeter } from './fpsMeter.js';
import { createSettingsSheet } from './settingsSheet.js';
import { NODES } from '../data/content.js';

/**
 * Весь HTML-интерфейс поверх игры. Модули получают общий контекст app
 * и общаются с игрой только через app.state, app.router и сцены движка.
 */
export function createUi(app) {
  const ui = {
    toast: app.toast,
    hud: createHud(app.state),
    farm: createFarmSheets(app),
    squad: createSquadScreen(app),
    battle: createBattleUi(app),
    fps: createFpsMeter(app),
    settings: createSettingsSheet(app),

    forestTitle() {
      const c = app.state.forestCleared, total = NODES.length;
      $('#forest-title').innerHTML = '<b>Опушка</b><span>' + (c >= total ? 'пройдена' : 'бои ' + c + ' / ' + total) + '</span>';
    },
  };
  return ui;
}
