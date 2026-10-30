/**
 * Deep Chain Throughput Benchmark
 *
 * Reuses the exact same adapter code as the interactive throughput demo
 * (apps/synstate-docs/src/components/throughput-demo/adapters/) to ensure
 * the benchmark measures the same reactive chain topology.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import { Arr, asSafeUint, range } from 'ts-data-forge';
import type {
  Point,
  SpringAdapter,
} from '../../src/components/spring-demo/index.mjs';
import {
  type BenchmarkSeries,
  formatBenchmarkCell,
  writeBenchmarkResults,
} from './benchmark-results.mjs';
import { isMeasuringChild, measureEachInOwnProcess } from './own-process.mjs';
import { resultsDir } from './paths.mjs';
import { selectProductionBuilds } from './production-builds.mjs';

selectProductionBuilds();

const WARMUP_ROUNDS = 2;

const MEASURE_ROUNDS = 5;

/** Abort if a single measurement exceeds this threshold */
const TIMEOUT_MS = 5000;

/** The chain depth {@link assertReacts} sets an adapter up with. */
const VERIFY_DEPTH = 3;

/** The updates {@link assertReacts} drives an adapter through. */
const VERIFY_UPDATES = 10;

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

// Dynamically, so that the adapters, and the libraries they import, load after
// `selectProductionBuilds` (see production-builds.mts).
const adapters =
  await import('../../src/components/throughput-demo/adapters/index.mjs');

// The demo's canvas, whose centre the adapters start their chains at, and the
// spring step each stage takes, which `expectedPoints` models.
const { CANVAS_WIDTH, CANVAS_HEIGHT, SPRING_FACTOR, lerp } = adapters;

const ORBIT_RADIUS = 150;

const ORBIT_SPEED = 0.05;

type AdapterEntry = Readonly<{
  label: string;
  createAdapter: () => SpringAdapter;
}>;

