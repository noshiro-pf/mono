/**
 * What the open issues are narrowed by in either view, the list and the DAG:
 * the tiers (`priority.mts`) and `in progress` (`in-progress.mts`), the counts
 * both views lead with (`issues-summary.tsx`). An issue held back is
 * `priority:hold`, one of the tiers (`docs/issue-priority.md`); the `pending`
 * label is a pull request's, and on an issue it is a label like any other.
 *
 * Two sides, each switched off or picked on its own: within the tiers a pick
 * adds to what is shown, since an issue has one tier, and between the sides an
 * issue is shown only when each side shows it. Picking `in progress` and `S` is
 * the issues that are both, not every issue that is either.
 */

import { isInProgressShown, type InProgressFilter } from './in-progress.mjs';
import {
  isPriorityShown,
  type IssueTier,
  type PriorityFilter,
} from './priority.mjs';

/** Whether an issue with `facts` is shown. */
export const isIssueFilterShown = (
  { priority, inProgress }: IssueFilterFacts,
  filter: IssueFilter,
): boolean =>
  isPriorityShown(priority, filter) && isInProgressShown(inProgress, filter);

/** What the filter reads of an issue: one fact for each of its sides. */
export type IssueFilterFacts = Readonly<{
  priority: IssueTier;
  inProgress: boolean;
}>;

export type IssueFilter = PriorityFilter<IssueTier> & InProgressFilter;

export const DEFAULT_ISSUE_FILTER: IssueFilter = {
  hiddenPriorities: [],
  onlyPriorities: [],
  hideInProgress: false,
  onlyInProgress: false,
} as const;
