import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import type {
  BenchmarkResult,
  StoredBenchmark,
} from "../types/services";

const BENCHMARKS_DIRECTORY =
  "benchmarks";

const BENCHMARKS_FILE =
  "benchmarks/fortcy-benchmarks.json";

export interface StorageManager {
  saveBenchmark(
    result: BenchmarkResult,
  ): Promise<void>;

  getBenchmarks(): Promise<StoredBenchmark[]>;

  getLatestBenchmark(): Promise<StoredBenchmark | null>;

  clearBenchmarks(): Promise<void>;
}

export class PlaceholderStorageManager
  implements StorageManager
{
  private async ensureStorageDirectory():
    Promise<void>
  {
    const directoryExists =
      await exists(
        BENCHMARKS_DIRECTORY,
        {
          baseDir:
            BaseDirectory.AppData,
        },
      );

    if (directoryExists) {
      return;
    }

    await mkdir(
      BENCHMARKS_DIRECTORY,
      {
        baseDir:
          BaseDirectory.AppData,
        recursive: true,
      },
    );
  }

  private async readBenchmarks():
    Promise<StoredBenchmark[]>
  {
    try {
      await this.ensureStorageDirectory();

      const fileExists =
        await exists(
          BENCHMARKS_FILE,
          {
            baseDir:
              BaseDirectory.AppData,
          },
        );

      if (!fileExists) {
        return [];
      }

      const contents =
        await readTextFile(
          BENCHMARKS_FILE,
          {
            baseDir:
              BaseDirectory.AppData,
          },
        );

      const parsed =
        JSON.parse(contents);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as StoredBenchmark[];
    } catch (error) {
      console.error(
        "Failed to read benchmark storage:",
        error,
      );

      return [];
    }
  }

  private async writeBenchmarks(
    benchmarks: StoredBenchmark[],
  ): Promise<void> {
    await this.ensureStorageDirectory();

    const contents =
      JSON.stringify(
        benchmarks,
        null,
        2,
      );

    await writeTextFile(
      BENCHMARKS_FILE,
      contents,
      {
        baseDir:
          BaseDirectory.AppData,
      },
    );
  }

  async saveBenchmark(
    result: BenchmarkResult,
  ): Promise<void> {
    const benchmarks =
      await this.readBenchmarks();

    benchmarks.push({
      result,
    });

    await this.writeBenchmarks(
      benchmarks,
    );
  }

  async getBenchmarks():
    Promise<StoredBenchmark[]>
  {
    return this.readBenchmarks();
  }

  async getLatestBenchmark():
    Promise<StoredBenchmark | null>
  {
    const benchmarks =
      await this.readBenchmarks();

    const latest =
      benchmarks[
        benchmarks.length - 1
      ];

    return latest ?? null;
  }

  async clearBenchmarks():
    Promise<void>
  {
    await this.writeBenchmarks([]);
  }
}