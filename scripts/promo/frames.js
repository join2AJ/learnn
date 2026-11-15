const { chromium } = require('playwright');
(async () => {
  const [, , out, fps = '30', only] = process.argv;
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file://' + __dirname + '/video.html'); await pg.waitForTimeout(800);
  const F = +fps, N = Math.round(50.4 * F);
  const list = only ? only.split(',').map(Number) : Array.from({ length: N }, (_, i) => i / F);
  for (let i = 0; i < list.length; i++) {
    await pg.evaluate((t) => window.render(t), list[i]);
    await pg.screenshot({ path: `${out}/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  await b.close();
})();
