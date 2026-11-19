import {
  isVersionBranch,
  numberOfQueueLayerBranch,
  parseMergeAfter,
  type PullRequestDecision,
  type QueueDecision,
  type QueueStanding,
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
  /** The same in a word, for a box: `skill`, `person`, … */
  whoseWord: string;
  detail: string;
}>;

/** The queue as the worker would take it, from the page's one decision. */
export const queueViewOf = (
  decision: QueueDecision,
  snapshot: Snapshot,
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

  const layered = new Set<number>(
    Arr.generate(function* () {
      for (const { branch } of layers) {
        const number = numberOfQueueLayerBranch(branch);

        if (number !== undefined) {
          yield number;
        }
      }
    }),
  );

  const orderKnown = queued.every(({ standing }) => standing.kind !== 'unread');

  const running = queued.filter(
    ({ standing }) => standing.kind === 'in-flight',
  );

  const outside = Arr.generate(function* () {
    for (const d of queued) {
      const item = outsideOf(d);

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

  // Checked ahead first, as the worker merges them first.
  const picked = [
    ...next.filter(({ facts }) => layered.has(facts.number)),
    ...next.filter(({ facts }) => !layered.has(facts.number)),
  ] as const;

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

    // With nothing it waits for to say: what it is.
    const what = layered.has(d.facts.number)
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
      checkedAhead: layered.has(d.facts.number),
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
 * may take, the running one aside; the one running; those outside the row.
 */
export const queueSummary = (view: QueueView): string =>
  [
    `${view.next.length + view.waiting.length} queued`,
    `${view.running.length} running`,
    `${view.outside.length} set aside`,
  ].join(' · ');

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
        whoseWord: 'author',
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
  worker: 'worker',
  skill: 'skill',
  human: 'person',
  none: 'nobody',
} as const satisfies ReadonlyRecord<keyof typeof WHOSE, string>;
