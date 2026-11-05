/**
 * What the merge is waiting for, read from the head commit's checks and judged
 * against the contexts the ruleset requires.
 */

import {
  combineContextStates,
  epochMsOf,
  outranks,
  summarizeChecks as summarizeContexts,
  type CheckRunRank,
  type ContextState,
} from 'pr-report-core';
import { Arr, Num, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { graphqlQuery, type ApiContext } from '../lib/index.mjs';
import type { ChecksSummary } from './types.mjs';

/**
 * One check on the head, in the shape `gh pr checks --json` printed, which is
 * what this script read until it called the API itself.
 */
export type ReportedCheck = Readonly<{
  name: string;
  /** `pass` | `fail` | `pending` | `skipping` | `cancel` */
  bucket: string;
  link: string;
  /**
   * ISO 8601; `undefined` before a check run has started. A commit status's is
   * when it was set.
   */
  startedAt: string | undefined;
  /**
   * ISO 8601; `undefined` before a check run has finished. A commit status's is
   * when it was set, whatever its state.
   */
  completedAt: string | undefined;
  /** The workflow the job belongs to; empty for a commit status. */
  workflow: string;
  /**
   * Whether a job of the check run's own workflow run was re-run after it was
   * created, and the workflow run has not finished: "Re-run failed jobs" queues
   * the failed jobs again, and the aggregate that needs them gets a new run only
   * once they are done, so until then the aggregate's red is the attempt
   * before's. Always `false` for a commit status.
   */
  reRunAfter: boolean;
}>;

/**
 * A check on the head that has not finished, when it started, and the workflow
 * run it is a job of.
 */
export type RunningCheck = Readonly<{
  name: string;
  /**
   * ISO 8601; `undefined` while the check is queued, and for a commit status,
   * whose one time is when it was set.
   */
  startedAt: string | undefined;
  workflow: string;
  link: string;
}>;

/**
 * The head commit's checks, read once: the ones that gate the merge, and every
 * one that has not finished. Both lists come from the one answer, so they cost
 * the requests of one read, and on a head whose checks fit on one page they
 * speak of the same moment.
 */
export const readHeadChecks = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<HeadChecks, string>> =>
  Result.map(await readCheckContexts(api, prNumber), headChecksOf);

/**
 * Whether GitHub answers a check rollup read at all, asked of `sha` — the tip
 * of the base, which nothing is wrong with — by the same GraphQL field
 * {@link readHeadChecks} reads, so that a pull request whose read fails can be
 * told from GitHub failing every such read (`unread.mts`).
 */
export const probeCheckReads = async (
  api: ApiContext,
  sha: string,
): Promise<Result<undefined, string>> =>
  Result.map(
    await graphqlQuery(
      api,
      PROBE_QUERY,
      { owner: api.repo.owner, name: api.repo.name, sha },
      ProbeAnswerSchema,
    ),
    () => undefined,
  );

/** The two lists of {@link HeadChecks}, from the contexts of one read. */
export const headChecksOf = (
  contexts: readonly CheckContextNode[],
): HeadChecks => {
  const latest = latestChecksOf(contexts);

  return {
    required: latest
      .filter(([context]) => context.isRequired)
      .map(([, check]) => check),
    running: latest
      .filter(([, check]) => check.bucket === 'pending')
      .map(([context, { name, startedAt, workflow, link }]) => ({
        name,
        // A commit status pending since it was set says nothing of when the
        // round began, and one set long ago would put that before the reds of
        // the round before.
        startedAt:
          context.__typename === 'StatusContext' ? undefined : startedAt,
        workflow,
        link,
      })),
  } as const;
};

/**
 * What the head commit's checks say, as `gh pr checks` said it: each check run
 * and commit status in a bucket, and of the runs of one job in one workflow and
 * event only the latest — a re-run, or the round `skip-ci` cancelled under the
 * one now running — so that a superseded failure does not speak for its
 * context. `which` is `'required'` for only what GitHub says this pull request
 * requires.
 *
 * Unlike `gh`, the survivors keep the order GitHub listed them in. A commit
 * status's start and finish are both when it was set, the one time it has.
 */
export const reportedChecksOf = (
  contexts: readonly CheckContextNode[],
  which: 'all' | 'required',
): readonly ReportedCheck[] =>
  latestChecksOf(contexts)
    .filter(([context]) => which === 'all' || context.isRequired)
    .map(([, check]) => check);

/** A context of the head commit's status check rollup, as read. */
export type CheckContextNode = t.TypeOf<typeof CheckContextNodeSchema>;

/**
 * `checks` and `running` are what {@link readHeadChecks} read of the head
 * commit, its `required` and its `running`; `requiredContexts` is what the
 * ruleset asks for. The difference between `requiredContexts` and `checks` is
 * the point: a context in the first and not the second has not reported yet,
 * and GitHub will not merge until it does. While `running` is not empty the
 * required ones may be the round before speaking, so they cannot pass the pull
 * request.
 *
 * Nor can they fail it when they finished before the round still running began:
 * the round `skip-ci` cancelled, as `open-pr` opens every pull request under
 * it, leaves its aggregates red, and reading that red as this round's set a
 * pull request aside while its first real round was under way (#2246).
 * Such a failure waits for the round to end, as a check not yet reported does.
 * So does one that finished after the round began but whose workflow has a
 * newer run still going: the round `skip-ci` was put on for can take long
 * enough to be cancelled that its aggregate goes red after the round taking its
 * place has started, and only the run that replaced it says it is the round
 * before (#2463). A failure of this round still fails the pull request at once.
 *
 * The verdict itself is `pr-report-core`'s `summarizeChecks`, which `pr-report`
 * and the page reach theirs through, so the worker and the report cannot
 * disagree about one; what is here turns what GitHub reports into the states
 * that reads.
 */
export const summarizeChecks = (
  checks: readonly ReportedCheck[],
  requiredContexts: readonly string[],
  running: readonly RunningCheck[],
): ChecksSummary => {
  const roundStartedMs = earliestStart(running);

  const isOfRoundBefore = (check: ReportedCheck): boolean => {
    const completedMs = msOf(check.completedAt);

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
    // No checks at all means they have not been reported yet — which is also
    // all that can be said when the ruleset could not be read.
    running: Arr.isNonEmpty(stillRunning) || !Arr.isNonEmpty(checks),
    // A required context that has not reported is waited for wherever the pull
    // request points: the worker arms what it judges green, and an armed pull
    // request stacked on a branch no ruleset covers merges into it at once.
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

/** What {@link readHeadChecks} reads. */
export type HeadChecks = Readonly<{
  /**
   * The checks that gate the merge, as GitHub reports them for the head commit.
   * `isRequired` is GitHub's own answer for this pull request, so the list
   * follows the ruleset without this script having to know it.
   */
  required: readonly ReportedCheck[];

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
  running: readonly RunningCheck[];
}>;

/** The run id in a job's link (`…/actions/runs/<id>/job/<id>`). */
export const workflowRunId = (link: string): number | undefined => {
  const id = /\/actions\/runs\/(\d+)\//u.exec(link)?.[1];

  return id === undefined
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(id), undefined);
};

/**
 * One page of the head commit's contexts, from `after` on; `null` when the head
 * has no rollup yet.
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
  '              databaseId name status conclusion startedAt completedAt',
  '              detailsUrl isRequired(pullRequestNumber: $number)',
  '              checkSuite {',
  '                databaseId status workflowRun { event workflow { name } }',
  '              }',
  '            }',
  '            ... on StatusContext {',
  '              context state targetUrl createdAt',
  '              isRequired(pullRequestNumber: $number)',
  '            }',
  '          }',
  '        }',
  '      } } } }',
  '    }',
  '  }',
  '}',
].join('\n');

const PROBE_QUERY = [
  'query CheckReadProbe($owner: String!, $name: String!, $sha: GitObjectID!) {',
  '  repository(owner: $owner, name: $name) {',
  '    object(oid: $sha) { ... on Commit { statusCheckRollup { state } } }',
  '  }',
  '}',
].join('\n');

const ProbeAnswerSchema = t.record({
  repository: t.record({
    object: t.union([
      t.record({
        statusCheckRollup: t.optional(
          t.union([t.record({ state: t.string() }), t.nullType]),
        ),
      }),
      t.nullType,
    ]),
  }),
});

const CheckRunNodeSchema = t.record({
  __typename: t.literal('CheckRun'),
  databaseId: t.union([t.number(), t.nullType]),
  name: t.string(),
  status: t.string(),
  conclusion: t.union([t.string(), t.nullType]),
  startedAt: t.union([t.string(), t.nullType]),
  completedAt: t.union([t.string(), t.nullType]),
  detailsUrl: t.union([t.string(), t.nullType]),
  isRequired: t.boolean(),
  checkSuite: t.union([
    t.record({
      databaseId: t.union([t.number(), t.nullType]),
      status: t.string(),
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
});

type CheckRunNode = t.TypeOf<typeof CheckRunNodeSchema>;

const CheckContextNodeSchema = t.union([
  CheckRunNodeSchema,
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

/**
 * Which runs supersede each other: a commit status by its context, a check run
 * by its name, workflow and event, as `gh` told them apart.
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

/**
 * A check run's suite and its own id, which order it among the other runs. A
 * missing id counts as 0, as `pr-manager` counts it; GitHub gives every check
 * run and suite one.
 */
const rankOf = (run: CheckRunNode): CheckRunRank =>
  ({
    checkSuiteId: run.checkSuite?.databaseId ?? 0,
    id: run.databaseId ?? 0,
  }) as const;

/**
 * Whether `context` is a later run than `kept`, which shares its key.
 *
 * Check runs are ranked by `pr-report-core`'s `outranks`, the order
 * `statesFromCheckRuns` ranks them in: by check suite, then within one suite by
 * their own id, which a re-run of a job gets a new and greater one of. Not by
 * when they started: a run still queued has no start, and ranking it as the
 * oldest let the red it replaces speak for it (#3334). Nor as the newest, since
 * a run cancelled before it started may not have one either.
 *
 * A commit status shares a key only with a commit status, and its one time is
 * when it was set.
 */
const supersedes = (
  context: CheckContextNode,
  kept: CheckContextNode,
): boolean =>
  context.__typename === 'StatusContext'
    ? kept.__typename === 'StatusContext' && context.createdAt > kept.createdAt
    : kept.__typename === 'CheckRun' && outranks(rankOf(context), rankOf(kept));

/**
 * Of each unfinished check suite that has a re-run in it — a job with an
 * earlier run in the same suite — the greatest id of such a re-run.
 */
const latestReRunBySuite = (
  contexts: readonly CheckContextNode[],
): ReadonlyMap<number, number> => {
  const mut_firstIdByJob = new Map<string, number>();

  const mut_latestReRun = new Map<number, number>();

  const runs = contexts.filter(
    (context): context is CheckRunNode =>
      context.__typename === 'CheckRun' &&
      context.checkSuite !== null &&
      context.checkSuite.status !== 'COMPLETED',
  );

  for (const run of runs) {
    const { checkSuiteId, id } = rankOf(run);

    const job = `${checkSuiteId}:${run.name}` as const;

    mut_firstIdByJob.set(job, Math.min(id, mut_firstIdByJob.get(job) ?? id));
  }

  for (const run of runs) {
    const { checkSuiteId, id } = rankOf(run);

    if (id > (mut_firstIdByJob.get(`${checkSuiteId}:${run.name}`) ?? id)) {
      mut_latestReRun.set(
        checkSuiteId,
        Math.max(id, mut_latestReRun.get(checkSuiteId) ?? id),
      );
    }
  }

  return mut_latestReRun;
};

/**
 * Of the runs of each {@link keyOf}, the latest, in the order GitHub listed
 * them.
 */
const latestOf = (
  contexts: readonly CheckContextNode[],
): readonly CheckContextNode[] => {
  const mut_latest = new Map<string, CheckContextNode>();

  for (const context of contexts) {
    const key = keyOf(context);

    const kept = mut_latest.get(key);

    if (kept === undefined || supersedes(context, kept)) {
      mut_latest.set(key, context);
    }
  }

  const survivors = new Set(mut_latest.values());

  return contexts.filter((context) => survivors.has(context));
};

/**
 * A check run's conclusion, or its status while it runs, or a commit status's
 * state, in `gh pr checks`'s buckets. Anything else — `QUEUED`, `IN_PROGRESS`,
 * `PENDING`, `EXPECTED`, `STALE` — is waited for.
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

/** {@link ReportedCheck}'s `reRunAfter`, of a check run. */
const isBeforeReRun = (
  run: CheckRunNode,
  latestReRun: ReadonlyMap<number, number>,
): boolean => {
  const { checkSuiteId, id } = rankOf(run);

  return (latestReRun.get(checkSuiteId) ?? 0) > id;
};

const reportedCheckOf = (
  context: CheckContextNode,
  latestReRun: ReadonlyMap<number, number>,
): ReportedCheck =>
  context.__typename === 'StatusContext'
    ? ({
        name: context.context,
        bucket: bucketOf(context.state),
        link: context.targetUrl ?? '',
        startedAt: context.createdAt,
        completedAt: context.createdAt,
        workflow: '',
        reRunAfter: false,
      } as const)
    : ({
        name: context.name,
        bucket: bucketOf(
          context.status === 'COMPLETED'
            ? (context.conclusion ?? '')
            : context.status,
        ),
        link: context.detailsUrl ?? '',
        startedAt: context.startedAt ?? undefined,
        completedAt: context.completedAt ?? undefined,
        workflow: context.checkSuite?.workflowRun?.workflow.name ?? '',
        reRunAfter: isBeforeReRun(context, latestReRun),
      } as const);

/**
 * The latest run of each {@link keyOf}, in the order GitHub listed them, each
 * beside what it reports.
 */
const latestChecksOf = (
  contexts: readonly CheckContextNode[],
): readonly (readonly [CheckContextNode, ReportedCheck])[] => {
  const reRuns = latestReRunBySuite(contexts);

  return latestOf(contexts).map(
    (context) => [context, reportedCheckOf(context, reRuns)] as const,
  );
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
 * Whether a later run may still replace the check: a re-run in its own workflow
 * run ({@link ReportedCheck}'s `reRunAfter`), or a newer run of its own
 * workflow still running. Run ids only grow, so a higher one is a later run; a
 * commit status has no workflow and no run, and is never superseded.
 */
const isSuperseded = (
  check: ReportedCheck,
  running: readonly RunningCheck[],
): boolean => {
  if (check.reRunAfter) {
    return true;
  }

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

/** {@link epochMsOf} of a time a check may not have reached. */
const msOf = (timestamp: string | undefined): number | undefined =>
  timestamp === undefined ? undefined : epochMsOf(timestamp);

/**
 * When the earliest check still running started, in milliseconds; `undefined`
 * when nothing is running or no start time can be read.
 */
const earliestStart = (
  running: readonly RunningCheck[],
): number | undefined => {
  const starts = Arr.generate(function* () {
    for (const { startedAt } of running) {
      const ms = msOf(startedAt);

      if (ms !== undefined) {
        yield ms;
      }
    }
  });

  return Arr.isNonEmpty(starts) ? Math.min(...starts) : undefined;
};
