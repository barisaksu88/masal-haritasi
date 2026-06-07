import { join } from '@tauri-apps/api/path';
import { rename, remove } from '@tauri-apps/plugin-fs';
import type { useFileSystem } from '../hooks/useFileSystem';

type FsUtils = ReturnType<typeof useFileSystem>;

/**
 * Kampanya klasör yapısını oluşturur.
 * @param basePath - Kampanyaların bulunduğu temel dizin
 * @param campaignName - Oluşturulacak kampanyanın adı
 * @param fs - useFileSystem hook'undan dönen fonksiyonlar
 * @returns Oluşturulan kampanya dizininin yolu veya hata durumunda null
 */
export async function createCampaignFolder(
  basePath: string,
  campaignName: string,
  fs: FsUtils
): Promise<string | null> {
  const safeName = sanitizeFilename(campaignName);
  const campaignPath = await join(basePath, safeName);

  const folders = [
    'world/locations',
    'world/npcs',
    'live',
    'sessions',
    'assets',
    'backups/auto',
  ];

  try {
    for (const folder of folders) {
      const folderPath = await join(campaignPath, folder);
      const result = await fs.makeDirectory(folderPath);
      if (result === null) {
        console.error(`Kampanya alt dizini oluşturulamadı: ${folderPath}`);
        return null;
      }
    }
    return campaignPath;
  } catch (error) {
    console.error('Kampanya klasörü oluşturulurken hata:', error);
    return null;
  }
}

/**
 * JSON verisini atomik olarak yazar: önce geçici dosyaya yazar, sonra yeniden adlandırır.
 * @param path - Hedef dosya yolu
 * @param data - Yazılacak JSON verisi
 * @param fs - useFileSystem hook'undan dönen fonksiyonlar
 * @returns Başarılı ise true, hata durumunda null
 */
export async function writeJsonAtomic(
  path: string,
  data: unknown,
  fs: FsUtils
): Promise<boolean | null> {
  const tempPath = `${path}.tmp`;
  try {
    const content = JSON.stringify(data, null, 2);
    const writeResult = await fs.writeFile(tempPath, content);
    if (writeResult === null) {
      return null;
    }
    await rename(tempPath, path);
    return true;
  } catch (error) {
    console.error(`Atomik yazma hatası: ${path}`, error);
    try {
      await remove(tempPath);
    } catch {
      // Geçici dosya zaten yok olabilir, görmezden gel
    }
    return null;
  }
}

/**
 * Belirtilen yoldaki JSON dosyasını okur ve ayrıştırır.
 * @param path - Okunacak JSON dosyasının yolu
 * @param fs - useFileSystem hook'undan dönen fonksiyonlar
 * @returns Ayrıştırılmış veri (T) veya hata durumunda null
 */
export async function readJson<T>(path: string, fs: FsUtils): Promise<T | null> {
  const content = await fs.readFile(path);
  if (content === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(content) as T;
    return parsed;
  } catch (error) {
    console.error(`JSON ayrıştırma hatası: ${path}`, error);
    return null;
  }
}

/**
 * Rastgele bir kimlik (ID) üretir.
 * @returns 12 karakterlik rastgele ID
 */
export function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Dosya adı için geçersiz karakterleri temizler.
 * @param name - Temizlenecek ad
 * @returns Windows uyumlu dosya adı
 */
export function sanitizeFilename(name: string): string {
  // Windows için geçersiz karakterler: < > : " / \ | ? *
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}
