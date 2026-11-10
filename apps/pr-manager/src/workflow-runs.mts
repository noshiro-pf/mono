/**
 * The workflow runs that are still going, or that are waiting on someone:
 * what the repository's Actions tab lists under
 * `is:in_progress is:queued is:neutral is:stale is:waiting is:action_required`
 * ({@link actionsQueryUrl}).
 *
 * **REST rather than GraphQL**, because GraphQL has no way to list a
 * repository's workflow runs by state: a run is reached there only through the
 * commit or the check suite it belongs to. REST lists them by one state at a
 * time, so a read is {@link RUN_STATES} requests, sent at once.
 *
 * **What it costs is REST's budget, not GraphQL's** — two separate 5,000 an
 * hour on a personal token — so it is never added to the budget the header
 * shows (`rate-limit.mts`). Each request goes out as `no-cache` rather than
 * `no-store`: the browser keeps the answer and asks GitHub whether it has
 * changed, and GitHub does not count a `304` against the budget. A state with
 * nothing in it, which is most of them most of the time, answers the same every
 * read.
 *
 * **Read beside the report, not as a part of it** (`store/reader.mts`): a read
 * of this that fails says so in its own block and leaves the merge order alone,
 * since it is a different API with a different budget.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { repositoryUrl, type ReportSource } from './constants.mjs';
import { askGitHub, getJson, type RestFetch } from './rest-json.mjs';

/**
 * The states the Actions tab's filter names, in the order the block's badges
 * explain them. `neutral` and `stale` are conclusions rather than states, which
 * REST's `status` parameter takes all the same.
 */
export type RunState =
  | 'in_progress'
  | 'queued'
  | 'waiting'
  | 'action_required'
  | 'neutral'
  | 'stale';

export const RUN_STATES = [
  'in_progress',
  'queued',
  'waiting',
  'action_required',
  'neutral',
  'stale',
] as const satisfies readonly RunState[];

/** One workflow run, as the block lists it. */
export type WorkflowRun = Readonly<{
  id: number;
  /** The workflow's name. */
  workflow: string;
  /** What GitHub titles the run with: the commit's or the pull request's. */
  title: string;
  runNumber: number;
  url: string;
  /** What started it: `push`, `pull_request`, `schedule`, … */
  event: string;
  /** `undefined` for a run that is not of a branch. */
  branch: string | undefined;
  /** `ghost` when the account is gone. */
  actor: string;
  /** Which of {@link RUN_STATES} it was listed under. */
  state: RunState;
  createdAt: string;
}>;

export type WorkflowRunList = Readonly<{
  /** Newest first, as the Actions tab lists them. */
  runs: readonly WorkflowRun[];
  /**
   * How many GitHub says there are, with a run listed under two states counted
   * once, which is more than {@link runs} only when a state has more than
   * {@link RUNS_PER_STATE} (or, then, when a run met past a page moved state).
   */
  totalCount: number;
}>;

export type WorkflowRunsRequest = Readonly<{
  token: string;
  fetchImpl?: RestFetch;
}>;

/**
 * As many as a page holds. A state with more than this is a repository with
 * something stuck, and the block says how many it is not listing.
 */
export const RUNS_PER_STATE = 100;

/**
 * Every run in one of {@link RUN_STATES}, or a sentence a reader can act on.
 * One state that fails fails the read: a list missing a state would be read as
 * nothing being in it.
 */
export const loadWorkflowRuns = async (
  source: ReportSource,
  request: WorkflowRunsRequest,
): Promise<Result<WorkflowRunList, string>> => {
  const { token, fetchImpl = askGitHub } = request;

  const answers = await Promise.all(
    RUN_STATES.map(async (state) => readState(source, state, token, fetchImpl)),
  );

  const failure = answers.find((answer) => Result.isErr(answer));

  if (failure !== undefined) {
    return failure;
  }

  const lists = Arr.generate(function* () {
    for (const answer of answers) {
      if (Result.isOk(answer)) {
        yield answer.value;
      }
    }
  });

  const listed = lists.flatMap(({ runs: ofState }) => ofState);

  // A run that changed state between two of the requests can be met in both; it
  // is listed once, under the first state that found it, and counted once: each
  // state's count has it, so what was listed twice comes off the sum. One met
  // past a state's page is not seen twice, and stays counted twice.
  const runs = Arr.uniqBy(listed, ({ id }) => id).toSorted(newestFirst);

  return Result.ok({
    runs,
    totalCount:
      Arr.sum(lists.map(({ totalCount }) => totalCount)) -
      (listed.length - runs.length),
  });
};

/** The repository's Actions tab, filtered to what this block lists. */
export const actionsQueryUrl = (source: ReportSource): string => {
  const params = new URLSearchParams({
    query: RUN_STATES.map((state) => `is:${state}`).join(' '),
  });

  return `${repositoryUrl(source)}/actions?${params.toString()}` as const;
};

/** By when it was made, and by id within the same second. */
const newestFirst = (a: WorkflowRun, b: WorkflowRun): number => {
  const byTime = b.createdAt.localeCompare(a.createdAt);

  return byTime === 0 ? b.id - a.id : byTime;
};

const runOf = (run: t.TypeOf<typeof RunSchema>, state: RunState): WorkflowRun =>
  ({
    id: run.id,
    workflow: run.name ?? '',
    title: run.display_title,
    runNumber: run.run_number,
    url: run.html_url,
    event: run.event,
    branch: run.head_branch ?? undefined,
    actor: run.actor?.login ?? 'ghost',
    state,
    createdAt: run.created_at,
  }) as const;

const readState = async (
  source: ReportSource,
  state: RunState,
  token: string,
  fetchImpl: RestFetch,
): Promise<Result<WorkflowRunList, string>> => {
  const read = await getJson(
    `https://api.github.com/repos/${source.owner}/${source.repo}/actions/runs?status=${state}&per_page=${RUNS_PER_STATE}`,
    RunsPageSchema,
    'the workflow runs',
    token,
    fetchImpl,
  );

  return Result.map(read, ({ workflow_runs, total_count }) => ({
    runs: workflow_runs.map((run) => runOf(run, state)),
    totalCount: total_count,
  }));
};

const RunSchema = t.record({
  id: t.number(),
  name: t.union([t.string(), t.nullType]),
  display_title: t.string(),
  run_number: t.number(),
  html_url: t.string(),
  event: t.string(),
  head_branch: t.union([t.string(), t.nullType]),
  created_at: t.string(),
  actor: t.optional(t.union([t.record({ login: t.string() }), t.nullType])),
});

const RunsPageSchema = t.record({
  total_count: t.number(),
  workflow_runs: t.array(RunSchema),
});
