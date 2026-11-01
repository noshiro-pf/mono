import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `minimumReleaseAgeExclude` entry would outlive its reason.
 *
 * `pnpm-workspace.yaml`, above the list, states the rule: an entry is a waiver,
 * not a policy, so it names a version and `minimumReleaseAgeExcludePrune` drops
 * it once the lockfile stops resolving it. Two spellings defeat that, and pnpm
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
 * still has a waiver. A reason is a `# waiver: <target>` heading in the comment
 * block above `minimumReleaseAgeExcludePrune`, which is the one place anywhere
 * near the list that survives pruning — measured, and written down beside the
 * reasons themselves. A heading inside the list is a violation of its own,
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
 * The three `minimumReleaseAge*` settings, read with a line scanner rather than
 * a YAML parser — as `check-lockfile-tarballs.mts` reads the lockfile.
 * All three sit at the top level of a file whose shape is stable, and a parser
 * would be a dependency taken on for one nesting level.
 */
export const parseMinimumReleaseAgeSettings = (
  workspaceFile: string,
): MinimumReleaseAgeSettings => {
  const lines = workspaceFile.split(/\r?\n/u);

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
        (_line, index) => index < blockStartIndex || pruneIndex <= index,
      ),
    ).map((reason) => reason.target),
    malformedHeadings: Arr.generate(function* () {
      for (const line of lines) {
        const captured = REASON_HEADING.exec(line)?.groups?.['target'];

        if (captured !== undefined && headingTarget(line) === undefined) {
          yield captured.trim();
        }
      }
    }),
  };
};

/**
 * `true` when the reason heading speaks for at least one version the entry
 * lists, which is what keeps the heading from being stale.
 *
 * A trailing `/` marks a family prefix, such as `@octokit/`. A bare name speaks
 * for every version of that one package. A heading with versions speaks for
 * those versions only — `a@1.0.0 || 1.0.1` lists two — so `vite@8.2.2` covers
 * neither `vite@8.2.20` nor `vite@8.2.2-beta.1`.
 */
export const reasonCoversEntry = (target: string, entry: string): boolean => {
  const { name, versions } = splitEntry(entry);

  return versionsToExplain(versions).some((version) =>
    reasonCoversVersion(target, name, version),
  );
};

/**
 * `true` when every version the entry lists has a heading speaking for it, so a
 * reason written for `a@1.0.0` does not stand for `a@1.0.0 || 2.0.0`. That also
 * keeps a reason in force when pruning drops one version from such an entry.
 */
export const reasonsExplainEntry = (
  targets: readonly string[],
  entry: string,
): boolean => {
  const { name, versions } = splitEntry(entry);

  return versionsToExplain(versions).every((version) =>
    targets.some((target) => reasonCoversVersion(target, name, version)),
  );
};

/**
 * What is wrong with an entry, or `undefined` when it is a waiver that can
 * expire.
 */
export const classifyExcludeEntry = (
  entry: string,
): ExcludeEntryProblem | undefined =>
  entry.includes(WILDCARD)
    ? 'pattern'
    : hasVersion(entry)
      ? undefined
      : 'bare-name';

