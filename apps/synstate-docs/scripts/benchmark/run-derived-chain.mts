import * as path from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import { range } from 'ts-data-forge';
import {
  type BenchmarkStats,
  renderStatsTable,
  writeBenchmarkResults,
} from './benchmark-results.mjs';
import { measureEachInOwnProcess } from './own-process.mjs';
import { resultsDir, scenarioDir } from './paths.mjs';
import { selectProductionBuilds } from './production-builds.mjs';

selectProductionBuilds();

const WARMUP_ROUNDS = 5;

const MEASURE_ROUNDS = 20;

const N = 100_000;

type BenchmarkModule = Readonly<{
  runBenchmark: (n: number) => number;
}>;

type BenchmarkEntry = Readonly<{
  name: string;
  file: string;
}>;

type Scenario = Readonly<{
  title: string;
  expectedValue: number;
  resultsFile: string;
  entries: readonly BenchmarkEntry[];
}>;

const scenarios: readonly Scenario[] = [
  {
    title: 'Single State',
    expectedValue: N,
    resultsFile: 'results-single-state.md',
    entries: [
      { name: '**SynState**', file: '00-single-state.synstate.mts' },
      { name: 'RxJS', file: '00-single-state.rxjs.mts' },
      { name: 'MobX', file: '00-single-state.mobx.mts' },
      { name: 'Jotai', file: '00-single-state.jotai.mts' },
      { name: 'Redux', file: '00-single-state.redux.mts' },
      { name: 'Solid', file: '00-single-state.solid.mts' },
      { name: 'Preact Signals', file: '00-single-state.preact-signals.mts' },
      { name: 'Zustand', file: '00-single-state.zustand.mts' },
      { name: 'Valtio', file: '00-single-state.valtio.mts' },
    ],
  },
  {
    title: 'Derived Chain',
    expectedValue: N * 4,
    resultsFile: 'results.md',
    entries: [
      { name: '**SynState**', file: '01-derived-chain.synstate.mts' },
      { name: 'RxJS', file: '01-derived-chain.rxjs.mts' },
      { name: 'MobX', file: '01-derived-chain.mobx.mts' },
      { name: 'Jotai', file: '01-derived-chain.jotai.mts' },
      { name: 'Redux', file: '01-derived-chain.redux.mts' },
      { name: 'Solid', file: '01-derived-chain.solid.mts' },
      { name: 'Preact Signals', file: '01-derived-chain.preact-signals.mts' },
    ],
  },
  {
    title: 'Diamond Dependency',
    expectedValue: N * 5,
    resultsFile: 'results-diamond.md',
    entries: [
      { name: '**SynState**', file: '02-diamond-dependency.synstate.mts' },
      { name: 'RxJS', file: '02-diamond-dependency.rxjs.mts' },
      { name: 'MobX', file: '02-diamond-dependency.mobx.mts' },
      { name: 'Jotai', file: '02-diamond-dependency.jotai.mts' },
      { name: 'Redux', file: '02-diamond-dependency.redux.mts' },
      { name: 'Solid', file: '02-diamond-dependency.solid.mts' },
      {
        name: 'Preact Signals',
        file: '02-diamond-dependency.preact-signals.mts',
      },
    ],
  },
] as const;

const median = (sorted: readonly number[]): number => {
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
};

const p95 = (sorted: readonly number[]): number =>
  sorted[Math.ceil(sorted.length * 0.95) - 1] ?? 0;

const formatNumber = (n: number): string =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

/** One library in one scenario: what a process of its own measures. */
type ScenarioEntry = Readonly<{
  scenario: Scenario;
  entry: BenchmarkEntry;
}>;

/** Checks one library's result, then times its rounds. */
const measureEntry = async ({
  scenario,
  entry,
}: ScenarioEntry): Promise<readonly number[]> => {
  const filePath = path.resolve(scenarioDir, entry.file);

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const mod = (await import(filePath)) as BenchmarkModule;

  // Verify correctness
  const check = mod.runBenchmark(1000);

  const expectedCheck = (scenario.expectedValue / N) * 1000;

  if (check !== expectedCheck) {
    console.error(
      `❌ ${entry.name}: expected ${expectedCheck.toString()} but got ${check.toString()}`,
    );

    process.exit(1);
  }

  // Warmup
  for (const _ of range(0, WARMUP_ROUNDS)) {
    mod.runBenchmark(N);
  }

  // Measure
  const mut_times: number[] = [];

  for (const _ of range(0, MEASURE_ROUNDS)) {
    const start = performance.now();

    mod.runBenchmark(N);

    const end = performance.now();

    mut_times.push(end - start);
  }

  console.info(`  ✓ ${scenario.title}: ${entry.name} done`);

  return mut_times;
};

const writeScenario = async (
  scenario: Scenario,
  results: readonly Readonly<{ name: string; times: readonly number[] }>[],
): Promise<void> => {
  console.info(
    `\n## ${scenario.title} (N=${formatNumber(N)}, ${WARMUP_ROUNDS} warmup + ${MEASURE_ROUNDS} measured rounds)\n`,
  );

  const rows: readonly BenchmarkStats[] = results.map(({ name, times }) => {
    const sorted = times.toSorted((a, b) => a - b);

    const med = median(sorted);

    // eslint-disable-next-line total-functions/no-partial-division
    const opsPerSec = Math.round(N / (med / 1000));

    return {
      label: name,
      median: med,
      min: sorted[0] ?? 0,
      max: sorted.at(-1) ?? 0,
      p95: p95(sorted),
      opsPerSec,
    };
  });

  const tableContent = renderStatsTable(rows);

  // Print to console
  console.info(tableContent);

  await writeBenchmarkResults(resultsDir, scenario.resultsFile, tableContent, {
    kind: 'stats',
    meta: { updates: N, timeoutMs: null },
    rows,
  });
};

const items: readonly ScenarioEntry[] = scenarios.flatMap((scenario) =>
  scenario.entries.map((entry) => ({ scenario, entry })),
);

const measured = await measureEachInOwnProcess(
  import.meta.url,
  items,
  measureEntry,
);

for (const scenario of scenarios) {
  await writeScenario(
    scenario,
    measured
      .filter(([item]) => item.scenario === scenario)
      .map(([item, times]) => ({ name: item.entry.name, times })),
  );
}
