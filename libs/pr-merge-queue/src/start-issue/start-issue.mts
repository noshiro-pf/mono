import {
  closingKeywordIssuesIn,
  hasLabel,
  IN_PROGRESS_LABEL,
  PLANNED_LABEL,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  addLabel,
  pullRequestNumber,
  removeLabel,
  resolveApiContext,
  rest,
  type ApiContext,
} from '../lib/index.mjs';

/** What `start-issue --help` prints. */
export const START_ISSUE_HELP = [
  'Usage: start-issue <number> [--force | --release]',
  '',
  'Marks an issue as started before work on it begins: labels it in-progress',
  'and takes planned off. Refuses one already labelled in-progress, or one an',
  'open pull request closes, since someone else may be on it.',
  '',
  'Options:',
  '  --force    start it all the same, once whoever decides has said to',
  '  --release  take in-progress off again, when the work is dropped',
  '  -h, --help show this help',
].join('\n');

/**
 * Marks an issue as started (`pr-report-core`'s `IN_PROGRESS_LABEL`) before
 * work on it begins, so that two sessions do not pick up the same one, and so
 * that the Pull Requests Manager page tells an issue under way with no pull
 * request yet from one nobody has started.
 *
 * ```sh
 * start-issue 2701            # label it in-progress, take planned off
 * start-issue 2701 --force    # the same, past a refusal someone overruled
 * start-issue 2701 --release  # take in-progress off: the work is dropped
 * ```
 *
 * It refuses — exits 1 and says why — an issue already labelled
 * `in-progress`, or one an open pull request closes by a closing keyword,
 * since someone may be on it. That is a question for a person, not for the
 * session that ran it: `--force` is the answer they give.
 *
 * Only closing keywords count as an open pull request closing the issue: a
 * pull request linked in the Development sidebar alone is GraphQL's to tell,
 * and the page shows it as in progress all the same.
 *
 * Two sessions starting the same issue within the same second both get it:
 * a label has no order to read back, as a claim comment has. What this
 * guards against is the usual case, an issue picked up hours after someone
 * else did.
 */
export const startIssue = async (
  args: StartIssueArgs,
): Promise<Result<string, string>> => {
  const context = await resolveApiContext();

  if (Result.isErr(context)) {
    return context;
  }

  const [issue, closers] = await Promise.all([
    rest(context.value, 'GET', `/issues/${args.number}`, IssueSchema),
    // Read only where it can refuse: `--force` starts it whatever closes it.
    args.mode === 'start'
      ? openPullsClosing(context.value, args.number)
      : Promise.resolve(Result.ok<readonly number[]>([])),
  ]);

  if (Result.isErr(issue)) {
    return issue;
  }

  if (args.mode === 'release') {
    return release(context.value, args.number, issue.value);
  }

  if (Result.isErr(closers)) {
    return closers;
  }

  const decided = decideStart(
    {
      open: issue.value.state === 'open',
      pullRequest: issue.value.pull_request !== undefined,
      labels: issue.value.labels,
      closers: closers.value,
    },
    args.mode === 'force',
  );

  if (decided.kind === 'refuse') {
    return Result.err(
      decided.overridable
        ? `#${args.number} not started: ${decided.reason}. Someone may be working on it: ask whoever decides before going on, and rerun with --force only once they say to (or, if the work was dropped, --release takes the label off).`
        : `#${args.number} not started: ${decided.reason}.`,
    );
  }

  // `planned` first: should the second write fail, a rerun finds the issue
  // as it was rather than refuses it as someone else's.
  if (decided.removePlanned) {
    const removed = await removeLabel(
      context.value,
      args.number,
      PLANNED_LABEL,
    );

    if (Result.isErr(removed)) {
      return removed;
    }
  }

  const added = await addLabel(context.value, args.number, IN_PROGRESS_LABEL);

  if (Result.isErr(added)) {
    return added;
  }

  return Result.ok(
    `#${args.number} labelled ${IN_PROGRESS_LABEL}${decided.removePlanned ? `, ${PLANNED_LABEL} taken off` : ''}.`,
  );
};

/**
 * Whether to start an issue, and whether to take `planned` off as it is:
 * one already started, by the label or by an open pull request, is refused
 * unless `force`d; one that is closed, or is a pull request, is refused
 * whatever, since there is nothing to start.
 */
