/**
 * Checking ahead (`spec/worker.md`, "Checking ahead"): what the worker does
 * with the `queue/pr-<N>` layers, decided from the snapshot alone, so that the
 * worker and the Pull Requests Manager, which draws each layer by
 * {@link layerStandings}, cannot disagree about the stack.
 *
 * The leading candidates are stacked on the default branch, one commit each,
 * and the configured workflows dispatched on each layer diff it against the
 * default branch as a pull request's run does. When the first candidate's turn
 * comes, its layer has a verdict, and its rebased head has the layer's tree, so
 * the gate reuses that verdict. Nothing is remembered: the branches say what
 * was built, by the trees they stand on, and the runs on them how far each got.
 */

import { Arr, Optional, Result } from 'ts-data-forge';
import {
  isVersionBranch,
  numberOfQueueLayerBranch,
  queueLayerTrailer,
  type QueueLayerOrigin,
} from '../conventions/index.mjs';
import type {
  HeadChecks,
  QueueLayerFacts,
  WorkflowRoundFacts,
} from '../snapshot/index.mjs';
import type { QueueStanding } from './standing.mjs';

/**
 * Where the checks on a layer stand, by the latest dispatched run of each of
 * `workflows`, so that a cancelled run dispatched again is not counted:
 *
 * - `red` once one of them has failed, whatever else is going;
 * - `not-dispatched` while a workflow has no run, or a cancelled one, which the
 *   worker dispatches again — unless it was {@link cancelledTooOften};
 * - `green` once every one has finished;
 * - `running` otherwise: `queued` while a run has a job still to start or its
 *   gate still going (`checks`, the layer's check runs, say which), and also
 *   while the run itself has not started.
 */
export const layerRunsVerdict = (
  checks: HeadChecks,
  workflows: readonly string[],
): LayerRunsVerdict => {
  const dispatched = checks.rounds.filter(isQueueLayerRun);

  // A layer has a handful of workflows and a few dozen runs at most, so a
  // filter per workflow costs nothing a single grouping pass would save.
  const byWorkflow = workflows.map((workflow) => {
    const runs = dispatched.filter(({ path }) => path.endsWith(`/${workflow}`));

    return {
      workflow,
      runs,
      run: Optional.unwrap(Arr.maxBy(runs, ({ runId }) => runId)),
    } as const;
  });

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

  const latest = byWorkflow.map(({ workflow, run }) => ({ workflow, run }));

  const going = Arr.generate(function* () {
    for (const { run } of latest) {
      if (run !== undefined && !run.completed) {
        yield run;
      }
    }
  });

  const starting = going.map((run) => startingOf(run, checks));

  return {
    status:
      failed !== undefined
        ? { kind: 'red', name: failed.workflow, link: failed.run.url }
        : Arr.isNonEmpty(toDispatch)
          ? { kind: 'not-dispatched' }
          : !Arr.isNonEmpty(going)
            ? { kind: 'green' }
            : {
                kind: 'running',
                queued: starting.some((each) => each.starting),
              },
    latest,
    missing: toDispatch.map(({ workflow }) => workflow),
    cancelledTooOften: toDispatch.some(({ runs }) =>
      cancelledTooOften(runs.map(({ conclusion }) => conclusion)),
    ),
    since: {
      dispatched: earliest(going.map(({ createdAt }) => Date.parse(createdAt))),
      waiting: earliest(
        going
          .filter((_, index) => starting[index]?.forRunner === true)
          .map(({ createdAt }) => Date.parse(createdAt)),
      ),
      oldestJobRunning: earliest(
        starting
          .map(({ oldestRunning }) => oldestRunning)
          .filter((at) => at !== undefined),
      ),
    },
  };
};

/**
 * Whether a workflow run is one the worker dispatched on a queue layer: the one
 * place that says so (#3628), by the branch the run records and how it was
 * started, so that no reader takes a layer's run for a pull request's or the
 * default branch's.
 */
export const isQueueLayerRun = (
  run: Readonly<{ event: string; headBranch: string }>,
): boolean =>
  run.event === 'workflow_dispatch' &&
  numberOfQueueLayerBranch(run.headBranch) !== undefined;

