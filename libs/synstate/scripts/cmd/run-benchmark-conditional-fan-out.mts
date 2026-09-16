/**
 * Conditional Fan-Out Benchmark
 *
 * Measures the cost of "oversubscription" in static graphs vs.
 * dynamic dependency tracking.
 *
 * Graph topology:
 *   selector ─┐
 *   branch[0] ─┤
 *   branch[1] ─┼─ combine/select → result
 *   ...        │
 *   branch[B-1]┘
 *
 * Only branch[selector] is "active". The benchmark updates an
 * INACTIVE branch K times and measures propagation cost.
 *
 * - Static graphs (SynState, RxJS): combine fires on every update,
 *   map produces the same value, equality check prevents downstream
 *   propagation. Cost scales with B (number of branches).
 *
 * - Dynamic graphs (Jotai, MobX): the inactive branch is not in the
 *   dependency set, so updates do not trigger recomputation at all.
 */
import * as path from 'node:path';
import { range } from 'ts-data-forge';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import {
  type BenchmarkSeries,
  formatBenchmarkCell,
  writeBenchmarkResults,
} from '../benchmark-results.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const WARMUP_ROUNDS = 2;

const MEASURE_ROUNDS = 5;

const TIMEOUT_MS = 5000;

/** K = number of inactive-branch updates per measurement */
const K = 100_000;

/** Branch counts to test */
const BRANCH_COUNTS = [2, 5, 10, 20, 50, 100, 200, 500, 1000] as const;

type BenchmarkModule = Readonly<{
  runBenchmark: (k: number, branchCount: number) => number;
}>;

type BenchmarkEntry = Readonly<{
  label: string;
  file: string;
}>;

const entries: readonly BenchmarkEntry[] = [
  { label: '**SynState**', file: '05-conditional-fan-out.synstate.mts' },
  { label: 'RxJS', file: '05-conditional-fan-out.rxjs.mts' },
  { label: 'Jotai', file: '05-conditional-fan-out.jotai.mts' },
  { label: 'MobX', file: '05-conditional-fan-out.mobx.mts' },
] as const;

const benchmarkDir = path.resolve(
  workspaceRootPath,
  'samples/docs-site/benchmark',
);

const median = (sorted: readonly number[]): number => {
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
};

console.info(
  `\n## Conditional Fan-Out (K=${K.toString()} inactive-branch updates, ${WARMUP_ROUNDS.toString()} warmup + ${MEASURE_ROUNDS.toString()} measured, timeout=${TIMEOUT_MS.toString()} ms)\n`,
);

/**
 * Runs the measured rounds for a single branch count, bailing out as soon as a
 * round exceeds the timeout. Extracted into its own function so that the round
 * loop is not nested inside the entry/branch-count loops.
 */
const measureRounds = (
  mod: BenchmarkModule,
  branchCount: number,
): Readonly<{ times: readonly number[]; timedOut: boolean }> => {
  const mut_times: number[] = [];

  let mut_timedOut = false;

  for (const _r of range(0, MEASURE_ROUNDS)) {
    const t0 = performance.now();

    mod.runBenchmark(K, branchCount);

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
 * Measures every branch count for a single benchmark entry. Extracted into its
 * own function so that the branch-count loop is not nested inside the entry
 * loop.
 */
const measureEntry = (
  entry: BenchmarkEntry,
  mod: BenchmarkModule,
): readonly (number | null)[] => {
  const mut_values: (number | null)[] = [];

  let mut_skippingRest = false;

  for (const branchCount of BRANCH_COUNTS) {
    if (mut_skippingRest) {
      mut_values.push(null);

      continue;
    }

    // Verify correctness
    const check = mod.runBenchmark(3, branchCount);

    // Result should be 0: selector=0, active branch=branch[0]=0
    if (!Number.isFinite(check)) {
      console.error(
        `❌ ${entry.label} B=${branchCount.toString()}: got ${check.toString()}`,
      );

      process.exit(1);
    }

    // Warmup
    for (const _w of range(0, WARMUP_ROUNDS)) {
      mod.runBenchmark(K, branchCount);
    }

    // Measure
    const { times, timedOut } = measureRounds(mod, branchCount);

    if (timedOut) {
      mut_values.push(null);

      mut_skippingRest = true;

      console.info(
        `  ⏱ ${entry.label} B=${branchCount.toString()}: TIMEOUT (> ${TIMEOUT_MS.toString()} ms)`,
      );
    } else {
      const sorted = times.toSorted((a, b) => a - b);

      const med = median(sorted);

      mut_values.push(med);

      console.info(
        `  ✓ ${entry.label} B=${branchCount.toString()}: ${med.toFixed(1)} ms`,
      );
    }
  }

  return mut_values;
};

// Column headers
const colHeaders = BRANCH_COUNTS.map((b) => `B=${b.toString()}`);

const mut_series: BenchmarkSeries[] = [];

const mut_tableLines: string[] = [
  `| Library | ${colHeaders.join(' | ')} |`,
  `| ------- | ${BRANCH_COUNTS.map(() => '----------:').join(' | ')} |`,
];

for (const entry of entries) {
  const filePath = path.resolve(benchmarkDir, entry.file);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mod: BenchmarkModule = await import(filePath);

  const values = measureEntry(entry, mod);

  mut_series.push({ label: entry.label, values });

  mut_tableLines.push(
    `| ${entry.label} | ${values.map((v) => formatBenchmarkCell(v, TIMEOUT_MS)).join(' | ')} |`,
  );
}

const tableContent = mut_tableLines.join('\n');

console.info(`\n${tableContent}`);

await writeBenchmarkResults(
  benchmarkDir,
  'results-conditional-fan-out.md',
  tableContent,
  {
    kind: 'series',
    meta: { updates: K, timeoutMs: TIMEOUT_MS },
    xLabels: colHeaders,
    series: mut_series,
  },
);
