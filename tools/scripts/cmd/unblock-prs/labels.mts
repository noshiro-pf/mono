/**
 * The two labels this script reads, and what each one means. `merge-queued`
 * decides whether a pull request is looked at; `skip-ci` decides whether it
 * has been released yet.
 */

import { type PullRequest } from './types.mjs';

export const SKIP_CI_LABEL = 'skip-ci';

/**
 * The label that says a pull request has been reviewed and is waiting its
 * turn. It is the whole of the scope rule: a pull request without it is
 * passed over in silence, and one with it is rebased, released from
 * `skip-ci` and watched when its turn comes.
 */
export const MERGE_QUEUED_LABEL = 'merge-queued';

/**
 * Whether the pull request carries the `skip-ci` label, which is what this
 * repository uses to say "not yet": the check workflows skip while it is on
 * and `skip-ci-label.yml` holds the merge with a `pending` `no-skip-ci-label` status,
 * so there is nothing here to unblock. It is a label, deliberately — a
 * `skip-ci` in the title means nothing to any workflow.
 */
export const isSkipCiLabelled = (pr: PullRequest): boolean =>
  pr.labels.some((label) => label.name === SKIP_CI_LABEL);

/**
 * Whether the pull request has been put in the queue — reviewed, and waiting
 * for its turn rather than for someone to look at it. This is the scope rule:
 * a pull request without the label is not this script's business, whatever
 * else it carries.
 */
export const isMergeQueued = (pr: PullRequest): boolean =>
  pr.labels.some((label) => label.name === MERGE_QUEUED_LABEL);
