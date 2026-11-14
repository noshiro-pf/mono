import { Arr, Result } from 'ts-data-forge';
/**
 * What checking queued pull requests ahead of their turn decides, apart from
 * reading GitHub and moving branches (`speculate.mts`).
 *
 * The leading candidates, each with the queued pull requests stacked on it
 * right above it, are stacked on `main`, one commit each, every layer on a
 * branch of its own (`queue/pr-<number>`), and the check workflows are
 * dispatched on each layer, which diff it against `main` as a pull request's
 * run does, so that its verdict is a whole one about its tree, whatever becomes
 * of the layers below. When the first candidate's turn comes, its layer has a
 * verdict, and the pull request rebased onto `main` has the same tree as the
 * layer, so the gate reuses that verdict instead of running the matrix again
 * (`.github/workflows/README.md`, "Reusing a verdict").
 *
 * Nothing is remembered between surveys: the branches say what was built, by
 * the trees they sit on, and the runs on their tips say how far each got.
 */
import {
  isStackable as isStackableLayer,
  numberOfQueueLayerBranch,
  QUEUE_LAYER_BRANCH_PREFIX,
  queueLayerOfMessage,
  queueLayerTrailer,
  stackedAhead,
  withMovedQueueHeads,
  withStackedAbove,
  type BuiltQueueLayer,
  type LayerStatus,
  type QueueLayer,
} from 'pr-report-core';
import type { PullRequest } from './types.mjs';

/**
 * The layers to have: the leading pull requests of the order checking ahead
 * keeps ({@link stackedFirst}), in that order, up to `depth` and up to the
 * first that cannot be stacked. The version pull request cannot (`release.yml`
 * rebuilds it from the tip on every push to `main`, and it is never rebased),
 * and neither can one only a bypass merges (it waits for a person, and every
 * layer above it would wait too). Each of those is released on its own once the
 * layers before it have merged.
 *
 * One stacked on another pull request (`stackedOn`, child → parent) is stacked
 * from that one's head, its `upstream`: its own commits are the ones after it.
 * It cannot be stacked below that one's layer, which carries what it builds on.
 */
export const desiredLayers = (
  order: readonly PullRequest[],
  context: Readonly<{
    defaultBranch: string;
    bypass: ReadonlyMap<number, string>;
    depth: number;
    stackedOn: ReadonlyMap<number, number>;
  }>,
): readonly DesiredLayer[] => {
  const stackable = order.findIndex(
    (pr, index) =>
      !isStackable(pr, context) ||
      !hasParentBelow(pr, order.slice(0, index), context.stackedOn),
  );

  return order
    .slice(0, stackable === -1 ? undefined : stackable)
    .slice(0, context.depth)
    .map((pr, _, taken) => {
      const parent = context.stackedOn.get(pr.number);

      const upstream = taken.find(
        ({ number }) => number === parent,
      )?.headRefOid;

      return upstream === undefined
        ? { number: pr.number, head: pr.headRefOid }
        : { number: pr.number, head: pr.headRefOid, upstream };
    });
};

/**
 * Whether a pull request can be stacked: not the version pull request
 * (`release.yml` rebuilds it from the tip on every push to `main`, and it is
 * never rebased), not one only a bypass merges (it waits for a person, and
 * every layer above it would wait too), not a fork's.
 */
export const isStackable = (
  pr: PullRequest,
  context: Readonly<{
    defaultBranch: string;
    bypass: ReadonlyMap<number, string>;
  }>,
): boolean =>
  isStackableLayer(pr, context.defaultBranch, context.bypass.has(pr.number));

/**
 * What the release step releases, in `order` ({@link stackedFirst}): the first
 * alone while a layer stands, since the layers above carry it; otherwise each
 * in turn, as without checking ahead, but in that order still, so that what is
 * stacked goes first whatever this survey could not do.
 */
export const releasing = (
  order: readonly PullRequest[],
  stacked: boolean,
): readonly PullRequest[] => (stacked ? Arr.take(order, 1) : order);

