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
 * It also checks that each waiver still has a reason, and that each reason
 * still has a waiver. A reason is a `# waiver: <prefix>` heading in the
 * comment block above `minimumReleaseAgeExcludePrune`, which is the one place
 * anywhere near the list that survives pruning — measured, and written down
 * beside the reasons themselves. A heading inside the list is a violation of its own,
 * because that is precisely the comment pruning takes with it.
 *
 * So this reads `pnpm-workspace.yaml` alone. With patterns gone, an entry's
 * reach is exactly what it spells — one name, at the versions it lists — and
 * everything that makes the list mean anything is on the same page.
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
        reasonCount: settings.waiverReasons.length,
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

  const pruneIndex = lines.findIndex((line) => line.startsWith(PRUNE_KEY));

  const reasonBlock =
    pruneIndex === -1 ? ([] as const) : commentBlockAbove(lines, pruneIndex);

  const blockStartIndex = pruneIndex - reasonBlock.length;

  return {
    delayMinutes: findDelayMinutes(lines),
    pruneEnabled: findBooleanSetting(lines, PRUNE_KEY),
    excludeEntries:
      excludeIndex === -1
        ? []
        : collectListItems(lines.slice(excludeIndex + 1)),
    waiverReasons: collectReasons(reasonBlock),
    misplacedReasonTargets: collectReasons(
      lines.filter(
        (_line, index) => index < blockStartIndex || index >= pruneIndex,
      ),
    ).map((reason) => reason.target),
  };
};

/**
 * `true` when the reason heading speaks for the entry.
 *
 * Prefix matching, so one heading covers a family — `@octokit/` answers for
 * the eight entries that have to move together — and an exact
 * `name@version` heading still covers only itself.
 */
export const reasonCoversEntry = (target: string, entry: string): boolean =>
  entry.startsWith(target);

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
  waiverReasons: readonly WaiverReason[];
  misplacedReasonTargets: readonly string[];
}>;

export type WaiverReason = Readonly<{
  target: string;
  hasBody: boolean;
}>;

export type ExcludeEntryProblem = 'bare-name' | 'pattern';

export type Violation = Readonly<{
  subject: string | undefined;
  message: string;
}>;

type CheckSummary = Readonly<{
  delayMinutes: number;
  waiverCount: number;
  reasonCount: number;
}>;

const WORKSPACE_FILE_NAME = 'pnpm-workspace.yaml';

const DELAY_KEY = 'minimumReleaseAge:';

const PRUNE_KEY = 'minimumReleaseAgeExcludePrune:';

const EXCLUDE_KEY = 'minimumReleaseAgeExclude:';

const LIST_ITEM_PREFIX = '- ';

const WILDCARD = '*';

/** `# waiver: @octokit/`, at any indentation, and nothing else on the line. */
const REASON_HEADING = /^\s*#\s*waiver:\s*(?<target>\S+)\s*$/u;

