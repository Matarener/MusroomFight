/**
 * Портреты бойцов для HTML-интерфейса (отряд, окна боя).
 * Собираются из тех же текстур, что и скелет, в позе покоя, и отдаются как blob-ссылки:
 * браузер распаковывает каждую картинку один раз.
 */
const SIZE = { w: 150, h: 172 };  // в игровых единицах
const OUTPUT_SCALE = 0.8;         // итоговый PNG 120×138

const cache = new Map();

/**
 * @param {import('../../engine/TextureCache.js').TextureCache} textures
 * @param {string} skin
 * @returns {string} адрес картинки
 */
export function portraitUrl(textures, skin) {
  if (cache.has(skin)) return cache.get(skin);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(SIZE.w * OUTPUT_SCALE);
  canvas.height = Math.round(SIZE.h * OUTPUT_SCALE);
  const ctx = canvas.getContext('2d');
  ctx.scale(OUTPUT_SCALE, OUTPUT_SCALE);

  const draw = (key, x, y) => {
    const t = textures.get(key);
    ctx.drawImage(t.canvas, x, y, t.w, t.h);
  };
  const arm = (x, y, deg) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 180);
    draw('arm_' + skin, -9, -40 * 0.12);
    ctx.restore();
  };
  // корень скелета внизу по центру; смещения повторяют позу покоя из данных скелета
  const rx = 75, ry = 166;
  arm(rx - 26, ry - 40, 25);
  draw('stem_' + skin, rx - 30, ry - 86);
  draw('eyes_open', rx - 24, ry - 58);
  draw('cap_' + skin, rx - 70, ry - 140);
  arm(rx + 26, ry - 40, -25);

  // синхронно: toDataURL → Blob, чтобы ссылка была готова сразу
  const bin = atob(canvas.toDataURL('image/png').split(',')[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  cache.set(skin, url);
  return url;
}
