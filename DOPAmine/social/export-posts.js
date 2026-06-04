const puppeteer = require('puppeteer');
const path = require('path');

const posts = [
  'Post01_Science',
  'Post02_Practice',
  'Post03_Founder',
];

(async () => {
  const browser = await puppeteer.launch();

  for (const name of posts) {
    const htmlPath = path.resolve(__dirname, 'posts', `${name}.html`);
    const pngPath  = path.resolve(__dirname, 'posts', `${name}.png`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`file://${htmlPath}`);

    // Wait for Google Fonts + bloom animation to settle
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: pngPath, fullPage: false });
    await page.close();

    console.log(`exported: ${name}.png`);
  }

  await browser.close();
})();
