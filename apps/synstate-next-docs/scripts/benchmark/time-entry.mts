// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import {
  Arr,
  asSafeUint,
  asUint32,
  hasKey,
  Num,
  range,
  unknownToString,
} from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { EntryResult } from './results.mjs';
import { type Entry, isSubject, type Scenario } from './scenarios.mjs';

/**
 * Times one library in one scenario, in the process `run-benchmark.mts` started
 * for it, after checking that it computes the scenario right: a library that
 * computed nothing would be timed as a very fast one.
 *
 * A scenario of kind `stats` times `runBenchmark(N)`, {@link STATS_WARMUP}
 * times unmeasured and {@link STATS_RUNS} times measured, and returns every
 * measured time. The others sweep their points, each {@link SWEEP_WARMUP} times
 * unmeasured and up to {@link SWEEP_RUNS} times measured, and return each
 * point's median. A run over {@link TIMEOUT_MS} makes its point `null`, and
 * every larger point too, unmeasured.
 */
export const timeEntry = async (
  scenario: Scenario,
  entry: Entry,
): Promise<EntryResult> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mod: Module = await import(entry.file);

  switch (scenario.kind) {
    case 'stats':
      return timeStats(scenario, entry, mod);

    case 'sweep':
      return sweep(entry, sweepOf(scenario.id), mod);

    case 'deep-chain':
      return timeDeepChain(entry, mod);
  }
};

