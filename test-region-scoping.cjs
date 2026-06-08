const { chromium } = require("playwright");
const path = require("path");

async function mapPinCounts(page, label) {
  const rawMapPinIcons = page.locator(
    'svg[class*="lucide"][class*="map-pin"]'
  );
  const renderedLocationPins = page.locator('[data-map-pin-id][data-pin-type="location"]');
  const renderedNpcPins = page.locator('[data-map-pin-id][data-pin-type="npc"]');

  const rawCount = await rawMapPinIcons.count();
  const locationCount = await renderedLocationPins.count();
  const npcCount = await renderedNpcPins.count();
  const rawIconParents = await rawMapPinIcons.evaluateAll((icons) =>
    icons.map((icon) => {
      const button = icon.closest("button");
      return {
        buttonText: button?.textContent?.trim() ?? null,
        title: button?.getAttribute("title") ?? null,
      };
    })
  );

  console.log(`${label}:`, {
    rawCount,
    locationCount,
    npcCount,
    rawIconParents,
  });

  return { rawCount, locationCount, npcCount };
}

async function createRecord(page, name, type = "location", parentName) {
  await page.click('button:has-text("Yeni Kayıt Ekle")');
  if (type !== "location") {
    await page.selectOption("select", type);
  }
  if (parentName) {
    await page.click('button:has-text("Bölge seçin...")');
    await page.getByRole("button", { name: new RegExp(parentName) }).click();
  }
  await page.fill('input[placeholder="Kayıt ismi..."]', name);
  await page.click('button:has-text("Kaydet")');
  await page.waitForTimeout(500);
}

async function addPin(page, recordName, pinType = "location", x = 0.5, y = 0.5) {
  await page.click('button:has-text("Pin Ekle")');
  const mapBox = await page.locator('img[alt="Harita"]').boundingBox();
  if (!mapBox) throw new Error("Map image is not visible");
  await page.mouse.click(mapBox.x + mapBox.width * x, mapBox.y + mapBox.height * y);

  const dialog = page.getByRole("dialog");
  if (pinType !== "location") {
    await dialog
      .getByRole("button", {
        name: pinType === "npc" ? "NPC" : pinType,
        exact: true,
      })
      .click();
  }
  await dialog.getByRole("button", { name: "Kayıt seçin...", exact: true }).click();
  await dialog.getByRole("button", { name: new RegExp(recordName) }).click();
  await dialog.getByRole("button", { name: "Ekle", exact: true }).click();
  await page.waitForTimeout(500);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  await page.goto("http://localhost:5174/");
  await page.fill(
    'input[placeholder="Kampanya adını girin..."]',
    "Region Scope Test"
  );
  await page.click('button:has-text("Oluştur")');
  await page.waitForTimeout(1000);

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(__dirname, "test-map.png"));
  await page.waitForTimeout(1000);

  await createRecord(page, "Main City");
  await addPin(page, "Main City");

  const worldBefore = await mapPinCounts(page, "world after location pin");
  if (worldBefore.locationCount !== 1 || worldBefore.npcCount !== 0) {
    throw new Error("World map did not show exactly the location pin");
  }

  await createRecord(page, "Sub Town", "location", "Main City");
  await page.click('button:has-text("Mekânlar")');
  await page.locator('.pl-7 button:has-text("Main City")').first().click();
  await page.locator('.pl-7 button:has-text("Sub Town")').first().click();
  await page.waitForTimeout(500);

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles(path.join(__dirname, "test-map.png"));
  await page.waitForTimeout(1000);

  const subBefore = await mapPinCounts(page, "sub-map before npc pin");
  if (subBefore.locationCount !== 0 || subBefore.npcCount !== 0) {
    throw new Error("World pin leaked into the sub-map");
  }
  if (subBefore.rawCount !== 1) {
    throw new Error("Diagnostic assumption changed: expected one control icon");
  }

  await page.click('button:has-text("Yeni Kayıt Ekle")');
  const parentTrigger = page.locator('button:has-text("Sub Town (Mekân)")');
  await parentTrigger.waitFor({ state: "visible" });
  if (!(await parentTrigger.isVisible())) {
    console.log(
      "New record dialog buttons:",
      await page
        .locator("button")
        .evaluateAll((buttons) =>
          buttons
            .filter((button) => button.offsetParent !== null)
            .map((button) => button.textContent?.trim())
        )
    );
    throw new Error("Active sub-region was not preselected in NewRecordDialog");
  }
  console.log("NewRecordDialog parent preselected: Sub Town");

  await page.selectOption("select", "npc");
  await page.fill('input[placeholder="Kayıt ismi..."]', "Town NPC");
  await page.click('button:has-text("Kaydet")');
  await page.waitForTimeout(500);

  await addPin(page, "Town NPC", "npc", 0.3, 0.3);
  const subAfter = await mapPinCounts(page, "sub-map after npc pin");
  if (subAfter.locationCount !== 0 || subAfter.npcCount !== 1) {
    throw new Error("Sub-map did not show exactly the NPC pin");
  }

  await page.locator('button:has-text("Çık")').first().click();
  await page.waitForTimeout(500);
  const worldAfter = await mapPinCounts(page, "world after returning");
  if (worldAfter.locationCount !== 1 || worldAfter.npcCount !== 0) {
    throw new Error("Sub-map NPC pin leaked into the world map");
  }

  await page.locator('.pl-7 button:has-text("Main City")').first().click();
  await page.locator('.pl-7 button:has-text("Sub Town")').first().click();
  await page.waitForTimeout(500);
  const subAfterReturn = await mapPinCounts(page, "sub-map after re-entering");
  if (subAfterReturn.locationCount !== 0 || subAfterReturn.npcCount !== 1) {
    throw new Error("Sub-map pin scope changed after navigation");
  }

  await page.click('button:has-text("Yeni Kayıt Ekle")');
  await page
    .locator('button[data-selected-record-id]:has-text("Sub Town (Mekân)")')
    .waitFor({ state: "visible" });
  console.log("NewRecordDialog parent remains preselected after navigation");
  await page.getByRole("dialog").getByRole("button", { name: "İptal" }).click();

  await browser.close();
  console.log("Region scoping test complete!");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
