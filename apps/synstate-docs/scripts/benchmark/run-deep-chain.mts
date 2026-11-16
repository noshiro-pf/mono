/**
 * Deep Chain Throughput Benchmark
 *
 * Reuses the exact same adapter code as the interactive throughput demo
 * (apps/synstate-docs/src/components/throughput-demo/adapters/) to ensure the
 * benchmark measures the same reactive chain topology.
 */
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import { Arr, asSafeUint, range } from 'ts-data-forge';
import type {
  Point,
  SpringAdapter,
} from '../../src/components/spring-demo/index.mjs';
import { selectProductionBuilds } from './production-builds.mjs';
import { runSeriesSweep } from './series-sweep.mjs';

selectProductionBuilds();

/** The chain depth {@link assertReacts} sets an adapter up with. */
const VERIFY_DEPTH = 3;

/** The updates {@link assertReacts} drives an adapter through. */
const VERIFY_UPDATES = 10;

/**
 * The sweep points, in the column order the page's chart and tables use. Not
 * listed cheapest first (`K=1000, M=50` before `K=100, M=100`), so the sweep is
 * told which points dominate which (`costlier` below).
 */
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

/** The `i`-th of the K positions a timed round moves the head through. */
const orbitPoint = (i: number, k: number): Point => {
  // eslint-disable-next-line total-functions/no-partial-division
  const angle = (i / k) * ORBIT_SPEED * Math.PI * 2;

  return {
    x: CANVAS_WIDTH / 2 + ORBIT_RADIUS * Math.cos(angle),
    y: CANVAS_HEIGHT / 2 + ORBIT_RADIUS * Math.sin(angle),
  };
};

/**
 * Fails the run when an adapter did not compute the chain: fewer emissions than
 * `updates`, or `last` points other than `expected`. At least one emission per
 * update rather than exactly one, because RxJS's `combineLatest` emits once per
 * stage (see the page).
 */
const assertComputed = (
  entry: AdapterEntry,
  updates: number,
  emitted: number,
  last: readonly Point[],
  expected: readonly Point[],
): void => {
  if (emitted < updates) {
    console.error(
      `❌ ${entry.label}: ${emitted.toString()} emissions for ${updates.toString()} updates — the chain does not propagate`,
    );

    process.exit(1);
  }

  // The adapters run the model's arithmetic in the model's order, so only an
  // error far below a pixel is allowed.
  const matches =
    last.length === expected.length &&
    expected.every((point, i) => {
      const actual = last[i];

      return (
        actual !== undefined &&
        Math.abs(actual.x - point.x) < 1e-6 &&
        Math.abs(actual.y - point.y) < 1e-6
      );
    });

  if (matches) {
    return;
  }

  console.error(
    `❌ ${entry.label}, ${updates.toString()} updates: the last points ${JSON.stringify(last)} are not the spring model's ${JSON.stringify(expected)}`,
  );

  process.exit(1);
};

/**
 * Run one measurement: setup adapter with given depth, push K updates, cleanup.
 * Its emissions are counted and its last points kept, and checked against
 * `expected` once the clock has stopped (see {@link assertComputed}).
 */
const runOnce = (
  entry: AdapterEntry,
  adapter: SpringAdapter,
  [k, depth]: readonly [k: number, depth: number],
  expected: readonly Point[],
): number => {
  let mut_emissions = 0;

  let mut_last: readonly Point[] = [];

  adapter.setup(asSafeUint(depth), {
    onEmit: (points) => {
      mut_emissions += 1;

      mut_last = points;
    },
  });

  const afterSetup = mut_emissions;

  const t0 = performance.now();

  // Each position is computed in the timed span, as it always was, so that the
  // numbers stay comparable with those measured before.
  for (const mut_i of range(0, asSafeUint(k))) {
    adapter.onMouseMove(orbitPoint(mut_i, k));
  }

  const elapsed = performance.now() - t0;

  adapter.cleanup();

  assertComputed(entry, k, mut_emissions - afterSetup, mut_last, expected);

  return elapsed;
};

/**
 * The head and `depth` stages the spring model ends at: from the canvas centre,
 * each of `moves` moves the head there and each stage a spring step towards the
 * stage before it, in chain order.
 */
const expectedPoints = (
  depth: number,
  moves: readonly Point[],
): readonly Point[] => {
  const start: Point = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 } as const;

  let mut_head = start;

  let mut_stages: readonly Point[] = Array.from({ length: depth }, () => start);

  for (const move of moves) {
    mut_head = move;

    let mut_prev = mut_head;

    mut_stages = mut_stages.map((stage) => {
      mut_prev = lerp(stage, mut_prev, SPRING_FACTOR);

      return mut_prev;
    });
  }

  return Arr.toUnshifted(mut_head)(mut_stages);
};

/**
 * Fails the run, before any round is timed, when an adapter does not compute a
 * small chain. A chain that never propagates would otherwise be timed as a very
 * fast one: that is what a Solid adapter importing `solid-js` gets under Node —
 * the server build, in which no effect runs. Each timed round is checked the
 * same way, at its own size ({@link runOnce}).
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

  const moves = Array.from({ length: VERIFY_UPDATES }, (_, i) => ({
    x: i + 1,
    y: i + 1,
  }));

  for (const move of moves) {
    adapter.onMouseMove(move);
  }

  adapter.cleanup();

  assertComputed(
    entry,
    VERIFY_UPDATES,
    mut_emissions - afterSetup,
    mut_last,
    expectedPoints(VERIFY_DEPTH, moves),
  );
};

await runSeriesSweep({
  scriptUrl: import.meta.url,
  title: 'Deep Chain Throughput',
  // The sweep varies K itself.
  updates: null,
  points: PARAMS,
  pointLabel: ([k, m]) => `K=${k.toString()}, M=${m.toString()}`,
  entries,
  // In this library's own process (see `measureEachInOwnProcess`), so that the
  // shared `lerp` has seen no other library: the check adds only this library's
  // own points and the model's plain ones.
  prepare: (entry) => {
    assertReacts(entry);

    return ([k, depth]) => {
      const adapter = entry.createAdapter();

      // Once per point, outside every timed round.
      const expected = expectedPoints(
        depth,
        Array.from({ length: k }, (_, i) => orbitPoint(i, k)),
      );

      return () => runOnce(entry, adapter, [k, depth], expected);
    };
  },
  // A round is K updates through M stages, so a point with at least as many of
  // both is at least as much work. A point is skipped only after one it
  // dominates went over five seconds; the few small points JIT state reorders,
  // by about a millisecond, are nowhere near that.
  costlier: ([kA, mA], [kB, mB]) => kA >= kB && mA >= mB,
  resultsFile: 'results-deep-chain.md',
});
