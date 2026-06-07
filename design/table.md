# Masa Modu Tasarımı

## Amaç
Oyun sırasında açılır. Sadece şu anki oturumun ihtiyacı olan her şeyi gösterir.

## Sol Panel — Parti Özeti

### Yapı
- Başlık: "PARTİ" + oturum numarası
- Karakter kartları (dikey liste):
  - Portre thumbnail (40x40, yuvarlak)
  - İsim + sınıf/ırk (küçük)
  - Can barı: mevcut/maks, renkli (yeşil > sarı > kırmızı)
  - Durum ikonları: zehirli, kalkanlı, bilinçsiz (renkli badge'ler)
- Karakter seçimi: tıklayınca sağ panelde açılır
- Hızlı eylemler: Can ekle/çıkar, durum ekle

### Can Barı
- `height: 8px`, `border-radius: 4px`
- Arka plan: `bg-background-tertiary`
- Dolu: `bg-success` (>50%), `bg-warning` (25-50%), `bg-danger` (<25%)
- Geçici can: `bg-info` üst üste

## Orta Alan — Sahne

### Yapı
- Başlık: Güncel konum adı (büyük, vurgulu)
- Altında: Konum açıklaması (oyuncuya okunacak metin)
- "Oyuncuya Oku" butonu: Metni büyük, temiz şekilde gösterir (modal)
- Harita: Varsa, parti konumu ve görülen NPC'ler
- Oturum notları alanı: Hızlıca yazılabilen, zaman damgalı
  - Her not: `HH:MM — not metni`
  - Otomatik kaydet (debounce)

### Sahne Haritası
- Aktif parti konumu: özel pin (parlayan)
- Görülen NPC'ler: yeşil pin
- Bilinen tehlikeler: kırmızı pin
- Bilinmeyen/gizli: gösterilmez

## Sağ Panel — Canlı Durum

### Sekmeler
- **Karakter** (seçili karakter için)
- **NPC** (seçili NPC için)
- **Görevler**
- **Zar Geçmişi**

### Karakter Kartı (Detaylı)
- Ad, Oyuncu Adı, Sınıf, Irk, Seviye
- Can: `current / max` + geçici can
- AC
- Durumlar: İkon + isim + renk + süre
- Envanter: Kompakt liste, miktar, ağırlık
- Takılı eşyalar: Badge listesi
- Kazanılmış yetenekler ve Kullanım Hakları

### Kullanım Hakkı Sistemi
- Her yetenek/eşya/özellik için kart:
  - Ad ve açıklama (küçük)
  - Reset türü: badge
  - Kalan / Maksimum: `3 / 3`
  - "Kullan" butonu (1 azaltır, 0 olunca devre dışı)
  - "Reset" butonu (manuel resetlerde)

### Dinlenme Butonları (Karakter Kartı Altında)
- **Kısa Dinlenme:**
  - Kısa resetli kullanımları sıfırlar
  - Opsiyonel: Hit Dice zar butonu (can yenileme)
- **Uzun Dinlenme:**
  - Uzun resetlileri sıfırlar, kısa resetlileri de sıfırlar
  - Buff/debuff temizliği: "Hangi durumlar kalsın?" checklist
  - Onay diyaloğu (önemli işlem)

### NPC Canlı Durumu
- Hayatta mı? Toggle
- Güncel konum: Dropdown
- Partiyle ilişki: Dost / Tarafsız / Düşman / Bilinmiyor
- Bilinen sırlar: Textarea (oyuncular öğrendikçe)
- Son görülme: Tarih
- Geçici not: Textarea (bu oturuma özel)

### Görev Takibi
- Aktif görevler listesi
- Her görev: Durum badge + isim + bilinen aşamalar
- Gerçek durum vs bilinen durum ayrı gösterilir
- Tamamlananlar: üstü çizili, alt alta

### Zar Geçmişi
- Son 50 zar atışı
- Format: `[14:32] d20 + 3 = 17` (Saldırı)
- Temizle butonu

## Zar Butonları (Orta Alan Altında / Floating)
- Hızlı erişim: d4, d6, d8, d10, d12, d20, yüzde
- Buton: zar ikonu + sonuç (büyük)
- Tıklayınca animasyon (dönme) ve sonuç
- Modifier girişi: `+3`, `-2`
- Etiket: "Saldırı", "Kurtulma", vb.

## Oturum Yönetimi (Toolbar'da)
- "Oturum Başlat" / "Oturum Sonlandır"
- Oturum sonlandırınca otomatik `sessions/session_001.md` oluşturulur
- Önceki oturum notları: dropdown ile hızlı erişim

## Hızlı Not (Scratchpad)
- Masa Modunda her zaman görünen yapışkan not
- Sağ alt köşede, küçük, açılıp kapanabilir
- Kaydetmeden hızlıca yazılabilir
- Otomatik kaydet (sadece bu oturum için)

## "Şimdi Ne Olacak?" Hazır Listesi
- DM'in hazırladığı random encounter, söylenti, olay listesi
- Oturumda hızlıca çağrılabilir
- Kategori: Encounter, Söylenti, Olay, NPC
- Tıklayınca detay modalı açar
