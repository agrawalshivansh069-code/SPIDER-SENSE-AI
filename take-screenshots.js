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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 2 });

  // 1. Capture the Opening Activation Sequence (clear sessionStorage first)
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  // Wait ~1.6s for typography and radar rings to be fully active
  await new Promise(r => setTimeout(r, 1600));
  const activationPath = path.join(ARTIFACT_DIR, 'spider_sense_activation.png');
  await page.screenshot({ path: activationPath });
  console.log('Saved:', activationPath);

  // Now wait for activation to finish or click skip to enter dashboard
  const skipBtn = await page.$('.activation-skip-btn');
  if (skipBtn) {
    await skipBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // 2. Full Dashboard View
  const fullPagePath = path.join(ARTIFACT_DIR, 'spider_sense_full_dashboard.png');
  await page.screenshot({ path: fullPagePath, fullPage: true });
  console.log('Saved:', fullPagePath);

  // Helper to temporarily hide sticky nav for clean element screenshots
  await page.evaluate(() => {
    const nav = document.querySelector('.top-nav');
    if (nav) nav.style.display = 'none';
  });

  // 3. Hero Section & Radar
  const heroSection = await page.$('.hero-section');
  if (heroSection) {
    const heroPath = path.join(ARTIFACT_DIR, 'spider_sense_hero_radar.png');
    await heroSection.screenshot({ path: heroPath });
    console.log('Saved:', heroPath);
  }

  // 4. Reality Check (Audit Workload Meter & Tasks)
  const realitySection = await page.$('#reality-check');
  if (realitySection) {
    const realityPath = path.join(ARTIFACT_DIR, 'reality_check_workload_meter.png');
    await realitySection.screenshot({ path: realityPath });
    console.log('Saved:', realityPath);

    // Click "Evaluate Plan Realism" to trigger and capture the results breakdown
    const evalBtn = await page.$('#reality-check button.btn-primary');
    if (evalBtn) {
      await evalBtn.click();
      await new Promise(r => setTimeout(r, 800)); // wait for result fade-in
      const realityResult = await page.$('#reality-check');
      if (realityResult) {
        const realityWithResultPath = path.join(ARTIFACT_DIR, 'reality_check_with_results.png');
        await realityResult.screenshot({ path: realityWithResultPath });
        console.log('Saved:', realityWithResultPath);
      }
    }
  }

  // 5. What-If Machine (3 Paths: Scenario A, Scenario B, The Third Path)
  const whatIfSection = await page.$('#what-if-machine');
  if (whatIfSection) {
    const whatIfPath = path.join(ARTIFACT_DIR, 'what_if_three_paths.png');
    await whatIfSection.screenshot({ path: whatIfPath });
    console.log('Saved:', whatIfPath);
  }

  // 6. Emergency Replanner (Crisis Triage Matrix)
  const emergencySection = await page.$('#emergency-replanner');
  if (emergencySection) {
    const emergencyPath = path.join(ARTIFACT_DIR, 'emergency_replanner_triage.png');
    await emergencySection.screenshot({ path: emergencyPath });
    console.log('Saved:', emergencyPath);
  }

  // Restore nav
  await page.evaluate(() => {
    const nav = document.querySelector('.top-nav');
    if (nav) nav.style.display = '';
  });

  // Copy to public/screenshots
  const publicDir = path.resolve('public/screenshots');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const files = [
    'spider_sense_activation.png',
    'spider_sense_full_dashboard.png',
    'spider_sense_hero_radar.png',
    'reality_check_workload_meter.png',
    'reality_check_with_results.png',
    'what_if_three_paths.png',
    'emergency_replanner_triage.png'
  ];

  for (const name of files) {
    const src = path.join(ARTIFACT_DIR, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(publicDir, name));
    }
  }

  await browser.close();
  console.log('All clean screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Screenshot capture error:', err);
  process.exit(1);
});
