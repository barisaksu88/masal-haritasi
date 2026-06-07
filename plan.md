# MASAL HARİTASI — Proje Planı

## Vizyon
Dünya klasör değil, ağdır. Türkçe, tamamen yerel (offline), harita-tabanlı, bağlantılı bir D&D kampanya arşivi ve canlı oyun masası paneli.

## Teknoloji Seçimi

**Tauri (Rust + WebView)** seçildi. Neden:
- ~5MB installer (Electron'a göre ~150MB çok daha hafif)
- Çok daha hızlı açılış
- Yerel dosya sistemiyle doğal çalışma (kampanya klasörü = doğal dosya I/O)
- Windows'da native performans
- Kullanıcı terminal bilmiyor — küçük installer kritik

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
**State:** Zustand (hafif, TypeScript dostu)
**Routing:** React Router (modlar arası geçiş)
**Harita:** Leaflet (açık kaynak, offline tile desteği, pin/overlay zenginliği)
**Ağ Grafiği:** Cytoscape.js veya D3.js (opsiyonel, bağlantı görselleştirme)

## Proje Yapısı

```
masal-haritasi/
  src/
    App.tsx                 # Ana uygulama, mod geçişi
    main.tsx                # Entry point
    components/
      layout/               # Ana layout bileşenleri
        AppLayout.tsx       # Arşiv/Masa mod layout'u
        ArchiveLayout.tsx   # 3-panel arşiv layout
        TableLayout.tsx     # 3-panel masa layout
      archive/              # Arşiv Modu bileşenleri
        WorldTree.tsx       # Sol panel hiyerarşik ağaç
        MapViewer.tsx       # Orta alan harita görüntüleyici
        PinLayer.tsx        # Harita pin katmanı
        RecordDetail.tsx    # Sağ panel kayıt detayları
        RecordForm.tsx      # Kayıt oluşturma/düzenleme formu
        ConnectionGraph.tsx # Bağlantı ağ görünümü
        ContextCollector.tsx # Bağlam toplayıcı
        SearchPalette.tsx   # Global arama (Ctrl+K)
      table/                # Masa Modu bileşenleri
        PartySummary.tsx    # Sol panel parti özeti
        SceneViewer.tsx     # Orta alan sahne
        CharacterCard.tsx   # Sağ panel karakter kartı
        NPCLiveState.tsx      # NPC canlı durum
        QuestTracker.tsx      # Görev takibi
        SessionNotes.tsx      # Oturum notları
        DiceRoller.tsx        # Zar butonları
        UsageTracker.tsx      # Kullanım hakkı takibi
        RestButtons.tsx       # Dinlenme butonları
      common/               # Ortak bileşenler
        ConfirmDialog.tsx   # Onay diyaloğu
        Toast.tsx             # Bildirimler
        Toolbar.tsx           # Araç çubuğu
        TagInput.tsx          # Etiket girişi
        ImageUploader.tsx     # Resim yükleme
    stores/                 # Zustand stores
      campaignStore.ts      # Kampanya durumu
      archiveStore.ts       # Arşiv verisi
      tableStore.ts         # Masa modu verisi
      uiStore.ts            # UI durumu
    types/                  # TypeScript tipleri
      index.ts              # Tüm tipler
    hooks/                  # Custom hooks
      useFileSystem.ts      # Tauri FS API wrapper
      useBackup.ts          # Yedekleme hook'u
      useSearch.ts          # Arama hook'u
    utils/                  # Yardımcı fonksiyonlar
      fileUtils.ts          # Dosya işlemleri
      backupUtils.ts        # Yedekleme
      contextBuilder.ts     # Bağlam toplayıcı
    styles/                 # Global stiller
      globals.css           # Tailwind + tema değişkenleri
  src-tauri/                # Rust backend
    src/
      main.rs               # Tauri entry point
    Cargo.toml              # Rust bağımlılıkları
    tauri.conf.json         # Tauri konfigürasyon
  design/                   # Tasarım dokümanları
    design.md               # Global tasarım sistemi
    archive.md              # Arşiv modu tasarımı
    table.md                # Masa modu tasarımı
  public/                   # Statik asset'ler
  package.json
  vite.config.ts
  tailwind.config.js
  tsconfig.json
```

## Veri Yapısı (Kampanya Klasörü)

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

## Aşamalar (Stages)

### Stage 1 — Altyapı ve Tasarım
- Rust kurulumu (eğer gerekirse)
- Tauri + React + TS + Tailwind scaffold
- Git init, baseline commit
- Tema değişkenleri (dark mode)
- Global layout bileşenleri
- TypeScript tipleri
- Zustand store yapısı
- Tauri FS API entegrasyonu

### Stage 2 — Arşiv Modu Temeli
- Sol panel: Dünya ağacı (hiyerarşik tree)
- Orta alan: Harita yükleme, zoom, pan
- Sağ panel: Kayıt detayları (Mekân, NPC)
- Pin sistemi: Haritaya pin atma, pin-kayıt bağlantısı
- Global arama (Ctrl+K)
- Kayıt oluşturma/düzenleme

### Stage 3 — Bağlantılar ve Bağlam
- Kayıtlar arası bağlantı sistemi
- Bağlantı ağ görünümü (basit)
- Bağlam Toplayıcı (LLM metin derleyici)
- Etiket sistemi
- Favori kayıtlar

### Stage 4 — Masa Modu Temeli
- Mod geçişi (Arşiv ↔ Masa)
- Sol panel: Parti özeti
- Orta alan: Sahne görünümü
- Sağ panel: Karakter kartı, NPC canlı durum
- Kullanım Hakkı sistemi
- Dinlenme butonları
- Zar butonları

### Stage 5 — Oturum ve Yedekleme
- Oturum başlat/sonlandır
- Otomatik yedekleme
- Oturum notları (markdown)
- Hata yönetimi ve geri yükleme
- Sistem günlüğü paneli

### Stage 6 — README ve Installer
- README.md (Türkçe)
- Tauri builder konfigürasyonu
- .exe installer üretimi
- Son kontroller

## Sub-Agent Görev Dağılımı

| Agent | Rol | Görev |
|-------|-----|-------|
| Altyapı | Coder | Stage 1: Tauri scaffold, tema, tipler, store'lar |
| Arşiv_UI | Coder | Stage 2: Arşiv modu bileşenleri |
| Masa_UI | Coder | Stage 4: Masa modu bileşenleri |
| Bağlantı_Sistem | Coder | Stage 3: Bağlantılar, bağlam toplayıcı |
| Oturum_Yedek | Coder | Stage 5: Oturum, yedekleme, hata yönetimi |

## Kabul Kriterleri

1. Uygulama açılıyor, yeni kampanya oluşturuluyor, klasörde saklanıyor.
2. Arşiv Modunda: konum, NPC, fraksiyon, eşya, görev oluşturulabiliyor.
3. Harita resmi yüklenebiliyor, pin atılabiliyor, pin kayda bağlanabiliyor.
4. Kayıtlar birbirine bağlanabiliyor, bağlantılı kayıtlar görülebiliyor.
5. Bağlam Toplayıcı temiz, kopyalanabilir Türkçe metin üretiyor.
6. Masa Modunda karakter oluşturulabiliyor, envanter eklenebiliyor.
7. Kullanım hakkı, kısa/uzun dinlenme takibi çalışıyor.
8. Aktif görev ve oturum notu tutulabiliyor.
9. Otomatik yedekleme çalışıyor.
10. `.exe` installer üretilebiliyor, terminal bilmeyen kullanıcı kurup açabiliyor.
