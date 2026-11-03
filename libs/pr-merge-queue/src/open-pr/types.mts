/** The shapes this command passes around, and what the API answers with. */

import * as t from 'ts-fortress';

/**
 * The fields the run needs, and no more. Deliberately smaller than
 * `unblock-prs`'s pull request: this command decides three things — whether the
 * pull request exists, whether it is a draft, and whether it targets the base
 * asked for — and asking for less keeps what a failure can be about small.
 *
 * `nodeId` is here because taking a pull request out of draft is a GraphQL
 * mutation, which addresses it by node id rather than by number. It is carried
 * on the read that already happens rather than fetched again.
 */
export type PullRequest = Readonly<{
  number: number;
  nodeId: string;
  isDraft: boolean;
  /** The branch it targets, compared with `--base` when it is open already. */
  base: string;
}>;

/**
 * What `GET /repos/{owner}/{repo}/pulls[/{number}]` answers with, in the
 * REST API's own names. Only the fields above are declared; everything else in
 * that response is ignored.
 */
export const PullRequestResponseSchema = t.record({
  number: t.number(),
  node_id: t.string(),
  draft: t.boolean(),
  base: t.record({ ref: t.string() }),
});

export const PullRequestListResponseSchema = t.array(PullRequestResponseSchema);

export type PullRequestResponse = t.TypeOf<typeof PullRequestResponseSchema>;

/** The REST response in this command's own terms. */
export const toPullRequest = (response: PullRequestResponse): PullRequest =>
  ({
    number: response.number,
    nodeId: response.node_id,
    isDraft: response.draft,
    base: response.base.ref,
  }) as const;
