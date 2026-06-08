import { create } from 'zustand';
import {
  PartyMember,
  NPCLiveState,
  QuestLiveState,
  Session,
  UsageTracker,
  DiceRoll,
} from '../types';

interface TableStore {
  party: PartyMember[];
  npcStates: NPCLiveState[];
  questStates: QuestLiveState[];
  sessions: Session[];
  currentSession: Session | null;
  usageTrackers: UsageTracker[];
  diceRolls: DiceRoll[];
  selectedCharacterId: string | null;
  selectedNpcId: string | null;
  sceneLocationId: string | null;
  sessionNotes: string;

  setParty: (party: PartyMember[]) => void;
  addPartyMember: (member: PartyMember) => void;
  updatePartyMember: (id: string, updates: Partial<PartyMember>) => void;
  removePartyMember: (id: string) => void;

  setNpcStates: (states: NPCLiveState[]) => void;
  updateNpcState: (npcId: string, updates: Partial<NPCLiveState>) => void;

  setQuestStates: (states: QuestLiveState[]) => void;
  updateQuestState: (questId: string, updates: Partial<QuestLiveState>) => void;

  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;

  setUsageTrackers: (trackers: UsageTracker[]) => void;
  useFeature: (featureId: string, characterId: string) => void;
  resetUsages: (resetType: 'short_rest' | 'long_rest' | 'daily') => void;

  addDiceRoll: (roll: DiceRoll) => void;
  clearDiceRolls: () => void;

  setSelectedCharacter: (id: string | null) => void;
  setSelectedNpc: (id: string | null) => void;
  setSceneLocation: (id: string | null) => void;
  setSessionNotes: (notes: string) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  party: [],
  npcStates: [],
  questStates: [],
  sessions: [],
  currentSession: null,
  usageTrackers: [],
  diceRolls: [],
  selectedCharacterId: null,
  selectedNpcId: null,
  sceneLocationId: null,
  sessionNotes: '',

  setParty: (party) => set({ party }),
  addPartyMember: (member) =>
    set((state) => ({ party: [...state.party, member] })),
  updatePartyMember: (id, updates) =>
    set((state) => ({
      party: state.party.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removePartyMember: (id) =>
    set((state) => ({ party: state.party.filter((m) => m.id !== id) })),

  setNpcStates: (states) => set({ npcStates: states }),
  updateNpcState: (npcId, updates) =>
    set((state) => ({
      npcStates: state.npcStates.map((s) =>
        s.npcId === npcId ? { ...s, ...updates } : s
      ),
    })),

  setQuestStates: (states) => set({ questStates: states }),
  updateQuestState: (questId, updates) =>
    set((state) => ({
      questStates: state.questStates.map((s) =>
        s.questId === questId ? { ...s, ...updates } : s
      ),
    })),

  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),

  setUsageTrackers: (trackers) => set({ usageTrackers: trackers }),
  useFeature: (featureId, characterId) =>
    set((state) => ({
      usageTrackers: state.usageTrackers.map((t) =>
        t.featureId === featureId && t.characterId === characterId && t.remainingUses > 0
          ? { ...t, remainingUses: t.remainingUses - 1 }
          : t
      ),
    })),
  resetUsages: (resetType) =>
    set((state) => ({
      usageTrackers: state.usageTrackers.map((t) => {
        // Hangi reset türleri bu resetType'ı sıfırlar?
        const shouldReset =
          resetType === 'long_rest'
            ? t.resetType === 'long_rest' || t.resetType === 'short_rest'
            : resetType === 'short_rest'
              ? t.resetType === 'short_rest'
              : resetType === 'daily'
                ? t.resetType === 'daily'
                : false;

        if (shouldReset) {
          return { ...t, remainingUses: t.maxUses, lastReset: new Date().toISOString() };
        }
        return t;
      }),
    })),

  addDiceRoll: (roll) =>
    set((state) => ({ diceRolls: [roll, ...state.diceRolls].slice(0, 50) })),
  clearDiceRolls: () => set({ diceRolls: [] }),

  setSelectedCharacter: (id) => set({ selectedCharacterId: id }),
  setSelectedNpc: (id) => set({ selectedNpcId: id }),
  setSceneLocation: (id) => set({ sceneLocationId: id }),
  setSessionNotes: (notes) => set({ sessionNotes: notes }),
}));
