import { Arr, Num, Result } from 'ts-data-forge';
/**
 * What checking queued pull requests ahead of their turn decides, apart from
 * reading GitHub and moving branches (`speculate.mts`).
 *
 * The leading candidates are stacked on `main`, one commit each, every layer on
 * a branch of its own (`queue/pr-<number>`), and the check workflows are
 * dispatched on each layer with `diff-parent`, so that each is judged on its
 * own commit against the layer below. When the first candidate's turn comes,
 * its layer has a verdict, and the pull request rebased onto `main` has the
 * same tree as the layer, so the gate reuses that verdict instead of running
 * the matrix again (`.github/workflows/README.md`, "Reusing a verdict").
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
  const stackable = candidates.findIndex(
    (pr) =>
      isVersionBranch(pr.headRefName, context.defaultBranch) ||
      context.bypass.has(pr.number) ||
      pr.isCrossRepository,
  );

  return candidates
    .slice(0, stackable === -1 ? undefined : stackable)
    .slice(0, context.depth)
    .map((pr) => ({ number: pr.number, head: pr.headRefOid }));
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
 *   dropped ({@link dropActionOf}), so that no verdict reached on top of it is
 *   reused. A red layer over one still running says nothing yet.
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
 * The layers of `toBuild` that may be built this survey: up to the first in
 * `held`, whose old branch still has runs that could not be dropped. A force
 * push would leave them on a commit no later survey reads, their verdicts still
 * reusable by tree.
 */
export const buildableLayers = (
  toBuild: readonly Layer[],
  held: ReadonlySet<number>,
): readonly Layer[] => {
  const stop = toBuild.findIndex(({ number }) => held.has(number));

  return stop === -1 ? toBuild : toBuild.slice(0, stop);
};

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
 * What dropping a layer does with one of its runs: cancels it while it is going,
 * and deletes it once finished, so that the gate's lookup by tree finds no
 * verdict of a layer that no longer stands. With `keepRed`, for a pull request
 * set aside for its layer, a run that did not pass stays: a set-aside comment
 * links to it, and it is the failure that comment is about.
 */
export const dropActionOf = (
  run: Readonly<{ status: string; conclusion: string | null }>,
  keepRed: boolean,
): 'cancel' | 'delete' | 'keep' =>
  run.status !== 'completed'
    ? 'cancel'
    : keepRed && run.conclusion !== 'success'
      ? 'keep'
      : 'delete';

/**
 * Whether the first layer has been running too long to wait for: a runner that
 * never came, a job that never ends. Then the first candidate is released as it
 * would be without checking ahead. Twice the longest job's `timeout-minutes`,
 * and the queueing besides, counted from the earliest of its runs still going.
 */
export const isStuck = (
  status: LayerStatus,
  runningSince: number | undefined,
  nowMs: number,
): boolean =>
  status.kind === 'running' &&
  runningSince !== undefined &&
  nowMs - runningSince > LAYER_TIMEOUT_MS;

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
    /** The tree of the commit below: `main`'s, or the layer below's. */
    parentTree: string;
  }>;

/** How far the check workflows got on a layer. */
export type LayerStatus = Readonly<
  | { kind: 'not-dispatched' }
  | { kind: 'running'; queued: boolean }
  | { kind: 'green' }
  | { kind: 'red'; name: string; link: string }
>;

/**
 * `queue/`, which `check-gates.yml` reads to call a `diff-parent` run's verdict
 * reusable.
 */
export const LAYER_BRANCH_PREFIX = 'queue/pr-';

/** How long the first layer may run before it is taken to be stuck. */
export const LAYER_TIMEOUT_MS = 40 * 60_000;

/** How many runs of a workflow a layer may see cancelled. */
export const MAX_DISPATCHES = 3;

const LAYER_TRAILER = 'Queue-Layer';

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
