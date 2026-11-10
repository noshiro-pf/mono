import * as path from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { performance } from 'node:perf_hooks';
import { range, unknownToString } from 'ts-data-forge';
import {
  type BenchmarkSeries,
  formatBenchmarkCell,
  writeBenchmarkResults,
} from './benchmark-results.mjs';
import { median } from './median.mjs';
import { isMeasuringChild, measureEachInOwnProcess } from './own-process.mjs';
import { resultsDir, scenarioDir } from './paths.mjs';

/**
 * Sweeps a scenario over its points for each library and writes the series
 * table and JSON that the docs embed and `check-drift` and `compare-results`
 * read.
 *
 * Each library is measured in a process of its own (see
 * {@link measureEachInOwnProcess}), point by point in order: `prepare` is
 * called once there, and at each point the function it returns is called once
 * to set that point up, then the round it returns is run `WARMUP_ROUNDS` (2)
 * times unmeasured and up to `MEASURE_ROUNDS` (5) times measured, and the
 * median recorded. Where the library's result is checked is the runner's:
 * {@link scenarioModule} checks it at each point and after every round. A round
 * over `TIMEOUT_MS` (5000), warmups included, ends the point as `null`, and so
 * is every later point of that library that costs at least as much
 * ({@link SeriesSweep.costlier}), unmeasured; a cheaper one is still measured.
 *
 * The runner calls this once from its top level and is otherwise data — the
 * points, the libraries and how each is run.
 */
export const runSeriesSweep = async <
  Entry extends Readonly<{ label: string }>,
  Point,
>({
  scriptUrl,
  title,
  workload,
  updates,
  points,
  pointLabel,
  entries,
  prepare,
  costlier = everyLaterPoint,
  resultsFile,
}: SeriesSweep<Entry, Point>): Promise<void> => {
  if (!isMeasuringChild) {
    console.info(
      `\n## ${title} (${[
        ...(workload === undefined ? [] : [workload]),
        `${WARMUP_ROUNDS.toString()} warmup + ${MEASURE_ROUNDS.toString()} measured`,
        `timeout=${TIMEOUT_MS.toString()} ms`,
      ].join(', ')})\n`,
    );
  }

  const xLabels = points.map(pointLabel);

  const measured = await measureEachInOwnProcess(
    scriptUrl,
    entries,
    async (entry) =>
      measureEntry(
        entry.label,
        points,
        pointLabel,
        costlier,
        await prepare(entry),
      ),
  );

  const series: readonly BenchmarkSeries[] = measured.map(
    ([entry, values]) => ({ label: entry.label, values }),
  );

  const tableContent = [
    `| Library | ${xLabels.join(' | ')} |`,
    `| ------- | ${xLabels.map(() => '----------:').join(' | ')} |`,
    ...series.map(
      ({ label, values }) =>
        `| ${label} | ${values.map((v) => formatBenchmarkCell(v, TIMEOUT_MS)).join(' | ')} |`,
    ),
  ].join('\n');

  console.info(`\n${tableContent}`);

  await writeBenchmarkResults(resultsDir, resultsFile, tableContent, {
    kind: 'series',
    meta: { updates, timeoutMs: TIMEOUT_MS },
    xLabels,
    series,
  });
};

/**
 * The {@link SeriesSweep.prepare} of a library whose scenario module under
 * `scenarioDir` exports `runBenchmark(k, x)`: each round times
 * `runBenchmark(updates, x)`.
 *
 * Every result is compared with `expected(k, x)`, the exact value a correct
 * library returns, and any other ends the run: the unmeasured
 * `runBenchmark(check.updates, x)` before the first round, so that a wrong
 * library fails before a long round, and the result of every round, warmups
 * included, so that the workload that is timed is the one that was checked.
 * The comparison is made after the clock stops. It is made here, not in
 * {@link runSeriesSweep}, because only a scenario module returns a value to
 * compare; the deep chain's adapters are checked by their runner.
 *
 * The comparison is exact, so both expected values of a point must be safe
 * integers, and so must the terms the formula computes them from: past 2^53 a
 * library's step-by-step arithmetic and the formula's can round apart. A value
 * that is not one ends the run at that point, before the library runs, with a
 * message about `expected` rather than about the library. A term is the
 * runner's to keep in range.
 */
export const scenarioModule =
  <Point extends number>(
    updates: number,
    check: Readonly<{
      updates: number;
      expected: (k: number, point: Point) => number;
    }>,
  ) =>
  async (
    entry: Readonly<{ label: string; file: string }>,
  ): Promise<PreparePoint<Point>> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mod: ScenarioModule = await import(
      path.resolve(scenarioDir, entry.file)
    );

    return (point, label) => {
      // Checked as each point is reached rather than up front: a formula that
      // fails is the runner's bug, found the first time the runner is run.
      const expectedAt = (k: number): number => {
        const expected = check.expected(k, point);

        if (!Number.isSafeInteger(expected)) {
          console.error(
            `❌ ${entry.file} ${label}, ${k.toString()} updates: the runner's \`expected\` gives ${expected.toString()}, not a safe integer, so no result can be compared with it exactly`,
          );

          process.exit(1);
        }

        return expected;
      };

      const assertResult = (
        k: number,
        expected: number,
        result: number,
      ): void => {
        if (result === expected) {
          return;
        }

        console.error(
          `❌ ${entry.label} ${label}, ${k.toString()} updates: got ${unknownToString(result)}, expected ${expected.toString()}`,
        );

        process.exit(1);
      };

      const expectedOfCheck = expectedAt(check.updates);

      const expectedOfRound = expectedAt(updates);

      assertResult(
        check.updates,
        expectedOfCheck,
        mod.runBenchmark(check.updates, point),
      );

      return () => {
        const t0 = performance.now();

        const result = mod.runBenchmark(updates, point);

        const elapsed = performance.now() - t0;

        assertResult(updates, expectedOfRound, result);

        return elapsed;
      };
    };
  };

