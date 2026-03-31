/**
 * Deep Chain Throughput Benchmark
 *
 * Reuses the exact same adapter code as the interactive throughput demo
 * (packages/docs/src/components/throughput-demo/adapters/) to ensure
 * the benchmark measures the same reactive chain topology.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import { asSafeUint, range } from 'ts-data-forge';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const WARMUP_ROUNDS = 2;

const MEASURE_ROUNDS = 5;

/** Abort if a single measurement exceeds this threshold */
const TIMEOUT_MS = 5000;

const PARAMS: readonly (readonly [k: number, depth: number])[] = [
  [100, 50],
  [500, 50],
  [1000, 50],
  [100, 100],
  [500, 100],
  [1000, 100],
  [500, 200],
  [1000, 200],
] as const;

// --- Import adapters from the docs throughput demo ---

const docsAdaptersDir = path.resolve(
  workspaceRootPath,
  '../docs/src/components/throughput-demo/adapters/index.mjs',
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const adapters: any = await import(docsAdaptersDir);

const CANVAS_WIDTH = 500;

const CANVAS_HEIGHT = 400;

const ORBIT_RADIUS = 150;

const ORBIT_SPEED = 0.05;

type Adapter = Readonly<{
  name: string;
  setup: (
    chainDepth: SafeUint,
    callbacks: Readonly<{ onEmit: (points: readonly unknown[]) => void }>,
  ) => void;
  onMouseMove: (pos: Readonly<{ x: number; y: number }>) => void;
  cleanup: () => void;
}>;

type AdapterEntry = Readonly<{
  label: string;
  createAdapter: () => Adapter;
}>;

const entries: readonly AdapterEntry[] = [
  {
    label: '**SynState**',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, total-functions/no-unsafe-type-assertion
    createAdapter: adapters.createSynStateThroughputAdapter as () => Adapter,
  },
  {
    label: 'RxJS',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, total-functions/no-unsafe-type-assertion
    createAdapter: adapters.createRxJSThroughputAdapter as () => Adapter,
  },
  {
    label: 'Jotai',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, total-functions/no-unsafe-type-assertion
    createAdapter: adapters.createJotaiThroughputAdapter as () => Adapter,
  },
  {
    label: 'MobX',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, total-functions/no-unsafe-type-assertion
    createAdapter: adapters.createMobXThroughputAdapter as () => Adapter,
  },
] as const;

const median = (sorted: readonly number[]): number => {
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
};

/**
 * Run one measurement: setup adapter with given depth, push K updates, cleanup.
 */
const runOnce = (adapter: Adapter, k: number, depth: number): number => {
  adapter.setup(asSafeUint(depth), {
    onEmit: () => {
      // no-op — just consume the emission
    },
  });

  const cx = CANVAS_WIDTH / 2;

  const cy = CANVAS_HEIGHT / 2;

  const t0 = performance.now();

  for (const mut_i of range(asSafeUint(0), asSafeUint(k))) {
    // eslint-disable-next-line total-functions/no-partial-division
    const angle = (mut_i / k) * ORBIT_SPEED * Math.PI * 2;

    adapter.onMouseMove({
      x: cx + ORBIT_RADIUS * Math.cos(angle),
      y: cy + ORBIT_RADIUS * Math.sin(angle),
    });
  }

  const elapsed = performance.now() - t0;

  adapter.cleanup();

  return elapsed;
};

console.log(
  `\n## Deep Chain Throughput (${String(WARMUP_ROUNDS)} warmup + ${String(MEASURE_ROUNDS)} measured, timeout=${String(TIMEOUT_MS)} ms)\n`,
);

// Column headers
const colHeaders = PARAMS.map(([k, m]) => `K=${String(k)}, M=${String(m)}`);

const mut_tableLines: string[] = [
  `| Library | ${colHeaders.join(' | ')} |`,
  `| ------- | ${PARAMS.map(() => '----------:').join(' | ')} |`,
];

for (const { label, createAdapter } of entries) {
  const mut_cells: string[] = [];

  let mut_skippingRest = false;

  for (const [k, depth] of PARAMS) {
    if (mut_skippingRest) {
      mut_cells.push(`> ${String(TIMEOUT_MS)} ms`);

      continue;
    }

    const adapter = createAdapter();

    // Warmup
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_w = 0; mut_w < WARMUP_ROUNDS; mut_w++) {
      runOnce(adapter, k, depth);
    }

    // Measure
    const mut_times: number[] = [];

    let mut_timedOut = false;

    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_r = 0; mut_r < MEASURE_ROUNDS; mut_r++) {
      const elapsed = runOnce(adapter, k, depth);

      mut_times.push(elapsed);

      if (elapsed > TIMEOUT_MS) {
        mut_timedOut = true;

        break;
      }
    }

    if (mut_timedOut) {
      mut_cells.push(`> ${String(TIMEOUT_MS)} ms`);

      mut_skippingRest = true;

      console.log(
        `  ⏱ ${label} K=${String(k)} M=${String(depth)}: TIMEOUT (> ${String(TIMEOUT_MS)} ms)`,
      );
    } else {
      const sorted = mut_times.toSorted((a, b) => a - b);

      const med = median(sorted);

      mut_cells.push(`${med.toFixed(1)} ms`);

      console.log(
        `  ✓ ${label} K=${String(k)} M=${String(depth)}: ${med.toFixed(1)} ms`,
      );
    }
  }

  mut_tableLines.push(`| ${label} | ${mut_cells.join(' | ')} |`);
}

const tableContent = mut_tableLines.join('\n');

console.log(`\n${tableContent}`);

const benchmarkDir = path.resolve(
  workspaceRootPath,
  'samples/docs-site/benchmark',
);

const resultsPath = path.resolve(benchmarkDir, 'results-deep-chain.md');

await fs.writeFile(resultsPath, `${tableContent}\n`, 'utf8');

console.log(`\n✓ Results written to ${resultsPath}`);
