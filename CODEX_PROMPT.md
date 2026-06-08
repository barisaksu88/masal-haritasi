# Codex Bug Fix Prompt — Masal Haritası

## Proje
Tauri v2 + React 19 + TypeScript + Vite + Tailwind + Zustand
Dizin: `C:\Users\Hawk Gaming\Documents\kimi\workspace\masal-haritasi`
Preview: `npm run preview -- --port 5174`

---

## Bug 1: Ana harita pin'i alt haritada görünüyor (KRİTİK — Önceki fix çalışmadı)

### Tespit
Browser'da adım adım test edildi. Sub-map yüklendikten hemen sonra (henüz alt pin eklenmeden) `page.locator('svg[class*="lucide"][class*="map-pin"]').all()` **1 element** döndürüyor. Bu, ana haritadaki pin'in alt haritada da render edildiğini gösteriyor.

### Önceki fix (çalışmadı)
Bir önceki agent `PinLayer.tsx`'te `=== null` yerine `== null` kullandı. Ama test sonucu aynı: sub-map'te 1 pin görünüyor.

### Mevcut PinLayer.tsx (line ~38-45)
```tsx
const visiblePins = pins.filter((pin) => {
  if (activeRegionId == null) {
    return pin.parentRegionId == null;
  }
  return pin.parentRegionId === activeRegionId;
});
```

### Mevcut PinCreator.tsx (line ~201)
```tsx
parentRegionId: activeRegionId ?? undefined,
```

### Hipotezler
1. `PinLayer` Zustand store'dan `activeRegionId`'yi doğru çekmiyor olabilir
2. `MapViewer.tsx`'te `activeRegionId` değiştiğinde `PinLayer` re-render olmuyor olabilir (children prop cloneElement ile sarmalanmış)
3. Pin'lerin `parentRegionId` değeri `undefined` değil, başka bir değer (örn. boş string `""`) olabilir
4. `PinLayer` component'i `useArchiveStore` selector'ü ile `activeRegionId`'yi alıyor ama bu selector stale kalıyor olabilir

### Debug için yapılması gereken
1. `PinLayer.tsx`'e geçici `console.log` ekle:
```tsx
console.log('PinLayer render:', { activeRegionId, pins: pins.map(p => ({id: p.id, parentRegionId: p.parentRegionId, recordId: p.recordId})) });
```
2. `MapViewer.tsx`'te `handleMapClick`'e ve `activeRegionId` değiştiğinde `useEffect`'e log ekle
3. Test et, log çıktısını incele
4. Root cause bulunduktan sonra fix uygula

### Beklenen davranış
- `activeRegionId === null` (dünya haritası): sadece `parentRegionId == null` olan pin'ler görünsün
- `activeRegionId === 'xxx'` (alt harita): sadece `parentRegionId === 'xxx'` olan pin'ler görünsün
- Ana harita pin'i (`parentRegionId: undefined/null`) alt haritada asla görünmemeli

---

## Bug 2: NewRecordDialog — üst bölge otomatik seçili değil

### Tespit
Kullanıcı alt haritadayken (örn. Sub Town) "Yeni Kayıt Ekle"'ye tıklıyor, "Üst Bölge" dropdown'ı boş kalıyor.

### Mevcut kod (line ~291)
```tsx
const [parentRegionId, setParentRegionId] = useState<string>(activeRegionId ?? "");

useEffect(() => {
  if (isOpen) {
    setParentRegionId(activeRegionId ?? "");
  }
}, [isOpen, activeRegionId]);
```

### Önceki fix
Bir önceki agent `wasOpenRef` kullanarak sadece dialog açıldığında sync etti. Ama bu fix test edilemedi (timeout yüzünden).

### Beklenen davranış
Kullanıcı alt haritadayken "Yeni Kayıt Ekle"'ye tıkladığında, "Üst Bölge" dropdown'ı otomatik olarak mevcut aktif bölgeyi (örn. "Sub Town") göstermeli.

---

## Bug 3: Preview server'da eski kampanyalar görünmüyor

### Tespit
`vite preview --port 5174` her başladığında "Henüz kampanya yok". Test script'leri yeni kampanya oluşturuyor ama server yeniden başlayınca veri kayboluyor.

### Not
Bu muhtemelen Tauri filesystem API'lerinin browser preview'da çalışmamasından kaynaklanıyor. Uygulama muhtemelen `localStorage` veya benzeri bir mock kullanıyor. Bu bir test altyapısı sorunu, kod bug'ı değil. Ama test script'leri için: test başlamadan önce mevcut kampanyaları listelemek gerekir.

**Bu bug'ı fix etmeye çalışma**, sadece not olarak bırak.

---

## Test Senaryosu (Browser'da manuel)

1. `npm run preview -- --port 5174` başlat
2. Yeni kampanya oluştur
3. Harita yükle (test-map.png, 800x600)
4. Location kaydı oluştur: "Main City"
5. Pin ekle (Main City'ye bağla) — bu ana harita pin'i
6. Alt location oluştur: "Sub Town", üst bölge: Main City
7. Sub Town'a tıkla (drill-down)
8. Sub Town'a harita yükle
9. **KONTROL:** Ana harita pin'i (mavi) burada görünmemeli
10. Sub Town'da NPC kaydı oluştur: "Town NPC"
11. Sub Town'da NPC pin ekle
12. Dünya haritasına dön (Çık x2)
13. **KONTROL:** Sadece Main City pin'i görünmeli, Town NPC görünmemeli
14. Tekrar Sub Town'a git
15. **KONTROL:** Sadece Town NPC görünmeli
16. Sub Town'dayken "Yeni Kayıt Ekle"'ye tıkla
17. **KONTROL:** "Üst Bölge" dropdown'ında "Sub Town" otomatik seçili olmalı

---

## Dosyalar

- `src/components/archive/PinLayer.tsx` — pin filtreleme (BUG 1)
- `src/components/archive/MapViewer.tsx` — PinLayer render, activeRegionId (BUG 1)
- `src/components/common/NewRecordDialog.tsx` — parentRegionId state (BUG 2)
- `src/stores/archiveStore.ts` — Zustand store
- `src/types/index.ts` — Pin interface

---

## Önemli Notlar

- **Tauri WebView2:** Native `<select>` çalışmıyor, custom div-based dropdown kullanılıyor
- **Koordinat sistemi:** Pin koordinatları `naturalWidth/naturalHeight` uzayında
- **Build verify:** Her değişiklik sonrası `npm run build` çalıştır
- **Test:** `node test-harness.cjs` veya browser'da manuel test

---

## İstenen Output

1. Root cause analizi (log çıktıları ile)
2. Fix'lenmiş kod
3. `npm run build` geçti mi?
4. Test sonuçları (screenshot veya log)
