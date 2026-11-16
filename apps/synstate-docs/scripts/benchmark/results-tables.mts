import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Json, Result, hasKey, isRecord, unknownToString } from 'ts-data-forge';
import { isResultsTable } from './paths.mjs';

// What `check-drift.mts` and `compare-results.mts` both read: the
// `results*.json` tables of a directory, their names, and their contents. A
// scenario whose runner writes a table there is covered by both with no edit to
// either.

/**
 * The summary's name for each scenario, in the order the page shows them.
 * Every `results*.json` on either side is judged, named or not, so that a
 * scenario left out here is still compared; one not named here is listed by its
 * file name after these.
 */
const scenarioTitles = [
  ['results-single-state.json', 'single state'],
  ['results.json', 'derived chain'],
  ['results-diamond.json', 'diamond'],
  ['results-deep-chain.json', 'deep chain'],
  ['results-cascaded-diamond.json', 'cascaded diamond'],
  ['results-conditional-fan-out.json', 'conditional fan-out'],
  ['results-equality-cut-off.json', 'equality cut-off'],
] as const;

export const titleOf = (file: string): string =>
  scenarioTitles.find(([f]) => f === file)?.[1] ?? file;

/** The files of both sides, the named ones first in their order. */
export const scenarioFiles = (
  inReference: ReadonlySet<string>,
  inCommitted: ReadonlySet<string>,
): readonly string[] => {
  const all = inReference.union(inCommitted);

  const named = scenarioTitles
    .map(([file]) => file)
    .filter((file) => all.has(file));

  const unnamed = Array.from(all)
    .filter((file) => !named.includes(file))
    .toSorted();

  return [...named, ...unnamed];
};

/**
 * The tables in `dir`, or why it cannot be listed, which `main` reports as a
 * row rather than a crash, so that the summary is printed and `drifted`
 * written.
 */
export const resultsFilesIn = async (
  dir: string,
): Promise<Result<ReadonlySet<string>, string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = await Result.fromPromise(fs.readdir(dir));

  return Result.isOk(files)
    ? Result.ok(new Set(files.value.filter(isResultsTable)))
    : Result.err(unknownToString(files.value));
};

export type Results = Readonly<
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

/** `''` for a single-point scenario, the sweep's labels for a swept one. */
export const pointsOf = (results: Results): readonly string[] =>
  results.kind === 'stats' ? ([''] as const) : results.xLabels;

export const valueAt = (
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

export const labelsOf = (results: Results): readonly string[] =>
  results.kind === 'stats'
    ? results.rows.map((r) => r.label)
    : results.series.map((s) => s.label);

/**
 * A file `resultsFilesIn` listed, or why it cannot be compared: it fails to
 * read, is not JSON, or has no `kind` and the field it names. The rest of the
 * shape is what `writeBenchmarkResults` writes and is not checked again here.
 */
export const readScenario = async (
  dir: string,
  file: string,
): Promise<Result<Results, string>> => {
  const read = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(dir, file), 'utf8'),
  );

  if (Result.isErr(read)) {
    return Result.err(`cannot be read (${unknownToString(read.value)})`);
  }

  const json = Json.parse(read.value);

  if (Result.isErr(json)) {
    return Result.err(`not JSON (${json.value})`);
  }

  const parsed = json.value;

  if (
    !isRecord(parsed) ||
    !hasKey(parsed, 'kind') ||
    (parsed.kind === 'series'
      ? !hasKey(parsed, 'xLabels') || !hasKey(parsed, 'series')
      : parsed.kind !== 'stats' || !hasKey(parsed, 'rows'))
  ) {
    return Result.err(
      'not a benchmark table (a `kind` of `series` with `xLabels` and `series`, or of `stats` with `rows`)',
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Result.ok(parsed as unknown as Results);
};
