import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when `pnpm-lock.yaml` resolves any package from a URL.
 *
 * pnpm blocks URL dependencies in subdependencies by itself
 * (`ERR_PNPM_EXOTIC_SUBDEP`, on by default), but a **direct** URL dependency is
 * always allowed — and `pnpm-update` opens auto-merged pull requests, so
 * without something in its place one could arrive without review.
 *
 * The strict standard library used to be the exception here: ~107
 * `@typescript/lib-*` release URLs, which forced `blockExoticSubdeps: false`
 * repository-wide and left this check to allow that one host. It ships as a
 * single package on the registry now, so the exception is gone and the rule is
 * the simple one: nothing is installed from a URL.
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

  const offenders = collectTarballs(lockfile.value);

  if (!Arr.isNonEmpty(offenders)) {
    return Result.ok(0);
  }

  return Result.err(
    [
      `${LOCKFILE_NAME} resolves ${offenders.length} package(s) from a URL:`,
      '',
      ...offenders.map(
        ({ lineNumber, url }) => `  ${LOCKFILE_NAME}:${lineNumber}  ${url}`,
      ),
      '',
      'A URL dependency skips the registry, the version range and',
      '`minimumReleaseAge`. Install the package from the registry instead; if',
      'a URL is genuinely the only channel, add the exception to this check in',
      'the same pull request.',
    ].join('\n'),
  );
};

type Tarball = Readonly<{
  lineNumber: number;
  url: string;
}>;

const LOCKFILE_NAME = 'pnpm-lock.yaml';

/**
 * Every URL-resolved package in the lockfile, with the line it sits on.
 *
 * pnpm writes the URL as the `tarball` field of a `resolution` mapping, and
 * only for packages it did not resolve from the registry, so matching the field
 * name is enough to find them all.
 */
const collectTarballs = (lockfile: string): readonly Tarball[] =>
  lockfile.split('\n').flatMap((line, index) => {
    const matched = TARBALL_FIELD_PATTERN.exec(line);

    return matched?.[1] === undefined
      ? []
      : [{ lineNumber: index + 1, url: matched[1] }];
  });

const TARBALL_FIELD_PATTERN = /\btarball:\s*([^\s,}]+)/u;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkLockfileTarballs();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(`${LOCKFILE_NAME} resolves every package from the registry.`);
}
