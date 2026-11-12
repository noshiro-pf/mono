/** The `queue/pr-<N>` branches the worker checks ahead on, over REST. */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  numberOfQueueLayerBranch,
  queueLayerOfMessage,
} from '../conventions/index.mjs';
import type {
  MovedHead,
  QueueLayerFacts,
  QueueLayersFacts,
  Read,
} from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { malformed } from './classify.mjs';
import { readHeadChecks } from './rest-checks.mjs';
import { restAllPages, restGet } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * Every `queue/pr-<N>` branch, with its commit, its parent and its checks, and
 * the tree of `baseSha`, the default branch's tip, which the first layer stands
 * on. A layer whose commit cannot be read fails the whole: a layer left out
 * would read as one never built, and be built again beside it.
 */
export const readQueueLayers = async (
  context: ReadContext,
  baseSha: string,
): Promise<Read<QueueLayersFacts>> => {
  const [refs, base] = await Promise.all([
    restAllPages(
      context,
      'the queue layers',
      `/git/matching-refs/heads/${QUEUE_PREFIX}`,
      t.array(RefSchema),
    ),
    restGet(
      context,
      'the tip of the default branch',
      `/git/commits/${baseSha}`,
      CommitSchema,
    ),
  ]);

  if (Result.isErr(refs)) {
    return refs;
  }

  if (Result.isErr(base)) {
    return base;
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

  return Result.map(allRead(layers), (read) => ({
    baseTree: base.value.tree.sha,
    layers: read,
    movedHeads: new Map<number, MovedHead>(),
  }));
};

/**
 * `read` with the trees of the moved heads (`QueueLayersFacts.movedHeads`):
 * each open pull request of `pullRequests` whose layer was built from another
 * head. Unread pull requests follow nothing.
 */
export const readMovedHeads = async (
  context: ReadContext,
  read: Read<QueueLayersFacts>,
  pullRequests: Read<readonly Readonly<{ number: number; headSha: string }>[]>,
): Promise<Read<QueueLayersFacts>> => {
  if (Result.isErr(read) || Result.isErr(pullRequests)) {
    return read;
  }

  const heads = new Map<number, string>(
    pullRequests.value.map(({ number, headSha }) => [number, headSha] as const),
  );

  const moved = Arr.generate(function* () {
    const mut_seen = new Set<number>();

    for (const { origin } of read.value.layers) {
      const head = origin === undefined ? undefined : heads.get(origin.number);

      if (
        origin === undefined ||
        head === undefined ||
        head === origin.builtFromHead ||
        mut_seen.has(origin.number)
      ) {
        continue;
      }

      mut_seen.add(origin.number);

      yield { number: origin.number, head } as const;
    }
  });

  const trees = await Promise.all(
    moved.map(async ({ number, head }) => {
      const commit = await restGet(
        context,
        `the head of #${number}`,
        `/git/commits/${head}`,
        CommitSchema,
      );

      return Result.isErr(commit)
        ? undefined
        : ([number, { head, tree: commit.value.tree.sha }] as const);
    }),
  );

  return Result.ok({
    ...read.value,
    movedHeads: new Map(trees.filter((each) => each !== undefined)),
  });
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
    parent: parent.sha,
    parentTree: parentCommit.value.tree.sha,
    committedAt: commit.value.committer.date,
    checks,
  });
};
