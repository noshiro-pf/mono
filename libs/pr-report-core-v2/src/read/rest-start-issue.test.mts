import { Result } from 'ts-data-forge';
import { ok, recordedTransport } from './recorded-transport.mjs';
import { readIssueUpdatedAt, readStartIssue } from './rest-start-issue.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const NOW = Date.parse('2026-11-10T12:00:00Z');

const contextOf = (routes: Routes): ReadContext =>
  ({
    transport: recordedTransport(routes).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const claimBody = (by: string, state = 'started'): string =>
  `<!-- start-issue:claim state=${state} by=${by} at=2026-11-10T11:00:00Z -->\n\nStarted.` as const;

/** A keyword GitHub marked, and its link to issue `number` of o/n. */
const closing = (keyword: string, number: number): string =>
  `<p><span class="issue-keyword tooltipped">${keyword}</span> <a class="issue-link" data-hovercard-type="issue" data-url="https://github.com/o/n/issues/${number}" href="https://github.com/o/n/issues/${number}">#${number}</a></p>` as const;

const ISSUE = {
  state: 'open',
  labels: [{ name: 'in-progress', color: '', description: null }],
} as const;

describe(readStartIssue, () => {
  test('reads the issue, its closers and the oldest claim of this account', async () => {
    const read = await readStartIssue(
      contextOf({
        '/repos/o/n/issues/5': ok(ISSUE),
        '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100':
          ok([
            { number: 9, body_html: closing('Closes', 5) },
            { number: 8, body_html: '<p>Mentions #5</p>' },
            { number: 7, body_html: closing('Fixes', 5) },
            { number: 6, body_html: '<p><code>Fixes #5</code></p>' },
            { number: 5, body_html: null },
          ]),
        '/repos/o/n/issues/5/comments?per_page=100': ok([
          {
            id: 1,
            body: claimBody('them'),
            user: { login: 'someone' },
            created_at: '',
          },
          {
            id: 2,
            body: claimBody('me'),
            user: { login: 'bot' },
            created_at: '',
          },
          {
            id: 3,
            body: claimBody('later'),
            user: { login: 'bot' },
            created_at: '',
          },
        ]),
      }),
      5,
      { viewer: 'bot', nowEpochMs: NOW, withClosers: true },
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), {
      facts: {
        open: true,
        pullRequest: false,
        labels: ['in-progress'],
        closers: [7, 9],
        claim: { state: 'started', by: 'me', at: '2026-11-10T11:00:00Z' },
        lastClaimant: 'me',
      },
      comment: {
        commentId: 2,
        says: {
          kind: 'standing',
          claim: { state: 'started', by: 'me', at: '2026-11-10T11:00:00Z' },
        },
      },
    });
  });

  test('asks the open pull requests with their rendering', async () => {
    const { transport, sent } = recordedTransport({
      '/repos/o/n/issues/5': ok(ISSUE),
      '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok(
        [],
      ),
      '/repos/o/n/issues/5/comments?per_page=100': ok([]),
    });

    await readStartIssue(
      { transport, owner: 'o', name: 'n', token: 'token' },
      5,
      { viewer: 'bot', nowEpochMs: NOW, withClosers: true },
    );

    assert.deepStrictEqual(
      sent.map(({ url, headers }) => [url.split('?', 1)[0], headers['accept']]),
      [
        [
          'https://api.github.com/repos/o/n/issues/5',
          'application/vnd.github+json',
        ],
        [
          'https://api.github.com/repos/o/n/pulls',
          'application/vnd.github.full+json',
        ],
        [
          'https://api.github.com/repos/o/n/issues/5/comments',
          'application/vnd.github+json',
        ],
      ],
    );
  });

  test('reads the claim last, after every page of the open pull requests', async () => {
    const { transport, sent } = recordedTransport({
      '/repos/o/n/issues/5': ok(ISSUE),
      '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok(
        [],
        {
          link: '<https://api.github.com/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100&page=2>; rel="next"',
        },
      ),
      '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100&page=2':
        ok([]),
      '/repos/o/n/issues/5/comments?per_page=100': ok([]),
    });

    await readStartIssue(
      { transport, owner: 'o', name: 'n', token: 'token' },
      5,
      { viewer: 'bot', nowEpochMs: NOW, withClosers: true },
    );

    assert.match(sent.at(-1)?.url ?? '', /\/issues\/5\/comments/u);

    assert.strictEqual(sent.length, 4);
  });

  test('asks no pull request without closers, and keeps a lapsed plan’s claimant', async () => {
    const { transport, sent } = recordedTransport({
      '/repos/o/n/issues/5': ok({ ...ISSUE, pull_request: {} }),
      '/repos/o/n/issues/5/comments?per_page=100': ok([
        {
          id: 2,
          body: claimBody('me', 'planned').replace('2026-11-10', '2026-11-01'),
          user: { login: 'bot' },
          created_at: '',
        },
      ]),
    });

    const read = await readStartIssue(
      { transport, owner: 'o', name: 'n', token: 'token' },
      5,
      { viewer: 'bot', nowEpochMs: NOW, withClosers: false },
    );

    const { facts } = Result.unwrapThrow(read);

    assert.isTrue(facts.pullRequest);

    assert.isUndefined(facts.claim);

    assert.strictEqual(facts.lastClaimant, 'me');

    assert.isFalse(sent.some(({ url }) => url.includes('/pulls')));
  });
});

describe(readIssueUpdatedAt, () => {
  test('reads when the issue last changed', async () => {
    assert.deepStrictEqual(
      await readIssueUpdatedAt(
        contextOf({
          '/repos/o/n/issues/5': ok({
            ...ISSUE,
            updated_at: '2026-11-10T12:00:00Z',
          }),
        }),
        5,
      ),
      Result.ok('2026-11-10T12:00:00Z'),
    );
  });
});
