import { create } from "zustand";

import {
  getPingRegionFromMatchmakingCode,
  services,
} from "../services";
import { useResultsStore } from "./resultsStore";

type MatchState =
  | "waiting"
  | "in_match"
  | "match_ended";

interface BenchmarkState {
  isRunning: boolean;
  benchmarkStartedAt: string | null;

  matchState: MatchState;
  logFound: boolean;
  isCheckingMatch: boolean;
  matchRegion: string | null;

  gameServerIp: string | null;
  gameServerPort: number | null;
  pingAddress: string | null;
  pingPort: number | null;
  serverLocation: string | null;

  pingSampleTotal: number;
  pingSampleCount: number;

  gameServerPingSampleTotal: number;
  gameServerPingSampleCount: number;

  gpuTemperatureSampleTotal: number;
  gpuTemperatureSampleCount: number;

  cpuTemperatureSampleTotal: number;
  cpuTemperatureSampleCount: number;

  lastTemperatureSampleAt: number | null;

  inputLatencySampleTotal: number;
  inputLatencySampleCount: number;
  isInputLatencySampling: boolean;

  averageFps: number | null;
  gpuTemperatureC: number | null;
  cpuTemperatureC: number | null;
  mouseInputLatencyMs: number | null;
  allInputLatencyMs: number | null;
  averagePingMs: number | null;
  gameServerPingMs: number | null;

  startBenchmark: () => Promise<void>;
  stopBenchmark: () => Promise<void>;
  checkMatchState: () => Promise<void>;
  sampleMatchPing: () => Promise<void>;
  sampleTemperatures: () => Promise<void>;
  sampleInputLatency: () => Promise<void>;

  setMetrics: (metrics: {
    averageFps?: number | null;
    gpuTemperatureC?: number | null;
    cpuTemperatureC?: number | null;
    mouseInputLatencyMs?: number | null;
    allInputLatencyMs?: number | null;
    averagePingMs?: number | null;
    gameServerPingMs?: number | null;
  }) => void;

  resetBenchmark: () => void;
}

const TEMPERATURE_SAMPLE_INTERVAL_MS =
  10_000;

const emptyMetrics = {
  averageFps: null,
  gpuTemperatureC: null,
  cpuTemperatureC: null,
  mouseInputLatencyMs: null,
  allInputLatencyMs: null,
  averagePingMs: null,
  gameServerPingMs: null,
};

const initialState = {
  isRunning: false,
  benchmarkStartedAt: null,

  matchState: "waiting" as MatchState,
  logFound: false,
  isCheckingMatch: false,
  matchRegion: null,

  gameServerIp: null,
  gameServerPort: null,
  pingAddress: null,
  pingPort: null,
  serverLocation: null,

  pingSampleTotal: 0,
  pingSampleCount: 0,

  gameServerPingSampleTotal: 0,
  gameServerPingSampleCount: 0,

  gpuTemperatureSampleTotal: 0,
  gpuTemperatureSampleCount: 0,

  cpuTemperatureSampleTotal: 0,
  cpuTemperatureSampleCount: 0,

  lastTemperatureSampleAt: null,

  inputLatencySampleTotal: 0,
  inputLatencySampleCount: 0,
  isInputLatencySampling: false,

  ...emptyMetrics,
};

