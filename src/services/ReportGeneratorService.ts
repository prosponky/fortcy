import type {
  BenchmarkResult,
  GeneratedReport,
} from "../types/services";

export interface ReportGeneratorService {
  generate(
    benchmark: BenchmarkResult,
  ): Promise<GeneratedReport>;
}

export class PlaceholderReportGeneratorService
  implements ReportGeneratorService
{
  async generate(
    _benchmark: BenchmarkResult,
  ): Promise<GeneratedReport> {
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      filePath: null,
    };
  }
}