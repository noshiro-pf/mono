import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `minimumReleaseAgeExclude` entry would outlive its reason.
 *
 * CLAUDE.md ("Dependencies") states the rule: an entry is a waiver, not a
 * policy, so it names a version and `minimumReleaseAgeExcludePrune` drops it
 * once the lockfile stops resolving it. Two spellings defeat that, and pnpm
 * takes both without a word:
 *
 * - **A bare name exempts every version, for good.** Measured on pnpm 12.3.4:
 *   with `- vite` on the list, `pnpm update --latest` took a release published
 *   three days earlier, where the same run without it stopped at the newest
 *   version older than the hold. A pinned `- 'vite@8.2.2'` also stopped there —
 *   a waiver lets through what it names and nothing else.
 * - **A pattern is never pruned.** Pruning keeps every entry containing `*` by
 *   design, so one stands after the last package it matched is gone.
 *
 * A range needs no rule here: pnpm rejects `vite@^8.0.0` outright with
 * `ERR_PNPM_INVALID_MINIMUM_RELEASE_AGE_EXCLUDE`, which is a failed install
 * rather than a silent exemption.
 *
 * So this reads `pnpm-workspace.yaml` alone. With patterns gone, an entry's
 * reach is exactly what it spells — one name, at the versions it lists — and
 * the two settings that make the list mean anything are on the same page.
 */
export const checkMinimumReleaseAge = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const workspaceFile = yield* Result.safeUnwrap(await readWorkspaceFile());

    const settings = parseMinimumReleaseAgeSettings(workspaceFile);

    const violations = collectViolations(settings);

    if (!Arr.isNonEmpty(violations)) {
      return Result.ok({
        delayMinutes: settings.delayMinutes ?? 0,
        waiverCount: settings.excludeEntries.length,
      });
    }

    return Result.err(formatViolations(violations));
  });

/**
 * The three `minimumReleaseAge*` settings, read with a line scanner rather
 * than a YAML parser — as `check-lockfile-tarballs.mts` reads the lockfile.
 * All three sit at the top level of a file whose shape is stable, and a parser
 * would be a dependency taken on for one nesting level.
 */
export const parseMinimumReleaseAgeSettings = (
  workspaceFile: string,
): MinimumReleaseAgeSettings => {
  const lines = workspaceFile.split('\n');

  const excludeIndex = lines.findIndex((line) => line.startsWith(EXCLUDE_KEY));

  return {
    delayMinutes: findDelayMinutes(lines),
    pruneEnabled: findBooleanSetting(lines, PRUNE_KEY),
    excludeEntries:
      excludeIndex === -1
        ? []
        : collectListItems(lines.slice(excludeIndex + 1)),
  };
};

/**
 * What is wrong with an entry, or `undefined` when it is a waiver that can
 * expire.
 */
export const classifyExcludeEntry = (
  entry: string,
): ExcludeEntryProblem | undefined => {
  if (entry.includes(WILDCARD)) return 'pattern';

  return hasVersion(entry) ? undefined : 'bare-name';
};

export type MinimumReleaseAgeSettings = Readonly<{
  delayMinutes: number | undefined;
  pruneEnabled: boolean;
  excludeEntries: readonly string[];
}>;

export type ExcludeEntryProblem = 'bare-name' | 'pattern';

type Violation = Readonly<{
  entry: string | undefined;
  message: string;
}>;

type CheckSummary = Readonly<{
  delayMinutes: number;
  waiverCount: number;
}>;

const WORKSPACE_FILE_NAME = 'pnpm-workspace.yaml';

const DELAY_KEY = 'minimumReleaseAge:';

const PRUNE_KEY = 'minimumReleaseAgeExcludePrune:';

const EXCLUDE_KEY = 'minimumReleaseAgeExclude:';

const LIST_ITEM_PREFIX = '- ';

const WILDCARD = '*';

const collectViolations = (
  settings: MinimumReleaseAgeSettings,
): readonly Violation[] => [
  ...(settings.delayMinutes === undefined || settings.delayMinutes === 0
    ? [
        {
          entry: undefined,
          message: [
            `${WORKSPACE_FILE_NAME} declares no \`minimumReleaseAge\`, so every`,
            'entry below it is moot and a version published minutes ago can be',
            'installed by the next `pnpm-update` run.',
          ].join(' '),
        },
      ]
    : []),

  ...(settings.pruneEnabled
    ? []
    : [
        {
          entry: undefined,
          message: [
            '`minimumReleaseAgeExcludePrune` is not on, so no waiver ever',
            'expires: each one stands until somebody notices it, which is what',
            'writing the version was for.',
          ].join(' '),
        },
      ]),

  ...settings.excludeEntries.flatMap((entry) => {
    const problem = classifyExcludeEntry(entry);

    return problem === undefined ? [] : [{ entry, message: REASONS[problem] }];
  }),
];

const REASONS = {
  'bare-name': [
    'names no version, so it exempts the package at every version, for good —',
    'and pruning cannot expire it, because the name keeps resolving. Add the',
    'version that needs the waiver.',
  ].join(' '),

  pattern: [
    'is a pattern, and pruning keeps every entry containing `*` by design, so',
    'it stands after the last package it matched is gone. Name the packages and',
    'their versions instead.',
  ].join(' '),
} as const satisfies ReadonlyRecord<ExcludeEntryProblem, string>;

/**
 * `true` when the entry carries a version — the `@` that is not the one
 * opening a scope, with something after it. `@types/node@22.20.2 || 24.13.4`
 * is one entry naming two versions, and that `@` is the separator.
 */
const hasVersion = (entry: string): boolean => {
  const separatorIndex = entry.indexOf('@', entry.startsWith('@') ? 1 : 0);

  return separatorIndex > 0 && separatorIndex < entry.length - 1;
};

const findDelayMinutes = (lines: readonly string[]): number | undefined => {
  const declared = lines.flatMap((line) => {
    if (!line.startsWith(DELAY_KEY)) return [];

    const parsed = Num.safeParseInt(
      stripComment(line.slice(DELAY_KEY.length)).trim(),
    );

    return Result.isErr(parsed) ? [] : [parsed.value];
  });

  return Arr.isNonEmpty(declared) ? declared[0] : undefined;
};

const findBooleanSetting = (lines: readonly string[], key: string): boolean =>
  lines.some(
    (line) =>
      line.startsWith(key) &&
      stripComment(line.slice(key.length)).trim() === 'true',
  );

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
 * The text before the first `#`.
 *
 * Neither a package name nor a version can contain one, so nothing this reads
 * is lost by taking every `#` for the start of a comment.
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

const readWorkspaceFile = async (): Promise<Result<string, string>> => {
  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(projectRootPath, WORKSPACE_FILE_NAME), 'utf8'),
  );

  return Result.isErr(result)
    ? Result.err(
        `Failed to read ${WORKSPACE_FILE_NAME}: ${unknownToString(result.value)}`,
      )
    : Result.ok(result.value);
};

const formatViolations = (violations: readonly Violation[]): string =>
  [
    `${WORKSPACE_FILE_NAME} holds ${violations.length} exemption(s) that cannot expire:`,
    '',
    ...violations.map(({ entry, message }) =>
      entry === undefined ? `  ${message}` : `  '${entry}' ${message}`,
    ),
    '',
    'See CLAUDE.md, "Dependencies": an entry here is a waiver, not a policy.',
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
      `minimumReleaseAge is ${result.value.delayMinutes} minutes, pruning is on,`,
      `and its ${result.value.waiverCount} waiver(s) all name a version.`,
    ].join(' '),
  );
}
