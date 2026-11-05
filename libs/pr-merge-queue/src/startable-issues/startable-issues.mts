import { issuePriorityOfLabels, type ReportIssue } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  parseCommandArgs,
  positiveInteger,
  resolveApiContext,
  restAllPages,
  tokenFromEnv,
  viewerLogin,
  type ApiContext,
} from '../lib/index.mjs';
import { readReport } from '../pr-report/index.mjs';
import {
  attemptedFile,
  issueNumbers,
  ISSUES_LIMIT,
  loadAttempted,
  parseAuthors,
  passedOverNotes,
  surveyIssues,
  type IssueCandidate,
  type IssueSurvey,
} from '../run-issue-resolver/index.mjs';
import { readIssueClaimant } from '../start-issue/index.mjs';
import { WORKTREE_ROOT } from '../unblock-prs/index.mjs';
import {
  issueThemes,
  orderByTheme,
  primaryThemes,
  themeMatches,
  type ThemedIssue,
  type ThemeOrder,
} from './themes.mjs';

/** What `startable-issues --help` prints. */
export const STARTABLE_ISSUES_HELP = [
  'Usage: startable-issues [--limit <n>] [--author <login>]... [--theme <name>] [--by <claimant>]',
  '',
  'Lists the open issues nobody has started, in the order to take them, and',
  'writes nothing. Which are startable is decided as run-issue-resolver decides',
  'it; the order groups them by theme, the scope a title starts with and the',
  'packages its body names by path, shown in braces on each line.',
  '',
  'With no --theme: every priority:S first, then the highest-tier issue left',
  'and the rest of its theme whatever their tier (D only after a D), then the',
  'next. An issue below priority:S mainly about a theme another session is on',
  'is left out, and named at the end. With --theme: that theme alone (synstate',
  'takes synstate-dom too), its own priority:S first.',
  '',
  'Options:',
  '  --limit <n>       list the first n (default: all of them)',
  '  --author <login>  list only issues this account wrote; repeatable',
  '                    (default: the account GH_TOKEN authenticates as)',
  '  --theme <name>    list only the issues of this theme',
  '  --by <claimant>   who is asking, as given to start-issue: a theme only',
  '                    its own started issues are on is not held back',
  '  -h, --help        show this help',
].join('\n');

/**
 * Lists the issues a person or a session may start next, in the order to take
 * them, and says which startable ones it passed over and why.
 *
 * ```sh
 * startable-issues                    # every startable issue
 * startable-issues --limit 3          # the first three
 * startable-issues --theme synstate   # synstate's alone
 * ```
 *
 * Which issues are startable is `run-issue-resolver`'s choice, made by the same
 * {@link surveyIssues} over the same report and its record of the issues its
 * sessions left. The order is {@link orderByTheme}'s, for the `/resolve-issues`
 * skill, which takes several issues in one session: `run-issue-resolver` hands
 * each session one, in tier order. It writes nothing: starting one is
 * `start-issue`'s.
 */
export const startableIssues = async (
  args: StartableIssuesArgs,
): Promise<Result<string, string>> => {
  // The report reads the token from the environment alone, and without one
  // cannot see the pull requests linked in the sidebar, which start issues too.
  if (tokenFromEnv() === undefined) {
    return Result.err(
      'GH_TOKEN or GITHUB_TOKEN is not set: the issues, and the pull requests that close them, are read as that account.',
    );
  }

  const context = await resolveApiContext();

  if (Result.isErr(context)) {
    return context;
  }

  const authors = Arr.isNonEmpty(args.authors)
    ? Result.ok(args.authors)
    : Result.map(await viewerLogin(context.value.token), (login) => [login]);

  if (Result.isErr(authors)) {
    return Result.err(
      `cannot read which account GH_TOKEN is, whose issues are listed by default (pass --author): ${authors.value}`,
    );
  }

  // The descriptions are read beside the report, which they do not need.
  const [read, listed] = await Promise.all([
    readReport({
      repo: `${context.value.repo.owner}/${context.value.repo.name}`,
      mergedDays: 1,
      mergedLimit: 1,
      issuesLimit: ISSUES_LIMIT,
    }),
    restAllPages(context.value, '/issues', IssueBodyListSchema, {
      query: { state: 'open' },
    }),
  ]);

  if (Result.isErr(read)) {
    return Result.err(`cannot read the issues: ${read.value}`);
  }

  const attempted = await loadAttempted(
    attemptedFile(WORKTREE_ROOT, context.value.repo),
  );

  if (Result.isErr(attempted)) {
    return attempted;
  }

  // Without the descriptions the themes come from the titles alone: they order
  // the list, and are no reason to print none of it.
  const bodies = Result.isOk(listed)
    ? issueBodies(listed.value)
    : new Map<number, string>();

  const { issues } = read.value.report;

  const themesOf =
    (themesFrom: typeof issueThemes) =>
    (number: number): readonly string[] => {
      const issue = issues.find((each) => each.number === number);

      return issue === undefined
        ? []
        : themesFrom(issue.title, bodies.get(number) ?? '');
    };

  const survey = surveyIssues(
    issues,
    new Set<string>(authors.value),
    attempted.value,
  );

  const candidates = survey.fresh.map((each): ThemedCandidate => ({
    ...each,
    tier: tierOf(issues.find(({ number }) => number === each.number)),
    themes: themesOf(issueThemes)(each.number),
    primary: themesOf(primaryThemes)(each.number),
  }));

  const others = await startedByOthers(context.value, issues, args.by);

  const held = issuesByTheme(
    others.started.map((number) => ({
      number,
      themes: themesOf(primaryThemes)(number),
    })),
  );

  return Result.ok(
    renderStartable({
      survey,
      candidates,
      order: orderByTheme(candidates, { held, theme: args.theme }),
      issues,
      authors: authors.value,
      limit: args.limit,
      theme: args.theme,
      held,
      notes: [
        ...(Result.isErr(listed)
          ? [
              `The issues' descriptions could not be read (${listed.value}): themes come from the titles alone.`,
            ]
          : []),
        ...others.notes,
      ],
    }),
  );
};

