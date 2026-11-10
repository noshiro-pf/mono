/**
 * Which queue layers stay ahead of the queue's own order: `unblock-prs` checks
 * the leading candidates ahead of their turn, each squashed onto the one below
 * on a branch of its own (`queue/pr-<number>`), and once a layer is built the
 * pull requests stacked so far are released first, in the order they were
 * stacked. The worker decides its release order by this, and the Pull Requests
 * Manager draws the queue by it, so that the two cannot disagree about which
 * pull request is next. Reading the branches is each reader's own.
 */

import { Arr, Num, Result } from 'ts-data-forge';
import {
  isVersionBranch,
  type QueueGraph,
  type QueueStanding,
} from './queue-order.mjs';

/**
 * The pull requests of `candidates`, in the queue's own order, that stay ahead
 * of it, in the order they were stacked.
 *
 * The kept stack follows the layers from the base's tree up, each the one whose
 * pull request is still a candidate at the head it was built at; it stops at
 * the first that is not, that can no longer be stacked ({@link isStackable}),
 * whose pull request `mayStayAhead` refuses (one released and left green, which
 * the order puts last), or that the order puts after the version pull request,
 * since what goes into a release is the order's to say. Of two stacks on one
 * tree (an old layer still being dropped beside the one being checked), the one
 * with the layer built last is kept, and of two built in the same second the
 * longer.
 */
export const stackedAhead = <P extends LayerCandidate>(
  candidates: readonly P[],
  built: readonly BuiltQueueLayer[],
  baseTree: string,
  context: Readonly<{
    /** Whether the order lets it stay ahead: not one released and left green. */
    mayStayAhead: (pr: P) => boolean;
    defaultBranch: string;
    /** Whether only a ruleset bypass merges it. */
    isBypass: (pr: P) => boolean;
  }>,
): readonly P[] => {
  const release = candidates.findIndex(({ headRefName }) =>
    isVersionBranch(headRefName, context.defaultBranch),
  );

  return keptStack(
    candidates,
    built,
    { tree: baseTree, tip: undefined },
    (pr) =>
      context.mayStayAhead(pr) &&
      isStackable(pr, context.defaultBranch, context.isBypass(pr)) &&
      (release === -1 || candidates.indexOf(pr) < release),
  ).stack;
};

/**
 * The candidates in their order, each followed by the queued pull requests
 * stacked on it ({@link stackedLayerParent}), and those by theirs in turn, the
 * ones on one pull request in number order: the order in which the worker
 * checks them ahead of their turn. One stacked on a pull request is checked on
 * top of it but released only once that one has merged and GitHub has moved it
 * onto the default branch, when it is a candidate of its own. What is stacked
 * on no candidate is left out, and each is taken once, whatever cycle the bases
 * make.
 */
export const withStackedAbove = <P extends Readonly<{ number: number }>>(
  candidates: readonly P[],
  stackedAbove: readonly Readonly<{ pr: P; on: number }>[],
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
 * The layers with the pull requests whose head moved since followed: one whose
 * head now has its layer's tree (`heads`, each pull request's current head and
 * its tree) is still that pull request's layer, at that head. Releasing a pull
 * request rebases it and restacks the one stacked on it ({@link withStackedAbove}),
 * whose layer, built on the first's, already has the tree its new head has;
 * dropped, its runs would be cancelled just as its turn comes. Any other moved
 * head is the pull request's to check again. The worker reads the layers this
 * way, and so must every reader of the order it releases in.
 */
