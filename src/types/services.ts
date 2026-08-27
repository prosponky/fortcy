export type ServiceStatus =
  | "idle"
  | "ready"
  | "running"
  | "success"
  | "error";

export interface SystemInformation {
  operatingSystem: string;
  resolution: string;
  refreshRateHz: number | null;
}

export interface BenchmarkMetrics {
  averageFps: number | null;
  gpuTemperatureC: number | null;
  cpuTemperatureC: number | null;
  mouseInputLatencyMs: number | null;
  allInputLatencyMs: number | null;
  averagePingMs: number | null;
  gameServerPingMs: number | null;
}

export interface BenchmarkResult {
  id: string;
  startedAt: string;
  completedAt: string | null;

  matchRegion: string | null;
  serverLocation: string | null;

  metrics: BenchmarkMetrics;
}

export interface PingRegion {
  id: string;
  name: string;
  location: string;
}

export interface PingResult {
  regionId: string;
  latencyMs: number | null;
  testedAt: string;
}

export interface FortniteStatus {
  installed: boolean;
  running: boolean;
  installPath: string | null;
  settingsPath: string | null;
}

export interface SettingsBackupInfo {
  exists: boolean;
  backupPath: string | null;
  createdAt: string | null;
}

export interface GeneratedReport {
  id: string;
  createdAt: string;
  filePath: string | null;
}

export interface StoredBenchmark {
  result: BenchmarkResult;
}

export interface DiscordPresence {
  connected: boolean;
}