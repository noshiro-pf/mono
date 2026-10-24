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
