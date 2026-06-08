const { chromium } = require('playwright');
const path = require('path');

async function testZoom() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // App'i aç
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);

  // Yeni kampanya oluştur
  await page.fill('input[placeholder="Kampanya adını girin..."]', 'Zoom Test');
  await page.click('button:has-text("Oluştur")');
  await page.waitForTimeout(2000);

  // Harita yükle
  const fileInput = await page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(path.join(__dirname, 'test-map.png'));
  await page.waitForTimeout(2000);

  const map = page.locator('img[alt="Harita"]');
  const beforeBox = await map.boundingBox();
  if (!beforeBox) throw new Error('Map image is not visible');

  // Screenshot 1: Zoom öncesi
  await page.screenshot({ path: 'ss-zoom-01-before.png' });
  console.log('SS 1: Zoom before');

  // Mouse'u haritanın ortasına getir (container ortası)
  const container = page.locator('[data-map-container]');
  const box = await container.boundingBox();
  if (box) {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    await page.mouse.move(centerX, centerY);
    await page.waitForTimeout(200);

    // Zoom in (3 kez wheel up)
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(300);
    }
  }

  // Screenshot 2: Zoom in sonrası
  await page.screenshot({ path: 'ss-zoom-02-in.png' });
  console.log('SS 2: Zoom in');
  const zoomedBox = await map.boundingBox();
  if (!zoomedBox || zoomedBox.width <= beforeBox.width) {
    throw new Error('Wheel up did not increase the rendered map size');
  }

  // Zoom out (3 kez wheel down)
  if (box) {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    await page.mouse.move(centerX, centerY);
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(300);
    }
  }

  // Screenshot 3: Zoom out sonrası
  await page.screenshot({ path: 'ss-zoom-03-out.png' });
  console.log('SS 3: Zoom out');
  const restoredBox = await map.boundingBox();
  if (!restoredBox || Math.abs(restoredBox.width - beforeBox.width) > 1) {
    throw new Error('Equal wheel up/down steps did not restore the map scale');
  }

  await browser.close();
  console.log('Zoom test complete!');
}

testZoom().catch((error) => {
  console.error(error);
  process.exit(1);
});