/** Every way the list and its reasons can stop expiring, in one pass. */
export const collectViolations = (
  settings: MinimumReleaseAgeSettings,
): readonly Violation[] =>
  [
    ...(settings.delayMinutes === undefined || settings.delayMinutes === 0
      ? ([
          {
            subject: undefined,
            message: [
              `${WORKSPACE_FILE_NAME} declares no \`minimumReleaseAge\`, so every`,
              'entry below it is moot and a version published minutes ago can be',
              'installed by the next `pnpm-update` run.',
            ].join(' '),
          },
        ] as const)
      : ([] as const)),

    ...(settings.pruneEnabled
      ? ([] as const)
      : ([
          {
            subject: undefined,
            message: [
              '`minimumReleaseAgeExcludePrune` is not on, so no waiver ever',
              'expires: each one stands until somebody notices it, which is what',
              'writing the version was for.',
            ].join(' '),
          },
        ] as const)),

    ...settings.excludeEntries.flatMap((entry) => {
      const problem = classifyExcludeEntry(entry);

      return problem === undefined
        ? []
        : [{ subject: `'${entry}'`, message: REASONS[problem] }];
    }),

    ...settings.excludeEntries.flatMap((entry) =>
      settings.waiverReasons.some((reason) =>
        reasonCoversEntry(reason.target, entry),
      )
        ? []
        : [{ subject: `'${entry}'`, message: REASONS['no-reason'] }],
    ),

    ...settings.waiverReasons.flatMap((reason) => {
      const subject = `\`# waiver: ${reason.target}\``;

      if (!reason.hasBody) {
        return [{ subject, message: REASONS['empty-reason'] }];
      }

      return settings.excludeEntries.some((entry) =>
        reasonCoversEntry(reason.target, entry),
      )
        ? []
        : [{ subject, message: REASONS['stale-reason'] }];
    }),

    ...settings.misplacedReasonTargets.map((target) => ({
      subject: `\`# waiver: ${target}\``,
      message: REASONS['misplaced-reason'],
    })),
  ] as const;

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

  'no-reason': [
    'is a waiver nothing explains. Add a `# waiver: <name or prefix>` heading',
    'and the reason under it, in the comment block above',
    '`minimumReleaseAgeExcludePrune` — which is where a reason survives',
    'pruning.',
  ].join(' '),

  'stale-reason': [
    'answers for no entry on the list. Pruning has retired the waiver it was',
    'written for, so the reason goes with it.',
  ].join(' '),

  'empty-reason': [
    'has no reason under it. A heading alone says which packages, never why.',
  ].join(' '),

  'misplaced-reason': [
    'sits outside the comment block above `minimumReleaseAgeExcludePrune`.',
    'Pruning rewrites the list and takes the comments in it along, which is',
    'how #1937 dropped eight lines of reasoning while keeping every entry',
    'they explained. Move it above that key.',
  ].join(' '),
} as const satisfies ReadonlyRecord<ViolationReason, string>;

type ViolationReason =
  | ExcludeEntryProblem
  | 'empty-reason'
  | 'misplaced-reason'
  | 'no-reason'
  | 'stale-reason';

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
 * The run of comment lines that ends on the line before `keyIndex`.
 *
 * Pruning rewrites the list below that key and nothing above it, so this is
 * the block a reason has to be in to outlive the entry it explains.
 */
const commentBlockAbove = (
  lines: readonly string[],
  keyIndex: number,
): readonly string[] => {
  const before = lines.slice(0, keyIndex);

  const startIndex = before.reduce(
    (acc, line, index) => (line.startsWith('#') ? acc : index + 1),
    0,
  );

  return before.slice(startIndex);
};

/**
 * The `# waiver:` headings among `lines`, each with whether anything is
 * written under it.
 *
 * A body is the next comment line with something on it, so the heading and
 * its reason stay one paragraph — a blank comment line ends it.
 */
const collectReasons = (lines: readonly string[]): readonly WaiverReason[] =>
  lines.flatMap((line, index) => {
    const target = REASON_HEADING.exec(line)?.groups?.['target'];

    if (target === undefined) return [];

    const next = lines[index + 1];

    return [
      {
        target,
        hasBody:
          next !== undefined &&
          !REASON_HEADING.test(next) &&
          commentText(next) !== '',
      },
    ];
  });

/** What a comment line says, or `''` for anything that is not one. */
const commentText = (line: string): string => {
  const trimmed = line.trim();

  return trimmed.startsWith('#') ? trimmed.slice(1).trim() : '';
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
    `${WORKSPACE_FILE_NAME} holds ${violations.length} waiver problem(s):`,
    '',
    ...violations.map(({ subject, message }) =>
      subject === undefined ? `  ${message}` : `  ${subject} ${message}`,
    ),
    '',
    `The rules are in ${WORKSPACE_FILE_NAME}, above`,
    '`minimumReleaseAgeExcludePrune`: an entry here is a waiver, not a policy.',
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
      `and its ${result.value.waiverCount} waiver(s) all name a version and are`,
      `explained by ${result.value.reasonCount} reason(s) that pruning cannot`,
      'reach.',
    ].join(' '),
  );
}
