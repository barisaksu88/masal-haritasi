import {
  readTextFile,
  writeTextFile,
  readFile as readBinaryFileTauri,
  writeFile as writeBinaryFileTauri,
  readDir,
  mkdir,
  exists,
  remove,
  rename,
  copyFile,
} from '@tauri-apps/plugin-fs';
import type { DirEntry } from '@tauri-apps/plugin-fs';

/* ================================================================
   BROWSER MOCK FS (for testing in dev server without Tauri)
   ================================================================ */

const isBrowser = typeof window !== 'undefined' && !(window as any).__TAURI__;

interface MockDirEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
}

class MockFS {
  private files = new Map<string, string | Uint8Array>();
  private dirs = new Set<string>();

  constructor() {
    this.dirs.add('/mock');
  }

  private normalize(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/');
  }

  private getParent(path: string): string {
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    if (lastSlash <= 0) return '/';
    return normalized.substring(0, lastSlash) || '/';
  }

  private getName(path: string): string {
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    return normalized.substring(lastSlash + 1);
  }

  private ensureDir(path: string): void {
    const normalized = this.normalize(path);
    if (normalized === '/' || normalized === '') return;
    this.dirs.add(normalized);
    // Ensure all parent dirs exist
    let parent = this.getParent(normalized);
    while (parent !== '/' && parent !== '') {
      this.dirs.add(parent);
      parent = this.getParent(parent);
    }
  }

  async readTextFile(path: string): Promise<string | null> {
    const normalized = this.normalize(path);
    const content = this.files.get(normalized);
    if (content === undefined) return null;
    if (typeof content === 'string') return content;
    // Uint8Array → string
    const decoder = new TextDecoder();
    return decoder.decode(content);
  }

  async writeTextFile(path: string, content: string): Promise<boolean> {
    const normalized = this.normalize(path);
    this.ensureDir(this.getParent(normalized));
    this.files.set(normalized, content);
    return true;
  }

  async readBinaryFile(path: string): Promise<Uint8Array | null> {
    const normalized = this.normalize(path);
    const content = this.files.get(normalized);
    if (content === undefined) return null;
    if (content instanceof Uint8Array) return new Uint8Array(content);
    // string → Uint8Array
    const encoder = new TextEncoder();
    return encoder.encode(content);
  }

  async writeBinaryFile(path: string, data: Uint8Array): Promise<boolean> {
    const normalized = this.normalize(path);
    this.ensureDir(this.getParent(normalized));
    this.files.set(normalized, new Uint8Array(data));
    return true;
  }

  async readDir(path: string): Promise<MockDirEntry[] | null> {
    const normalized = this.normalize(path);
    if (!this.dirs.has(normalized) && normalized !== '/') return null;
    
    const entries: MockDirEntry[] = [];
    const seen = new Set<string>();
    
    // List files in this dir
    for (const [filePath] of this.files) {
      const parent = this.getParent(filePath);
      if (parent === normalized || (normalized === '/' && this.getParent(filePath) === '/')) {
        const name = this.getName(filePath);
        if (!seen.has(name)) {
          seen.add(name);
          entries.push({ name, isDirectory: false, isFile: true });
        }
      }
    }
    
    // List subdirs
    for (const dir of this.dirs) {
      if (dir === normalized || dir === '/') continue;
      const parent = this.getParent(dir);
      if (parent === normalized) {
        const name = this.getName(dir);
        if (!seen.has(name)) {
          seen.add(name);
          entries.push({ name, isDirectory: true, isFile: false });
        }
      }
    }
    
    return entries;
  }

  async mkdir(path: string): Promise<boolean> {
    const normalized = this.normalize(path);
    this.ensureDir(normalized);
    return true;
  }

  async exists(path: string): Promise<boolean> {
    const normalized = this.normalize(path);
    return this.files.has(normalized) || this.dirs.has(normalized);
  }

  async remove(path: string, recursive?: boolean): Promise<boolean> {
    const normalized = this.normalize(path);
    
    // Remove file
    this.files.delete(normalized);
    
    // Remove dir and contents if recursive
    if (recursive) {
      this.dirs.delete(normalized);
      for (const [filePath] of this.files) {
        if (filePath.startsWith(normalized + '/')) {
          this.files.delete(filePath);
        }
      }
      for (const dir of this.dirs) {
        if (dir.startsWith(normalized + '/')) {
          this.dirs.delete(dir);
        }
      }
    } else {
      this.dirs.delete(normalized);
    }
    
    return true;
  }

