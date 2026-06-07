export type RecordType =
  | 'location'
  | 'npc'
  | 'faction'
  | 'religion'
  | 'culture'
  | 'item'
  | 'quest'
  | 'rumor'
  | 'event'
  | 'lore'
  | 'map'
  | 'handout';

export const RecordTypeLabels: Record<RecordType, string> = {
  location: 'Mekân',
  npc: 'NPC',
  faction: 'Fraksiyon',
  religion: 'Din',
  culture: 'Kültür',
  item: 'Eşya',
  quest: 'Görev',
  rumor: 'Söylenti',
  event: 'Olay',
  lore: 'Lore',
  map: 'Harita',
  handout: 'El Notu',
};

export type PinType = 'location' | 'npc' | 'quest' | 'poi' | 'danger' | 'secret';

export const PinTypeLabels: Record<PinType, string> = {
  location: 'Mekân',
  npc: 'NPC',
  quest: 'Görev',
  poi: 'Önemli Nokta',
  danger: 'Tehlike',
  secret: 'Gizli',
};

export interface BaseRecord {
  id: string;
  type: RecordType;
  name: string;
  description: string;
  playerText: string;
  tags: string[];
  connections: Connection[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface Connection {
  targetId: string;
  targetType: RecordType;
  relation: string;
}

export interface Location extends BaseRecord {
  type: 'location';
  parentId: string | null;
  atmosphere: string;
  secretPassages: string;
  securityLevel: string;
  mapImage: string | null;
}

export interface NPC extends BaseRecord {
  type: 'npc';
  race: string;
  class: string;
  level: number;
  stats: Record<string, number>;
  personality: string;
  goals: string;
  secretAgenda: string;
  portrait: string | null;
  currentLocationId: string | null;
}

export interface Faction extends BaseRecord {
  type: 'faction';
  hierarchy: string;
  goals: string;
  assets: string;
  enemyFactionIds: string[];
  allyFactionIds: string[];
}

export interface Religion extends BaseRecord {
  type: 'religion';
  gods: string;
  rituals: string;
  holySites: string;
  holyItems: string;
}

export interface Culture extends BaseRecord {
  type: 'culture';
  traditions: string;
  language: string;
  food: string;
  superstitions: string;
}

export interface Item extends BaseRecord {
  type: 'item';
  itemType: string;
  rarity: string;
  weight: string;
  effect: string;
  usageTemplate: string;
}

export type QuestStatus = 'not_started' | 'active' | 'completed' | 'failed' | 'secret';

export const QuestStatusLabels: Record<QuestStatus, string> = {
  not_started: 'Başlamadı',
  active: 'Aktif',
  completed: 'Tamamlandı',
  failed: 'Başarısız',
  secret: 'Gizli',
};

export interface Quest extends BaseRecord {
  type: 'quest';
  status: QuestStatus;
  objectives: string[];
  reward: string;
  relatedNpcIds: string[];
  relatedLocationIds: string[];
}

export interface Rumor extends BaseRecord {
  type: 'rumor';
  source: string;
  truthLevel: string;
  relatedEventId: string | null;
}

export interface Event extends BaseRecord {
  type: 'event';
  date: string;
  participants: string[];
  consequences: string;
}

export interface Lore extends BaseRecord {
  type: 'lore';
  period: string;
  sources: string;
  relatedCultureIds: string[];
  relatedReligionIds: string[];
}

export interface MapRecord extends BaseRecord {
  type: 'map';
  imageFile: string;
  scale: string;
  subMapIds: string[];
}

export interface Handout extends BaseRecord {
  type: 'handout';
  giveToPlayers: boolean;
  fontStyle: string;
}

export type WorldRecord = Location | NPC | Faction | Religion | Culture | Item | Quest | Rumor | Event | Lore | MapRecord | Handout;

export interface Pin {
  id: string;
  recordId: string;
  recordType: RecordType;
  x: number;
  y: number;
  pinType: PinType;
  color: string;
  icon: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  settings: CampaignSettings;
}

export interface CampaignSettings {
  calendar: string;
  currentDate: string;
  gameSystem: string;
}

export interface PartyMember {
  id: string;
  name: string;
  playerName: string;
  class: string;
  race: string;
  level: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  ac: number;
  portrait: string | null;
  conditions: Condition[];
  inventory: InventoryItem[];
  equipped: string[];
  features: Feature[];
}

export interface Condition {
  id: string;
  name: string;
  icon: string;
  color: string;
  duration: string;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  equipped: boolean;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  resetType: ResetType;
  maxUses: number;
  remainingUses: number;
}

export type ResetType = 'never' | 'short_rest' | 'long_rest' | 'daily' | 'manual';

export const ResetTypeLabels: Record<ResetType, string> = {
  never: 'Asla',
  short_rest: 'Kısa Dinlenme',
  long_rest: 'Uzun Dinlenme',
  daily: 'Günlük',
  manual: 'Manuel',
};

export interface NPCLiveState {
  npcId: string;
  alive: boolean;
  currentLocationId: string | null;
  partyRelation: 'friendly' | 'neutral' | 'hostile' | 'unknown';
  knownSecrets: string;
  lastSeen: string;
  sessionNotes: string;
}

export interface QuestLiveState {
  questId: string;
  status: QuestStatus;
  knownObjectives: string[];
  knownStatus: QuestStatus;
}

export interface Session {
  id: string;
  number: number;
  date: string;
  title: string;
  summary: string;
  partyState: string;
  keyEvents: string[];
  loot: string[];
  deadNpcs: string[];
  gainedQuests: string[];
  notes: string;
}

export interface UsageTracker {
  featureId: string;
  characterId: string;
  remainingUses: number;
  lastReset: string;
}

export interface AppState {
  mode: 'archive' | 'table';
  activeCampaign: Campaign | null;
  selectedRecordId: string | null;
  selectedRecordType: RecordType | null;
  searchQuery: string;
  isSearchOpen: boolean;
  recentRecords: string[];
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

export interface ContextCollectorOptions {
  includeDmNotes: boolean;
  playerOnly: boolean;
  depth: 1 | 2 | 3;
}

export interface DiceRoll {
  id: string;
  dice: string;
  result: number;
  modifier: number;
  total: number;
  timestamp: number;
  label: string;
}
