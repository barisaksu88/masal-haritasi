# Masal Haritası — Global Tasarım Sistemi

## Felsefe
- **Karanlık tema:** D&D oynamak gece olur, göz yormasın.
- **Sıcak tonlar:** Mavi-mor gradyan yok. Amber/altın vurgular, koyu lacivert/slate arka plan.
- **Yeterli boşluk:** Modern, temiz, havadar.
- **Türkçe:** Her UI metni, buton, placeholder Türkçe.

## Renk Paleti

| Rol | Hex | Kullanım |
|-----|-----|----------|
| Arka Plan | `#0f172a` | Ana arka plan |
| Arka Plan 2 | `#1e293b` | Paneller, kartlar |
| Arka Plan 3 | `#334155` | Vurgulu alanlar, ayraçlar |
| Metin | `#e2e8f0` | Ana metin |
| Metin 2 | `#94a3b8` | İkincil metin |
| Metin 3 | `#64748b` | Placeholder, devre dışı |
| Vurgu | `#d97706` | Butonlar, önemli işaretler |
| Vurgu Açık | `#fbbf24` | Hover, seçili durum |
| Birincil | `#3b82f6` | Linkler, bilgi |
| Tehlike | `#ef4444` | Silme, zarar |
| Başarı | `#22c55e` | Onay, can artışı |
| Bilgi | `#06b6d4` | İpuçları, POI |

## Tipografi
- **Font:** Inter (sans-serif), Merriweather (serif - el notları için)
- **Boyutlar:** xs(12px), sm(14px), base(16px), lg(18px), xl(20px), 2xl(24px)
- **Ağırlıklar:** normal(400), medium(500), semibold(600), bold(700)

## Bileşen Stilleri

### Panel
- `bg-surface border border-border rounded-lg`
- Gölge: yok (düz, modern)
- Kenar: 1px `#334155`

### Butonlar
- **Birincil:** `bg-primary text-white hover:bg-primary-hover`
- **Vurgu:** `bg-accent text-white hover:bg-accent-hover`
- **Hayalet:** `text-text-muted hover:text-text hover:bg-surface-hover`
- **Tehlike:** `bg-danger text-white hover:bg-red-600`
- Padding: `px-3 py-1.5`
- Border radius: `rounded-md`

### Input / Textarea
- `bg-background-secondary border border-border rounded-md`
- Focus: `border-primary ring-1 ring-primary`
- Placeholder: `text-text-muted`

### Ağaç Öğesi
- `flex items-center gap-2 px-3 py-1.5 text-sm`
- Hover: `hover:text-text hover:bg-surface-hover`
- Aktif: `bg-surface-active text-text`

### Etiket (Tag)
- `inline-flex items-center px-2 py-0.5 rounded-full text-xs`
- `bg-background-tertiary text-text-secondary`

## Layout Kuralları
- **Toolbar:** 48px yükseklik, üstte sabit
- **3 Panel:** Sol (ağaç/parti), Orta (harita/sahne), Sağ (detaylar)
- **Panel ayraçları:** 4px genişlik, `cursor-col-resize`, hover'da açık renk
- **Min genişlikler:** Sol 200px, Sağ 280px

## Animasyonlar
- Geçişler: `transition-colors duration-150`
- Panel aç/kapa: `transition-all duration-200`
- Toast: slide-in from top, 300ms

## Responsive
- Minimum pencere: 1000x700
- Varsayılan: 1400x900
- Mobil destek yok (masaüstü odaklı)

## İkonlar
- **Lucide React** kullanılır.
- Boyutlar: 16px (butonlar), 20px (başlıklar), 24px (ana ikonlar)

## Harita Pin Renkleri
| Tür | Renk |
|-----|------|
| Mekân | `#3b82f6` (mavi) |
| NPC | `#22c55e` (yeşil) |
| Görev | `#d97706` (amber) |
| POI | `#06b6d4` (cyan) |
| Tehlike | `#ef4444` (kırmızı) |
| Gizli | `#a855f7` (mor) |
