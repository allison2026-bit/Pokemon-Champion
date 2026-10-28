import { chromium } from '/root/.bun/install/global/node_modules/playwright/index.mjs';

async function capture() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/ms-playwright/chromium-1247/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1800 },
    deviceScaleFactor: 1.5
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Take full page screenshot
  console.log('Taking full page screenshot...');
  await page.screenshot({ path: 'public/screenshot-full.jpg', fullPage: true, quality: 90, type: 'jpeg' });

  // Take top viewport screenshot with optimal height showing Steps 1 and 2
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/screenshot.jpg', quality: 90, type: 'jpeg' });
  await page.screenshot({ path: 'public/screenshot.png', type: 'png' });
  console.log('Real screenshots taken successfully!');

  await browser.close();
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
