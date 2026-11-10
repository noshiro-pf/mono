import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Arr,
  Json,
  Result,
  expectType,
  hasKey,
  isRecord,
  isString,
} from 'ts-data-forge';
import type { ReadonlyRecord, UnknownRecord } from 'ts-type-forge';
import {
  cascadedDiamond,
  conditionalFanOut,
  deepChain,
  derivedChain,
  diamond,
  equalityCutOff,
  libraryColorOf,
  singleState,
} from '../src/data/index.mjs';
import type { BenchmarkEnvironment } from './benchmark/environment.mjs';
import { isResultsTable, resultsDir } from './benchmark/paths.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * The checks that hold for any measurement, whatever the prose says about it.
 *
 * `gen:benchmark-doc` runs them on the committed tables, and the benchmark
 * workflow runs them on its fresh measurement (`check-measurement.mts`) — which
 * it does not hand to `gen:benchmark-doc`, so that a near tie in one noisy
 * re-measurement does not fail the job that judges drift. Without that, a
 * measurement the page could not be generated from at all (two scenarios on two
 * dates, a library with no colour) would become a cached baseline before anyone
 * tried to commit it.
 *
 * Here rather than under `scripts/benchmark/`, whose every file is part of the
 * workflow's baseline cache key: a change to a check measures nothing, and must
 * not make `main` re-measure.
 */

/**
 * Where every table on the page was measured. A table that records no
 * environment, or one without every field a runner writes, fails here, naming
 * its file: every runner writes a whole environment (`readBenchmarkEnvironment`
 * in `scripts/benchmark/environment.mts`), and a page whose tables come from no
 * stated machine is not one to generate. Committing a table measured locally is
 * refused by the root guard `check:root:synstate-benchmark-runner`, not here —
 * the local `benchmark` command runs `gen:benchmark-doc` on its own
 * measurement.
 *
 * The scenarios must agree, the date included — `benchmark` measures all of
 * them in one pass, and re-measuring one alone (`benchmark:deep-chain`) is
 * useful on one machine and misleading across two, so a disagreement fails here
 * rather than being averaged into a claim. Each runner stamps the date itself,
 * so the workflow pins one for the whole pass (`BENCHMARK_MEASURED_ON`, read in
 * `scripts/benchmark/environment.mts`).
 */
export const recordedEnvironment = (): RecordedEnvironment => {
  const tables = readTables();

  const missing = Arr.generate(function* () {
    for (const { file, environment } of tables) {
      if (Result.isErr(environment)) {
        yield `  - ${shown(file)}: ${environment.value}`;
      }
    }
  });

  if (Arr.isNonEmpty(missing)) {
    throw new Error(
      [
        '❌ These results files record no environment, or one that is not what',
        'a runner writes, so the page cannot say where their numbers come from:',
        ...missing,
        '',
        'In a fresh measurement, a runner stopped writing it',
        '(`readBenchmarkEnvironment` in `scripts/benchmark/environment.mts`).',
        ...WHERE_TABLES_COME_FROM,
      ].join('\n'),
    );
  }

  const recorded = Arr.generate(function* () {
    for (const { file, environment } of tables) {
      if (Result.isOk(environment)) {
        yield { file, environment: environment.value };
      }
    }
  });

  // Empty only when there is no table at all: every table read has an
  // environment by now.
  if (!Arr.isNonEmpty(recorded)) {
    throw new Error(
      `❌ There is no results*.json under ${shown('.')} to read an environment from; if the tables moved, point \`resultsDir\` (scripts/benchmark/paths.mts) at them.`,
    );
  }

  const [{ environment: first }] = recorded;

  const disagreements = Arr.generate(function* () {
    for (const key of ENVIRONMENT_KEYS) {
      const filesByValue = Arr.groupBy(recorded, ({ environment }) =>
        JSON.stringify(environment[key]),
      );

      if (filesByValue.size > 1) {
        yield `  - ${key}: ${Array.from(
          filesByValue.entries(),
          ([value, inFiles]) =>
            `${value} (${inFiles.map(({ file }) => shown(file)).join(', ')})`,
        ).join('; ')}`;
      }
    }
  });

  if (Arr.isNonEmpty(disagreements)) {
    throw new Error(
      [
        '❌ The scenarios disagree about where they were measured, so no single',
        'value describes the page:',
        ...disagreements,
        '',
        'To try a change locally, re-measure every scenario with',
        '`pnpm --filter @synstate/docs run benchmark`.',
        ...WHERE_TABLES_COME_FROM,
      ].join('\n'),
    );
  }

  return first;
};

/**
 * Fails on a library the benchmark charts have no colour for.
 *
 * The charts draw a label `libraryColorOf` has no colour for in the axis grey,
 * which nothing notices: a runner that gained a library used to need it added
 * to a colour map per chart by hand. Checked here rather than in the chart,
 * because a throw there only fires in the reader's browser.
 */
export const assertEveryLibraryHasAColour = (): void => {
  const labels = [
    ...[cascadedDiamond, conditionalFanOut, deepChain, equalityCutOff].flatMap(
      ({ series }) => series.map(({ label }) => label),
    ),
    ...[singleState, derivedChain, diamond].flatMap(({ rows }) =>
      rows.map(({ label }) => label),
    ),
  ] as const;

  const missing = Arr.uniq(
    labels.filter((label) => libraryColorOf(label) === undefined),
  );

  if (Arr.isNonEmpty(missing)) {
    throw new Error(
      `❌ no chart colour for ${missing.join(', ')}; add it to src/data/library-colors.mts, then run \`pnpm run gen:benchmark-doc fix:fmt\` to embed the results`,
    );
  }
};

