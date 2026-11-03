import { issuePriorityOfLabels, type ReportIssue } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import {
  parseCommandArgs,
  positiveInteger,
  resolveApiContext,
  tokenFromEnv,
  viewerLogin,
} from '../lib/index.mjs';
import { readReport } from '../pr-report/index.mjs';
import {
  attemptedFile,
  ISSUES_LIMIT,
  loadAttempted,
  parseAuthors,
  passedOverNotes,
  surveyIssues,
  type IssueSurvey,
} from '../run-issue-resolver/index.mjs';
import { WORKTREE_ROOT } from '../unblock-prs/index.mjs';

/** What `startable-issues --help` prints. */
export const STARTABLE_ISSUES_HELP = [
  'Usage: startable-issues [--limit <n>] [--author <login>]...',
  '',
  'Lists the open issues nobody has started, in the order to take them: by',
  'tier, priority:S, A, B, C, then no tier, then D, the lowest number first',
  'within each; priority:hold and priority:close are held. Reads them as',
  'run-issue-resolver does, and writes nothing.',
  '',
  'Options:',
  '  --limit <n>       list the first n (default: all of them)',
  '  --author <login>  list only issues this account wrote; repeatable',
  '                    (default: the account GH_TOKEN authenticates as)',
  '  -h, --help        show this help',
].join('\n');

/**
 * Lists the issues a person or a session may start next, in the order to take
 * them, and says which startable ones it passed over and why.
 *
 * ```sh
 * startable-issues             # every startable issue
 * startable-issues --limit 3   # the first three
 * ```
 *
 * The choice is `run-issue-resolver`'s, made by the same {@link surveyIssues}
 * over the same report and its record of the issues its sessions left, so that
 * the `/resolve-issues` skill and the command never disagree about which issue
 * comes next. It writes nothing: starting one is `start-issue`'s.
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

  const read = await readReport({
    repo: `${context.value.repo.owner}/${context.value.repo.name}`,
    mergedDays: 1,
    mergedLimit: 1,
    issuesLimit: ISSUES_LIMIT,
  });

  if (Result.isErr(read)) {
    return Result.err(`cannot read the issues: ${read.value}`);
  }

  const attempted = await loadAttempted(
    attemptedFile(WORKTREE_ROOT, context.value.repo),
  );

  if (Result.isErr(attempted)) {
    return attempted;
  }

  const { issues } = read.value.report;

  return Result.ok(
    renderStartable(
      surveyIssues(issues, new Set<string>(authors.value), attempted.value),
      issues,
      authors.value,
      args.limit,
    ),
  );
};

/**
 * One line per issue to take, in order, up to `limit`, then a line for each
 * kind of startable issue the survey passed over.
 */
export const renderStartable = (
  survey: IssueSurvey,
  issues: readonly ReportIssue[],
  authors: readonly string[],
  limit: number | undefined,
): string => {
  const shown =
    limit === undefined ? survey.fresh : survey.fresh.slice(0, limit);

  const more = survey.fresh.length - shown.length;

  return [
    ...shown.map(({ number, url }) => {
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
        ...(issue === undefined ? [] : [issue.title]),
        url,
      ].join('  ');
    }),
    ...(more > 0 ? [`… and ${more} more, which --limit left out.`] : []),
    ...(Arr.isNonEmpty(survey.fresh) ? [] : ['No issue to start.']),
    ...passedOverNotes(survey, authors),
  ].join('\n');
};

/** The command line, or `'help'` when it asked for the help. */
export const parseStartableIssuesArgs = (
  args: readonly string[],
): Result<StartableIssuesArgs | 'help', string> => {
  const parsed = parseCommandArgs(args, {
    limit: { type: 'string' },
    author: { type: 'string', multiple: true },
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

  const authors = parseAuthors(parsed.value.author);

  return Result.isErr(authors)
    ? authors
    : Result.ok({ limit: limit.value, authors: authors.value });
};

export type StartableIssuesArgs = Readonly<{
  /** How many to list; all of them when `undefined`. */
  limit: number | undefined;
  /** Whose issues it lists; the token's own account when empty. */
  authors: readonly string[];
}>;
