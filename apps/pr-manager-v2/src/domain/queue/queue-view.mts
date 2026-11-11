import {
  numberOfQueueLayerBranch,
  type PullRequestDecision,
  type QueueDecision,
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
   * The review hold's reason when only a ruleset bypass merges it (#2757): it
   * is picked late, and lands nothing until someone with the bypass merges.
   */
  bypass: string | undefined;
  /** For a waiting box: `after #N`, `review`, `native stack`, … */
  why: string | undefined;
  /** What `why` stands for, in full. */
  detail: string | undefined;
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

  const box = (d: PullRequestDecision): QueueBox => {
    const waits = waitOf(d.standing);

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

  return {
    base: snapshot.repository.defaultBranch,
    running: running.map(box),
    // Checked ahead first, as the worker merges them first.
    next: [
      ...next.filter(({ facts }) => layered.has(facts.number)),
      ...next.filter(({ facts }) => !layered.has(facts.number)),
    ].map(box),
    waiting: waiting.map(box),
    outside,
    orderKnown,
  };
};

/** Every count the summary line gives. */
export const queueSummary = (view: QueueView): string =>
  [
    `${countQueued(view)} queued`,
    `${view.running.length} running`,
    `${view.outside.filter(({ why }) => why === 'set aside').length} set aside`,
  ].join(' · ');

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
