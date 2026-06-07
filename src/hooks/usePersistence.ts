import { useEffect, useRef } from 'react';
import { useCampaignStore } from '../stores/campaignStore';
import { useArchiveStore } from '../stores/archiveStore';
import { useTableStore } from '../stores/tableStore';
import { useUIStore } from '../stores/uiStore';
import * as service from '../services/campaignService';
import type { WorldRecord, Pin, Session } from '../types';

const SAVE_DEBOUNCE_MS = 600;

export function usePersistence() {
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);
  const addNotification = useUIStore((s) => s.addNotification);

  // Ref'ler ile önceki değerleri tut (gereksiz yazmayı önlemek için)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // Archive store'dan seçili verileri al
  const pins = useArchiveStore((s) => s.pins);

  // Table store'dan seçili verileri al
  const party = useTableStore((s) => s.party);
  const npcStates = useTableStore((s) => s.npcStates);
  const questStates = useTableStore((s) => s.questStates);
  const usageTrackers = useTableStore((s) => s.usageTrackers);
  const currentSession = useTableStore((s) => s.currentSession);
  const sessionNotes = useTableStore((s) => s.sessionNotes);
  const sessions = useTableStore((s) => s.sessions);

  // Archive değişikliklerini kaydet
  useEffect(() => {
    if (!activeCampaign) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        // Pinleri kaydet
        await service.savePins(activeCampaign.path, pins);

        // Kampanya metadata güncelle
        await service.updateCampaignMetadata(activeCampaign);

        // console.log('[Persistence] Arşiv kaydedildi');
      } catch (err) {
        console.error('Arşiv kaydedilemedi:', err);
      } finally {
        isSavingRef.current = false;
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [activeCampaign, pins]);

  // Kayıt (record) ekleme/güncelleme/silme anında anlık kaydet
  // Bunu archiveStore'un addRecord/updateRecord/removePin action'larına
  // doğrudan entegre etmek daha güvenli. Burada sadece bulk save yapıyoruz.

  // Live state değişikliklerini kaydet
  useEffect(() => {
    if (!activeCampaign) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        const live: service.LiveState = {
          party,
          npcStates,
          questStates,
          usageTrackers,
          currentSession,
          sessionNotes,
          sessions,
        };

        const ok = await service.writeLiveState(activeCampaign.path, live);
        if (!ok) {
          addNotification({ type: 'error', message: 'Oyun durumu kaydedilemedi.' });
        }
      } catch (err) {
        console.error('Live state kaydedilemedi:', err);
        addNotification({ type: 'error', message: 'Oyun durumu kaydedilemedi.' });
      } finally {
        isSavingRef.current = false;
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [activeCampaign, party, npcStates, questStates, usageTrackers, currentSession, sessionNotes, sessions, addNotification]);

  return null;
}

/**
 * Tek bir kaydı (record) diske anlık kaydeder.
 * Store action'ları içinde çağrılmak üzere tasarlandı.
 */
export async function persistRecord(campaignPath: string, record: WorldRecord): Promise<boolean> {
  return await service.saveRecord(campaignPath, record);
}

export async function deletePersistedRecord(campaignPath: string, record: WorldRecord): Promise<boolean> {
  return await service.deleteRecord(campaignPath, record);
}

export async function persistPins(campaignPath: string, pins: Pin[]): Promise<boolean> {
  return await service.savePins(campaignPath, pins);
}

export async function persistSessionMarkdown(campaignPath: string, session: Session): Promise<boolean> {
  return await service.saveSessionMarkdown(campaignPath, session);
}
