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
 * Compares two directories of results and prints what moved, as Markdown.
 *
 * `compare-results.mjs <baselineDir> <currentDir>`
 *
 * The point is to make a change to SynState's own code visible without
 * committing a new set of numbers. CI restores the cached measurement for the
 * current library versions as the baseline, measures the branch, and prints
 * this — so a pull request that slows propagation down says so in its own run
 * instead of being found months later by someone re-reading a table.
 *
 * Every `results*.json` on either side is compared, as `check-drift.mts` judges
 * them, and a table that is on one side only, or cannot be read, or a directory
 * that cannot be listed, is reported as a row.
 *
 * Only SynState's rows are reported as the answer. Every other library's row is
 * there to calibrate: the two measurements come from different runner
 * instances, so if RxJS and Jotai moved by the same fraction as SynState, the
 * machine moved and not the code.
 */
const main = async (): Promise<void> => {
  const [baselineDir, currentDir] = Arr.skip(process.argv, 2);

  if (baselineDir === undefined || currentDir === undefined) {
    console.error(
      [
        'Usage: compare-results.mjs <baselineDir> <currentDir>',
        'Both are directories holding the results*.json a benchmark run wrote.',
      ].join('\n'),
    );

    process.exit(1);
  }

  const [baselineListed, currentListed] = await Promise.all([
    resultsFilesIn(baselineDir),
    resultsFilesIn(currentDir),
  ]);

  const unlisted: readonly Compared[] = [
    ...(Result.isErr(baselineListed)
      ? [`the baseline (${baselineListed.value})`]
      : []),
    ...(Result.isErr(currentListed)
      ? [`the current run (${currentListed.value})`]
      : []),
  ].map((side) => ({
    synstate: [`| — | — | — | — | cannot list ${side} |`],
    calibration: [],
  }));

  const inBaseline = Result.isOk(baselineListed)
    ? baselineListed.value
    : new Set<string>();

  const inCurrent = Result.isOk(currentListed)
    ? currentListed.value
    : new Set<string>();

  const compared: readonly Compared[] = Arr.isNonEmpty(unlisted)
    ? unlisted
    : await Promise.all(
        scenarioFiles(inBaseline, inCurrent).map(async (file) =>
          compareScenario(
            titleOf(file),
            inBaseline.has(file)
              ? await readScenario(baselineDir, file)
              : undefined,
            inCurrent.has(file)
              ? await readScenario(currentDir, file)
              : undefined,
          ),
        ),
      );

  console.log(
    [
      '### SynState, against the cached baseline',
      '',
      '| scenario | point | baseline | current | current / baseline |',
      '| :-- | :-- | --: | --: | --: |',
      ...compared.flatMap((c) => c.synstate),
      '',
      '<details><summary>The other libraries, for calibration</summary>',
      '',
      'Unchanged code measured on a different runner instance. A ratio here is',
      'the noise floor for the ratios above — if they all moved together, the',
      'machine moved.',
      '',
      '```text',
      ...compared.flatMap((c) => c.calibration),
      '```',
      '',
      '</details>',
    ].join('\n'),
  );
};

type Compared = Readonly<{
  synstate: readonly string[];
  calibration: readonly string[];
}>;

/** A list rather than an optional, so that the callers stay `flatMap`s. */
const comparePoint = (
  label: string,
  point: string,
  baseline: Results,
  current: Results,
): readonly Point[] => {
  const b = valueAt(baseline, label, point);

  const c = valueAt(current, label, point);

  if (b === undefined || c === undefined || !Num.isNonZero(b)) {
    return [];
  }

  return [
    {
      label,
      point: point === '' ? 'median' : point,
      baseline: b.toFixed(2),
      current: c.toFixed(2),
      ratio: Num.div(c, b).toFixed(2),
    },
  ];
};

/** SynState's rows: the plain one and a form such as `SynState (switchMap)`. */
const isSynState = (label: string): boolean =>
  label === 'SynState' || label.startsWith('SynState (');

/** ` (switchMap)` for `SynState (switchMap)`, `''` for `SynState`. */
const formOf = (label: string): string => label.slice('SynState'.length);

/**
 * The rows of one scenario: `undefined` for a side without its table, an error
 * for a side whose table cannot be read.
 */
const compareScenario = (
  title: string,
  baselineRead: Result<Results, string> | undefined,
  currentRead: Result<Results, string> | undefined,
): Compared => {
  const unreadable = [
    ...(baselineRead !== undefined && Result.isErr(baselineRead)
      ? ([`the baseline's ${baselineRead.value}`] as const)
      : ([] as const)),
    ...(currentRead !== undefined && Result.isErr(currentRead)
      ? ([`the current run's ${currentRead.value}`] as const)
      : ([] as const)),
  ] as const;

  if (Arr.isNonEmpty(unreadable)) {
    return {
      synstate: [`| ${title} | — | — | — | ${unreadable.join('; ')} |`],
      calibration: [],
    };
  }

  if (
    baselineRead === undefined ||
    currentRead === undefined ||
    Result.isErr(baselineRead) ||
    Result.isErr(currentRead)
  ) {
    return {
      synstate: [`| ${title} | — | — | — | not measured on both sides |`],
      calibration: [],
    };
  }

  const baseline = baselineRead.value;

  const current = currentRead.value;

  // The current run's rows, read from the file rather than named here, so that
  // a library or a form both runs measured is compared without a list to keep.
  // One the baseline lacks has nothing to be compared with and is left out.
  const measured = labelsOf(current).flatMap((label) =>
    pointsOf(current).flatMap((point) =>
      comparePoint(label, point, baseline, current),
    ),
  );

  return {
    synstate: measured
      .filter((m) => isSynState(m.label))
      .map(
        (m) =>
          `| ${title}${formOf(m.label)} | ${m.point} | ${m.baseline} ms | ${m.current} ms | ${m.ratio}x |`,
      ),
    calibration: measured
      .filter((m) => !isSynState(m.label))
      .map((m) => `${m.label} ${title} ${m.point}: ${m.ratio}x`),
  };
};

type Point = Readonly<{
  label: string;
  point: string;
  baseline: string;
  current: string;
  ratio: string;
}>;

await main();
