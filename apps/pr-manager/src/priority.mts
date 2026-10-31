/**
 * How urgent a pull request or an issue is: the one `priority:*` label it
 * carries, and `none` for no such label, or for more than one.
 *
 * One reading for every view that sorts or filters by it — the merge order
 * (`merge-order-view.mts`), the open issues (`issues-list-view.mts`) and the
 * DAG's pills (`issue-graph.mts`) — so that a label means the same thing in
 * each.
 */

import {
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  PRIORITY_MID_LABEL,
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

/** Whether the priority is switched on, and picked when any is. */
export const isPriorityShown = (
  priority: Priority,
  filter: PriorityFilter,
): boolean =>
  !filter.hiddenPriorities.includes(priority) &&
  (!Arr.isNonEmpty(filter.onlyPriorities) ||
    filter.onlyPriorities.includes(priority));

/**
 * Whether the label is one of the `priority:*` ones, which a view reads as a
 * {@link Priority} rather than as a label.
 */
export const isPriorityLabel = (labelName: string): boolean =>
  PRIORITY_LABELS.some(([, each]) => each === labelName);

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
export type PriorityFilter = Readonly<{
  /**
   * What is switched off rather than on, as the merge order keeps it, so that
   * the two read alike.
   */
  hiddenPriorities: readonly Priority[];
  /** What is picked; nothing picked is no narrowing. */
  onlyPriorities: readonly Priority[];
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

const PRIORITY_LABELS = [
  ['high', PRIORITY_HIGH_LABEL],
  ['mid', PRIORITY_MID_LABEL],
  ['low', PRIORITY_LOW_LABEL],
] as const satisfies readonly (readonly [Priority, string])[];