/**
 * Whether a workflow's runs on a layer, by their conclusions, have been
 * cancelled as often as it may be dispatched: something that keeps cancelling
 * them would otherwise hold the first candidate for ever, with no run lasting
 * long enough to be given up on.
 */
export const cancelledTooOften = (
  conclusions: readonly (string | undefined)[],
): boolean =>
  Arr.isMinLengthArray(
    MAX_DISPATCHES,
    conclusions.filter((conclusion) => conclusion === 'cancelled'),
  );

/**
 * What to do this cycle with the layers that stand, `statuses` in their order:
 *
 * - **A red first layer** names its own pull request, which is set aside. Only
 *   the first: a layer above it failed on top of pull requests that have not
 *   merged and may not, and it is judged once it is first.
 * - **Every layer above a red one over green ones**, which carries it, is
 *   dropped, its runs cancelled to free their runners.
 * - **The next layer is dispatched** only once the layers below are green, or
 *   have finished their gate and started every job, and never on a red layer.
 * - **The first candidate is released** when its layer is green, and also when
 *   it has none to wait for (not stacked, or not buildable): the release then
 *   runs its checks, or finds the conflict, as without checking ahead.
 */
export const decideSpeculation = ({
  layers,
  statuses,
  firstCandidate,
}: Readonly<{
  layers: readonly QueueLayerOrigin[];
  statuses: readonly LayerStatus[];
  firstCandidate: number | undefined;
}>): SpeculationDecision => {
  const { red, dropFrom, dispatch } = stackOf(statuses);

  const first = layers[0];

  const redFirst =
    first !== undefined && red?.index === 0
      ? ({ ...first, name: red.name, link: red.link } as const)
      : undefined;

  return {
    setAside: redFirst,
    dropFrom,
    dispatch,
    release:
      firstCandidate !== undefined &&
      redFirst === undefined &&
      (first?.number !== firstCandidate || statuses[0]?.kind === 'green'),
  };
};

/**
 * What each layer that stands is to the worker, by {@link decideSpeculation}'s
 * decision, so that what the page says of a layer is what the worker does:
 *
 * - `set-aside` — red and first, its pull request set aside;
 * - `red` — red but not first, judged once it is;
 * - `dropped` — above a red one over green ones, cleaned up;
 * - `stalled` — a workflow cancelled too often to dispatch again;
 * - `to-dispatch` — the layer the worker dispatches next;
 * - `waits` — not dispatched, waiting for the layers below to start every job;
 * - `running` and `green` as their checks are.
 */
export const layerStandings = (
  layers: readonly Readonly<{
    status: LayerStatus;
    cancelledTooOften: boolean;
  }>[],
): readonly LayerStanding[] => {
  const { dropFrom, dispatch } = stackOf(layers.map(({ status }) => status));

  return layers.map(({ status, cancelledTooOften: stalled }, index) => {
    if (dropFrom !== undefined && index >= dropFrom) {
      return 'dropped';
    }

    switch (status.kind) {
      case 'red':
        return index === 0 ? 'set-aside' : 'red';

      case 'not-dispatched':
        return stalled
          ? 'stalled'
          : index === dispatch
            ? 'to-dispatch'
            : 'waits';

      case 'running':
      case 'green':
        return status.kind;
    }
  });
};

/**
 * Whether anything may be built on the layers that stand, `statuses` in their
 * order: not on a red one over green ones, whose layers above are dropped.
 */
export const mayBuildAbove = (statuses: readonly LayerStatus[]): boolean =>
  firstRedOverGreen(statuses) === undefined;

/**
 * Whether a pull request can be stacked: not the version pull request
 * (`release.yml` rebuilds it from the tip, and it is never rebased), not one
 * only a bypass merges (it waits for a person, and every layer above it would
 * wait too), not a fork's.
 */
export const isStackable = (
  pr: LayerCandidate,
  defaultBranch: string,
): boolean =>
  !isVersionBranch(pr.headRef, defaultBranch) && !pr.bypass && !pr.fromFork;

/**
 * The layers each built branch holds, for those whose trailer names a pull
 * request: a branch without one is no layer, and is dropped like a stale one.
 */