export type MinimumReleaseAgeSettings = Readonly<{
  delayMinutes: number | undefined;
  pruneEnabled: boolean;
  excludeEntries: readonly string[];
  waiverReasons: readonly WaiverReason[];
  misplacedReasonTargets: readonly string[];
  /** What follows `waiver:` on a heading line that names no target. */
  malformedHeadings: readonly string[];
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

/**
 * `# waiver: @octokit/`, at any indentation, with at most one space between `#`
 * and `waiver:` — a reason's body is indented further, so a body line that
 * happens to start with `waiver:` is not taken for a heading. The target is the
 * rest of the line, so a heading can name an entry that lists versions as
 * `a@1.0.0 || 1.0.1`; `headingTarget` checks that it is one.
 */
const REASON_HEADING = /^\s*# ?waiver:\s*(?<target>\S.*)$/u;

/** The spaces a target may hold: those around the `||` between versions. */
const VERSION_SEPARATOR = /\s*\|\|\s*/gu;

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

    ...Arr.generate(function* () {
      for (const entry of settings.excludeEntries) {
        const problem = classifyExcludeEntry(entry);

        if (problem !== undefined) {
          yield { subject: `'${entry}'`, message: REASONS[problem] };
        }
      }
    }),

    ...Arr.generate(function* () {
      const targets = settings.waiverReasons.map((reason) => reason.target);

      for (const entry of settings.excludeEntries) {
        if (!reasonsExplainEntry(targets, entry)) {
          yield { subject: `'${entry}'`, message: REASONS['no-reason'] };
        }
      }
    }),

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

    ...settings.malformedHeadings.map((text) => ({
      subject: `\`# waiver: ${text}\``,
      message: REASONS['malformed-heading'],
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
    'is a waiver nothing explains — when it lists several versions, every one',
    'needs a reason. Add a `# waiver: <target>` heading and the reason under',
    'it, in the comment block above `minimumReleaseAgeExcludePrune` — which is',
    'where a reason survives pruning. The target is the entry with or without',
    'its quotes, its package name for every version of it, or a family prefix',
    'ending in `/` such as `@octokit/`.',
  ].join(' '),

  'stale-reason': [
    'answers for no entry on the list. If pruning has retired the waiver it',
    'was written for, the reason goes with it. Otherwise the heading does not',
    'name the entry: a family prefix ends in `/`, a package name has to be the',
    'whole name, and a heading with versions has to list a version the entry',
    'lists, exactly.',
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

  'malformed-heading': [
    'is a heading that names no target, so it explains nothing. After',
    '`waiver:` comes the target alone — a package name, `name@1.0.0`,',
    '`name@1.0.0 || 1.0.1`, or a family prefix ending in `/` — and any note',
    'goes in the reason under it.',
  ].join(' '),
} as const satisfies ReadonlyRecord<ViolationReason, string>;

type ViolationReason =
  | ExcludeEntryProblem
  | 'empty-reason'
  | 'malformed-heading'
  | 'misplaced-reason'
  | 'no-reason'
  | 'stale-reason';

/**
 * The package name and the versions an entry or a heading lists.
 *
 * The separator is the `@` that is not the one opening a scope, with something
 * after it; anything else is a name with no versions. The versions are split at
 * `||`, so `@types/node@22.20.2 || 24.13.4` is one entry naming two, and the
 * spacing around `||` does not matter. An empty part, as in `a@1.0.0 ||`, names
 * no version.
 */
const splitEntry = (
  entry: string,
): Readonly<{ name: string; versions: readonly string[] }> => {
  const separatorIndex = entry.indexOf('@', entry.startsWith('@') ? 1 : 0);

  if (separatorIndex <= 0) {
    return { name: entry, versions: [] };
  }

  const versions = entry
    .slice(separatorIndex + 1)
    .split('||')
    .map((version) => version.trim())
    .filter((version) => version !== '');

  return Arr.isEmpty(versions)
    ? { name: entry, versions: [] }
    : { name: entry.slice(0, separatorIndex), versions };
};

/** `true` when the entry carries a version. */
const hasVersion = (entry: string): boolean =>
  Arr.isNonEmpty(splitEntry(entry).versions);

/**
 * The versions a reason has to speak for: those the entry lists, or the single
 * `undefined` that stands for every version when it lists none.
 */
const versionsToExplain = (
  versions: readonly string[],
): readonly (string | undefined)[] =>
  Arr.isEmpty(versions) ? ([undefined] as const) : versions;

/**
 * `true` when the heading speaks for the package `name` at `version`, or at
 * every version when `version` is `undefined` — an entry that lists none.
 */
const reasonCoversVersion = (
  target: string,
  name: string,
  version: string | undefined,
): boolean => {
  if (target.endsWith('/')) {
    return name.startsWith(target);
  }

  const heading = splitEntry(target);

  return (
    heading.name === name &&
    (Arr.isEmpty(heading.versions) ||
      (version !== undefined && heading.versions.includes(version)))
  );
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

const findDelayMinutes = (lines: readonly string[]): number | undefined => {
  const declared = lines.flatMap((line) => {
    if (!line.startsWith(DELAY_KEY)) {
      return [];
    }

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

const stripQuotes = (value: string): string =>
  value.length >= 2 &&
  ((value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"')))
    ? value.slice(1, -1)
    : value;

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

    if (!trimmed.startsWith(LIST_ITEM_PREFIX)) {
      return [];
    }

    const item = stripQuotes(trimmed.slice(LIST_ITEM_PREFIX.length).trim());

    return item === '' ? [] : [item];
  });
};

/**
 * The run of comment lines that ends on the line before `keyIndex`.
 *
 * Pruning rewrites the list below that key and nothing above it, so this is the
 * block a reason has to be in to outlive the entry it explains.
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

/** What a comment line says, or `''` for anything that is not one. */
const commentText = (line: string): string => {
  const trimmed = line.trim();

  return trimmed.startsWith('#') ? trimmed.slice(1).trim() : '';
};

/**
 * What a `# waiver:` heading names, or `undefined` for a line that names none.
 *
 * A trailing comment and the quotes YAML puts around a scoped entry are taken
 * off, so the entry can be copied from the list as written. What is left may
 * hold spaces only around `||`; a heading line with anything else after its
 * target, such as `# waiver: vite@8.2.2 (until #2218)`, names none, and
 * `malformedHeadings` reports it rather than letting it drop out of sight.
 */
const headingTarget = (line: string): string | undefined => {
  const captured = REASON_HEADING.exec(line)?.groups?.['target'];

  if (captured === undefined) {
    return undefined;
  }

  const target = stripQuotes(stripComment(captured).trim());

  return target === '' || /\s/u.test(target.replaceAll(VERSION_SEPARATOR, ''))
    ? undefined
    : target;
};

/**
 * The `# waiver:` headings among `lines`, each with whether anything is written
 * under it.
 *
 * A body is the next comment line with something on it, so the heading and its
 * reason stay one paragraph — a blank comment line ends it.
 */
const collectReasons = (lines: readonly string[]): readonly WaiverReason[] =>
  lines.flatMap((line, index) => {
    const target = headingTarget(line);

    if (target === undefined) {
      return [];
    }

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
