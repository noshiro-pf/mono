import { Arr, Num, Result } from 'ts-data-forge';
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
import { isVersionBranch } from 'pr-report-core';
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
  !isVersionBranch(pr.headRefName, context.defaultBranch) &&
  !context.bypass.has(pr.number) &&
  !pr.isCrossRepository;

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
  context: Readonly<{
    /** Whether the order lets it stay ahead: not one released and left green. */
    mayStayAhead: (pr: PullRequest) => boolean;
    defaultBranch: string;
    bypass: ReadonlyMap<number, string>;
  }>,
): readonly PullRequest[] => {
  const release = candidates.findIndex(({ headRefName }) =>
    isVersionBranch(headRefName, context.defaultBranch),
  );

  const kept = keptStack(
    candidates,
    built,
    { tree: baseTree, tip: undefined },
    (pr) =>
      context.mayStayAhead(pr) &&
      isStackable(pr, context) &&
      (release === -1 || candidates.indexOf(pr) < release),
  ).stack;

  const keptNumbers = new Set<number>(kept.map(({ number }) => number));

  return [
    ...kept,
    ...candidates.filter(({ number }) => !keptNumbers.has(number)),
  ];
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
 * What to do this survey with the layers that stand, `statuses` in their order.
 *
 * - **A red first layer** names its own pull request, which is set aside. Only
 *   the first: a layer above it failed on top of pull requests that have not
 *   merged and may not, and it is judged once it is first, on `main`'s tree or
 *   rebuilt on it. It holds the release of nothing below it.
 * - **Every layer above a red one over green ones**, which carries it, is
 *   cleaned up ({@link planDrop}), its runs cancelled to free their runners. A
 *   red layer over one still running says nothing yet.
 * - **The next layer is dispatched** only once the layers below are green, or
 *   have finished their gate and started every job, so that the first finishes
 *   as fast as it would alone, and never on top of a red layer.
 * - **The first candidate is released** when its layer is green, and also when
 *   it has none to wait for — not stacked (the version pull request, one only a
 *   bypass merges) or not buildable (its commit conflicts): the release then
 *   runs its checks, or finds the conflict, as it always has.
 */
export const decideSpeculation = ({
  layers,
  statuses,
  firstCandidate,
}: Readonly<{
  layers: readonly BuiltLayer[];
  statuses: readonly LayerStatus[];
  firstCandidate: number | undefined;
}>): Readonly<{
  setAside: (Layer & Readonly<{ name: string; link: string }>) | undefined;
  dropFrom: number | undefined;
  dispatch: number | undefined;
  release: boolean;
}> => {
  const red = firstRedOverGreen(statuses);

  const redLayer = red === undefined ? undefined : layers[red.index];

  const standing = red === undefined ? layers.length : red.index + 1;

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

  const first = layers[0];

  const release =
    firstCandidate !== undefined &&
    (first?.number !== firstCandidate || statuses[0]?.kind === 'green');

  return {
    setAside:
      redLayer === undefined || red?.index !== 0
        ? undefined
        : {
            number: redLayer.number,
            head: redLayer.head,
            name: red.name,
            link: red.link,
          },
    dropFrom:
      red === undefined || red.index + 1 >= layers.length
        ? undefined
        : red.index + 1,
    dispatch: dispatch === -1 || !ready ? undefined : dispatch,
    release: release && red?.index !== 0,
  };
};

/**
 * Whether anything may be built on top of the layers that stand, `statuses` in
 * their order: not on a red one over green ones, whose layers above are dropped.
 */
export const mayBuildAbove = (statuses: readonly LayerStatus[]): boolean =>
  firstRedOverGreen(statuses) === undefined;

/**
 * Whether a workflow's runs on a layer, by their conclusions, have been
 * cancelled as often as it may be dispatched. A cancelled run is dispatched
 * again, and something that keeps cancelling them would otherwise hold the first
 * candidate for ever, with no run lasting long enough for {@link isStuck}.
 */
export const cancelledTooOften = (
  conclusions: readonly (string | null)[],
): boolean =>
  Arr.isMinLengthArray(
    MAX_DISPATCHES,
    conclusions.filter((conclusion) => conclusion === 'cancelled'),
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
export const numberOfLayerBranch = (branch: string): number | undefined => {
  if (!branch.startsWith(LAYER_BRANCH_PREFIX)) {
    return undefined;
  }

  const digits = branch.slice(LAYER_BRANCH_PREFIX.length);

  return /^[1-9]\d*$/u.test(digits)
    ? Result.unwrapOkOr(Num.safeParseFloat(digits), Number.NaN)
    : undefined;
};

/**
 * The trailer a layer's commit carries, naming the pull request and the head it
 * was built from, which is how a later survey knows what a branch holds. The
 * number has no `#`: GitHub links one in a pushed commit's message, on any
 * branch, and each rebuild would add to that pull request's timeline.
 */
export const layerTrailer = ({ number, head }: Layer): string =>
  `${LAYER_TRAILER}: ${number} ${head}` as const;

/**
 * A layer's whole commit message. Not the pull request's own: only the trailer
 * is read back, and GitHub would link what that message names (`Closes #…`, a
 * subject's `(#…)`) again on every rebuild.
 */
export const layerMessage = (layer: Layer): string =>
  `queue layer: pull request ${layer.number}\n\n${layerTrailer(layer)}\n` as const;

/** What {@link layerTrailer} wrote into a commit message, if it did. */
export const layerOfMessage = (message: string): Layer | undefined => {
  const line = message
    .split('\n')
    .findLast((each) => each.startsWith(`${LAYER_TRAILER}: `));

  const [number, head] = (line ?? '')
    .slice(`${LAYER_TRAILER}: `.length)
    .split(' ', 2);

  return head !== undefined &&
    number !== undefined &&
    /^[1-9]\d*$/u.test(number) &&
    /^[0-9a-f]{40}$/u.test(head)
    ? {
        number: Result.unwrapOkOr(Num.safeParseFloat(number), Number.NaN),
        head,
      }
    : undefined;
};

/** A layer to have: a queued pull request at the head it is queued at. */
export type Layer = Readonly<{ number: number; head: string }>;

/** A layer a branch holds: the pull request and head it was built from. */
export type BuiltLayer = Layer &
  Readonly<{
    /** The branch's tip, the one commit the layer adds. */
    tip: string;
    tree: string;
    /** The commit below, `main`'s or the layer below's, and its tree. */
    parent: string;
    parentTree: string;
    /** When the layer's commit was made, in epoch milliseconds. */
    builtAt: number;
  }>;

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

/** How far the check workflows got on a layer. */
export type LayerStatus = Readonly<
  | { kind: 'not-dispatched' }
  | { kind: 'running'; queued: boolean }
  | { kind: 'green' }
  | { kind: 'red'; name: string; link: string }
>;

/**
 * The prefix of the layer branches, on which the check workflows diff a layer
 * against `origin/main` (`code-check.yml`, `style-check.yml`).
 */
export const LAYER_BRANCH_PREFIX = 'queue/pr-';

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

/** How many runs of a workflow a layer may see cancelled. */
export const MAX_DISPATCHES = 3;

const LAYER_TRAILER = 'Queue-Layer';

/** Whether a layer on `main`'s tree is not right on another that could be kept. */
const isOnMain = (
  onTree: readonly BuiltLayer[],
  candidates: readonly PullRequest[],
  mayStayAhead: (pr: PullRequest) => boolean,
): ((layer: BuiltLayer) => boolean) => {
  const tips = new Set<string>(
    onTree
      .filter(({ number, head }) =>
        candidates.some(
          (pr) =>
            pr.number === number && pr.headRefOid === head && mayStayAhead(pr),
        ),
      )
      .map(({ tip }) => tip),
  );

  return ({ parent }) => !tips.has(parent);
};

const keptStack = (
  candidates: readonly PullRequest[],
  built: readonly BuiltLayer[],
  below: Readonly<{ tree: string; tip: string | undefined }>,
  mayStayAhead: (pr: PullRequest) => boolean,
): Readonly<{ builtAt: number; stack: readonly PullRequest[] }> => {
  // Each layer on what is below whose pull request is a candidate at the head
  // it was built at, with the stack it carries; more than one when an old layer
  // is still being dropped: the one with the layer built last is the one being
  // checked, since a stack is only ever built anew over one that no longer
  // stands, and of two built in the same second the longer. On `main` a layer
  // is matched by tree, as `matchLayers` does, but one right on another layer
  // there that could be kept is that one's next, not a stack of its own (an
  // empty layer leaves the tree as it found it); on a layer, by its commit.
  const onTree = built.filter(({ parentTree }) => parentTree === below.tree);

  const isOnBelow =
    below.tip === undefined
      ? isOnMain(onTree, candidates, mayStayAhead)
      : (layer: BuiltLayer): boolean => layer.parent === below.tip;

  const stacks = Arr.generate(function* () {
    for (const pr of candidates) {
      const layer = onTree.find(
        (each) =>
          each.number === pr.number &&
          each.head === pr.headRefOid &&
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

  return stacks.reduce<
    Readonly<{ builtAt: number; stack: readonly PullRequest[] }>
  >(
    (kept, each) =>
      each.builtAt > kept.builtAt ||
      (each.builtAt === kept.builtAt && each.stack.length > kept.stack.length)
        ? each
        : kept,
    { builtAt: Number.NEGATIVE_INFINITY, stack: [] },
  );
};

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