/**
 * What the errors of {@link recordedEnvironment} say about the tables they name.
 * The same errors are raised on the committed tables (`gen:benchmark-doc`) and
 * on the workflow's fresh measurement (`check-measurement.mts`), so each
 * sentence says which case it is for.
 */
const WHERE_TABLES_COME_FROM = [
  'Committed tables come from the benchmark workflow: the files of its',
  '`synstate-benchmark-to-commit-<run id>` artifact, uploaded when it reports',
  'that the tables drifted, or of `synstate-benchmark-<run id>`, its fresh',
  'measurement. A local one is refused by `check:root:synstate-benchmark-runner`.',
  'An untracked table left by a local run of another branch can be deleted.',
] as const;

/** The environment a results file records, as the checks and the prose read it. */
export type RecordedEnvironment = Readonly<{
  runner: string;
  runnerImage: string | null;
  node: string;
  platform: string;
  arch: string;
  cpu: string;
  measuredOn: string;
  libraries: ReadonlyRecord<string, string>;
}>;

/**
 * Every field a runner records, each compared on its own. The type check below
 * keeps it complete: a field added to what the runners write and not here would
 * let two machines that differ only in it pass as one.
 */
const ENVIRONMENT_KEYS = [
  'runner',
  'runnerImage',
  'node',
  'platform',
  'arch',
  'cpu',
  'measuredOn',
  'libraries',
] as const satisfies readonly (keyof RecordedEnvironment)[];

expectType<(typeof ENVIRONMENT_KEYS)[number], keyof BenchmarkEnvironment>('=');

expectType<keyof RecordedEnvironment, keyof BenchmarkEnvironment>('=');

/** How each field of {@link RecordedEnvironment} is checked in the JSON. */
const FIELD_IS = {
  runner: (v) => v === 'github-actions' || v === 'local',
  runnerImage: (v) => isString(v) || v === null,
  node: isString,
  platform: isString,
  arch: isString,
  cpu: isString,
  measuredOn: isString,
  libraries: (v) => {
    if (!isRecord(v)) {
      return false;
    }

    const versions = Object.values(v);

    return Arr.isNonEmpty(versions) && versions.every(isString);
  },
} as const satisfies ReadonlyRecord<
  keyof RecordedEnvironment,
  (v: unknown) => boolean
>;

expectType<BenchmarkEnvironment['runner'], 'github-actions' | 'local'>('=');

/** The fields of an environment that are missing or not what a runner writes. */
const invalidFields = (
  environment: UnknownRecord,
): readonly (keyof RecordedEnvironment)[] =>
  ENVIRONMENT_KEYS.filter(
    (key) => !hasKey(environment, key) || !FIELD_IS[key](environment[key]),
  );

const isRecordedEnvironment = (u: unknown): u is RecordedEnvironment =>
  isRecord(u) && !Arr.isNonEmpty(invalidFields(u));

/**
 * A results file's environment, or what is wrong with it: none recorded, or the
 * fields that are missing or not what a runner writes. Read from `unknown`:
 * `tsx` runs this without type-checking, so what is checked is the JSON on
 * disk, not what its inferred type says.
 */
const environmentOf = (
  results: unknown,
): Result<RecordedEnvironment, string> => {
  if (
    !isRecord(results) ||
    !hasKey(results, 'meta') ||
    !isRecord(results.meta) ||
    !hasKey(results.meta, 'environment')
  ) {
    return Result.err('no `meta.environment`');
  }

  const environment = results.meta.environment;

  if (!isRecord(environment)) {
    return Result.err('`meta.environment` is not an object');
  }

  const invalid = invalidFields(environment);

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(`missing or invalid ${invalid.join(', ')}`);
  }

  // `invalidFields` found nothing, which is what the guard checks.
  return isRecordedEnvironment(environment)
    ? Result.ok(environment)
    : Result.err('`meta.environment` is not what a runner writes');
};

/** A file under `resultsDir` as the messages name it: from the package root. */
const shown = (file: string): string =>
  path.relative(workspaceRootPath, path.resolve(resultsDir, file));

const readJson = (file: string): unknown => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = fs.readFileSync(path.resolve(resultsDir, file), 'utf8');

  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    throw new Error(`❌ ${shown(file)} is not JSON: ${parsed.value}`);
  }

  return parsed.value;
};

/**
 * Every `results*.json` under `src/data/`, with the environment it records.
 * Every table a runner writes is named so (`writeBenchmarkResults`). The root
 * guard `check:root:synstate-benchmark-runner` reads the tracked ones of the
 * same names.
 *
 * Read from the directory rather than through the `src/data` barrel, so that a
 * table is checked whether or not anything imports it and the error names the
 * file that was read. Tracked or not: the benchmark workflow measures into this
 * directory and uploads it whole, as the artifact to commit and as the baseline
 * the next pull request is judged against, so a stray table there is one to
 * fail on.
 */
const readTables = (): readonly Readonly<{
  file: string;
  environment: Result<RecordedEnvironment, string>;
}>[] =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  (fs.existsSync(resultsDir) ? fs.readdirSync(resultsDir) : [])
    .filter(isResultsTable)
    .toSorted()
    .map((file) => ({ file, environment: environmentOf(readJson(file)) }));
