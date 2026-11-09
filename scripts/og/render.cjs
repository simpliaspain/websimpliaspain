const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto('file://' + process.argv[2] + '/og.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  await p.screenshot({ path: process.argv[3] });
  await b.close(); console.log('ok');
})();