/**
 * The order checking ahead stacks in: the candidates with the layers already
 * stacked kept first, in the order they were stacked, and the rest after them
 * in their own order. Each queued pull request stacked on one of them
 * (`stackedAbove`, `withStackedAbove` in `pr-report-core`) comes right after
 * it, or right after the kept stack when that one is kept: checked on top of it,
 * and released only once it has merged, when it is a candidate of its own. A
 * pull request that becomes a candidate, or gains `priority:high`, reorders
 * only what is not yet stacked: putting it first would leave every layer above
 * it standing on nothing, and cancel runs that were most of the way to a
 * verdict.
 *
 * The kept stack follows the layers from the base's tree up, each the one whose
 * pull request is still in the order at the head it was built at; it stops at
 * the first that is not, that can no longer be stacked ({@link isStackable}),
 * whose pull request `mayStayAhead` refuses (one released and left green, which
 * the order puts last), or that the order puts after the version pull request,
 * since what goes into a release is the order's to say. Of two stacks on one
 * tree (an old layer still being dropped beside the one being checked), the one
 * with the layer built last is kept, and of two built in the same second the
 * longer. A candidate's own order already holds what has to come first
 * (`Merge-After`, a stack): a pull request waiting on another is not a
 * candidate until that one merges.
 */
export const stackedFirst = (
  candidates: readonly PullRequest[],
  built: readonly BuiltLayer[],
  baseTree: string,
  context: OrderContext,
): readonly PullRequest[] =>
  checkingOrder(candidates, built, baseTree, context).order;

/**
 * The order the worker releases in, which every reader of the order reads:
 * the triage log, the dry run, checking ahead itself, and the release step's
 * settling of a double release. With the layer branches read, the candidates in
 * {@link stackedFirst}'s order, and `kept`, the candidates it keeps ahead; with
 * them unread, the queue's own order, as checking ahead falls back to. What is
 * stacked on a candidate is checked, never released, so it is in neither.
 */
export const releaseOrder = (
  candidates: readonly PullRequest[],
  read: LayerRead,
  context: OrderContext,
): Readonly<{ order: readonly PullRequest[]; kept: readonly number[] }> => {
  if (Result.isErr(read)) {
    return { order: candidates, kept: [] };
  }

  const { release, kept } = checkingOrder(
    candidates,
    read.value.built,
    read.value.baseTree,
    context,
  );

  return { order: release, kept };
};

/** The layers with each moved head followed to its layer's tree, if it has it. */
export const withMovedHeads = withMovedQueueHeads;

/**
 * The heads {@link withMovedHeads} has to read the trees of: each open pull
 * request's whose layer was built at another head. A layer of a pull request no
 * longer open is not followed.
 */
export const movedHeads = (
  built: readonly BuiltLayer[],
  pullRequests: readonly PullRequest[],
): readonly Layer[] =>
  Arr.generate(function* () {
    for (const layer of built) {
      const pr = pullRequests.find(({ number }) => number === layer.number);

      if (pr !== undefined && pr.headRefOid !== layer.head) {
        yield { number: layer.number, head: pr.headRefOid };
      }
    }
  });

/**
 * Which built layers still stand, and what is left to build. A layer stands
 * while it is the next one wanted, at the head it is wanted at, on the tree the
 * one below ends with — `main`'s for the first. Trees rather than commits: once
 * the first layer's pull request has merged, `main` is a squash with the
 * layer's tree, and the second layer stands on it as it is. The first that does
 * not stand is built again with every one above it; a branch no layer stands on
 * is stale.
 */