/** The median of `values`. */
export const median = (values: readonly number[]): number => {
  const sorted = values.toSorted((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
};

/**
 * Times each point in order: `prepare` checks the library at a point and
 * returns one run, which returns the milliseconds it took. A point at least as
 * large as one that timed out (`isAtLeast`) is not measured; for a sweep, that
 * is every later point.
 */
export const measurePoints = (
  entry: Entry,
  xLabels: readonly string[],
  prepare: (index: number) => () => number,
  isAtLeast: (index: number, smaller: number) => boolean = (index, smaller) =>
    index >= smaller,
): EntryResult => {
  const mut_values: (number | null)[] = [];

  for (const [index, xLabel] of xLabels.entries()) {
    if (
      mut_values.some(
        (measured, smaller) => measured === null && isAtLeast(index, smaller),
      )
    ) {
      mut_values.push(null);

      continue;
    }

    const run = prepare(index);

    // A warm-up over the timeout ends the warm-ups but decides nothing: a cold
    // first run is slower than the ones measured.
    timeRuns(run, SWEEP_WARMUP);

    const times = timeRuns(run, SWEEP_RUNS);

    // A run over the timeout ends the point. `run-benchmark.mts` takes the
    // median over the rounds, so that one slow round does not decide.
    if (times.some((time) => time > TIMEOUT_MS)) {
      mut_values.push(null);

      console.info(
        `  ⏱ ${entry.label} ${xLabel}: over ${TIMEOUT_MS.toString()} ms`,
      );
    } else {
      const value = median(times);

      mut_values.push(value);

      console.info(`  ✓ ${entry.label} ${xLabel}: ${value.toFixed(2)} ms`);
    }
  }

  return { kind: 'series', xLabels, values: mut_values };
};

/**
 * Each point's median over the rounds, a round that did not finish a point
 * counting as slower than any other, so that a point times out (`null`) when
 * most rounds did not finish it. With an even number of rounds of which half
 * did not finish, the point takes the slower finished time.
 */
export const medianOverRounds = (
  rounds: readonly (readonly (number | null)[])[],
): readonly (number | null)[] =>
  Arr.seq(asUint32(Math.max(0, ...rounds.map((values) => values.length)))).map(
    (point) => {
      const sorted = rounds
        .map((values) => values[point] ?? Number.POSITIVE_INFINITY)
        .toSorted((a, b) => a - b);

      const lower = sorted[Math.floor((sorted.length - 1) / 2)];

      const upper = sorted[Math.floor(sorted.length / 2)];

      return lower === undefined || !Number.isFinite(lower)
        ? null
        : upper === undefined || !Number.isFinite(upper)
          ? lower
          : (lower + upper) / 2;
    },
  );

/**
 * Whether deep-chain point `index` is at least as large as point `smaller` in
 * both K and M, so that a timeout at `smaller` leaves it unmeasured.
 */
export const deepChainCovers = (index: number, smaller: number): boolean => {
  const [k, m] = deepChainPoints[index] ?? [0, 0];

  const [smallerK, smallerM] = deepChainPoints[smaller] ?? [0, 0];

  return k >= smallerK && m >= smallerM;
};

/**
 * The updates (K) and chain depths (M) of the deep chain. A point that times out
 * skips only the points with both K and M at least as large.
 */
const deepChainPoints: readonly (readonly [k: number, m: number])[] = [
  [100, 50],
  [500, 50],
  [1000, 50],
  [100, 100],
  [500, 100],
  [1000, 100],
  [500, 200],
  [1000, 200],
] as const;

/** The deep chain's points, as its table heads them. */
export const deepChainLabels: readonly string[] = deepChainPoints.map(
  ([k, m]) => `K=${k.toString()}, M=${m.toString()}`,
);

/**
 * How many times `run-benchmark.mts` measures each library in a scenario, each
 * time in a new process. A library's speed differs from one process to the next
 * by up to twice, as V8 happens to optimize it, so three were too few for the
 * median to say which is usual. Odd, so that a sweep point's median over the
 * rounds is a time one round measured, and a point is never left with half its
 * rounds finished ({@link medianOverRounds}).
 */
export const ROUNDS = 7;

/** The updates a `stats` scenario makes per run. */
export const STATS_UPDATES = 100_000;

/**
 * A run longer than this ends its point, and every point at least as large, for
 * that library in that round; see {@link medianOverRounds} for what the page
 * shows.
 */
export const TIMEOUT_MS = 5000;

type Module = ReadonlyRecord<string, unknown>;

const STATS_WARMUP = 5;

export const STATS_RUNS = 20;

/** How many times a `stats` scenario measures each library over a run. */
export const STATS_RUNS_PER_ROW = ROUNDS * STATS_RUNS;

const SWEEP_WARMUP = 2;

const SWEEP_RUNS = 5;

type Sweep = Readonly<{
  /** The updates one run makes. */
  updates: number;
  points: readonly number[];
  label: (point: number) => string;
  /** The updates of the check made before each point is timed. */
  checkUpdates: number;
  accepts: (result: number, point: number) => boolean;
}>;

const sweeps: ReadonlyRecord<string, Sweep> = {
  'cascaded-diamond': {
    updates: 100,
    points: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    label: (n) => `N=${n.toString()}`,
    checkUpdates: 3,
    // Each level doubles the value and adds 3, so from 3, N levels give 6 · 2^N
    // − 3.
    accepts: (result, n) => result === 6 * 2 ** n - 3,
  },
  'conditional-fan-out': {
    updates: 100_000,
    points: [2, 5, 10, 20, 50, 100, 200, 500, 1000],
    label: (b) => `B=${b.toString()}`,
    checkUpdates: 3,
    // The selector picks branch 0, which is never written.
    accepts: (result) => result === 0,
  },
  'unchanged-value': {
    updates: 100_000,
    points: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000],
    label: (w) => `W=${w.toString()}`,
    checkUpdates: 2500,
    // After 2500 writes the bucket is 2, so the views hold 2, 3, …, W + 1.
    accepts: (result, w) => result === Num.div(w * (w + 3), 2),
  },
} as const;

// --- The deep chain ---

type Point = Readonly<{ x: number; y: number }>;

type Adapter = Readonly<{
  setup: (
    depth: number,
    callbacks: Readonly<{ onEmit: (points: readonly Point[]) => void }>,
  ) => void;
  onMouseMove: (pos: Point) => void;
  cleanup: () => void;
}>;

// The demo's canvas and spring, as synstate's docs define them, which every
// adapter is checked against.
const CANVAS_WIDTH = 500;

const CANVAS_HEIGHT = 400;

const SPRING_FACTOR = 0.003;

const ORBIT_RADIUS = 150;

const ORBIT_SPEED = 0.05;

const VERIFY_DEPTH = 3;

const VERIFY_UPDATES = 10;

const sweepOf = (id: string): Sweep => {
  const found = sweeps[id];

  if (found === undefined) {
    throw new Error(`no sweep for ${id}`);
  }

  return found;
};

const exportOf = (mod: Module, name: string, entry: Entry): unknown => {
  const value = mod[name];

  if (typeof value !== 'function') {
    throw new TypeError(`${entry.file} exports no ${name} for ${entry.label}`);
  }

  return value;
};

const timeStats = (
  scenario: Scenario,
  entry: Entry,
  mod: Module,
): EntryResult => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- checked to be a function; the scenario files type it
  const runBenchmark = exportOf(mod, 'runBenchmark', entry) as (
    n: number,
  ) => number;

  const expected = (scenario.perUpdate ?? 1) * 1000;

  const check = runBenchmark(1000);

  if (check !== expected) {
    throw new Error(
      `${entry.label}: expected ${expected.toString()} but got ${check.toString()}`,
    );
  }

  for (const _ of range(0, STATS_WARMUP)) {
    runBenchmark(STATS_UPDATES);
  }

  const times = Arr.generate(function* () {
    for (const _ of range(0, STATS_RUNS)) {
      const start = performance.now();

      runBenchmark(STATS_UPDATES);

      yield performance.now() - start;
    }
  });

  console.info(`  ✓ ${entry.label}`);

  return { kind: 'times', times };
};

/**
 * The times of up to `count` runs of `run`, ending early after one that took
 * longer than {@link TIMEOUT_MS}.
 */
const timeRuns = (run: () => number, count: number): readonly number[] =>
  Arr.generate(function* () {
    for (const _ of range(0, asSafeUint(count))) {
      const elapsed = run();

      yield elapsed;

      if (elapsed > TIMEOUT_MS) {
        return;
      }
    }
  });

