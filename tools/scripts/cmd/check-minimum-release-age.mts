import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import { type NonEmptyTuple } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a package this repository does not publish is exempt from
 * `minimumReleaseAge`.
 *
 * `minimumReleaseAge` is the week a release has to sit on the registry before
 * an install here will take it, and it is the only thing standing between a
 * version published by someone else and a `pnpm-update` pull request that
 * auto-merges. `minimumReleaseAgeExclude` turns that delay off, and it turns it
 * off for everything its pattern matches — so an entry added to keep two type
 * definitions in step also exempted six packages of executable JavaScript that
 * happened to share their scope.
 *
 * Two kinds of entry are therefore allowed, and nothing else:
 *
 * - **A package published from this repository.** Its releases are written and
 *   reviewed here, so the delay would be waiting on ourselves.
 * - **`@types/*`.** Declarations only: nothing in them runs, at install time or
 *   afterwards.
 *
 * What an exclusion is usually reached for is not speed but *atomicity* — a
 * family of packages that has to move together, because one of them pins a
 * version of another (#1832). `update.ignoreDeps` buys that instead, by not
 * moving any of them until someone decides to, and it buys it without giving up
 * the delay for the rest of the family's life.
 */
export const checkMinimumReleaseAge = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const workspaceFile = yield* Result.safeUnwrap(
      await readRepositoryFile(WORKSPACE_FILE_NAME),
    );

    const settings = yield* Result.safeUnwrap(
      parseMinimumReleaseAgeSettings(workspaceFile),
    );

    const lockfile = yield* Result.safeUnwrap(
      await readRepositoryFile(LOCKFILE_NAME),
    );

    const workspacePackages = await getWorkspacePackages(projectRootPath);

    const offenders = exemptedThirdPartyPackages({
      resolvedPackageNames: collectResolvedPackageNames(lockfile),
      excludePatterns: settings.excludePatterns,
      workspacePackageNames: workspacePackages.map((pkg) => pkg.name),
    });

    if (!Arr.isNonEmpty(offenders)) {
      return Result.ok({
        delayMinutes: settings.delayMinutes,
        excludeCount: settings.excludePatterns.length,
      });
    }

    return Result.err(formatOffenders(offenders, settings.excludePatterns));
  });

/**
 * The `minimumReleaseAge` settings of `pnpm-workspace.yaml`.
 *
 * Read with a line scanner rather than a YAML parser, as
 * `check-lockfile-tarballs.mts` reads the lockfile: the two keys sit at the top
 * level of a file whose shape is stable, and a parser would be a dependency
 * added for one nesting level.
 */
export const parseMinimumReleaseAgeSettings = (
  workspaceFile: string,
): Result<MinimumReleaseAgeSettings, string> => {
  const lines = workspaceFile.split('\n');

  const declaredDelays = lines.flatMap((line) => {
    if (!line.startsWith(DELAY_KEY)) return [];

    const parsed = Num.safeParseInt(
      stripComment(line.slice(DELAY_KEY.length)).trim(),
    );

    return Result.isErr(parsed) ? [] : [parsed.value];
  });

  if (!Arr.isNonEmpty(declaredDelays)) {
    return Result.err(
      [
        `${WORKSPACE_FILE_NAME} declares no \`minimumReleaseAge\`.`,
        '',
        'Without it every exclusion below is moot and a version published',
        'minutes ago can be installed by the next `pnpm-update` run. Restore',
        'the setting rather than this check.',
      ].join('\n'),
    );
  }

  const excludeIndex = lines.findIndex((line) => line.startsWith(EXCLUDE_KEY));

  return Result.ok({
    delayMinutes: declaredDelays[0],
    excludePatterns:
      excludeIndex === -1
        ? []
        : collectListItems(lines.slice(excludeIndex + 1)),
  });
};

