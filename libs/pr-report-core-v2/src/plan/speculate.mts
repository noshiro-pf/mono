/**
 * Checking ahead in a cycle (`spec/worker.md`, "Checking ahead"): from the
 * snapshot, the order the candidates are released in, which of them may go, and
 * the work on the layers — what to drop, build and dispatch. Planned only when
 * nothing is in flight: the one released is watched until it merges while
 * nothing is built, and the layers above it stand on its tree once it has.
 */

import { Arr, Result } from 'ts-data-forge';
import {
  queueLayerBranchOf,
  type QueueLayerOrigin,
} from '../conventions/index.mjs';
import {
  builtLayersOf,
  decideSpeculation,
  desiredLayers,
  isQueueLayerRun,
  isStuck,
  layerRunsVerdict,
  matchLayers,
  MAX_DISPATCHES,
  mayBuildAbove,
  planDrop,
  stackedAhead,
  withMovedHeads,
  withStackedAbove,
  type BuiltLayer,
  type LayerCandidate,
  type LayerDrop,
  type LayerRunsVerdict,
  type LayerToBuild,
  type PullRequestDecision,
  type StackedAbove,
} from '../decide/index.mjs';
import type { HeadChecks, Snapshot } from '../snapshot/index.mjs';

/**
 * The plan for the layers this cycle, `candidates` being the queue's own order
 * of those that may be picked now.
 */
export const planSpeculation = ({
  snapshot,
  candidates,
  stackedAbove,
  byNumber,
  config,
  demoted,
  fixable,
  nowEpochMs,
}: SpeculationInput): SpeculationPlan => {
  const { defaultBranch, defaultBranchTip } = snapshot.repository;

  const read = snapshot.queueLayers;

  if (Result.isErr(read)) {
    return fallBack(
      `cannot read the layer branches: ${read.value.message}`,
      candidates,
      [],
    );
  }

  // A head moved to a commit with its layer's tree is still at that layer.
  const built = withMovedHeads(
    builtLayersOf(read.value.layers),
    read.value.movedHeads,
  );

  const { baseTree } = read.value;

  const factsOf = (number: number): LayerCandidate | undefined => {
    const decision = byNumber.get(number);

    return decision === undefined ? undefined : candidateOf(decision);
  };

  const facts = candidates.map(factsOf).filter((each) => each !== undefined);

  const above = Arr.generate(function* () {
    for (const { number, on } of stackedAbove) {
      const pr = factsOf(number);

      if (pr !== undefined) {
        yield { pr, on } as const;
      }
    }
  });

  const { checking, order } = checkingOrder(facts, above, built, baseTree, {
    defaultBranch,
    mayStayAhead: (pr) => !demoted.has(pr.number),
  });

  const desired = desiredLayers(checking, {
    defaultBranch,
    depth: config.depth,
    stackedOn: new Map<number, number>(
      stackedAbove.map(({ number, on }) => [number, on] as const),
    ),
    mergedUpstream: (number) => {
      const parent = byNumber.get(number)?.facts.mergedParent;

      return parent !== undefined &&
        Result.isOk(parent) &&
        parent.value?.containsHead === true
        ? parent.value.headSha
        : undefined;
    },
  });

  const { kept, toBuild, stale } = matchLayers({ desired, built, baseTree });

  const staleDrops = stale.map((layer) =>
    planDrop(
      layer,
      setAsideAt(byNumber.get(layer.number), layer.head),
      nowEpochMs,
    ),
  );

  if (!Arr.isNonEmpty(order)) {
    return {
      order: [],
      release: 'all',
      work: { drops: staleDrops, build: undefined, dispatch: undefined },
      setAside: undefined,
      note: undefined,
    };
  }

  const keptVerdicts = Arr.generate(function* () {
    for (const layer of kept) {
      yield Result.isOk(layer.checks)
        ? Result.ok(layerRunsVerdict(layer.checks.value, config.workflows))
        : Result.err(layer.branch);
    }
  });

  const unread = keptVerdicts.find(Result.isErr);

  if (unread !== undefined) {
    return fallBack(
      `cannot read the runs on ${unread.value}`,
      candidates,
      staleDrops,
    );
  }

  const verdicts = keptVerdicts.filter(Result.isOk).map(({ value }) => value);

  const building = mayBuildAbove(verdicts.map(({ status }) => status))
    ? toBuild
    : ([] as const);

  const layers: readonly QueueLayerOrigin[] = [...kept, ...building] as const;

  const statuses = [
    ...verdicts.map(({ status }) => status),
    ...building.map(() => ({ kind: 'not-dispatched' }) as const),
  ] as const;

  const decided = decideSpeculation({
    layers,
    statuses,
    firstCandidate: order[0],
  });

  const dropsAbove =
    decided.dropFrom === undefined
      ? ([] as const)
      : kept
          .slice(decided.dropFrom)
          .map((layer) => planDrop(layer, false, nowEpochMs));

  const build = Arr.isNonEmpty(building)
    ? ({
        base: kept.at(-1)?.tip ?? defaultBranchTip,
        onTip: !Arr.isNonEmpty(kept),
        layers: building,
      } as const)
    : undefined;

  const first = kept[0];

  const firstVerdict = verdicts[0];

  if (
    first !== undefined &&
    firstVerdict !== undefined &&
    decided.setAside !== undefined
  ) {
    return redFirst(first, firstVerdict, {
      candidates,
      order,
      drops: [...staleDrops, ...dropsAbove],
      fixable,
      nowEpochMs,
      defaultBranch,
      failed: decided.setAside,
    });
  }

  if (
    firstVerdict !== undefined &&
    !decided.release &&
    isStuck(firstVerdict, nowEpochMs)
  ) {
    return fallBack(
      `${queueLayerBranchOf(first?.number ?? 0)} has been running for too long`,
      candidates,
      [...staleDrops, ...dropsAbove],
    );
  }

  const dispatching =
    decided.dispatch === undefined ? undefined : layers[decided.dispatch];

  const dispatchVerdict =
    decided.dispatch === undefined ? undefined : verdicts[decided.dispatch];

  if (decided.dispatch === 0 && dispatchVerdict?.cancelledTooOften === true) {
    return fallBack(
      `${queueLayerBranchOf(dispatching?.number ?? 0)} has had a workflow cancelled ${MAX_DISPATCHES} times`,
      candidates,
      [...staleDrops, ...dropsAbove],
    );
  }

  const dispatch =
    dispatching === undefined || dispatchVerdict?.cancelledTooOften === true
      ? undefined
      : ({
          number: dispatching.number,
          branch: queueLayerBranchOf(dispatching.number),
          workflows: dispatchVerdict?.missing ?? config.workflows,
          first: decided.dispatch === 0,
        } as const);

  return {
    order,
    release: !decided.release
      ? 'none'
      : Arr.isNonEmpty(layers)
        ? 'first'
        : 'all',
    work: { drops: [...staleDrops, ...dropsAbove], build, dispatch },
    setAside: undefined,
    note: decided.release
      ? undefined
      : `waiting for its layer's checks before releasing it${order[0] === candidates[0] ? '' : `, stacked ahead of #${candidates[0] ?? 0}, which the queue's own order puts first`}`,
  };
};

