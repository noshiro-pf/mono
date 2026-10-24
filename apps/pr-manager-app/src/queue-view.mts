// cspell:ignore unlabel

/**
 * `unblock-prs`'s queue as the Queue block draws it: the pull request it is
 * running, the ones it would pick next in the order it would pick them, the
 * ones whose turn has not come, and — outside the queue — the ones set
 * aside, claimed or otherwise left to someone else.
 *
 * Decided by `pr-report-core`'s `queue-order.mts`, the code the worker
 * decides with, from what the page has read. Two things the worker reads
 * differently are made up from what the page has:
 *
 * - **The merge state.** GraphQL serves `mergeStateStatus` only under a
 *   preview header, so it is put together from `mergeable` and the
 *   comparison: `DIRTY` for a merge that would conflict, `BEHIND` for a head
 *   behind its base, and `BLOCKED` otherwise — which leaves the rest to the
 *   checks and the review, as `BLOCKED` does in the worker.
 * - **What a run has demoted** — one seen green that did not merge, put
 *   last — lives in that run's memory and is not shown.
 */

import {
  isSetAsideReason,
  isVersionBranch,
  orderCandidates,
  queueGraph,
  queueOwner,
  queueStanding,
  readQueueComments,
  reviewHold,
  withReviewHold,
  type NativeStackEntry,
  type QueueContext,
  type QueueFacts,
  type QueueOwner,
  type QueueStanding,
  type ReportEntry,
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
   * The `Start-After:` of each issue whose body was read, which a pull
   * request closing it inherits as a merge order. Absent, none is.
   */
  startAfterOf?: ReadonlyMap<number, readonly number[]>;
}>;

/** Everything read about one open pull request that its place turns on. */
export type QueuePull = Readonly<{
  entry: ReportEntry;
  /** The tip of its base, which a set-aside was recorded against. */
  baseTip: string;
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
  /** A word or two under the number: why it waits, or what it is. */
  note: string | undefined;
  /** The tooltip's second line, when the note leaves something out. */
  detail: string | undefined;
  priority: Priority;
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
  /** Running first, then the candidates in order, then the rest. */
  slots: readonly QueueSlot[];
  outside: readonly OutsideNode[];
}>;

export const queueViewOf = ({
  defaultBranch,
  nowEpochMs,
  rules,
  pulls,
  startAfterOf,
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
    const comments = readQueueComments(
      pull.ownComments.map((body, index) => ({ id: index, body })),
      {
        headSha: pull.entry.headSha,
        baseTip: pull.baseTip,
        nowEpochMs,
      },
    );

    // The set-aside as the worker holds it: one recorded against a base that
    // has moved, for a reason the move may clear, is taken back and tried
    // again (`setAsideApplies`).
    const setAside =
      comments.setAside?.applies === true ? comments.setAside.says : undefined;

    const claim = comments.claim?.applies === true ? comments.claim : undefined;

    const owner = queueOwner({
      number: pull.entry.number,
      labels: labelNamesOf(pull.entry),
      isDraft: pull.entry.isDraft,
      fromFork: pull.entry.fromFork,
      headRef: pull.entry.headRef,
      headSha: pull.entry.headSha,
      baseRef: pull.entry.baseRef,
      defaultBranch,
      stackedOn: graph.stackParents.get(pull.entry.number),
      inCycle: graph.cyclic.has(pull.entry.number),
      setAside,
      claim: claim?.says,
      nowEpochMs,
    });

    return {
      pull,
      owner,
      claimed: claim !== undefined,
      setAsideReason:
        setAside?.kind === 'standing' ? setAside.setAside.reason : undefined,
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

  const candidates = orderCandidates(
    byNumber.filter(({ standing }) => standing.kind === 'candidate'),
    ({ facts }) => facts,
    // What a run of the worker has demoted is not known here.
    { defaultBranch, demoted: () => false },
  );

  const rest = byNumber.filter(({ standing }) => isWaiting(standing));

  return {
    base: defaultBranch,
    slots: [...running, ...candidates, ...rest].map(
      ({ pull, facts, standing }) =>
        slotOf(pull, facts, standing, defaultBranch),
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

/** What is in the queue without being running or a candidate. */
const isWaiting = (standing: QueueStanding): boolean => {
  switch (standing.kind) {
    case 'ignore':
    case 'unactionable':
    case 'owned':
    case 'candidate':
    case 'in-flight':
      return false;

    case 'stacked':
    case 'native-stack':
    case 'waiting':
    case 'release-blocked':
    case 'release-stale':
    case 'merge-state':
    case 'failing':
    case 'held':
    case 'needs':
      return true;
  }
};

const slotOf = (
  pull: QueuePull,
  facts: QueueFacts,
  standing: QueueStanding,
  defaultBranch: string,
): QueueSlot => {
  const { entry } = pull;

  const release = isVersionBranch(entry.headRef, defaultBranch);

  const said = sayStanding(standing);

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
    note:
      said?.note ??
      (release
        ? 'release'
        : facts.mergeState === 'DIRTY'
          ? 'conflicts'
          : undefined),
    detail: said?.detail,
    priority: priorityOf(entry.labels),
  };
};

/** The word under the number of one that waits, and what it leaves out. */
const sayStanding = (
  standing: QueueStanding,
): Readonly<{ note: string; detail: string | undefined }> | undefined => {
  switch (standing.kind) {
    case 'stacked':
      return { note: `after #${standing.on}`, detail: 'stacked on it' };

    case 'waiting':
      return {
        note: afterWord(standing.on),
        detail: `Merge-After: ${standing.on.map((n) => `#${n}`).join(', ')}`,
      };

    case 'release-blocked':
      return {
        note: afterWord(standing.by.map(({ number }) => number)),
        detail: 'held by blocks-release',
      };

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

/** `after #1`, or `after #1 +2` for one waiting on three. */
const afterWord = (numbers: readonly number[]): string =>
  Arr.isNonEmpty(numbers)
    ? numbers.length === 1
      ? (`after #${numbers[0]}` as const)
      : (`after #${numbers[0]} +${numbers.length - 1}` as const)
    : 'waiting';

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
  'not-merging': 'not merging',
  'push-failed': 'push failed',
  'rebase-failed': 'conflict',
  'unlabel-failed': 'skip-ci stuck',
  'watch-timeout': 'timeout',
} as const satisfies ReadonlyRecord<SetAsideReason, string>;

const labelNamesOf = (entry: ReportEntry): readonly string[] =>
  entry.labels.map((label) => label.name);
