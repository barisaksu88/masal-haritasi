import {
  readTextFile,
  writeTextFile,
  readDir,
  mkdir,
  exists,
  remove,
} from '@tauri-apps/plugin-fs';
import type { DirEntry } from '@tauri-apps/plugin-fs';

/**
 * Tauri dosya sistemi API'sini saran hook.
 * Tüm fonksiyonlar async'tir ve hata durumunda null döner.
 */
export function useFileSystem() {
  /**
   * Belirtilen yoldaki metin dosyasını okur.
   * @param path - Okunacak dosyanın yolu
   * @returns Dosya içeriği (string) veya hata durumunda null
   */
  async function readFile(path: string): Promise<string | null> {
    try {
      const content = await readTextFile(path);
      return content;
    } catch (error) {
      console.error(`Dosya okunurken hata: ${path}`, error);
      return null;
    }
  }

  /**
   * Belirtilen yola metin dosyası yazar.
   * @param path - Yazılacak dosyanın yolu
   * @param content - Yazılacak içerik
   * @returns Başarılı ise true, hata durumunda null
   */
  async function writeFile(path: string, content: string): Promise<boolean | null> {
    try {
      await writeTextFile(path, content);
      return true;
    } catch (error) {
      console.error(`Dosya yazılırken hata: ${path}`, error);
      return null;
    }
  }

  /**
   * Belirtilen yoldaki dizin içeriğini listeler.
   * @param path - Listelenecek dizinin yolu
   * @returns Dizin girişleri (DirEntry[]) veya hata durumunda null
   */
  async function readDirectory(path: string): Promise<DirEntry[] | null> {
    try {
      const entries = await readDir(path);
      return entries;
    } catch (error) {
      console.error(`Dizin listelenirken hata: ${path}`, error);
      return null;
    }
  }

  /**
   * Belirtilen yolda yeni bir dizin oluşturur.
   * @param path - Oluşturulacak dizinin yolu
   * @returns Başarılı ise true, hata durumunda null
   */
  async function makeDirectory(path: string): Promise<boolean | null> {
    try {
      await mkdir(path, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Dizin oluşturulurken hata: ${path}`, error);
      return null;
    }
  }

  /**
   * Belirtilen yolun var olup olmadığını kontrol eder.
   * @param path - Kontrol edilecek yol
   * @returns Var ise true, yok ise false, hata durumunda null
   */
  async function pathExists(path: string): Promise<boolean | null> {
    try {
      const result = await exists(path);
      return result;
    } catch (error) {
      console.error(`Yol kontrol edilirken hata: ${path}`, error);
      return null;
    }
  }

  /**
   * Belirtilen yoldaki dosyayı siler.
   * @param path - Silinecek dosyanın yolu
   * @returns Başarılı ise true, hata durumunda null
   */
  async function removeFile(path: string): Promise<boolean | null> {
    try {
      await remove(path);
      return true;
    } catch (error) {
      console.error(`Dosya silinirken hata: ${path}`, error);
      return null;
    }
  }

  /**
   * Belirtilen yoldaki dizini siler.
   * @param path - Silinecek dizinin yolu
   * @returns Başarılı ise true, hata durumunda null
   */
  async function removeDirectory(path: string): Promise<boolean | null> {
    try {
      await remove(path, { recursive: true });
      return true;
    } catch (error) {
      console.error(`Dizin silinirken hata: ${path}`, error);
      return null;
    }
  }

  return {
    readFile,
    writeFile,
    readDirectory,
    makeDirectory,
    pathExists,
    removeFile,
    removeDirectory,
  };
}
