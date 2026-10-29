/**
 * Whether a pull request or an issue carries the `pending` label, which its
 * author puts on what is held back for now.
 *
 * One reading for the open issues' list (`issues-list-view.mts`) and the
 * DAG (`issue-graph.mts`), as the merge order reads it (`merge-order-view.mts`).
 */

import { PENDING_LABEL, type Label } from 'pr-report-core';

export const isPending = (labels: readonly Label[]): boolean =>
  labels.some((label) => label.name === PENDING_LABEL);

/** Whether something pending, or not, is shown under `filter`. */
export const isPendingShown = (
  pending: boolean,
  filter: PendingFilter,
): boolean => (pending ? !filter.hidePending : !filter.onlyPending);

/**
 * Whether what is pending is shown, as the open issues filter it
 * (`issue-filter.mts`): switched off, or picked ("only") to be shown alone,
 * as a priority is. Never both: picking it switches it back on, and
 * switching it off unpicks it.
 */
export type PendingFilter = Readonly<{
  /** Whether what is labelled `pending` is left out. */
  hidePending: boolean;
  /** Whether only what is labelled `pending` is shown. */
  onlyPending: boolean;
}>;