/**
 * Each theme of `issues`, with the issues about it: of the issues another
 * session started, what `orderByTheme` holds back.
 */
export const issuesByTheme = (
  issues: readonly Readonly<{ number: number; themes: readonly string[] }>[],
): ReadonlyMap<string, readonly number[]> => {
  const mut_held = new Map<string, readonly number[]>();

  for (const { number, themes } of issues) {
    for (const theme of themes) {
      mut_held.set(theme, Arr.toPushed(mut_held.get(theme) ?? [], number));
    }
  }

  return mut_held;
};

/**
 * One line per issue to take, in order, up to `limit`, then a line for each
 * kind of startable issue it passed over. With a `theme` named, a first line
 * when another session is on it, and the themes there are when it has no issue.
 */
export const renderStartable = ({
  survey,
  candidates,
  order,
  issues,
  authors,
  limit,
  theme,
  held,
  notes,
}: Readonly<{
  survey: IssueSurvey;
  /** Every startable issue, in today's order, with its themes. */
  candidates: readonly ThemedCandidate[];
  order: ThemeOrder<ThemedCandidate>;
  issues: readonly ReportIssue[];
  authors: readonly string[];
  limit: number | undefined;
  theme: string | undefined;
  held: ReadonlyMap<string, readonly number[]>;
  /** What could not be read, said after the list. */
  notes: readonly string[];
}>): string => {
  const shown = limit === undefined ? order.taken : order.taken.slice(0, limit);

  const more = order.taken.length - shown.length;

  const heldNamed =
    theme === undefined
      ? ([] as const)
      : Array.from(held).filter(([each]) => themeMatches([each], theme));

  return [
    ...(Arr.isNonEmpty(heldNamed)
      ? [
          `Another session is on theme ${theme} (${describeHeld(heldNamed)}): ask the person before taking any of it.`,
        ]
      : []),
    ...shown.map(({ number, url, themes }) => {
      const issue = issues.find((each) => each.number === number);

      const tier =
        issue === undefined
          ? 'none'
          : issuePriorityOfLabels(issue.labels.map(({ name }) => name));

      return [
        `#${number}`,
        ...(tier === 'none' || tier === 'several'
          ? []
          : [`[priority:${tier}]`]),
        ...(Arr.isNonEmpty(themes) ? [`{${themes.join(', ')}}`] : []),
        ...(issue === undefined ? [] : [issue.title]),
        url,
      ].join('  ');
    }),
    ...(more > 0 ? [`… and ${more} more, which --limit left out.`] : []),
    ...(Arr.isNonEmpty(order.taken)
      ? []
      : theme === undefined
        ? Arr.isNonEmpty(order.heldBack)
          ? []
          : ['No issue to start.']
        : [
            `No startable issue in theme ${theme}. The themes with startable issues: ${describeThemes(candidates)}.`,
          ]),
    ...(Arr.isNonEmpty(order.heldBack)
      ? [
          `${issueNumbers(order.heldBack.map(({ number }) => number))}: startable, but another session is on its theme (${describeHeld(
            Array.from(held).filter(([each]) =>
              order.heldBack.some(({ themes }) => themes.includes(each)),
            ),
          )}); left to that session, unless named with --theme.`,
        ]
      : []),
    ...notes,
    ...passedOverNotes(survey, authors),
  ].join('\n');
};

/**
 * Of the started issues and who claims each (`undefined`: no claim; an error:
 * it could not be read), the ones someone other than `by` is on. One whose
 * claim could not be read counts as another's, and a note says so: holding a
 * theme back by mistake costs less than two sessions on one.
 */
