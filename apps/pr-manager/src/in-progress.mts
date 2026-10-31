/**
 * Whether an open issue is in progress, as the open issues filter it
 * (`issue-filter.mts`): its start state is `in-progress`, which an open pull
 * request that closes it or its `in-progress` label makes it when it could be
 * started (`issue-graph.mts`); one that waits is not, and its label is still a
 * label to pick. The list reads it off each issue's start state and the DAG off
 * each node's, which are the same.
 */

/** Whether something in progress, or not, is shown under `filter`. */
export const isInProgressShown = (
  inProgress: boolean,
  filter: InProgressFilter,
): boolean => (inProgress ? !filter.hideInProgress : !filter.onlyInProgress);

/**
 * Whether what is in progress is shown: switched off, or picked ("only") to be
 * shown alone, as `pending` is (`pending.mts`). Never both: picking it switches
 * it back on, and switching it off unpicks it.
 */
export type InProgressFilter = Readonly<{
  /** Whether what is in progress is left out. */
  hideInProgress: boolean;
  /** Whether only what is in progress is shown. */
  onlyInProgress: boolean;
}>;