/**
 * Every package name the lockfile resolved from the registry.
 *
 * The keys of the `packages:` and `snapshots:` mappings are `<name>@<version>`,
 * one per resolved package, and a workspace sibling reached through the
 * `workspace:` protocol is a `link:` in an importer rather than an entry here —
 * so what this returns is what an install actually downloads.
 */
export const collectResolvedPackageNames = (
  lockfile: string,
): readonly string[] =>
  Array.from(
    new Set(
      lockfile.split('\n').flatMap((line) => {
        const name = toResolvedPackageName(line);

        return name === undefined ? [] : [name];
      }),
    ),
  );

/**
 * The exempted packages that are neither published from this repository nor
 * `@types/*` — the ones an exclusion should not be covering.
 */
export const exemptedThirdPartyPackages = ({
  resolvedPackageNames,
  excludePatterns,
  workspacePackageNames,
}: Readonly<{
  resolvedPackageNames: readonly string[];
  excludePatterns: readonly string[];
  workspacePackageNames: readonly string[];
}>): readonly ExemptedPackage[] => {
  const ours = new Set(workspacePackageNames);

  return resolvedPackageNames
    .filter((name) => !ours.has(name) && !name.startsWith(TYPES_SCOPE_PREFIX))
    .flatMap((name) => {
      const pattern = excludePatterns.find((candidate) =>
        matchesPattern(candidate, name),
      );

      return pattern === undefined ? [] : [{ name, pattern }];
    })
    .toSorted((a, b) => a.name.localeCompare(b.name));
};

/**
 * `true` when pnpm would take `packageName` for `pattern`.
 *
 * pnpm escapes the pattern and replaces every `*` with `.*` before anchoring it
 * (`@pnpm/matcher`), so a wildcard is plain: it crosses the `/` of a scope, and
 * `@octokit/*` and `@octokit/**` mean the same thing.
 */
export const matchesPattern = (
  pattern: string,
  packageName: string,
): boolean => {
  const segments = pattern.split('*');

  if (!Arr.isNonEmpty(segments)) return false;

  const [head, ...rest] = segments;

  if (!Arr.isNonEmpty(rest)) return packageName === head;

  return (
    packageName.startsWith(head) &&
    matchesAfterWildcard(rest, packageName.slice(head.length))
  );
};

export type MinimumReleaseAgeSettings = Readonly<{
  delayMinutes: number;
  excludePatterns: readonly string[];
}>;

export type ExemptedPackage = Readonly<{
  name: string;
  pattern: string;
}>;

type CheckSummary = Readonly<{
  delayMinutes: number;
  excludeCount: number;
}>;

const WORKSPACE_FILE_NAME = 'pnpm-workspace.yaml';

const LOCKFILE_NAME = 'pnpm-lock.yaml';

const EXCLUDE_KEY = 'minimumReleaseAgeExclude:';

const TYPES_SCOPE_PREFIX = '@types/';

const DELAY_KEY = 'minimumReleaseAge:';

const LIST_ITEM_PREFIX = '- ';

const ENTRY_INDENT = '  ';

/**
 * The list items of the block that starts on the line after `startLines[0]`.
 *
 * The block ends at the first line that starts a key of its own, which is the
 * first non-empty line with no leading space. Comments inside it are skipped,
 * so an entry keeps its reason next to it.
 */
const collectListItems = (startLines: readonly string[]): readonly string[] => {
  const endIndex = startLines.findIndex(
    (line) => line !== '' && !line.startsWith(' '),
  );

  const block = endIndex === -1 ? startLines : startLines.slice(0, endIndex);

  return block.flatMap((line) => {
    const trimmed = stripComment(line).trim();

    if (!trimmed.startsWith(LIST_ITEM_PREFIX)) return [];

    const item = stripQuotes(trimmed.slice(LIST_ITEM_PREFIX.length).trim());

    return item === '' ? [] : [item];
  });
};

