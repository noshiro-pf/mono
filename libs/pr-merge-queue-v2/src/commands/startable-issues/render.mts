/** The listing `startable-issues` prints. */

import {
  HELD_LABELS,
  issuesByTheme,
  themeMatches,
  type HeldThemes,
  type IssueSurvey,
  type StartableIssue,
  type ThemeOrder,
} from 'pr-report-core-v2';
import { Arr } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';

/**
 * A line per issue to take, in order, up to `limit`, then a line for each kind
 * of startable issue passed over. With a `theme` named, a first line naming the
 * issues another session started in it, left to that session, and, when it has
 * none to take, the themes there are.
 */
export const renderStartable = ({
  survey,
  order,
  held,
  authors,
  limit,
  theme,
  cutShort,
  unsure,
}: Readonly<{
  survey: IssueSurvey;
  order: ThemeOrder<StartableIssue>;
  held: HeldThemes;
  authors: readonly string[];
  limit: number | undefined;
  theme: string | undefined;
  /** How many open issues were read, when that was not all of them. */
  cutShort: number | undefined;
  /** Listed, though part of each was unread: a claim may be missed. */
  unsure: readonly number[];
}>): string => {
  const shown = limit === undefined ? order.taken : order.taken.slice(0, limit);

  const more = order.taken.length - shown.length;

  const heldInTheme =
    theme === undefined
      ? ([] as const)
      : Array.from(held.held).filter(([each]) => themeMatches([each], theme));

  return [
    ...(Arr.isNonEmpty(heldInTheme)
      ? [
          `Another session is on theme ${theme} (${describeHeld(heldInTheme)}): those are left to it${
            Arr.isNonEmpty(order.taken)
              ? '; the rest of the theme follows, to take without asking'
              : ''
          }.`,
        ]
      : []),
    ...shown.map(lineOf),
    ...(more > 0 ? [`… and ${more} more, which --limit left out.`] : []),
    ...(Arr.isNonEmpty(order.taken)
      ? []
      : theme === undefined
        ? Arr.isNonEmpty(order.heldBack)
          ? []
          : ['No issue to start.']
        : [
            `No startable issue in theme ${theme}. The themes with startable issues: ${describeThemes(survey.fresh)}.`,
          ]),
    ...(Arr.isNonEmpty(order.heldBack)
      ? [
          `${issueNumbers(order.heldBack.map(({ number }) => number))}: startable, but another session is on its theme (${describeHeld(
            Array.from(held.held).filter(([each]) =>
              order.heldBack.some(({ themes }) => themes.includes(each)),
            ),
          )}); left to that session, unless named with --theme.`,
        ]
      : []),
    ...(Arr.isNonEmpty(held.unread)
      ? [
          `${issueNumbers(held.unread)}: who started them could not be read; counted as another session's.`,
        ]
      : []),
    ...(Arr.isNonEmpty(unsure)
      ? [
          `${issueNumbers(unsure)}: listed, though part of each could not be read; start-issue refuses one claimed meanwhile.`,
        ]
      : []),
    ...(cutShort === undefined
      ? []
      : [
          `Only the ${cutShort} most recently updated open issues were read; older ones are not listed.`,
        ]),
    ...passedOverNotes(survey, authors, []),
  ].join('\n');
};

/** `#1, #2`. */
export const issueNumbers = (numbers: readonly number[]): string =>
  numbers.map((number) => `#${number}`).join(', ');

/** How many themes a theme named with no issue lists. */
const THEMES_LISTED = 20;

/**
 * A line for each kind of startable issue the survey passed over.
 * `stoppedAtCap` is the part of `left` that a `run-issue-resolver` session's
 * cap stopped during its run, which a later run tries again, said apart.
 */
export const passedOverNotes = (
  survey: StrictPick<IssueSurvey, 'foreign' | 'held' | 'left'>,
  authors: readonly string[],
  stoppedAtCap: readonly number[],
): readonly string[] => {
  const left = survey.left.filter((number) => !stoppedAtCap.includes(number));

  return [
    ...(Arr.isNonEmpty(left)
      ? ([
          `${issueNumbers(left)}: an earlier run-issue-resolver session left them as they stand; waiting for someone to change them.`,
        ] as const)
      : ([] as const)),
    ...(Arr.isNonEmpty(stoppedAtCap)
      ? ([
          `${issueNumbers(stoppedAtCap)}: a session stopped at its cap; a later run, capping one higher, tries again.`,
        ] as const)
      : ([] as const)),
    ...(Arr.isNonEmpty(survey.foreign)
      ? ([
          `${issueNumbers(survey.foreign)}: startable, but not written by ${authors.join(' or ')}; left to a person.`,
        ] as const)
      : ([] as const)),
    ...(Arr.isNonEmpty(survey.held)
      ? ([
          `${issueNumbers(survey.held)}: startable, but labelled ${HELD_LABELS.join(', ')}; left as they are.`,
        ] as const)
      : ([] as const)),
  ] as const;
};

/** `#12  [priority:A]  {ci, tooling}  title  url`. */
const lineOf = (issue: StartableIssue): string =>
  [
    `#${issue.number}`,
    ...(issue.issueTier === 'none' || issue.issueTier === 'several'
      ? []
      : [`[priority:${issue.issueTier}]`]),
    ...(Arr.isNonEmpty(issue.themes) ? [`{${issue.themes.join(', ')}}`] : []),
    issue.title,
    issue.url,
  ].join('  ');

/** `ci: #90, #91; tooling: #92`. */
const describeHeld = (
  held: readonly (readonly [string, readonly number[]])[],
): string =>
  held
    .map(([theme, numbers]) => `${theme}: ${issueNumbers(numbers)}`)
    .join('; ');

/** `ci (3), tooling (2)`: the themes of `issues`, the commonest first. */
const describeThemes = (issues: readonly StartableIssue[]): string =>
  Array.from(issuesByTheme(issues))
    .toSorted(([a, an], [b, bn]) =>
      an.length === bn.length ? a.localeCompare(b) : bn.length - an.length,
    )
    .slice(0, THEMES_LISTED)
    .map(([theme, numbers]) => `${theme} (${numbers.length})`)
    .join(', ');
