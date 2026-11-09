/**
 * What the merge is waiting for, read from the head commit's checks and judged
 * against the contexts the ruleset requires.
 */

import {
  combineContextStates,
  epochMsOf,
  isOfEarlierAttempt,
  outranks,
  RE_RUN_GRACE_MS,
  readWorkflowRound,
  summarizeChecks as summarizeContexts,
  type CheckRunRank,
  type ContextState,
  type WorkflowRound,
} from 'pr-report-core';
import { Arr, Num, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  currentEpochMs,
  graphqlQuery,
  rest,
  type ApiContext,
} from '../lib/index.mjs';
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
   * Whether the check run is of an attempt of its workflow run before the one
   * still going (`pr-report-core`'s `isOfEarlierAttempt`): "Re-run failed jobs"
   * queues the failed jobs again, and the aggregate that needs them gets a new
   * run only once they are done, so until then the aggregate's red is the
   * attempt before's. Always `false` for a commit status, and wherever the
   * workflow runs were not read.
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
 * The head commit's checks: the ones that gate the merge, and every one that has
 * not finished. Both lists come from one answer, so that on a head whose checks
 * fit on one page they cost one request and speak of the same moment. A head with
 * more is read until two reads list the same checks (`readCheckContexts`), or
 * fails.
 */
export const readHeadChecks = async (
  api: ApiContext,
  prNumber: number,
  headSha: string,
): Promise<Result<HeadChecks, string>> => {
  const read = await readCheckContexts(api, prNumber);

  if (Result.isErr(read)) {
    return read;
  }

  const contexts = read.value;

  const plain = headChecksOf(contexts);

  // Only a red can be one a re-run will replace, so only a red costs a read:
  // one of each workflow run a required red is a job of.
  const runIds = Arr.uniq(
    plain.required
      .filter(isFailure)
      .map(({ link }) => workflowRunId(link))
      .filter((id) => id !== undefined),
  );

  if (!Arr.isNonEmpty(runIds)) {
    return Result.ok(plain);
  }

  const rounds = await readRedRounds(api, runIds);

  // Failed as the rollup read would: a poll error, not a red let through.
  if (Result.isErr(rounds)) {
    return rounds;
  }

  const held = await readHeldRuns(
    api,
    headSha,
    Arr.uniq(Array.from(rounds.value.values(), (round) => round.workflowId)),
    contexts,
  );

  if (Result.isErr(held)) {
    return held;
  }

  const checks = headChecksOf(contexts, rounds.value);

  return Result.ok({ ...checks, running: [...checks.running, ...held.value] });
};

/**
 * The workflow runs on the head, of the workflows `runs` were read for, that
 * have not finished and have no check on the head, each as a check running with
 * no start. A run a concurrency group holds behind the one it replaces has no
 * jobs until that one ends, so nothing in the rollup says a newer round is
 * coming, and the cancelled jobs of the round before read as this round's
 * failures (#3703). Listed as running, it says the round is not over, and its
 * greater run id marks the reds of its workflow's earlier run as superseded
 * ({@link summarizeChecks}). Only for `RE_RUN_GRACE_MS` after it was created,
 * read at `nowMs`, as a re-run holds a red back, so that a run GitHub never
 * starts does not hold one for good.
 */
export const heldRunsOf = (
  runs: readonly WorkflowRunListed[],
  contexts: readonly CheckContextNode[],
  nowMs: number = currentEpochMs(),
): readonly RunningCheck[] => {
  const onHead = new Set(
    contexts
      .map((context) =>
        context.__typename === 'CheckRun'
          ? workflowRunId(context.detailsUrl ?? '')
          : undefined,
      )
      .filter((id) => id !== undefined),
  );

  return runs
    .filter(({ id, status, created_at: createdAt }) => {
      const createdMs = epochMsOf(createdAt);

      return (
        status !== 'completed' &&
        !onHead.has(id) &&
        createdMs !== undefined &&
        nowMs - createdMs <= RE_RUN_GRACE_MS
      );
    })
    .map(({ name, html_url: url }) => ({
      name: `${name ?? 'a workflow'} (waiting to start)`,
      startedAt: undefined,
      workflow: name ?? '',
      // `workflowRunId` reads the id between slashes.
      link: `${url}/`,
    }));
};

/** One workflow run as REST lists it, as much as {@link heldRunsOf} reads. */
export type WorkflowRunListed = t.TypeOf<typeof WorkflowRunListedSchema>;

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

/**
 * The two lists of {@link HeadChecks}, from the contexts of one read and the
 * workflow runs on the commit, read at `nowMs`.
 */
export const headChecksOf = (
  contexts: readonly CheckContextNode[],
  rounds: ReadonlyMap<number, WorkflowRound> = NO_ROUNDS,
  nowMs: number = currentEpochMs(),
): HeadChecks => {
  const latest = latestChecksOf(contexts, rounds, nowMs);

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
  rounds: ReadonlyMap<number, WorkflowRound> = NO_ROUNDS,
  nowMs: number = currentEpochMs(),
): readonly ReportedCheck[] =>
  latestChecksOf(contexts, rounds, nowMs)
    .filter(([context]) => which === 'all' || context.isRequired)
    .map(([, check]) => check);

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

/** The run id in a job's link (`…/actions/runs/<id>/job/<id>`). */
export const workflowRunId = (link: string): number | undefined => {
  const id = /\/actions\/runs\/(\d+)\//u.exec(link)?.[1];

  return id === undefined
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(id), undefined);
};

