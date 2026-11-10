/** The `queue/pr-<N>` branches the worker checks ahead on, over REST. */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  numberOfQueueLayerBranch,
  queueLayerOfMessage,
} from '../conventions/index.mjs';
import type { QueueLayerFacts, Read } from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { malformed } from './classify.mjs';
import { readHeadChecks } from './rest-checks.mjs';
import { restAllPages, restGet } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * Every `queue/pr-<N>` branch, with its commit, its parent's tree and its
 * checks. A layer whose commit cannot be read fails the whole: a layer left out
 * would read as one never built, and be built again beside it.
 */
export const readQueueLayers = async (
  context: ReadContext,
): Promise<Read<readonly QueueLayerFacts[]>> => {
  const refs = await restAllPages(
    context,
    'the queue layers',
    `/git/matching-refs/heads/${QUEUE_PREFIX}`,
    t.array(RefSchema),
  );

  if (Result.isErr(refs)) {
    return refs;
  }

  const layers = await Promise.all(
    refs.value
      .map(({ ref, object }) => ({
        branch: ref.slice('refs/heads/'.length),
        sha: object.sha,
      }))
      .filter(({ branch }) => numberOfQueueLayerBranch(branch) !== undefined)
      .map(async ({ branch, sha }) => readLayer(context, branch, sha)),
  );

  return allRead(layers);
};

const QUEUE_PREFIX = 'queue/pr-';

const RefSchema = t.record({
  ref: t.string(),
  object: t.record({ sha: t.string() }),
});

const CommitSchema = t.record({
  sha: t.string(),
  message: t.string(),
  tree: t.record({ sha: t.string() }),
  committer: t.record({ date: t.string() }),
  parents: t.array(t.record({ sha: t.string() })),
});

const readLayer = async (
  context: ReadContext,
  branch: string,
  sha: string,
): Promise<Read<QueueLayerFacts>> => {
  const what = `the queue layer ${branch}` as const;

  const [commit, checks] = await Promise.all([
    restGet(context, what, `/git/commits/${sha}`, CommitSchema),
    readHeadChecks(context, sha),
  ]);

  if (Result.isErr(commit)) {
    return commit;
  }

  const [parent] = commit.value.parents;

  if (parent === undefined) {
    return Result.err(malformed(what, 'a root commit'));
  }

  const parentCommit = await restGet(
    context,
    what,
    `/git/commits/${parent.sha}`,
    CommitSchema,
  );

  if (Result.isErr(parentCommit)) {
    return parentCommit;
  }

  const origin = queueLayerOfMessage(commit.value.message);

  return Result.ok({
    branch,
    origin:
      origin === undefined
        ? undefined
        : { number: origin.number, builtFromHead: origin.head },
    sha,
    tree: commit.value.tree.sha,
    parentTree: parentCommit.value.tree.sha,
    committedAt: commit.value.committer.date,
    checks,
  });
};
