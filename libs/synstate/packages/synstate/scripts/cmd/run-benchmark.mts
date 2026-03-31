// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import { range } from 'ts-data-forge';
import { workspaceRootPath } from '../workspace-root-path.mjs';

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
    title: 'Derived Chain',
    expectedValue: N * 4,
    resultsFile: 'results.md',
    entries: [
      { name: '**SynState**', file: '01-derived-chain.synstate.mts' },
      { name: 'RxJS', file: '01-derived-chain.rxjs.mts' },
      { name: 'MobX', file: '01-derived-chain.mobx.mts' },
      { name: 'Jotai', file: '01-derived-chain.jotai.mts' },
      { name: 'Redux', file: '01-derived-chain.redux.mts' },
      { name: 'Zustand', file: '01-derived-chain.zustand.mts' },
      { name: 'Valtio', file: '01-derived-chain.valtio.mts' },
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
    ],
  },
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

const p95 = (sorted: readonly number[]): number =>
  sorted[Math.ceil(sorted.length * 0.95) - 1] ?? 0;

const formatNumber = (n: number): string =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const runScenario = async (scenario: Scenario): Promise<void> => {
  console.log(
    `\n## ${scenario.title} (N=${formatNumber(N)}, ${WARMUP_ROUNDS} warmup + ${MEASURE_ROUNDS} measured rounds)\n`,
  );

  const mut_results: { name: string; times: number[] }[] = [];

  for (const entry of scenario.entries) {
    const filePath = path.resolve(benchmarkDir, entry.file);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const mod = (await import(filePath)) as BenchmarkModule;

    // Verify correctness
    const check = mod.runBenchmark(1000);

    const expectedCheck = (scenario.expectedValue / N) * 1000;

    if (check !== expectedCheck) {
      console.error(
        `❌ ${entry.name}: expected ${String(expectedCheck)} but got ${String(check)}`,
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

    mut_results.push({ name: entry.name, times: mut_times });

    console.log(`  ✓ ${entry.name} done`);
  }

  console.log('');

  // Build Markdown table
  const mut_tableLines: string[] = [
    '| Library  | Median (ms) | Min (ms) | Max (ms) | p95 (ms) | Ops/sec   |',

    '| -------- | ----------: | -------: | -------: | -------: | --------: |',
  ];

  for (const { name, times } of mut_results) {
    const sorted = times.toSorted((a, b) => a - b);

    const med = median(sorted);

    const min = sorted[0] ?? 0;

    const max = sorted.at(-1) ?? 0;

    const p95Val = p95(sorted);

    // eslint-disable-next-line total-functions/no-partial-division
    const opsPerSec = Math.round(N / (med / 1000));

    mut_tableLines.push(
      `| ${name.padEnd(8)} | ${med.toFixed(2).padStart(11)} | ${min.toFixed(2).padStart(8)} | ${max.toFixed(2).padStart(8)} | ${p95Val.toFixed(2).padStart(8)} | ${formatNumber(opsPerSec).padStart(9)} |`,
    );
  }

  const tableContent = mut_tableLines.join('\n');

  // Print to console
  console.log(tableContent);

  // Write to file for docs embedding
  const resultsPath = path.resolve(benchmarkDir, scenario.resultsFile);

  await fs.writeFile(resultsPath, `${tableContent}\n`, 'utf8');

  console.log(`\n✓ Results written to ${resultsPath}`);
};

for (const scenario of scenarios) {
  await runScenario(scenario);
}