export const builtLayersOf = (
  layers: readonly QueueLayerFacts[],
): readonly BuiltLayer[] =>
  Arr.generate(function* () {
    for (const layer of layers) {
      if (layer.origin !== undefined) {
        yield {
          number: layer.origin.number,
          head: layer.origin.builtFromHead,
          branch: layer.branch,
          tip: layer.sha,
          tree: layer.tree,
          parent: layer.parent,
          parentTree: layer.parentTree,
          builtAt: Date.parse(layer.committedAt),
          checks: layer.checks,
        } as const;
      }
    }
  });

/**
 * The candidates, in the queue's order, that stay ahead of it, in the order
 * they were stacked. The kept stack follows the layers from the base's tree up,
 * each the one whose pull request is still a candidate at the head it was built
 * from; it stops at the first that is not, that can no longer be stacked, that
 * `mayStayAhead` refuses (one released and left green, which the order puts
 * last), or that the order puts after the version pull request. Of two stacks on
 * one tree the one with the layer built last is kept, and of two built in the
 * same second the longer.
 */
export const stackedAhead = <P extends LayerCandidate>(
  candidates: readonly P[],
  built: readonly BuiltLayer[],
  baseTree: string,
  context: Readonly<{
    mayStayAhead: (pr: P) => boolean;
    defaultBranch: string;
  }>,
): readonly P[] => {
  const release = candidates.findIndex(({ headRef }) =>
    isVersionBranch(headRef, context.defaultBranch),
  );

  return keptStack(
    candidates,
    built,
    { tree: baseTree, tip: undefined },
    (pr) =>
      context.mayStayAhead(pr) &&
      isStackable(pr, context.defaultBranch) &&
      (release === -1 || candidates.indexOf(pr) < release),
  ).stack;
};

/**
 * The layers to have: the leading pull requests of `order`, the order checking
 * ahead keeps ({@link withStackedAbove}), up to `depth` and up to the first
 * that cannot be stacked, which is released on its own once the layers before
 * it have merged.
 *
 * One stacked on another pull request (`stackedOn`, child to parent) is built
 * from that one's head, its `upstream`: its own commits are the ones after it.
 * It cannot be stacked below that one's layer, which carries what it builds on.
 * Any other is built from `mergedUpstream` when it gives one — the head of the
 * pull request it was stacked on, which GitHub moved it off onto the default
 * branch as that one merged, while its head still contains it — and otherwise
 * from its merge base with the default branch.
 */
export const desiredLayers = (
  order: readonly LayerCandidate[],
  context: Readonly<{
    defaultBranch: string;
    depth: number;
    stackedOn: ReadonlyMap<number, number>;
    mergedUpstream: (number: number) => string | undefined;
  }>,
): readonly LayerToBuild[] => {
  const unstackable = order.findIndex(
    (pr, index) =>
      !isStackable(pr, context.defaultBranch) ||
      !hasParentBelow(pr.number, order.slice(0, index), context.stackedOn),
  );

  return order
    .slice(0, unstackable === -1 ? undefined : unstackable)
    .slice(0, context.depth)
    .map(({ number, headSha }, _, taken) => {
      const parent = context.stackedOn.get(number);

      return {
        number,
        head: headSha,
        upstream:
          parent === undefined
            ? context.mergedUpstream(number)
            : taken.find((pr) => pr.number === parent)?.headSha,
      } as const;
    });
};

/**
 * The candidates in their order, each followed by the queued pull requests
 * stacked on it ({@link stackedLayerParent}), and those by theirs in turn, the
 * ones on one pull request in number order: the order in which checking ahead
 * stacks them. One stacked on a pull request is checked on top of it but
 * released only once that one has merged and GitHub has moved it onto the
 * default branch, when it is a candidate of its own. What is stacked on no
 * candidate is left out, and each is taken once, whatever cycle the bases make.
 */
export const withStackedAbove = <P extends Readonly<{ number: number }>>(
  candidates: readonly P[],
  stackedAbove: readonly StackedAbove<P>[],
): readonly P[] => {
  const mut_taken = new Set<number>(candidates.map(({ number }) => number));

  const above = (number: number): readonly P[] =>
    stackedAbove
      .filter(({ on }) => on === number)
      .map(({ pr }) => pr)
      .toSorted((a, b) => a.number - b.number)
      .flatMap((pr) => {
        if (mut_taken.has(pr.number)) {
          return [];
        }

        mut_taken.add(pr.number);

        return Arr.toUnshifted(pr)(above(pr.number));
      });

  return candidates.flatMap((pr) => Arr.toUnshifted(pr)(above(pr.number)));
};

