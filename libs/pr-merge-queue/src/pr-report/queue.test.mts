import { MERGE_QUEUED_LABEL, writeSetAsideComment } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import {
  checkRoutesAsked,
  failingRequiredCheck,
  FAKE_BASE_TIP,
  FAKE_CHECK_ROUTES,
  FAKE_HEAD_SHA,
  FAKE_REPO,
  fakeGitHub,
  fakePullRequest,
  type FakeRoutes,
} from '../../test/index.mjs';
import { createClient } from './github.mjs';
import { readQueueStateWith, type QueueState } from './queue.mjs';

describe(readQueueStateWith, () => {
  test('asks for no required context, comparison, check, status or workflow run without options', async () => {
    const { requested } = await readThrough({});

    assert.deepStrictEqual(checkRoutesAsked(requested), []);
  });

  // The control for the test above, so that it cannot pass for a route the
  // reader never asks.
  test('reads each of them with `checks: true`', async () => {
    const { requested } = await readThrough({ checks: true });

    assert.deepStrictEqual(checkRoutesAsked(requested), FAKE_CHECK_ROUTES);
  });

  // The owner of a set-aside pull request comes from the comment, so reading
  // the red check it was set aside for changes nothing.
  test('gives a pull request set aside for its checks the same owner whether they are read or not', async () => {
    const without = await readThrough({}, setAsideForChecks);

    const withChecks = await readThrough({ checks: true }, setAsideForChecks);

    assert.deepStrictEqual(
      Array.from(without.state.owners),
      Array.from(withChecks.state.owners),
    );

    assert.strictEqual(without.state.owners.get(1)?.owner, 'skill');

    // The fixture's checks do fail where they are read.
    assert.strictEqual(
      withChecks.state.decided.entries[0]?.checks.verdict,
      'failing',
    );
  });
});

/**
 * #1 queued, and set aside by the token's account for the required check that
 * failed on its head.
 */
const setAsideForChecks: FakeRoutes = (request) => {
  const { url } = request;

  if (url.includes('/pulls?state=open')) {
    return {
      body: [
        fakePullRequest({
          labels: [
            { name: MERGE_QUEUED_LABEL, color: '000000', description: null },
          ],
        }),
      ],
    };
  }

  if (url.includes('/issues/1/comments')) {
    return {
      body: [
        {
          id: 1,
          body: writeSetAsideComment(
            {
              reason: 'checks-failed',
              headSha: FAKE_HEAD_SHA,
              baseSha: FAKE_BASE_TIP,
            },
            'A required check failed.',
          ),
          user: { login: 'me' },
        },
      ],
    };
  }

  return failingRequiredCheck(request);
};

/**
 * The queue {@link readQueueStateWith} reads with `options` from a fake GitHub
 * answering `routes`, and the path of every request it sent.
 */
const readThrough = async (
  options: Parameters<typeof readQueueStateWith>[2],
  routes?: FakeRoutes,
): Promise<Readonly<{ state: QueueState; requested: readonly string[] }>> => {
  const github = await fakeGitHub(routes);

  const read = await readQueueStateWith(
    createClient('token', github.baseUrl),
    FAKE_REPO,
    options,
  );

  await github.close();

  assert.isTrue(Result.isOk(read));

  return { state: read.value, requested: github.requested };
};
