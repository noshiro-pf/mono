/**
 * Where each pull request stands for the worker, and the order it picks
 * candidates in (`spec/decisions.md`, "Queue standing" and "Candidate order").
 *
 * Every fact is read before anything is decided: a fact the answer turns on
 * that could not be read makes the standing `unread`, with why, rather than a
 * request to read it and ask again.
 */

import { Arr, Result } from 'ts-data-forge';
import {
  hasLabel,
  isActionableBranch,
  isVersionBranch,
  pickPriorityOf,
  PullRequestLabel,
} from '../conventions/index.mjs';
import type { NativeStackEntry, Read, ReadError } from '../snapshot/index.mjs';
import { openDependenciesOf, type MergeGraph } from './graph.mjs';
import type { QueueOwner } from './owner.mjs';
import type { ReviewHold } from './review-hold.mjs';

/** Where `pr` stands before its review is asked about. */
export const queueStanding = (
  pr: StandingFacts,
  context: StandingContext,
): QueueStanding => {
  const outOfScope = outOfScopeReason(pr, context);

  if (outOfScope !== undefined) {
    return hasLabel(pr.labels, PullRequestLabel.mergeQueued)
      ? { kind: 'unactionable', reason: outOfScope }
      : { kind: 'ignore' };
  }

  if (Result.isErr(pr.owner)) {
    return { kind: 'unread', error: pr.owner.value };
  }

  if (pr.owner.value !== undefined && pr.owner.value.owner !== 'worker') {
    return { kind: 'owned', owner: pr.owner.value };
  }

  const parent = context.stackParents.get(pr.number);

  if (parent !== undefined) {
    return {
      kind: 'stacked',
      on: parent,
      cyclic: context.cyclic.has(pr.number),
    };
  }

  // GitHub refuses auto-merge for a pull request in a native stack, which is
  // then merged by hand.
  if (!pr.autoMerge) {
    if (Result.isErr(pr.nativeStack)) {
      return { kind: 'unread', error: pr.nativeStack.value };
    }

    if (pr.nativeStack.value !== undefined) {
      return { kind: 'native-stack', entry: pr.nativeStack.value };
    }
  }

  if (isVersionBranch(pr.headRef, context.defaultBranch)) {
    return versionStanding(pr, context);
  }

  // `skip-ci` leaves the merge state saying nothing: taking it off is the
  // action, so this is a candidate whatever GitHub says.
  if (hasLabel(pr.labels, PullRequestLabel.skipCi)) {
    return waitingOn(pr, context) ?? candidateOf(pr);
  }

  switch (pr.mergeState) {
    // `DIRTY` answers whether merging conflicts; the worker rebases, and the
    // rebase says whether the conflict is real.
    case 'BEHIND':
    case 'DIRTY':
      return waitingOn(pr, context) ?? candidateOf(pr);

    case 'CLEAN':
    case 'HAS_HOOKS':
    case 'UNSTABLE':
      return { kind: 'in-flight' };

    case 'BLOCKED':
      return byChecks(pr.checksFailed);

    default:
      return { kind: 'merge-state', state: pr.mergeState };
  }
};

/** Merge states in which GitHub itself says nothing holds the merge. */
export const isMergeableState = (mergeState: string): boolean =>
  mergeState === 'CLEAN' ||
  mergeState === 'HAS_HOOKS' ||
  mergeState === 'UNSTABLE';

/**
 * Whether the review is worth asking about: one about to be picked, or one
 * about to be watched while GitHub still calls it `BLOCKED`.
 */
export const asksReview = (
  standing: QueueStanding,
  mergeState: string,
): boolean =>
  standing.kind === 'candidate' ||
  (standing.kind === 'in-flight' && !isMergeableState(mergeState));

/**
 * The standing once the review is known: `held` holds it; `bypass` changes
 * nothing here — the worker leaves that one unarmed.
 */
export const withReviewHold = (
  standing: QueueStanding,
  mergeState: string,
  hold: ReviewHold | undefined,
): QueueStanding =>
  hold?.kind === 'held' && asksReview(standing, mergeState)
    ? ({ kind: 'held', reason: hold.reason } as const)
    : standing;

/**
 * Where a pull request's priority labels put it in the pick order, as a sort
 * key: `high` 0, none (or both) 1, `low` 2. One only a bypass merges ranks as
 * `low` unless it carries `priority:high` alone: picked, it lands nothing.
 */
export const pickRank = (
  labels: readonly string[],
  bypass: boolean,
): 0 | 1 | 2 => {
  const priority = pickPriorityOf(labels);

  return priority === 'high' ? 0 : bypass || priority === 'low' ? 2 : 1;
};

/**
 * The order the worker picks candidates in: lowest number first, then these
 * stable sorts, the last outermost — `DIRTY` after the rest and the version
 * pull request after that; {@link pickRank}; what the worker saw green and not
 * merging (`demoted`) after everything.
 */
export const orderCandidates = <P,>(
  candidates: readonly P[],
  factsOf: (candidate: P) => OrderFacts,
  context: Readonly<{
    defaultBranch: string;
    demoted: (candidate: P) => boolean;
    bypass: (candidate: P) => boolean;
  }>,
): readonly P[] => {
  const kindRank = (candidate: P): number => {
    const facts = factsOf(candidate);

    return isVersionBranch(facts.headRef, context.defaultBranch)
      ? 2
      : facts.mergeState === 'DIRTY'
        ? 1
        : 0;
  };

  const priorityRank = (candidate: P): number =>
    pickRank(factsOf(candidate).labels, context.bypass(candidate));

  const demotedRank = (candidate: P): number =>
    context.demoted(candidate) ? 1 : 0;

  return candidates
    .toSorted((a, b) => factsOf(a).number - factsOf(b).number)
    .toSorted((a, b) => kindRank(a) - kindRank(b))
    .toSorted((a, b) => priorityRank(a) - priorityRank(b))
    .toSorted((a, b) => demotedRank(a) - demotedRank(b));
};