/**
 * The layers, each whose pull request's head has moved to a commit with the
 * layer's tree (`heads`, each such pull request's current head and its tree)
 * followed to that head: it is still that pull request's layer. Releasing a
 * pull request rebases it and restacks the one stacked on it
 * ({@link withStackedAbove}), whose layer, built on the first's, already has
 * the tree its new head has; dropped, its runs would be cancelled just as its
 * turn comes. Any other moved head is the pull request's to check again. The
 * worker reads the layers this way, and so must every reader of its order.
 */
export const withMovedHeads = <
  L extends Readonly<{ number: number; head: string; tree: string }>,
>(
  built: readonly L[],
  heads: ReadonlyMap<number, Readonly<{ head: string; tree: string }>>,
): readonly L[] =>
  built.map((layer) => {
    const moved = heads.get(layer.number);

    return moved !== undefined &&
      moved.head !== layer.head &&
      moved.tree === layer.tree
      ? { ...layer, head: moved.head }
      : layer;
  });

/**
 * The pull request a queued one is stacked on, when it may be checked right
 * above that one's layer ({@link withStackedAbove}): stacked, on no
 * `Merge-After` cycle, not a fork's, and waiting on nothing else still open
 * (`blockedBy`), so that it becomes a candidate as soon as that one merges.
 * `undefined` otherwise.
 */
export const stackedLayerParent = (
  pr: Readonly<{ fromFork: boolean; blockedBy: readonly number[] }>,
  standing: QueueStanding,
): number | undefined =>
  standing.kind === 'stacked' &&
  !standing.cyclic &&
  !pr.fromFork &&
  pr.blockedBy.every((each) => each === standing.on)
    ? standing.on
    : undefined;

/**
 * Which built layers still stand, and what is left to build. A layer stands
 * while it is the next one wanted, at the head it is wanted at, on the tree the
 * one below ends with — the default branch's for the first. Trees rather than
 * commits: once the first layer's pull request has merged, the tip is a squash
 * with the layer's tree, and the second layer stands on it as it is. The first
 * that does not stand is built again with every one above it; a branch no layer
 * stands on is stale.
 */
export const matchLayers = <L extends QueueLayerOrigin>({
  desired,
  built,
  baseTree,
}: Readonly<{
  desired: readonly L[];
  built: readonly BuiltLayer[];
  baseTree: string;
}>): Readonly<{
  kept: readonly BuiltLayer[];
  toBuild: readonly L[];
  stale: readonly BuiltLayer[];
}> => {
  const byNumber = new Map(built.map((layer) => [layer.number, layer]));

  const kept = takeStanding(desired, byNumber, baseTree);

  const keptTips = new Set(kept.map(({ tip }) => tip));

  return {
    kept,
    toBuild: desired.slice(kept.length),
    stale: built.filter(({ tip }) => !keptTips.has(tip)),
  };
};

/**
 * What dropping a layer does with its runs and its branch. Its runs diff
 * against the default branch, so a verdict they leave is true, and dropping is
 * about runners and about which branches stand:
 *
 * - one whose pull request is `setAside` for a failure at the head it was built
 *   from keeps its runs going, so that the set-aside comment links a finished
 *   run, and loses its branch once they have finished (a job not yet started
 *   still finds its commit), or once a run has gone
 *   {@link DROPPED_RUN_QUIET_MS} without an update, in case GitHub never ends
 *   it;
 * - any other has its runs still going cancelled and loses its branch, the
 *   cancels asked for first.
 */
export const planDrop = (
  layer: BuiltLayer,
  setAside: boolean,
  nowEpochMs: number,
): LayerDrop => {
  const rounds = Result.isOk(layer.checks)
    ? layer.checks.value.rounds
    : ([] as const);

  const going = rounds.filter(({ completed }) => !completed);

  return {
    number: layer.number,
    branch: layer.branch,
    tip: layer.tip,
    cancel: setAside || Result.isErr(layer.checks) ? [] : going.map(runIdOf),
    deleteRuns: [],
    deleteBranch:
      Result.isOk(layer.checks) &&
      (!setAside ||
        going.every(
          ({ updatedAt }) =>
            nowEpochMs - Date.parse(updatedAt) > DROPPED_RUN_QUIET_MS,
        )),
  };
};

