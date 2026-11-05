import { $ } from './dom.js';
import { ACTORS, STORY } from '../data/story.js';
import { portraitUrl } from '../art/portraits.js';

const TYPE_MS = 22; // скорость появления букв

/**
 * Катсцены: облачко с репликой поверх StoryScene, кнопка «Пропустить».
 * Нажатие в любом месте — дописать реплику или перейти к следующему кадру.
 *
 *   app.story.maybe('ch1_before', then)  — показать, если ещё не видели; false, если показывать нечего
 *   app.story.play('intro', then)        — показать в любом случае
 */
export function createStory(app) {
  const root = $('#story-ui');
  const box = $('#story-box');
  const el = { portrait: $('#story-pt'), name: $('#story-name'), text: $('#story-text') };
  let current = null; // { id, scene, index, then }
  let typing = 0;
  let full = '';

  function finishTyping() {
    clearInterval(typing);
    typing = 0;
    el.text.textContent = full;
  }

  function typeText(text) {
    finishTyping();
    full = text;
    if (app.reduceMotion) { el.text.textContent = text; return; }
    let n = 0;
    el.text.textContent = '';
    typing = setInterval(() => {
      n += 1;
      el.text.textContent = text.slice(0, n);
      if (n >= text.length) finishTyping();
    }, TYPE_MS);
  }

  function showPanel(i) {
    current.index = i;
    current.scene.showPanel(i);
    const p = STORY[current.id][i];
    const actor = p.say ? ACTORS[p.say] : null;
    box.classList.toggle('caption', !actor);
    el.portrait.hidden = !actor;
    if (actor) {
      const src = portraitUrl(app.engine.textures, actor.skin);
      if (el.portrait.getAttribute('src') !== src) el.portrait.src = src;
    }
    el.name.textContent = actor ? actor.name : '';
    typeText(p.text);
    // перезапустить появление облачка
    box.classList.remove('pop');
    void box.offsetWidth;
    box.classList.add('pop');
  }

  function end() {
    if (!current) return;
    finishTyping();
    const { id, then } = current;
    current = null;
    root.hidden = true;
    app.state.markStorySeen(id);
    then();
  }

  function next() {
    if (!current) return;
    if (typing) { finishTyping(); return; }
    app.sfx('tap');
    if (current.index + 1 < STORY[current.id].length) showPanel(current.index + 1);
    else end();
  }

  root.addEventListener('click', (e) => {
    if (e.target.closest('#story-skip')) return;
    next();
  });
  $('#story-skip').addEventListener('click', () => { app.sfx('tap'); end(); });
  document.addEventListener('keydown', (e) => {
    if (!current || app.sheet.isOpen) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next(); }
    if (e.key === 'Escape') end();
  });

  function play(id, then) {
    if (!STORY[id]) { then(); return; }
    const scene = app.router.go('story', id);
    current = { id, scene, index: 0, then };
    root.hidden = false;
    showPanel(0);
  }

  return {
    play,
    maybe(id, then) {
      if (!STORY[id] || app.state.hasSeenStory(id)) return false;
      play(id, then);
      return true;
    },
    get playing() { return !!current; },
  };
}
