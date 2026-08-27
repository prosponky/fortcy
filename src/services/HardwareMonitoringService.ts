import { invoke } from "@tauri-apps/api/core";

export interface HardwareTemperatureReading {
  cpuTemperatureC: number | null;
  gpuTemperatureC: number | null;

  cpuAvailable: boolean;
  gpuAvailable: boolean;

  cpuSource: string;
  gpuSource: string;

  pawnIoInstalled: boolean;
  pawnIoVersion: string | null;
}

export interface HardwareMonitoringService {
  getTemperatures(): Promise<HardwareTemperatureReading>;
}

export class TauriHardwareMonitoringService
  implements HardwareMonitoringService
{
  async getTemperatures(): Promise<HardwareTemperatureReading> {
    return invoke<HardwareTemperatureReading>(
      "get_hardware_temperatures",
    );
  }
}