/**
 * Whether the first layer has been running too long to wait for, so that the
 * first candidate is released as without checking ahead. Each clock is its own:
 *
 * - a runner that never came: {@link LAYER_QUEUED_TIMEOUT_MS} from the
 *   dispatch of the earliest run still waiting for one;
 * - a job that never ends: {@link LAYER_TIMEOUT_MS} from the start of the
 *   oldest job still running;
 * - a run that says neither: {@link LAYER_QUEUED_TIMEOUT_MS} from the dispatch
 *   of the earliest run still going.
 */
export const isStuck = (
  verdict: Readonly<{
    status: LayerStatus;
    since: LayerRunsVerdict['since'];
  }>,
  nowEpochMs: number,
): boolean => {
  const { status, since } = verdict;

  if (status.kind !== 'running') {
    return false;
  }

  const past = (from: number | undefined, limit: number): boolean =>
    from !== undefined && nowEpochMs - from > limit;

  return (
    past(since.waiting, LAYER_QUEUED_TIMEOUT_MS) ||
    past(since.oldestJobRunning, LAYER_TIMEOUT_MS) ||
    (since.waiting === undefined &&
      since.oldestJobRunning === undefined &&
      past(since.dispatched, LAYER_QUEUED_TIMEOUT_MS))
  );
};

/**
 * A layer's whole commit message. Not the pull request's own: only the trailer
 * is read back, and GitHub would link what that message names again on every
 * rebuild; the number has no `#` for the same reason.
 */
export const layerMessage = (layer: QueueLayerOrigin): string =>
  `queue layer: pull request ${layer.number}\n\n${queueLayerTrailer(layer)}\n` as const;

/**
 * How far the check workflows got on a layer: `running` is `queued` while a job
 * has not started or the gate has not finished, and `red` names the workflow
 * that failed and links its run.
 */
export type LayerStatus = Readonly<
  | { kind: 'not-dispatched' }
  | { kind: 'running'; queued: boolean }
  | { kind: 'green' }
  | { kind: 'red'; name: string; link: string }
>;

/** What {@link layerRunsVerdict} decides. */
export type LayerRunsVerdict = Readonly<{
  status: LayerStatus;
  /** Each workflow's latest run, in the order the workflows were given. */
  latest: readonly Readonly<{
    workflow: string;
    run: WorkflowRoundFacts | undefined;
  }>[];
  /** The workflows with no run, or a cancelled one, to dispatch again. */
  missing: readonly string[];
  /** One of {@link missing} has been cancelled too often to dispatch again. */
  cancelledTooOften: boolean;
  /**
   * When the earliest of the latest runs still going was dispatched, the
   * earliest of those still waiting for a runner, and when the oldest of their
   * jobs still running started; `undefined` where there is none.
   */
  since: Readonly<{
    dispatched: number | undefined;
    waiting: number | undefined;
    oldestJobRunning: number | undefined;
  }>;
}>;

/** What {@link decideSpeculation} decides. */
export type SpeculationDecision = Readonly<{
  /** The first layer's pull request, red, with what failed. */
  setAside:
    (QueueLayerOrigin & Readonly<{ name: string; link: string }>) | undefined;
  /** The first layer dropped, above a red one over green ones. */
  dropFrom: number | undefined;
  /** The layer to dispatch next. */
  dispatch: number | undefined;
  release: boolean;
}>;

/** What {@link layerStandings} says of a layer. */
export type LayerStanding =
  | 'set-aside'
  | 'red'
  | 'dropped'
  | 'stalled'
  | 'to-dispatch'
  | 'waits'
  | 'running'
  | 'green';

/** What stacking reads of a candidate. */
export type LayerCandidate = Readonly<{
  number: number;
  headSha: string;
  headRef: string;
  fromFork: boolean;
  /** Whether only a ruleset bypass merges it. */
  bypass: boolean;
}>;

/**
 * A layer to build: the pull request and head, and the commit its own commits
 * come after when that is not its merge base with the default branch
 * ({@link desiredLayers}).
 */
export type LayerToBuild = QueueLayerOrigin &
  Readonly<{ upstream: string | undefined }>;

/** A queued pull request stacked on another one, `on`. */
export type StackedAbove<P> = Readonly<{ pr: P; on: number }>;

