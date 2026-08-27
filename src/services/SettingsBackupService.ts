import type { SettingsBackupInfo } from "../types/services";

export interface SettingsBackupService {
  getBackupInfo(): Promise<SettingsBackupInfo>;

  createBackup(): Promise<SettingsBackupInfo>;

  restoreBackup(): Promise<void>;

  exportSettings(): Promise<void>;

  importSettings(): Promise<void>;
}

export class PlaceholderSettingsBackupService
  implements SettingsBackupService
{
  async getBackupInfo(): Promise<SettingsBackupInfo> {
    return {
      exists: false,
      backupPath: null,
      createdAt: null,
    };
  }

  async createBackup(): Promise<SettingsBackupInfo> {
    return {
      exists: false,
      backupPath: null,
      createdAt: null,
    };
  }

  async restoreBackup(): Promise<void> {
    return;
  }

  async exportSettings(): Promise<void> {
    return;
  }

  async importSettings(): Promise<void> {
    return;
  }
}