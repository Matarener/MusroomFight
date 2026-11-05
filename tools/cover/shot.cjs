// Снимок обложки: node tools/cover/shot.cjs (сервер node tools/serve.mjs уже запущен на 5173)
// → cover-640x360.png и cover-1280x720.png в текущей папке.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const scale of [1, 2]) {
    const p = await b.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: scale });
    await p.goto('http://localhost:5173/tools/cover/');
    await p.waitForSelector('body[data-ready]');
    await p.screenshot({ path: `cover-${640 * scale}x${360 * scale}.png` });
    await p.close();
  }
  await b.close();
})();
