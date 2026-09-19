/** The shapes this command passes around, and what it asks `gh` for. */

import * as t from 'ts-fortress';

/**
 * The fields the run needs, and no more. Deliberately smaller than
 * `unblock-prs`'s pull request: this command decides three things — whether
 * the pull request exists, whether it is holdable, and whether it is already
 * armed — and asking for less keeps what a failure can be about small.
 *
 * `autoMergeRequest` is read as `unknown` because only its presence matters;
 * what merge method GitHub recorded is not this command's business.
 */
export const PullRequestSchema = t.record({
  number: t.number(),
  state: t.string(),
  isDraft: t.boolean(),
  labels: t.array(t.record({ name: t.string() })),
  autoMergeRequest: t.unknown(),
});

export const PullRequestListSchema = t.array(PullRequestSchema);

export type PullRequest = t.TypeOf<typeof PullRequestSchema>;

/** `gh pr list --json` takes these names; they match the schema above. */
export const PR_JSON_FIELDS = 'number,state,isDraft,labels,autoMergeRequest';
