# Masal Haritası

> Dünya klasör değil, **ağdır**.

**Masal Haritası**, Türkçe, tamamen yerel (offline), harita-tabanlı, bağlantılı bir D&D kampanya arşivi ve canlı oyun masası panelidir.

Bu bir VTT (Virtual Tabletop) değil, combat simülatörü değil, D&D Beyond klonu da değil. Amacı, DM'lerin dünyalarını keşfetmek gibi hissetmelerini sağlamak: haritadan mekâna, mekândan NPC'ye, NPC'den fraksiyona, fraksiyondan göreve geçebilmek.

---

## Felsefe

- **Kullanıcı verisi kutsaldır.** Hiçbir şey kaybolmamalı. Silme işlemlerinde onay istenir. Otomatik yedekleme çalışır.
- **Terminal bilmeden kurulsun, başlatılsın, kullanılsın.** `.exe` indir, kur, çalıştır.
- **Her şey açık format:** JSON, Markdown, PNG. Uygulama bozulsa bile kullanıcı klasöründen her şeyi okuyabilsin.
- **İki gerçeklik:** Arşiv = kalıcı dünya. Masa = canlı oyun anı. Biri diğerini bozmaz.
- **LLM/AI yok.** Ama kullanıcı isterse kendi LLM'sine verebileceği temiz metin üretebilir (Bağlam Toplayıcı).
- **%100 Türkçe.** Her UI metni, her buton, her hata mesajı Türkçe.

---

## Neden Tauri?

Bu proje **Tauri (Rust + WebView)** ile geliştirilmiştir. Electron yerine Tauri seçilmesinin nedenleri:

| Kriter | Tauri | Electron |
|--------|-------|----------|
| Installer boyutu | ~5 MB | ~150 MB |
| Bellek kullanımı | ~50 MB | ~300 MB |
| Açılış hızı | Anında | Yavaş |
| Yerel dosya sistemi | Doğal entegrasyon | IPC karmaşası |
| Güvenlik | Rust'ın bellek güvenliği | Daha fazla attack surface |

Kullanıcı arkadaşına "indir, kur, çalıştır" diyecek kadar basit bir deneyim istedi. 150 MB installer bu deneyimi bozardı.

---

## Özellikler

### Arşiv Modu — Dünya Oluşturma
- **Hiyerarşik dünya ağacı:** Dünya > Bölge > Şehir > Mahalle > Mekân > Oda
- **Harita ve pinler:** PNG/JPG/WebP harita yükleme, zoom, pan, pin atma (Mekân, NPC, Görev, POI, Tehlike, Gizli)
- **12 kayıt türü:** Mekân, NPC, Fraksiyon, Din, Kültür, Eşya, Görev, Söylenti, Olay, Lore, Harita, El Notu
- **Bağlantı sistemi:** Kayıtlar birbirine bağlanabilir, ağ görünümü
- **Bağlam Toplayıcı:** Seçili kayıt ve bağlantılarının derlenmiş, kopyalanabilir metni
- **Global arama:** Ctrl+K ile hızlı kayıt bulma

### Masa Modu — Canlı Oyun
- **Parti özeti:** Karakterler, can barları, durum ikonları
- **Sahne yönetimi:** Aktif konum, oyuncuya okunacak metin, oturum notları
- **Karakter kartı:** Can, AC, envanter, yetenekler, kullanım hakları
- **Kullanım Hakkı takibi:** Kısa/Uzun dinlenme resetleri
- **Zar butonları:** d4, d6, d8, d10, d12, d20, d100
- **Görev takibi:** Aktif ve tamamlanan görevler

### Veri ve Güvenlik
- **Kampanya = bir klasör:** JSON + Markdown + asset'ler
- **Atomik yazma:** Geçici dosyaya yaz, sonra taşı (bozuk dosya koruması)
- **Otomatik yedekleme:** Her kapanışta / saatte `backups/auto/` altına
- **Onay diyalogları:** Silme, uzun dinlenme, karakter ölme gibi kritik işlemlerde

---

## Veri Klasörü Yapısı

