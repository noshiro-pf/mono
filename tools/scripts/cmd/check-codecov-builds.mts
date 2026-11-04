import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when the number of uploads `codecov.yml` waits for differs from the
 * number of uploads a pull request makes.
 *
 * Each `coverage: true` entry of code-check.yml's matrix uploads once, and
 * `codecov.notify.after_n_builds` and `comment.after_n_builds` hold Codecov's
 * statuses and comment until that many have arrived. Neither mismatch has a
 * symptom of its own: a number below the uploads brings back statuses and a
 * comment on part of the suite, one above it leaves a pull request with
 * neither, and both read as Codecov being slow.
 */
export const checkCodecovBuilds = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const workflowFile = yield* Result.safeUnwrap(
      await readRepoFile(WORKFLOW_PATH),
    );

    const codecovFile = yield* Result.safeUnwrap(
      await readRepoFile(CODECOV_PATH),
    );

    const uploads = countCoverageEntries(workflowFile);

    const violations = collectBuildCountViolations(
      uploads,
      readAfterNBuilds(codecovFile),
    );

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok({ uploads });
  });

/**
 * The matrix entries that upload coverage: the `coverage: true` keys of the
 * `- command:` entries, read with a line scanner as the other workflow guards
 * read theirs. Only a key at an entry's own indentation counts, so an action
 * input or a comment naming it is not an entry.
 */
export const countCoverageEntries = (workflowFile: string): number => {
  const lines = workflowFile.split('\n');

  const entryIndents = new Set<number>(
    Arr.generate(function* () {
      for (const line of lines) {
        const dash = /^(?<indent> *)- command:/u.exec(line)?.groups?.['indent'];

        if (dash !== undefined) {
          yield dash.length + 2;
        }
      }
    }),
  );

  return lines.filter((line) => {
    const indent = line.length - line.trimStart().length;

    return (
      entryIndents.has(indent) &&
      line.replace(/#.*/u, '').trim() === 'coverage: true'
    );
  }).length;
};

/**
 * Each `after_n_builds` of `codecov.yml`, keyed by the path of keys it sits
 * under (`codecov.notify`, `comment`), read two levels deep. One nested
 * anywhere else is keyed by where it is, so it does not stand in for either
 * setting. The value is the text after the colon, so that a non-number is
 * reported rather than read as missing.
 */
export const readAfterNBuilds = (
  codecovFile: string,
): ReadonlyMap<string, string> => {
  const mut_found = new Map<string, string>();

  let mut_topLevelKey = '';

  let mut_secondLevelKey = '';

  for (const line of codecovFile.split('\n')) {
    const matched = /^(?<indent> *)(?<key>[\w-]+):\s*(?<value>[^#\s]*)/u.exec(
      line,
    )?.groups;

    const indent = matched?.['indent']?.length;

    const key = matched?.['key'];

    if (indent === undefined || key === undefined) {
      continue;
    }

    if (indent === 0) {
      mut_topLevelKey = key;

      mut_secondLevelKey = '';
    } else if (indent === 2 && key !== AFTER_N_BUILDS) {
      mut_secondLevelKey = key;
    } else if (key === AFTER_N_BUILDS) {
      const at =
        indent === 2
          ? mut_topLevelKey
          : indent === 4
            ? (`${mut_topLevelKey}.${mut_secondLevelKey}` as const)
            : (`${mut_topLevelKey}.${mut_secondLevelKey}.…` as const);

      mut_found.set(at, matched?.['value'] ?? '');
    }
  }

  return mut_found;
};

/** What is wrong, as one message per `after_n_builds` that is. */
export const collectBuildCountViolations = (
  uploads: number,
  afterNBuilds: ReadonlyMap<string, string>,
): readonly string[] =>
  Arr.generate(function* () {
    if (uploads === 0) {
      yield `${WORKFLOW_PATH} has no \`coverage: true\` matrix entry, so nothing uploads coverage.`;
    }

    for (const [key, label] of SETTINGS) {
      const value = afterNBuilds.get(key);

      if (value === undefined) {
        yield `${CODECOV_PATH}: \`${label}\` is not set; set it to ${uploads}.`;

        continue;
      }

      const parsed = /^[1-9]\d*$/u.test(value)
        ? Result.unwrapOkOr(Num.safeParseInt(value), undefined)
        : undefined;

      if (parsed !== uploads) {
        yield `${CODECOV_PATH}: \`${label}: ${value}\` should be ${uploads}, the number of \`coverage: true\` entries in ${WORKFLOW_PATH}.`;
      }
    }
  });

type CheckSummary = Readonly<{
  uploads: number;
}>;

const WORKFLOW_PATH = '.github/workflows/code-check.yml';

const CODECOV_PATH = 'codecov.yml';

const AFTER_N_BUILDS = 'after_n_builds';

/** The top-level key each setting sits under, and how a message names it. */
const SETTINGS = [
  ['codecov.notify', 'codecov.notify.after_n_builds'],
  ['comment', 'comment.after_n_builds'],
] as const;

const readRepoFile = async (
  relativePath: string,
): Promise<Result<string, string>> => {
  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(projectRootPath, relativePath), 'utf8'),
  );

  return Result.isErr(result)
    ? Result.err(
        `Failed to read ${relativePath}: ${unknownToString(result.value)}`,
      )
    : Result.ok(result.value);
};

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ codecov.yml waits for a different number of uploads than a pull',
    '   request makes:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'Each `coverage: true` entry of the code-check matrix uploads once; set',
    'both `after_n_builds` in codecov.yml to that count.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkCodecovBuilds().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `codecov.yml waits for the ${result.value.uploads} uploads a pull request makes.`,
  );
}
