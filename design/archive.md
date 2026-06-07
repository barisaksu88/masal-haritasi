# Arşiv Modu Tasarımı

## Amaç
Dünya inşa etmek. Sol panelde hiyerarşik ağaç, ortada harita, sağda detaylar.

## Sol Panel — Dünya Ağacı

### Yapı
- Başlık: "DÜNYA AĞACI" + arama kutusu
- Hiyerarşi: Dünya > Bölge > Şehir > Mahalle > Mekân > Oda
- Her düğüm: ikon + isim + sağda sayı (alt öğe sayısı)
- Açılır/kapanır: chevron ikonu
- Sürükle-bırak: opsiyonel (sonraki aşama)

### Arama
- Global arama kutusu (placeholder: "Ara...")
- Yazınca ağaç filtrelenir, eşleşenler vurgulanır
- Ctrl+K ile global arama paleti açılır

### Aksiyonlar
- Sağ tık menü: Düzenle, Sil, Yeni Alt Öğe, Favorilere Ekle
- Silme: ConfirmDialog ile onay

## Orta Alan — Harita ve Pinler

### Harita Görüntüleyici
- Resim yükleme: sürükle-bırak veya buton
- Desteklenen formatlar: PNG, JPG, WebP
- Zoom: mouse wheel veya butonlar
- Pan: sürükle
- Alt harita: Pin'e tıklayınca "Alt Haritayı Aç" butonu

### Pin Sistemi
- Haritaya tıklayınca pin atma modu (opsiyonel)
- Pin türleri: Mekân, NPC, Görev, POI, Tehlike, Gizli
- Pin rengi otomatik (türe göre), değiştirilebilir
- Pin'e tıklayınca ilgili kayıt sağ panelde açılır
- Pin tooltip: kayıt adı + tür

### Araç Çubuğu (Harita Üstü)
- Zoom In / Out / Fit
- Pin ekle/düzenle modu
- Katmanlar: Tüm pinler / Sadece mekân / Sadece NPC / Gizli pinler (DM)

## Sağ Panel — Kayıt Detayları

### Ortak Alanlar (Tüm Kayıt Türleri)
1. **Başlık:** Düzenlenebilir, büyük font
2. **Tür:** Badge (değiştirilebilir)
3. **Açıklama:** Textarea (DM notu)
4. **Oyuncuya Okunacak Metin:** Ayrı textarea, ayrı stil (daha açık arka plan)
5. **Etiketler:** TagInput, otomatik tamamlama
6. **Bağlı Kayıtlar:** Liste + "Bağlantı Ekle" butonu
7. **Görseller:** Thumbnail grid, tıklayınca büyük görünüm

### Kayıt Türü Özel Alanları

#### Mekân
- Üst Konum: Dropdown (ağaçtan seç)
- Atmosfer: Textarea
- Gizli Geçitler: Textarea
- Güvenlik Seviyesi: Input

#### NPC
- Irk, Sınıf, Seviye: Input'lar (yan yana)
- Kişilik: Textarea
- Hedef: Textarea
- Gizli Ajandası: Textarea (kırmızı kenarlık)
- Portre: Resim yükleme

#### Fraksiyon
- Hiyerarşi: Textarea
- Hedef: Textarea
- Varlıklar: Textarea
- Düşman/İttifak: Bağlantı listesi

#### Görev
- Durum: Dropdown (Başlamadı/Aktif/Tamamlandı/Başarısız/Gizli)
- Hedefler: Checklist
- Ödül: Textarea
- İlgili NPC/Mekân: Bağlantı listesi

### Bağlam Toplayıcı (Sağ Panel Altında)
- "Bağlam Topla" butonu
- Seçenekler:
  - DM gizli notları dahil et / hariç tut
  - Sadece oyuncuya gösterilebilir bilgiler
  - Derinlik: 1 / 2 / 3 derece
- Çıktı: Temiz, kopyalanabilir metin (textarea)
- Kopyala butonu

## Global Arama Paleti (Ctrl+K)
- Modal, ortada
- Input: "Kayıt, etiket veya açıklama ara..."
- Sonuçlar: İkon + isim + tür + eşleşen alan
- Sonuçlara tıklayınca kayda atlar
- Son kullanılanlar ve favoriler üstte

## Bağlantı Ağ Görünümü (Opsiyonel)
- "Ağ Görünümü" butonu (sağ panelde)
- Merkezde seçili kayıt, etrafında bağlı olanlar
- D3.js veya Cytoscape.js ile basit force-directed graph
- Düğüme tıklayınca o kayda geçer