```
KampanyaAdı/
  campaign.json                 # Kampanya metadata, ayarlar
  world/
    locations/                  # Mekânlar (hiyerarşik, parent_id ile)
    npcs/
    factions/
    religions/
    cultures/
    items/                      # Eşya şablonları
    quests/                     # Görev şablonları
    rumors/
    events/
    lore/
    handouts/                   # Oyuncuya verilecek metinler
  live/
    party.json                  # Aktif parti, karakterler
    inventory.json              # Canlı envanter
    npc_states.json             # NPC canlı durumları
    quest_states.json           # Görev canlı durumları
    session_state.json          # Şu anki oturum durumu
    usage_tracker.json          # Kullanım hakkı durumları
  sessions/
    session_001.md
    session_002.md
  assets/
    maps/
    portraits/
    handouts/
  backups/
    auto/                       # Otomatik yedekler
```

Her JSON dosyası okunabilir formattadır. Uygulama çökse bile kullanıcı klasörü açıp dosyaları düzenleyebilir.

---

## Geliştirme Kurulumu

### Gereksinimler
- [Node.js](https://nodejs.org/) (v20+)
- [Rust](https://www.rust-lang.org/tools/install) (rustup ile)

### Adımlar

```bash
# 1. Repoyu klonlayın
git clone <repo-url>
cd masal-haritasi

# 2. Frontend bağımlılıklarını kurun
npm install

# 3. Tauri development modunu başlatın
npm run tauri dev
```

Geliştirme modu `http://localhost:1420`'de çalışır ve Tauri penceresi otomatik açılır.

---

## Installer Üretme

```bash
# Windows .exe installer (NSIS)
npm run tauri build
```

Sonuç: `src-tauri/target/release/bundle/nsis/` altında `Masal Haritasi_0.1.0_x64-setup.exe`

Ayrıca MSI ve portable .exe de üretilebilir. `src-tauri/tauri.conf.json`'da `bundle.targets` ayarlanabilir.

---

## Test Etme Adımları

1. **Kampanya oluşturma:** Uygulama açılınca "Yeni Kampanya" formu doldurulur, klasör oluşturulur.
2. **Arşiv Modu:** Sol panelde ağaç görünür, "Yeni" butonu ile kayıt oluşturulur.
3. **Harita:** Orta panelde "Harita Yükle" butonu ile resim yüklenir, zoom/pan çalışır.
4. **Pin:** Haritaya tıklayınca pin atılır, pin kayda bağlanır.
5. **Bağlam Toplayıcı:** Bir kayıt seçilip "Bağlam Topla" butonuna basılır, metin kopyalanır.
6. **Masa Modu:** Toolbar'dan "Masa" moduna geçilir, karakter seçilir, zar atılır.
7. **Dinlenme:** "Kısa Dinlenme" veya "Uzun Dinlenme" butonlarına basılır, kullanım hakları sıfırlanır.
8. **Yedekleme:** Uygulama kapatılıp `backups/auto/` klasörü kontrol edilir.

---

## Bilinen Eksikler / Gelecek Fikirler

### Şu an eksik (MVP sonrası)
- [ ] Gerçek dosya sistemi entegrasyonu (şu an demo veri)
- [ ] Sürükle-bırak harita yükleme
- [ ] Bağlantı ağ görünümü (D3.js/Cytoscape.js)
- [ ] Karşılaştırma / Split View (iki kaydı yan yana)
- [ ] Kronoloji / Tarih çizelgesi
- [ ] Müzik/Ambiyans notları
- [ ] Export: HTML, yazdırılabilir karakter karnesi
- [ ] "Şimdi Ne Olacak?" hazır listesi
- [ ] Karakter oluşturma sihirbazı
- [ ] Envanter yönetimi (drag-drop)
- [ ] Oturum otomatik markdown export

### Teknik borç
- [ ] `resetUsages` store fonksiyonu henüz gerçek reset mantığı uygulamıyor
- [ ] `PinLayer` harita boyutlarına göre normalize edilmeli
- [ ] `ContextCollector` gerçek `archiveStore` bağlantılarıyla entegre edilmeli
- [ ] `CampaignManager` gerçek FS persistence ile bağlanmalı

---

## Lisans

MIT — Kullanıcı verisi kullanıcıya aittir. Kod açık, format açık, dünya senin.

---

*Masal Haritası — D&D dünyan, keşfedilmeyi bekliyor.*
