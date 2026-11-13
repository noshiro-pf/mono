import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails when a committed SynState benchmark table was not measured by the
 * benchmark workflow: `meta.environment.runner` is `'local'`, or there is no
 * `meta.environment` at all. The same holds for the synstate-next
 * documentation's `benchmark-results.json`, which keeps its environment at the
 * top (`environment.runner`) and is measured by `synstate-next-benchmark.yml`:
 * its page is read beside synstate's, and another machine's CPU moves the
 * ratios between libraries.
 *
 * The benchmark page says its numbers come from CI on a pinned runner, and
 * `synstate-benchmark.yml` judges drift against that runner alone. A local pass
 * committed by mistake passes everything else as long as all the tables agree
 * with one another: the checks in
 * `apps/synstate-docs/scripts/measurement-checks.mts` fail on a table whose
 * environment is missing, malformed or differs from the others', not on one
 * that records `'local'` in every table.
 *
 * A root guard rather than part of `gen:benchmark-doc`, because the local
 * `benchmark` command runs that generator on what it has just measured: running
 * the benchmark locally works, and only committing its tables fails.
 */
export const checkSynstateBenchmarkRunner = (): Promise<
  Result<number, string>
> =>
  Result.safeTry(async function* () {
    const tables = yield* Result.safeUnwrap(await readTables());

    if (tables.every(({ file }) => !isInDocsDataDir(file))) {
      return Result.err(
        `❌ No results*.json is tracked under ${RESULTS_DIR}; if the tables moved, point this check at them.`,
      );
    }

    if (tables.every(({ file }) => file !== NEXT_RESULTS)) {
      return Result.err(
        `❌ ${NEXT_RESULTS} is not tracked; if it moved, point this check at it.`,
      );
    }

    const violations = collectRunnerViolations(tables);

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok(tables.length);
  });

/**
 * One message per table that does not record the workflow as its runner, each
 * starting with the table's path.
 */
export const collectRunnerViolations = (
  tables: readonly Table[],
): readonly string[] =>
  Arr.generate(function* () {
    for (const { file, content } of tables) {
      const location = environmentLocation(file);

      const recorded = readRunner(content, location);

      if (recorded === undefined) {
        yield `${file}: records no environment (\`${location.join('.')}\`), so nothing says where it was measured.`;
      } else if (!isString(recorded.runner)) {
        yield `${file}: records a runner that is not a string, ${JSON.stringify(recorded.runner)}.`;
      } else if (recorded.runner !== PINNED_RUNNER) {
        yield `${file}: records runner ${JSON.stringify(recorded.runner)}, not ${JSON.stringify(PINNED_RUNNER)}.`;
      }
    }
  });

export type Table = Readonly<{
  /** The path from the repository root. */
  file: string;
  /** The parsed JSON. */
  content: unknown;
}>;

/** What `readBenchmarkEnvironment` writes when the workflow measured it. */
const PINNED_RUNNER = 'github-actions';

const RESULTS_DIR = 'apps/synstate-docs/src/data';

const RESULTS_FILE = /^results.*\.json$/u;

export const NEXT_RESULTS =
  'apps/synstate-next-docs/src/data/benchmark-results.json';

/** Whether a tracked path, from the repository root, is a benchmark table. */
export const isResultsTable = (file: string): boolean => {
  const { dir, base } = path.posix.parse(file);

  return (
    (dir === RESULTS_DIR && RESULTS_FILE.test(base)) || file === NEXT_RESULTS
  );
};

const isInDocsDataDir = (file: string): boolean =>
  path.posix.dirname(file) === RESULTS_DIR;

/**
 * Where a file keeps its environment, decided by its path rather than by what
 * it holds, so that a synstate table missing `meta` is not read as
 * synstate-next's layout: synstate-next's `benchmark-results.json` keeps it at
 * the top, synstate's tables under `meta`.
 */
const environmentLocation = (
  file: string,
): readonly ['environment'] | readonly ['meta', 'environment'] =>
  file === NEXT_RESULTS
    ? (['environment'] as const)
    : (['meta', 'environment'] as const);

/**
 * The runner recorded at `location`, or `undefined` where the file records no
 * environment there. Wrapped, so that a runner of the wrong type is reported as
 * what it is rather than as missing.
 */
const readRunner = (
  content: unknown,
  location: ReturnType<typeof environmentLocation>,
): Readonly<{ runner: unknown }> | undefined => {
  const environment = location.reduce<unknown>(
    (holder, key) =>
      isRecord(holder) && hasKey(holder, key) ? holder[key] : undefined,
    content,
  );

  return !isRecord(environment) || !hasKey(environment, 'runner')
    ? undefined
    : { runner: environment.runner };
};

/**
 * The tracked tables, as the working tree has them: an untracked file left by a
 * local run is not committed, and a tracked one edited by it is about to be.
 * The prefix is added here because `repo-files.mts` does not add one.
 */
const readTables = async (): Promise<Result<readonly Table[], string>> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const files = tracked.value.filter(isResultsTable);

  const results = await Promise.all(
    files.map(async (file): Promise<Result<Table, string>> => {
      const read = await readRepositoryFile(file);

      if (Result.isErr(read)) {
        return Result.err(`❌ ${read.value}`);
      }

      const parsed = Json.parse(read.value);

      return Result.isErr(parsed)
        ? Result.err(
            `❌ Failed to parse ${file}: ${unknownToString(parsed.value)}`,
          )
        : Result.ok({ file, content: parsed.value });
    }),
  );

  const firstError = results.find(Result.isErr);

  return firstError !== undefined
    ? Result.err(firstError.value)
    : Result.ok(results.filter(Result.isOk).map((r) => r.value));
};

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ A SynState benchmark table was not measured on the pinned runner,',
    '   while the page says its numbers were:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    `For ${NEXT_RESULTS}: dispatch the synstate-next Benchmark`,
    'workflow (`synstate-next-benchmark.yml`) on the branch, put the file of',
    'the artifact it uploads in its place, and run',
    '`pnpm --filter synstate-next-docs run gen:benchmark`; or restore it from',
    'main if the change is not meant to move the numbers.',
    '',
    `For the tables in ${RESULTS_DIR}:`,
    'Measuring locally is for trying a change, not for committing. If the',
    'change is not meant to move the numbers, restore the tables from main',
    `(\`git checkout origin/main -- '${RESULTS_DIR}/results*'\`, or the`,
    'branch below on a stacked one). If it is,',
    'replace them with the files of the `synstate-benchmark-to-commit-<run id>`',
    'artifact the SynState Benchmark workflow uploads when it reports that the',
    'tables drifted (or of `synstate-benchmark-<run id>`, its fresh',
    'measurement). Either way, then run',
    '`pnpm --filter @synstate/docs run gen:benchmark-doc` and `pnpm run fmt`,',
    'and commit the result.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkSynstateBenchmarkRunner().catch((error: unknown) =>
    Result.err(`❌ ${unknownToString(error)}`),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every SynState benchmark table was measured on the pinned runner (${result.value} tables).`,
  );
}
