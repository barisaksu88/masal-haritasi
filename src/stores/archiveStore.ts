import { create } from 'zustand';
import { WorldRecord, RecordType, Pin } from '../types';

interface ArchiveStore {
  records: WorldRecord[];
  pins: Pin[];
  selectedRecordId: string | null;
  selectedRecordType: RecordType | null;
  expandedNodes: Set<string>;
  isLoading: boolean;

  setRecords: (records: WorldRecord[]) => void;
  addRecord: (record: WorldRecord) => void;
  updateRecord: (id: string, updates: Partial<WorldRecord>) => void;
  removeRecord: (id: string) => void;
  setSelectedRecord: (id: string | null, type?: RecordType | null) => void;
  toggleNode: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;

  setPins: (pins: Pin[]) => void;
  addPin: (pin: Pin) => void;
  removePin: (id: string) => void;
  updatePin: (id: string, updates: Partial<Pin>) => void;

  getRecordById: (id: string) => WorldRecord | undefined;
  getRecordsByType: (type: RecordType) => WorldRecord[];
  getChildLocations: (parentId: string | null) => WorldRecord[];
}

export const useArchiveStore = create<ArchiveStore>((set, get) => ({
  records: [],
  pins: [],
  selectedRecordId: null,
  selectedRecordType: null,
  expandedNodes: new Set(),
  isLoading: false,

  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => ({ records: [...state.records, record] })),
  updateRecord: (id, updates) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? ({ ...r, ...updates, updatedAt: new Date().toISOString() } as any) : r
      ),
    })),
  removeRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
      pins: state.pins.filter((p) => p.recordId !== id),
    })),
  setSelectedRecord: (id, type) =>
    set({ selectedRecordId: id, selectedRecordType: type ?? null }),
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

  setPins: (pins) => set({ pins }),
  addPin: (pin) => set((state) => ({ pins: [...state.pins, pin] })),
  removePin: (id) =>
    set((state) => ({ pins: state.pins.filter((p) => p.id !== id) })),
  updatePin: (id, updates) =>
    set((state) => ({
      pins: state.pins.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  getRecordById: (id) => get().records.find((r) => r.id === id),
  getRecordsByType: (type) => get().records.filter((r) => r.type === type),
  getChildLocations: (parentId) =>
    get().records.filter(
      (r) => r.type === 'location' && (r as any).parentId === parentId
    ),
}));
