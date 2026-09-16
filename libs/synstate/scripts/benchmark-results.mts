import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Num, Result } from 'ts-data-forge';

/**
 * One library's row in a scenario swept over a parameter (`N`, `B`, `K`/`M`).
 */
export type BenchmarkSeries = Readonly<{
  label: string;

  /** Median ms at each point, `null` where the measurement timed out. */
  values: readonly (number | null)[];
}>;

/**
 * The constants the runner drove the scenario with.
 *
 * They are quoted in the prose beside the table — "measurements exceeding
 * 5,000 ms are aborted", "over $K = 100{,}000$ updates" — and a derived figure
 * such as "ns per branch per update" cannot be computed without them. Recorded
 * by the runner rather than repeated in the docs, so that changing `K` in the
 * runner changes every sentence that names it.
 */
export type BenchmarkMeta = Readonly<{
  /**
   * Updates driven per measurement — `K` in the scenario's description.
   * `null` where the sweep varies `K` itself, so that each point's value is
   * already in its column heading.
   */
  updates: number | null;

  /**
   * A measurement taking longer than this is abandoned and recorded as `null`.
   * `null` where the scenario has no timeout.
   */
  timeoutMs: number | null;
}>;

/** One library's row in a scenario measured at a single parameter point. */
export type BenchmarkStats = Readonly<{
  label: string;
  median: number;
  min: number;
  max: number;
  p95: number;
  opsPerSec: number;
}>;

/**
 * Renders one measurement as the Markdown table shows it.
 *
 * Shared rather than repeated per runner so that the timeout spelling — which
 * a reader sees and which `null` stands for in the JSON — has one definition.
 */
export const formatBenchmarkCell = (
  value: number | null,
  timeoutMs: number,
): string =>
  value === null
    ? (`> ${timeoutMs.toString()} ms` as const)
    : (`${value.toFixed(1)} ms` as const);

export type BenchmarkResults = Readonly<
  | {
      kind: 'series';
      meta: BenchmarkMeta;
      xLabels: readonly string[];
      series: readonly BenchmarkSeries[];
    }
  | { kind: 'stats'; meta: BenchmarkMeta; rows: readonly BenchmarkStats[] }
>;

/**
 * Writes one scenario's results twice: the Markdown table the docs embed, and
 * the JSON everything else derives from.
 *
 * Both come out of a single call so that they cannot describe different runs.
 * The Markdown is what a reader sees and what `gen:benchmark-doc` splices into
 * `benchmark.mdx`; the JSON is what the chart components and the prose numbers
 * read, because neither can recover a number from a formatted table cell — a
 * timeout, for one, renders as `> 5000 ms` and is `null` here.
 */
export const writeBenchmarkResults = async (
  benchmarkDir: string,
  resultsFileName: string,
  markdown: string,
  data: BenchmarkResults,
): Promise<void> => {
  const normalized = normalize(data);

  const markdownPath = path.resolve(benchmarkDir, resultsFileName);

  const jsonPath = path.resolve(
    benchmarkDir,
    resultsFileName.replace(/\.md$/u, '.json'),
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(markdownPath, `${markdown}\n`, 'utf8');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    jsonPath,
    `${JSON.stringify(normalized, undefined, 2)}\n`,
    'utf8',
  );

  console.info(`\n✓ Results written to ${markdownPath}`);

  console.info(`✓ Results written to ${jsonPath}`);
};

/**
 * Brings the JSON into line with the table rendered beside it.
 *
 * Two differences would otherwise creep in. A runner labels its own row for
 * the table — `**SynState**` — and that emphasis is a rendering choice, not
 * part of the library's name. And a raw measurement carries every digit the
 * clock produced, so the JSON would disagree with the table it was written
 * with and would churn the diff on every run; each value is rounded to the
 * precision its table column shows.
 */
const normalize = (data: BenchmarkResults): BenchmarkResults =>
  data.kind === 'series'
    ? ({
        kind: 'series',
        meta: data.meta,
        xLabels: data.xLabels,
        series: data.series.map((s) => ({
          label: plainLabel(s.label),
          values: s.values.map((v) => (v === null ? null : round(v, 1))),
        })),
      } as const)
    : ({
        kind: 'stats',
        meta: data.meta,
        rows: data.rows.map((r) => ({
          label: plainLabel(r.label),
          median: round(r.median, 2),
          min: round(r.min, 2),
          max: round(r.max, 2),
          p95: round(r.p95, 2),
          opsPerSec: r.opsPerSec,
        })),
      } as const);

const plainLabel = (label: string): string => label.replaceAll('*', '');

const round = (value: number, digits: 1 | 2): number =>
  Result.unwrapOkOr(Num.safeParseFloat(value.toFixed(digits)), Number.NaN);
