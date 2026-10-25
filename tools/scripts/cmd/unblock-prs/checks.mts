/**
 * What the merge is waiting for, read from the head commit's checks and
 * judged against the contexts the ruleset requires.
 */

import {
  combineContextStates,
  summarizeChecks as summarizeContexts,
  type ContextState,
} from 'pr-report-core';
import { Arr, Num, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { graphqlQuery, type ApiContext } from '../../lib/github-api.mjs';
import type { ChecksSummary } from './types.mjs';

/**
 * One check on the head, in the shape `gh pr checks --json` printed, which
 * is what this script read until it called the API itself.
 */
export type ReportedCheck = Readonly<{
  name: string;
  /** `pass` | `fail` | `pending` | `skipping` | `cancel` */
  bucket: string;
  link: string;
  /** ISO 8601; GitHub's zero time before the check has started. */
  startedAt: string;
  /** ISO 8601; GitHub's zero time before the check has finished. */
  completedAt: string;
  /** The workflow the job belongs to; empty for a commit status. */
  workflow: string;
}>;

/**
 * A check on the head that has not finished, when it started, and the
 * workflow run it is a job of.
 */
export type RunningCheck = Readonly<{
  name: string;
  startedAt: string;
  workflow: string;
  link: string;
}>;

/**
 * The checks that gate the merge, as GitHub reports them for the head commit.
 * `isRequired` is GitHub's own answer for this pull request, so the list
 * follows the ruleset without this script having to know it.
 */
export const listRequiredChecks = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<readonly ReportedCheck[], string>> =>
  Result.map(await readCheckContexts(api, prNumber), (contexts) =>
    reportedChecksOf(contexts, 'required'),
  );

/**
 * The checks on the head commit that have not finished, required or not.
 *
 * A required aggregate has no run in a new round until the jobs it waits on
 * are done, so until then the required ones answer with the round before.
 * When that round was the one `skip-ci` skipped, every aggregate reads
 * `skipped` and the commit looks green halfway through its matrix. Anything
 * still running is what says the round is not over, and when it started is
 * what tells a failure of the round before from one of this round.
 */
export const listRunningChecks = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<readonly RunningCheck[], string>> =>
  Result.map(await readCheckContexts(api, prNumber), (contexts) =>
    reportedChecksOf(contexts, 'all')
      .filter((check) => check.bucket === 'pending')
      .map(({ name, startedAt, workflow, link }) => ({
        name,
        startedAt,
        workflow,
        link,
      })),
  );

/**
 * What the head commit's checks say, as `gh pr checks` said it: each check
 * run and commit status in a bucket, and of the runs of one job in one
 * workflow and event only the latest — a re-run, or the round `skip-ci`
 * cancelled under the one now running — so that a superseded failure does
 * not speak for its context. `which` is `'required'` for only what GitHub
 * says this pull request requires.
 *
 * Unlike `gh`, the survivors keep the order GitHub listed them in. A commit
 * status's start and finish are both when it was set, the one time it has.
 */
export const reportedChecksOf = (
  contexts: readonly CheckContextNode[],
  which: 'all' | 'required',
): readonly ReportedCheck[] => {
  const mut_latest = new Map<string, CheckContextNode>();

  for (const context of contexts) {
    const key = keyOf(context);

    const kept = mut_latest.get(key);

    if (kept === undefined || startedAtOf(context) > startedAtOf(kept)) {
      mut_latest.set(key, context);
    }
  }

  const survivors = new Set(mut_latest.values());

  return contexts
    .filter(
      (context) =>
        survivors.has(context) && (which === 'all' || context.isRequired),
    )
    .map(reportedCheckOf);
};

/** A context of the head commit's status check rollup, as read. */
export type CheckContextNode = t.TypeOf<typeof CheckContextNodeSchema>;

/**
 * Every context of the pull request's head commit, page by page. A head with
 * none reported yet — right after a push — is an empty list.
 */
const readCheckContexts = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<readonly CheckContextNode[], string>> => {
  const mut_contexts: CheckContextNode[] = [];

  let mut_after: string | undefined = undefined;

  for (const _page of Arr.seq(MAX_PAGES)) {
    const rollup = await readRollupPage(api, prNumber, mut_after);

    if (Result.isErr(rollup)) {
      return rollup;
    }

    if (rollup.value === null) {
      return Result.ok(mut_contexts);
    }

    mut_contexts.push(...rollup.value.nodes);

    const { hasNextPage, endCursor } = rollup.value.pageInfo;

    if (!hasNextPage || endCursor === null) {
      return Result.ok(mut_contexts);
    }

    mut_after = endCursor;
  }

  return Result.err(
    `#${prNumber} has more than ${MAX_PAGES * PAGE_SIZE} checks on its head`,
  );
};

/**
 * One page of the head commit's contexts, from `after` on; `null` when the
 * head has no rollup yet.
 */
const readRollupPage = async (
  api: ApiContext,
  prNumber: number,
  after: string | undefined,
): Promise<Result<RollupPage | null, string>> =>
  Result.map(
    await graphqlQuery(
      api,
      CHECKS_QUERY,
      {
        owner: api.repo.owner,
        name: api.repo.name,
        number: prNumber,
        ...(after === undefined ? {} : { after }),
      },
      ChecksAnswerSchema,
    ),
    (answer) =>
      answer.repository.pullRequest.commits.nodes[0]?.commit.statusCheckRollup
        ?.contexts ?? null,
  );

type RollupPage = Readonly<{
  pageInfo: Readonly<{ hasNextPage: boolean; endCursor: string | null }>;
  nodes: readonly CheckContextNode[];
}>;

const PAGE_SIZE = 100;

const MAX_PAGES = 10;

const CHECKS_QUERY = [
  'query($owner: String!, $name: String!, $number: Int!, $after: String) {',
  '  repository(owner: $owner, name: $name) {',
  '    pullRequest(number: $number) {',
  '      commits(last: 1) { nodes { commit { statusCheckRollup {',
  `        contexts(first: ${PAGE_SIZE}, after: $after) {`,
  '          pageInfo { hasNextPage endCursor }',
  '          nodes {',
  '            __typename',
  '            ... on CheckRun {',
  '              name status conclusion startedAt completedAt detailsUrl',
  '              isRequired(pullRequestNumber: $number)',
  '              checkSuite { workflowRun { event workflow { name } } }',
  '            }',
  '            ... on StatusContext {',
  '              context state targetUrl createdAt',
  '              isRequired(pullRequestNumber: $number)',
  '            }',
  '          }',
  '        }',
  '      } } }',
  '    }',
  '  }',
  '}',
].join('\n');

const CheckContextNodeSchema = t.union([
  t.record({
    __typename: t.literal('CheckRun'),
    name: t.string(),
    status: t.string(),
    conclusion: t.union([t.string(), t.nullType]),
    startedAt: t.union([t.string(), t.nullType]),
    completedAt: t.union([t.string(), t.nullType]),
    detailsUrl: t.union([t.string(), t.nullType]),
    isRequired: t.boolean(),
    checkSuite: t.union([
      t.record({
        workflowRun: t.union([
          t.record({
            event: t.string(),
            workflow: t.record({ name: t.string() }),
          }),
          t.nullType,
        ]),
      }),
      t.nullType,
    ]),
  }),
  t.record({
    __typename: t.literal('StatusContext'),
    context: t.string(),
    state: t.string(),
    targetUrl: t.union([t.string(), t.nullType]),
    createdAt: t.string(),
    isRequired: t.boolean(),
  }),
]);

const ChecksAnswerSchema = t.record({
  repository: t.record({
    pullRequest: t.record({
      commits: t.record({
        nodes: t.array(
          t.record({
            commit: t.record({
              statusCheckRollup: t.union([
                t.record({
                  contexts: t.record({
                    pageInfo: t.record({
                      hasNextPage: t.boolean(),
                      endCursor: t.union([t.string(), t.nullType]),
                    }),
                    nodes: t.array(CheckContextNodeSchema),
                  }),
                }),
                t.nullType,
              ]),
            }),
          }),
        ),
      }),
    }),
  }),
});

/** What `gh` wrote for a time a check has not reached. */
const ZERO_TIME = '0001-01-01T00:00:00Z';

/**
 * Which runs supersede each other: a commit status by its context, a check
 * run by its name, workflow and event, as `gh` told them apart.
 */
const keyOf = (context: CheckContextNode): string =>
  context.__typename === 'StatusContext'
    ? (`status:${context.context}` as const)
    : [
        'run',
        context.name,
        context.checkSuite?.workflowRun?.workflow.name ?? '',
        context.checkSuite?.workflowRun?.event ?? '',
      ].join(':');

const startedAtOf = (context: CheckContextNode): string =>
  (context.__typename === 'StatusContext'
    ? context.createdAt
    : context.startedAt) ?? ZERO_TIME;

const reportedCheckOf = (context: CheckContextNode): ReportedCheck =>
  context.__typename === 'StatusContext'
    ? ({
        name: context.context,
        bucket: bucketOf(context.state),
        link: context.targetUrl ?? '',
        startedAt: context.createdAt,
        completedAt: context.createdAt,
        workflow: '',
      } as const)
    : ({
        name: context.name,
        bucket: bucketOf(
          context.status === 'COMPLETED'
            ? (context.conclusion ?? '')
            : context.status,
        ),
        link: context.detailsUrl ?? '',
        startedAt: context.startedAt ?? ZERO_TIME,
        completedAt: context.completedAt ?? ZERO_TIME,
        workflow: context.checkSuite?.workflowRun?.workflow.name ?? '',
      } as const);

/**
 * A check run's conclusion, or its status while it runs, or a commit
 * status's state, in `gh pr checks`'s buckets. Anything else — `QUEUED`,
 * `IN_PROGRESS`, `PENDING`, `EXPECTED`, `STALE` — is waited for.
 */
const bucketOf = (state: string): string => {
  switch (state) {
    case 'SUCCESS':
      return 'pass';

    case 'SKIPPED':
    case 'NEUTRAL':
      return 'skipping';

    case 'ERROR':
    case 'FAILURE':
    case 'TIMED_OUT':
    case 'ACTION_REQUIRED':
    case 'STARTUP_FAILURE':
      return 'fail';

    case 'CANCELLED':
      return 'cancel';

    default:
      return 'pending';
  }
};

/**
 * `checks` is what {@link listRequiredChecks} reported for the head commit;
 * `requiredContexts` is what the ruleset asks for. The difference between the
 * two is the point: a context in the second and not the first has not
 * reported yet, and GitHub will not merge until it does. `running` is every
 * check on the head that has not finished ({@link listRunningChecks}); while
 * it is not empty the required ones may be the round before speaking, so
 * they cannot pass the pull request.
 *
 * Nor can they fail it when they finished before the round still running
 * began: the round `skip-ci` cancelled, as `open-pr` opens every pull request
 * under it, leaves its aggregates red, and reading that red as this round's
 * set a pull request aside while its first real round was under way (#2246).
 * Such a failure waits for the round to end, as a check not yet reported
 * does. So does one that finished after the round began but whose workflow
 * has a newer run still going: the round `skip-ci` was put on for can take
 * long enough to be cancelled that its aggregate goes red after the round
 * taking its place has started, and only the run that replaced it says it is
 * the round before (#2463). A failure of this round still fails the pull
 * request at once.
 *
 * The verdict itself is `pr-report-core`'s `summarizeChecks`, which
 * `pr-report` and the page reach theirs through, so the worker and the report
 * cannot disagree about one; what is here turns what GitHub reports into
 * the states that reads.
 */
export const summarizeChecks = (
  checks: readonly ReportedCheck[],
  requiredContexts: readonly string[],
  running: readonly RunningCheck[],
): ChecksSummary => {
  const roundStartedMs = earliestStart(running);

  const isOfRoundBefore = (check: ReportedCheck): boolean => {
    const completedMs = epochMs(check.completedAt);

    return (
      (roundStartedMs !== undefined &&
        completedMs !== undefined &&
        completedMs < roundStartedMs) ||
      isSuperseded(check, running)
    );
  };

  const isFailureOfThisRound = (check: ReportedCheck): boolean =>
    isFailure(check) && !isOfRoundBefore(check);

  const mut_reported = new Map<string, ContextState>();

  for (const check of checks) {
    const state = stateOf(check, isOfRoundBefore(check));

    const previous = mut_reported.get(check.name);

    mut_reported.set(
      check.name,
      previous === undefined ? state : combineContextStates(previous, state),
    );
  }

  const pendingNames = new Set(
    checks
      .filter((check) => mut_reported.get(check.name) === 'pending')
      .map((check) => check.name),
  );

  const stillRunning = running
    .map(({ name }) => name)
    .filter((name) => !pendingNames.has(name));

  const summary = summarizeContexts({
    // What the ruleset asks for, and whatever `--required` reported besides:
    // all of it, when the rules could not be read.
    required: Arr.uniq([
      ...requiredContexts,
      ...checks.map((check) => check.name),
    ]),
    reported: mut_reported,
    // `skip-ci` is the queue's to read (`queueStanding`), not the checks'.
    paused: false,
    // No checks at all means they have not been reported yet — which is
    // also all that can be said when the ruleset could not be read.
    running: Arr.isNonEmpty(stillRunning) || !Arr.isNonEmpty(checks),
    // A required context that has not reported is waited for wherever the
    // pull request points: the worker arms what it judges green, and an
    // armed pull request stacked on a branch no ruleset covers merges into
    // it at once.
    baseCovered: true,
  });

  return {
    ...summary,
    failedRuns: checks
      .filter(isFailureOfThisRound)
      .map(({ name, link }) => ({ name, link })),
    running: stillRunning,
  };
};

/** Everything the merge is still waiting for, reported and unreported. */
export const describeWaitingOn = (summary: ChecksSummary): string => {
  const waiting = [
    ...summary.pending,
    ...summary.missing.map((context) => `${context} (not reported yet)`),
    ...summary.running.map((name) => `${name} (running)`),
  ] as const;

  return Arr.isNonEmpty(waiting) ? waiting.join(', ') : 'checks to be reported';
};

const isFailure = (check: ReportedCheck): boolean =>
  check.bucket === 'fail' || check.bucket === 'cancel';

/**
 * What one reported check says of its context. A failure of the round before
 * waits for the round still running, as a check not yet reported does.
 */
const stateOf = (check: ReportedCheck, ofRoundBefore: boolean): ContextState =>
  isFailure(check)
    ? ofRoundBefore
      ? 'pending'
      : 'failed'
    : check.bucket === 'pending'
      ? 'pending'
      : check.bucket === 'skipping'
        ? 'skipped'
        : 'passed';

/**
 * Whether a newer run of the check's own workflow is still running. Run ids
 * only grow, so a higher one is a later run; a commit status has no workflow
 * and no run, and is never superseded.
 */
const isSuperseded = (
  check: ReportedCheck,
  running: readonly RunningCheck[],
): boolean => {
  const runId = workflowRunId(check.link);

  return (
    check.workflow !== '' &&
    runId !== undefined &&
    running.some((other) => {
      const otherRunId = workflowRunId(other.link);

      return (
        other.workflow === check.workflow &&
        otherRunId !== undefined &&
        otherRunId > runId
      );
    })
  );
};

/** The run id in a job's link (`…/actions/runs/<id>/job/<id>`). */
const workflowRunId = (link: string): number | undefined => {
  const id = /\/actions\/runs\/(\d+)\//u.exec(link)?.[1];

  return id === undefined
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(id), undefined);
};

/**
 * When the earliest check still running started, in milliseconds; `undefined`
 * when nothing is running or no start time can be read.
 */
const earliestStart = (
  running: readonly RunningCheck[],
): number | undefined => {
  const starts = Arr.generate(function* () {
    for (const { startedAt } of running) {
      const ms = epochMs(startedAt);

      if (ms !== undefined) {
        yield ms;
      }
    }
  });

  return Arr.isNonEmpty(starts) ? Math.min(...starts) : undefined;
};

/** An ISO 8601 instant in milliseconds; `undefined` when it is not one. */
const epochMs = (iso: string): number | undefined => {
  try {
    return Temporal.Instant.from(iso).epochMilliseconds;
  } catch {
    return undefined;
  }
};
