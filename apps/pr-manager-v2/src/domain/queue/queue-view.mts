import {
  builtLayersOf,
  layerRunsVerdict,
  layerStandings,
  numberOfQueueLayerBranch,
  queueLayerBranchOf,
  stackedAhead,
  withMovedHeads,
  withStackedAbove,
  type LayerCandidate,
  type LayerStanding,
  type PullRequestDecision,
  type QueueDecision,
  type QueueLayerFacts,
  type QueueStanding,
  type Snapshot,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { priorityOf, type Priority } from '../merge-order/index.mjs';

/** What the queue block draws (spec §8). */
export type QueueView = Readonly<{
  /** The branch the queue merges into: `main ←`. */
  base: string;
  /** In flight: up to date and running, or green and about to merge. */
  running: readonly QueueBox[];
  /** The candidates, in the order the worker picks them. */
  next: readonly QueueBox[];
  /** Queued, its turn not come, with why. */
  waiting: readonly QueueBox[];
  /** Queued and none of the worker's to move, with why and whose. */
  outside: readonly OutsideItem[];
  /**
   * `false` while a fact the order turns on is unread: `next` is then every
   * queued pull request not otherwise placed, by number, the order unknown.
   */
  orderKnown: boolean;
}>;

export type QueueBox = Readonly<{
  number: number;
  title: string;
  url: string;
  priority: Priority;
  /** Whether the worker has a `queue/pr-<N>` layer checking it ahead. */
  checkedAhead: boolean;
  /**
   * Where the checks on that layer stand, as the worker takes them; `undefined`
   * when it has none, or when the runs on the layers kept ahead could not all be
   * read, or no workflow is dispatched on them (the box then says only that it
   * is checked ahead).
   */
  layer: BoxLayer | undefined;
  /**
   * The review hold's reason when only a ruleset bypass merges it (#2757): it
   * is picked late, and lands nothing until someone with the bypass merges.
   */
  bypass: string | undefined;
  /** For a waiting box: `after #N`, `review`, `native stack`, … */
  why: string | undefined;
  /** What `why` stands for, in full. */
  detail: string | undefined;
}>;

/**
 * A layer as its box draws it: what the worker does with it, decided over the
 * whole stack (`layerStandings` in `pr-report-core-v2`), in a word and in full.
 */
export type BoxLayer = Readonly<{
  standing: LayerStanding;
  /** `2/6 runs`, `passed`, `failed`, `on red`, `to check`, `not checked`. */
  note: string;
  detail: string;
}>;

export type OutsideItem = Readonly<{
  number: number;
  title: string;
  url: string;
  /** In a word: `set aside`, `claimed`, `draft`, `failing`, … */
  why: string;
  /** Whose move it is: `the skill`, `a person`, … */
  whose: string;
  detail: string;
}>;

/**
 * The queue as the worker would take it, from the page's one decision;
 * `layerWorkflows` are the workflows the worker dispatches on each layer (the
 * `speculate.workflows` of `.github/unblock-prs.json`).
 */
export const queueViewOf = (
  decision: QueueDecision,
  snapshot: Snapshot,
  layerWorkflows: readonly string[],
): QueueView => {
  const queued = decision.pullRequests.filter(
    ({ standing }) => standing.kind !== 'ignore',
  );

  const byNumber = new Map<number, PullRequestDecision>(
    queued.map((d) => [d.facts.number, d]),
  );

  const layers = Result.isOk(snapshot.queueLayers)
    ? snapshot.queueLayers.value.layers
    : ([] as const);

  // The stack the worker keeps, bottom first.
  const kept = keptAheadOf(decision, snapshot);

  const keptSet = new Set<number>(kept);

  const box = (d: PullRequestDecision, layer?: BoxLayer): QueueBox => {
    const waits = waitOf(d.standing);

    return {
      number: d.facts.number,
      title: d.facts.title,
      url: d.facts.url,
      priority: priorityOf(d.facts.labels.map(({ name }) => name)),
      checkedAhead: keptSet.has(d.facts.number),
      layer,
      bypass:
        d.review !== undefined &&
        Result.isOk(d.review) &&
        d.review.value?.kind === 'bypass'
          ? d.review.value.reason
          : undefined,
      why: waits?.why,
      detail: waits?.detail,
    };
  };

  const orderKnown = queued.every(({ standing }) => standing.kind !== 'unread');

  const running = queued.filter(
    ({ standing }) => standing.kind === 'in-flight',
  );

  const waiting = queued.filter(
    ({ standing }) => waitOf(standing) !== undefined,
  );

  const outside = Arr.generate(function* () {
    for (const d of queued) {
      const item = outsideOf(d);

      if (item !== undefined) {
        yield item;
      }
    }
  });

  const placed = new Set<number>([
    ...running.map(({ facts }) => facts.number),
    ...waiting.map(({ facts }) => facts.number),
    ...outside.map(({ number }) => number),
  ]);

  const next = orderKnown
    ? Arr.generate(function* () {
        for (const number of decision.candidates) {
          const d = byNumber.get(number);

          if (d !== undefined) {
            yield d;
          }
        }
      })
    : queued
        .filter(({ facts }) => !placed.has(facts.number))
        .toSorted((a, b) => a.facts.number - b.facts.number);

  // Checked ahead first, as the worker merges them first, in the order they
  // were stacked.
  const ahead = Arr.generate(function* () {
    for (const number of kept) {
      const d = next.find(({ facts }) => facts.number === number);

      if (d !== undefined) {
        yield d;
      }
    }
  });

  // Over the whole stack, since what is done with a layer turns on the ones
  // below: one stacked on another pull request waits, not in `next`.
  const boxLayers = boxLayersOf(kept, layers, layerWorkflows);

  return {
    base: snapshot.repository.defaultBranch,
    running: running.map((d) => box(d)),
    next: [
      ...ahead.map((d) => box(d, boxLayers.get(d.facts.number))),
      ...next
        .filter(({ facts }) => !keptSet.has(facts.number))
        .map((d) => box(d)),
    ],
    waiting: waiting.map((d) => box(d, boxLayers.get(d.facts.number))),
    outside,
    orderKnown,
  };
};

/**
 * Every count the summary line gives; how many are `checking ahead` only where
 * a layer's standing is drawn, since those runs are what the worker is running
 * while what it stacked waits.
 */
export const queueSummary = (view: QueueView): string =>
  [
    `${countQueued(view)} queued`,
    `${view.running.length} running`,
    `${view.outside.filter(({ why }) => why === 'set aside').length} set aside`,
    ...(view.next.some(({ layer }) => layer !== undefined)
      ? [
          `${view.next.filter(({ layer }) => layer?.standing === 'running').length} checking ahead`,
        ]
      : []),
  ].join(' · ');

/**
 * The candidates the worker keeps checked ahead, bottom of the stack first, as
 * it reads them (`stackedAhead` over the layers, a moved head followed to its
 * layer by `withMovedHeads`), with what is stacked on a candidate right above
 * it. What one run of the worker released and left green it keeps to itself, so
 * every layer that stands is taken to stay.
 */
const keptAheadOf = (
  decision: QueueDecision,
  snapshot: Snapshot,
): readonly number[] => {
  if (Result.isErr(snapshot.queueLayers)) {
    return [];
  }

  const { layers, baseTree, movedHeads } = snapshot.queueLayers.value;

  const byNumber = new Map<number, PullRequestDecision>(
    decision.pullRequests.map((d) => [d.facts.number, d]),
  );

  const candidateOf = (number: number): LayerCandidate | undefined => {
    const d = byNumber.get(number);

    return d === undefined
      ? undefined
      : {
          number,
          headSha: d.facts.headSha,
          headRef: d.facts.headRef,
          fromFork: d.facts.fromFork,
          bypass:
            d.review !== undefined &&
            Result.isOk(d.review) &&
            d.review.value?.kind === 'bypass',
        };
  };

  const candidates = Arr.generate(function* () {
    for (const number of decision.candidates) {
      const candidate = candidateOf(number);

      if (candidate !== undefined) {
        yield candidate;
      }
    }
  });

  const above = Arr.generate(function* () {
    for (const { number, on } of decision.stackedAbove) {
      const pr = candidateOf(number);

      if (pr !== undefined) {
        yield { pr, on } as const;
      }
    }
  });

  return stackedAhead(
    withStackedAbove(candidates, above),
    withMovedHeads(builtLayersOf(layers), movedHeads),
    baseTree,
    {
      mayStayAhead: () => true,
      defaultBranch: snapshot.repository.defaultBranch,
    },
  ).map(({ number }) => number);
};

/** A layer's standing in a word for its box, and in full for its tooltip. */
const sayLayer = ({
  branch,
  standing,
  first,
  done,
  total,
}: Readonly<{
  branch: string;
  standing: LayerStanding;
  /** Whether it is the lowest layer, which the worker acts on now. */
  first: boolean;
  done: number;
  total: number;
}>): BoxLayer => {
  const once = first ? '' : 'once first, ';

  switch (standing) {
    case 'running':
      return {
        standing,
        note: `${done}/${total} runs`,
        detail: `${branch}: ${done} of ${total} workflow runs finished.`,
      };

    case 'green':
      return {
        standing,
        note: 'passed',
        detail: `${branch}: all ${total} workflow runs passed; ${once}the worker releases it with no run of its own.`,
      };

    case 'set-aside':
      return {
        standing,
        note: 'failed',
        detail: `${branch}: a workflow run failed, so the worker sets it aside, or releases it when only fixers' diffs failed, for the release's own run to fix.`,
      };

    case 'red':
      return {
        standing,
        note: 'failed',
        detail: `${branch}: a workflow run failed on top of layers not merged yet; the worker judges it once it is first.`,
      };

    case 'dropped':
      return {
        standing,
        note: 'on red',
        detail: `${branch}: a layer below failed, so the worker drops this one and builds it again later.`,
      };

    case 'stalled':
      return {
        standing,
        note: 'not checked',
        detail: `${branch}: a workflow was cancelled too often to dispatch again; ${once}the worker releases it to run its own checks.`,
      };

    case 'to-dispatch':
      return {
        standing,
        note: 'to check',
        detail: `${branch}: the worker dispatches its checks on its next survey.`,
      };

    case 'waits':
      return {
        standing,
        note: 'to check',
        detail: `${branch}: the worker dispatches its checks once every layer below is green or has started all its jobs, and none is red.`,
      };
  }
};

/**
 * What each layer kept ahead, `numbers` in the order they stand, draws, by the
 * worker's own reading of its runs (`layerRunsVerdict`) and what it does with
 * each over the whole stack (`layerStandings`). Nothing when the runs on one of
 * them were not read, since what is done with a layer turns on the ones below,
 * or when no workflow is dispatched on them.
 */
const boxLayersOf = (
  numbers: readonly number[],
  layers: readonly QueueLayerFacts[],
  workflows: readonly string[],
): ReadonlyMap<number, BoxLayer> => {
  if (!Arr.isNonEmpty(workflows)) {
    return new Map<number, BoxLayer>();
  }

  const verdicts = Arr.generate(function* () {
    for (const number of numbers) {
      const checks = layers.find(
        ({ branch }) => numberOfQueueLayerBranch(branch) === number,
      )?.checks;

      if (checks !== undefined && Result.isOk(checks)) {
        yield {
          number,
          verdict: layerRunsVerdict(checks.value, workflows),
        } as const;
      }
    }
  });

  if (verdicts.length !== numbers.length) {
    return new Map<number, BoxLayer>();
  }

  const standings = layerStandings(
    verdicts.map(({ verdict }) => ({
      status: verdict.status,
      cancelledTooOften: verdict.cancelledTooOften,
    })),
  );

  return new Map<number, BoxLayer>(
    Arr.zip(verdicts, standings).map(
      ([{ number, verdict }, standing], index) => [
        number,
        sayLayer({
          branch: queueLayerBranchOf(number),
          standing,
          first: index === 0,
          done: verdict.latest.filter(({ run }) => run?.completed === true)
            .length,
          total: workflows.length,
        }),
      ],
    ),
  );
};

const waitOf = (
  standing: QueueStanding,
): Readonly<{ why: string; detail: string }> | undefined => {
  switch (standing.kind) {
    case 'stacked':
      return {
        why: `after #${standing.on}`,
        detail: `Stacked on #${standing.on}: it moves once that one merges.`,
      };

    case 'waiting':
      return {
        why: `after ${standing.on.map((n) => `#${n}`).join(', ')}`,
        detail: `Merges after ${standing.on.map((n) => `#${n}`).join(', ')}${standing.cyclic ? ', which wait on it in turn: a cycle' : ''}.`,
      };

    case 'native-stack':
      return {
        why: 'native stack',
        detail:
          'In a GitHub stack, which refuses auto-merge: it is merged by hand.',
      };

    case 'held':
      return { why: 'review', detail: standing.reason };

    case 'release-blocked':
      return {
        why: `after ${standing.by.map(({ number }) => `#${number}`).join(', ')}`,
        detail: `The release waits for ${standing.by.map(({ number, isDraft }) => `#${number}${isDraft ? ' (draft)' : ''}`).join(', ')}, labelled blocks-release.`,
      };

    case 'release-stale':
      return {
        why: 'rebuilding',
        detail:
          'The version pull request is behind the tip; the release workflow rebuilds it.',
      };

    case 'ignore':
    case 'unactionable':
    case 'owned':
    case 'merge-state':
    case 'candidate':
    case 'in-flight':
    case 'failing':
    case 'unread':
      return undefined;
  }
};

/** Set aside or claimed, by what the comments say; otherwise its owner's. */
const ownedWord = (d: PullRequestDecision): string => {
  if (Result.isOk(d.comments)) {
    const { claim, setAside } = d.comments.value;

    if (claim?.says.kind === 'standing' && claim.applies) {
      return 'claimed';
    }

    if (setAside?.says.kind === 'standing' && setAside.applies) {
      return 'set aside';
    }
  }

  return 'held';
};

const outsideOf = (d: PullRequestDecision): OutsideItem | undefined => {
  const { standing, facts } = d;

  const base = {
    number: facts.number,
    title: facts.title,
    url: facts.url,
  } as const;

  switch (standing.kind) {
    case 'unactionable':
      return {
        ...base,
        why: facts.isDraft ? 'draft' : 'out of scope',
        whose: 'its author',
        detail: standing.reason,
      };

    case 'owned':
      return {
        ...base,
        why: ownedWord(d),
        whose: WHOSE[standing.owner.owner],
        detail: standing.owner.reason,
      };

    case 'failing':
      return {
        ...base,
        why: 'failing',
        whose: 'the worker',
        detail: 'Up to date with a required check failed.',
      };

    case 'merge-state':
      return {
        ...base,
        why: 'merge state',
        whose: 'a person',
        detail: `GitHub calls it ${standing.state}, which nothing here expects.`,
      };

    case 'unread':
      return {
        ...base,
        why: 'unread',
        whose: 'unknown',
        detail: `${standing.error.what}: ${standing.error.message}`,
      };

    case 'ignore':
    case 'stacked':
    case 'native-stack':
    case 'waiting':
    case 'release-blocked':
    case 'release-stale':
    case 'candidate':
    case 'in-flight':
    case 'held':
      return undefined;
  }
};

const WHOSE = {
  worker: 'the worker',
  skill: 'the unblock-prs skill',
  human: 'a person',
  none: 'nobody (a bug)',
} as const;

const countQueued = (view: QueueView): number =>
  view.running.length +
  view.next.length +
  view.waiting.length +
  view.outside.length;
