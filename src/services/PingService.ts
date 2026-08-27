import { invoke } from "@tauri-apps/api/core";

import type {
  PingRegion,
  PingResult,
} from "../types/services";

interface RustLatencyResult {
  latencyMs: number | null;
}

export const fortnitePingRegions: PingRegion[] = [
  {
    id: "na-east",
    name: "NA East",
    location: "North America",
  },
  {
    id: "na-central",
    name: "NA Central",
    location: "North America",
  },
  {
    id: "na-west",
    name: "NA West",
    location: "North America",
  },
  {
    id: "europe",
    name: "Europe",
    location: "Europe",
  },
  {
    id: "oceania",
    name: "Oceania",
    location: "Oceania",
  },
  {
    id: "brazil",
    name: "Brazil",
    location: "South America",
  },
  {
    id: "asia",
    name: "Asia",
    location: "Asia",
  },
];

const fortniteRegionHosts: Record<string, string> = {
  "na-east": "ping-nae.ds.on.epicgames.com",
  "na-central": "ping-nac.ds.on.epicgames.com",
  "na-west": "ping-naw.ds.on.epicgames.com",
  europe: "ping-eu.ds.on.epicgames.com",
  oceania: "ping-oce.ds.on.epicgames.com",
  brazil: "ping-br.ds.on.epicgames.com",
  asia: "ping-asia.ds.on.epicgames.com",
};

const matchmakingRegionMap: Record<string, string> = {
  NAE: "na-east",
  NAC: "na-central",
  NAW: "na-west",
  EU: "europe",
  OCE: "oceania",
  BR: "brazil",
  ASIA: "asia",
};

export function getPingRegionFromMatchmakingCode(
  matchmakingCode: string | null,
): PingRegion | null {
  if (!matchmakingCode) {
    return null;
  }

  const normalizedCode =
    matchmakingCode.trim().toUpperCase();

  const regionId =
    matchmakingRegionMap[normalizedCode];

  if (!regionId) {
    return null;
  }

  return (
    fortnitePingRegions.find(
      (region) => region.id === regionId,
    ) ?? null
  );
}

export interface PingService {
  testRegion(
    region: PingRegion,
  ): Promise<PingResult>;

  testGameServer(
    host: string,
  ): Promise<PingResult>;

  testAllRegions(
    regions: PingRegion[],
  ): Promise<PingResult[]>;
}

export class PlaceholderPingService
  implements PingService
{
  async testRegion(
    region: PingRegion,
  ): Promise<PingResult> {
    const host =
      fortniteRegionHosts[region.id];

    if (!host) {
      return {
        regionId: region.id,
        latencyMs: null,
        testedAt: new Date().toISOString(),
      };
    }

    const result =
      await invoke<RustLatencyResult>(
        "measure_latency",
        {
          host,
        },
      );

    return {
      regionId: region.id,
      latencyMs: result.latencyMs,
      testedAt: new Date().toISOString(),
    };
  }

  async testGameServer(
    host: string,
  ): Promise<PingResult> {
    const result =
      await invoke<RustLatencyResult>(
        "measure_latency",
        {
          host,
        },
      );

    return {
      regionId: "game-server",
      latencyMs: result.latencyMs,
      testedAt: new Date().toISOString(),
    };
  }

  async testAllRegions(
    regions: PingRegion[],
  ): Promise<PingResult[]> {
    return Promise.all(
      regions.map((region) =>
        this.testRegion(region),
      ),
    );
  }
}