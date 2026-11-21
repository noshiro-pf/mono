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
 * Fails when a committed synstate benchmark table was not measured by the
 * benchmark workflow: `environment.runner` is `'local'`, or there is no
 * `environment` at all. The tables are each documentation site's
 * `benchmark-results.json`: synstate's, measured by `synstate-benchmark.yml`,
 * and synstate-next's, measured by `synstate-next-benchmark.yml` until that
 * site is removed.
 *
 * The benchmark page says its numbers come from CI on a pinned runner, and
 * another machine's CPU moves the ratios between libraries. A local run
 * committed by mistake passes everything else: `gen:benchmark` embeds whatever
 * the file holds.
 *
 * A root guard rather than part of `gen:benchmark`, because the local
 * `benchmark` command runs that generator on what it has just measured: running
 * the benchmark locally works, and only committing its table fails.
 */
export const checkSynstateBenchmarkRunner = (): Promise<
  Result<number, string>
> =>
  Result.safeTry(async function* () {
    const tables = yield* Result.safeUnwrap(await readTables());

    const missing = RESULTS_FILES.filter((expected) =>
      tables.every(({ file }) => file !== expected),
    );

    if (Arr.isNonEmpty(missing)) {
      return Result.err(
        `❌ ${missing.join(', ')} is not tracked; if it moved, point this check at it.`,
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
      const recorded = readRunner(content);

      if (recorded === undefined) {
        yield `${file}: records no environment (\`environment\`), so nothing says where it was measured.`;
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

export const DOCS_RESULTS =
  'apps/synstate-docs/src/data/benchmark-results.json';

export const NEXT_RESULTS =
  'apps/synstate-next-docs/src/data/benchmark-results.json';

const RESULTS_FILES: readonly string[] = [DOCS_RESULTS, NEXT_RESULTS] as const;

/** Whether a tracked path, from the repository root, is a benchmark table. */
export const isResultsTable = (file: string): boolean =>
  RESULTS_FILES.includes(file);

/**
 * The runner the file records, or `undefined` where it records no environment.
 * Wrapped, so that a runner of the wrong type is reported as what it is rather
 * than as missing.
 */
const readRunner = (
  content: unknown,
): Readonly<{ runner: unknown }> | undefined => {
  const environment =
    isRecord(content) && hasKey(content, 'environment')
      ? content.environment
      : undefined;

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
    '❌ A synstate benchmark table was not measured on the pinned runner,',
    '   while the page says its numbers were:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'Measuring locally is for trying a change, not for committing. If the',
    'change is not meant to move the numbers, restore the file from main. If',
    'it is, dispatch the benchmark workflow of its site on the branch',
    `(\`synstate-benchmark.yml\` for ${DOCS_RESULTS},`,
    `\`synstate-next-benchmark.yml\` for ${NEXT_RESULTS}), put the file of the`,
    'artifact it uploads in its place, and run `gen:benchmark` in that site.',
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
    `Every synstate benchmark table was measured on the pinned runner (${result.value} tables).`,
  );
}