/** A context of the head commit's status check rollup, as read. */
export type CheckContextNode = t.TypeOf<typeof CheckContextNodeSchema>;

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

/**
 * The workflow runs `runIds` by check suite (`pr-report-core`'s
 * `readWorkflowRound`), the REST answer that says a re-run is going on, or why
 * one could not be read.
 */
const readRedRounds = async (
  api: ApiContext,
  runIds: readonly number[],
): Promise<Result<ReadonlyMap<number, WorkflowRound>, string>> => {
  const reads = await Promise.all(
    runIds.map((runId) =>
      readWorkflowRound(runId, async (path, schema) =>
        rest(api, 'GET', path, schema),
      ),
    ),
  );

  const mut_rounds = new Map<number, WorkflowRound>();

  for (const read of reads) {
    if (Result.isErr(read)) {
      return Result.err(
        `could not read the workflow run of a red: ${read.value}`,
      );
    }

    mut_rounds.set(...read.value);
  }

  return Result.ok(mut_rounds);
};

/**
 * {@link heldRunsOf} over the runs of `workflowIds` on `headSha`, newest first,
 * or why they could not be read. The few newest are enough: a held run is the
 * one created last.
 */
const readHeldRuns = async (
  api: ApiContext,
  headSha: string,
  workflowIds: readonly number[],
  contexts: readonly CheckContextNode[],
): Promise<Result<readonly RunningCheck[], string>> => {
  const reads = await Promise.all(
    workflowIds.map(async (workflowId) =>
      rest(
        api,
        'GET',
        `/actions/workflows/${workflowId}/runs?head_sha=${headSha}&per_page=${HELD_RUNS_PAGE}`,
        WorkflowRunsListedSchema,
      ),
    ),
  );

  const mut_held: RunningCheck[] = [];

  for (const read of reads) {
    if (Result.isErr(read)) {
      return Result.err(
        `could not read the workflow runs of a red's workflow: ${read.value}`,
      );
    }

    mut_held.push(...heldRunsOf(read.value.workflow_runs, contexts));
  }

  return Result.ok(mut_held);
};

const HELD_RUNS_PAGE = 10;

const WorkflowRunListedSchema = t.record({
  id: t.number(),
  name: t.union([t.string(), t.nullType]),
  status: t.union([t.string(), t.nullType]),
  html_url: t.string(),
  created_at: t.string(),
});

const WorkflowRunsListedSchema = t.record({
  workflow_runs: t.array(WorkflowRunListedSchema),
});

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

/** Which contexts a read lists, however it ordered them, twice over if twice. */
const listedIn = (contexts: readonly CheckContextNode[]): string =>
  contexts
    .map((context) =>
      context.__typename === 'StatusContext'
        ? `status:${context.context}`
        : `run:${context.databaseId ?? context.name}`,
    )
    .toSorted()
    .join('\n');

