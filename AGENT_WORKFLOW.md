# Masal Haritası — Agent Çalışma Metodu (Kalıcı Memory)

> **Bu dosya agent'ın kendi workflow'unu tanımlar. Yeni thread'lerde önce bu dosya okunur.**

## Rolüm: Kullanıcı Vekili (Hands-On Tester)

**Kod yazmak YOK.** Çok basit tek satır düzeltmeler hariç, mantık çerçevesinde.

**Görevim:**
1. App'i Playwright ile aç
2. Her butonu, her fonksiyonu tek tek test et
3. Sadece "çalışıyor / çalışmıyor" raporla — sebep sorgulama, derin analiz yapma

## Sorun Bulunca Karar Ağacı

```
Sorun tespit edildi
        │
        ▼
┌─────────────────────────┐
│ 10 dk içinde çözülür mü? │
└─────────────────────────┘
        │
   Evet │ Hayır
        │
        ▼                 ▼
   Agent çağır          Kullanıcıya (Sam)
   Sorun raporu ver     Detaylı prompt hazırla
   O kodu yazsın        O manuel olarak
   Sen tekrar test et    Kimi Code / Codex'e iletsin
```

## Kullanıcıya Haber Verme Protokolü

**Sam hands-on test yapmadan ÖNCE**, ben (agent) önce tüm testleri çalıştırıp "her şey çalışır durumda, hands-on testing için hazır" raporu vermeliyim.

Bu protokol her zaman geçerlidir. Yeni thread, yeni özellik, yeni test — fark etmez.

## Test Altyapısı

- **Preview server:** `npm run preview -- --port 5174`
- **Test script'leri:** `test-*.cjs` dosyaları (`masal-haritasi/` altında)
- **Build verify:** `npm run build` her değişiklik sonrası

## Proje Özeti (Hızlı Referans)

- **Stack:** Tauri v2 + React 19 + TypeScript + Vite + Tailwind + Zustand
- **Dizin:** `C:\Users\Hawk Gaming\Documents\kimi\workspace\masal-haritasi`
- **Node:** `C:\Users\Hawk Gaming\AppData\Local\Programs\kimi-desktop\resources\resources\runtime\npm.cmd`

## Önemli Teknik Notlar

- Tauri WebView2'de native `<select>` çalışmıyor → custom div-based dropdown
- Pin koordinatları `naturalWidth/naturalHeight` uzayında
- File input `<label>` wrapper ile çalışır
- Git Bash'de `pwd -W` kullan
- Preview port: 5174

## Geçmiş: Çözülen Bug'lar

Tüm temel fonksiyonlar (pin ekleme, zoom, resize, hiyerarşik navigasyon, alt harita yükleme) test edildi ve çalışıyor. Detaylar için `CONTINUE_PROMPT.md` ye bak.
