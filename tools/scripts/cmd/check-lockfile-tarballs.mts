import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when `pnpm-lock.yaml` resolves any package from anywhere but the
 * registry or this repository.
 *
 * pnpm blocks URL dependencies in subdependencies by itself
 * (`ERR_PNPM_EXOTIC_SUBDEP`, on by default), but a **direct** URL or git
 * dependency is always allowed — and `pnpm-update` opens auto-merged pull
 * requests, so without something in its place one could arrive without review.
 *
 * It reads every `resolution:` and allows the two shapes the lockfile holds:
 * `{integrity: …}` (the registry) and `{directory: …, type: directory}` for a
 * relative directory inside the repository (the strict-lib bundles' per-group
 * packages). Anything else is reported: a `tarball`, a git `commit` / `repo`, a
 * directory that is absolute or leaves the repository, and a `resolution:` not
 * written on one line, which would mean pnpm's layout changed and this should
 * be taught it rather than pass. Looking for the fields of the shapes that are
 * not allowed instead let a git dependency, which has no `tarball`, through.
 *
 * The strict standard library used to be the exception here: ~107
 * `@typescript/lib-*` release URLs, which forced `blockExoticSubdeps: false`
 * repository-wide and left this check to allow that one host. It ships as a
 * single package on the registry now, so the exception is gone.
 */
export const checkLockfileTarballs = async (): Promise<
  Result<number, string>
> => {
  const lockfilePath = path.resolve(projectRootPath, LOCKFILE_NAME);

  const lockfile = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(lockfilePath, 'utf8'),
  );

  if (Result.isErr(lockfile)) {
    return Result.err(
      `Failed to read ${LOCKFILE_NAME}: ${unknownToString(lockfile.value)}`,
    );
  }

  const judged = judgeLockfile(lockfile.value);

  return judged.ok ? Result.ok(judged.count) : Result.err(judged.message);
};

/**
 * The lockfile's verdict: the number of resolutions read, or what is wrong. No
 * `resolution:` line at all is an error, since it means the reader read
 * nothing.
 */
export const judgeLockfile = (
  lockfile: string,
): Readonly<{ ok: true; count: number } | { ok: false; message: string }> => {
  const count = lockfile
    .split('\n')
    .filter((line) => RESOLUTION_PATTERN.test(line)).length;

  if (count === 0) {
    return {
      ok: false,
      message: `${LOCKFILE_NAME} has no \`resolution:\` line, so nothing was read. Teach this check the lockfile's new layout.`,
    };
  }

  const offenders = findUnregisteredResolutions(lockfile);

  if (!Arr.isNonEmpty(offenders)) {
    return { ok: true, count };
  }

  return {
    ok: false,
    message: [
      `${LOCKFILE_NAME} resolves ${offenders.length} package(s) from neither the registry nor this repository:`,
      '',
      ...offenders.map(
        ({ lineNumber, resolution }) =>
          `  ${LOCKFILE_NAME}:${lineNumber}  ${resolution}`,
      ),
      '',
      'A URL, git or outside-directory dependency skips the registry, the',
      'version range and `minimumReleaseAge`. Install the package from the',
      'registry instead; if it is genuinely the only channel, add the exception',
      'to this check in the same pull request. A resolution not on one line',
      'means the lockfile layout changed: teach this check the new one.',
    ].join('\n'),
  };
};

/**
 * Every `resolution:` that is not the registry's `{integrity: …}` or a relative
 * directory inside the repository, with the line it sits on.
 */
export const findUnregisteredResolutions = (
  lockfile: string,
): readonly Resolution[] =>
  lockfile.split('\n').flatMap((line, index) => {
    const value = RESOLUTION_PATTERN.exec(line)?.groups?.['value'];

    if (value === undefined || REGISTRY_PATTERN.test(value)) {
      return [];
    }

    const directory = DIRECTORY_PATTERN.exec(value)?.groups?.['directory'];

    return directory !== undefined &&
      !directory.startsWith('/') &&
      !directory.split('/').includes('..')
      ? []
      : [{ lineNumber: index + 1, resolution: value }];
  });

type Resolution = Readonly<{
  lineNumber: number;
  resolution: string;
}>;

const LOCKFILE_NAME = 'pnpm-lock.yaml';

const RESOLUTION_PATTERN = /^\s+resolution:\s*(?<value>.*)$/u;

const REGISTRY_PATTERN = /^\{integrity: [^\s,}]+\}$/u;

const DIRECTORY_PATTERN =
  /^\{directory: (?<directory>[^\s,}]+), type: directory\}$/u;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkLockfileTarballs();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${LOCKFILE_NAME}: all ${result.value} resolution(s) are the registry or a directory inside the repository.`,
  );
}
