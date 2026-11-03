/**
 * Whether a pull request carries the `pending` label, which its author puts on
 * what is held back for now: the merge order counts it
 * (`merge-order-view.mts`), and the issues' DAG draws a pull request carrying
 * it faint (`issue-graph.mts`). An issue held back is `priority:hold` instead
 * (`docs/issue-priority.md`), so the issue views do not read it.
 */

import { PENDING_LABEL, type Label } from 'pr-report-core';

export const isPending = (labels: readonly Label[]): boolean =>
  labels.some((label) => label.name === PENDING_LABEL);
