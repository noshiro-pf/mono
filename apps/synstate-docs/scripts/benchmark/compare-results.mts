import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result } from 'ts-data-forge';

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
 * Only SynState's rows are reported as the answer. Every other library's row
 * is there to calibrate: the two measurements come from different runner
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

  const compared = await Promise.all(
    scenarios.map(async (scenario) =>
      compareScenario(
        scenario,
        await readScenario(baselineDir, scenario.file),
        await readScenario(currentDir, scenario.file),
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

const LIBRARIES = ['SynState', 'RxJS', 'Jotai', 'MobX'] as const;

const scenarios = [
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

type Compared = Readonly<{
  synstate: readonly string[];
  calibration: readonly string[];
}>;

const compareScenario = (
  scenario: Scenario,
  baseline: Results | undefined,
  current: Results | undefined,
): Compared => {
  if (baseline === undefined || current === undefined) {
    return {
      synstate: [
        `| ${scenario.title} | — | — | — | not measured on both sides |`,
      ],
      calibration: [],
    };
  }

  const measured = LIBRARIES.flatMap((label) =>
    pointsOf(current).flatMap((point) =>
      comparePoint(label, point, baseline, current),
    ),
  );

  return {
    synstate: measured
      .filter((m) => m.label === 'SynState')
      .map(
        (m) =>
          `| ${scenario.title} | ${m.point} | ${m.baseline} ms | ${m.current} ms | ${m.ratio}x |`,
      ),
    calibration: measured
      .filter((m) => m.label !== 'SynState')
      .map((m) => `${m.label} ${scenario.title} ${m.point}: ${m.ratio}x`),
  };
};

type Point = Readonly<{
  label: string;
  point: string;
  baseline: string;
  current: string;
  ratio: string;
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