  async rename(oldPath: string, newPath: string): Promise<boolean> {
    const normalizedOld = this.normalize(oldPath);
    const normalizedNew = this.normalize(newPath);
    
    const content = this.files.get(normalizedOld);
    if (content !== undefined) {
      this.files.delete(normalizedOld);
      this.ensureDir(this.getParent(normalizedNew));
      this.files.set(normalizedNew, content);
      return true;
    }
    
    return false;
  }

  async copyFile(source: string, destination: string): Promise<boolean> {
    const normalizedSrc = this.normalize(source);
    const normalizedDst = this.normalize(destination);
    
    const content = this.files.get(normalizedSrc);
    if (content === undefined) return false;
    
    this.ensureDir(this.getParent(normalizedDst));
    this.files.set(normalizedDst, content instanceof Uint8Array ? new Uint8Array(content) : content);
    return true;
  }
}

const mockFS = isBrowser ? new MockFS() : null;

/* ================================================================
   REAL TAURI FS
   ================================================================ */

export async function readFile(path: string): Promise<string | null> {
  if (mockFS) return mockFS.readTextFile(path);
  try {
    return await readTextFile(path);
  } catch (error) {
    console.error(`Dosya okunurken hata: ${path}`, error);
    return null;
  }
}

export async function writeFile(path: string, content: string): Promise<boolean> {
  if (mockFS) return mockFS.writeTextFile(path, content);
  try {
    await writeTextFile(path, content);
    return true;
  } catch (error) {
    console.error(`Dosya yazılırken hata: ${path}`, error);
    return false;
  }
}

export async function readBinaryFile(path: string): Promise<Uint8Array | null> {
  if (mockFS) return mockFS.readBinaryFile(path);
  try {
    return await readBinaryFileTauri(path);
  } catch (error) {
    console.error(`Binary dosya okunurken hata: ${path}`, error);
    return null;
  }
}

export async function writeBinaryFile(path: string, data: Uint8Array): Promise<boolean> {
  if (mockFS) return mockFS.writeBinaryFile(path, data);
  try {
    await writeBinaryFileTauri(path, data);
    return true;
  } catch (error) {
    console.error(`Binary dosya yazılırken hata: ${path}`, error);
    return false;
  }
}

export async function readDirectory(path: string): Promise<DirEntry[] | null> {
  if (mockFS) {
    const entries = await mockFS.readDir(path);
    return entries as DirEntry[] | null;
  }
  try {
    return await readDir(path);
  } catch (error) {
    console.error(`Dizin listelenirken hata: ${path}`, error);
    return null;
  }
}

export async function makeDirectory(path: string): Promise<boolean> {
  if (mockFS) return mockFS.mkdir(path);
  try {
    await mkdir(path, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Dizin oluşturulurken hata: ${path}`, error);
    return false;
  }
}

export async function pathExists(path: string): Promise<boolean> {
  if (mockFS) return mockFS.exists(path);
  try {
    return await exists(path);
  } catch (error) {
    console.error(`Yol kontrol edilirken hata: ${path}`, error);
    return false;
  }
}

export async function removeFile(path: string): Promise<boolean> {
  if (mockFS) return mockFS.remove(path);
  try {
    await remove(path);
    return true;
  } catch (error) {
    console.error(`Dosya silinirken hata: ${path}`, error);
    return false;
  }
}

export async function removeDirectory(path: string): Promise<boolean> {
  if (mockFS) return mockFS.remove(path, true);
  try {
    await remove(path, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Dizin silinirken hata: ${path}`, error);
    return false;
  }
}

export async function renameFile(oldPath: string, newPath: string): Promise<boolean> {
  if (mockFS) return mockFS.rename(oldPath, newPath);
  try {
    await rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error(`Dosya yeniden adlandırılırken hata: ${oldPath} → ${newPath}`, error);
    return false;
  }
}

export async function copyFileFs(source: string, destination: string): Promise<boolean> {
  if (mockFS) return mockFS.copyFile(source, destination);
  try {
    await copyFile(source, destination);
    return true;
  } catch (error) {
    console.error(`Dosya kopyalanırken hata: ${source} → ${destination}`, error);
    return false;
  }
}
