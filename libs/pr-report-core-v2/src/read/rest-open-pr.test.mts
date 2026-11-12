// cspell:ignore Afeature
import { Result } from 'ts-data-forge';
import { ok, recordedTransport } from './recorded-transport.mjs';
import {
  createPullRequest,
  readClosingOrder,
  readOpenPullRequestsHeaded,
  readSuccessor,
} from './rest-open-pr.mjs';

const context = (
  routes: Parameters<typeof recordedTransport>[0],
): Readonly<{
  context: Parameters<typeof readClosingOrder>[0];
  sent: ReturnType<typeof recordedTransport>['sent'];
}> => {
  const { transport, sent } = recordedTransport(routes);

  return {
    context: { transport, owner: 'o', name: 'n', token: 'token' },
    sent,
  };
};

const closes = (number: number): string =>
  `<p><span class="issue-keyword tooltipped">Closes</span> <a data-hovercard-type="issue" data-url="https://github.com/o/n/issues/${number}">#${number}</a></p>` as const;

const OWN = 'https://api.github.com/repos/o/n';

describe(readOpenPullRequestsHeaded, () => {
  test("reads this repository's branch, qualified by the owner", async () => {
    const { context: read } = context({
      '/repos/o/n/pulls?state=open&per_page=2&head=o%3Afeature': ok([
        { number: 5, node_id: 'PR_5', draft: true, base: { ref: 'main' } },
      ]),
    });

    assert.deepStrictEqual(
      await readOpenPullRequestsHeaded(read, 'feature'),
      Result.ok([{ number: 5, nodeId: 'PR_5', isDraft: true, base: 'main' }]),
    );
  });
});

describe(createPullRequest, () => {
  test('opens it ready for review', async () => {
    const { context: write, sent } = context({
      'POST /repos/o/n/pulls': ok({ number: 9 }),
    });

    assert.deepStrictEqual(
      await createPullRequest(write, {
        head: 'feature',
        base: 'main',
        title: 't',
        body: 'b',
      }),
      Result.ok(9),
    );

    assert.deepStrictEqual(JSON.parse(sent[0]?.body ?? ''), {
      head: 'feature',
      base: 'main',
      title: 't',
      body: 'b',
      draft: false,
    });
  });
});

describe(readSuccessor, () => {
  test('reads its state, body and branch', async () => {
    const { context: read } = context({
      '/repos/o/n/pulls/7': ok({
        state: 'OPEN',
        body: null,
        head: { ref: 'x' },
      }),
    });

    assert.deepStrictEqual(
      await readSuccessor(read, 7),
      Result.ok({ state: 'open', body: '', head: 'x' }),
    );
  });
});

describe(readClosingOrder, () => {
  test('reads what each open issue it closes waits for, and every open pull request', async () => {
    const { context: read } = context({
      '/repos/o/n/pulls/5': ok({
        body: 'Closes #10, closes #12, closes #13',
        body_html: `${closes(10)}${closes(12)}${closes(13)}`,
      }),
      '/repos/o/n/issues/10': ok({
        state: 'open',
        body: 'Start-After: #11',
        repository_url: OWN,
        // Null where GitHub keeps no dependencies: asked all the same.
        issue_dependencies_summary: null,
      }),
      '/repos/o/n/issues/10/dependencies/blocked_by?per_page=100': ok([
        { number: 14, repository_url: OWN },
      ]),
      // Closed, and so waits for nothing.
      '/repos/o/n/issues/12': ok({
        state: 'closed',
        body: 'Start-After: #1',
        repository_url: OWN,
      }),
      // Transferred away: its numbers name another repository's.
      '/repos/o/n/issues/13': ok({
        state: 'open',
        body: 'Start-After: #2',
        repository_url: 'https://api.github.com/repos/o/other',
      }),
      '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok(
        [
          { number: 5, body_html: closes(10) },
          { number: 6, body_html: closes(11) },
        ],
        {
          link: '<https://api.github.com/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100&page=2>; rel="next"',
        },
      ),
      '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100&page=2':
        ok([{ number: 8, body_html: null }]),
    });

    assert.deepStrictEqual(
      await readClosingOrder(read, 5),
      Result.ok({
        body: 'Closes #10, closes #12, closes #13',
        startAfterOf: new Map<number, readonly number[]>([[10, [11, 14]]]),
        others: [
          { number: 6, closes: [11] },
          { number: 8, closes: [] },
        ],
      }),
    );
  });

  test('asks nothing of what blocks an issue whose summary says nothing does', async () => {
    const { context: read, sent } = context({
      '/repos/o/n/pulls/5': ok({ body: 'Closes #10', body_html: closes(10) }),
      '/repos/o/n/issues/10': ok({
        state: 'open',
        body: '',
        repository_url: OWN,
        issue_dependencies_summary: { total_blocked_by: 0 },
      }),
    });

    assert.isTrue(Result.isOk(await readClosingOrder(read, 5)));

    expect(sent).toHaveLength(2);
  });

  test('reads no other pull request when no closing issue waits', async () => {
    const { context: read, sent } = context({
      '/repos/o/n/pulls/5': ok({ body: 'Closes #10', body_html: closes(10) }),
      '/repos/o/n/issues/10': ok({
        state: 'open',
        body: '',
        repository_url: OWN,
      }),
      '/repos/o/n/issues/10/dependencies/blocked_by?per_page=100': ok([]),
    });

    assert.deepStrictEqual(
      await readClosingOrder(read, 5),
      Result.ok({
        body: 'Closes #10',
        startAfterOf: new Map<number, readonly number[]>([[10, []]]),
        others: [],
      }),
    );

    expect(sent).toHaveLength(3);
  });
});
