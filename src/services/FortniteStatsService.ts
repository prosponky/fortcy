export interface FortnitePlayerStats {
  displayName: string;
  wins: number | null;
  kills: number | null;
  matches: number | null;
  winRate: number | null;
  updatedAt: string | null;
}

export interface FortniteStatsService {
  isConfigured(): boolean;
  getPlayerStats(displayName: string): Promise<FortnitePlayerStats>;
}

/**
 * Calls Fortcy's protected proxy. The provider API key must stay on that proxy,
 * never in the desktop client.
 */
export class ProtectedFortniteStatsService implements FortniteStatsService {
  private readonly baseUrl =
    ((import.meta.env.VITE_FORTCY_STATS_PROXY_URL as string | undefined) ?? "http://127.0.0.1:8787").replace(/\/$/, "");

  isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  async getPlayerStats(displayName: string): Promise<FortnitePlayerStats> {
    if (!this.isConfigured()) {
      throw new Error("Fortcy stats proxy is not configured");
    }

    const response = await fetch(`${this.baseUrl}/stats/player?displayName=${encodeURIComponent(displayName)}`);
    if (!response.ok) {
      throw new Error(`Stats request failed with status ${response.status}`);
    }

    return (await response.json()) as FortnitePlayerStats;
  }
}