export type SpeculationInput = Readonly<{
  snapshot: Snapshot;
  /** The candidates that may be picked now, in the queue's own order. */
  candidates: readonly number[];
  /**
   * The queued pull requests that may be checked right above the one each is
   * stacked on (`QueueDecision.stackedAbove`), never released from there.
   */
  stackedAbove: readonly Readonly<{ number: number; on: number }>[];
  byNumber: ReadonlyMap<number, PullRequestDecision>;
  config: SpeculateConfig;
  /** Those released and left green, which may not stay ahead. */
  demoted: ReadonlySet<number>;
  /**
   * Whether Auto-fix would fix every failure on `checks`: a red first layer
   * whose failures are all fixers' diffs is dropped, and its pull request
   * released for Auto-fix to act on its own run. Always `false` with Auto-fix
   * off.
   */
  fixable: (checks: HeadChecks) => boolean;
  nowEpochMs: number;
}>;

/** `speculate` of `.github/unblock-prs.json`. */
export type SpeculateConfig = Readonly<{
  workflows: readonly string[];
  depth: number;
}>;

/**
 * The cycle's plan for the layers:
 *
 * - `order` — the candidates as they are released, the stacked first;
 * - `release` — `first` while a layer stands (the layers above carry it),
 *   `all` without layers, `none` while the first waits for its layer;
 * - `work` — done before the cycle's step;
 * - `setAside` — the first layer's pull request, red at the head it was built
 *   from, its runs finished;
 * - `note` — why the first waits, or why checking ahead is off this cycle.
 */
export type SpeculationPlan = Readonly<{
  order: readonly number[];
  release: 'first' | 'all' | 'none';
  work: LayerWork;
  setAside:
    | Readonly<{
        number: number;
        head: string;
        detail: string;
      }>
    | undefined;
  note: string | undefined;
}>;

/**
 * The work on the layers: drop each of `drops` (cancelling or deleting runs as
 * it says, then its branch), build `build.layers` one on another from
 * `build.base`, and dispatch `dispatch.workflows` on `dispatch.branch`. A failed
 * build, or a failed dispatch on the `first` layer, releases as without
 * checking ahead this cycle.
 */
export type LayerWork = Readonly<{
  drops: readonly LayerDrop[];
  build:
    | Readonly<{
        base: string;
        /** Whether `base` is the tip: the first layer of the stack is built. */
        onTip: boolean;
        layers: readonly LayerToBuild[];
      }>
    | undefined;
  dispatch:
    | Readonly<{
        number: number;
        branch: string;
        workflows: readonly string[];
        first: boolean;
      }>
    | undefined;
}>;

const candidateOf = (decision: PullRequestDecision): LayerCandidate => {
  const { facts, review } = decision;

  return {
    number: facts.number,
    headSha: facts.headSha,
    headRef: facts.headRef,
    fromFork: facts.fromFork,
    bypass:
      review !== undefined &&
      Result.isOk(review) &&
      review.value?.kind === 'bypass',
  };
};

