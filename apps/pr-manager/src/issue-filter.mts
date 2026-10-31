/**
 * What the open issues are narrowed by in either view, the list and the DAG:
 * the priorities (`priority.mts`), `pending` (`pending.mts`) and `in
 * progress` (`in-progress.mts`), the counts both views lead with
 * (`issues-summary.tsx`).
 *
 * Three sides, each switched off or picked on its own: within the priorities
 * a pick adds to what is shown, since an issue has one priority, and between
 * the sides an issue is shown only when each side shows it. Picking `pending`
 * and `high` is the issues that are both, not every issue that is either.
 */

import { isInProgressShown, type InProgressFilter } from './in-progress.mjs';
import { isPendingShown, type PendingFilter } from './pending.mjs';
import {
  isPriorityShown,
  type Priority,
  type PriorityFilter,
} from './priority.mjs';

/** Whether an issue with `facts` is shown. */
export const isIssueFilterShown = (
  { priority, pending, inProgress }: IssueFilterFacts,
  filter: IssueFilter,
): boolean =>
  isPriorityShown(priority, filter) &&
  isPendingShown(pending, filter) &&
  isInProgressShown(inProgress, filter);

/** What the filter reads of an issue: one fact for each of its sides. */
export type IssueFilterFacts = Readonly<{
  priority: Priority;
  pending: boolean;
  inProgress: boolean;
}>;

export type IssueFilter = PriorityFilter & PendingFilter & InProgressFilter;

export const DEFAULT_ISSUE_FILTER: IssueFilter = {
  hiddenPriorities: [],
  onlyPriorities: [],
  hidePending: false,
  onlyPending: false,
  hideInProgress: false,
  onlyInProgress: false,
} as const;