export type SeriesSweep<
  Entry extends Readonly<{ label: string }>,
  Point,
> = Readonly<{
  /** The runner's `import.meta.url`, which each library's process runs. */
  scriptUrl: string;

  /** The heading printed before the sweep. */
  title: string;

  /** What one round drives, printed in the heading (`K=100 updates`). */
  workload?: string;

  /** `meta.updates` in the JSON (see `BenchmarkMeta`). */
  updates: number | null;

  points: readonly Point[];

  /** A point's column heading, also used in the progress lines. */
  pointLabel: (point: Point) => string;

  /** The libraries, one row each, in table order. */
  entries: readonly Entry[];

  /**
   * Loads one library, in its own process. It, the function it returns at a
   * point, or the round that returns, ends the run with `process.exit(1)` where
   * the library computes the scenario wrongly: {@link scenarioModule} checks
   * before the first round and after every round, and also ends it, before the
   * library runs, where its own `expected` gives no safe integer.
   */
  prepare: (entry: Entry) => PreparePoint<Point> | Promise<PreparePoint<Point>>;

  /**
   * Whether point `a` costs every library at least as much as `b`, so that a
   * library that timed out at `b` would time out at `a` too and `a` is written
   * as a timeout without being run. Without it, every point after a timeout is
   * taken to cost at least as much: the points are listed cheapest first. A
   * runner whose points are not in that order says which dominate which; a
   * point it calls cheaper is measured after a timeout, and its result stands.
   */
  costlier?: (a: Point, b: Point) => boolean;

  /** The Markdown file under `resultsDir`; the JSON is named after it. */
  resultsFile: string;
}>;

/**
 * Checks and sets a library up for one point, and returns one round of it,
 * which returns the milliseconds it measured.
 */
export type PreparePoint<Point> = (point: Point, label: string) => () => number;

type ScenarioModule = Readonly<{
  runBenchmark: (k: number, x: number) => number;
}>;

const WARMUP_ROUNDS = 2;

const MEASURE_ROUNDS = 5;

/** Abort if a single round, warmup or measured, exceeds this threshold */
const TIMEOUT_MS = 5000;

/** The default {@link SeriesSweep.costlier}: points listed cheapest first. */
const everyLaterPoint = (): boolean => true;

/**
 * Runs the warmup rounds and then the measured rounds for one point, and
 * returns the measured times, or `undefined` as soon as any round exceeds the
 * timeout. A warmup round over it ends the point too, the first, unoptimized
 * one included: a point whose round takes minutes would otherwise run both
 * warmups and a measured round before it was abandoned, and a point that slow
 * once is not one the table can report a steady time for.
 */
const runRounds = (round: () => number): readonly number[] | undefined => {
  for (const _w of range(0, WARMUP_ROUNDS)) {
    if (round() > TIMEOUT_MS) {
      return undefined;
    }
  }

  const mut_times: number[] = [];

  for (const _r of range(0, MEASURE_ROUNDS)) {
    const elapsed = round();

    if (elapsed > TIMEOUT_MS) {
      return undefined;
    }

    mut_times.push(elapsed);
  }

  return mut_times;
};

/** Measures every point for one library. */
const measureEntry = <Point,>(
  label: string,
  points: readonly Point[],
  pointLabel: (point: Point) => string,
  costlier: (a: Point, b: Point) => boolean,
  preparePoint: PreparePoint<Point>,
): readonly (number | null)[] => {
  const mut_values: (number | null)[] = [];

  const mut_timedOut: Point[] = [];

  for (const point of points) {
    const xLabel = pointLabel(point);

    const isDominated = mut_timedOut.some((t) => costlier(point, t));

    if (isDominated) {
      mut_values.push(null);

      console.info(
        `  ⏱ ${label} ${xLabel}: not run, costs at least as much as a point that timed out`,
      );

      continue;
    }

    const round = preparePoint(point, xLabel);

    const times = runRounds(round);

    if (times === undefined) {
      mut_values.push(null);

      mut_timedOut.push(point);

      console.info(
        `  ⏱ ${label} ${xLabel}: TIMEOUT (> ${TIMEOUT_MS.toString()} ms)`,
      );
    } else {
      const med = median(times.toSorted((a, b) => a - b));

      mut_values.push(med);

      console.info(`  ✓ ${label} ${xLabel}: ${med.toFixed(1)} ms`);
    }
  }

  return mut_values;
};
