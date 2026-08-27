import { invoke } from "@tauri-apps/api/core";

import type { FortniteStatus } from "../types/services";

interface RustFortniteStatus {
  running: boolean;
}

interface RustMatchState {
  state: "waiting" | "in_match" | "match_ended";
  logFound: boolean;
  region: string | null;
  gameServerIp: string | null;
  gameServerPort: number | null;
  pingAddress: string | null;
  pingPort: number | null;
  serverLocation: string | null;
  averageFps: number | null;
}

export type FortniteMatchState =
  | "waiting"
  | "in_match"
  | "match_ended";

export interface FortniteMatchStatus {
  state: FortniteMatchState;
  logFound: boolean;
  region: string | null;
  gameServerIp: string | null;
  gameServerPort: number | null;
  pingAddress: string | null;
  pingPort: number | null;
  serverLocation: string | null;
  averageFps: number | null;
}

export interface FortniteDetectionService {
  getStatus(): Promise<FortniteStatus>;
  getMatchState(): Promise<FortniteMatchStatus>;
}

export class PlaceholderFortniteDetectionService
  implements FortniteDetectionService
{
  async getStatus(): Promise<FortniteStatus> {
    const status =
      await invoke<RustFortniteStatus>(
        "get_fortnite_status",
      );

    return {
      installed: false,
      running: status.running,
      installPath: null,
      settingsPath: null,
    };
  }

  async getMatchState(): Promise<FortniteMatchStatus> {
    const status =
      await invoke<RustMatchState>(
        "get_match_state",
      );

    return {
      state: status.state,
      logFound: status.logFound,
      region: status.region,
      gameServerIp: status.gameServerIp,
      gameServerPort: status.gameServerPort,
      pingAddress: status.pingAddress,
      pingPort: status.pingPort,
      serverLocation: status.serverLocation,
      averageFps: status.averageFps,
    };
  }
}