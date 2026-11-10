import { Result } from 'ts-data-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import { readQueueLayers } from './rest-layers.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const LAYER = 'a'.repeat(40);

const PARENT = 'p'.repeat(40);

const HEAD = 'b'.repeat(40);

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
    const layers = Result.unwrapThrow(await readQueueLayers(contextOf(routes)));

    assert.deepStrictEqual(
      layers.map(({ checks, ...rest }) => rest),
      [
        {
          branch: 'queue/pr-7',
          origin: { number: 7, builtFromHead: HEAD },
          sha: LAYER,
          tree: 't1',
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
    );

    assert.isTrue(Result.isErr(layers));
  });
});