export const decideStart = (
  issue: IssueFacts,
  force: boolean,
): Readonly<
  | { kind: 'start'; removePlanned: boolean }
  | { kind: 'refuse'; reason: string; overridable: boolean }
> => {
  if (issue.pullRequest) {
    return {
      kind: 'refuse',
      reason: 'it is a pull request, not an issue',
      overridable: false,
    };
  }

  if (!issue.open) {
    return { kind: 'refuse', reason: 'it is closed', overridable: false };
  }

  if (!force && Arr.isNonEmpty(issue.closers)) {
    return {
      kind: 'refuse',
      reason: `open pull request ${issue.closers.map((number) => `#${number}`).join(', ')} closes it`,
      overridable: true,
    };
  }

  if (!force && hasLabel(issue.labels, IN_PROGRESS_LABEL)) {
    return {
      kind: 'refuse',
      reason: `it is already labelled ${IN_PROGRESS_LABEL}`,
      overridable: true,
    };
  }

  return {
    kind: 'start',
    removePlanned: hasLabel(issue.labels, PLANNED_LABEL),
  };
};

/** The command line, or what is wrong with it. */
export const parseStartIssueArgs = (
  args: readonly string[],
): StartIssueArgs | string => {
  const flags = args.filter((arg) => arg.startsWith('--') && arg !== '--');

  const positional = args.filter((arg) => !arg.startsWith('--'));

  const unknown = flags.filter(
    (flag) => flag !== '--force' && flag !== '--release',
  );

  const [first] = positional;

  const number = first === undefined ? undefined : pullRequestNumber(first);

  return Arr.isNonEmpty(unknown)
    ? `unknown option: ${unknown.join(' ')}`
    : flags.includes('--force') && flags.includes('--release')
      ? '--force and --release do not go together'
      : positional.length > 1
        ? `unexpected argument: ${Arr.tail(positional).join(' ')}`
        : number === undefined
          ? 'name the issue by its number'
          : {
              number,
              mode: flags.includes('--release')
                ? 'release'
                : flags.includes('--force')
                  ? 'force'
                  : 'start',
            };
};

/** What {@link decideStart} reads of an issue. */
export type IssueFacts = Readonly<{
  open: boolean;
  /** The issues route answers for a pull request too. */
  pullRequest: boolean;
  labels: readonly Readonly<{ name: string }>[];
  /** The open pull requests that close it, lowest first. */
  closers: readonly number[];
}>;

export type StartIssueArgs = Readonly<{
  number: number;
  mode: 'force' | 'release' | 'start';
}>;

const release = async (
  context: ApiContext,
  number: number,
  issue: t.TypeOf<typeof IssueSchema>,
): Promise<Result<string, string>> => {
  if (issue.pull_request !== undefined) {
    return Result.err(`#${number}: it is a pull request, not an issue.`);
  }

  if (!hasLabel(issue.labels, IN_PROGRESS_LABEL)) {
    return Result.ok(`#${number} is not labelled ${IN_PROGRESS_LABEL}.`);
  }

  const removed = await removeLabel(context, number, IN_PROGRESS_LABEL);

  return Result.isErr(removed)
    ? removed
    : Result.ok(`#${number}: ${IN_PROGRESS_LABEL} taken off.`);
};

/**
 * The open pull requests whose bodies close `issue` by a closing keyword,
 * read from GitHub's rendering as `open-pr` reads them. The first hundred
 * only, as there: a repository with more open than that has other problems.
 */
const openPullsClosing = async (
  context: ApiContext,
  issue: number,
): Promise<Result<readonly number[], string>> =>
  Result.map(
    await rest(context, 'GET', '/pulls', PullBodiesSchema, {
      query: { state: 'open', per_page: '100' },
      withBodyHtml: true,
    }),
    (pulls) =>
      pulls
        .filter(({ body_html: html }) =>
          closingKeywordIssuesIn(context.repo, html ?? '').includes(issue),
        )
        .map(({ number }) => number)
        .toSorted((a, b) => a - b),
  );

const IssueSchema = t.record({
  state: t.string(),
  pull_request: t.optional(t.record({})),
  labels: t.array(t.record({ name: t.string() })),
});

const PullBodiesSchema = t.array(
  t.record({
    number: t.number(),
    body_html: t.optional(t.union([t.string(), t.nullType])),
  }),
);
