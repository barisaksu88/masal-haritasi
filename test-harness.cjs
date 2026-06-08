const { chromium } = require('playwright');
const path = require('path');

async function runFullTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const screenshots = [];
  async function ss(name) {
    const file = `ss-harness-${String(screenshots.length + 1).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: file });
    screenshots.push(file);
    console.log(`SS: ${name}`);
  }

  // ========== 1. APP AÇ ==========
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);
  await ss('01-app-open');

  // ========== 2. KAMPANYA OLUŞTUR ==========
  await page.fill('input[placeholder="Kampanya adını girin..."]', 'Hierarchy Test');
  await page.click('button:has-text("Oluştur")');
  await page.waitForTimeout(2000);
  await ss('02-campaign-created');

  // ========== 3. ANA HARİTA YÜKLE ==========
  const fileInput = await page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(path.join(__dirname, 'test-map.png'));
  await page.waitForTimeout(2000);
  await ss('03-world-map-loaded');

  // ========== 4. ANA HARİTAYA PIN EKLE ==========
  // Önce location kaydı oluştur
  await page.click('button:has-text("Yeni Kayıt Ekle")');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Kayıt ismi..."]', 'Ana Şehir');
  await page.click('button:has-text("Kaydet")');
  await page.waitForTimeout(1000);

  // Pin ekle
  await page.click('button:has-text("Pin Ekle")');
  await page.waitForTimeout(500);
  const mapBox = await page.locator('img[alt="Harita"]').boundingBox();
  if (mapBox) {
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  }
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Kayıt seçin...")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Ana Şehir")');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Ekle', exact: true }).click();
  await page.waitForTimeout(1000);
  await ss('04-world-pin-added');

  // ========== 5. ALT LOCATION OLUŞTUR ==========
  await page.click('button:has-text("Yeni Kayıt Ekle")');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Kayıt ismi..."]', 'Alt Kasaba');
  // Üst bölge olarak Ana Şehir'i seç
  await page.click('button:has-text("Bölge seçin...")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Ana Şehir")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Kaydet")');
  await page.waitForTimeout(1000);
  await ss('05-sub-location-created');

  // ========== 6. ALT HARİTAYA GİT ==========
  // Önce "Mekânlar" grubunu expand et
  await page.click('button:has-text("Mekânlar")');
  await page.waitForTimeout(500);
  // "Ana Şehir" butonuna tıkla (sol panelde, WorldTree içinde)
  await page.locator('.pl-7 button:has-text("Ana Şehir")').first().click();
  await page.waitForTimeout(1000);
  await ss('06-entered-ana-sehir');

  // "Alt Kasaba" butonuna tıkla (sol panelde, Ana Şehir'in altında)
  await page.locator('.pl-7 button:has-text("Alt Kasaba")').first().click();
  await page.waitForTimeout(1000);
  await ss('07-entered-alt-kasaba');

  // ========== 7. ALT HARİTAYA HARİTA YÜKLE ==========
  // Alt Kasaba'nın haritası yok, "Harita Yükle" butonu gözükmeli
  const altFileInput = await page.locator('input[type="file"]').first();
  await altFileInput.setInputFiles(path.join(__dirname, 'test-map.png'));
  await page.waitForTimeout(2000);
  await ss('08-sub-map-loaded');

  // ========== 8. ALT HARİTAYA PIN EKLE ==========
  // Önce alt kasaba için NPC kaydı oluştur
  await page.click('button:has-text("Yeni Kayıt Ekle")');
  await page.waitForTimeout(500);
  await page.selectOption('select', 'npc');
  await page.fill('input[placeholder="Kayıt ismi..."]', 'Kasaba NPC');
  await page.click('button:has-text("Kaydet")');
  await page.waitForTimeout(1000);

  // Pin ekle (NPC türü seç)
  await page.click('button:has-text("Pin Ekle")');
  await page.waitForTimeout(500);
  const subMapBox = await page.locator('img[alt="Harita"]').boundingBox();
  if (subMapBox) {
    // Farklı bir noktaya tıkla (sol üst)
    await page.mouse.click(subMapBox.x + subMapBox.width * 0.3, subMapBox.y + subMapBox.height * 0.3);
  }
  await page.waitForTimeout(1000);
  // Dialog açıldıktan sonra pin türünü NPC yap.
  await page.getByRole('dialog').getByRole('button', { name: 'NPC', exact: true }).click();
  await page.waitForTimeout(200);
  await page.click('button:has-text("Kayıt seçin...")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Kasaba NPC")');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Ekle', exact: true }).click();
  await page.waitForTimeout(1000);
  await ss('09-sub-pin-added');

  // ========== 9. ANA HARİTAYA DÖN ==========
  await page.locator('button:has-text("Çık")').first().click();
  await page.waitForTimeout(1000);
  await ss('10-back-to-world-map');

  // ========== 10. TEKRAR ALT HARİTAYA GİT ==========
  await page.locator('.pl-7 button:has-text("Ana Şehir")').first().click();
  await page.waitForTimeout(1000);
  await page.locator('.pl-7 button:has-text("Alt Kasaba")').first().click();
  await page.waitForTimeout(1000);
  await ss('11-back-to-sub-map');

  // ========== 11. PENCERE RESIZE TESTİ ==========
  await page.setViewportSize({ width: 800, height: 600 });
  await page.waitForTimeout(1500);
  await ss('12-resize-800x600');

  await page.setViewportSize({ width: 600, height: 400 });
  await page.waitForTimeout(1500);
  await ss('13-resize-600x400');

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(1500);
  await ss('14-resize-back');

  await browser.close();
  console.log('\n=== TEST TAMAMLANDI ===');
  console.log('Screenshots:');
  screenshots.forEach((s) => console.log(`  ${s}`));
}

runFullTest().catch((err) => {
  console.error('TEST FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
