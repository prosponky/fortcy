import type {
  BenchmarkMetrics,
  BenchmarkResult,
} from "../types/services";

export interface BenchmarkEngine {
  start(): Promise<void>;
  stop(): Promise<BenchmarkResult>;
  getCurrentMetrics(): Promise<BenchmarkMetrics>;
  isRunning(): boolean;
}

export class PlaceholderBenchmarkEngine
  implements BenchmarkEngine
{
  private running = false;

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<BenchmarkResult> {
    this.running = false;

    const now =
      new Date().toISOString();

    return {
      id: crypto.randomUUID(),
      startedAt: now,
      completedAt: now,

      matchRegion: null,
      serverLocation: null,

      metrics: {
        averageFps: null,
        gpuTemperatureC: null,
        cpuTemperatureC: null,
        mouseInputLatencyMs: null,
        allInputLatencyMs: null,
        averagePingMs: null,
        gameServerPingMs: null,
      },
    };
  }

  async getCurrentMetrics():
    Promise<BenchmarkMetrics>
  {
    return {
      averageFps: null,
      gpuTemperatureC: null,
      cpuTemperatureC: null,
      mouseInputLatencyMs: null,
      allInputLatencyMs: null,
      averagePingMs: null,
      gameServerPingMs: null,
    };
  }

  isRunning(): boolean {
    return this.running;
  }
}