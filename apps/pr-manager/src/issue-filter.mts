/**
 * What the open issues are narrowed by in either view, the list and the DAG:
 * the priorities (`priority.mts`) and `pending` (`pending.mts`), the counts
 * both views lead with (`issues-summary.tsx`).
 *
 * Two sides, each switched off or picked on its own: within the priorities a
 * pick adds to what is shown, since an issue has one priority, and between
 * the two an issue is shown only when each side shows it. Picking `pending`
 * and `high` is the issues that are both, not every issue that is either.
 */

import { isPendingShown, type PendingFilter } from './pending.mjs';
import {
  isPriorityShown,
  type Priority,
  type PriorityFilter,
} from './priority.mjs';

/** Whether an issue of `priority`, pending or not, is shown. */
export const isIssueFilterShown = (
  priority: Priority,
  pending: boolean,
  filter: IssueFilter,
): boolean =>
  isPriorityShown(priority, filter) && isPendingShown(pending, filter);

export type IssueFilter = PriorityFilter & PendingFilter;

export const DEFAULT_ISSUE_FILTER: IssueFilter = {
  hiddenPriorities: [],
  onlyPriorities: [],
  hidePending: false,
  onlyPending: false,
} as const;
