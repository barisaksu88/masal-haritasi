const { chromium } = require('playwright');
const path = require('path');

async function testPin() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    console.log('Browser opened');

    // App'i aç
    await page.goto('http://localhost:5174/');
    console.log('Page loaded');
    await page.waitForTimeout(2000);

    // Yeni kampanya oluştur
    await page.fill('input[placeholder="Kampanya adını girin..."]', 'Pin Test');
    await page.click('button:has-text("Oluştur")');
    await page.waitForTimeout(2000);
    console.log('Campaign created');

    // Harita yükle
    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(__dirname, 'test-map.png'));
    await page.waitForTimeout(2000);
    console.log('Map loaded');

    // Screenshot 1: Harita yüklendi
    await page.screenshot({ path: 'ss-pin-01-map.png' });
    console.log('SS 1: Map loaded');

    // Yeni kayıt oluştur: Location
    await page.click('button:has-text("Yeni Kayıt Ekle")');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="Kayıt ismi..."]', 'Test Şehir');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Kaydet")');
    await page.waitForTimeout(1000);
    console.log('Record created');

    // Screenshot 2: Kayıt oluşturuldu
    await page.screenshot({ path: 'ss-pin-02-record.png' });
    console.log('SS 2: Record created');

    // Pin ekle butonuna tıkla
    await page.click('button:has-text("Pin Ekle")');
    await page.waitForTimeout(500);
    console.log('Pin add clicked');

    // Haritaya tıkla (CENTER marker'ın olduğu yere)
    const mapBox = await page.locator('img[alt="Harita"]').boundingBox();
    if (mapBox) {
      await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
      console.log('Map clicked at', mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
    }
    await page.waitForTimeout(1000);

    // Screenshot 3: Pin modal açık
    await page.screenshot({ path: 'ss-pin-03-modal.png' });
    console.log('SS 3: Pin modal');

    // Bağlı kayıt seç: "Test Şehir"
    await page.click('button:has-text("Kayıt seçin...")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Test Şehir")');
    await page.waitForTimeout(500);
    console.log('Record selected');

    // Screenshot 4: Kayıt seçildi
    await page.screenshot({ path: 'ss-pin-04-selected.png' });
    console.log('SS 4: Record selected');

    // Ekle butonuna tıkla (modal footer'daki)
    await page.getByRole('button', { name: 'Ekle', exact: true }).click();
    await page.waitForTimeout(1000);
    console.log('Pin saved');

    // Screenshot 5: Pin eklendi
    await page.screenshot({ path: 'ss-pin-05-added.png' });
    console.log('SS 5: Pin added');

    await browser.close();
    console.log('Pin test complete!');
  } catch (err) {
    console.error('TEST ERROR:', err.message);
    console.error(err.stack);
    if (browser) await browser.close();
    process.exit(1);
  }
}

testPin();
