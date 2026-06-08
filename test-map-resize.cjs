const { chromium } = require('playwright');
const path = require('path');

async function measureMap(page, label) {
  const containerBox = await page.locator('[data-map-container]').boundingBox();
  const mapBox = await page.locator('img[alt="Harita"]').boundingBox();
  if (!containerBox || !mapBox) throw new Error(`${label}: map geometry is unavailable`);

  const widthUsage = mapBox.width / containerBox.width;
  console.log(
    `${label}: container=${containerBox.width.toFixed(1)}x${containerBox.height.toFixed(1)}, ` +
    `map=${mapBox.width.toFixed(1)}x${mapBox.height.toFixed(1)}, widthUsage=${widthUsage.toFixed(3)}`
  );

  if (widthUsage < 0.95) {
    throw new Error(`${label}: map uses too little of the available container width`);
  }

  return mapBox;
}

async function takeScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // App'i aç
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);

  // Yeni kampanya oluştur
  await page.fill('input[placeholder="Kampanya adını girin..."]', 'Test Kampanya');
  await page.click('button:has-text("Oluştur")');
  await page.waitForTimeout(2000);

  // Harita yükle
  const fileInput = await page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(path.join(__dirname, 'test-map.png'));
  await page.waitForTimeout(2000);

  // Screenshot 1: Harita yüklendi, büyük pencere
  await page.screenshot({ path: 'ss-01-map-large.png' });
  console.log('SS 1: Map loaded (1280x720)');
  const initialMapBox = await measureMap(page, '1280x720');

  // Pencereyi küçült
  await page.setViewportSize({ width: 800, height: 600 });
  await page.waitForTimeout(1500);

  // Screenshot 2: Küçük pencere
  await page.screenshot({ path: 'ss-02-map-small.png' });
  console.log('SS 2: Map (800x600)');
  await measureMap(page, '800x600');

  // Pencereyi çok küçült
  await page.setViewportSize({ width: 600, height: 400 });
  await page.waitForTimeout(1500);

  // Screenshot 3: Çok küçük pencere
  await page.screenshot({ path: 'ss-03-map-tiny.png' });
  console.log('SS 3: Map (600x400)');
  await measureMap(page, '600x400');

  // Tekrar büyüt
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(1500);

  // Screenshot 4: Tekrar büyük pencere
  await page.screenshot({ path: 'ss-04-map-large-again.png' });
  console.log('SS 4: Map (1280x720 again)');
  const restoredMapBox = await measureMap(page, '1280x720 restored');
  if (Math.abs(restoredMapBox.width - initialMapBox.width) > 1) {
    throw new Error('Restored viewport did not restore the original fitted map size');
  }

  await browser.close();
  console.log('All screenshots saved!');
}

takeScreenshot().catch((error) => {
  console.error(error);
  process.exit(1);
});
