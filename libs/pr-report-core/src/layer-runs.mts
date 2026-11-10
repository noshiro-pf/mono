/**
 * Where the checks `unblock-prs` dispatches on a queue layer stand, from the
 * runs dispatched on the layer's commit. The worker and the Pull Requests
 * Manager both read the runs with the same REST request
 * ({@link layerRunsRequest}) and judge them by this, the worker to decide what
 * to dispatch, release or set aside and the page to draw each layer, so that
 * the two cannot disagree about a layer.
 */

import { Arr, Optional } from 'ts-data-forge';
import type { LayerStatus } from './layer-stack.mjs';

/**
 * Where the checks on a layer stand, by the latest dispatched run of each
 * workflow, so that a cancelled run dispatched again, or a round the next one
 * superseded, is not counted:
 *
 * - `red` once one of them has failed, whatever else is going;
 * - `not-dispatched` while a workflow has no run, or a cancelled one, which the
 *   worker dispatches again — unless {@link LayerRunsVerdict.cancelledTooOften};
 * - `green` once every one has finished;
 * - `running` otherwise, `queued` until a reader of the jobs says otherwise.
 */
export const layerRunsVerdict = <R extends DispatchedRun>(
  runs: readonly R[],
  workflows: readonly string[],
): LayerRunsVerdict<R> => {
  // A layer has a handful of workflows and a few dozen runs at most, so a
  // filter per workflow costs nothing a single grouping pass would save.
  const byWorkflow = workflows.map((workflow) => {
    const ofWorkflow = runs.filter((each) =>
      each.path.endsWith(`/${workflow}`),
    );

    const run = Optional.unwrap(Arr.maxBy(ofWorkflow, ({ id }) => id));

    return {
      workflow,
      runs: ofWorkflow,
      run,
    } as const;
  });

  // No run, or a cancelled one, which the worker dispatches again unless it has
  // been cancelled too often.
  const toDispatch = byWorkflow.filter(
    ({ run }) => run === undefined || run.conclusion === 'cancelled',
  );

  // A loop rather than a `find`, so that the compiler, not a hand-written type
  // predicate, proves the run there.
  const failed = Arr.generate(function* () {
    for (const { workflow, run } of byWorkflow) {
      if (run !== undefined && FAILED_CONCLUSIONS.has(run.conclusion ?? '')) {
        yield { workflow, run } as const;
      }
    }
  }).at(0);

  return {
    status:
      failed !== undefined
        ? {
            kind: 'red',
            name: failed.workflow,
            link: failed.run.html_url,
          }
        : Arr.isNonEmpty(toDispatch)
          ? { kind: 'not-dispatched' }
          : byWorkflow.every(({ run }) => run?.status === 'completed')
            ? { kind: 'green' }
            : // Whether every job has started is the jobs' to say, which only
              // a reader of them can: until one has, it is taken that not.
              { kind: 'running', queued: true },
    latest: byWorkflow.map(({ workflow, run }) => ({ workflow, run })),
    missing: toDispatch.map(({ workflow }) => workflow),
    cancelledTooOften: toDispatch.some(({ runs: ofWorkflow }) =>
      cancelledTooOften(ofWorkflow.map(({ conclusion }) => conclusion)),
    ),
  };
};

/**
 * Whether a workflow's runs on a layer, by their conclusions, have been
 * cancelled as often as it may be dispatched. A cancelled run is dispatched
 * again, and something that keeps cancelling them would otherwise hold the first
 * candidate for ever, with no run lasting long enough to be given up on.
 */
export const cancelledTooOften = (
  conclusions: readonly (string | null)[],
): boolean =>
  Arr.isMinLengthArray(
    MAX_DISPATCHES,
    conclusions.filter((conclusion) => conclusion === 'cancelled'),
  );

/**
 * The REST request that reads the runs dispatched on a layer's commit `tip`:
 * the repository's `route`, and its `query`.
 */
export const layerRunsRequest = (
  tip: string,
): Readonly<{
  route: string;
  query: Readonly<{ head_sha: string; event: string; per_page: string }>;
}> =>
  ({
    route: '/actions/runs',
    query: {
      head_sha: tip,
      event: 'workflow_dispatch',
      per_page: LAYER_RUNS_PAGE_SIZE.toString(),
    },
  }) as const;

/**
 * A workflow run dispatched on a layer's commit, in REST's spelling: `status`
 * `completed` once it has finished, `conclusion` such as `success` or
 * `cancelled` then.
 */
// Each reader writes its own schema of the answer, the worker's reading more of
// it; both are held to this type, the worker's by `layerRunsVerdict`'s bound
// and the page's by its annotation, so that neither can read less of a run.
export type DispatchedRun = Readonly<{
  id: number;
  /** The workflow's file, `.github/workflows/<name>`. */
  path: string;
  status: string;
  conclusion: string | null;
  html_url: string;
}>;

/** What {@link layerRunsVerdict} decides. */
export type LayerRunsVerdict<R extends DispatchedRun> = Readonly<{
  /** `red` names the first latest run that failed, and links it. */
  status: LayerStatus;
  /** Each workflow's latest run, in the order the workflows were given. */
  latest: readonly Readonly<{ workflow: string; run: R | undefined }>[];
  /** The workflows with no run, or a cancelled one, to dispatch again. */
  missing: readonly string[];
  /** One of {@link missing} has been cancelled too often to dispatch again. */
  cancelledTooOften: boolean;
}>;

/** How many runs of a workflow a layer may see cancelled. */
export const MAX_DISPATCHES = 3;

/**
 * `unblock-prs`'s configuration, relative to the repository root, whose
 * `speculate.workflows` names what it dispatches on each layer.
 */
export const UNBLOCK_PRS_CONFIG_PATH = '.github/unblock-prs.json';

/**
 * More than a layer ever has: one run a workflow, and a cancelled one dispatched
 * again at most {@link MAX_DISPATCHES} times.
 */
const LAYER_RUNS_PAGE_SIZE = 100;

/** A run's conclusions that make its layer red. */
const FAILED_CONCLUSIONS: ReadonlySet<string> = new Set<string>([
  'failure',
  'timed_out',
  'startup_failure',
  'action_required',
]);