/** A layer a branch holds: the pull request and head it was built from. */
export type BuiltLayer = QueueLayerOrigin &
  Readonly<{
    branch: string;
    /** The branch's tip, the one commit the layer adds. */
    tip: string;
    tree: string;
    /** The commit below, the default branch's or the layer below's. */
    parent: string;
    parentTree: string;
    /** When the layer's commit was made, in epoch milliseconds. */
    builtAt: number;
    checks: QueueLayerFacts['checks'];
  }>;

/**
 * What dropping a layer asks: the runs to cancel and to delete, and whether its
 * branch goes, which waits while a cancel is refused.
 */
export type LayerDrop = Readonly<{
  number: number;
  branch: string;
  tip: string;
  cancel: readonly number[];
  deleteRuns: readonly number[];
  deleteBranch: boolean;
}>;

/** How many runs of a workflow a layer may see cancelled. */
export const MAX_DISPATCHES = 3;

/** How long a job of the first layer may run, from its own start. */
export const LAYER_TIMEOUT_MS = 40 * 60_000;

/**
 * How long the first layer may run, from its dispatch, before it is taken to be
 * stuck however busy the runners are.
 */
export const LAYER_QUEUED_TIMEOUT_MS = 90 * 60_000;

/**
 * How long a run of a set-aside layer may go without an update before its
 * branch goes anyway: as long as a run may wait for a runner, which it does
 * without an update.
 */
export const DROPPED_RUN_QUIET_MS = 90 * 60_000;

/** A run's conclusions that make its layer red. */
const FAILED_CONCLUSIONS: ReadonlySet<string> = new Set<string>([
  'failure',
  'timed_out',
  'startup_failure',
  'action_required',
]);

/** A job's statuses before a runner has taken it. */
const JOB_NOT_STARTED: ReadonlySet<string> = new Set<string>([
  'queued',
  'waiting',
  'pending',
  'requested',
]);

/** What every check workflow's gate job is named with (`gates / check`). */
const GATE_JOB = 'gates';

const runIdOf = ({ runId }: WorkflowRoundFacts): number => runId;

const earliest = (times: readonly number[]): number | undefined =>
  Arr.isNonEmpty(times) ? Math.min(...times) : undefined;

/**
 * Whether a run still has jobs to start: not yet in progress, its gate not yet
 * finished (the jobs after it do not exist until it does), or a job queued;
 * whether one waits for a runner (`queued`; `waiting` and `pending` wait for
 * the jobs they need); and when the oldest of its jobs still running started.
 */
const startingOf = (
  run: WorkflowRoundFacts,
  checks: HeadChecks,
): Readonly<{
  starting: boolean;
  forRunner: boolean;
  oldestRunning: number | undefined;
}> => {
  if (run.status !== 'in_progress') {
    return { starting: true, forRunner: true, oldestRunning: undefined };
  }

  const jobs = checks.runs.filter(
    ({ checkSuiteId }) => checkSuiteId === run.checkSuiteId,
  );

  return {
    starting: jobs.some(
      ({ name, status }) =>
        JOB_NOT_STARTED.has(status) ||
        (name.startsWith(GATE_JOB) && status !== 'completed'),
    ),
    forRunner: jobs.some(({ status }) => status === 'queued'),
    oldestRunning: earliest(
      jobs
        .filter(
          ({ status, startedAt }) =>
            status === 'in_progress' && startedAt !== undefined,
        )
        .map(({ startedAt }) => Date.parse(startedAt ?? '')),
    ),
  };
};

/**
 * The lowest red layer whose layers below are all green, with what failed on
 * it; a red layer above one not yet green is not yet anyone's.
 */
const firstRedOverGreen = (
  statuses: readonly LayerStatus[],
): Readonly<{ index: number; name: string; link: string }> | undefined => {
  const index = statuses.findIndex((each) => each.kind !== 'green');

  const status = index === -1 ? undefined : statuses[index];

  return status?.kind === 'red'
    ? { index, name: status.name, link: status.link }
    : undefined;
};

/**
 * The part of {@link decideSpeculation} that reads the statuses alone: the
 * lowest red layer over green ones, the first layer dropped above it, and the
 * layer to dispatch.
 */
