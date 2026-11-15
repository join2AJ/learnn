const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: 'dark' });
  await ctx.addInitScript(() => { if (!localStorage.getItem('np2:settings')) localStorage.setItem('np2:settings', JSON.stringify({ onboarded: true, profiled: true, toured: true, seenVersion: '3.2', privacyOk: true, showHindi: true })); });
  const pg = await ctx.newPage();
  const base = 'http://localhost:4173/index.html';
  const shot = async (route, name, full = true, act) => { await pg.goto(base + '#/explore/resources'); await pg.waitForTimeout(200); await pg.goto(base + '#' + route); await pg.waitForTimeout(900); if (act) await act(); await pg.waitForTimeout(700); 
    if (!full) { await pg.screenshot({ path: name + '.png' }); return; }
    const max = await pg.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);
    const K = 60, require_ = require('fs'); require_.mkdirSync(name, { recursive: true });
    for (let i = 0; i < K; i++) { await pg.evaluate((y) => window.scrollTo(0, y), Math.round(Math.min(max, 1100) * i / (K - 1))); await pg.waitForTimeout(40); await pg.screenshot({ path: name + '/' + String(i).padStart(2, '0') + '.png' }); }
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.screenshot({ path: name + '.png' }); };
  await shot('/', 'home');
  await shot('/learn/kana/hira', 'kana');
  await shot('/learn', 'learn');
  await shot('/practice/cards', 'cards', false);
  await shot('/practice/speak', 'speak', false);
  await shot('/lab', 'lab');
  await shot('/explore/map', 'map', false, async () => { await pg.getByRole('button', { name: 'Find the prefecture' }).first().click(); await pg.waitForTimeout(500); await pg.locator('svg[aria-label="Map of Japan"] path').nth(12).click({ force: true }); });
  await shot('/explore/map', 'geo', false, async () => { await pg.locator('button', { hasText: 'Landscape' }).click(); });
  await shot('/explore/famous', 'famous');
  await shot('/explore/culture/do', 'culture');
  await shot('/me', 'me');
  await b.close();
})();
