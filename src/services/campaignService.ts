import { appDataDir, join } from '@tauri-apps/api/path';
import * as fs from '../lib/fs';
import { generateId, sanitizeFilename } from '../utils/fileUtils';
import type {
  Campaign,
  CampaignSettings,
  WorldRecord,
  PartyMember,
  NPCLiveState,
  QuestLiveState,
  Session,
  UsageTracker,
  Pin,
} from '../types';

const BASE_FOLDER_NAME = 'Masal Haritalari';

const WORLD_FOLDERS: string[] = [
  'locations',
  'npcs',
  'factions',
  'religions',
  'cultures',
  'items',
  'quests',
  'rumors',
  'events',
  'lore',
  'maps',
  'handouts',
];

async function getBasePath(): Promise<string> {
  const appData = await appDataDir();
  return await join(appData, BASE_FOLDER_NAME);
}

async function ensureBaseDir(): Promise<string> {
  const base = await getBasePath();
  const exists = await fs.pathExists(base);
  if (exists) return base;
  const ok = await fs.makeDirectory(base);
  if (!ok) throw new Error(`Temel dizin oluşturulamadı: ${base}`);
  return base;
}

function recordTypeToFolder(type: string): string {
  const map: Record<string, string> = {
    location: 'locations',
    npc: 'npcs',
    faction: 'factions',
    religion: 'religions',
    culture: 'cultures',
    item: 'items',
    quest: 'quests',
    rumor: 'rumors',
    event: 'events',
    lore: 'lore',
    map: 'maps',
    handout: 'handouts',
  };
  return map[type] || 'misc';
}

/* ================================================================
   KAMPANYA OLUŞTURMA
   ================================================================ */

export async function createCampaign(
  name: string,
  description: string,
  gameSystem: string
): Promise<Campaign> {
  const base = await ensureBaseDir();

  const safeName = sanitizeFilename(name);
  const campaignPath = await join(base, safeName);

  if (await fs.pathExists(campaignPath)) {
    throw new Error(`"${name}" isimli bir kampanya zaten mevcut.`);
  }

  // Ana klasörler
  const folders = [
    ...WORLD_FOLDERS.map((f) => `world/${f}`),
    'live',
    'sessions',
    'assets/maps',
    'assets/portraits',
    'assets/handouts',
    'backups/auto',
  ];

  for (const folder of folders) {
    const folderPath = await join(campaignPath, folder);
    const ok = await fs.makeDirectory(folderPath);
    if (!ok) {
      throw new Error(`Klasör oluşturulamadı: ${folder}`);
    }
  }

  const now = new Date().toISOString();
  const settings: CampaignSettings = {
    calendar: 'Gregoryen',
    currentDate: new Date().toISOString().split('T')[0],
    gameSystem,
  };

  const campaign: Campaign = {
    id: generateId(),
    name: name.trim(),
    description: description.trim(),
    path: campaignPath,
    createdAt: now,
    updatedAt: now,
    settings,
  };

  const campaignJsonPath = await join(campaignPath, 'campaign.json');
  const ok = await fs.writeFile(campaignJsonPath, JSON.stringify(campaign, null, 2));
  if (!ok) {
    throw new Error('campaign.json yazılamadı.');
  }

  // Boş live state dosyaları
  await writeLiveState(campaignPath, {
    party: [],
    npcStates: [],
    questStates: [],
    usageTrackers: [],
    currentSession: null,
    sessionNotes: '',
    sessions: [],
  });

  // Boş pins dosyası
  const pinsPath = await join(campaignPath, 'pins.json');
  await fs.writeFile(pinsPath, JSON.stringify([], null, 2));

  return campaign;
}

/* ================================================================
   KAMPANYA LİSTELEME / YÜKLEME
   ================================================================ */