export const useBenchmarkStore =
  create<BenchmarkState>((set, get) => ({
    ...initialState,

    startBenchmark: async () => {
      if (get().isRunning) {
        return;
      }

      await services.benchmark.start();

      set({
        ...emptyMetrics,

        pingSampleTotal: 0,
        pingSampleCount: 0,

        gameServerPingSampleTotal: 0,
        gameServerPingSampleCount: 0,

        gpuTemperatureSampleTotal: 0,
        gpuTemperatureSampleCount: 0,

        cpuTemperatureSampleTotal: 0,
        cpuTemperatureSampleCount: 0,

        lastTemperatureSampleAt: null,

        inputLatencySampleTotal: 0,
        inputLatencySampleCount: 0,
        isInputLatencySampling: false,

        benchmarkStartedAt:
          new Date().toISOString(),

        isRunning: true,
      });
    },

    stopBenchmark: async () => {
      if (!get().isRunning) {
        return;
      }

      await services.benchmark.stop();

      set({
        isRunning: false,
      });
    },

    sampleInputLatency: async () => {
      const {
        isRunning,
        matchState,
        isInputLatencySampling,
      } = get();

      if (
        !isRunning ||
        matchState !== "in_match" ||
        isInputLatencySampling
      ) {
        return;
      }

      set({
        isInputLatencySampling: true,
      });

      try {
        const reading =
          await services.inputLatency.measure();

        if (
          !reading.available ||
          reading.averageLatencyMs === null ||
          reading.sampleCount <= 0
        ) {
          return;
        }

        const currentState =
          get();

        if (!currentState.isRunning) {
          return;
        }

        const weightedSampleTotal =
          reading.averageLatencyMs *
          reading.sampleCount;

        const nextTotal =
          currentState
            .inputLatencySampleTotal +
          weightedSampleTotal;

        const nextCount =
          currentState
            .inputLatencySampleCount +
          reading.sampleCount;

        const nextAverage =
          nextTotal / nextCount;

        set({
          inputLatencySampleTotal:
            nextTotal,

          inputLatencySampleCount:
            nextCount,

          allInputLatencyMs:
            Math.round(
              nextAverage * 100,
            ) / 100,
        });
      } catch {
        // Input-delay measurement is optional.
        // If Windows cannot provide a valid measurement,
        // Fortcy leaves the metric unavailable.
      } finally {
        set({
          isInputLatencySampling: false,
        });
      }
    },

    sampleTemperatures: async () => {
      const {
        isRunning,
        matchState,
        lastTemperatureSampleAt,
      } = get();

      if (
        !isRunning ||
        matchState !== "in_match"
      ) {
        return;
      }

      const now = Date.now();

      if (
        lastTemperatureSampleAt !== null &&
        now - lastTemperatureSampleAt <
          TEMPERATURE_SAMPLE_INTERVAL_MS
      ) {
        return;
      }

      set({
        lastTemperatureSampleAt: now,
      });

      try {
        const reading =
          await services.hardwareMonitoring
            .getTemperatures();

        if (
          reading.gpuAvailable &&
          reading.gpuTemperatureC !== null
        ) {
          const currentTotal =
            get().gpuTemperatureSampleTotal;

          const currentCount =
            get().gpuTemperatureSampleCount;

          const nextTotal =
            currentTotal +
            reading.gpuTemperatureC;

          const nextCount =
            currentCount + 1;

          const nextAverage =
            nextTotal / nextCount;

          set({
            gpuTemperatureSampleTotal:
              nextTotal,

            gpuTemperatureSampleCount:
              nextCount,

            gpuTemperatureC:
              Math.round(
                nextAverage * 10,
              ) / 10,
          });
        }

        if (
          reading.cpuAvailable &&
          reading.cpuTemperatureC !== null
        ) {
          const currentTotal =
            get().cpuTemperatureSampleTotal;

          const currentCount =
            get().cpuTemperatureSampleCount;

          const nextTotal =
            currentTotal +
            reading.cpuTemperatureC;

          const nextCount =
            currentCount + 1;

          const nextAverage =
            nextTotal / nextCount;

          set({
            cpuTemperatureSampleTotal:
              nextTotal,

            cpuTemperatureSampleCount:
              nextCount,

            cpuTemperatureC:
              Math.round(
                nextAverage * 10,
              ) / 10,
          });
        }
      } catch {
        // Temperature monitoring is optional.
        // Unsupported or unavailable sensors remain null
        // and the UI can display N/A.
      }
    },

    sampleMatchPing: async () => {
      const {
        isRunning,
        matchState,
        matchRegion,
        gameServerIp,
      } = get();

      if (
        !isRunning ||
        matchState !== "in_match"
      ) {
        return;
      }

      const pingRegion =
        getPingRegionFromMatchmakingCode(
          matchRegion,
        );

      if (pingRegion) {
        try {
          const result =
            await services.ping.testRegion(
              pingRegion,
            );

          if (result.latencyMs !== null) {
            const currentTotal =
              get().pingSampleTotal;

            const currentCount =
              get().pingSampleCount;

            const nextTotal =
              currentTotal +
              result.latencyMs;

            const nextCount =
              currentCount + 1;

            const nextAverage =
              Math.round(
                nextTotal /
                  nextCount,
              );

            set({
              pingSampleTotal:
                nextTotal,

              pingSampleCount:
                nextCount,

              averagePingMs:
                nextAverage,
            });
          }
        } catch {
          // Ignore individual failed regional ping samples.
        }
      }

      if (gameServerIp) {
        try {
          const result =
            await services.ping.testGameServer(
              gameServerIp,
            );

          if (result.latencyMs !== null) {
            const currentTotal =
              get()
                .gameServerPingSampleTotal;

            const currentCount =
              get()
                .gameServerPingSampleCount;

            const nextTotal =
              currentTotal +
              result.latencyMs;

            const nextCount =
              currentCount + 1;

            const nextAverage =
              Math.round(
                nextTotal /
                  nextCount,
              );

            set({
              gameServerPingSampleTotal:
                nextTotal,

              gameServerPingSampleCount:
                nextCount,

              gameServerPingMs:
                nextAverage,
            });
          }
        } catch {
          // Ignore individual failed game-server ping samples.
        }
      }
    },

    checkMatchState: async () => {
      if (get().isCheckingMatch) {
        return;
      }

      set({
        isCheckingMatch: true,
      });

      try {
        const previousMatchState =
          get().matchState;

        const matchStatus =
          await services.fortnite
            .getMatchState();

        set({
          matchState:
            matchStatus.state,

          logFound:
            matchStatus.logFound,

          matchRegion:
            matchStatus.region,

          gameServerIp:
            matchStatus.gameServerIp,

          gameServerPort:
            matchStatus.gameServerPort,

          pingAddress:
            matchStatus.pingAddress,

          pingPort:
            matchStatus.pingPort,

          serverLocation:
            matchStatus.serverLocation,

          averageFps:
            matchStatus.averageFps ??
            get().averageFps,
        });

        if (
          matchStatus.state ===
            "in_match" &&
          previousMatchState !==
            "in_match" &&
          !get().isRunning
        ) {
          await services.benchmark.start();

          set({
            ...emptyMetrics,

            pingSampleTotal: 0,
            pingSampleCount: 0,

            gameServerPingSampleTotal: 0,
            gameServerPingSampleCount: 0,

            gpuTemperatureSampleTotal: 0,
            gpuTemperatureSampleCount: 0,

            cpuTemperatureSampleTotal: 0,
            cpuTemperatureSampleCount: 0,

            lastTemperatureSampleAt:
              null,

            inputLatencySampleTotal: 0,
            inputLatencySampleCount: 0,
            isInputLatencySampling: false,

            benchmarkStartedAt:
              new Date().toISOString(),

            isRunning: true,

            matchRegion:
              matchStatus.region,

            gameServerIp:
              matchStatus.gameServerIp,

            gameServerPort:
              matchStatus.gameServerPort,

            pingAddress:
              matchStatus.pingAddress,

            pingPort:
              matchStatus.pingPort,

            serverLocation:
              matchStatus.serverLocation,
          });
        }

        if (
          matchStatus.state ===
            "in_match" &&
          get().isRunning
        ) {
          await Promise.all([
            get().sampleMatchPing(),
            get().sampleTemperatures(),
          ]);

          /*
           * Input monitoring runs in its own sidecar
           * for about 10 seconds.
           *
           * Do not await it here because doing so would
           * pause Fortcy's global match-state watcher.
           * isInputLatencySampling prevents overlapping
           * sidecar measurement windows.
           */
          void get().sampleInputLatency();
        }

        if (
          matchStatus.state ===
            "match_ended" &&
          get().isRunning
        ) {
          const finalAverageFps =
            matchStatus.averageFps ??
            get().averageFps;

          if (
            finalAverageFps === null
          ) {
            return;
          }

          await services.benchmark.stop();

          const completedAt =
            new Date().toISOString();

          const currentState =
            get();

          const result = {
            id: crypto.randomUUID(),

            startedAt:
              currentState
                .benchmarkStartedAt ??
              completedAt,

            completedAt,

            matchRegion:
              matchStatus.region,

            serverLocation:
              matchStatus.serverLocation,

            metrics: {
              averageFps:
                finalAverageFps,

              gpuTemperatureC:
                currentState
                  .gpuTemperatureC,

              cpuTemperatureC:
                currentState
                  .cpuTemperatureC,

              mouseInputLatencyMs:
                currentState
                  .mouseInputLatencyMs,

              allInputLatencyMs:
                currentState
                  .allInputLatencyMs,

              averagePingMs:
                currentState
                  .averagePingMs,

              gameServerPingMs:
                currentState
                  .gameServerPingMs,
            },
          };

          await useResultsStore
            .getState()
            .saveResult(result);

          set({
            isRunning: false,

            benchmarkStartedAt:
              null,

            averageFps:
              finalAverageFps,

            matchRegion:
              matchStatus.region,

            gameServerIp:
              matchStatus.gameServerIp,

            gameServerPort:
              matchStatus.gameServerPort,

            pingAddress:
              matchStatus.pingAddress,

            pingPort:
              matchStatus.pingPort,

            serverLocation:
              matchStatus.serverLocation,
          });
        }
      } catch {
        // Keep the last known match state if detection fails.
      } finally {
        set({
          isCheckingMatch: false,
        });
      }
    },

    setMetrics: (metrics) => {
      set(metrics);
    },

    resetBenchmark: () => {
      set(initialState);
    },
  }));