import * as fs from 'node:fs/promises';
import { Arr, Num, Result } from 'ts-data-forge';
import {
  labelsOf,
  pointsOf,
  readScenario,
  resultsFilesIn,
  scenarioFiles,
  titleOf,
  valueAt,
  type Results,
} from './results-tables.mjs';

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
 * Absolute milliseconds cannot be compared across runs: unchanged code moved by
 * 0.8–1.4× between runs on `ubuntu-24.04`, one point by 2.5×, because the
 * runner instances differ. So each library's change is divided by the median
 * change of every library in the same scenario, which is the machine's share of
 * it, and only what is left is judged. A scenario, a library, or a point of a
 * sweep, that only one side has is drift too, and so is a library with no point
 * measured on both sides.
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

  const [referenceListed, committedListed] = await Promise.all([
    resultsFilesIn(referenceDir),
    resultsFilesIn(committedDir),
  ]);

  // A side that cannot be listed is reported as such, alone: judged as an empty
  // side, every table on the other would read as missing from it.
  const unlisted = [
    ...(Result.isErr(referenceListed)
      ? [`the reference (${referenceListed.value})`]
      : []),
    ...(Result.isErr(committedListed)
      ? [`the committed tables (${committedListed.value})`]
      : []),
  ].map((side) => `| — | — | — | — | — | **cannot list ${side}** |`);

  const inReference = Result.isOk(referenceListed)
    ? referenceListed.value
    : new Set<string>();

  const inCommitted = Result.isOk(committedListed)
    ? committedListed.value
    : new Set<string>();

  const files = scenarioFiles(inReference, inCommitted);

  const judged: readonly Judged[] = Arr.isNonEmpty(unlisted)
    ? ([{ drifted: true, rows: unlisted }] as const)
    : Arr.isNonEmpty(files)
      ? await Promise.all(
          files.map(async (file) =>
            judgeScenario(
              titleOf(file),
              inReference.has(file)
                ? await readScenario(referenceDir, file)
                : undefined,
              inCommitted.has(file)
                ? await readScenario(committedDir, file)
                : undefined,
            ),
          ),
        )
      : // Two directories with no table, as a wrong path that exists gives,
        // would otherwise pass.
        ([
          {
            drifted: true,
            rows: [
              '| — | — | — | — | — | **no results*.json on either side** |',
            ],
          },
        ] as const);

  const drifted = judged.some((j) => j.drifted);

  console.log(
    [
      drifted
        ? '### The committed tables have drifted from the reference'
        : '### The committed tables are within tolerance of the reference',
      '',
      `Each library's change (geometric mean over the scenario's points of reference / committed), divided by the median change of all libraries in that scenario. Drift is a value beyond ${THRESHOLD.toString()}× either way, a scenario, library or point only one side has, or a library with no point measured on both sides.`,
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
 * normalized change between two of them was 1.05× at the median, 1.44× at p95
 * and 2.07× at most, the largest from RxJS, whose points there are a few
 * milliseconds. Below 2× this would fail on noise; so a change has to roughly
 * double, or halve, a library relative to the others to count.
 */
const THRESHOLD = 2;

type Judged = Readonly<{ drifted: boolean; rows: readonly string[] }>;

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

/** The sweep's labels, or none for a single-point scenario. */
const sweepPointsOf = (results: Results): readonly string[] =>
  results.kind === 'stats' ? ([] as const) : results.xLabels;

/** Whether `label` has a value at any point, rather than timing out at all. */
const isMeasured = (results: Results, label: string): boolean =>
  pointsOf(results).some((point) => {
    const value = valueAt(results, label, point);

    return value !== undefined && value > 0;
  });

/**
 * A drifted row for each library, and each point of a sweep, that only one side
 * has, and for each library both sides have that no point compares (one side
 * timed out wherever the other measured it). The ratios below compare only
 * points both sides measured, so without these a library added to a runner, or
 * one removed from it, would pass while the published tables lack it or still
 * show it. A library that timed out everywhere on both sides is left out.
 */
const oneSidedRows = (
  title: string,
  reference: Results,
  committed: Results,
): readonly string[] => {
  const row = (name: string, verdict: string): string =>
    `| ${title} | ${name} | — | — | — | **${verdict}** |` as const;

  const differences = (
    names: (results: Results) => readonly string[],
    describe: (name: string) => string,
  ): readonly string[] => {
    const inReference = new Set(names(reference));

    const inCommitted = new Set(names(committed));

    return [
      ...Array.from(inReference)
        .filter((name) => !inCommitted.has(name))
        .map((name) =>
          row(describe(name), 'missing from the committed tables'),
        ),
      ...Array.from(inCommitted)
        .filter((name) => !inReference.has(name))
        .map((name) => row(describe(name), 'missing from the reference')),
    ];
  };

  const committedLabels = new Set(labelsOf(committed));

  const incomparable = Arr.generate(function* () {
    for (const label of labelsOf(reference)) {
      if (
        committedLabels.has(label) &&
        changeOf(label, reference, committed) === undefined &&
        (isMeasured(reference, label) || isMeasured(committed, label))
      ) {
        yield row(label, 'no point measured on both sides');
      }
    }
  });

  return [
    ...differences(labelsOf, (label) => label),
    ...differences(sweepPointsOf, (point) => `point ${point}`),
    ...incomparable,
  ];
};

const judgeScenario = (
  title: string,
  referenceRead: Result<Results, string> | undefined,
  committedRead: Result<Results, string> | undefined,
): Judged => {
  const drift = (verdict: string): string =>
    `| ${title} | — | — | — | — | **${verdict}** |` as const;

  // A table neither side can be compared on is drift, reported as a row rather
  // than thrown, so that the summary is printed and `drifted` written.
  const unreadable = [
    ...(referenceRead !== undefined && Result.isErr(referenceRead)
      ? ([
          drift(`unreadable in the reference: ${referenceRead.value}`),
        ] as const)
      : ([] as const)),
    ...(committedRead !== undefined && Result.isErr(committedRead)
      ? ([
          drift(`unreadable in the committed tables: ${committedRead.value}`),
        ] as const)
      : ([] as const)),
  ] as const;

  if (Arr.isNonEmpty(unreadable)) {
    return { drifted: true, rows: unreadable };
  }

  // Neither is an error by now; the tests narrow the types.
  const reference =
    referenceRead === undefined || Result.isErr(referenceRead)
      ? undefined
      : referenceRead.value;

  const committed =
    committedRead === undefined || Result.isErr(committedRead)
      ? undefined
      : committedRead.value;

  // A results file the reference lacks is a scenario the runners no longer
  // measure, or one they stopped writing; the published table would go on
  // showing it.
  if (reference === undefined) {
    return { drifted: true, rows: [drift('missing from the reference')] };
  }

  if (committed === undefined) {
    return {
      drifted: true,
      rows: [drift('missing from the committed tables')],
    };
  }

  if (reference.kind !== committed.kind) {
    // A sweep against a single point has no ratio worth printing.
    return {
      drifted: true,
      rows: [
        drift(
          `${reference.kind} in the reference, ${committed.kind} in the committed tables`,
        ),
      ],
    };
  }

  const oneSided = oneSidedRows(title, reference, committed);

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
      rows: Arr.toPushed(oneSided, drift('nothing to compare')),
    };
  }

  const judged = changes.map(({ label, change }) => {
    const normalized = Num.div(change, machine);

    const drifted =
      normalized < Num.div(1, THRESHOLD) || THRESHOLD < normalized;

    return {
      drifted,
      row: `| ${title} | ${label} | ${change.toFixed(2)}× | ${machine.toFixed(2)}× | ${normalized.toFixed(2)}× | ${drifted ? '**drifted**' : 'ok'} |`,
    };
  });

  return {
    drifted: Arr.isNonEmpty(oneSided) || judged.some((j) => j.drifted),
    rows: [...oneSided, ...judged.map((j) => j.row)],
  };
};

await main();
