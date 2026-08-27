import { invoke } from "@tauri-apps/api/core";

interface RustSystemInformation {
  resolution: string;
  refreshRateHz: number | null;
}

export interface SystemDisplayInformation {
  resolution: string;
  refreshRateHz: number | null;
}

export interface SystemInformationService {
  getSystemInformation(): Promise<SystemDisplayInformation>;
}

export class PlaceholderSystemInformationService
  implements SystemInformationService
{
  async getSystemInformation(): Promise<SystemDisplayInformation> {
    const systemInformation =
      await invoke<RustSystemInformation>(
        "get_system_information",
      );

    return {
      resolution:
        systemInformation.resolution,
      refreshRateHz:
        systemInformation.refreshRateHz,
    };
  }
}