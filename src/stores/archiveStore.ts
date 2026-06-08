import { create } from 'zustand';
import { WorldRecord, RecordType, Pin, Location } from '../types';
import { useCampaignStore } from './campaignStore';
import { saveRecord, deleteRecord, savePins } from '../services/campaignService';

interface ArchiveStore {
  records: WorldRecord[];
  pins: Pin[];
  selectedRecordId: string | null;
  selectedRecordType: RecordType | null;
  activeRegionId: string | null;
  expandedNodes: Set<string>;
  isLoading: boolean;

  setRecords: (records: WorldRecord[]) => void;
  addRecord: (record: WorldRecord) => Promise<void>;
  updateRecord: (id: string, updates: Partial<WorldRecord>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  setSelectedRecord: (id: string | null, type?: RecordType | null) => void;
  setActiveRegion: (id: string | null) => void;
  toggleNode: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;

  setPins: (pins: Pin[]) => Promise<void>;
  addPin: (pin: Pin) => Promise<void>;
  removePin: (id: string) => Promise<void>;
  updatePin: (id: string, updates: Partial<Pin>) => Promise<void>;

  getRecordById: (id: string) => WorldRecord | undefined;
  getRecordsByType: (type: RecordType) => WorldRecord[];
  getChildRegions: (parentId: string | null) => Location[];
  getRecordsInRegion: (regionId: string | null) => WorldRecord[];
  getRegionPath: (regionId: string) => Location[];
  getRegionBreadcrumb: (regionId: string | null) => { id: string | null; name: string }[];
}

function getCampaignPath(): string | null {
  return useCampaignStore.getState().activeCampaign?.path ?? null;
}

function isLocation(record: WorldRecord): record is Location {
  return record.type === 'location';
}

export const useArchiveStore = create<ArchiveStore>((set, get) => ({
  records: [],
  pins: [],
  selectedRecordId: null,
  selectedRecordType: null,
  activeRegionId: null,
  expandedNodes: new Set(),
  isLoading: false,

  setRecords: (records) => set({ records }),

  addRecord: async (record) => {
    set((state) => ({ records: [...state.records, record] }));
    const path = getCampaignPath();
    if (path) {
      await saveRecord(path, record);
    }
  },

  updateRecord: async (id, updates) => {
    let updatedRecord: WorldRecord | undefined;
    set((state) => {
      const records = state.records.map((r) => {
        if (r.id === id) {
          updatedRecord = { ...r, ...updates, updatedAt: new Date().toISOString() } as WorldRecord;
          return updatedRecord;
        }
        return r;
      });
      return { records };
    });
    if (updatedRecord) {
      const path = getCampaignPath();
      if (path) {
        await saveRecord(path, updatedRecord);
      }
    }
  },

  removeRecord: async (id) => {
    const record = get().records.find((r) => r.id === id);
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
      pins: state.pins.filter((p) => p.recordId !== id),
    }));
    if (record) {
      const path = getCampaignPath();
      if (path) {
        await deleteRecord(path, record);
      }
    }
  },

  setSelectedRecord: (id, type) =>
    set({ selectedRecordId: id, selectedRecordType: type ?? null }),

  setActiveRegion: (id) => set({ activeRegionId: id, selectedRecordId: null, selectedRecordType: null }),

  toggleNode: (id) =>
    set((state) => {
      const next = new Set(state.expandedNodes);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedNodes: next };
    }),
  expandNode: (id) =>
    set((state) => {
      const next = new Set(state.expandedNodes);
      next.add(id);
      return { expandedNodes: next };
    }),
  collapseNode: (id) =>
    set((state) => {
      const next = new Set(state.expandedNodes);
      next.delete(id);
      return { expandedNodes: next };
    }),

  setPins: async (pins) => {
    set({ pins });
    const path = getCampaignPath();
    if (path) {
      await savePins(path, pins);
    }
  },

  addPin: async (pin) => {
    set((state) => {
      const pins = [...state.pins, pin];
      return { pins };
    });
    const path = getCampaignPath();
    if (path) {
      await savePins(path, get().pins);
    }
  },

  removePin: async (id) => {
    set((state) => {
      const pins = state.pins.filter((p) => p.id !== id);
      return { pins };
    });
    const path = getCampaignPath();
    if (path) {
      await savePins(path, get().pins);
    }
  },

  updatePin: async (id, updates) => {
    set((state) => ({
      pins: state.pins.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    const path = getCampaignPath();
    if (path) {
      await savePins(path, get().pins);
    }
  },

  getRecordById: (id) => get().records.find((r) => r.id === id),
  getRecordsByType: (type) => get().records.filter((r) => r.type === type),

  getChildRegions: (parentId) =>
    get().records.filter(
      (r): r is Location => r.type === 'location' && (r as Location).parentId === parentId
    ),

  getRecordsInRegion: (regionId) =>
    get().records.filter((r) => r.parentId === regionId),

  getRegionPath: (regionId) => {
    const path: Location[] = [];
    let current = get().records.find((r) => r.id === regionId);
    while (current && isLocation(current)) {
      path.unshift(current);
      if (!current.parentId) break;
      current = get().records.find((r) => r.id === current!.parentId);
    }
    return path;
  },

  getRegionBreadcrumb: (regionId) => {
    const result: { id: string | null; name: string }[] = [{ id: null, name: 'Dünya' }];
    if (!regionId) return result;
    const path = get().getRegionPath(regionId);
    for (const loc of path) {
      result.push({ id: loc.id, name: loc.name });
    }
    return result;
  },
}));
