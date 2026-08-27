import { create } from "zustand";

import { services } from "../services";
import type {
  BenchmarkResult,
  StoredBenchmark,
} from "../types/services";

interface ResultsStore {
  latestResult: BenchmarkResult | null;
  previousResult: BenchmarkResult | null;
  isLoading: boolean;

  saveResult: (
    result: BenchmarkResult,
  ) => Promise<void>;

  loadLatestResult: () => Promise<void>;

  clearResults: () => Promise<void>;
}

function getTwoLatestResults(
  benchmarks: StoredBenchmark[],
): {
  latestResult: BenchmarkResult | null;
  previousResult: BenchmarkResult | null;
} {
  const latestStored =
    benchmarks[
      benchmarks.length - 1
    ];

  const previousStored =
    benchmarks[
      benchmarks.length - 2
    ];

  return {
    latestResult:
      latestStored?.result ?? null,

    previousResult:
      previousStored?.result ?? null,
  };
}

export const useResultsStore =
  create<ResultsStore>((set) => ({
    latestResult: null,
    previousResult: null,
    isLoading: false,

    saveResult: async (result) => {
      try {
        await services.storage.saveBenchmark(
          result,
        );

        const benchmarks =
          await services.storage.getBenchmarks();

        const {
          latestResult,
          previousResult,
        } =
          getTwoLatestResults(
            benchmarks,
          );

        set({
          latestResult,
          previousResult,
        });
      } catch (error) {
        console.error(
          "Fortcy benchmark save failed:",
          error,
        );

        throw error;
      }
    },

    loadLatestResult: async () => {
      set({
        isLoading: true,
      });

      try {
        const benchmarks =
          await services.storage.getBenchmarks();

        const {
          latestResult,
          previousResult,
        } =
          getTwoLatestResults(
            benchmarks,
          );

        set({
          latestResult,
          previousResult,
          isLoading: false,
        });
      } catch (error) {
        console.error(
          "Fortcy benchmark load failed:",
          error,
        );

        set({
          latestResult: null,
          previousResult: null,
          isLoading: false,
        });
      }
    },

    clearResults: async () => {
      try {
        await services.storage.clearBenchmarks();

        set({
          latestResult: null,
          previousResult: null,
        });
      } catch (error) {
        console.error(
          "Fortcy benchmark clear failed:",
          error,
        );

        throw error;
      }
    },
  }));