export const othersStarted = (
  claimants: readonly Readonly<{
    number: number;
    claimant: Result<string | undefined, string>;
  }>[],
  by: string,
): Readonly<{ started: readonly number[]; notes: readonly string[] }> => {
  const unread = claimants.filter(({ claimant }) => Result.isErr(claimant));

  return {
    started: claimants
      .filter(
        ({ claimant }) => !(Result.isOk(claimant) && claimant.value === by),
      )
      .map(({ number }) => number),
    notes: Arr.isNonEmpty(unread)
      ? [
          `${issueNumbers(unread.map(({ number }) => number))}: who started them could not be read; counted as another session's.`,
        ]
      : [],
  };
};

/**
 * Each open issue's description, by number, from a listing of `/issues`;
 * pull requests left out.
 */
export const issueBodies = (
  listed: readonly Readonly<{
    number: number;
    body?: string | null;
    pull_request?: ReadonlyRecord<string, unknown>;
  }>[],
): ReadonlyMap<number, string> =>
  new Map<number, string>(
    listed
      .filter(({ pull_request }) => pull_request === undefined)
      .map(({ number, body }) => [number, body ?? ''] as const),
  );

/** The command line, or `'help'` when it asked for the help. */
export const parseStartableIssuesArgs = (
  args: readonly string[],
): Result<StartableIssuesArgs | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    limit: { type: 'string' },
    author: { type: 'string', multiple: true },
    theme: { type: 'string' },
    by: { type: 'string' },
  });

  if (Result.isErr(parsed)) {
    return parsed;
  }

  if (parsed.value === 'help') {
    return Result.ok('help');
  }

  const limit =
    parsed.value.limit === undefined
      ? Result.ok(undefined)
      : positiveInteger('limit', parsed.value.limit, 0);

  if (Result.isErr(limit)) {
    return limit;
  }

  const theme = parsed.value.theme?.trim();

  if (theme === '') {
    return Result.err('--theme needs a name, such as synstate or ci');
  }

  const authors = parseAuthors(parsed.value.author);

  return Result.isErr(authors)
    ? authors
    : Result.ok({
        limit: limit.value,
        authors: authors.value,
        theme,
        by: parsed.value.by,
      });
};

export type StartableIssuesArgs = Readonly<{
  /** How many to list; all of them when `undefined`. */
  limit: number | undefined;
  /** Whose issues it lists; the token's own account when empty. */
  authors: readonly string[];
  /** The theme named; chosen theme by theme when `undefined`. */
  theme: string | undefined;
  /**
   * Who is asking, as given to `start-issue --by`: the issues it started do not
   * hold their themes back. Every started issue does when `undefined`.
   */
  by: string | undefined;
}>;

/** A startable issue, with what {@link orderByTheme} reads of it. */
export type ThemedCandidate = IssueCandidate & ThemedIssue;

/** How many themes a theme named with no issue lists. */
const THEMES_LISTED = 20;

const IssueBodyListSchema = t.array(
  t.record({
    number: t.number(),
    body: t.optional(t.union([t.string(), t.nullType])),
    pull_request: t.optional(t.record({})),
  }),
);

const tierOf = (issue: ReportIssue | undefined): ThemedIssue['tier'] => {
  const tier =
    issue === undefined
      ? 'none'
      : issuePriorityOfLabels(issue.labels.map(({ name }) => name));

  return tier === 'S' || tier === 'D' ? tier : 'other';
};

/**
 * The started issues (`in-progress`: labelled so, or closed by an open pull
 * request) that someone other than `by` is on: every one when `by` is
 * `undefined`, one with no claim naming its claimant too, and one whose claim
 * could not be read, with a note.
 */
const startedByOthers = async (
  context: ApiContext,
  issues: readonly ReportIssue[],
  by: string | undefined,
): Promise<
  Readonly<{ started: readonly number[]; notes: readonly string[] }>
> => {
  const started = issues
    .filter(({ start }) => start === 'in-progress')
    .map(({ number }) => number);

  if (by === undefined || !Arr.isNonEmpty(started)) {
    return { started, notes: [] };
  }

  const viewer = await viewerLogin(context.token);

  if (Result.isErr(viewer)) {
    return {
      started,
      notes: [
        `Who started the started issues could not be read (${viewer.value}): every one counts as another session's.`,
      ],
    };
  }

  return othersStarted(
    await Promise.all(
      started.map(async (number) => ({
        number,
        claimant: await readIssueClaimant(context, number, viewer.value),
      })),
    ),
    by,
  );
};

/** `ci: #90, #91; tooling: #92`. */
const describeHeld = (
  held: readonly (readonly [string, readonly number[]])[],
): string =>
  held
    .map(([theme, numbers]) => `${theme}: ${issueNumbers(numbers)}`)
    .join('; ');

/** `ci (3), tooling (2)`: the themes of `candidates`, the commonest first. */
const describeThemes = (candidates: readonly ThemedCandidate[]): string => {
  const counts = issuesByTheme(candidates);

  return Array.from(counts)
    .toSorted(([a, an], [b, bn]) =>
      an.length === bn.length ? a.localeCompare(b) : bn.length - an.length,
    )
    .slice(0, THEMES_LISTED)
    .map(([theme, numbers]) => `${theme} (${numbers.length})`)
    .join(', ');
};
