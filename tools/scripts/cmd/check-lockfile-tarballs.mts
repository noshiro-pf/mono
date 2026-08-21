import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when `pnpm-lock.yaml` resolves a package from a URL outside the strict
 * standard library's releases.
 *
 * pnpm blocks URL dependencies in subdependencies by itself
 * (`ERR_PNPM_EXOTIC_SUBDEP`), but the strict standard library is delivered that
 * way: one `strict-ts-lib-v7.0` tarball whose own 107 `@typescript/lib-*`
 * dependencies are release URLs. Allowing it means `blockExoticSubdeps: false`
 * in `pnpm-workspace.yaml`, and that setting is repository-wide — pnpm takes a
 * boolean, not an allow list. `pnpm-update` opens auto-merged pull requests, so
 * without something in its place a URL dependency could arrive without review.
 *
 * This is that something, and it is stricter than what it replaces in two ways:
 * it covers direct dependencies as well as subdependencies, and it reads the
 * lockfile rather than the resolution pass, which pnpm skips whenever a
 * resolution is already recorded there.
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

  const tarballs = collectTarballs(lockfile.value);

  const offenders = tarballs.filter(
    ({ url }) => !url.startsWith(ALLOWED_TARBALL_PREFIX),
  );

  if (!Arr.isNonEmpty(offenders)) {
    return Result.ok(tarballs.length);
  }

  return Result.err(
    [
      `${LOCKFILE_NAME} resolves ${offenders.length} package(s) from a URL outside`,
      `${ALLOWED_TARBALL_PREFIX}:`,
      '',
      ...offenders.map(
        ({ lineNumber, url }) => `  ${LOCKFILE_NAME}:${lineNumber}  ${url}`,
      ),
      '',
      'A URL dependency skips the registry, the version range and',
      "`minimumReleaseAge`. If the addition is deliberate, widen this check's",
      'allow list in the same pull request; otherwise install the package from',
      'the registry instead.',
    ].join('\n'),
  );
};

type Tarball = Readonly<{
  lineNumber: number;
  url: string;
}>;

const LOCKFILE_NAME = 'pnpm-lock.yaml';

/**
 * The strict standard library is published as GitHub Release assets rather than
 * to npm, which rate-limits bulk publishing of new package names. See
 * `docs/strict-typescript-lib-integration.md`.
 */
const ALLOWED_TARBALL_PREFIX =
  'https://github.com/noshiro-pf/strict-typescript-lib/releases/download/';

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

  console.info(
    result.value === 0
      ? `${LOCKFILE_NAME} resolves every package from the registry.`
      : `${LOCKFILE_NAME} resolves ${result.value} package(s) from a URL, all from the strict standard library's releases.`,
  );
}
