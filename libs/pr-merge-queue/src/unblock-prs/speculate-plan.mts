import { Arr, Result } from 'ts-data-forge';
/**
 * What checking queued pull requests ahead of their turn decides, apart from
 * reading GitHub and moving branches (`speculate.mts`).
 *
 * The leading candidates are stacked on `main`, one commit each, every layer on
 * a branch of its own (`queue/pr-<number>`), and the check workflows are
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
  type BuiltQueueLayer,
  type LayerStatus,
  type QueueLayer,
} from 'pr-report-core';
import type { PullRequest } from './types.mjs';

/**
 * The layers to have: the leading candidates, in the order they are picked, up
 * to `depth` and up to the first that cannot be stacked. The version pull
 * request cannot (`release.yml` rebuilds it from the tip on every push to
 * `main`, and it is never rebased), and neither can one only a bypass merges
 * (it waits for a person, and every layer above it would wait too). Each of
 * those is released on its own once the layers before it have merged.
 */
export const desiredLayers = (
  candidates: readonly PullRequest[],
  context: Readonly<{
    defaultBranch: string;
    bypass: ReadonlyMap<number, string>;
    depth: number;
  }>,
): readonly Layer[] => {
  const stackable = candidates.findIndex((pr) => !isStackable(pr, context));

  return candidates
    .slice(0, stackable === -1 ? undefined : stackable)
    .slice(0, context.depth)
    .map((pr) => ({ number: pr.number, head: pr.headRefOid }));
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
 * The candidates with the layers already stacked kept first, in the order they
 * were stacked, and the rest after them in their own order. A pull request that
 * becomes a candidate, or gains `priority:high`, reorders only what is not yet
 * stacked: putting it first would leave every layer above it standing on
 * nothing, and cancel runs that were most of the way to a verdict.
 *
 * The kept stack follows the layers from the base's tree up, each the one whose
 * pull request is still a candidate at the head it was built at; it stops at
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
  releaseOrder(candidates, Result.ok({ built, baseTree }), context).order;

/**
 * The order the worker releases in, which every reader of the order reads:
 * the triage log, the dry run, checking ahead itself, and the release step's
 * settling of a double release. With the layer branches read, the candidates by
 * {@link stackedFirst}, and `kept`, the pull requests it keeps ahead; with them
 * unread, the queue's own order, as checking ahead falls back to.
 */
export const releaseOrder = (
  candidates: readonly PullRequest[],
  read: LayerRead,
  context: OrderContext,
): Readonly<{ order: readonly PullRequest[]; kept: readonly number[] }> => {
  if (Result.isErr(read)) {
    return { order: candidates, kept: [] };
  }

  const kept = stackedAheadOf(
    candidates,
    read.value.built,
    read.value.baseTree,
    context,
  );

  const keptNumbers = new Set<number>(kept.map(({ number }) => number));

  return {
    order: [
      ...kept,
      ...candidates.filter(({ number }) => !keptNumbers.has(number)),
    ],
    kept: kept.map(({ number }) => number),
  };
};

/**
 * Which built layers still stand, and what is left to build. A layer stands
 * while it is the next one wanted, at the head it is wanted at, on the tree the
 * one below ends with — `main`'s for the first. Trees rather than commits: once
 * the first layer's pull request has merged, `main` is a squash with the
 * layer's tree, and the second layer stands on it as it is. The first that does
 * not stand is built again with every one above it; a branch no layer stands on
 * is stale.
 */
export const matchLayers = ({
  desired,
  built,
  baseTree,
}: Readonly<{
  desired: readonly Layer[];
  built: readonly BuiltLayer[];
  baseTree: string;
}>): Readonly<{
  kept: readonly BuiltLayer[];
  toBuild: readonly Layer[];
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

/** The pull requests {@link stackedFirst} keeps ahead, in the stack's order. */
const stackedAheadOf = (
  candidates: readonly PullRequest[],
  built: readonly BuiltLayer[],
  baseTree: string,
  context: OrderContext,
): readonly PullRequest[] =>
  stackedAhead(candidates, built, baseTree, {
    mayStayAhead: context.mayStayAhead,
    defaultBranch: context.defaultBranch,
    isBypass: (pr) => context.bypass.has(pr.number),
  });

/** What {@link stackedFirst} needs besides the candidates and the layers. */
export type OrderContext = Readonly<{
  /** Whether the order lets it stay ahead: not one released and left green. */
  mayStayAhead: (pr: PullRequest) => boolean;
  defaultBranch: string;
  bypass: ReadonlyMap<number, string>;
}>;

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
