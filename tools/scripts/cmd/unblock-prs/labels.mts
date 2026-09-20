/**
 * The three labels this script reads, and what each one means.
 * `merge-queued` decides whether a pull request is looked at, `skip-ci`
 * decides whether it has been released yet, and `blocks-release` decides
 * whether the version pull request may go at all.
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

/**
 * The label a pull request carries to say the next release must contain it:
 * while it is open, the version pull request is not picked.
 *
 * It exists because the version pull request is the one pull request whose
 * body cannot declare a `Merge-After:` — `changesets/action` overwrites the
 * title and body of it on every push to the base — so the ordering is
 * declared from the other side, by the pull request the release is waiting
 * for. A label rather than a trailer for the same reason `merge-queued` is
 * one: this repository is public, and a label needs write access while a
 * comment does not.
 *
 * Nothing ever takes it off. The constraint is "open", so it ends when the
 * pull request merges or is closed, and there is no state left behind to
 * clean up.
 */
export const BLOCKS_RELEASE_LABEL = 'blocks-release';

/**
 * Whether the pull request declares that the release must wait for it. A
 * draft counts: holding a release for something that is not ready yet is the
 * case the label is for.
 */
export const blocksRelease = (pr: PullRequest): boolean =>
  pr.labels.some((label) => label.name === BLOCKS_RELEASE_LABEL);
