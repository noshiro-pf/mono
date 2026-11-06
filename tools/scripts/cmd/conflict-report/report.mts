/**
 * The pure part of `conflict-report`: which group a conflicted path belongs to,
 * what a set-aside comment says, and the counts the report prints. The replay
 * that finds the conflicts is `replay.mts`; reading GitHub is `github.mts`.
 */

import { Arr } from 'ts-data-forge';

/**
 * Where `path` counts: a generated file by itself, marked so (`generated` is
 * the `regenerate` patterns of `.github/unblock-prs.json`); a hand-written one
 * by its package (`libs/<x>`, `apps/<x>`, `languages/<l>/<x>`), else by its top
 * directory, else `(root)`.
 */
export const pathGroup = (
  path: string,
  generated: readonly RegExp[],
): string => {
  if (generated.some((pattern) => pattern.test(path))) {
    return `${path} (generated)`;
  }

  const segments = path.split('/');

  const [top, second, third] = segments;

  return top === undefined || Arr.isFixedLengthArray(1, segments)
    ? '(root)'
    : second !== undefined && (top === 'libs' || top === 'apps')
      ? `${top}/${second}`
      : second !== undefined && third !== undefined && top === 'languages'
        ? `${top}/${second}/${third}`
        : top;
};

/**
 * What a comment `unblock-prs` wrote says of its set-aside: the reason, from
 * the record line or, once resolved, from the line that replaced it, and the
 * failed checks it listed (kept under a fold once resolved).
 */
export const readSetAside = (body: string): SetAsideSeen | undefined => {
  const reason =
    STANDING.exec(body)?.groups?.['reason'] ??
    RESOLVED.exec(body)?.groups?.['reason'];

  if (reason === undefined) {
    return undefined;
  }

  const lines = body.split(/\r?\n/u);

  const start = lines.findIndex(
    (line) => line.trim() === 'Failed required checks:',
  );

  const failedChecks =
    start === -1
      ? ([] as const)
      : Arr.generate<string>(function* () {
          for (const line of lines.slice(start + 1)) {
            const item = CHECK_ITEM.exec(line.trim())?.groups;

            if (item === undefined) {
              if (line.trim() === '') {
                continue;
              }

              return;
            }

            yield item['linked'] ?? item['plain'] ?? '';
          }
        });

  return { reason, failedChecks };
};

/** The counts of {@link renderMarkdown}, from what the replay and the comments found. */
export const summarize = ({
  days,
  merged,
  events,
  setAsides,
  generated,
}: Readonly<{
  days: number;
  merged: readonly number[];
  events: readonly ConflictEvent[];
  setAsides: readonly Readonly<{ pr: number } & SetAsideSeen>[];
  generated: readonly RegExp[];
}>): ConflictReport => {
  const isGenerated = (path: string): boolean =>
    generated.some((pattern) => pattern.test(path));

  const generatedOnly = (event: ConflictEvent): boolean =>
    event.paths.every(isGenerated);

  const conflicted = Arr.uniq(events.map(({ pr }) => pr));

  return {
    days,
    merged: merged.length,
    conflicted: conflicted.length,
    events: events.length,
    generatedOnly: events.filter(generatedOnly).length,
    generatedOnlyPullRequests: conflicted.filter((pr) =>
      events.filter((event) => event.pr === pr).every(generatedOnly),
    ).length,
    sameSession: events.filter(
      ({ partners, sameSession }) => Arr.isNonEmpty(partners) && sameSession,
    ).length,
    otherSession: events.filter(
      ({ partners, sameSession }) => Arr.isNonEmpty(partners) && !sameSession,
    ).length,
    unknownSession: events.filter(({ partners }) => !Arr.isNonEmpty(partners))
      .length,
    groups: counted(
      events.flatMap(({ paths }) =>
        Arr.uniq(paths.map((path) => pathGroup(path, generated))),
      ),
    ),
    setAsideReasons: counted(setAsides.map(({ reason }) => reason)),
    failedChecks: counted(
      setAsides.flatMap(({ failedChecks }) => failedChecks),
    ),
  };
};

/** The report as Markdown, to paste into an issue as it is. */
export const renderMarkdown = (report: ConflictReport): string =>
  [
    `# Conflicts in the last ${report.days} days`,
    '',
    '| | |',
    '| :-- | --: |',
    `| Pull requests merged | ${report.merged} |`,
    `| … that met a conflict on a rebase | ${report.conflicted} |`,
    `| Rebases that conflicted | ${report.events} |`,
    `| … only in generated files | ${report.generatedOnly} |`,
    `| Pull requests whose every conflict was only in generated files | ${report.generatedOnlyPullRequests} |`,
    `| Conflicts with a pull request of the same session | ${report.sameSession} |`,
    `| … of another session | ${report.otherSession} |`,
    `| … whose other side was not found | ${report.unknownSession} |`,
    '',
    '## Where they conflicted',
    '',
    ...table('Package or file', 'Rebases', report.groups),
    '',
    '## Set-asides by reason',
    '',
    'The latest of each pull request: `unblock-prs` keeps one comment per pull request and rewrites it.',
    '',
    ...table('Reason', 'Pull requests', report.setAsideReasons),
    '',
    '## Failed checks in `checks-failed` set-asides',
    '',
    ...table('Check', 'Set-asides', report.failedChecks),
    '',
  ].join('\n');

/** One rebase that conflicted, found by the replay. */
export type ConflictEvent = Readonly<{
  pr: number;
  paths: readonly string[];
  /** The merged pull requests that changed those paths in between. */
  partners: readonly number[];
  /** Whether one of them carries the same `Claude-Session:` trailer. */
  sameSession: boolean;
}>;

export type SetAsideSeen = Readonly<{
  reason: string;
  failedChecks: readonly string[];
}>;

export type ConflictReport = Readonly<{
  days: number;
  merged: number;
  conflicted: number;
  events: number;
  generatedOnly: number;
  generatedOnlyPullRequests: number;
  sameSession: number;
  otherSession: number;
  unknownSession: number;
  groups: readonly (readonly [string, number])[];
  setAsideReasons: readonly (readonly [string, number])[];
  failedChecks: readonly (readonly [string, number])[];
}>;

const STANDING = /^<!-- unblock-prs:set-aside reason=(?<reason>[\w-]+) /mu;

const RESOLVED = /no longer set aside \(`(?<reason>[\w-]+)` at /u;

const CHECK_ITEM = /^- (?:\[(?<linked>[^\]]+)\]\([^)]*\)|(?<plain>(?!\[).+))$/u;

/** Each value with how often it occurs, the commonest first, then by name. */
const counted = (
  values: readonly string[],
): readonly (readonly [string, number])[] => {
  const mut_counts = new Map<string, number>();

  for (const value of values) {
    mut_counts.set(value, (mut_counts.get(value) ?? 0) + 1);
  }

  return Array.from(mut_counts).toSorted(([a, an], [b, bn]) =>
    an === bn ? a.localeCompare(b) : bn - an,
  );
};

const table = (
  key: string,
  value: string,
  rows: readonly (readonly [string, number])[],
): readonly string[] =>
  Arr.isNonEmpty(rows)
    ? ([
        `| ${key} | ${value} |`,
        '| :-- | --: |',
        ...rows.map(([name, count]) => `| \`${name}\` | ${count} |`),
      ] as const)
    : (['None.'] as const);
