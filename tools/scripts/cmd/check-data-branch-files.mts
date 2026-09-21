import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  REPORT_BRANCH,
  REPORT_MARKDOWN_PATH,
  REPORT_PATH,
  RUN_LOG_BRANCH,
  RUN_LOG_PATH,
} from 'pr-report-payload';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a file that belongs on a `data/*` branch appears in the
 * repository itself.
 *
 * The two data branches are orphans holding one report each, and nothing is
 * supposed to bring them back here. The way that would happen is a pull
 * request from `data/pr-report` into `main` — GitHub offers to open one every
 * time the workflow pushes, in the banner at the top of the repository — and
 * nothing else would notice: the merge adds two files at the root, and every
 * check in this repository would pass over them without a word.
 *
 * `repo-settings/rulesets/restrict-deletion.json` covers the other half, the
 * branches being deleted. This covers the direction a ruleset cannot express,
 * which is a branch arriving rather than leaving.
 *
 * The names come from `apps/pr-report-payload/src/location.mts`, the same
 * declaration the writers and the page use, so renaming a file moves this
 * guard with it.
 */
export const checkDataBranchFiles = (
  exists: Exists = existsInRepository,
): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const found = yield* Result.safeUnwrap(await strays(exists));

    return Arr.isNonEmpty(found)
      ? Result.err(
          [
            `❌ ${found.length} file(s) that belong on a data branch are in the repository:`,
            '',
            ...found.map((file) => `  ${file}`),
            '',
            `These are written to \`${REPORT_BRANCH}\` and \`${RUN_LOG_BRANCH}\`, which are`,
            'orphan branches holding one report each. Finding one here means a data',
            'branch was merged into this one — the pull request GitHub offers in its',
            'banner after every push to them is the way that happens.',
            '',
            'Delete them; nothing in this repository reads them from here.',
          ].join('\n'),
        )
      : Result.ok({ checked: DATA_BRANCH_FILES.length });
  });

/**
 * Whether a path relative to the repository root is there. Taken as an
 * argument so that a test can say what it found instead of putting files in
 * the repository to be found.
 */
export type Exists = (relativePath: string) => Promise<boolean>;

/** Everything the two data branches carry, by the names they carry it under. */
export const DATA_BRANCH_FILES: readonly string[] = [
  REPORT_PATH,
  REPORT_MARKDOWN_PATH,
  RUN_LOG_PATH,
] as const;

export type CheckSummary = Readonly<{ checked: number }>;

/**
 * The root only. That is where a merge would put them, and it is where a
 * name as ordinary as `pr-report.md` would otherwise be a plausible file for
 * somebody to write on purpose.
 */
const existsInRepository: Exists = async (relativePath) =>
  // The path is one of `DATA_BRANCH_FILES`, which this module declares, so
  // there is nothing here that came from outside it.
  fs
    .access(path.join(projectRootPath, relativePath))
    .then(() => true)
    .catch(() => false);

const strays = async (
  exists: Exists,
): Promise<Result<readonly string[], string>> => {
  const checked = await Promise.all(
    DATA_BRANCH_FILES.map(async (file) => ({
      file,
      present: await exists(file),
    })),
  );

  return Result.ok(
    checked.flatMap(({ file, present }) => (present ? [file] : [])),
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDataBranchFiles().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `No data branch file is in the repository (${result.value.checked} checked).`,
  );
}
