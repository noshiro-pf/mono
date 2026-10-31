/**
 * Equality Cut-Off Benchmark
 *
 * Measures what a library does with an update whose intermediate value comes
 * out equal to the previous one.
 *
 * Graph topology:
 *   source → bucket ─┬─ view[0] → subscriber
 *                    ├─ view[1] → subscriber
 *                    ...
 *                    └─ view[W-1] → subscriber
 *
 * `bucket` is `Math.floor(source / 1000)`, so it changes on one update in 1000
 * and is equal to its previous value on the rest. `view[i]` is `bucket + i`,
 * each with a subscriber of its own: W readers of one derived flag, as many
 * components read an "is the list empty" flag under a list that changes on
 * every keystroke. The benchmark writes the source K times.
 *
 * Every library here, except the naive RxJS row, compares a derived value and
 * stops at an equal one; what differs is how much of the subgraph below it is
 * visited first. RxJS compares only where `distinctUntilChanged` is written, so
 * it is measured with it and, naively, without it (the "(naive …)" row, which
 * the chart draws dashed).
 */
import * as path from 'node:path';
import { Num, range } from 'ts-data-forge';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import {
  type BenchmarkSeries,
  formatBenchmarkCell,
  writeBenchmarkResults,
} from './benchmark-results.mjs';
import { isMeasuringChild, measureEachInOwnProcess } from './own-process.mjs';
import { resultsDir, scenarioDir } from './paths.mjs';
import { selectProductionBuilds } from './production-builds.mjs';

selectProductionBuilds();

const WARMUP_ROUNDS = 2;

const MEASURE_ROUNDS = 5;

const TIMEOUT_MS = 5000;

/** K = number of source updates per measurement */
const K = 100_000;

/** View counts to test */
const VIEW_COUNTS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000] as const;

type BenchmarkModule = Readonly<{
  runBenchmark: (k: number, width: number) => number;
}>;

type BenchmarkEntry = Readonly<{
  label: string;
  file: string;
}>;

const entries: readonly BenchmarkEntry[] = [
  { label: '**SynState**', file: '06-equality-cut-off.synstate.mts' },
  { label: 'RxJS', file: '06-equality-cut-off.rxjs.mts' },
  {
    label: 'RxJS (naive, no distinctUntilChanged)',
    file: '06-equality-cut-off.rxjs-naive.mts',
  },
  { label: 'Jotai', file: '06-equality-cut-off.jotai.mts' },
  { label: 'MobX', file: '06-equality-cut-off.mobx.mts' },
  { label: 'Redux', file: '06-equality-cut-off.redux.mts' },
  { label: 'Solid', file: '06-equality-cut-off.solid.mts' },
  { label: 'Preact Signals', file: '06-equality-cut-off.preact-signals.mts' },
] as const;

/** What `runBenchmark(2500, width)` returns: the sum of 2, 3, …, width + 1. */
const expectedCheck = (width: number): number =>
  Num.div(width * (width + 3), 2);

const median = (sorted: readonly number[]): number => {
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
};

if (!isMeasuringChild) {
  console.info(
    `\n## Equality Cut-Off (K=${K.toString()} source updates, ${WARMUP_ROUNDS.toString()} warmup + ${MEASURE_ROUNDS.toString()} measured, timeout=${TIMEOUT_MS.toString()} ms)\n`,
  );
}

/**
 * Runs the measured rounds for a single view count, bailing out as soon as a
 * round exceeds the timeout. Extracted into its own function so that the round
 * loop is not nested inside the entry/view-count loops.
 */
const measureRounds = (
  mod: BenchmarkModule,
  width: number,
): Readonly<{ times: readonly number[]; timedOut: boolean }> => {
  const mut_times: number[] = [];

  let mut_timedOut = false;

  for (const _r of range(0, MEASURE_ROUNDS)) {
    const t0 = performance.now();

    mod.runBenchmark(K, width);

    const elapsed = performance.now() - t0;

    mut_times.push(elapsed);

    if (elapsed > TIMEOUT_MS) {
      mut_timedOut = true;

      break;
    }
  }

  return { times: mut_times, timedOut: mut_timedOut };
};

/**
 * Measures every view count for a single benchmark entry. Extracted into its
 * own function so that the view-count loop is not nested inside the entry loop.
 */
const measureEntry = (
  entry: BenchmarkEntry,
  mod: BenchmarkModule,
): readonly (number | null)[] => {
  const mut_values: (number | null)[] = [];

  let mut_skippingRest = false;

  for (const width of VIEW_COUNTS) {
    if (mut_skippingRest) {
      mut_values.push(null);

      continue;
    }

    // Verify correctness: after 2500 writes the bucket is 2, so the views hold
    // 2, 3, …, W + 1.
    const check = mod.runBenchmark(2500, width);

    if (check !== expectedCheck(width)) {
      console.error(
        `❌ ${entry.label} W=${width.toString()}: got ${check.toString()}`,
      );

      process.exit(1);
    }

    // Warmup
    for (const _w of range(0, WARMUP_ROUNDS)) {
      mod.runBenchmark(K, width);
    }

    // Measure
    const { times, timedOut } = measureRounds(mod, width);

    if (timedOut) {
      mut_values.push(null);

      mut_skippingRest = true;

      console.info(
        `  ⏱ ${entry.label} W=${width.toString()}: TIMEOUT (> ${TIMEOUT_MS.toString()} ms)`,
      );
    } else {
      const sorted = times.toSorted((a, b) => a - b);

      const med = median(sorted);

      mut_values.push(med);

      console.info(
        `  ✓ ${entry.label} W=${width.toString()}: ${med.toFixed(1)} ms`,
      );
    }
  }

  return mut_values;
};

// Column headers
const colHeaders = VIEW_COUNTS.map((w) => `W=${w.toString()}`);

const mut_series: BenchmarkSeries[] = [];

const mut_tableLines: string[] = [
  `| Library | ${colHeaders.join(' | ')} |`,
  `| ------- | ${VIEW_COUNTS.map(() => '----------:').join(' | ')} |`,
];

const measured = await measureEachInOwnProcess(
  import.meta.url,
  entries,
  async (entry) => {
    const filePath = path.resolve(scenarioDir, entry.file);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mod: BenchmarkModule = await import(filePath);

    return measureEntry(entry, mod);
  },
);

for (const [entry, values] of measured) {
  mut_series.push({ label: entry.label, values });

  mut_tableLines.push(
    `| ${entry.label} | ${values.map((v) => formatBenchmarkCell(v, TIMEOUT_MS)).join(' | ')} |`,
  );
}

const tableContent = mut_tableLines.join('\n');

console.info(`\n${tableContent}`);

await writeBenchmarkResults(
  resultsDir,
  'results-equality-cut-off.md',
  tableContent,
  {
    kind: 'series',
    meta: { updates: K, timeoutMs: TIMEOUT_MS },
    xLabels: colHeaders,
    series: mut_series,
  },
);
