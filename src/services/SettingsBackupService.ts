import type { SettingsBackupInfo } from "../types/services";

export interface SettingsBackupService {
  getBackupInfo(): Promise<SettingsBackupInfo>;

  createBackup(): Promise<SettingsBackupInfo>;

  restoreBackup(): Promise<void>;

  exportSettings(): Promise<void>;

  importSettings(): Promise<boolean>;
}

export class PlaceholderSettingsBackupService
  implements SettingsBackupService
{
  async getBackupInfo(): Promise<SettingsBackupInfo> {
    const createdAt = window.localStorage.getItem("fortcy.settingsBackupCreatedAt");
    return {
      exists: Boolean(window.localStorage.getItem("fortcy.settingsBackup")),
      backupPath: "Fortcy local settings backup",
      createdAt,
    };
  }

  async createBackup(): Promise<SettingsBackupInfo> {
    const snapshot = this.captureSettings();
    window.localStorage.setItem("fortcy.settingsBackup", JSON.stringify(snapshot));
    window.localStorage.setItem("fortcy.settingsBackupCreatedAt", new Date().toISOString());
    return {
      exists: true,
      backupPath: "Fortcy local settings backup",
      createdAt: new Date().toISOString(),
    };
  }

  async restoreBackup(): Promise<void> {
    const raw = window.localStorage.getItem("fortcy.settingsBackup");
    if (!raw) throw new Error("No backup exists yet");
    this.restoreSnapshot(JSON.parse(raw));
  }

  async exportSettings(): Promise<void> {
    const blob = new Blob([JSON.stringify(this.captureSettings(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fortcy-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async importSettings(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const input = document.createElement("input");
      let settled = false;
      const finish = (result: boolean) => {
        if (settled) return;
        settled = true;
        window.removeEventListener("focus", onWindowFocus);
        resolve(result);
      };
      const onWindowFocus = () => {
        window.setTimeout(() => {
          if (!input.files?.length) finish(false);
        }, 250);
      };
      input.type = "file";
      input.accept = "application/json,.json";
      input.onchange = async () => {
        try {
          const file = input.files?.[0];
          if (!file) return finish(false);
          this.restoreSnapshot(JSON.parse(await file.text()));
          finish(true);
        } catch (error) { reject(error); }
      };
      input.oncancel = () => finish(false);
      window.addEventListener("focus", onWindowFocus, { once: false });
      input.click();
    });
  }

  private captureSettings(): Record<string, string> {
    return Object.fromEntries(Object.keys(window.localStorage)
      .filter((key) => key.startsWith("fortcy."))
      .map((key) => [key, window.localStorage.getItem(key) ?? ""]));
  }

  private restoreSnapshot(snapshot: Record<string, string>): void {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("fortcy.")) window.localStorage.removeItem(key);
    }
    for (const [key, value] of Object.entries(snapshot)) {
      if (key.startsWith("fortcy.")) window.localStorage.setItem(key, value);
    }
    window.location.reload();
  }
}