export async function listCampaigns(): Promise<Campaign[]> {
  const base = await getBasePath();
  
  if (!(await fs.pathExists(base))) {
    return [];
  }

  const entries = await fs.readDirectory(base);
  if (!entries) return [];

  const campaigns: Campaign[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory) continue;
    const campaignPath = await join(base, entry.name);
    const campaignJsonPath = await join(campaignPath, 'campaign.json');
    const content = await fs.readFile(campaignJsonPath);
    if (content) {
      try {
        const campaign = JSON.parse(content) as Campaign;
        campaign.path = campaignPath;
        campaigns.push(campaign);
      } catch {
        // geçersiz JSON, atla
      }
    }
  }

  return campaigns.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function loadCampaign(campaignPath: string): Promise<{
  campaign: Campaign;
  records: WorldRecord[];
  pins: Pin[];
  live: LiveState;
} | null> {
  const campaignJsonPath = await join(campaignPath, 'campaign.json');
  const campaignContent = await fs.readFile(campaignJsonPath);
  if (!campaignContent) return null;

  let campaign: Campaign;
  try {
    campaign = JSON.parse(campaignContent) as Campaign;
    campaign.path = campaignPath;
  } catch {
    return null;
  }

  // Kayıtları yükle
  const records: WorldRecord[] = [];
  for (const folder of WORLD_FOLDERS) {
    const folderPath = await join(campaignPath, 'world', folder);
    const entries = await fs.readDirectory(folderPath);
    if (!entries) continue;
    for (const entry of entries) {
      if (!entry.name.endsWith('.json')) continue;
      const filePath = await join(folderPath, entry.name);
      const content = await fs.readFile(filePath);
      if (content) {
        try {
          records.push(JSON.parse(content) as WorldRecord);
        } catch {
          // geçersiz kayıt, atla
        }
      }
    }
  }

  // Pinleri yükle
  const pinsPath = await join(campaignPath, 'pins.json');
  const pinsContent = await fs.readFile(pinsPath);
  let pins: Pin[] = [];
  if (pinsContent) {
    try {
      pins = JSON.parse(pinsContent) as Pin[];
    } catch {
      pins = [];
    }
  }

  // Live state yükle
  const live = await readLiveState(campaignPath);

  return { campaign, records, pins, live };
}

/* ================================================================
   KAYIT (RECORD) KAYDETME / SİLME
   ================================================================ */

export async function saveRecord(campaignPath: string, record: WorldRecord): Promise<boolean> {
  const folder = recordTypeToFolder(record.type);
  const filePath = await join(campaignPath, 'world', folder, `${record.id}.json`);
  const updatedRecord = { ...record, updatedAt: new Date().toISOString() };
  return await writeJsonAtomic(filePath, updatedRecord);
}

export async function deleteRecord(campaignPath: string, record: WorldRecord): Promise<boolean> {
  const folder = recordTypeToFolder(record.type);
  const filePath = await join(campaignPath, 'world', folder, `${record.id}.json`);
  return await fs.removeFile(filePath);
}

/* ================================================================
   PIN KAYDETME
   ================================================================ */

export async function savePins(campaignPath: string, pins: Pin[]): Promise<boolean> {
  const pinsPath = await join(campaignPath, 'pins.json');
  return await writeJsonAtomic(pinsPath, pins);
}

/* ================================================================
   LIVE STATE
   ================================================================ */

export interface LiveState {
  party: PartyMember[];
  npcStates: NPCLiveState[];
  questStates: QuestLiveState[];
  usageTrackers: UsageTracker[];
  currentSession: Session | null;
  sessionNotes: string;
  sessions: Session[];
}

