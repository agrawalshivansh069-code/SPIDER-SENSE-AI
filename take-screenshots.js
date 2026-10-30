import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\14d6a40f-8d68-4a23-9ccc-41d5e27a6d2c';

async function capture() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // 1. Full page overview
  const fullPagePath = path.join(ARTIFACT_DIR, 'spider_sense_overview.png');
  await page.screenshot({ path: fullPagePath, fullPage: true });
  console.log('Saved:', fullPagePath);

  // 2. Specific screenshot of What-If Machine results (Scenario A & B + Verdict)
  const whatIfSection = await page.$('#what-if-machine .result-container');
  if (whatIfSection) {
    const whatIfPath = path.join(ARTIFACT_DIR, 'what_if_scenario_cards.png');
    await whatIfSection.screenshot({ path: whatIfPath });
    console.log('Saved:', whatIfPath);
  }

  // 3. Trigger Reality Check preset and capture its result card
  const realityCheckPresets = await page.$$('#reality-check .preset-chip');
  if (realityCheckPresets.length > 0) {
    await realityCheckPresets[0].click(); // click first preset (Overloaded Day)
    await page.waitForTimeout ? page.waitForTimeout(300) : new Promise(r => setTimeout(r, 300));
    
    const submitBtn = await page.$('#reality-check button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 600)); // wait for result fade-in

      const realityResult = await page.$('#reality-check .result-container');
      if (realityResult) {
        const realityPath = path.join(ARTIFACT_DIR, 'reality_check_result_card.png');
        await realityResult.screenshot({ path: realityPath });
        console.log('Saved:', realityPath);
      }
    }
  }

  // Also save a copy in public/screenshots for easy web preview
  const publicDir = path.resolve('public/screenshots');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const name of ['spider_sense_overview.png', 'what_if_scenario_cards.png', 'reality_check_result_card.png']) {
    const src = path.join(ARTIFACT_DIR, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(publicDir, name));
    }
  }

  await browser.close();
  console.log('Screenshots complete!');
}

capture().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
