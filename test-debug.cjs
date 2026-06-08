const { chromium } = require('playwright');
const path = require('path');

async function debugTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);

  // Kampanya oluştur
  await page.fill('input[placeholder="Kampanya adını girin..."]', 'Debug Test');
  await page.click('button:has-text("Oluştur")');
  await page.waitForTimeout(2000);

  // Harita yükle
  const fileInput = await page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(path.join(__dirname, 'test-map.png'));
  await page.waitForTimeout(2000);

  // Location oluştur
  await page.click('button:has-text("Yeni Kayıt Ekle")');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Kayıt ismi..."]', 'Test City');
  await page.click('button:has-text("Kaydet")');
  await page.waitForTimeout(1000);

  // Pin ekle
  await page.click('button:has-text("Pin Ekle")');
  await page.waitForTimeout(500);

  const mapBox = await page.locator('img[alt="Harita"]').boundingBox();
  if (!mapBox) throw new Error('Map image is not visible');
  await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  await page.waitForTimeout(500);

  // Butonları listele
  const buttons = await page.locator('button').all();
  console.log('Buttons on page:');
  for (const btn of buttons) {
    const text = await btn.textContent();
    const visible = await btn.isVisible();
    console.log(`  [${visible ? 'V' : 'H'}] "${text?.trim().substring(0, 50)}"`);
  }

  // "Kayıt seçin..." butonunu bul
  const kayitBtn = await page.locator('button:has-text("Kayıt seçin...")').first();
  const isVisible = await kayitBtn.isVisible();
  console.log('\n"Kayıt seçin..." visible:', isVisible);
  if (!isVisible) throw new Error('Pin creator did not open after clicking the map');

  await page.screenshot({ path: 'ss-debug.png' });
  console.log('Screenshot saved: ss-debug.png');

  await browser.close();
}

debugTest().catch((error) => {
  console.error(error);
  process.exit(1);
});
