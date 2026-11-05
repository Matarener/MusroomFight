import { marimba, bell, pad, flute, bass, lead, kick, snare, hat, shaker, mixBus, note, midi } from '../../engine/audio/synth.js';

/**
 * Музыка: три зацикленных трека по 8 тактов. Ноты записаны прямо в коде,
 * трек рендерится в буфер один раз и дальше играет по кругу.
 *
 * Аккорд — массив нот, первая — бас. Мелодия — [доля от начала такта, нота, длина в долях].
 */
const n = (name) => midi(note(name));
const MUSIC_RATE = 32000; // для фоновой музыки хватает, а памяти вдвое меньше, чем 44100×2

function track(bpm, bars, compose, { room = 0.3, roomSize = 2.2, volume = 0.7 } = {}) {
  const beat = 60 / bpm;
  return {
    duration: bars * 4 * beat,
    loop: true,
    tail: 2.5,
    peak: 0.6,
    sampleRate: MUSIC_RATE,
    render: (ctx, out) => compose(ctx, mixBus(ctx, out, { volume, room, roomSize }), beat),
  };
}

const chord = (...names) => names.map(n);

/* ---------- ферма: тёплая маримба, до мажор ---------- */
const FARM_CHORDS = [
  chord('C3', 'C4', 'E4', 'G4'), chord('A2', 'A3', 'C4', 'E4'), chord('F2', 'F3', 'A3', 'C4'), chord('G2', 'G3', 'B3', 'D4'),
  chord('C3', 'C4', 'E4', 'G4'), chord('A2', 'A3', 'C4', 'E4'), chord('D3', 'D4', 'F4', 'A4'), chord('G2', 'G3', 'B3', 'D4'),
];
const FARM_MELODY = [
  [[0, 'E5', 1], [1, 'G5', 1], [2, 'A5', 1.5], [3.5, 'G5', 0.5]],
  [[0, 'E5', 2], [2.5, 'C5', 0.5], [3, 'D5', 1]],
  [[0, 'C5', 1], [1, 'A4', 1], [2, 'C5', 1], [3, 'F5', 1]],
  [[0, 'D5', 3], [3, 'G4', 1]],
  [[0, 'E5', 1], [1, 'G5', 1], [2, 'C6', 1.5], [3.5, 'A5', 0.5]],
  [[0, 'G5', 2], [2, 'E5', 1], [3, 'C5', 1]],
  [[0, 'D5', 1], [1, 'F5', 1], [2, 'A5', 1], [3, 'F5', 1]],
  [[0, 'D5', 2], [2, 'B4', 1], [3, 'G4', 1]],
];

const farm = track(92, 8, (ctx, out, beat) => {
  FARM_CHORDS.forEach((c, bar) => {
    const t0 = bar * 4 * beat;
    const [root, ...tones] = c;
    pad(ctx, out, t0, tones[0], 4 * beat * 0.95, 0.03, 700);
    pad(ctx, out, t0, tones[1], 4 * beat * 0.95, 0.025, 700);
    bass(ctx, out, t0, root, beat * 1.5, 0.2);
    bass(ctx, out, t0 + 2 * beat, root, beat * 1.5, 0.16);
    // арпеджио маримбы восьмыми
    const arp = [tones[0], tones[1], tones[2], tones[0] * 2, tones[2], tones[1], tones[2], tones[0] * 2];
    arp.forEach((f, i) => marimba(ctx, out, t0 + i * beat / 2, f, i % 2 ? 0.07 : 0.1, 0.45));
    for (const [at, nm, len] of FARM_MELODY[bar]) bell(ctx, out, t0 + at * beat, n(nm), 0.07, Math.min(1.4, len * beat * 1.4));
    for (let i = 0; i < 8; i++) shaker(ctx, out, t0 + i * beat / 2 + (i % 2 ? 0.02 : 0), i % 2 ? 0.025 : 0.04);
    kick(ctx, out, t0, 0.18);
    kick(ctx, out, t0 + 2 * beat, 0.12);
  });
}, { room: 0.28 });

/* ---------- лес: флейта и пэд, ля минор, медленно ---------- */
const FOREST_CHORDS = [
  chord('A2', 'A3', 'C4', 'E4'), chord('F2', 'F3', 'A3', 'C4'), chord('C3', 'G3', 'C4', 'E4'), chord('G2', 'G3', 'B3', 'D4'),
  chord('A2', 'A3', 'C4', 'E4'), chord('F2', 'F3', 'A3', 'C4'), chord('E2', 'E3', 'G#3', 'B3'), chord('A2', 'A3', 'C4', 'E4'),
];
const FOREST_MELODY = [
  [[0, 'E5', 1.5], [1.5, 'D5', 0.5], [2, 'C5', 2]],
  [[0, 'A4', 3], [3, 'C5', 1]],
  [[0, 'G5', 1.5], [1.5, 'E5', 0.5], [2, 'D5', 1], [3, 'E5', 1]],
  [[0, 'D5', 4]],
  [[0, 'E5', 1], [1, 'A5', 2], [3, 'G5', 1]],
  [[0, 'F5', 1.5], [1.5, 'E5', 0.5], [2, 'C5', 2]],
  [[0, 'B4', 2], [2, 'G#4', 1], [3, 'B4', 1]],
  [[0, 'A4', 4]],
];
const SPARKLES = [[1, 'E6'], [3.5, 'B6'], [2.5, 'A6'], [0.5, 'C7'], [3, 'E6'], [1.5, 'G6'], [2, 'B6'], [3.5, 'A6']];

