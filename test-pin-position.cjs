const { chromium } = require('playwright');
const path = require('path');

async function measurePin(page, label) {
  const map = page.locator('img[alt="Harita"]');
  const mapBox = await map.boundingBox();
  const pinBox = await map.locator('xpath=..').locator('button[title="Mekân"]').boundingBox();
  if (!mapBox || !pinBox) throw new Error(`${label}: map or pin geometry is unavailable`);

  const relativeX = (pinBox.x + pinBox.width / 2 - mapBox.x) / mapBox.width;
  const relativeY = (pinBox.y + pinBox.height - mapBox.y) / mapBox.height;
  console.log(`${label}: pin=(${relativeX.toFixed(3)}, ${relativeY.toFixed(3)})`);

  if (Math.abs(relativeX - 0.3) > 0.03 || Math.abs(relativeY - 0.4) > 0.03) {
    throw new Error(`${label}: pin moved away from its map-relative coordinate`);
  }
}

async function testPinPosition() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);

  await page.fill('input[placeholder="Kampanya adını girin..."]', 'Pin Position Test');
  await page.click('button:has-text("Oluştur")');
  await page.waitForTimeout(2000);

  await page.locator('input[type="file"]').first().setInputFiles(path.join(__dirname, 'test-map.png'));
  await page.waitForTimeout(2000);

  await page.click('button:has-text("Yeni Kayıt Ekle")');
  await page.fill('input[placeholder="Kayıt ismi..."]', 'Position City');
  await page.click('button:has-text("Kaydet")');
  await page.waitForTimeout(1000);

  await page.click('button:has-text("Pin Ekle")');
  const mapBox = await page.locator('img[alt="Harita"]').boundingBox();
  if (!mapBox) throw new Error('Map image is not visible');
  await page.mouse.click(
    mapBox.x + mapBox.width * 0.3,
    mapBox.y + mapBox.height * 0.4
  );

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Kayıt seçin...', exact: true }).click();
  await dialog.getByRole('button', { name: /Position City/ }).click();
  await dialog.getByRole('button', { name: 'Ekle', exact: true }).click();
  await page.waitForTimeout(1000);

  await measurePin(page, '1280x720');
  await page.screenshot({ path: 'screenshot-large-with-pin.png' });

  await page.setViewportSize({ width: 800, height: 600 });
  await page.waitForTimeout(1000);
  await measurePin(page, '800x600');
  await page.screenshot({ path: 'screenshot-small-with-pin.png' });

  await page.setViewportSize({ width: 600, height: 400 });
  await page.waitForTimeout(1000);
  await measurePin(page, '600x400');
  await page.screenshot({ path: 'screenshot-tiny-with-pin.png' });

  await browser.close();
  console.log('Pin position test complete!');
}

testPinPosition().catch((error) => {
  console.error(error);
  process.exit(1);
});
