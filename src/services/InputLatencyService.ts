import { invoke } from "@tauri-apps/api/core";

export interface InputLatencyReading {
  averageLatencyMs: number | null;
  sampleCount: number;
  available: boolean;
}

export interface InputLatencyService {
  measure(): Promise<InputLatencyReading>;
}

export class TauriInputLatencyService
  implements InputLatencyService
{
  async measure(): Promise<InputLatencyReading> {
    return invoke<InputLatencyReading>(
      "measure_input_latency",
    );
  }
}