async function readLiveState(campaignPath: string): Promise<LiveState> {
  const livePath = await join(campaignPath, 'live');

  const party = await readJsonFile<PartyMember[]>(await join(livePath, 'party.json')) ?? [];
  const npcStates = await readJsonFile<NPCLiveState[]>(await join(livePath, 'npc_states.json')) ?? [];
  const questStates = await readJsonFile<QuestLiveState[]>(await join(livePath, 'quest_states.json')) ?? [];
  const usageTrackers = await readJsonFile<UsageTracker[]>(await join(livePath, 'usage_trackers.json')) ?? [];
  const sessions = await readJsonFile<Session[]>(await join(livePath, 'sessions_index.json')) ?? [];
  const currentSession = await readJsonFile<Session | null>(await join(livePath, 'current_session.json')) ?? null;
  const sessionNotes = (await fs.readFile(await join(livePath, 'session_notes.txt'))) ?? '';

  return { party, npcStates, questStates, usageTrackers, currentSession, sessionNotes, sessions };
}

export async function writeLiveState(campaignPath: string, live: LiveState): Promise<boolean> {
  const livePath = await join(campaignPath, 'live');
  await fs.makeDirectory(livePath);

  const results = await Promise.all([
    writeJsonAtomic(await join(livePath, 'party.json'), live.party),
    writeJsonAtomic(await join(livePath, 'npc_states.json'), live.npcStates),
    writeJsonAtomic(await join(livePath, 'quest_states.json'), live.questStates),
    writeJsonAtomic(await join(livePath, 'usage_trackers.json'), live.usageTrackers),
    writeJsonAtomic(await join(livePath, 'sessions_index.json'), live.sessions),
    writeJsonAtomic(await join(livePath, 'current_session.json'), live.currentSession),
    fs.writeFile(await join(livePath, 'session_notes.txt'), live.sessionNotes),
  ]);

  return results.every((r) => r);
}

/* ================================================================
   OTURUM (SESSION) NOTLARI
   ================================================================ */

export async function saveSessionMarkdown(campaignPath: string, session: Session): Promise<boolean> {
  const sessionsPath = await join(campaignPath, 'sessions');
  await fs.makeDirectory(sessionsPath);

  const fileName = `session_${String(session.number).padStart(3, '0')}.md`;
  const filePath = await join(sessionsPath, fileName);

  const content = `# ${session.title}\n\n` +
    `**Oturum:** ${session.number}  \n` +
    `**Tarih:** ${session.date}  \n` +
    `**Özet:** ${session.summary}\n\n` +
    `## Önemli Olaylar\n\n` +
    session.keyEvents.map((e) => `- ${e}`).join('\n') + '\n\n' +
    `## Ganimet\n\n` +
    session.loot.map((l) => `- ${l}`).join('\n') + '\n\n' +
    `## Ölen NPC'ler\n\n` +
    session.deadNpcs.map((n) => `- ${n}`).join('\n') + '\n\n' +
    `## Kazanılan Görevler\n\n` +
    session.gainedQuests.map((q) => `- ${q}`).join('\n') + '\n\n' +
    `## Notlar\n\n${session.notes}\n`;

  return await fs.writeFile(filePath, content);
}

/* ================================================================
   KAMPANYA METADATA GÜNCELLEME
   ================================================================ */

export async function updateCampaignMetadata(campaign: Campaign): Promise<boolean> {
  const updated = { ...campaign, updatedAt: new Date().toISOString() };
  const campaignJsonPath = await join(campaign.path, 'campaign.json');
  return await writeJsonAtomic(campaignJsonPath, updated);
}

/* ================================================================
   YARDIMCI FONKSİYONLAR
   ================================================================ */

async function writeJsonAtomic(path: string, data: unknown): Promise<boolean> {
  const tempPath = `${path}.tmp`;
  try {
    const content = JSON.stringify(data, null, 2);
    const ok = await fs.writeFile(tempPath, content);
    if (!ok) return false;
    const renamed = await fs.renameFile(tempPath, path);
    if (!renamed) {
      await fs.removeFile(tempPath);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Atomik yazma hatası: ${path}`, error);
    await fs.removeFile(tempPath);
    return false;
  }
}

async function readJsonFile<T>(path: string): Promise<T | null> {
  const content = await fs.readFile(path);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}
