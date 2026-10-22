import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result } from 'ts-data-forge';

/**
 * Judges whether the committed tables still describe a reference measurement,
 * and prints the verdict as Markdown.
 *
 * `check-drift.mjs <referenceDir> <committedDir>`
 *
 * The verdict is the heading it prints, and `drifted=true` or `drifted=false`
 * appended to `$GITHUB_OUTPUT` when that is set. It exits 0 either way: pnpm
 * reports every failing script as exit 1, so an exit code could not tell a
 * drift from a crash.
 *
 * The workflow asks this instead of requiring the committed tables to be the
 * baseline byte for byte, so that a dependency bump that moves nothing keeps
 * the published tables and a run that moves something fails.
 *
 * Absolute milliseconds cannot be compared across runs: unchanged code moved
 * by 0.8–1.4× between runs on `ubuntu-24.04`, one point by 2.5×, because the
 * runner instances differ. So each library's change is divided by the median
 * change of every library in the same scenario, which is the machine's share
 * of it, and only what is left is judged.
 */
const main = async (): Promise<void> => {
  const [referenceDir, committedDir] = Arr.skip(process.argv, 2);

  if (referenceDir === undefined || committedDir === undefined) {
    console.error(
      [
        'Usage: check-drift.mjs <referenceDir> <committedDir>',
        'Both are directories holding the results*.json a benchmark run wrote.',
      ].join('\n'),
    );

    process.exit(1);
  }

  const judged = await Promise.all(
    scenarios.map(async (scenario) =>
      judgeScenario(
        scenario,
        await readScenario(referenceDir, scenario.file),
        await readScenario(committedDir, scenario.file),
      ),
    ),
  );

  const drifted = judged.some((j) => j.drifted);

  console.log(
    [
      drifted
        ? '### The committed tables have drifted from the reference'
        : '### The committed tables are within tolerance of the reference',
      '',
      `Each library's change (geometric mean over the scenario's points of reference / committed), divided by the median change of all libraries in that scenario. Drift is a value beyond ${THRESHOLD.toString()}× either way.`,
      '',
      '| scenario | library | change | machine | after the machine | verdict |',
      '| :-- | :-- | --: | --: | --: | :-- |',
      ...judged.flatMap((j) => j.rows),
    ].join('\n'),
  );

  const githubOutput = process.env['GITHUB_OUTPUT'];

  if (githubOutput !== undefined) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.appendFile(githubOutput, `drifted=${drifted.toString()}\n`);
  }
};

/**
 * The widest normalized change that is still noise.
 *
 * Measured on ten `ubuntu-24.04` runs of unchanged code (deep chain): the
 * normalized change between two of them was 1.05× at the median, 1.44× at
 * p95 and 2.07× at most, the largest from RxJS, whose points there are a few
 * milliseconds. Below 2× this would fail on noise; so a change has to roughly
 * double, or halve, a library relative to the others to count.
 */
const THRESHOLD = 2;

const scenarios = [
  { title: 'single state', file: 'results-single-state.json' },
  { title: 'derived chain', file: 'results.json' },
  { title: 'diamond', file: 'results-diamond.json' },
  { title: 'deep chain', file: 'results-deep-chain.json' },
  { title: 'cascaded diamond', file: 'results-cascaded-diamond.json' },
  { title: 'conditional fan-out', file: 'results-conditional-fan-out.json' },
] as const;

type Scenario = Readonly<{ title: string; file: string }>;

type Results = Readonly<
  | {
      kind: 'series';
      xLabels: readonly string[];
      series: readonly Readonly<{
        label: string;
        values: readonly (number | null)[];
      }>[];
    }
  | {
      kind: 'stats';
      rows: readonly Readonly<{ label: string; median: number }>[];
    }
>;

type Judged = Readonly<{ drifted: boolean; rows: readonly string[] }>;

const judgeScenario = (
  scenario: Scenario,
  reference: Results | undefined,
  committed: Results | undefined,
): Judged => {
  if (reference === undefined) {
    return {
      drifted: false,
      rows: [`| ${scenario.title} | — | — | — | — | no reference |`],
    };
  }

  if (committed === undefined) {
    return {
      drifted: true,
      rows: [`| ${scenario.title} | — | — | — | — | not committed |`],
    };
  }

  const changes = Arr.generate(function* () {
    for (const label of labelsOf(reference)) {
      const change = changeOf(label, reference, committed);

      if (change !== undefined) {
        yield { label, change };
      }
    }
  });

  const machine = median(changes.map((c) => c.change));

  if (machine === undefined || !Num.isNonZero(machine)) {
    return {
      drifted: true,
      rows: [`| ${scenario.title} | — | — | — | — | nothing to compare |`],
    };
  }

  const judged = changes.map(({ label, change }) => {
    const normalized = Num.div(change, machine);

    const drifted =
      normalized < Num.div(1, THRESHOLD) || THRESHOLD < normalized;

    return {
      drifted,
      row: `| ${scenario.title} | ${label} | ${change.toFixed(2)}× | ${machine.toFixed(2)}× | ${normalized.toFixed(2)}× | ${drifted ? '**drifted**' : 'ok'} |`,
    };
  });

  return {
    drifted: judged.some((j) => j.drifted),
    rows: judged.map((j) => j.row),
  };
};

/**
 * The geometric mean of reference / committed over the points both measured.
 *
 * Geometric because the points of a sweep span three orders of magnitude, and
 * an arithmetic mean would be the largest point's ratio alone. A point that
 * timed out on either side says nothing about the ratio and is left out.
 */
const changeOf = (
  label: string,
  reference: Results,
  committed: Results,
): number | undefined => {
  const logs = Arr.generate(function* () {
    for (const point of pointsOf(reference)) {
      const r = valueAt(reference, label, point);

      const c = valueAt(committed, label, point);

      if (r !== undefined && c !== undefined && r > 0 && Num.isNonZero(c)) {
        yield Math.log(Num.div(r, c));
      }
    }
  });

  return Arr.isNonEmpty(logs)
    ? Math.exp(Num.div(Arr.sum(logs), Arr.length(logs)))
    : undefined;
};

const median = (values: readonly number[]): number | undefined => {
  const sorted = values.toSorted((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  const upper = sorted[mid];

  if (upper === undefined) {
    return undefined;
  }

  const lower = sorted[mid - 1];

  return lower === undefined || sorted.length % 2 === 1
    ? upper
    : Num.div(lower + upper, 2);
};

const readScenario = async (
  dir: string,
  file: string,
): Promise<Results | undefined> => {
  const read = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(dir, file), 'utf8'),
  );

  return Result.isErr(read)
    ? undefined
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (JSON.parse(read.value) as unknown as Results);
};

const labelsOf = (results: Results): readonly string[] =>
  results.kind === 'stats'
    ? results.rows.map((r) => r.label)
    : results.series.map((s) => s.label);

/** `''` for a single-point scenario, the sweep's labels for a swept one. */
const pointsOf = (results: Results): readonly string[] =>
  results.kind === 'stats' ? ([''] as const) : results.xLabels;

const valueAt = (
  results: Results,
  label: string,
  point: string,
): number | undefined => {
  if (results.kind === 'stats') {
    return results.rows.find((r) => r.label === label)?.median;
  }

  const index = results.xLabels.indexOf(point);

  if (index === -1) {
    return undefined;
  }

  return (
    results.series.find((s) => s.label === label)?.values[index] ?? undefined
  );
};

await main();
