// cspell:ignore unlabel

/**
 * `unblock-prs`'s queue as the Queue block draws it: the pull request it is
 * running, the ones it would pick next in the order it would pick them if each
 * merged — one whose turn comes only once those ahead of it merge among them —
 * the ones whose turn would still not come, and — outside the queue — the ones
 * set aside, claimed or otherwise left to someone else.
 *
 * Decided by `pr-report-core`'s `queue-order.mts`, the code the worker decides
 * with, from what the page has read. Two things the worker reads differently
 * are made up from what the page has:
 *
 * - **The merge state.** GraphQL serves `mergeStateStatus` only under a
 *   preview header, so it is put together from `mergeable` and the
 *   comparison: `DIRTY` for a merge that would conflict, `BEHIND` for a head
 *   behind its base, and `BLOCKED` otherwise — which leaves the rest to the
 *   checks and the review, as `BLOCKED` does in the worker.
 * - **What a run has demoted** — one seen green that did not merge, put
 *   last — lives in that run's memory and is not shown.
 *
 * What the worker has checked ahead of its turn goes first, as the worker
 * releases it: the queue layers on the `queue/pr-*` branches, read with the
 * pull requests, and kept ahead by `pr-report-core`'s `stackedAhead`.
 */

import {
  isSetAsideReason,
  isVersionBranch,
  layerStandings,
  orderCandidates,
  QUEUE_LAYER_BRANCH_PREFIX,
  queueGraph,
  queueOwner,
  queueStanding,
  readQueueComments,
  reviewHold,
  stackedAhead,
  stackedLayerParent,
  withMovedQueueHeads,
  withReviewHold,
  withStackedAbove,
  type BuiltQueueLayer,
  type LayerStanding,
  type LayerStatus,
  type NativeStackEntry,
  type QueueContext,
  type QueueFacts,
  type QueueGraph,
  type QueueOwner,
  type QueueStanding,
  type ReportEntry,
  type ReviewHold,
  type ReviewRules,
  type ReviewState,
  type SetAsideReason,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { priorityOf, type Priority } from './priority.mjs';

/** What the queue is decided from. */
export type QueueInput = Readonly<{
  defaultBranch: string;
  /** What a claim's age is measured against. */
  nowEpochMs: number;
  rules: ReviewRules;
  pulls: readonly QueuePull[];
  /**
   * The `Start-After:` of each issue whose body was read, which a pull request
   * closing it inherits as a merge order. Absent, none is.
   */
  startAfterOf?: ReadonlyMap<number, readonly number[]>;
  /**
   * The queue layers `unblock-prs` has built and the tree of the default
   * branch's tip they stand on. Absent, nothing is kept ahead of the order.
   */
  layers?: QueueLayers | undefined;
}>;

/** What {@link QueueInput}'s `layers` holds. */
export type QueueLayers = Readonly<{
  built: readonly CheckedQueueLayer[];
  baseTree: string;
}>;

/** A layer `unblock-prs` has built, and where the checks on it stand. */
export type CheckedQueueLayer = BuiltQueueLayer &
  Readonly<{
    /** `undefined` when they were not read. */
    checks: LayerChecks | undefined;
  }>;

/**
 * Where the checks `unblock-prs` dispatches on a queue layer stand, as it reads
 * them (`layerRunsVerdict` in `pr-report-core`).
 */
export type LayerChecks = Readonly<{
  /**
   * As the worker decides by it. `running` is always `queued`: the page does
   * not read the jobs, so it never takes the layers below for started.
   */
  status: LayerStatus;
  /** A workflow to dispatch again has been cancelled too often to. */
  cancelledTooOften: boolean;
  /** How many of the workflows' latest runs have finished. */
  done: number;
  /** How many workflows it dispatches. */
  total: number;
}>;

/** Everything read about one open pull request that its place turns on. */
export type QueuePull = Readonly<{
  entry: ReportEntry;
  /** The tip of its base, which a set-aside was recorded against. */
  baseTip: string;
  /** Its head's tree, `undefined` when it was not read. */
  headTree: string | undefined;
  /** GraphQL's `mergeable`: `CONFLICTING`, `MERGEABLE` or `UNKNOWN`. */
  mergeable: string;
  nativeStack: NativeStackEntry | undefined;
  review: ReviewState;
  /** What the viewer's own comments on it say, oldest first. */
  ownComments: readonly string[];
}>;

/** One place in the queue. */
export type QueueSlot = Readonly<{
  number: number;
  title: string;
  url: string;
  /**
   * `running` is in flight — its checks running, or green and about to
   * merge; `next` is a candidate; `waiting` is one whose turn has not come;
   * `failing` is up to date with a required check failed.
   */
  kind: 'running' | 'next' | 'waiting' | 'failing';
  /**
   * A word or two under the number: why it waits, or what it is. What it waits
   * for that is ahead of it in the row is an arc instead (`arcs`).
   */
  note: string | undefined;
  /**
   * Whether the note names only what it declared it merges after and is not an
   * open pull request, queued or not — merged or closed, mostly — which it does
   * not wait for: drawn struck out.
   */
  noteSettled: boolean;
  /** The tooltip's second line, when the note leaves something out. */
  detail: string | undefined;
  /**
   * What it waits for that is ahead of it in the row, each drawn as an arc from
   * that box to this one: its number, and how many places back it is.
   */
  arcs: readonly SlotArc[];
  priority: Priority;
  /**
   * Where the checks on its queue layer stand, for one the worker has checked
   * ahead of its turn and whose layer's checks were read.
   */
  layer: SlotLayer | undefined;
}>;

/** One box ahead in the row that a box waits for (`QueueSlot`'s `arcs`). */
export type SlotArc = Readonly<{ number: number; span: number }>;

/**
 * A layer as the box draws it: what the worker does with it (`layerStandings`
 * in `pr-report-core`), and how far its runs have got.
 */
export type SlotLayer = Readonly<{
  standing: LayerStanding;
  /** Whether it is the lowest layer, which the worker acts on this survey. */
  first: boolean;
  done: number;
  total: number;
}>;

/** One pull request outside the queue: not the worker's to move. */
export type OutsideNode = Readonly<{
  number: number;
  title: string;
  url: string;
  /** Why, in a word. */
  reason: string;
  /** Whose it is to move: the `/unblock-prs` skill, a person, or nobody. */
  owner: 'skill' | 'you' | 'nobody';
  detail: string;
  priority: Priority;
}>;

export type QueueView = Readonly<{
  /** The branch the head of the queue merges into. */
  base: string;
  /**
   * Running first, then the candidates in the order they would be picked if
   * each merged, with what waits only for those among them, then the rest.
   */
  slots: readonly QueueSlot[];
  outside: readonly OutsideNode[];
}>;

export const queueViewOf = ({
  defaultBranch,
  nowEpochMs,
  rules,
  pulls,
  startAfterOf,
  layers,
}: QueueInput): QueueView => {
  const graph = queueGraph(
    pulls.map(({ entry }) => ({
      number: entry.number,
      body: entry.body,
      isDraft: entry.isDraft,
      labels: labelNamesOf(entry),
      headRef: entry.headRef,
      baseRef: entry.baseRef,
      fromFork: entry.fromFork,
      closes: entry.linkedIssues
        .filter(({ state }) => state !== 'closed')
        .map(({ number }) => number),
    })),
    defaultBranch,
    startAfterOf,
  );

  const owned = pulls.map((pull) => {
    const read = readOwner(pull, {
      defaultBranch,
      nowEpochMs,
      baseRef: pull.entry.baseRef,
      baseTip: pull.baseTip,
      stackedOn: graph.stackParents.get(pull.entry.number),
      inCycle: graph.cyclic.has(pull.entry.number),
    });

    return {
      pull,
      owner: read.owner,
      // A layer is the worker's whatever its comments say (`queueOwner`). Once
      // the layer below it merges they are read as for any other, against a
      // base that has moved, which clears the set-asides a moved base clears.
      ownerOnceLanded: graph.stackParents.has(pull.entry.number)
        ? readOwner(pull, {
            defaultBranch,
            nowEpochMs,
            baseRef: defaultBranch,
            baseTip: MOVED_BASE_TIP,
            stackedOn: undefined,
            inCycle: graph.cyclic.has(pull.entry.number),
          }).owner
        : read.owner,
      claimed: read.claimed,
      setAsideReason: read.setAsideReason,
    };
  });

  const context: QueueContext = {
    ...graph,
    defaultBranch,
    owners: new Map(
      Arr.generate(function* () {
        for (const { pull, owner } of owned) {
          if (owner !== undefined) {
            yield [pull.entry.number, owner] as const;
          }
        }
      }),
    ),
  } as const;

  const decided = owned.map((each) => {
    const facts = factsOf(each.pull);

    const hold = reviewHold(each.pull.review, rules);

    return {
      ...each,
      facts,
      bypass: hold?.kind === 'bypass',
      hold,
      standing: withReviewHold(
        queueStanding(facts, context, readsOf(each.pull)),
        facts.mergeState,
        hold,
      ),
    };
  });

  const byNumber = decided.toSorted((a, b) => a.facts.number - b.facts.number);

  const running = byNumber.filter(
    ({ standing }) => standing.kind === 'in-flight',
  );

  const { picked, kept } = pickOrder({
    running,
    queued: byNumber,
    context,
    layers,
  });

  const pickedNumbers = new Set(picked.map(({ facts }) => facts.number));

  const rest = byNumber.filter(
    ({ standing, facts }) =>
      waitOf(standing) !== 'none' && !pickedNumbers.has(facts.number),
  );

  const slotLayers = slotLayersOf(
    picked
      .filter(({ facts }) => kept.has(facts.number))
      .map(({ facts }) => facts.number),
    layers,
  );

  const row = [...running, ...picked, ...rest] as const;

  // Where each number stands in the row.
  const places: ReadonlyMap<number, number> = new Map(
    row.map(({ facts }, index) => [facts.number, index] as const),
  );

  return {
    base: defaultBranch,
    slots: row.map(({ pull, facts, standing }, index) =>
      slotOf(pull, facts, standing, {
        defaultBranch,
        keptAhead: kept.has(facts.number),
        layer: slotLayers.get(facts.number),
        place: index,
        places,
        settled: settledOf(graph, facts.number),
      }),
    ),
    outside: Arr.generate(function* () {
      for (const {
        pull,
        standing,
        owner,
        claimed,
        setAsideReason,
      } of byNumber) {
        if (standing.kind === 'owned' || standing.kind === 'unactionable') {
          yield outsideOf(pull, {
            owner: standing.kind === 'owned' ? standing.owner : owner,
            reason:
              standing.kind === 'unactionable'
                ? unactionableWord(pull.entry, defaultBranch)
                : claimed
                  ? 'claimed'
                  : setAsideReason !== undefined
                    ? setAsideWord(setAsideReason)
                    : ownedWord(pull.entry, graph.cyclic),
            detail:
              standing.kind === 'unactionable'
                ? standing.reason
                : standing.owner.reason,
          });
        }
      }
    }),
  };
};

/** A base tip no set-aside was recorded against: the base has moved. */
const MOVED_BASE_TIP = '';

/** What `checked ahead` under the number means. */
const KEPT_AHEAD_DETAIL =
  'its queue layer is built, so the worker releases it before what the queue’s own order would put first';

const labelNamesOf = (entry: ReportEntry): readonly string[] =>
  entry.labels.map((label) => label.name);

/**
 * Who moves `pull` next as its comments say against the base given, whether a
 * claim says it, and the reason a standing set-aside gives.
 */
const readOwner = (
  pull: QueuePull,
  base: Readonly<{
    defaultBranch: string;
    nowEpochMs: number;
    baseRef: string;
    baseTip: string;
    stackedOn: number | undefined;
    inCycle: boolean;
  }>,
): Readonly<{
  owner: QueueOwner | undefined;
  claimed: boolean;
  setAsideReason: string | undefined;
}> => {
  const comments = readQueueComments(
    pull.ownComments.map((body, index) => ({ id: index, body })),
    {
      headSha: pull.entry.headSha,
      baseTip: base.baseTip,
      nowEpochMs: base.nowEpochMs,
    },
  );

  // The set-aside as the worker holds it: one recorded against a base that has
  // moved, for a reason the move may clear, is taken back and tried again
  // (`setAsideApplies`).
  const setAside =
    comments.setAside?.applies === true ? comments.setAside.says : undefined;

  const claim = comments.claim?.applies === true ? comments.claim : undefined;

  return {
    claimed: claim !== undefined,
    setAsideReason:
      setAside?.kind === 'standing' ? setAside.setAside.reason : undefined,
    owner: queueOwner({
      number: pull.entry.number,
      labels: labelNamesOf(pull.entry),
      isDraft: pull.entry.isDraft,
      fromFork: pull.entry.fromFork,
      headRef: pull.entry.headRef,
      headSha: pull.entry.headSha,
      baseRef: base.baseRef,
      defaultBranch: base.defaultBranch,
      stackedOn: base.stackedOn,
      inCycle: base.inCycle,
      setAside,
      claim: claim?.says,
      nowEpochMs: base.nowEpochMs,
    }),
  } as const;
};

/** One open pull request with where it stands, as {@link queueViewOf} has it. */
type Decided = Readonly<{
  pull: QueuePull;
  facts: QueueFacts;
  bypass: boolean;
  hold: ReviewHold | undefined;
  /** Who moves it once the layer below it has merged, for a layer. */
  ownerOnceLanded: QueueOwner | undefined;
  standing: QueueStanding;
}>;

/**
 * How a pull request in the queue waits: `none` for one running, a candidate or
 * not in the queue at all; `merges` for one whose wait other pull requests
 * merging may end — what it is stacked on, declared or inherited an order on,
 * or holds the release, and a version pull request built before the tip or not
 * yet compared with it, which the release workflow rebuilds on every push — and
 * `other` for the rest.
 */
const waitOf = (standing: QueueStanding): 'none' | 'merges' | 'other' => {
  switch (standing.kind) {
    case 'ignore':
    case 'unactionable':
    case 'owned':
    case 'candidate':
    case 'in-flight':
      return 'none';

    case 'stacked':
    case 'waiting':
    case 'release-blocked':
    case 'release-stale':
      return 'merges';

    case 'needs':
      return standing.read === 'rebuiltOnTip' ? 'merges' : 'other';

    case 'native-stack':
    case 'merge-state':
    case 'failing':
    case 'held':
      return 'other';
  }
};

/** Everything `queueStanding` may ask for, read already. */
const readsOf = ({
  entry,
  nativeStack,
}: QueuePull): Parameters<typeof queueStanding>[2] =>
  ({
    nativeStack: nativeStack ?? 'none',
    // A branch whose head has every commit of its base was built on the tip.
    ...(entry.comparison === undefined
      ? {}
      : { rebuiltOnTip: entry.comparison.behindBy === 0 }),
    checksFailed: entry.checks.verdict === 'failing',
  }) as const;

/**
 * The queue once `merged` had merged: the layers stacked on them moved onto the
 * default branch, each with the owner its comments give it there
 * (`ownerOnceLanded`), and what they held no longer open.
 */
const contextOnceMerged = (
  context: QueueContext,
  merged: ReadonlySet<number>,
  queued: readonly Decided[],
): QueueContext =>
  ({
    ...context,
    owners: new Map(
      Arr.generate(function* () {
        for (const { facts, ownerOnceLanded } of queued) {
          const parent = context.stackParents.get(facts.number);

          const owner =
            parent !== undefined && merged.has(parent)
              ? ownerOnceLanded
              : context.owners.get(facts.number);

          if (owner !== undefined) {
            yield [facts.number, owner] as const;
          }
        }
      }),
    ),
    stackParents: new Map(
      Array.from(context.stackParents).filter(([, on]) => !merged.has(on)),
    ),
    openNumbers: new Set(
      Array.from(context.openNumbers).filter((n) => !merged.has(n)),
    ),
    releaseBlockers: context.releaseBlockers.filter(
      ({ number }) => !merged.has(number),
    ),
  }) as const;

/**
 * What one that waits would stand as in `after` (`contextOnceMerged`), once at
 * least one pull request has merged: moved onto the default branch, and behind
 * it, if the layer below it has merged, and the version pull request rebuilt on
 * the moved tip, as the release workflow does on every push.
 */
const standingOnceMerged = (
  { pull, facts, hold }: Decided,
  context: QueueContext,
  after: QueueContext,
): QueueStanding['kind'] => {
  const landed =
    context.stackParents.has(facts.number) &&
    !after.stackParents.has(facts.number);

  const moved: QueueFacts = landed
    ? ({
        ...facts,
        baseRef: context.defaultBranch,
        mergeState:
          facts.mergeState === 'DIRTY'
            ? ('DIRTY' as const)
            : ('BEHIND' as const),
      } as const)
    : facts;

  return withReviewHold(
    queueStanding(moved, after, { ...readsOf(pull), rebuiltOnTip: true }),
    moved.mergeState,
    hold,
  ).kind;
};

/**
 * The order the worker would pick the candidates in if every one it picked
 * merged: the running ones first, then, one pick at a time, the first of the
 * candidates by `orderCandidates`, among which each pull request whose wait the
 * merges so far have ended takes its place. So one that waits only for what is
 * ahead of it is drawn where it would be picked — a `priority:high` one right
 * after what it waits for — rather than after every candidate. What waits on
 * something that does not merge on the way, or is failing or held, is left out,
 * for the caller to put after. One only a ruleset bypass merges is picked and
 * not merged — the worker sets it aside for a person once it is green — so what
 * waits for it is left waiting.
 *
 * What the worker has stacked (`layers`) is picked first, in the order it was
 * stacked, as the worker releases it (`stackedAhead`), and `kept` names it. A
 * stack runs through the layer of a pull request stacked on a candidate, which
 * the worker checks right above it (`withStackedAbove`), and that one is picked
 * in its place in the stack once the one below has merged.
 */
const pickOrder = ({
  running,
  queued,
  context,
  layers,
}: Readonly<{
  running: readonly Decided[];
  queued: readonly Decided[];
  context: QueueContext;
  layers: QueueLayers | undefined;
}>): Readonly<{ picked: readonly Decided[]; kept: ReadonlySet<number> }> => {
  const mut_merged = new Set<number>(
    running.filter(({ bypass }) => !bypass).map(({ facts }) => facts.number),
  );

  let mut_pool: readonly Decided[] = queued.filter(
    ({ standing }) => standing.kind === 'candidate',
  );

  let mut_pending: readonly Decided[] = queued.filter(
    ({ standing }) => waitOf(standing) === 'merges',
  );

  const mut_picked: Decided[] = [];

  // What another merge ends the wait of joins the candidates. Asked only when
  // one has merged: nothing changes for the rest until then.
  const promote = (): void => {
    const after = contextOnceMerged(context, mut_merged, queued);

    const promoted = mut_pending.filter(
      (each) => standingOnceMerged(each, context, after) === 'candidate',
    );

    mut_pool = [...mut_pool, ...promoted];

    mut_pending = mut_pending.filter((each) => !promoted.includes(each));
  };

  if (mut_merged.size > 0) {
    promote();
  }

  const ordered = (pool: readonly Decided[]): readonly Decided[] =>
    orderCandidates(
      pool,
      ({ facts }) => facts,
      // What a run of the worker has demoted is not known here.
      {
        defaultBranch: context.defaultBranch,
        demoted: () => false,
        bypass: ({ bypass }) => bypass,
      },
    );

  const asLayer = (decided: Decided) =>
    ({
      number: decided.facts.number,
      headRefOid: decided.pull.entry.headSha,
      headRefName: decided.facts.headRef,
      isCrossRepository: decided.pull.entry.fromFork,
      decided,
    }) as const;

  const stackedAbove = Arr.generate(function* () {
    for (const decided of queued) {
      const on = stackedLayerParent(
        { number: decided.facts.number, fromFork: decided.pull.entry.fromFork },
        decided.standing,
        context,
      );

      if (on !== undefined) {
        yield { pr: asLayer(decided), on };
      }
    }
  });

  const kept =
    layers === undefined
      ? ([] as const)
      : stackedAhead(
          withStackedAbove(ordered(mut_pool).map(asLayer), stackedAbove),
          // A head moved to its layer's tree is still at its layer, as the
          // worker reads it.
          withMovedQueueHeads(
            layers.built,
            new Map(
              Arr.generate(function* () {
                for (const { pull } of [...running, ...queued]) {
                  if (pull.headTree !== undefined) {
                    yield [
                      pull.entry.number,
                      { head: pull.entry.headSha, tree: pull.headTree },
                    ] as const;
                  }
                }
              }),
            ),
          ),
          layers.baseTree,
          {
            mayStayAhead: () => true,
            defaultBranch: context.defaultBranch,
            isBypass: ({ decided }) => decided.bypass,
          },
        ).map(({ decided }) => decided);

  const keptNumbers: ReadonlySet<number> = new Set(
    kept.map(({ facts }) => facts.number),
  );

  for (;;) {
    const pool = mut_pool;

    const [next] = [
      ...kept.filter((each) => pool.includes(each)),
      ...ordered(pool),
    ] as const;

    if (next === undefined) {
      return { picked: mut_picked, kept: keptNumbers };
    }

    mut_picked.push(next);

    mut_pool = mut_pool.filter((each) => each !== next);

    if (next.bypass) {
      continue;
    }

    mut_merged.add(next.facts.number);

    promote();
  }
};

/** What `queueStanding` decides from, as the page read it. */
const factsOf = ({ entry, mergeable }: QueuePull): QueueFacts =>
  ({
    number: entry.number,
    state: 'OPEN',
    labels: labelNamesOf(entry),
    isDraft: entry.isDraft,
    headRef: entry.headRef,
    baseRef: entry.baseRef,
    mergeState:
      mergeable === 'CONFLICTING'
        ? ('DIRTY' as const)
        : entry.comparison === undefined
          ? ('UNKNOWN' as const)
          : entry.comparison.behindBy > 0
            ? ('BEHIND' as const)
            : ('BLOCKED' as const),
    autoMerge: entry.autoMerge,
  }) as const;

/** `after #1`, or `after #1 +2` for one waiting on three. */
const afterWord = (numbers: readonly number[]): string =>
  Arr.isNonEmpty(numbers)
    ? numbers.length === 1
      ? (`after #${numbers[0]}` as const)
      : (`after #${numbers[0]} +${numbers.length - 1}` as const)
    : 'waiting';

/** `#1, #2`. */
const numbersWord = (numbers: readonly number[]): string =>
  numbers.map((n) => `#${n}`).join(', ');

/**
 * Why `Merge-After:` numbers that are not open pull requests are struck out:
 * the worker waits for every open pull request, queued or not, a draft
 * included, and for nothing else (`waitingOn` in `pr-report-core`). Merged or
 * closed, mostly; an issue named by mistake is one too, and the page reads the
 * state of neither, so the words name all three.
 */
const notBlocking = (numbers: readonly number[]): string =>
  `${numbersWord(numbers)} ${Arr.isFixedLengthArray(1, numbers) ? 'is' : 'are'} merged, closed or not a pull request: not a blocker` as const;

/**
 * What a pull request declared it merges after — its `Merge-After:`, not what
 * it inherits from the issues it closes, which may name an issue — that is not
 * an open pull request. The worker does not wait for it (`waitingOn` in
 * `pr-report-core`).
 */
const settledOf = (graph: QueueGraph, number: number): readonly number[] => {
  const inherited = graph.inherited.get(number) ?? [];

  return (graph.dependencies.get(number) ?? []).filter(
    (n) => !graph.openNumbers.has(n) && !inherited.includes(n),
  );
};

/**
 * The word under the number of one that waits, and what it leaves out. What it
 * waits for that is `ahead` of it in the row is drawn as an arc and left out of
 * the word; the word is `undefined` when that is all of it.
 */
const sayStanding = (
  standing: QueueStanding,
  ahead: ReadonlySet<number>,
):
  | Readonly<{ note: string | undefined; detail: string | undefined }>
  | undefined => {
  const waitWord = (on: readonly number[]): string | undefined => {
    const notAhead = on.filter((n) => !ahead.has(n));

    return Arr.isNonEmpty(notAhead) ? afterWord(notAhead) : undefined;
  };

  switch (standing.kind) {
    case 'stacked':
      return {
        note: waitWord([standing.on]),
        detail: `stacked on #${standing.on}`,
      };

    case 'waiting':
      return {
        note: waitWord(standing.on),
        detail: `Merge-After: ${numbersWord(standing.on)}`,
      };

    case 'release-blocked': {
      const by = standing.by.map(({ number }) => number);

      return {
        note: waitWord(by),
        detail: `held by blocks-release on ${numbersWord(by)}`,
      };
    }

    case 'release-stale':
      return {
        note: 'rebuilding',
        detail: 'built before the tip; the release workflow rebuilds it',
      };

    case 'native-stack':
      return {
        note: 'native stack',
        detail: `layer ${standing.entry.position} of ${standing.entry.size}; merged by hand`,
      };

    case 'held':
      return { note: 'review', detail: standing.reason };

    case 'failing':
      return { note: 'failing', detail: 'a required check failed' };

    case 'merge-state':
      return {
        note: 'unknown',
        detail: 'GitHub could not compare it with its base',
      };

    case 'needs':
      return { note: 'unknown', detail: `${standing.read} could not be read` };

    case 'ignore':
    case 'unactionable':
    case 'owned':
    case 'candidate':
    case 'in-flight':
      return undefined;
  }
};

/**
 * What each layer kept ahead, `numbers` in the order they stand, draws: what
 * the worker does with it, decided over the whole stack as the worker decides
 * it. Nothing when the checks on one of them were not read, since what is done
 * with a layer turns on the ones below.
 */
const slotLayersOf = (
  numbers: readonly number[],
  layers: QueueLayers | undefined,
): ReadonlyMap<number, SlotLayer> => {
  const checks = Arr.generate(function* () {
    for (const number of numbers) {
      const read = layers?.built.find(
        (built) => built.number === number,
      )?.checks;

      if (read !== undefined) {
        yield { number, ...read } as const;
      }
    }
  });

  if (checks.length !== numbers.length) {
    return new Map<number, SlotLayer>();
  }

  return new Map<number, SlotLayer>(
    Arr.zip(checks, layerStandings(checks)).map(
      ([{ number, done, total }, standing], index) => [
        number,
        { standing, first: index === 0, done, total },
      ],
    ),
  );
};

/** Where the checks on the layer of one checked ahead stand, in words. */
const sayLayer = (
  number: number,
  { standing, first, done, total }: SlotLayer,
): Readonly<{ note: string; detail: string }> => {
  // The prefix is the worker's own spelling of a layer branch, shared through
  // pr-report-core with the parser of its number; the number is all it adds.
  const branch = `${QUEUE_LAYER_BRANCH_PREFIX}${number}` as const;

  switch (standing) {
    case 'running':
      return {
        note: `${done}/${total} runs`,
        detail: `${branch}: ${done} of ${total} workflow runs finished`,
      };

    case 'green':
      return {
        note: 'passed',
        detail: `${branch}: all ${total} workflow runs passed — ${first ? '' : 'once first, '}the worker releases it with no run of its own`,
      };

    case 'set-aside':
      return {
        note: 'failed',
        detail: `${branch}: a workflow run failed, so the worker sets it aside — or releases it, when only fixers' diffs failed, for the release's own run to fix`,
      };

    case 'red':
      return {
        note: 'failed',
        detail: `${branch}: a workflow run failed on top of layers not merged yet — the worker judges it once it is first`,
      };

    case 'dropped':
      return {
        note: 'on red',
        detail: `${branch}: a layer below failed, so the worker drops this one and builds it again later`,
      };

    case 'stalled':
      return {
        note: 'not checked',
        detail: `${branch}: a workflow was cancelled too often to dispatch again — ${first ? '' : 'once first, '}the worker releases it to run its own checks`,
      };

    case 'to-dispatch':
      return {
        note: 'to check',
        detail: `${branch}: the worker dispatches its checks on its next survey`,
      };

    case 'waits':
      return {
        note: 'to check',
        detail: `${branch}: the worker dispatches its checks once every layer below is green or has started all its jobs, and none is red`,
      };
  }
};

/** What one waits for other pull requests merging to end its wait. */
const waitedOn = (standing: QueueStanding): readonly number[] => {
  switch (standing.kind) {
    case 'stacked':
      return [standing.on];

    case 'waiting':
      return standing.on;

    case 'release-blocked':
      return standing.by.map(({ number }) => number);

    case 'ignore':
    case 'unactionable':
    case 'owned':
    case 'native-stack':
    case 'release-stale':
    case 'merge-state':
    case 'candidate':
    case 'in-flight':
    case 'failing':
    case 'held':
    case 'needs':
      return [];
  }
};

/** Two tooltip lines' worth, as one. */
const detailOf = (first: string | undefined, second: string): string =>
  first === undefined ? second : (`${first}; ${second}` as const);

const slotOf = (
  pull: QueuePull,
  facts: QueueFacts,
  standing: QueueStanding,
  {
    defaultBranch,
    keptAhead,
    layer,
    place,
    places,
    settled,
  }: Readonly<{
    defaultBranch: string;
    keptAhead: boolean;
    layer: SlotLayer | undefined;
    /** Where this one stands in the row. */
    place: number;
    /** Where each number stands in the row. */
    places: ReadonlyMap<number, number>;
    /** What it declared it merges after that is not an open pull request. */
    settled: readonly number[];
  }>,
): QueueSlot => {
  const { entry } = pull;

  const release = isVersionBranch(entry.headRef, defaultBranch);

  const arcs = Arr.generate(function* () {
    for (const number of waitedOn(standing)) {
      const from = places.get(number);

      if (from !== undefined && from < place) {
        yield { number, span: place - from } as const;
      }
    }
  });

  const waited = sayStanding(
    standing,
    new Set(arcs.map(({ number }) => number)),
  );

  const layerSaid =
    layer === undefined ? undefined : sayLayer(entry.number, layer);

  // A wait drawn wholly as arcs leaves the word to the layer, and its detail,
  // which a screen reader reads for the arcs, to the tooltip.
  const said =
    waited === undefined
      ? layerSaid
      : layerSaid === undefined || waited.note !== undefined
        ? waited
        : ({
            note: layerSaid.note,
            detail: detailOf(waited.detail, layerSaid.detail),
          } as const);

  const note =
    said?.note ??
    (keptAhead
      ? 'checked ahead'
      : release
        ? 'release'
        : facts.mergeState === 'DIRTY'
          ? 'conflicts'
          : undefined);

  // Said only when there is nothing else to say: what it is still waiting for,
  // or how it stands, comes first.
  const settledNote =
    note === undefined && Arr.isNonEmpty(settled)
      ? ({
          note: afterWord(settled),
          detail:
            said?.detail === undefined
              ? (`Merge-After: ${notBlocking(settled)}` as const)
              : (`${said.detail}; ${notBlocking(settled)}` as const),
        } as const)
      : undefined;

  return {
    number: entry.number,
    title: entry.title,
    url: entry.url,
    kind:
      standing.kind === 'in-flight'
        ? 'running'
        : standing.kind === 'candidate'
          ? 'next'
          : standing.kind === 'failing'
            ? 'failing'
            : 'waiting',
    note: settledNote?.note ?? note,
    noteSettled: settledNote !== undefined,
    detail:
      settledNote?.detail ??
      // The note says it is checked ahead when nothing before it says more, and
      // the detail says what that means after what it waits for.
      (keptAhead && said?.note === undefined
        ? detailOf(said?.detail, KEPT_AHEAD_DETAIL)
        : said?.detail),
    priority: priorityOf(entry.labels),
    layer,
    arcs,
  };
};

const outsideOf = (
  { entry }: QueuePull,
  said: Readonly<{
    owner: QueueOwner | undefined;
    reason: string;
    detail: string;
  }>,
): OutsideNode =>
  ({
    number: entry.number,
    title: entry.title,
    url: entry.url,
    reason: said.reason,
    owner:
      said.owner?.owner === 'skill'
        ? ('skill' as const)
        : said.owner?.owner === 'none'
          ? ('nobody' as const)
          : ('you' as const),
    detail: said.detail,
    priority: priorityOf(entry.labels),
  }) as const;

/** Why `queueStanding` will not act on one, in a word. */
const unactionableWord = (entry: ReportEntry, defaultBranch: string): string =>
  entry.isDraft ? 'draft' : entry.baseRef !== defaultBranch ? 'base' : 'branch';

/** Why one with no comment on it is a person's, in a word (`queueOwner`). */
const ownedWord = (entry: ReportEntry, cyclic: ReadonlySet<number>): string =>
  entry.fromFork ? 'fork' : cyclic.has(entry.number) ? 'cycle' : 'set aside';

/** A reason this page does not know, from a newer worker, as it is. */
const setAsideWord = (reason: string): string =>
  isSetAsideReason(reason) ? SET_ASIDE_WORDS[reason] : reason;

/** Each reason the worker sets aside for, in a word. */
const SET_ASIDE_WORDS = {
  'already-in-base': 'in base',
  'arm-failed': 'arm failed',
  'awaiting-bypass': 'bypass',
  'checks-failed': 'checks',
  'checks-not-started': 'no checks',
  'head-out-of-sync': 'out of sync',
  'not-merging': 'not merging',
  'push-failed': 'push failed',
  'read-failed': 'unreadable',
  'rebase-failed': 'conflict',
  'unlabel-failed': 'skip-ci stuck',
  'watch-timeout': 'timeout',
} as const satisfies ReadonlyRecord<SetAsideReason, string>;
