/** The shapes this command passes around, and what the API answers with. */

import * as t from 'ts-fortress';

/**
 * The fields the run needs, and no more. Deliberately smaller than
 * `unblock-prs`'s pull request: this command decides three things — whether
 * the pull request exists, whether it is holdable, and whether it is already
 * armed — and asking for less keeps what a failure can be about small.
 *
 * `autoMergeRequest` is read as `unknown` because only its presence matters;
 * what merge method GitHub recorded is not this command's business.
 *
 * `nodeId` is here because two of the four writes are GraphQL mutations,
 * which address a pull request by node id rather than by number. It is
 * carried on the read that already happens rather than fetched again.
 */
export const PullRequestSchema = t.record({
  number: t.number(),
  nodeId: t.string(),
  state: t.string(),
  isDraft: t.boolean(),
  labels: t.array(t.record({ name: t.string() })),
  autoMergeRequest: t.unknown(),
});

export type PullRequest = t.TypeOf<typeof PullRequestSchema>;

/**
 * What `GET /repos/{owner}/{repo}/pulls[/{number}]` answers with, in the
 * REST API's own names. Only the fields above are declared; everything else
 * in that response is ignored.
 */
export const PullRequestResponseSchema = t.record({
  number: t.number(),
  node_id: t.string(),
  state: t.string(),
  draft: t.boolean(),
  labels: t.array(t.record({ name: t.string() })),
  auto_merge: t.unknown(),
});

export const PullRequestListResponseSchema = t.array(PullRequestResponseSchema);

export type PullRequestResponse = t.TypeOf<typeof PullRequestResponseSchema>;

/**
 * The REST response in this command's own terms.
 *
 * `state` is upper-cased because that is what `armBlockedBy` compares against
 * and what it prints: the REST API says `open`, GraphQL and `gh` say `OPEN`,
 * and the one this command reasons in should not depend on which of them
 * answered.
 */
export const toPullRequest = (response: PullRequestResponse): PullRequest =>
  ({
    number: response.number,
    nodeId: response.node_id,
    state: response.state.toUpperCase(),
    isDraft: response.draft,
    labels: response.labels,
    autoMergeRequest: response.auto_merge,
  }) as const;