/**
 * The package name of a lockfile key such as `  '@octokit/core@7.0.8':`, or
 * `undefined` for a line that is not one.
 *
 * The resolved packages sit at one indent level, so a deeper line is a field of
 * the entry above and a shallower one starts a section. The version begins at
 * the first `@` that is not the one opening a scope; taking that rather than the
 * last keeps the peer suffix a `snapshots:` key carries out of the name.
 *
 * A version that does not start with a digit is not a release from the
 * registry — `file:` for the per-group packages the strict standard library
 * links, `link:` for a directory — and `minimumReleaseAge` has nothing to say
 * about those. The same goes for an aliased `npm:` specifier, whose real
 * package is named on the right of the alias rather than here.
 */
const toResolvedPackageName = (line: string): string | undefined => {
  if (
    !line.startsWith(ENTRY_INDENT) ||
    line.startsWith(`${ENTRY_INDENT} `) ||
    !line.endsWith(':')
  ) {
    return undefined;
  }

  const key = stripQuotes(line.slice(ENTRY_INDENT.length, -1).trim());

  const versionIndex = key.indexOf('@', key.startsWith('@') ? 1 : 0);

  if (versionIndex <= 0) return undefined;

  return isRegistryVersion(key.slice(versionIndex + 1))
    ? key.slice(0, versionIndex)
    : undefined;
};

/** A version the registry served starts with the major number. */
const isRegistryVersion = (version: string): boolean => /^\d/u.test(version);

/**
 * The text before the first `#`.
 *
 * A package name cannot contain one, so nothing this reads is lost by taking
 * every `#` for the start of a comment.
 */
const stripComment = (text: string): string => {
  const index = text.indexOf('#');

  return index === -1 ? text : text.slice(0, index);
};

const stripQuotes = (value: string): string =>
  value.length >= 2 &&
  ((value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"')))
    ? value.slice(1, -1)
    : value;

/**
 * Matches the segments that follow the first `*`.
 *
 * Each one may start anywhere in what is left, the last one has to end it. A
 * wildcard absorbs whatever a segment does not, so taking the earliest
 * occurrence of each never rules out a match a later one would have allowed.
 */
const matchesAfterWildcard = (
  segments: NonEmptyTuple<string>,
  input: string,
): boolean => {
  const [head, ...rest] = segments;

  if (!Arr.isNonEmpty(rest)) return input.endsWith(head);

  const index = input.indexOf(head);

  return (
    index !== -1 && matchesAfterWildcard(rest, input.slice(index + head.length))
  );
};

const readRepositoryFile = async (
  fileName: string,
): Promise<Result<string, string>> => {
  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(projectRootPath, fileName), 'utf8'),
  );

  return Result.isErr(result)
    ? Result.err(`Failed to read ${fileName}: ${unknownToString(result.value)}`)
    : Result.ok(result.value);
};

const formatOffenders = (
  offenders: readonly ExemptedPackage[],
  excludePatterns: readonly string[],
): string =>
  [
    `${WORKSPACE_FILE_NAME} exempts ${offenders.length} package(s) from`,
    '`minimumReleaseAge` that this repository does not publish:',
    '',
    ...offenders.map(
      ({ name, pattern }) => `  ${name}  (matched by '${pattern}')`,
    ),
    '',
    `One of the ${excludePatterns.length} patterns in \`minimumReleaseAgeExclude\``,
    'covers more than it was written for. A package named there is installed',
    'the day it is published, and `pnpm-update` auto-merges. Narrow the',
    'pattern to what this repository publishes, or hold the family with',
    '`update.ignoreDeps` instead — that keeps its versions in step without',
    'giving up the delay.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkMinimumReleaseAge().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    [
      `minimumReleaseAge is ${result.value.delayMinutes} minutes, and its`,
      `${result.value.excludeCount} exclusion(s) cover only packages published`,
      'from this repository and `@types/*`.',
    ].join(' '),
  );
}
