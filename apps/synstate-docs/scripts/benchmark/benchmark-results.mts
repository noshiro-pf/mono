import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Num, Result } from 'ts-data-forge';
import {
  type BenchmarkEnvironment,
  readBenchmarkEnvironment,
} from './environment.mjs';

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

/**
 * `BenchmarkMeta` as written, with the environment {@link
 * writeBenchmarkResults} stamps on.
 *
 * It is added there rather than passed by each runner so that no runner can
 * forget it: a results file without its environment is a row of milliseconds
 * nobody can compare with anything.
 */
export type WrittenBenchmarkMeta = BenchmarkMeta &
  Readonly<{ environment: BenchmarkEnvironment }>;

/** A results file as written: {@link BenchmarkResults} plus the environment. */
export type WrittenBenchmarkResults = Readonly<
  | {
      kind: 'series';
      meta: WrittenBenchmarkMeta;
      xLabels: readonly string[];
      series: readonly BenchmarkSeries[];
    }
  | {
      kind: 'stats';
      meta: WrittenBenchmarkMeta;
      rows: readonly BenchmarkStats[];
    }
>;

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
  resultsDir: string,
  resultsFileName: string,
  markdown: string,
  data: BenchmarkResults,
): Promise<void> => {
  const normalized = normalize(data, await readBenchmarkEnvironment());

  const markdownPath = path.resolve(resultsDir, resultsFileName);

  const jsonPath = path.resolve(
    resultsDir,
    resultsFileName.replace(/\.md$/u, '.json'),
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(markdownPath, `${alignTable(markdown)}\n`, 'utf8');

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
 * Pads a pipe table's cells so that its columns line up.
 *
 * The runners build their tables by hand, and a column wide enough for one
 * run is not wide enough for the next: a re-measurement that pushed
 * `Ops/sec` from seven digits to eight left the pipes ragged, and both
 * `check:md` (MD060, table-column-style) and Prettier rejected the file. The
 * pass that would have fixed it is `pnpm run fmt`, which is exactly the step a
 * re-measurement commit forgets — it had to be remembered twice before this
 * moved here.
 *
 * What it writes is what Prettier writes, verified cell for cell against
 * `prettier --write` on all five results files: each column as wide as its
 * widest cell and at least three, the separator filled with dashes carrying
 * the alignment's colons, and every cell padded to its column's alignment.
 * So `fmt` over a freshly generated file is a no-op rather than a diff.
 *
 * Widths are counted in code units, which is right while every cell is a
 * library name, a number or `> 5000 ms`. A full-width character would need a
 * display width instead, as Prettier uses.
 */
const alignTable = (markdown: string): string => {
  const lines = markdown.split('\n');

  if (
    lines.length < 2 ||
    lines.some((line) => !(line.startsWith('|') && line.endsWith('|')))
  ) {
    return markdown;
  }

  const rows: readonly (readonly string[])[] = lines.map((line) =>
    line
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim()),
  );

  const separator = rows[1];

  if (separator === undefined) {
    return markdown;
  }

  const alignments: readonly ColumnAlignment[] = separator.map((cell) =>
    cell.startsWith(':') && cell.endsWith(':')
      ? 'center'
      : cell.endsWith(':')
        ? 'right'
        : cell.startsWith(':')
          ? 'left'
          : 'none',
  );

  const cellRows = rows.filter((_, i) => i !== 1);

  const widths = alignments.map((_, column) =>
    Math.max(
      MIN_COLUMN_WIDTH,
      ...cellRows.map((row) => (row[column] ?? '').length),
    ),
  );

  const width = (column: number): number => widths[column] ?? MIN_COLUMN_WIDTH;

  return rows
    .map((row, i) =>
      i === 1
        ? `| ${alignments.map((alignment, column) => separatorCell(width(column), alignment)).join(' | ')} |`
        : `| ${row.map((cell, column) => padCell(cell, width(column), alignments[column] ?? 'none')).join(' | ')} |`,
    )
    .join('\n');
};

type ColumnAlignment = 'center' | 'left' | 'none' | 'right';

const MIN_COLUMN_WIDTH = 3;

const separatorCell = (width: number, alignment: ColumnAlignment): string => {
  switch (alignment) {
    case 'right':
      return `${'-'.repeat(width - 1)}:`;
    case 'center':
      return `:${'-'.repeat(width - 2)}:`;
    case 'left':
      return `:${'-'.repeat(width - 1)}`;
    case 'none':
      return '-'.repeat(width);
  }
};

const padCell = (
  cell: string,
  width: number,
  alignment: ColumnAlignment,
): string => {
  switch (alignment) {
    case 'right':
      return cell.padStart(width);
    case 'center':
      return cell
        .padStart(Math.floor((width - cell.length) / 2) + cell.length)
        .padEnd(width);
    case 'left':
    case 'none':
      return cell.padEnd(width);
  }
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
const normalize = (
  data: BenchmarkResults,
  environment: BenchmarkEnvironment,
): WrittenBenchmarkResults =>
  data.kind === 'series'
    ? ({
        kind: 'series',
        meta: { ...data.meta, environment },
        xLabels: data.xLabels,
        series: data.series.map((s) => ({
          label: plainLabel(s.label),
          values: s.values.map((v) => (v === null ? null : round(v, 1))),
        })),
      } as const)
    : ({
        kind: 'stats',
        meta: { ...data.meta, environment },
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
