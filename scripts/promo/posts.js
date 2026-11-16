const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 540, height: 675 }, deviceScaleFactor: 2 });
 for (let i = 1; i <= 5; i++) { await pg.goto('file://' + __dirname + '/posts.html#post' + i); await pg.reload(); await pg.waitForTimeout(700); await pg.screenshot({ path: process.argv[2] + '/post' + i + '.jpg', type: 'jpeg', quality: 93 }); }
 await b.close(); })();
