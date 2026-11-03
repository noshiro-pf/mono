/**
 * How urgent a pull request or an issue is, read from its `priority:*` labels.
 * A pull request's is {@link Priority}, `priority:high`, `priority:mid` or
 * `priority:low`, which the merge order (`merge-order-view.mts`) and the queue
 * read. An issue's is {@link IssueTier}, one of `pr-report-core`'s tiers
 * (`docs/issue-priority.md`), which the open issues (`issues-list-view.mts`)
 * and the DAG (`issue-graph.mts`) read. Either is `none` for no such label, or
 * for more than one.
 *
 * One reading for each, so that a label means the same thing in every view that
 * sorts or filters by it.
 */

import {
  ISSUE_PRIORITIES,
  issuePriorityLabel,
  issuePriorityOfLabels,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  PRIORITY_MID_LABEL,
  type IssuePriority,
  type Label,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

export type Priority = 'high' | 'mid' | 'low' | 'none';

/** In the order the switches are drawn. */
export const PRIORITIES = [
  'high',
  'mid',
  'low',
  'none',
] as const satisfies readonly Priority[];

/** The one `priority:*` label it carries; none, or several, is `none`. */
export const priorityOf = (labels: readonly Label[]): Priority => {
  const carried = PRIORITY_LABELS.filter(([, labelName]) =>
    labels.some((label) => label.name === labelName),
  );

  return Arr.isFixedLengthArray(1, carried) ? carried[0][0] : 'none';
};

/** The one tier an issue carries; none, or several, is `none`. */
export const issueTierOf = (labels: readonly Label[]): IssueTier => {
  const tier = issuePriorityOfLabels(labels.map(({ name }) => name));

  return tier === 'several' ? 'none' : tier;
};

/**
 * Whether the DAG draws a second outline round an issue of this tier: the ones
 * to start first (`docs/issue-priority.md`).
 */
export const isRingedTier = (tier: IssueTier): boolean =>
  tier === 'S' || tier === 'A';

/** Whether the DAG fades an issue of this tier: the ones to start last, if at all. */
export const isFadedTier = (tier: IssueTier): boolean =>
  tier === 'D' || tier === 'hold' || tier === 'close';

/** Whether the priority is switched on, and picked when any is. */
export const isPriorityShown = <P extends string>(
  priority: P,
  filter: PriorityFilter<P>,
): boolean =>
  !filter.hiddenPriorities.includes(priority) &&
  (!Arr.isNonEmpty(filter.onlyPriorities) ||
    filter.onlyPriorities.includes(priority));

/**
 * Whether the label is one of the `priority:*` ones, which a view reads as a
 * {@link Priority} or an {@link IssueTier} rather than as a label.
 */
export const isPriorityLabel = (labelName: string): boolean =>
  PRIORITY_LABELS.some(([, each]) => each === labelName) ||
  ISSUE_PRIORITIES.some((tier) => issuePriorityLabel(tier) === labelName);

/** What each priority is called on its switch. */
export const PRIORITY_NAMES = {
  high: 'high',
  mid: 'mid',
  low: 'low',
  none: 'none',
} as const satisfies ReadonlyRecord<Priority, string>;

/**
 * Which priorities a view shows: what is switched off, and what is picked
 * ("only"), as the merge order's statuses are (`merge-order-view.mts`). The
 * open issues' list and their DAG read the same one (`issues-list-view.mts`).
 */
export type PriorityFilter<P extends string = Priority> = Readonly<{
  /**
   * What is switched off rather than on, as the merge order keeps it, so that
   * the two read alike.
   */
  hiddenPriorities: readonly P[];
  /** What is picked; nothing picked is no narrowing. */
  onlyPriorities: readonly P[];
}>;

/**
 * Lower first, in a sort by priority. No priority is between mid and low:
 * what nobody has ranked is not known to matter less than what was ranked low.
 */
export const PRIORITY_RANK = {
  high: 0,
  mid: 1,
  none: 2,
  low: 3,
} as const satisfies ReadonlyRecord<Priority, number>;

/** An issue's tier, or `none`. */
export type IssueTier = IssuePriority | 'none';

/**
 * `docs/issue-priority.md`'s order, then none: the order of the URL's
 * parameters, and of the switches within each row (`issue-tier-group.tsx`).
 */
export const ISSUE_TIERS = [
  'S',
  'A',
  'B',
  'C',
  'D',
  'hold',
  'close',
  'none',
] as const satisfies readonly IssueTier[];

/**
 * Lower first, in a sort by tier: the order `run-issue-resolver` starts issues
 * in (`pr-report-core`'s `issueStartRank`), no tier before `D`, and then what
 * it leaves, `hold` and `close`.
 */
export const ISSUE_TIER_RANK = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  none: 4,
  D: 5,
  hold: 6,
  close: 7,
} as const satisfies ReadonlyRecord<IssueTier, number>;

/** The labels the priorities other than `none` are read from. */
export const PRIORITY_LABELS = [
  ['high', PRIORITY_HIGH_LABEL],
  ['mid', PRIORITY_MID_LABEL],
  ['low', PRIORITY_LOW_LABEL],
] as const satisfies readonly (readonly [Priority, string])[];