/**
 * One read of the head commit's contexts, page by page, and whether it took more
 * than one page. A head with none reported yet — right after a push — is an empty
 * list.
 */
const readRollupPages = async (
  api: ApiContext,
  prNumber: number,
): Promise<
  Result<
    Readonly<{ contexts: readonly CheckContextNode[]; paged: boolean }>,
    string
  >
> => {
  const mut_contexts: CheckContextNode[] = [];

  let mut_after: string | undefined = undefined;

  for (const _page of Arr.seq(MAX_PAGES)) {
    const rollup = await readRollupPage(api, prNumber, mut_after);

    if (Result.isErr(rollup)) {
      return rollup;
    }

    if (rollup.value === null) {
      return Result.ok({
        contexts: mut_contexts,
        paged: mut_after !== undefined,
      });
    }

    mut_contexts.push(...rollup.value.nodes);

    const { hasNextPage, endCursor } = rollup.value.pageInfo;

    if (!hasNextPage || endCursor === null) {
      return Result.ok({
        contexts: mut_contexts,
        paged: mut_after !== undefined,
      });
    }

    mut_after = endCursor;
  }

  return Result.err(
    `#${prNumber} has more than ${MAX_PAGES * PAGE_SIZE} checks on its head`,
  );
};

/**
 * Every context of the pull request's head commit.
 *
 * One page is one answer from one moment. Pages are read at several, and a run
 * added or finishing between them can move the list under the cursor, so that a
 * context is skipped at the boundary or read twice; a pending one skipped makes
 * the round look over. So a head with several pages is read again, until two
 * reads in a row list the same contexts, and the later read is the answer.
 * Their states may differ: a job finishing takes nothing out of the list, and
 * what matters is that nothing was missed. A list that does not settle is a
 * failed read, as one that cannot be read is, rather than a part taken for the
 * whole.
 */
const readCheckContexts = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<readonly CheckContextNode[], string>> => {
  const first = await readRollupPages(api, prNumber);

  if (Result.isErr(first) || !first.value.paged) {
    return Result.map(first, ({ contexts }) => contexts);
  }

  let mut_previous = listedIn(first.value.contexts);

  for (const _read of Arr.seq(MAX_REREADS)) {
    const again = await readRollupPages(api, prNumber);

    if (Result.isErr(again)) {
      return again;
    }

    const listed = listedIn(again.value.contexts);

    if (listed === mut_previous) {
      return Result.ok(again.value.contexts);
    }

    mut_previous = listed;
  }

  return Result.err(
    `#${prNumber}: the checks on its head kept changing across ${MAX_REREADS + 1} reads of several pages`,
  );
};

type RollupPage = Readonly<{
  pageInfo: Readonly<{ hasNextPage: boolean; endCursor: string | null }>;
  nodes: readonly CheckContextNode[];
}>;

const PAGE_SIZE = 100;

const MAX_PAGES = 10;

/** How many times a head of several pages is read after the first. */
const MAX_REREADS = 3;

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
  rounds: ReadonlyMap<number, WorkflowRound>,
  nowMs: number,
): boolean =>
  run.status === 'COMPLETED' &&
  run.completedAt !== null &&
  isOfEarlierAttempt(
    run.completedAt,
    rounds.get(rankOf(run).checkSuiteId),
    nowMs,
  );

const reportedCheckOf = (
  context: CheckContextNode,
  rounds: ReadonlyMap<number, WorkflowRound>,
  nowMs: number,
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
        reRunAfter: isBeforeReRun(context, rounds, nowMs),
      } as const);

/**
 * The latest run of each {@link keyOf}, in the order GitHub listed them, each
 * beside what it reports.
 */
const latestChecksOf = (
  contexts: readonly CheckContextNode[],
  rounds: ReadonlyMap<number, WorkflowRound>,
  nowMs: number,
): readonly (readonly [CheckContextNode, ReportedCheck])[] =>
  latestOf(contexts).map(
    (context) => [context, reportedCheckOf(context, rounds, nowMs)] as const,
  );

const NO_ROUNDS: ReadonlyMap<number, WorkflowRound> = new Map<
  number,
  WorkflowRound
>();

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
