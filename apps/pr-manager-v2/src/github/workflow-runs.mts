import {
  allRead,
  restGet,
  type Read,
  type ReadContext,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/** A workflow run not yet over, as the Running workflows block draws it. */
export type RunningWorkflow = Readonly<{
  id: number;
  /** The run's title: the commit message's first line or the PR's title. */
  title: string;
  workflow: string;
  runNumber: number;
  event: string;
  branch: string;
  /** The state it was listed under: `in_progress`, `queued`, `action_required`, … */
  status: string;
  startedAt: string;
  actor: string;
  url: string;
}>;

/**
 * Every workflow run of the repository not yet over (spec §9), newest first: the
 * first page (100) of each state GitHub keeps such runs in, read over REST with
 * `no-cache`, so an unchanged list is a free 304. One page, as v1 read: three
 * of the states (`action_required`, `neutral`, `stale`) are conclusions that
 * match runs from the whole history, a list that only grows.
 *
 * A state with more than a page says so (`complete: false`, from the answer's
 * `total_count`) rather than passing its first page for the whole.
 *
 * A run is labelled with the state it was listed under: for those three,
 * GitHub's own `status` is `completed`, which says nothing.
 */
export const readRunningWorkflows = async (
  context: ReadContext,
): Promise<Read<RunningWorkflows>> =>
  Result.map(
    allRead(
      await Promise.all(
        RUNNING_STATES.map(async (state) =>
          Result.map(
            await restGet(
              context,
              `the ${state.replaceAll('_', ' ')} workflow runs`,
              `/actions/runs?status=${state}&per_page=100`,
              WorkflowRunsSchema,
            ),
            (body) => ({
              runs: body.workflow_runs.map((run) => runOf(run, state)),
              complete: body.total_count <= body.workflow_runs.length,
            }),
          ),
        ),
      ),
    ),
    (lists) => ({
      runs: Arr.uniqBy(
        lists.flatMap(({ runs }) => runs),
        (run) => run.id,
      ).toSorted((a, b) => b.startedAt.localeCompare(a.startedAt)),
      complete: lists.every(({ complete }) => complete),
    }),
  );

/** The runs read, and whether every state's list fit in its page. */
export type RunningWorkflows = Readonly<{
  runs: readonly RunningWorkflow[];
  complete: boolean;
}>;

/** The states a run waits or works in, as GitHub's Actions tab filters them. */
export const RUNNING_STATES = [
  'in_progress',
  'queued',
  'waiting',
  'action_required',
  'neutral',
  'stale',
] as const;

const WorkflowRunSchema = t.record({
  id: t.number(),
  name: t.union([t.string(), t.nullType]),
  display_title: t.string(),
  run_number: t.number(),
  event: t.string(),
  head_branch: t.union([t.string(), t.nullType]),
  run_started_at: t.union([t.string(), t.nullType]),
  created_at: t.string(),
  html_url: t.string(),
  actor: t.union([t.record({ login: t.string() }), t.nullType]),
});

const WorkflowRunsSchema = t.record({
  total_count: t.number(),
  workflow_runs: t.array(WorkflowRunSchema),
});

const runOf = (
  run: t.TypeOf<typeof WorkflowRunSchema>,
  listedAs: string,
): RunningWorkflow =>
  ({
    id: run.id,
    title: run.display_title,
    workflow: run.name ?? '',
    runNumber: run.run_number,
    event: run.event,
    branch: run.head_branch ?? '',
    status: listedAs,
    startedAt: run.run_started_at ?? run.created_at,
    actor: run.actor?.login ?? '',
    url: run.html_url,
  }) as const;
