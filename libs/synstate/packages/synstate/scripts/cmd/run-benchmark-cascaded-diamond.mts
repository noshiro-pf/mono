/**
 * Cascaded Diamond Benchmark
 *
 * Measures the exponential O(2^N) blowup of RxJS's combineLatest
 * with cascaded diamond dependencies.
 *
 * Graph topology (N=3):
 *   source → left₁, right₁ → combineLatest₁
 *          → left₂, right₂ → combineLatest₂
 *          → left₃, right₃ → combineLatest₃ → subscriber
 *
 * Each combineLatest doubles the emission count, producing 2^N
 * subscriber calls per source update in RxJS.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { range } from 'ts-data-forge';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const WARMUP_ROUNDS = 2;

const MEASURE_ROUNDS = 5;

const TIMEOUT_MS = 5000;

/** K = number of source updates per measurement */
const K = 100;

/** Cascade depths to test. RxJS fires 2^N times per update. */
const DEPTHS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] as const;

type BenchmarkModule = Readonly<{
  runBenchmark: (k: number, depth: number) => number;
}>;

type BenchmarkEntry = Readonly<{
  label: string;
  file: string;
}>;

const entries: readonly BenchmarkEntry[] = [
  { label: '**SynState**', file: '04-cascaded-diamond.synstate.mts' },
  { label: 'RxJS', file: '04-cascaded-diamond.rxjs.mts' },
  { label: 'Jotai', file: '04-cascaded-diamond.jotai.mts' },
  { label: 'MobX', file: '04-cascaded-diamond.mobx.mts' },
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

/**
 * Runs the measured rounds for a single depth, bailing out as soon as a round
 * exceeds the timeout. Extracted into its own function so that the round loop is
 * not nested inside the entry/depth loops.
 */
const measureRounds = (
  mod: BenchmarkModule,
  depth: number,
): Readonly<{ times: readonly number[]; timedOut: boolean }> => {
  const mut_times: number[] = [];

  let mut_timedOut = false;

  for (const _r of range(0, MEASURE_ROUNDS)) {
    const t0 = performance.now();

    mod.runBenchmark(K, depth);

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
 * Measures every depth for a single benchmark entry. Extracted into its own
 * function so that the depth loop is not nested inside the entry loop.
 */
const measureEntry = (
  entry: BenchmarkEntry,
  mod: BenchmarkModule,
): readonly string[] => {
  const mut_cells: string[] = [];

  let mut_skippingRest = false;

  for (const depth of DEPTHS) {
    if (mut_skippingRest) {
      mut_cells.push(`> ${String(TIMEOUT_MS)} ms`);

      continue;
    }

    // Verify correctness
    const check = mod.runBenchmark(3, depth);

    if (check === 0 || !Number.isFinite(check)) {
      console.error(
        `❌ ${entry.label} N=${String(depth)}: got ${String(check)}`,
      );

      process.exit(1);
    }

    // Warmup
    for (const _w of range(0, WARMUP_ROUNDS)) {
      mod.runBenchmark(K, depth);
    }

    // Measure
    const { times, timedOut } = measureRounds(mod, depth);

    if (timedOut) {
      mut_cells.push(`> ${String(TIMEOUT_MS)} ms`);

      mut_skippingRest = true;

      console.info(
        `  ⏱ ${entry.label} N=${String(depth)}: TIMEOUT (> ${String(TIMEOUT_MS)} ms)`,
      );
    } else {
      const sorted = times.toSorted((a, b) => a - b);

      const med = median(sorted);

      mut_cells.push(`${med.toFixed(1)} ms`);

      console.info(
        `  ✓ ${entry.label} N=${String(depth)}: ${med.toFixed(1)} ms`,
      );
    }
  }

  return mut_cells;
};

console.info(
  `\n## Cascaded Diamond (K=${String(K)} updates, ${String(WARMUP_ROUNDS)} warmup + ${String(MEASURE_ROUNDS)} measured, timeout=${String(TIMEOUT_MS)} ms)\n`,
);

// Column headers
const colHeaders = DEPTHS.map((d) => `N=${String(d)}`);

const mut_tableLines: string[] = [
  `| Library | ${colHeaders.join(' | ')} |`,
  `| ------- | ${DEPTHS.map(() => '----------:').join(' | ')} |`,
];

for (const entry of entries) {
  const filePath = path.resolve(benchmarkDir, entry.file);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mod: BenchmarkModule = await import(filePath);

  const cells = measureEntry(entry, mod);

  mut_tableLines.push(`| ${entry.label} | ${cells.join(' | ')} |`);
}

const tableContent = mut_tableLines.join('\n');

console.info(`\n${tableContent}`);

const resultsPath = path.resolve(benchmarkDir, 'results-cascaded-diamond.md');

// eslint-disable-next-line security/detect-non-literal-fs-filename
await fs.writeFile(resultsPath, `${tableContent}\n`, 'utf8');

console.info(`\n✓ Results written to ${resultsPath}`);