export const withMovedQueueHeads = <L extends BuiltQueueLayer>(
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
 * `Merge-After` cycle, not a fork's, and waiting on nothing else still open, so
 * that it becomes a candidate as soon as that one merges. `undefined`
 * otherwise.
 */
export const stackedLayerParent = (
  pr: Readonly<{ number: number; fromFork: boolean }>,
  standing: QueueStanding,
  graph: Readonly<{
    dependencies: QueueGraph['dependencies'];
    openNumbers: QueueGraph['openNumbers'];
  }>,
): number | undefined =>
  standing.kind === 'stacked' &&
  !standing.cyclic &&
  !pr.fromFork &&
  (graph.dependencies.get(pr.number) ?? []).every(
    (each) => each === standing.on || !graph.openNumbers.has(each),
  )
    ? standing.on
    : undefined;

/**
 * Whether a pull request can be stacked: not the version pull request
 * (`release.yml` rebuilds it from the tip on every push to `main`, and it is
 * never rebased), not one only a bypass merges (it waits for a person, and
 * every layer above it would wait too), not a fork's.
 */
export const isStackable = (
  pr: LayerCandidate,
  defaultBranch: string,
  bypass: boolean,
): boolean =>
  !isVersionBranch(pr.headRefName, defaultBranch) &&
  !bypass &&
  !pr.isCrossRepository;

/** The pull request a layer branch is for, or `undefined` for another branch. */
export const numberOfQueueLayerBranch = (
  branch: string,
): number | undefined => {
  if (!branch.startsWith(QUEUE_LAYER_BRANCH_PREFIX)) {
    return undefined;
  }

  const digits = branch.slice(QUEUE_LAYER_BRANCH_PREFIX.length);

  return /^[1-9]\d*$/u.test(digits)
    ? Result.unwrapOkOr(Num.safeParseFloat(digits), Number.NaN)
    : undefined;
};

/** The `Queue-Layer: <number> <head>` trailer of a layer's commit. */
export const queueLayerTrailer = ({ number, head }: QueueLayer): string =>
  `${QUEUE_LAYER_TRAILER}: ${number} ${head}` as const;

/** What {@link queueLayerTrailer} wrote into a commit message, if it did. */
export const queueLayerOfMessage = (
  message: string,
): QueueLayer | undefined => {
  const line = message
    .split('\n')
    .findLast((each) => each.startsWith(`${QUEUE_LAYER_TRAILER}: `));

  const [number, head] = (line ?? '')
    .slice(`${QUEUE_LAYER_TRAILER}: `.length)
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

/** What {@link stackedAhead} reads of a pull request. */
export type LayerCandidate = Readonly<{
  number: number;
  headRefOid: string;
  headRefName: string;
  isCrossRepository: boolean;
}>;

/** A layer: a queued pull request at the head it is queued at. */
export type QueueLayer = Readonly<{ number: number; head: string }>;

/** A layer a branch holds: the pull request and head it was built from. */
export type BuiltQueueLayer = QueueLayer &
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

/**
 * The prefix of the layer branches, on which the check workflows diff a layer
 * against `origin/main` (`code-check.yml`, `style-check.yml`), reserved by
 * `repo-settings/rulesets/queue-branches.json`.
 */
export const QUEUE_LAYER_BRANCH_PREFIX = 'queue/pr-';

const QUEUE_LAYER_TRAILER = 'Queue-Layer';

/**
 * Which tips on `main` start no stack of their own: a layer right on another
 * layer that could be kept is that one's next (an empty layer leaves the tree
 * as it found it).
 */
const isOnMain = <P extends LayerCandidate>(
  onTree: readonly BuiltQueueLayer[],
  candidates: readonly P[],
  mayStayAhead: (pr: P) => boolean,
): ((layer: BuiltQueueLayer) => boolean) => {
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

const keptStack = <P extends LayerCandidate>(
  candidates: readonly P[],
  built: readonly BuiltQueueLayer[],
  below: Readonly<{ tree: string; tip: string | undefined }>,
  mayStayAhead: (pr: P) => boolean,
): Readonly<{ builtAt: number; stack: readonly P[] }> => {
  // Each layer on what is below whose pull request is a candidate at the head
  // it was built at, with the stack it carries; more than one when an old layer
  // is still being dropped: the one with the layer built last is the one being
  // checked, since a stack is only ever built anew over one that no longer
  // stands, and of two built in the same second the longer. On `main` a layer
  // is matched by tree, as the worker's `matchLayers` does, but one right on
  // another layer there that could be kept is that one's next, not a stack of
  // its own; on a layer, by its commit.
  const onTree = built.filter(({ parentTree }) => parentTree === below.tree);

  const isOnBelow =
    below.tip === undefined
      ? isOnMain(onTree, candidates, mayStayAhead)
      : (layer: BuiltQueueLayer): boolean => layer.parent === below.tip;

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

  return stacks.reduce<Readonly<{ builtAt: number; stack: readonly P[] }>>(
    (kept, each) =>
      each.builtAt > kept.builtAt ||
      (each.builtAt === kept.builtAt && each.stack.length > kept.stack.length)
        ? each
        : kept,
    { builtAt: Number.NEGATIVE_INFINITY, stack: [] },
  );
};
