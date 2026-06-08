const { chromium } = require('playwright');
const path = require('path');

async function takeScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // App'i aç
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);

  // Screenshot al - CampaignManager modal
  await page.screenshot({ path: 'screenshot-01-initial.png', fullPage: true });
  console.log('Screenshot 1: Initial state');

  // Yeni kampanya oluştur
  await page.fill('input[placeholder="Kampanya adını girin..."]', 'Test Kampanya');
  await page.click('button:has-text("Oluştur")');
  await page.waitForTimeout(2000);

  // Screenshot al - Ana ekran
  await page.screenshot({ path: 'screenshot-02-campaign-created.png', fullPage: true });
  console.log('Screenshot 2: Campaign created');

  // File input'a dosya seç
  const fileInput = await page.locator('input[type="file"]').first();
  // Test için basit bir 800x600 PNG oluştur
  const testImagePath = path.join(__dirname, 'test-map.png');
  await fileInput.setInputFiles(testImagePath);
  await page.waitForTimeout(2000);

  // Screenshot al - Harita yüklendi
  await page.screenshot({ path: 'screenshot-03-map-loaded.png', fullPage: true });
  console.log('Screenshot 3: Map loaded');

  // Pin ekle butonuna tıkla
  await page.click('button:has-text("Pin Ekle")');
  await page.waitForTimeout(500);
  
  // Haritaya tıkla (orta nokta)
  const mapBox = await page.locator('img[alt="Harita"]').boundingBox();
  if (mapBox) {
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  }
  await page.waitForTimeout(1000);

  // Screenshot al - Pin modal
  await page.screenshot({ path: 'screenshot-04-pin-modal.png', fullPage: true });
  console.log('Screenshot 4: Pin modal');

  // Pencere boyutunu değiştir
  await page.setViewportSize({ width: 800, height: 600 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot-05-small-window.png', fullPage: true });
  console.log('Screenshot 5: Small window');

  // Pencere boyutunu tekrar büyüt
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot-06-large-window.png', fullPage: true });
  console.log('Screenshot 6: Large window');

  await browser.close();
  console.log('All screenshots saved!');
}

takeScreenshot().catch((error) => {
  console.error(error);
  process.exit(1);
});
