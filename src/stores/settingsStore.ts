import { create } from "zustand";
import { services } from "../services";

interface SettingsStore {
  lastBackup: string;
  status: string;
  isBusy: boolean;

  createBackup: () => Promise<void>;
  restoreBackup: () => Promise<void>;
  exportSettings: () => Promise<void>;
  importSettings: () => Promise<void>;

  resetSettingsState: () => void;
}

const initialState = {
  lastBackup: "No backup yet",
  status: "Ready",
  isBusy: false,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...initialState,

  createBackup: async () => {
    set({
      status: "Creating backup...",
      isBusy: true,
    });

    try {
      await services.settingsBackup.createBackup();

      set({
        status: "Backup complete",
        lastBackup: "Today · Just now",
        isBusy: false,
      });
    } catch {
      set({
        status: "Backup failed",
        isBusy: false,
      });
    }
  },

  restoreBackup: async () => {
    set({
      status: "Restoring backup...",
      isBusy: true,
    });

    try {
      await services.settingsBackup.restoreBackup();

      set({
        status: "Restore complete",
        isBusy: false,
      });
    } catch {
      set({
        status: "Restore failed",
        isBusy: false,
      });
    }
  },

  exportSettings: async () => {
    set({
      status: "Exporting settings...",
      isBusy: true,
    });

    try {
      await services.settingsBackup.exportSettings();

      set({
        status: "Export complete",
        isBusy: false,
      });
    } catch {
      set({
        status: "Export failed",
        isBusy: false,
      });
    }
  },

  importSettings: async () => {
    set({
      status: "Importing settings...",
      isBusy: true,
    });

    try {
      const imported = await services.settingsBackup.importSettings();

      set({
        status: imported ? "Import complete" : "Nothing imported",
        isBusy: false,
      });
    } catch {
      set({
        status: "Import failed",
        isBusy: false,
      });
    }
  },

  resetSettingsState: () => {
    set(initialState);
  },
}));
