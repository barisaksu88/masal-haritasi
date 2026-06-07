import {
  readTextFile,
  writeTextFile,
  readDir,
  mkdir,
  exists,
  remove,
  rename,
  copyFile,
} from '@tauri-apps/plugin-fs';
import type { DirEntry } from '@tauri-apps/plugin-fs';

export async function readFile(path: string): Promise<string | null> {
  try {
    return await readTextFile(path);
  } catch (error) {
    console.error(`Dosya okunurken hata: ${path}`, error);
    return null;
  }
}

export async function writeFile(path: string, content: string): Promise<boolean> {
  try {
    await writeTextFile(path, content);
    return true;
  } catch (error) {
    console.error(`Dosya yazılırken hata: ${path}`, error);
    return false;
  }
}

export async function readDirectory(path: string): Promise<DirEntry[] | null> {
  try {
    return await readDir(path);
  } catch (error) {
    console.error(`Dizin listelenirken hata: ${path}`, error);
    return null;
  }
}

export async function makeDirectory(path: string): Promise<boolean> {
  try {
    await mkdir(path, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Dizin oluşturulurken hata: ${path}`, error);
    return false;
  }
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    return await exists(path);
  } catch (error) {
    console.error(`Yol kontrol edilirken hata: ${path}`, error);
    return false;
  }
}

export async function removeFile(path: string): Promise<boolean> {
  try {
    await remove(path);
    return true;
  } catch (error) {
    console.error(`Dosya silinirken hata: ${path}`, error);
    return false;
  }
}

export async function removeDirectory(path: string): Promise<boolean> {
  try {
    await remove(path, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Dizin silinirken hata: ${path}`, error);
    return false;
  }
}

export async function renameFile(oldPath: string, newPath: string): Promise<boolean> {
  try {
    await rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error(`Dosya yeniden adlandırılırken hata: ${oldPath} → ${newPath}`, error);
    return false;
  }
}

export async function copyFileFs(source: string, destination: string): Promise<boolean> {
  try {
    await copyFile(source, destination);
    return true;
  } catch (error) {
    console.error(`Dosya kopyalanırken hata: ${source} → ${destination}`, error);
    return false;
  }
}