/** What one pull request's standing is decided from. */
export type StandingFacts = Readonly<{
  number: number;
  labels: readonly string[];
  isDraft: boolean;
  headRef: string;
  baseRef: string;
  /** GitHub's `mergeStateStatus`: `BEHIND`, `DIRTY`, `CLEAN`, `BLOCKED`, … */
  mergeState: string;
  autoMerge: boolean;
  /** Read only for one without auto-merge. */
  nativeStack: Read<NativeStackEntry | undefined>;
  /**
   * Whether the head contains the tip of the base; read only for the version
   * pull request, which must have been rebuilt on it.
   */
  containsBaseTip: Read<boolean>;
  /** Whether a required check failed on the head; read only when `BLOCKED`. */
  checksFailed: Read<boolean>;
  /**
   * Who moves it next ({@link QueueOwner}), `undefined` for one the queue does
   * not cover. Unread, a queued pull request is `unread`: one set aside could
   * otherwise be picked.
   */
  owner: Read<QueueOwner | undefined>;
  /**
   * What it inherits from the issues it closes. Unread, one that would be a
   * `candidate` is `unread`: picked, it could merge before what an issue it
   * closes waits for. The version pull request inherits nothing.
   */
  inheritance: Read<readonly number[]>;
}>;

export type StandingContext = MergeGraph & Readonly<{ defaultBranch: string }>;

/**
 * - `ignore` — not `merge-queued`.
 * - `unactionable` — queued, and nothing can be done for it.
 * - `owned` — a skill's or a person's.
 * - `stacked`, `native-stack`, `waiting`, `release-blocked`, `release-stale` —
 *   its turn has not come, for the reason each names.
 * - `candidate` — the worker may pick it.
 * - `in-flight` — up to date and running, or green and about to merge.
 * - `failing` — up to date with a required check failed.
 * - `held` — a candidate or in flight its review holds.
 * - `merge-state` — a merge state nothing here expects.
 * - `unread` — the answer turns on a fact that could not be read.
 */
export type QueueStanding = Readonly<
  | { kind: 'ignore' }
  | { kind: 'unactionable'; reason: string }
  | { kind: 'owned'; owner: QueueOwner }
  | { kind: 'stacked'; on: number; cyclic: boolean }
  | { kind: 'native-stack'; entry: NativeStackEntry }
  | { kind: 'waiting'; on: readonly number[]; cyclic: boolean }
  | {
      kind: 'release-blocked';
      by: readonly Readonly<{ number: number; isDraft: boolean }>[];
    }
  | { kind: 'release-stale' }
  | { kind: 'merge-state'; state: string }
  | { kind: 'candidate' }
  | { kind: 'in-flight' }
  | { kind: 'failing' }
  | { kind: 'held'; reason: string }
  | { kind: 'unread'; error: ReadError }
>;

/** What {@link orderCandidates} reads of each candidate. */
export type OrderFacts = Readonly<{
  number: number;
  labels: readonly string[];
  headRef: string;
  mergeState: string;
}>;

/** Why a pull request is none of the queue's business, if it is not. */
const outOfScopeReason = (
  pr: StandingFacts,
  context: StandingContext,
): string | undefined =>
  !hasLabel(pr.labels, PullRequestLabel.mergeQueued)
    ? (`not labelled ${PullRequestLabel.mergeQueued}` as const)
    : pr.isDraft
      ? 'draft'
      : pr.baseRef !== context.defaultBranch &&
          !context.stackParents.has(pr.number)
        ? (`base is ${pr.baseRef}, which no open pull request is from` as const)
        : !isActionableBranch(pr.headRef)
          ? (`branch name ${JSON.stringify(pr.headRef)} will not be passed to a shell` as const)
          : undefined;

/** `waiting` while anything it must merge after is still open. */
const waitingOn = (
  pr: StandingFacts,
  context: StandingContext,
): QueueStanding | undefined => {
  const on = openDependenciesOf(context, pr.number);

  return Arr.isNonEmpty(on)
    ? { kind: 'waiting', on, cyclic: context.cyclic.has(pr.number) }
    : undefined;
};

/** A `candidate`, or `unread` when what it inherits could not be read. */
const candidateOf = (pr: StandingFacts): QueueStanding =>
  Result.isErr(pr.inheritance)
    ? ({ kind: 'unread', error: pr.inheritance.value } as const)
    : ({ kind: 'candidate' } as const);

const byChecks = (checksFailed: Read<boolean>): QueueStanding =>
  Result.isErr(checksFailed)
    ? ({ kind: 'unread', error: checksFailed.value } as const)
    : checksFailed.value
      ? ({ kind: 'failing' } as const)
      : ({ kind: 'in-flight' } as const);

/**
 * The version pull request: held while another pull request labelled
 * `blocks-release` is open, and while built before the tip of the base; then a
 * candidate if paused, otherwise judged by its checks.
 */
const versionStanding = (
  pr: StandingFacts,
  context: StandingContext,
): QueueStanding => {
  const by = context.releaseBlockers.filter(
    (blocker) => blocker.number !== pr.number,
  );

  return Arr.isNonEmpty(by)
    ? { kind: 'release-blocked', by }
    : Result.isErr(pr.containsBaseTip)
      ? { kind: 'unread', error: pr.containsBaseTip.value }
      : !pr.containsBaseTip.value
        ? { kind: 'release-stale' }
        : hasLabel(pr.labels, PullRequestLabel.skipCi)
          ? { kind: 'candidate' }
          : byChecks(pr.checksFailed);
};
