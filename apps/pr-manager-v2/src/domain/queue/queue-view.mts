// cspell:ignore unlabel
import {
  builtLayersOf,
  isSetAsideReason,
  isVersionBranch,
  layerRunsVerdict,
  layerStandings,
  numberOfQueueLayerBranch,
  parseMergeAfter,
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
  type SetAsideReason,
  type Snapshot,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
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
  /**
   * A word or two under the number: why it waits (`after #N`, `review`,
   * `native stack`, …), or a `Merge-After:` it does not wait for. What it waits
   * for ahead of it in the row is an arc instead (`arcs`).
   */
  why: string | undefined;
  /** What `why` stands for, in full. */
  detail: string | undefined;
  /**
   * Whether `why` names only what it declared it merges after that is not an
   * open pull request, merged or closed mostly, which it does not wait for:
   * drawn struck out, so its author sees the order is met.
   */
  settled: boolean;
  /** Whether its checks failed: drawn in the status red. */
  failing: boolean;
  /**
   * What it waits for ahead of it in the row, each an arc from that box to this
   * one: its number, and how many places back it is.
   */
  arcs: readonly QueueArc[];
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

/** One box ahead in the row that a box waits for. */
export type QueueArc = Readonly<{ number: number; span: number }>;

export type OutsideItem = Readonly<{
  number: number;
  title: string;
  url: string;
  /** In a word: `set aside`, `claimed`, `draft`, `failing`, … */
  why: string;
  /** Whose move it is: `the skill`, `a person`, … */
  whose: string;
  /** The same in a word, for a box, as v1 says it: `skill`, `you`, `nobody`. */
  whoseWord: string;
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

  const orderKnown = queued.every(({ standing }) => standing.kind !== 'unread');

  const running = queued.filter(
    ({ standing }) => standing.kind === 'in-flight',
  );

  const outside = Arr.generate(function* () {
    for (const d of queued) {
      const item = outsideOf(d, snapshot.repository.defaultBranch);

      if (item !== undefined) {
        yield item;
      }
    }
  });

  // Those whose turn has not come, each after what it waits for among them.
  const waiting = afterWhatEachWaitsOn(
    queued.filter(({ standing }) => waitOf(standing) !== undefined),
  );

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

  const picked = [
    ...ahead,
    ...next.filter(({ facts }) => !keptSet.has(facts.number)),
  ] as const;

  // Over the whole stack, since what is done with a layer turns on the ones
  // below: one stacked on another pull request waits, not in `next`.
  const boxLayers = boxLayersOf(kept, layers, layerWorkflows);

  const row = [...running, ...picked, ...waiting] as const;

  // Where each number stands in the row.
  const places = new Map<number, number>(
    row.map(({ facts }, index) => [facts.number, index]),
  );

  const open = new Set<number>(
    Result.isOk(snapshot.pullRequests)
      ? snapshot.pullRequests.value.map(({ number }) => number)
      : [],
  );

  const box = (d: PullRequestDecision): QueueBox => {
    const place = places.get(d.facts.number) ?? 0;

    const arcs = Arr.generate(function* () {
      for (const number of waitedOn(d.standing)) {
        const from = places.get(number);

        if (from !== undefined && from < place) {
          yield { number, span: place - from } as const;
        }
      }
    });

    const waits = waitOf(d.standing, new Set(arcs.map(({ number }) => number)));

    const layer = boxLayers.get(d.facts.number);

    // With nothing it waits for to say: what it is, a layer by where its checks
    // stand.
    const what =
      layer !== undefined
        ? ({ why: layer.note, detail: layer.detail } as const)
        : keptSet.has(d.facts.number)
          ? ({ why: 'checked ahead', detail: CHECKED_AHEAD } as const)
          : isVersionBranch(d.facts.headRef, snapshot.repository.defaultBranch)
            ? ({ why: 'release', detail: 'The version pull request.' } as const)
            : d.facts.mergeState === 'DIRTY'
              ? ({
                  why: 'conflicts',
                  detail:
                    'GitHub says it conflicts with its base: the worker rebases it when its turn comes.',
                } as const)
              : undefined;

    const said =
      what !== undefined && waits?.why === undefined
        ? ({
            why: what.why,
            detail:
              waits === undefined
                ? what.detail
                : (`${waits.detail} ${what.detail}` as const),
          } as const)
        : waits;

    const settled = parseMergeAfter(d.facts.body).filter(
      (n) => n !== d.facts.number && !open.has(n),
    );

    const settledNote =
      said?.why === undefined && Arr.isNonEmpty(settled)
        ? ({
            why: afterWord(settled),
            detail: `Merge-After: ${afterWord(settled).slice('after '.length)} ${settled.length === 1 ? 'is' : 'are'} merged, closed or not a pull request: not a blocker.`,
          } as const)
        : undefined;

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
      why: settledNote?.why ?? said?.why,
      detail: settledNote?.detail ?? said?.detail,
      settled: settledNote !== undefined,
      failing: d.standing.kind === 'failing',
      arcs,
    };
  };

  return {
    base: snapshot.repository.defaultBranch,
    running: running.map(box),
    next: picked.map(box),
    waiting: waiting.map(box),
    outside,
    orderKnown,
  };
};

/**
 * Every count the summary line gives, as v1 counts them: the boxes the worker
 * may take, the running one aside; the one running; how many are `checking
 * ahead`, only where a layer's standing is drawn, since those runs are what the
 * worker is running while what it stacked waits; those outside the row.
 */
