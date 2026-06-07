import { join } from '@tauri-apps/api/path';
import type { useFileSystem } from '../hooks/useFileSystem';

type FsUtils = ReturnType<typeof useFileSystem>;

/**
 * Yedekleme adı için tarih damgası üretir.
 * @returns YYYYMMDD_HHMMSS formatında tarih damgası
 */
function generateBackupTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}_${h}${min}${s}`;
}

/**
 * Kampanya dizininin tamamını otomatik yedekleme dizinine kopyalar.
 * @param campaignPath - Kampanya dizininin yolu
 * @param fs - useFileSystem hook'undan dönen fonksiyonlar
 * @returns Oluşturulan yedekleme klasörünün adı veya hata durumunda null
 */
export async function createBackup(
  campaignPath: string,
  fs: FsUtils
): Promise<string | null> {
  const timestamp = generateBackupTimestamp();
  const backupName = `backup_${timestamp}`;
  const backupDir = await join(campaignPath, 'backups', 'auto', backupName);

  try {
    const entries = await fs.readDirectory(campaignPath);
    if (entries === null) {
      console.error('Kampanya dizini okunamadı, yedekleme iptal edildi.');
      return null;
    }

    const mkdirResult = await fs.makeDirectory(backupDir);
    if (mkdirResult === null) {
      console.error('Yedekleme dizini oluşturulamadı.');
      return null;
    }

    for (const entry of entries) {
      const sourcePath = await join(campaignPath, entry.name);
      const destPath = await join(backupDir, entry.name);

      if (entry.name === 'backups') {
        // Yedekleme dizinini kendisi yedeklemeye dahil etme
        continue;
      }

      if (entry.isDirectory) {
        const copyResult = await copyDirectoryRecursive(sourcePath, destPath, fs);
        if (copyResult === null) {
          console.error(`Alt dizin kopyalanamadı: ${entry.name}`);
          return null;
        }
      } else {
        const { copyFile } = await import('@tauri-apps/plugin-fs');
        await copyFile(sourcePath, destPath);
      }
    }

    return backupName;
  } catch (error) {
    console.error('Yedekleme oluşturulurken hata:', error);
    return null;
  }
}

/**
 * Bir dizini özyinelemeli olarak başka bir dizine kopyalar.
 * @param source - Kaynak dizin
 * @param destination - Hedef dizin
 * @param fs - useFileSystem hook'undan dönen fonksiyonlar
 * @returns Başarılı ise true, hata durumunda null
 */
async function copyDirectoryRecursive(
  source: string,
  destination: string,
  fs: FsUtils
): Promise<boolean | null> {
  try {
    const mkdirResult = await fs.makeDirectory(destination);
    if (mkdirResult === null) {
      return null;
    }

    const entries = await fs.readDirectory(source);
    if (entries === null) {
      return null;
    }

    const { copyFile } = await import('@tauri-apps/plugin-fs');

    for (const entry of entries) {
      const sourcePath = await join(source, entry.name);
      const destPath = await join(destination, entry.name);

      if (entry.isDirectory) {
        const result = await copyDirectoryRecursive(sourcePath, destPath, fs);
        if (result === null) {
          return null;
        }
      } else {
        await copyFile(sourcePath, destPath);
      }
    }

    return true;
  } catch (error) {
    console.error(`Dizin kopyalama hatası: ${source} → ${destination}`, error);
    return null;
  }
}

/**
 * Mevcut otomatik yedeklemelerin listesini döner.
 * @param campaignPath - Kampanya dizininin yolu
 * @param fs - useFileSystem hook'undan dönen fonksiyonlar
 * @returns Yedekleme klasörü adlarının listesi veya hata durumunda null
 */
export async function listBackups(
  campaignPath: string,
  fs: FsUtils
): Promise<string[] | null> {
  const autoBackupDir = await join(campaignPath, 'backups', 'auto');

  try {
    const existsResult = await fs.pathExists(autoBackupDir);
    if (existsResult === null || existsResult === false) {
      return [];
    }

    const entries = await fs.readDirectory(autoBackupDir);
    if (entries === null) {
      return null;
    }

    const backups = entries
      .filter((entry) => entry.isDirectory && entry.name.startsWith('backup_'))
      .map((entry) => entry.name)
      .sort();

    return backups;
  } catch (error) {
    console.error('Yedeklemeler listelenirken hata:', error);
    return null;
  }
}

/**
 * Belirtilen yedeklemeyi kampanya kök dizinine geri yükler.
 * @param campaignPath - Kampanya dizininin yolu
 * @param backupName - Geri yüklenecek yedekleme adı
 * @param fs - useFileSystem hook'undan dönen fonksiyonlar
 * @returns Başarılı ise true, hata durumunda null
 */
export async function restoreBackup(
  campaignPath: string,
  backupName: string,
  fs: FsUtils
): Promise<boolean | null> {
  const backupDir = await join(campaignPath, 'backups', 'auto', backupName);

  try {
    const existsResult = await fs.pathExists(backupDir);
    if (existsResult === null || existsResult === false) {
      console.error(`Yedekleme bulunamadı: ${backupName}`);
      return null;
    }

    // Mevcut kampanya içeriğini temizle (backups hariç)
    const entries = await fs.readDirectory(campaignPath);
    if (entries === null) {
      return null;
    }

    for (const entry of entries) {
      if (entry.name === 'backups') {
        continue;
      }
      const entryPath = await join(campaignPath, entry.name);
      if (entry.isDirectory) {
        const result = await fs.removeDirectory(entryPath);
        if (result === null) {
          return null;
        }
      } else {
        const result = await fs.removeFile(entryPath);
        if (result === null) {
          return null;
        }
      }
    }

    // Yedekleme içeriğini kampanya köküne kopyala
    const backupEntries = await fs.readDirectory(backupDir);
    if (backupEntries === null) {
      return null;
    }

    const { copyFile } = await import('@tauri-apps/plugin-fs');

    for (const entry of backupEntries) {
      const sourcePath = await join(backupDir, entry.name);
      const destPath = await join(campaignPath, entry.name);

      if (entry.isDirectory) {
        const result = await copyDirectoryRecursive(sourcePath, destPath, fs);
        if (result === null) {
          return null;
        }
      } else {
        await copyFile(sourcePath, destPath);
      }
    }

    return true;
  } catch (error) {
    console.error('Yedekleme geri yüklenirken hata:', error);
    return null;
  }
}

/**
* Eski otomatik yedeklemeleri temizler, sadece son N adet yedeklemeyi tutar.
* @param campaignPath - Kampanya dizininin yolu
* @param keepCount - Tutulacak yedekleme sayısı (varsayılan: 10)
* @param fs - useFileSystem hook'undan dönen fonksiyonlar
* @returns Başarılı ise true, hata durumunda null
*/
export async function cleanupOldBackups(
  campaignPath: string,
  keepCount: number = 10,
  fs: FsUtils
): Promise<boolean | null> {
  const backups = await listBackups(campaignPath, fs);
  if (backups === null) {
    return null;
  }

  if (backups.length <= keepCount) {
    return true;
  }

  const toDelete = backups.slice(0, backups.length - keepCount);

  try {
    for (const backupName of toDelete) {
      const backupDir = await join(campaignPath, 'backups', 'auto', backupName);
      const result = await fs.removeDirectory(backupDir);
      if (result === null) {
        console.error(`Eski yedekleme silinemedi: ${backupName}`);
        return null;
      }
    }
    return true;
  } catch (error) {
    console.error('Eski yedeklemeler temizlenirken hata:', error);
    return null;
  }
}
