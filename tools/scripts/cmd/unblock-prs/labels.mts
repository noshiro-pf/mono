/**
 * What the labels this script reads say about one pull request.
 * `merge-queued` decides whether a pull request is looked at, `skip-ci`
 * decides whether it has been released yet, and `blocks-release` decides
 * whether the version pull request may go at all, `auto-rebase` asks for a
 * paused pull request to be kept on the tip, and `priority:high` /
 * `priority:low` move one within the pick order. The strings themselves are
 * `pr-report-core`'s, because the Pull Requests Manager page reads them too.
 */

import {
  AUTO_REBASE_LABEL,
  BLOCKS_RELEASE_LABEL,
  MERGE_QUEUED_LABEL,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  SKIP_CI_LABEL,
} from 'pr-report-core';
import type { PullRequest } from './types.mjs';

/**
 * Whether the pull request carries the `skip-ci` label, which is what this
 * repository uses to say "not yet": the check workflows skip while it is on
 * and `skip-ci-label.yml` holds the merge with a `pending` `no-skip-ci-label` status,
 * so there is nothing here to unblock.
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

/**
 * Whether the pull request declares that the release must wait for it. A
 * draft counts: holding a release for something that is not ready yet is the
 * case the label is for.
 */
export const blocksRelease = (pr: PullRequest): boolean =>
  pr.labels.some((label) => label.name === BLOCKS_RELEASE_LABEL);

/**
 * Whether the pull request asked to be kept on the tip of the default branch
 * while it waits, by `auto-rebase`, or by being queued: either way the author
 * wants it rebased, and while `skip-ci` is on a rebase before its turn costs
 * nothing and makes its diff easier to read.
 */
export const wantsAutoRebase = (pr: PullRequest): boolean =>
  isMergeQueued(pr) ||
  pr.labels.some((label) => label.name === AUTO_REBASE_LABEL);

/**
 * Which priority label the pull request carries: `both` is the two at once,
 * which contradict each other and so count as neither.
 */
export const priorityOf = (pr: PullRequest): Priority => {
  const high = pr.labels.some((label) => label.name === PRIORITY_HIGH_LABEL);

  const low = pr.labels.some((label) => label.name === PRIORITY_LOW_LABEL);

  return high ? (low ? 'both' : 'high') : low ? 'low' : 'none';
};

/**
 * Where {@link priorityOf} puts the pull request in the pick order, as a sort
 * key: `high` before the rest, `low` after them.
 */
export const priorityRank = (pr: PullRequest): 0 | 1 | 2 => {
  switch (priorityOf(pr)) {
    case 'high':
      return 0;

    case 'none':
    case 'both':
      return 1;

    case 'low':
      return 2;
  }
};

type Priority = 'high' | 'low' | 'none' | 'both';
