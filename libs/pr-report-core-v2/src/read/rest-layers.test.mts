import { Result } from 'ts-data-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import { readMovedHeads, readQueueLayers } from './rest-layers.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const LAYER = 'a'.repeat(40);

const PARENT = 'p'.repeat(40);

const HEAD = 'b'.repeat(40);

const TIP = 'c'.repeat(40);

const contextOf = (recorded: Routes): ReadContext =>
  ({
    transport: recordedTransport(recorded).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const routes: Routes = {
  '/repos/o/n/git/matching-refs/heads/queue/pr-?per_page=100': ok([
    { ref: 'refs/heads/queue/pr-7', object: { sha: LAYER } },
    { ref: 'refs/heads/queue/pr-x', object: { sha: 'x'.repeat(40) } },
  ]),
  [`/repos/o/n/git/commits/${LAYER}`]: ok({
    sha: LAYER,
    message: `queue #7\n\nQueue-Layer: 7 ${HEAD}`,
    tree: { sha: 't1' },
    committer: { date: '2026-11-09T00:00:00Z' },
    parents: [{ sha: PARENT }],
  }),
  [`/repos/o/n/git/commits/${PARENT}`]: ok({
    sha: PARENT,
    message: 'main',
    tree: { sha: 't0' },
    committer: { date: '2026-11-08T00:00:00Z' },
    parents: [],
  }),
  [`/repos/o/n/git/commits/${TIP}`]: ok({
    sha: TIP,
    message: 'tip',
    tree: { sha: 't2' },
    committer: { date: '2026-11-09T00:00:00Z' },
    parents: [{ sha: PARENT }],
  }),
  [`/repos/o/n/commits/${LAYER}/check-runs?filter=all&per_page=100`]: ok({
    check_runs: [],
  }),
  [`/repos/o/n/commits/${LAYER}/status?per_page=100`]: ok({ statuses: [] }),
  [`/repos/o/n/actions/runs?head_sha=${LAYER}&per_page=100`]: ok({
    workflow_runs: [],
  }),
} as const;

describe(readQueueLayers, () => {
  test('reads each layer branch, and leaves out other names', async () => {
    const { baseTree, layers } = Result.unwrapThrow(
      await readQueueLayers(contextOf(routes), TIP),
    );

    assert.strictEqual(baseTree, 't2');

    assert.deepStrictEqual(
      layers.map(({ checks, ...rest }) => rest),
      [
        {
          branch: 'queue/pr-7',
          origin: { number: 7, builtFromHead: HEAD },
          sha: LAYER,
          tree: 't1',
          parent: PARENT,
          parentTree: 't0',
          committedAt: '2026-11-09T00:00:00Z',
        },
      ],
    );
  });

  test('a layer whose commit is unread fails the whole', async () => {
    const layers = await readQueueLayers(
      contextOf({
        ...routes,
        [`/repos/o/n/git/commits/${PARENT}`]: status(502, 'bad gateway'),
      }),
      TIP,
    );

    assert.isTrue(Result.isErr(layers));
  });
});

describe(readMovedHeads, () => {
  const MOVED = 'd'.repeat(40);

  test('reads the tree of each head moved off its layer, and of no other', async () => {
    const context = contextOf({
      ...routes,
      [`/repos/o/n/git/commits/${MOVED}`]: ok({
        sha: MOVED,
        message: 'rebased',
        tree: { sha: 't1' },
        committer: { date: '2026-11-10T00:00:00Z' },
        parents: [{ sha: TIP }],
      }),
    });

    const read = await readQueueLayers(context, TIP);

    const followed = await readMovedHeads(
      context,
      read,
      Result.ok([
        { number: 7, headSha: MOVED },
        { number: 8, headSha: HEAD },
      ]),
    );

    assert.deepStrictEqual(
      Array.from(Result.unwrapThrow(followed).movedHeads),
      [[7, { head: MOVED, tree: 't1' }]],
    );

    const atItsHead = await readMovedHeads(
      context,
      read,
      Result.ok([{ number: 7, headSha: HEAD }]),
    );

    assert.deepStrictEqual(
      Result.map(atItsHead, ({ movedHeads }) => movedHeads.size),
      Result.ok(0),
    );
  });

  test('leaves out a head whose tree is unread', async () => {
    const context = contextOf({
      ...routes,
      [`/repos/o/n/git/commits/${MOVED}`]: status(502, 'bad gateway'),
    });

    const followed = await readMovedHeads(
      context,
      await readQueueLayers(context, TIP),
      Result.ok([{ number: 7, headSha: MOVED }]),
    );

    assert.deepStrictEqual(
      Result.map(followed, ({ movedHeads }) => movedHeads.size),
      Result.ok(0),
    );
  });
});
