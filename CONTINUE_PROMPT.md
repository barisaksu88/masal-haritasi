# Masal Haritası — Devam Promptu

## Çalışma Metodu (Kritik)

**Senin rolün: Kullanıcı. Kod yazmak YOK (çok basit tek satır düzeltmeler hariç, mantık çerçevesinde).**

1. **App'i aç** → Playwright ile otomatik kullan
2. **Her butonu, her fonksiyonu test et** → Sadece "çalışıyor / çalışmıyor" olarak raporla, sebep sorgulama
3. **Sorun bulursan:**
   - **10 dk içinde çözülebilirse** → Agent çağır, sorun raporunu ver, o kodu yazsın, sen tekrar test et
   - **10 dk'dan uzunsa** → Kullanıcıya (Sam) detaylı prompt ver, o manuel olarak Kimi Code / Codex'e iletsin
4. **Tekrarla** → Fix sonrası tekrar test et

**Asla uzun düşünme, asla derinlemesine analiz yapma, asla kod yazma.** Sadece tespit et ve raporla.

---

## Proje Özeti

**Masal Haritası** — Tauri v2 + React 19 + TypeScript + Vite + Tailwind + Zustand.

**Çalışma dizini:** `C:\Users\Hawk Gaming\Documents\kimi\workspace\masal-haritasi`

**Build:** `npm run tauri build` (Rust/Cargo PATH'e eklenmeli)
**Test:** `npm run preview -- --port 5174` + Playwright test script'leri
**Node:** `C:\Users\Hawk Gaming\AppData\Local\Programs\kimi-desktop\resources\resources\runtime\npm.cmd`

---

## Çözülen Bug'lar (Geçmiş)

| # | Bug | Dosya | Durum |
|---|-----|-------|-------|
| 1 | Harita resize | MapViewer.tsx | ✅ |
| 2 | Zoom merkezi | MapViewer.tsx | ✅ |
| 3 | Pin hiyerarşik filtreleme | PinLayer.tsx | ✅ |
| 4 | Pin modal açılmama | MapViewer.tsx | ✅ |
| 5 | Alt harita üst haritayı değiştirme | MapViewer.tsx + campaignService.ts | ✅ |
| 6 | PinCreator çift bölge seçimi | PinCreator.tsx | ✅ |
| 7 | Pin modal tutarsız açılma | MapViewer.tsx | ✅ |
| 8 | Zoom görsel etki yaratmama | MapViewer.tsx | ✅ |
| 9 | Resize'da harita çok küçük kalma | MapViewer.tsx + ArchiveLayout.tsx | ✅ |
| 10 | Hiyerarşik pin testi | PinLayer.tsx | ✅ |
| 11 | Alt harita yükleme testi | MapViewer.tsx | ✅ |
| 12 | WorldTree navigasyon / breadcrumb | WorldTree.tsx | ✅ |

---

## Açık Sorunlar

*Şu an bilinen açık sorun yok. Tüm test script'leri geçiyor.*

---

## Test Script'leri

| Script | Amaç | Port |
|--------|------|------|
| `test-map-resize.cjs` | Harita resize (1280→800→600→1280) | 5174 |
| `test-zoom.cjs` | Zoom in/out merkez testi | 5174 |
| `test-pin.cjs` | Pin ekleme (basit) | 5174 |
| `test-harness.cjs` | Tam hiyerarşik test | 5174 |
| `test-debug.cjs` | Debug / buton listeleme | 5174 |

**Preview server başlat:**
```bash
cd masal-haritasi
export PATH="$PATH:/c/Users/Hawk Gaming/.cargo/bin"
/c/Users/Hawk Gaming/AppData/Local/Programs/kimi-desktop/resources/resources/runtime/npm.cmd run preview -- --port 5174
```

---

## Önemli Dosyalar

- `src/components/archive/MapViewer.tsx` — Harita render, zoom, pan, pin ekleme
- `src/components/archive/PinLayer.tsx` — Pin render, filtreleme
- `src/components/archive/PinCreator.tsx` — Pin modal
- `src/components/layout/ArchiveLayout.tsx` — 3-panel layout
- `src/components/archive/WorldTree.tsx` — Hiyerarşik kayıt listesi
- `src/components/archive/RecordDetail.tsx` — Kayıt detay (alt harita yükleme)
- `src/stores/archiveStore.ts` — Zustand store
- `src/services/campaignService.ts` — Kampanya CRUD, harita kaydetme
- `test-map.png` — 800×600 test haritası

---

## Teknik Notlar

- **Tauri WebView2:** Native `<select>` çalışmıyor, custom div-based dropdown kullan
- **Koordinat sistemi:** Pin koordinatları `naturalWidth/naturalHeight` uzayında
- **File input:** `<label>` wrapper ile çalışır
- **Build path:** Git Bash'de `pwd -W` kullan
- **Port:** Preview server 5174'te çalışıyor