/**
 * The order checking ahead stacks in, `checking`: the candidates with the
 * layers already stacked kept first, in the order they were stacked, and the
 * rest after them in their own order, each queued pull request stacked on one
 * of them right after it (or right after the kept stack when that one is kept):
 * checked on top of it, and released only once it has merged. `order` is the
 * candidates alone, in that order, as they are released. A new candidate, or
 * one gaining `priority:high`, reorders only what is not yet stacked.
 */
const checkingOrder = (
  candidates: readonly LayerCandidate[],
  stackedAbove: readonly StackedAbove<LayerCandidate>[],
  built: readonly BuiltLayer[],
  baseTree: string,
  context: Readonly<{
    defaultBranch: string;
    mayStayAhead: (pr: LayerCandidate) => boolean;
  }>,
): Readonly<{
  checking: readonly LayerCandidate[];
  order: readonly number[];
}> => {
  const kept = stackedAhead(
    withStackedAbove(candidates, stackedAbove),
    built,
    baseTree,
    context,
  );

  const keptNumbers = new Set<number>(kept.map(({ number }) => number));

  const notKept = (pr: LayerCandidate): boolean => !keptNumbers.has(pr.number);

  const checking = [
    ...kept,
    // What is stacked on the kept stack goes on top of it.
    ...withStackedAbove(kept, stackedAbove).filter(notKept),
    ...withStackedAbove(candidates.filter(notKept), stackedAbove).filter(
      notKept,
    ),
  ] as const;

  const candidateNumbers = new Set<number>(
    candidates.map(({ number }) => number),
  );

  return {
    checking,
    order: checking
      .map(({ number }) => number)
      .filter((number) => candidateNumbers.has(number)),
  };
};

/**
 * Whether `decision` is set aside for a failure at `head`: its layer at that
 * head keeps its runs, so that the comment links a finished run.
 */
const setAsideAt = (
  decision: PullRequestDecision | undefined,
  head: string,
): boolean => {
  const comments = decision?.comments;

  const says =
    comments === undefined || Result.isErr(comments)
      ? undefined
      : comments.value.setAside?.says;

  return (
    says?.kind === 'standing' &&
    says.record.reason === 'checks-failed' &&
    says.record.headSha === head
  );
};

const fallBack = (
  why: string,
  candidates: readonly number[],
  drops: readonly LayerDrop[],
): SpeculationPlan =>
  ({
    order: candidates,
    release: 'all',
    work: { drops, build: undefined, dispatch: undefined },
    setAside: undefined,
    note: `not checking ahead this cycle (${why}); releasing as usual`,
  }) as const;

/**
 * A red first layer. Every failure a fixer's diff: the layer goes, its runs
 * deleted so that the gate reuses no verdict of them, and the candidates are
 * released as without layers, for Auto-fix to act on the pull request's own
 * run. Otherwise its pull request is set aside once its runs have finished, so
 * that the comment links a run with every failure; until then it waits.
 */
const redFirst = (
  first: BuiltLayer,
  verdict: LayerRunsVerdict,
  context: Readonly<{
    candidates: readonly number[];
    order: readonly number[];
    drops: readonly LayerDrop[];
    fixable: (checks: HeadChecks) => boolean;
    nowEpochMs: number;
    defaultBranch: string;
    failed: Readonly<{ name: string; link: string }>;
  }>,
): SpeculationPlan => {
  const firstChecks = Result.isOk(first.checks)
    ? first.checks.value
    : undefined;

  const branch = queueLayerBranchOf(first.number);

  if (firstChecks !== undefined && context.fixable(firstChecks)) {
    const runs = firstChecks.rounds.filter(isQueueLayerRun);

    return {
      order: context.candidates,
      release: 'all',
      work: {
        drops: Arr.toPushed(context.drops, {
          number: first.number,
          branch,
          tip: first.tip,
          cancel: runs
            .filter(({ completed }) => !completed)
            .map(({ runId }) => runId),
          deleteRuns: runs
            .filter(({ completed }) => completed)
            .map(({ runId }) => runId),
          deleteBranch: true,
        }),
        build: undefined,
        dispatch: undefined,
      },
      setAside: undefined,
      note: `only fixers' diffs failed on ${branch}; releasing #${first.number} for Auto-fix to act on its own run`,
    };
  }

  const finished = verdict.latest.every(
    ({ run }) => run === undefined || run.completed,
  );

  return finished
    ? {
        order: context.order,
        release: 'none',
        work: {
          drops: Arr.toPushed(
            context.drops,
            planDrop(first, true, context.nowEpochMs),
          ),
          build: undefined,
          dispatch: undefined,
        },
        setAside: {
          number: first.number,
          head: first.head,
          detail: `its layer ${branch}, checked ahead of its turn on the tip of ${context.defaultBranch}, failed [${context.failed.name}](${context.failed.link})`,
        },
        note: undefined,
      }
    : {
        order: context.order,
        release: 'none',
        work: { drops: context.drops, build: undefined, dispatch: undefined },
        setAside: undefined,
        note: `${branch} failed ${context.failed.name}; waiting for its other runs to finish before setting #${first.number} aside`,
      };
};
