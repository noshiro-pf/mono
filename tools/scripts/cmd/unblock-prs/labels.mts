/**
 * What the three labels this script reads say about one pull request.
 * `merge-queued` decides whether a pull request is looked at, `skip-ci`
 * decides whether it has been released yet, and `blocks-release` decides
 * whether the version pull request may go at all. The strings themselves are
 * `pr-report-core`'s, because the Pull Requests Manager page reads them too.
 */

import {
  BLOCKS_RELEASE_LABEL,
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
} from 'pr-report-core';
import { type PullRequest } from './types.mjs';

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
