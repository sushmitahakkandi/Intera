const puppeteer = require('puppeteer');
const path = require('path');

const takeScreenshots = async () => {
  console.log('Starting Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4b4e844d-c24c-4ac6-8738-18e0bcc94d25';

  try {
    console.log('Navigating to Shop page...');
    await page.goto('http://localhost:3001/shop?category=Sofa', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow react state to load

    // 1. Verify Metal Filter
    console.log('Checking Metal filter...');
    // Click Metal checkbox
    await page.click('text=Metal');
    await page.waitForTimeout(2500); // Allow grid transition
    
    const metalScreenshot = path.join(brainDir, 'metal_filter_results_v2.png');
    await page.screenshot({ path: metalScreenshot });
    console.log(`Saved metal filter screenshot: ${metalScreenshot}`);

    // Uncheck Metal checkbox
    await page.click('text=Metal');
    await page.waitForTimeout(1000);

    // 2. Verify Wood Filter
    console.log('Checking Wood filter...');
    await page.click('text=Wood');
    await page.waitForTimeout(2500); // Allow grid transition

    const woodScreenshot = path.join(brainDir, 'wood_filter_results_v2.png');
    await page.screenshot({ path: woodScreenshot });
    console.log(`Saved wood filter screenshot: ${woodScreenshot}`);

  } catch (err) {
    console.error('Error during browser automation:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
};

takeScreenshots();
