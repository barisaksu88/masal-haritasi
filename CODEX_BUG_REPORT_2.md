# Bug Raporu — Masal Haritası (Codex İçin)

## Bug 1: Ana harita pin'i alt haritada görünüyor (KRİTİK)

**Tespit:** Browser'da adım adım test edildi. Sub-map yüklendikten hemen sonra (henüz alt pin eklenmeden) `page.locator('svg[class*="lucide"][class*="map-pin"]').all()` 1 element döndürdü. Bu, ana haritadaki pin'in alt haritada da render edildiğini gösteriyor.

**Dosya:** `src/components/archive/PinLayer.tsx`

**Mevcut filtre (line ~38-45):**
```tsx
const visiblePins = pins.filter((pin) => {
  if (activeRegionId === null) {
    return !pin.parentRegionId;
  }
  return pin.parentRegionId === activeRegionId;
});
```

**Not:** `!pin.parentRegionId` falsy değerleri (undefined, null, "", 0) hepsi false yapar. Ama pin'in `parentRegionId` değeri nasıl kaydediliyor? `PinCreator.tsx`'te `parentRegionId: activeRegionId ?? undefined` olarak set ediliyor. Eğer `activeRegionId` null ise `undefined` olur. `!undefined` = true, doğru çalışmalı. Ama test sonucu gösteriyor ki çalışmıyor.

**Olası sebep:** `PinLayer` component'i `activeRegionId` prop olarak almıyor, `useArchiveStore`'dan çekiyor. Ama `MapViewer.tsx`'te `activeRegionId` değiştiğinde `PinLayer` re-render olmayabilir? Veya `pins` array'indeki pin'lerin `parentRegionId` değeri beklenenden farklı olabilir.

**Fix yönü:** 
1. `PinLayer`'da `visiblePins` hesaplamasına `console.log` ekle: `console.log('activeRegionId:', activeRegionId, 'pins:', pins.map(p => ({id: p.id, parentRegionId: p.parentRegionId})))`
2. Veya `visiblePins` hesaplamasını daha açık hale getir: `pin.parentRegionId === undefined || pin.parentRegionId === null` yerine `pin.parentRegionId == null` kullan (loose equality hem null hem undefined yakalar).
3. Ama asıl sorun: `MapViewer.tsx`'te `activeRegionId` değiştiğinde `PinLayer`'ın re-render olup olmadığını kontrol et. `children` prop'u `useMemo` veya `useCallback` ile sarmalanmış olabilir, bu da `PinLayer`'ın re-render'ını engelliyor olabilir.

## Bug 2: Eski kampanyalar preview server'da görünmüyor

**Tespit:** Preview server (`vite preview --port 5174`) her başladığında "Henüz kampanya yok". Test script'leri yeni kampanya oluşturuyor ama server yeniden başlayınca veri kayboluyor.

**Not:** Bu preview server'ın doğası — Tauri filesystem API'leri browser preview'da çalışmıyor, localStorage kullanılıyor olabilir ama o da session-based olabilir. Bu bir test altyapısı sorunu, kod bug'ı değil. Ama test script'leri için: test başlamadan önce mevcut kampanyaları listelemek gerekir.

## Bug 3: Alt haritada yeni kayıt — üst bölge otomatik seçili değil

**Tespit:** `NewRecordDialog.tsx`'te `parentRegionId` state'i `useState(activeRegionId ?? "")` ile başlatılıyor. Ama `activeRegionId` değiştiğinde bu state güncellenmiyor. Kullanıcı alt haritadayken (örn. Sub Town) "Yeni Kayıt Ekle"'ye tıklarsa, `parentRegionId` hâlâ önceki değerde kalıyor.

**Mevcut kod (NewRecordDialog.tsx line ~291):**
```tsx
const [parentRegionId, setParentRegionId] = useState<string>(activeRegionId ?? "");
```

**Fix:** `useEffect` ile `isOpen` değiştiğinde `parentRegionId`'yi `activeRegionId`'ye senkronize et. Ama dikkat: kullanıcı manuel değiştirebilsin, sadece dialog açıldığında senkronize olmalı.

```tsx
useEffect(() => {
  if (isOpen) {
    setParentRegionId(activeRegionId ?? "");
  }
}, [isOpen, activeRegionId]);
```

Bu fix önceki turda uygulanmıştı ama test edilemedi (timeout yüzünden). Doğru çalışıp çalışmadığı Codex tarafından verify edilmeli.

## Bug 4: WorldTree boş kategoriler hâlâ görünüyor olabilir

**Tespit:** `WorldTree.tsx`'te `hasItems` false ise `return null` yapılmıştı. Ama test sırasında timeout yüzünden bu kısım verify edilemedi.

## Test Notu

Preview server port 5174'te çalışıyor. Test script'leri `test-*.cjs` dosyaları. Browser'da manuel test yaparken:
1. Kampanya oluştur
2. Harita yükle
3. Location kaydı oluştur + pin ekle (ana harita)
4. Alt location oluştur, harita yükle
5. Alt haritaya gir — ana pin görünmemeli
6. Alt haritada yeni kayıt oluştur — üst bölge otomatik seçili olmalı

## Dosyalar

- `src/components/archive/PinLayer.tsx` — pin filtreleme
- `src/components/archive/MapViewer.tsx` — PinLayer render, activeRegionId prop geçişi
- `src/components/common/NewRecordDialog.tsx` — parentRegionId state
- `src/components/archive/WorldTree.tsx` — boş kategori gizleme
