import { create } from 'zustand';
import { Campaign, AppState, Notification } from '../types';

interface CampaignStore {
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;

  setCampaigns: (campaigns: Campaign[]) => void;
  setActiveCampaign: (campaign: Campaign | null) => void;
  addCampaign: (campaign: Campaign) => void;
  removeCampaign: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  campaigns: [],
  activeCampaign: null,
  isLoading: false,
  error: null,

  setCampaigns: (campaigns) => set({ campaigns }),
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign }),
  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [...state.campaigns, campaign] })),
  removeCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
