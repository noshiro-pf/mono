/** The shapes this command passes around, and what the API answers with. */

import * as t from 'ts-fortress';

/**
 * The fields the run needs, and no more. Deliberately smaller than
 * `unblock-prs`'s pull request: this command decides two things — whether
 * the pull request exists, and whether it is a draft — and asking for less
 * keeps what a failure can be about small.
 *
 * `nodeId` is here because taking a pull request out of draft is a GraphQL
 * mutation, which addresses it by node id rather than by number. It is
 * carried on the read that already happens rather than fetched again.
 */
export const PullRequestSchema = t.record({
  number: t.number(),
  nodeId: t.string(),
  isDraft: t.boolean(),
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
  draft: t.boolean(),
});

export const PullRequestListResponseSchema = t.array(PullRequestResponseSchema);

export type PullRequestResponse = t.TypeOf<typeof PullRequestResponseSchema>;

/** The REST response in this command's own terms. */
export const toPullRequest = (response: PullRequestResponse): PullRequest =>
  ({
    number: response.number,
    nodeId: response.node_id,
    isDraft: response.draft,
  }) as const;
