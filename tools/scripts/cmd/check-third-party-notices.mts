import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import { listTrackedFiles } from '../lib/repo-files.mjs';
import { pathFromRoot, projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when code a workspace member took from elsewhere does not carry that
 * code's license notice (#4048).
 *
 * A source under a member's `src/` that says it was forked or copied from a
 * URL names, in its comments, the notice the package ships for it:
 * `third-party/<name>/LICENSE.txt` in the package, the upstream's license text
 * copied verbatim. MIT and Apache-2.0 both make passing that text on the
 * condition of a copy, and the package's own `LICENSE` is not it. So:
 *
 * - such a source names a notice, and the package has it;
 * - a package with notices lists `third-party` in its `files`, so that npm
 *   ships them;
 * - every notice is named by a source of its package, so that one whose code
 *   is gone is removed with it.
 *
 * `.txt`, not `LICENSE`: `gen:license-files` holds a tracked `LICENSE` to the
 * package's own `license` field. `experimental/` is outside.
 */
export const checkThirdPartyNotices = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(tracked.value);
  }

  const workspace = await getWorkspacePackages(projectRootPath);

  const packages = workspace
    .map((pkg) => ({
      dir: pathFromRoot(pkg.path),
      files: filesOf(pkg.packageJson),
    }))
    .filter(({ dir }) => !dir.startsWith('experimental/'));

  const sourcePaths = tracked.value.filter(
    (file) =>
      SOURCE.test(file) &&
      packages.some(({ dir }) => file.startsWith(`${dir}/src/`)),
  );

  const sources = new Map<string, string>(
    await Promise.all(
      sourcePaths.map(
        async (file) =>
          [
            file,
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- a tracked source of a workspace member
            await fs.readFile(path.join(projectRootPath, file), 'utf8'),
          ] as const,
      ),
    ),
  );

  const problems = findNoticeProblems({
    packages,
    sources,
    tracked: tracked.value,
  });

  return Arr.isNonEmpty(problems)
    ? Result.err(
        [
          `❌ ${problems.length} problem(s) with the license notices of code taken from elsewhere:`,
          '',
          ...problems.map((problem) => `  ${problem}`),
          '',
          'Copy the upstream license verbatim to <package>/third-party/<name>/LICENSE.txt,',
          'name that path in a comment of the source that says where it came from,',
          'and list "third-party" in the package\'s "files" (tools/scripts/cmd/check-third-party-notices.mts).',
        ].join('\n'),
      )
    : Result.ok(sources.size);
};

/**
 * What is wrong with the notices of `packages`, given their tracked `sources`
 * by path and every `tracked` file: each problem as one line.
 */
export const findNoticeProblems = ({
  packages,
  sources,
  tracked,
}: Readonly<{
  /** Each member's directory and its manifest's `files` (none: all). */
  packages: readonly Readonly<{
    dir: string;
    files: readonly string[] | undefined;
  }>[];
  sources: ReadonlyMap<string, string>;
  tracked: readonly string[];
}>): readonly string[] => {
  const byDepth = packages.toSorted((a, b) => b.dir.length - a.dir.length);

  const packageOf = (file: string): string | undefined =>
    byDepth.find(({ dir }) => file.startsWith(`${dir}/`))?.dir;

  const trackedSet = new Set<string>(tracked);

  const mut_named = new Set<string>();

  const sourceProblems = Array.from(sources).flatMap(([file, text]) => {
    const dir = packageOf(file);

    if (dir === undefined) {
      return [];
    }

    const named = Array.from(text.matchAll(NOTICE_NAMED), ([match]) => match);

    for (const notice of named) {
      mut_named.add(`${dir}/${notice}`);
    }

    return [
      ...(CLAIM.test(text) && !Arr.isNonEmpty(named)
        ? [
            `${file} says it was forked or copied from elsewhere and names no third-party/<name>/LICENSE.txt`,
          ]
        : []),
      ...named
        .filter((notice) => !trackedSet.has(`${dir}/${notice}`))
        .map((notice) => `${file} names ${notice}, which ${dir} does not have`),
    ];
  });

  const notices = tracked.filter(
    (file) => NOTICE_FILE.test(file) && packageOf(file) !== undefined,
  );

  const unshipped = packages
    .filter(
      ({ dir, files }) =>
        files !== undefined &&
        files.every((entry) => !THIRD_PARTY_ENTRY.test(entry)) &&
        notices.some((file) => file.startsWith(`${dir}/third-party/`)),
    )
    .map(
      ({ dir }) =>
        `${dir} has third-party notices, and the "files" of its package.json do not list third-party`,
    );

  const stale = notices
    .filter((file) => !mut_named.has(file))
    .map(
      (file) =>
        `${file} is named by no source of ${packageOf(file) ?? 'its package'}`,
    );

  return [...sourceProblems, ...unshipped, ...stale];
};

/** A comment saying the code came from a URL. */
const CLAIM = /\b(?:forked|copied)\s+from\s+<?https?:\/\//iu;

/** A notice a source names: `third-party/<name or @scope/name>/LICENSE.txt`. */
const NOTICE_NAMED = /third-party\/[\w@./-]+?\/LICENSE\.txt/gu;

/** A tracked notice in a package. */
const NOTICE_FILE = /\/third-party\/[\w@./-]+\/LICENSE\.txt$/u;

/** A `files` entry that ships the notices. */
const THIRD_PARTY_ENTRY = /^(?:\.\/)?third-party(?:\/|$)/u;

/** A module a package's sources are written in, tests aside. */
const SOURCE = /^(?!.*\.test\.)[^]*\.(?:[cm]?[jt]s|tsx|jsx)$/u;

const filesOf = (manifest: unknown): readonly string[] | undefined => {
  const files = isRecord(manifest) ? manifest['files'] : undefined;

  return Arr.isArray(files) ? files.filter(isString) : undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkThirdPartyNotices().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} member source(s) read; every one taken from elsewhere names a notice its package ships.`,
  );
}