const entries: readonly AdapterEntry[] = [
  {
    label: '**SynState**',
    createAdapter: adapters.createSynStateThroughputAdapter,
  },
  {
    label: 'RxJS',
    createAdapter: adapters.createRxJSThroughputAdapter,
  },
  {
    label: 'Jotai',
    createAdapter: adapters.createJotaiThroughputAdapter,
  },
  {
    label: 'MobX',
    createAdapter: adapters.createMobXThroughputAdapter,
  },
  {
    label: 'Redux',
    createAdapter: adapters.createReduxThroughputAdapter,
  },
  {
    label: 'Solid',
    createAdapter: adapters.createSolidThroughputAdapter,
  },
  {
    label: 'Preact Signals',
    createAdapter: adapters.createPreactSignalsThroughputAdapter,
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
const runOnce = (adapter: SpringAdapter, k: number, depth: number): number => {
  adapter.setup(asSafeUint(depth), {
    onEmit: () => {
      // no-op — just consume the emission
    },
  });

  const cx = CANVAS_WIDTH / 2;

  const cy = CANVAS_HEIGHT / 2;

  const t0 = performance.now();

  for (const mut_i of range(0, asSafeUint(k))) {
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

/**
 * The head and stages {@link assertReacts} expects: from the canvas centre,
 * each update moves the head to (i, i) and each stage a spring step towards
 * the stage before it, in chain order.
 */
const expectedPoints = (): readonly Point[] => {
  const start: Point = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 } as const;

  let mut_head = start;

  let mut_stages: readonly Point[] = Array.from(
    { length: VERIFY_DEPTH },
    () => start,
  );

  for (const mut_i of range(1, asSafeUint(VERIFY_UPDATES + 1))) {
    mut_head = { x: mut_i, y: mut_i };

    let mut_prev = mut_head;

    mut_stages = mut_stages.map((stage) => {
      mut_prev = lerp(stage, mut_prev, SPRING_FACTOR);

      return mut_prev;
    });
  }

  return Arr.toUnshifted(mut_head)(mut_stages);
};

/**
 * Fails the run when an adapter does not compute the chain: fewer emissions
 * than updates, or last points other than the spring model's.
 *
 * The timed runs' `onEmit` consumes the points and checks nothing, so a chain
 * that never propagates would be timed as a very fast one. That is what a
 * Solid adapter importing `solid-js` gets under Node — the server build, in
 * which no effect runs. At least one emission per update rather than exactly
 * one, because RxJS's `combineLatest` emits once per stage (see the page).
 */
const assertReacts = (entry: AdapterEntry): void => {
  const adapter = entry.createAdapter();

  let mut_emissions = 0;

  let mut_last: readonly Point[] = [];

  adapter.setup(asSafeUint(VERIFY_DEPTH), {
    onEmit: (points) => {
      mut_emissions += 1;

      mut_last = points;
    },
  });

  const afterSetup = mut_emissions;

  for (const mut_i of range(1, asSafeUint(VERIFY_UPDATES + 1))) {
    adapter.onMouseMove({ x: mut_i, y: mut_i });
  }

  adapter.cleanup();

  const emitted = mut_emissions - afterSetup;

  if (emitted < VERIFY_UPDATES) {
    console.error(
      `❌ ${entry.label}: ${emitted.toString()} emissions for ${VERIFY_UPDATES.toString()} updates — the chain does not propagate`,
    );

    process.exit(1);
  }

  const expected = expectedPoints();

  const matches =
    mut_last.length === expected.length &&
    expected.every((point, i) => {
      const actual = mut_last[i];

      return (
        actual !== undefined &&
        Math.abs(actual.x - point.x) < 1e-9 &&
        Math.abs(actual.y - point.y) < 1e-9
      );
    });

  if (matches) {
    return;
  }

  console.error(
    `❌ ${entry.label}: the last points ${JSON.stringify(mut_last)} are not the spring model's ${JSON.stringify(expected)}`,
  );

  process.exit(1);
};

/**
 * Runs the measured rounds for a single parameter pair, bailing out as soon as a
 * round exceeds the timeout. Extracted into its own function so that the round
 * loop is not nested inside the entry/parameter loops.
 */
const measureRounds = (
  adapter: SpringAdapter,
  k: number,
  depth: number,
): Readonly<{ times: readonly number[]; timedOut: boolean }> => {
  const mut_times: number[] = [];

  let mut_timedOut = false;

  for (const _r of range(0, MEASURE_ROUNDS)) {
    const elapsed = runOnce(adapter, k, depth);

    mut_times.push(elapsed);

    if (elapsed > TIMEOUT_MS) {
      mut_timedOut = true;

      break;
    }
  }

  return { times: mut_times, timedOut: mut_timedOut };
};

/**
 * Measures every parameter pair for a single adapter, after
 * {@link assertReacts}, which ends the run if the adapter does not compute the
 * chain. Extracted into its own function so that the parameter loop is not
 * nested inside the entry loop.
 */
const measureEntry = (entry: AdapterEntry): readonly (number | null)[] => {
  const { label, createAdapter } = entry;

  // In this library's own process (see `measureEachInOwnProcess`), so that
  // the shared `lerp` has seen no other library: the check adds only this
  // library's own points and the model's plain ones.
  assertReacts(entry);

  const mut_values: (number | null)[] = [];

  let mut_skippingRest = false;

  for (const [k, depth] of PARAMS) {
    if (mut_skippingRest) {
      mut_values.push(null);

      continue;
    }

    const adapter = createAdapter();

    // Warmup
    for (const _w of range(0, WARMUP_ROUNDS)) {
      runOnce(adapter, k, depth);
    }

    // Measure
    const { times, timedOut } = measureRounds(adapter, k, depth);

    if (timedOut) {
      mut_values.push(null);

      mut_skippingRest = true;

      console.info(
        `  ⏱ ${label} K=${k.toString()} M=${depth.toString()}: TIMEOUT (> ${TIMEOUT_MS.toString()} ms)`,
      );
    } else {
      const sorted = times.toSorted((a, b) => a - b);

      const med = median(sorted);

      mut_values.push(med);

      console.info(
        `  ✓ ${label} K=${k.toString()} M=${depth.toString()}: ${med.toFixed(1)} ms`,
      );
    }
  }

  return mut_values;
};

if (!isMeasuringChild) {
  console.info(
    `\n## Deep Chain Throughput (${WARMUP_ROUNDS.toString()} warmup + ${MEASURE_ROUNDS.toString()} measured, timeout=${TIMEOUT_MS.toString()} ms)\n`,
  );
}

// Column headers
const colHeaders = PARAMS.map(
  ([k, m]) => `K=${k.toString()}, M=${m.toString()}`,
);

const mut_series: BenchmarkSeries[] = [];

const mut_tableLines: string[] = [
  `| Library | ${colHeaders.join(' | ')} |`,
  `| ------- | ${PARAMS.map(() => '----------:').join(' | ')} |`,
];

const measured = await measureEachInOwnProcess(
  import.meta.url,
  entries,
  measureEntry,
);

for (const [entry, values] of measured) {
  mut_series.push({ label: entry.label, values });

  mut_tableLines.push(
    `| ${entry.label} | ${values.map((v) => formatBenchmarkCell(v, TIMEOUT_MS)).join(' | ')} |`,
  );
}

const tableContent = mut_tableLines.join('\n');

console.info(`\n${tableContent}`);

await writeBenchmarkResults(resultsDir, 'results-deep-chain.md', tableContent, {
  kind: 'series',
  meta: { updates: null, timeoutMs: TIMEOUT_MS },
  xLabels: colHeaders,
  series: mut_series,
});
