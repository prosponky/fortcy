import { create } from "zustand";
import { services } from "../services";
import {
  fortnitePingRegions,
} from "../services/PingService";

interface PingStore {
  isTesting: boolean;
  hasTested: boolean;
  values: Array<number | null>;

  testAllRegions: () => Promise<void>;
  resetTest: () => void;
}

export const usePingStore = create<PingStore>((set) => ({
  isTesting: false,
  hasTested: false,
  values: [],

  testAllRegions: async () => {
    set({
      isTesting: true,
      hasTested: false,
      values: [],
    });

    try {
      const results =
        await services.ping.testAllRegions(
          fortnitePingRegions,
        );

      set({
        isTesting: false,
        hasTested: true,
        values: results.map(
          (result) => result.latencyMs,
        ),
      });
    } catch {
      set({
        isTesting: false,
        hasTested: false,
        values: [],
      });
    }
  },

  resetTest: () => {
    set({
      isTesting: false,
      hasTested: false,
      values: [],
    });
  },
}));