export const matchLayers = <L extends Layer>({
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

  const keptNumbers = new Set(kept.map(({ number }) => number));

  return {
    kept,
    toBuild: desired.slice(kept.length),
    stale: built.filter(({ number }) => !keptNumbers.has(number)),
  };
};

/**
 * The red layers above the first that are not cleaned up (`dropFrom`, from
 * `decideSpeculation`), each of a candidate: what the worker may repair ahead of
 * its turn, while it waits for the first (`repair-ahead.mts`). A red first layer
 * is its own pull request's set-aside, and one stacked on a candidate is on
 * that one's branch rather than on the default branch, so neither is here.
 */
export const redAboveFirst = (
  layers: readonly BuiltLayer[],
  statuses: readonly LayerStatus[],
  dropFrom: number | undefined,
  candidates: ReadonlySet<number>,
): readonly BuiltLayer[] =>
  layers.filter(
    (layer, index) =>
      index > 0 &&
      (dropFrom === undefined || index < dropFrom) &&
      statuses[index]?.kind === 'red' &&
      candidates.has(layer.number),
  );

/**
 * What cleaning up an invalid layer does with its runs and its branch. A layer's
 * runs diff against `main`, as a pull request's do, so a verdict they leave is
 * as true as that pull request's own run would be, and none has to be deleted:
 * cleaning up is about runners and about which branches stand.
 *
 * - One whose pull request is `setAside` for a failure at the head it was built
 *   at keeps its runs going, so that the set-aside comment links to a finished
 *   run and whoever fixes it sees every failure at once, and loses its branch
 *   once they have finished, so that a job not yet started still finds its
 *   commit; but not once a run has gone {@link DROPPED_RUN_QUIET_MS} without an
 *   update, in case GitHub never ends it. A retry before then finds the layer
 *   still standing and its failure with it.
 * - Any other has its runs still going cancelled, since their verdicts will not
 *   be used and they hold runners, and loses its branch: the cancels are asked
 *   for first, so that no job still to start looks for a commit already gone.
 */
export const planDrop = (
  setAside: boolean,
  runs: readonly DropRun[],
  nowMs: number,
): LayerDrop => {
  const going = runs.filter((run) => run.status !== 'completed');

  return setAside
    ? {
        cancel: [],
        deleteBranch: going.every(
          (run) => nowMs - Date.parse(run.updated_at) > DROPPED_RUN_QUIET_MS,
        ),
      }
    : { cancel: going.map(({ id }) => id), deleteBranch: true };
};

/**
 * Whether the first layer has been running too long to wait for, so that the
 * first candidate is released as it would be without checking ahead. Each clock
 * is its own, so that a layer that waited long for its runners is not called
 * stuck the moment its jobs start, nor one run's wait charged to another's
 * start:
 *
 * - a runner that never came: {@link LAYER_QUEUED_TIMEOUT_MS} from the dispatch
 *   of the earliest run still waiting for one, generous because a busy account
 *   is no reason to give up;
 * - a job that never ends: {@link LAYER_TIMEOUT_MS} from the start of the
 *   oldest job still running, twice the longest job's `timeout-minutes`;
 * - a run that says neither, such as one whose jobs have all finished but that
 *   never completes: {@link LAYER_QUEUED_TIMEOUT_MS} from the dispatch of the
 *   earliest run still going.
 */
export const isStuck = (
  status: LayerStatus,
  since: Readonly<{
    dispatched?: number;
    waiting?: number;
    oldestJobRunning?: number;
  }>,
  nowMs: number,
): boolean => {
  if (status.kind !== 'running') {
    return false;
  }

  const past = (from: number | undefined, limit: number): boolean =>
    from !== undefined && nowMs - from > limit;

  return (
    past(since.waiting, LAYER_QUEUED_TIMEOUT_MS) ||
    past(since.oldestJobRunning, LAYER_TIMEOUT_MS) ||
    (since.waiting === undefined &&
      since.oldestJobRunning === undefined &&
      past(since.dispatched, LAYER_QUEUED_TIMEOUT_MS))
  );
};

/** The branch a layer is built on. */
export const layerBranch = (number: number): string =>
  `${LAYER_BRANCH_PREFIX}${number}` as const;

/** The pull request a layer branch is for, or `undefined` for another branch. */
export const numberOfLayerBranch = numberOfQueueLayerBranch;

/**
 * The trailer a layer's commit carries, naming the pull request and the head it
 * was built from, which is how a later survey knows what a branch holds. The
 * number has no `#`: GitHub links one in a pushed commit's message, on any
 * branch, and each rebuild would add to that pull request's timeline.
 */
export const layerTrailer = queueLayerTrailer;

/**
 * A layer's whole commit message. Not the pull request's own: only the trailer
 * is read back, and GitHub would link what that message names (`Closes #…`, a
 * subject's `(#…)`) again on every rebuild.
 */
export const layerMessage = (layer: Layer): string =>
  `queue layer: pull request ${layer.number}\n\n${layerTrailer(layer)}\n` as const;

/** What {@link layerTrailer} wrote into a commit message, if it did. */
export const layerOfMessage = queueLayerOfMessage;

/**
 * {@link stackedFirst}'s order, with `release`, the candidates alone in that
 * order, and `kept`, the candidates of the kept stack, in the stack's order.
 * What is stacked on a candidate is checked, never released: it is in `order`
 * alone.
 */
export const checkingOrder = (
  candidates: readonly PullRequest[],
  built: readonly BuiltLayer[],
  baseTree: string,
  context: OrderContext,
): Readonly<{
  order: readonly PullRequest[];
  release: readonly PullRequest[];
  kept: readonly number[];
}> => {
  const kept = stackedAhead(
    withStackedAbove(candidates, context.stackedAbove),
    built,
    baseTree,
    {
      mayStayAhead: context.mayStayAhead,
      defaultBranch: context.defaultBranch,
      isBypass: (pr) => context.bypass.has(pr.number),
    },
  );

  const keptNumbers = new Set<number>(kept.map(({ number }) => number));

  const notKept = (pr: PullRequest): boolean => !keptNumbers.has(pr.number);

  const order = [
    ...kept,
    // What is stacked on the kept stack goes on top of it.
    ...withStackedAbove(kept, context.stackedAbove).filter(notKept),
    ...withStackedAbove(
      candidates.filter(notKept),
      context.stackedAbove,
    ).filter(notKept),
  ] as const;

  const candidateNumbers = new Set<number>(
    candidates.map(({ number }) => number),
  );

  const isCandidate = (pr: PullRequest): boolean =>
    candidateNumbers.has(pr.number);

  return {
    order,
    release: order.filter(isCandidate),
    kept: kept.filter(isCandidate).map(({ number }) => number),
  };
};

/**
 * Whether what `pr` is stacked on, if anything, is among `below`, the layers
 * under it.
 */
const hasParentBelow = (
  pr: PullRequest,
  below: readonly PullRequest[],
  stackedOn: ReadonlyMap<number, number>,
): boolean => {
  const parent = stackedOn.get(pr.number);

  return parent === undefined || below.some(({ number }) => number === parent);
};

/** What {@link stackedFirst} needs besides the candidates and the layers. */
export type OrderContext = Readonly<{
  /** Whether the order lets it stay ahead: not one released and left green. */
  mayStayAhead: (pr: PullRequest) => boolean;
  defaultBranch: string;
  bypass: ReadonlyMap<number, string>;
  /**
   * The queued pull requests stacked on another that may be checked right above
   * it (`stackedLayerParent` in `pr-report-core`), with the one each is on.
   */
  stackedAbove: readonly StackedAbove[];
}>;

/** A queued pull request stacked on another one, `on`. */
export type StackedAbove = Readonly<{ pr: PullRequest; on: number }>;

/**
 * The layer branches as a survey reads them, once, for its order and its stack:
 * the layers built, and the tree of `main`'s tip they stand on, or why they
 * could not be read.
 */
export type LayerRead = Result<
  Readonly<{ built: readonly BuiltLayer[]; baseTree: string }>,
  string
>;

/** A layer to have: a queued pull request at the head it is queued at. */
export type Layer = QueueLayer;

/**
 * A layer to have, as {@link desiredLayers} says to build it: from `upstream`,
 * the head of the pull request it is stacked on, when it is stacked on one, or
 * that one's merged head, when GitHub moved it onto `main` as that one merged;
 * otherwise from its merge base with `main`.
 */
export type DesiredLayer = Layer & Readonly<{ upstream?: string }>;

/** A layer a branch holds: the pull request and head it was built from. */
export type BuiltLayer = BuiltQueueLayer;

/** A run on a layer, as much as {@link planDrop} reads. */
export type DropRun = Readonly<{
  id: number;
  status: string;
  updated_at: string;
}>;

/** What {@link planDrop} asks of a layer: the runs to cancel, and its branch. */
export type LayerDrop = Readonly<{
  cancel: readonly number[];
  deleteBranch: boolean;
}>;

/**
 * The prefix of the layer branches, on which the check workflows diff a layer
 * against `origin/main` (`code-check.yml`, `style-check.yml`).
 */
export const LAYER_BRANCH_PREFIX = QUEUE_LAYER_BRANCH_PREFIX;

/** How long a job of the first layer may run, from its own start. */
export const LAYER_TIMEOUT_MS = 40 * 60_000;

/**
 * How long the first layer may run, from its dispatch, before it is taken to be
 * stuck however busy the runners are.
 */
export const LAYER_QUEUED_TIMEOUT_MS = 90 * 60_000;

/**
 * How long a run of a set-aside layer may go without an update before its branch
 * goes anyway, in case GitHub never ends it: as long as a run may wait for a
 * runner ({@link LAYER_QUEUED_TIMEOUT_MS}), which it does without an update.
 */
export const DROPPED_RUN_QUIET_MS = 90 * 60_000;

const takeStanding = (
  desired: readonly Layer[],
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
