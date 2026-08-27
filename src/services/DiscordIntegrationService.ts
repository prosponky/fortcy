import type { DiscordPresence } from "../types/services";

export interface DiscordIntegrationService {
  getPresence(): Promise<DiscordPresence>;

  connect(): Promise<void>;

  disconnect(): Promise<void>;
}

export class PlaceholderDiscordIntegrationService
  implements DiscordIntegrationService
{
  async getPresence(): Promise<DiscordPresence> {
    return {
      connected: false,
    };
  }

  async connect(): Promise<void> {
    return;
  }

  async disconnect(): Promise<void> {
    return;
  }
}