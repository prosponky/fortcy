import {
  PlaceholderBenchmarkEngine,
  type BenchmarkEngine,
} from "./BenchmarkEngine";

import {
  PlaceholderDiscordIntegrationService,
  type DiscordIntegrationService,
} from "./DiscordIntegrationService";

import {
  PlaceholderFortniteDetectionService,
  type FortniteDetectionService,
} from "./FortniteDetectionService";

import {
  TauriHardwareMonitoringService,
  type HardwareMonitoringService,
} from "./HardwareMonitoringService";

import {
  TauriInputLatencyService,
  type InputLatencyService,
} from "./InputLatencyService";

import {
  PlaceholderPingService,
  type PingService,
} from "./PingService";

import {
  PlaceholderReportGeneratorService,
  type ReportGeneratorService,
} from "./ReportGeneratorService";

import {
  PlaceholderSettingsBackupService,
  type SettingsBackupService,
} from "./SettingsBackupService";

import {
  PlaceholderStorageManager,
  type StorageManager,
} from "./StorageManager";

import {
  PlaceholderSystemInformationService,
  type SystemInformationService,
} from "./SystemInformationService";

import {
  ProtectedFortniteStatsService,
  type FortniteStatsService,
} from "./FortniteStatsService";

interface FortcyServices {
  systemInformation: SystemInformationService;
  benchmark: BenchmarkEngine;
  ping: PingService;
  fortnite: FortniteDetectionService;
  hardwareMonitoring: HardwareMonitoringService;
  inputLatency: InputLatencyService;
  settingsBackup: SettingsBackupService;
  reports: ReportGeneratorService;
  storage: StorageManager;
  discord: DiscordIntegrationService;
  fortniteStats: FortniteStatsService;
}

export const services: FortcyServices = {
  systemInformation:
    new PlaceholderSystemInformationService(),

  benchmark:
    new PlaceholderBenchmarkEngine(),

  ping:
    new PlaceholderPingService(),

  fortnite:
    new PlaceholderFortniteDetectionService(),

  hardwareMonitoring:
    new TauriHardwareMonitoringService(),

  inputLatency:
    new TauriInputLatencyService(),

  settingsBackup:
    new PlaceholderSettingsBackupService(),

  reports:
    new PlaceholderReportGeneratorService(),

  storage:
    new PlaceholderStorageManager(),

  discord:
    new PlaceholderDiscordIntegrationService(),

  fortniteStats:
    new ProtectedFortniteStatsService(),
};

export * from "./BenchmarkEngine";
export * from "./DiscordIntegrationService";
export * from "./FortniteDetectionService";
export * from "./FortniteStatsService";
export * from "./HardwareMonitoringService";
export * from "./InputLatencyService";
export * from "./PingService";
export * from "./ReportGeneratorService";
export * from "./SettingsBackupService";
export * from "./StorageManager";
export * from "./SystemInformationService";
