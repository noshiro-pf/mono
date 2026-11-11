/**
 * What `rework-pr` reads over REST: the open pull request of a branch, as far
 * as its steps need it, and the events of its `merge-queued` label.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { hasLabel, PullRequestLabel } from '../conventions/index.mjs';
import type { QueueEvent, ReworkState } from '../decide/index.mjs';
import type { Read } from '../snapshot/index.mjs';
import { headedPullsPath, restAllPages, restGet } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The open pull request whose head is `branch` of this repository, qualified by
 * the owner so that a fork's branch of the same name is not taken for it;
 * `undefined` for none.
 */
export const readOpenPullRequestOf = async (
  context: ReadContext,
  branch: string,
): Promise<Read<ReworkState | undefined>> =>
  Result.map(
    await restGet(
      context,
      `the open pull request of ${branch}`,
      headedPullsPath(context, branch, 1),
      t.array(ReworkPullSchema),
    ),
    ([found]) =>
      found === undefined
        ? undefined
        : ({
            number: found.number,
            nodeId: found.node_id,
            labels: found.labels.map(({ name }) => name),
            isDraft: found.draft,
            isArmed: found.auto_merge !== null,
          } as const),
  );

/**
 * Every event that put `merge-queued` on pull request `number` or took it off,
 * by id, which GitHub hands out in order, rather than by where the list puts
 * each one, which its documentation does not promise.
 */
export const readQueueEvents = async (
  context: ReadContext,
  number: number,
): Promise<Read<readonly QueueEvent[]>> =>
  Result.map(
    await restAllPages(
      context,
      `the label events of #${number}`,
      `/issues/${number}/events`,
      t.array(IssueEventSchema),
    ),
    (events) =>
      Arr.toSortedBy(
        Arr.generate(function* () {
          for (const { id, event, label } of events) {
            if (
              label !== undefined &&
              label !== null &&
              hasLabel([label.name], PullRequestLabel.mergeQueued) &&
              (event === 'labeled' || event === 'unlabeled')
            ) {
              yield { id, event } as const;
            }
          }
        }),
        ({ id }) => id,
      ),
  );

const ReworkPullSchema = t.record({
  number: t.number(),
  node_id: t.string(),
  draft: t.boolean(),
  labels: t.array(t.record({ name: t.string() })),
  auto_merge: t.unknown(),
});

const IssueEventSchema = t.record({
  id: t.number(),
  event: t.string(),
  label: t.optional(t.union([t.record({ name: t.string() }), t.nullType])),
});