const sweep = (
  entry: Entry,
  { updates, points, label, checkUpdates, accepts }: Sweep,
  mod: Module,
): EntryResult => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- checked to be a function; the scenario files type it
  const runBenchmark = exportOf(mod, 'runBenchmark', entry) as (
    k: number,
    x: number,
  ) => number;

  return measurePoints(entry, points.map(label), (index) => {
    const point = points[index] ?? 0;

    const result = runBenchmark(checkUpdates, point);

    if (!accepts(result, point)) {
      throw new Error(
        `${entry.label} ${label(point)}: got ${result.toString()}`,
      );
    }

    return () => {
      const start = performance.now();

      runBenchmark(updates, point);

      return performance.now() - start;
    };
  });
};

const stepTowards = (current: Point, target: Point): Point =>
  ({
    x: current.x + (target.x - current.x) * SPRING_FACTOR,
    y: current.y + (target.y - current.y) * SPRING_FACTOR,
  }) as const;

/**
 * Fails the run when an adapter does not compute the chain: fewer emissions
 * than updates, or last points other than the spring model's. The Solid adapter
 * importing the server build of `solid-js`, in which no effect runs, would
 * otherwise be timed as a very fast chain.
 */
const assertReacts = (entry: Entry, adapter: Adapter): void => {
  let mut_emissions = 0;

  let mut_last: readonly Point[] = [];

  adapter.setup(VERIFY_DEPTH, {
    onEmit: (points) => {
      mut_emissions += 1;

      mut_last = points;
    },
  });

  const afterSetup = mut_emissions;

  for (const i of range(1, asSafeUint(VERIFY_UPDATES + 1))) {
    adapter.onMouseMove({ x: i, y: i });
  }

  adapter.cleanup();

  if (mut_emissions - afterSetup < VERIFY_UPDATES) {
    throw new Error(
      `${entry.label}: ${(mut_emissions - afterSetup).toString()} emissions for ${VERIFY_UPDATES.toString()} updates`,
    );
  }

  const start: Point = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 } as const;

  let mut_head = start;

  let mut_stages: readonly Point[] = Arr.create(VERIFY_DEPTH, start);

  for (const i of range(1, asSafeUint(VERIFY_UPDATES + 1))) {
    mut_head = { x: i, y: i };

    let mut_prev = mut_head;

    mut_stages = mut_stages.map((stage) => {
      mut_prev = stepTowards(stage, mut_prev);

      return mut_prev;
    });
  }

  const expected = Arr.toUnshifted(mut_head)(mut_stages);

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

  if (!matches) {
    throw new Error(
      `${entry.label}: the last points ${JSON.stringify(mut_last)} are not the spring model's ${JSON.stringify(expected)}`,
    );
  }
};

/**
 * Fails the run when the throughput demo's adapters module, which the other
 * libraries' entries import, does not export the canvas and spring of the copy
 * here. `assertReacts` checks every adapter against this copy, synstate-next's
 * sample included, so a sample with other values fails there.
 */
const assertSameDemo = (entry: Entry, mod: Module): void => {
  for (const [name, value] of [
    ['CANVAS_WIDTH', CANVAS_WIDTH],
    ['CANVAS_HEIGHT', CANVAS_HEIGHT],
    ['SPRING_FACTOR', SPRING_FACTOR],
  ] as const) {
    if (!hasKey(mod, name) || mod[name] !== value) {
      throw new Error(
        `${entry.file} exports ${name} = ${hasKey(mod, name) ? unknownToString(mod[name]) : '(nothing)'}, but time-entry.mts and synstate-next's sample use ${value.toString()}; make them agree`,
      );
    }
  }
};

const timeDeepChain = (entry: Entry, mod: Module): EntryResult => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- checked to be a function; the adapters type it
  const createAdapter = exportOf(
    mod,
    entry.factory ?? '',
    entry,
  ) as () => Adapter;

  // synstate-next's sample exports only its adapter.
  if (!isSubject(entry.label)) {
    assertSameDemo(entry, mod);
  }

  assertReacts(entry, createAdapter());

  return measurePoints(
    entry,
    deepChainLabels,
    (index) => {
      const [k, m] = deepChainPoints[index] ?? [0, 0];

      const adapter = createAdapter();

      return () => {
        adapter.setup(asSafeUint(m), {
          onEmit: () => {
            // Consumes the points; `assertReacts` checked them.
          },
        });

        const cx = CANVAS_WIDTH / 2;

        const cy = CANVAS_HEIGHT / 2;

        const start = performance.now();

        for (const i of range(0, asSafeUint(k))) {
          const angle =
            (Num.isNonZero(k) ? Num.div(i, k) : 0) * ORBIT_SPEED * Math.PI * 2;

          adapter.onMouseMove({
            x: cx + ORBIT_RADIUS * Math.cos(angle),
            y: cy + ORBIT_RADIUS * Math.sin(angle),
          });
        }

        const elapsed = performance.now() - start;

        adapter.cleanup();

        return elapsed;
      };
    },
    deepChainCovers,
  );
};
