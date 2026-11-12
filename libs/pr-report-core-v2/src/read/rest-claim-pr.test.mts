import { Result } from 'ts-data-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import {
  readOwnPullRequestClaim,
  readPullRequestClaim,
  readPullRequestState,
} from './rest-claim-pr.mjs';

const HEAD = 'c'.repeat(40);

const claimBody = (by: string): string =>
  `<!-- unblock-prs:claim head=${HEAD} by=${by} at=2026-11-10T11:00:00Z -->\n\nBeing fixed.` as const;

/** Another account's claim, then this account's oldest and a newer one. */
const COMMENTS = ok([
  {
    id: 1,
    body: claimBody('them'),
    user: { login: 'someone' },
    created_at: '',
  },
  { id: 2, body: claimBody('me'), user: { login: 'bot' }, created_at: '' },
  { id: 3, body: claimBody('later'), user: { login: 'bot' }, created_at: '' },
]);

describe(readPullRequestClaim, () => {
  test('reads the head, the state and the oldest claim of this account', async () => {
    const { transport } = recordedTransport({
      '/repos/o/n/pulls/5': ok({ state: 'open', head: { sha: HEAD } }),
      '/repos/o/n/issues/5/comments?per_page=100': COMMENTS,
    });

    assert.deepStrictEqual(
      await readPullRequestClaim(
        { transport, owner: 'o', name: 'n', token: 'token' },
        5,
        'bot',
      ),
      Result.ok({
        open: true,
        headSha: HEAD,
        comment: {
          commentId: 2,
          says: {
            kind: 'standing',
            claim: { headSha: HEAD, by: 'me', at: '2026-11-10T11:00:00Z' },
          },
        },
      }),
    );
  });

  test('is unread when either part is', async () => {
    const { transport } = recordedTransport({
      '/repos/o/n/pulls/5': ok({ state: 'closed', head: { sha: HEAD } }),
    });

    assert.isTrue(
      Result.isErr(
        await readPullRequestClaim(
          { transport, owner: 'o', name: 'n', token: 'token' },
          5,
          'bot',
        ),
      ),
    );
  });
});

describe(readPullRequestState, () => {
  test('reads the state alone, a number that names no pull request (404, 410) as none', async () => {
    const { transport, sent } = recordedTransport({
      '/repos/o/n/pulls/5': ok({ state: 'open', head: { sha: HEAD } }),
      '/repos/o/n/pulls/6': ok({ state: 'closed', head: { sha: HEAD } }),
      '/repos/o/n/pulls/7': status(404, 'Not Found'),
      '/repos/o/n/pulls/8': status(502, 'down'),
      '/repos/o/n/pulls/9': status(410, 'Gone'),
    });

    const context = {
      transport,
      owner: 'o',
      name: 'n',
      token: 'token',
    } as const;

    const [open, closed, none, failed, gone] = await Promise.all(
      [5, 6, 7, 8, 9].map(async (number) =>
        readPullRequestState(context, number),
      ),
    );

    assert.deepStrictEqual(
      [open, closed, none, gone],
      [
        Result.ok('open'),
        Result.ok('closed'),
        Result.ok('none'),
        Result.ok('none'),
      ],
    );

    assert.isTrue(failed !== undefined && Result.isErr(failed));

    assert.strictEqual(failed.value.kind, 'unavailable');

    assert.strictEqual(sent.length, 5);
  });
});

describe(readOwnPullRequestClaim, () => {
  test('reads the oldest claim of this account alone, and no pull request', async () => {
    const { transport, sent } = recordedTransport({
      '/repos/o/n/issues/5/comments?per_page=100': COMMENTS,
    });

    const found = await readOwnPullRequestClaim(
      { transport, owner: 'o', name: 'n', token: 'token' },
      5,
      'bot',
    );

    assert.deepStrictEqual(
      Result.map(found, (record) => record?.commentId),
      Result.ok(2),
    );

    assert.strictEqual(sent.length, 1);
  });

  test('is unread when the comments are', async () => {
    const { transport } = recordedTransport({
      '/repos/o/n/issues/5/comments?per_page=100': status(502, 'down'),
    });

    assert.isTrue(
      Result.isErr(
        await readOwnPullRequestClaim(
          { transport, owner: 'o', name: 'n', token: 'token' },
          5,
          'bot',
        ),
      ),
    );
  });
});