export const queueSummary = (view: QueueView): string =>
  [
    `${view.next.length + view.waiting.length} queued`,
    `${view.running.length} running`,
    ...([...view.next, ...view.waiting].some(({ layer }) => layer !== undefined)
      ? [
          `${[...view.next, ...view.waiting].filter(({ layer }) => layer?.standing === 'running').length} checking ahead`,
        ]
      : []),
    `${view.outside.length} set aside`,
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

/** `#1, #2`. */
const numbersWord = (numbers: readonly number[]): string =>
  numbers.map((n) => `#${n}`).join(', ');

/** `after #1, #2`. */
const afterWord = (numbers: readonly number[]): string =>
  `after ${numbersWord(numbers)}` as const;

/**
 * Why one whose turn has not come waits, in a word and in full, or `undefined`
 * for one that does not wait. What it waits for that is `ahead` of it in the
 * row is drawn as an arc and left out of the word, which is `undefined` when
 * that is all of it.
 */
const waitOf = (
  standing: QueueStanding,
  ahead: ReadonlySet<number> = new Set<number>(),
): Readonly<{ why: string | undefined; detail: string }> | undefined => {
  const after = (on: readonly number[]): string | undefined => {
    const notAhead = on.filter((n) => !ahead.has(n));

    return Arr.isNonEmpty(notAhead) ? afterWord(notAhead) : undefined;
  };

  switch (standing.kind) {
    case 'stacked':
      return {
        why: after([standing.on]),
        detail: `Stacked on #${standing.on}: it moves once that one merges.`,
      };

    case 'waiting':
      return {
        why: after(standing.on),
        detail: `Merges after ${numbersWord(standing.on)}${standing.cyclic ? ', which wait on it in turn: a cycle' : ''}.`,
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
        why: after(standing.by.map(({ number }) => number)),
        detail: `The release waits for ${standing.by.map(({ number, isDraft }) => `#${number}${isDraft ? ' (draft)' : ''}`).join(', ')}, labelled blocks-release.`,
      };

    case 'release-stale':
      return {
        why: 'rebuilding',
        detail:
          'The version pull request is behind the tip; the release workflow rebuilds it.',
      };

    case 'failing':
      return {
        why: 'failing',
        detail:
          'Up to date with a required check failed: the worker sets it aside.',
      };

    case 'merge-state':
      return {
        why: 'merge state',
        detail: `GitHub calls it ${standing.state}, which nothing here expects.`,
      };

    case 'ignore':
    case 'unactionable':
    case 'owned':
    case 'candidate':
    case 'in-flight':
    case 'unread':
      return undefined;
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
    case 'unread':
      return [];
  }
};

/**
 * The waits in the order they can end: each after what it waits for among them,
 * by number otherwise (a cycle keeps number order where it closes).
 */
const afterWhatEachWaitsOn = (
  pending: readonly PullRequestDecision[],
): readonly PullRequestDecision[] => {
  const byNumber = pending.toSorted((a, b) => a.facts.number - b.facts.number);

  const mut_ordered: PullRequestDecision[] = [];

  let mut_left: readonly PullRequestDecision[] = byNumber;

  while (Arr.isNonEmpty(mut_left)) {
    const left = new Set<number>(mut_left.map(({ facts }) => facts.number));

    const next =
      mut_left.find(({ standing }) =>
        waitedOn(standing).every((n) => !left.has(n)),
      ) ?? mut_left[0];

    mut_ordered.push(next);

    mut_left = mut_left.filter((each) => each !== next);
  }

  return mut_ordered;
};

/** What `checked ahead` under the number means. */
const CHECKED_AHEAD =
  'Its queue layer is built, so the worker releases it before what the queue’s own order would put first.';

/**
 * Why one is someone's to move, in a word: claimed, or set aside with the
 * worker's reason in a word as v1 says it (`checks`, `conflict`, …), by what
 * the comments say; otherwise a fork's, or set aside.
 */
const ownedWord = (d: PullRequestDecision): string => {
  if (Result.isOk(d.comments)) {
    const { claim, setAside } = d.comments.value;

    if (claim?.says.kind === 'standing' && claim.applies) {
      return 'claimed';
    }

    if (setAside?.says.kind === 'standing' && setAside.applies) {
      const { reason } = setAside.says.record;

      return isSetAsideReason(reason) ? SET_ASIDE_WORDS[reason] : reason;
    }
  }

  return d.facts.fromFork ? 'fork' : 'set aside';
};

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

const outsideOf = (
  d: PullRequestDecision,
  defaultBranch: string,
): OutsideItem | undefined => {
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
        // As v1 says it: a draft, a base that is not the default branch, or a
        // branch the worker does not take.
        why: facts.isDraft
          ? 'draft'
          : facts.baseRef !== defaultBranch
            ? 'base'
            : 'branch',
        whose: 'its author',
        whoseWord: 'you',
        detail: standing.reason,
      };

    case 'owned':
      return {
        ...base,
        why: ownedWord(d),
        whose: WHOSE[standing.owner.owner],
        whoseWord: WHOSE_WORD[standing.owner.owner],
        detail: standing.owner.reason,
      };

    case 'unread':
      return {
        ...base,
        why: 'unread',
        whose: 'unknown',
        whoseWord: '?',
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
    case 'failing':
    case 'merge-state':
      return undefined;
  }
};

const WHOSE = {
  worker: 'the worker',
  skill: 'the unblock-prs skill',
  human: 'a person',
  none: 'nobody (a bug)',
} as const;

const WHOSE_WORD = {
  worker: 'you',
  skill: 'skill',
  human: 'you',
  none: 'nobody',
} as const satisfies ReadonlyRecord<keyof typeof WHOSE, string>;
