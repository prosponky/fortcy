import { create } from "zustand";
import { services } from "../services";

interface SystemStore {
  resolution: string;
  refreshRateHz: number | null;
  fortniteRunning: boolean;

  isLoading: boolean;

  loadSystemStatus: () => Promise<void>;
}

export const useSystemStore = create<SystemStore>((set) => ({
  resolution: "--",
  refreshRateHz: null,
  fortniteRunning: false,

  isLoading: false,

  loadSystemStatus: async () => {
    set({
      isLoading: true,
    });

    try {
      const [systemInformation, fortniteStatus] =
        await Promise.all([
          services.systemInformation.getSystemInformation(),
          services.fortnite.getStatus(),
        ]);

      set({
        resolution:
          systemInformation.resolution,
        refreshRateHz:
          systemInformation.refreshRateHz,
        fortniteRunning:
          fortniteStatus.running,
        isLoading: false,
      });
    } catch {
      set({
        isLoading: false,
      });
    }
  },
}));