const forest = track(68, 8, (ctx, out, beat) => {
  FOREST_CHORDS.forEach((c, bar) => {
    const t0 = bar * 4 * beat;
    const [root, ...tones] = c;
    for (const f of tones) pad(ctx, out, t0, f, 4 * beat * 0.98, 0.028, 650);
    bass(ctx, out, t0, root, 3.5 * beat, 0.16, 'sine');
    for (const [at, nm, len] of FOREST_MELODY[bar]) flute(ctx, out, t0 + at * beat, n(nm), len * beat * 0.9, 0.08);
    const [sAt, sNote] = SPARKLES[bar];
    bell(ctx, out, t0 + sAt * beat, n(sNote), 0.04, 1.5);
    for (let i = 1; i < 8; i += 2) shaker(ctx, out, t0 + i * beat / 2, 0.015);
  });
}, { room: 0.45, roomSize: 3 });

/* ---------- бой: ре минор, бодро ---------- */
const BATTLE_CHORDS = [
  chord('D2', 'D4', 'F4', 'A4'), chord('Bb1', 'Bb3', 'D4', 'F4'), chord('C2', 'C4', 'E4', 'G4'), chord('A1', 'A3', 'C#4', 'E4'),
  chord('D2', 'D4', 'F4', 'A4'), chord('Bb1', 'Bb3', 'D4', 'F4'), chord('G1', 'G3', 'Bb3', 'D4'), chord('A1', 'A3', 'C#4', 'E4'),
];
const BATTLE_MELODY = [
  [[0, 'D5', 0.5], [0.5, 'F5', 0.5], [1, 'A5', 1], [2, 'G5', 0.5], [2.5, 'F5', 0.5], [3, 'E5', 1]],
  [[0, 'F5', 1.5], [1.5, 'D5', 0.5], [2, 'Bb4', 1], [3, 'D5', 1]],
  [[0, 'E5', 0.5], [0.5, 'G5', 0.5], [1, 'C6', 1], [2, 'Bb5', 0.5], [2.5, 'A5', 0.5], [3, 'G5', 1]],
  [[0, 'A5', 2], [2, 'C#5', 1], [3, 'E5', 1]],
  [[0, 'D5', 0.5], [0.5, 'F5', 0.5], [1, 'A5', 1], [2, 'D6', 1], [3, 'C6', 1]],
  [[0, 'Bb5', 1.5], [1.5, 'A5', 0.5], [2, 'F5', 1], [3, 'D5', 1]],
  [[0, 'G5', 1], [1, 'Bb5', 1], [2, 'A5', 0.5], [2.5, 'G5', 0.5], [3, 'F5', 1]],
  [[0, 'E5', 1], [1, 'C#5', 1], [2, 'E5', 1], [3, 'A5', 1]],
];

const battle = track(132, 8, (ctx, out, beat) => {
  BATTLE_CHORDS.forEach((c, bar) => {
    const t0 = bar * 4 * beat;
    const [root, ...tones] = c;
    for (const f of tones) pad(ctx, out, t0, f, 4 * beat * 0.95, 0.022, 1100);
    // бас восьмыми с прыжками на октаву
    for (let i = 0; i < 8; i++) bass(ctx, out, t0 + i * beat / 2, i % 4 === 3 ? root * 2 : root, beat * 0.42, 0.2, 'sawtooth');
    for (const [at, nm, len] of BATTLE_MELODY[bar]) lead(ctx, out, t0 + at * beat, n(nm), len * beat, 0.05);
    kick(ctx, out, t0, 0.45);
    kick(ctx, out, t0 + 2 * beat, 0.45);
    kick(ctx, out, t0 + 2.5 * beat, 0.3);
    snare(ctx, out, t0 + beat, 0.16);
    snare(ctx, out, t0 + 3 * beat, 0.16);
    for (let i = 0; i < 8; i++) hat(ctx, out, t0 + i * beat / 2, i % 2 ? 0.04 : 0.06, i === 7);
  });
}, { room: 0.2, roomSize: 1.4, volume: 0.65 });

export const MUSIC = { farm, forest, battle };