const stackOf = (
  statuses: readonly LayerStatus[],
): Readonly<{
  red: Readonly<{ index: number; name: string; link: string }> | undefined;
  dropFrom: number | undefined;
  dispatch: number | undefined;
}> => {
  const red = firstRedOverGreen(statuses);

  const standing = red === undefined ? statuses.length : red.index + 1;

  const dispatch = statuses
    .slice(0, standing)
    .findIndex((status) => status.kind === 'not-dispatched');

  const below = dispatch === -1 ? ([] as const) : statuses.slice(0, dispatch);

  // Green, or running with every job started: never on top of a red layer,
  // which spoils whatever is stacked above it.
  const ready = below.every(
    (status) =>
      status.kind === 'green' || (status.kind === 'running' && !status.queued),
  );

  return {
    red,
    dropFrom:
      red === undefined || red.index + 1 >= statuses.length
        ? undefined
        : red.index + 1,
    dispatch: dispatch === -1 || !ready ? undefined : dispatch,
  };
};

/**
 * Which tips on the default branch start no stack of their own: a layer right
 * on another layer that could be kept is that one's next (an empty layer leaves
 * the tree as it found it).
 */
const isOnBase = <P extends LayerCandidate>(
  onTree: readonly BuiltLayer[],
  candidates: readonly P[],
  mayStayAhead: (pr: P) => boolean,
): ((layer: BuiltLayer) => boolean) => {
  const tips = new Set<string>(
    onTree
      .filter(({ number, head }) =>
        candidates.some(
          (pr) =>
            pr.number === number && pr.headSha === head && mayStayAhead(pr),
        ),
      )
      .map(({ tip }) => tip),
  );

  return ({ parent }) => !tips.has(parent);
};

const keptStack = <P extends LayerCandidate>(
  candidates: readonly P[],
  built: readonly BuiltLayer[],
  below: Readonly<{ tree: string; tip: string | undefined }>,
  mayStayAhead: (pr: P) => boolean,
): Readonly<{ builtAt: number; stack: readonly P[] }> => {
  // On the default branch a layer is matched by tree, as `matchLayers` does,
  // but one right on another layer there that could be kept is that one's next,
  // not a stack of its own; on a layer, by its commit.
  const onTree = built.filter(({ parentTree }) => parentTree === below.tree);

  const isOnBelow =
    below.tip === undefined
      ? isOnBase(onTree, candidates, mayStayAhead)
      : (layer: BuiltLayer): boolean => layer.parent === below.tip;

  const stacks = Arr.generate(function* () {
    for (const pr of candidates) {
      const layer = onTree.find(
        (each) =>
          each.number === pr.number &&
          each.head === pr.headSha &&
          isOnBelow(each),
      );

      if (layer === undefined || !mayStayAhead(pr)) {
        continue;
      }

      const above = keptStack(
        candidates.filter(({ number }) => number !== pr.number),
        built,
        layer,
        mayStayAhead,
      );

      yield {
        builtAt: Math.max(layer.builtAt, above.builtAt),
        stack: Arr.toUnshifted(pr)(above.stack),
      } as const;
    }
  });

  return stacks.reduce<Readonly<{ builtAt: number; stack: readonly P[] }>>(
    (kept, each) =>
      each.builtAt > kept.builtAt ||
      (each.builtAt === kept.builtAt && each.stack.length > kept.stack.length)
        ? each
        : kept,
    { builtAt: Number.NEGATIVE_INFINITY, stack: [] },
  );
};

/** Whether what `number` is stacked on, if anything, is among `below`. */
const hasParentBelow = (
  number: number,
  below: readonly Readonly<{ number: number }>[],
  stackedOn: ReadonlyMap<number, number>,
): boolean => {
  const parent = stackedOn.get(number);

  return parent === undefined || below.some((pr) => pr.number === parent);
};

const takeStanding = (
  desired: readonly QueueLayerOrigin[],
  built: ReadonlyMap<number, BuiltLayer>,
  baseTree: string,
): readonly BuiltLayer[] => {
  const [next, ...rest] = desired;

  if (next === undefined) {
    return [];
  }

  const layer = built.get(next.number);

  return layer?.head === next.head && layer.parentTree === baseTree
    ? Arr.toUnshifted(layer)(takeStanding(rest, built, layer.tree))
    : [];
};
