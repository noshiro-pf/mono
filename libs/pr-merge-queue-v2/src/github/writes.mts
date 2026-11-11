/**
 * The writes the commands share, each through `restWrite`, each failure a
 * message naming what was not written.
 */

import {
  graphqlWrite,
  isNotFound,
  pathSegment,
  restWrite,
  type Read,
  type ReadContext,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { notWritten } from './messages.mjs';

/** Puts `label` on issue or pull request `number`. */
export const addLabel = async (
  context: ReadContext,
  number: number,
  label: string,
): Promise<Result<undefined, string>> =>
  Result.map(
    Result.mapErr(
      await restWrite(
        context,
        `${label} on #${number}`,
        'POST',
        `/issues/${number}/labels`,
        { labels: [label] },
        t.unknown(),
      ),
      notWritten,
    ),
    () => undefined,
  );

/**
 * Takes `label` off issue or pull request `number`, saying which it was: this
 * call took it off (`removed`), or it was off already (`absent`, GitHub's 404),
 * which is what the caller wanted all the same.
 */
export const removeLabel = async (
  context: ReadContext,
  number: number,
  label: string,
): Promise<Result<'absent' | 'removed', string>> => {
  const removed = await restWrite(
    context,
    `${label} off #${number}`,
    'DELETE',
    `/issues/${number}/labels/${pathSegment(label)}`,
    undefined,
    t.unknown(),
  );

  return Result.isOk(removed)
    ? Result.ok('removed')
    : isNotFound(removed.value)
      ? Result.ok('absent')
      : Result.err(notWritten(removed.value));
};

/**
 * Writes `body` over comment `commentId`, or as a new comment on `number` when
 * `undefined`; the id written.
 */
export const writeComment = async (
  context: ReadContext,
  number: number,
  commentId: number | undefined,
  body: string,
): Promise<Result<number, string>> =>
  Result.map(
    Result.mapErr(
      commentId === undefined
        ? await restWrite(
            context,
            `a comment on #${number}`,
            'POST',
            `/issues/${number}/comments`,
            { body },
            CommentIdSchema,
          )
        : await restWrite(
            context,
            `comment ${commentId} on #${number}`,
            'PATCH',
            `/issues/comments/${commentId}`,
            { body },
            CommentIdSchema,
          ),
      notWritten,
    ),
    ({ id }) => id,
  );

/**
 * One of the pull request mutations REST cannot make, on the pull request
 * `nodeId` names: the failure as read, so that a refusal (`refused`, as a
 * Claude Code session's proxy answers every GraphQL request) can be told from
 * one that may pass when tried again.
 */
export const mutatePullRequest = async (
  context: ReadContext,
  mutation: PullRequestMutation,
  nodeId: string,
): Promise<Read<undefined>> =>
  graphqlWrite(
    context,
    `${mutation} on ${nodeId}`,
    `mutation ($id: ID!) { ${mutation}(input: { pullRequestId: $id }) { clientMutationId } }`,
    { id: nodeId },
  );

/**
 * Arms auto-merge on the pull request `nodeId` names, squashing, as the worker
 * alone does (`spec/worker.md`, "Invariants").
 */
export const enableAutoMerge = async (
  context: ReadContext,
  nodeId: string,
): Promise<Read<undefined>> =>
  graphqlWrite(
    context,
    `auto-merge on ${nodeId}`,
    'mutation ($id: ID!) { enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) { clientMutationId } }',
    { id: nodeId },
  );

export type PullRequestMutation =
  | 'convertPullRequestToDraft'
  | 'disablePullRequestAutoMerge'
  | 'markPullRequestReadyForReview';

const CommentIdSchema = t.record({ id: t.number() });
