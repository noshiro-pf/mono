// cspell:ignore Fheads Ffeature
import { Result } from 'ts-data-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import { latestReviewsOf, readPullRequests } from './rest-pull-requests.mjs';
import type { ReadContext } from './transport.mjs';

const HEAD = 'b'.repeat(40);

type Routes = Parameters<typeof recordedTransport>[0];

const contextOf = (routes: Routes): ReadContext =>
  ({
    transport: recordedTransport(routes).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const emptyChecks = {
  [`/repos/o/n/commits/${HEAD}/check-runs?filter=all&per_page=100`]: ok({
    check_runs: [],
  }),
  [`/repos/o/n/commits/${HEAD}/status?per_page=100`]: ok({ statuses: [] }),
  [`/repos/o/n/actions/runs?head_sha=${HEAD}&per_page=100`]: ok({
    workflow_runs: [],
  }),
} as const;

const PULL = {
  number: 7,
  title: 'fix: a thing',
  body: 'Fixes #3\n\n```\nFixes #4\n```',
  // GitHub marks the keyword it links; the one in code it leaves as text.
  body_html:
    '<p><span class="issue-keyword tooltipped">Fixes</span> <a data-hovercard-type="issue" data-url="https://github.com/o/n/issues/3" href="https://github.com/o/n/issues/3">#3</a></p><pre><code>Fixes #4</code></pre>',
  user: { login: 'author' },
  html_url: 'https://github.com/o/n/pull/7',
  draft: false,
  labels: [{ name: 'merge-queued', color: '0e8a16', description: null }],
  auto_merge: null,
  // GitHub's names ignore case.
  head: { ref: 'feature', sha: HEAD, repo: { full_name: 'O/n' } },
  base: { ref: 'main' },
  mergeable_state: 'behind',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-02T00:00:00Z',
  changed_files: 1,
} as const;

const routesOf = (overrides: Routes = {}): Routes =>
  ({
    '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok([
      { number: 7 },
    ]),
    '/repos/o/n/pulls/7': ok(PULL),
    [`/repos/o/n/commits/${HEAD}`]: ok({
      commit: { committer: { date: '2026-11-02T00:00:00Z' } },
    }),
    ...emptyChecks,
    '/repos/o/n/pulls/7/reviews?per_page=100': ok([
      { state: 'APPROVED', user: { login: 'writer' } },
      { state: 'COMMENTED', user: { login: 'writer' } },
      { state: 'APPROVED', user: { login: 'reader' } },
      { state: 'PENDING', user: { login: 'writer' } },
    ]),
    '/repos/o/n/collaborators/writer/permission': ok({ permission: 'write' }),
    '/repos/o/n/collaborators/reader/permission': ok({ permission: 'read' }),
    '/repos/o/n/pulls/7/files?per_page=100': ok([
      { filename: 'b.md', status: 'renamed', previous_filename: 'a.md' },
    ]),
    '/repos/o/n/activity?ref=refs%2Fheads%2Ffeature&activity_type=push&direction=asc&per_page=100':
      ok([
        {
          activity_type: 'branch_creation',
          before: '0'.repeat(40),
          after: HEAD,
          actor: { login: 'author' },
        },
      ]),
    '/repos/o/n/issues/7/comments?per_page=100': ok([
      {
        id: 1,
        body: 'mine',
        user: { login: 'me' },
        created_at: '2026-11-03T00:00:00Z',
      },
      {
        id: 2,
        body: 'theirs',
        user: { login: 'someone' },
        created_at: '2026-11-03T00:00:00Z',
      },
    ]),
    '/repos/o/n/issues/3': ok({
      title: 'a thing',
      html_url: 'https://github.com/o/n/issues/3',
      state: 'open',
    }),
    '/repos/o/n/compare/main...bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb': ok({
      ahead_by: 1,
      behind_by: 2,
    }),
    ...overrides,
  }) as const;

describe(readPullRequests, () => {
  test('reads each part of each open pull request', async () => {
    const [pr] = Result.unwrapThrow(
      await readPullRequests(contextOf(routesOf()), {
        viewer: Result.ok('me'),
        defaultBranch: 'main',
      }),
    );

    assert.isDefined(pr);

    assert.strictEqual(pr.mergeState, 'BEHIND');

    assert.isFalse(pr.fromFork);

    assert.deepStrictEqual(pr.labels, [
      { name: 'merge-queued', color: '0e8a16', description: '' },
    ]);

    assert.deepStrictEqual(
      pr.review,
      Result.ok({
        latestReviews: [{ login: 'writer', state: 'APPROVED' }] as const,
        files: [
          { path: 'b.md', change: 'renamed', previousPath: 'a.md' },
        ] as const,
        filesComplete: true,
        unresolvedConversations: 'unknown',
        pushers: ['author'],
      } as const),
    );

    assert.deepStrictEqual(
      pr.comments,
      Result.ok([{ id: 1, body: 'mine', createdAt: '2026-11-03T00:00:00Z' }]),
    );

    // Only what GitHub marked closes: not the keyword in code.
    assert.deepStrictEqual(
      pr.closingIssues,
      Result.ok([
        {
          number: 3,
          title: 'a thing',
          url: 'https://github.com/o/n/issues/3',
          state: 'open',
        },
      ]),
    );

    assert.deepStrictEqual(
      pr.comparison,
      Result.ok({ aheadBy: 1, behindBy: 2 }),
    );

    assert.strictEqual(
      Result.isErr(pr.nativeStack) ? pr.nativeStack.value.kind : undefined,
      'skipped',
    );
  });

  test('asks each pull request with its rendering', async () => {
    const { transport, sent } = recordedTransport(routesOf());

    await readPullRequests(
      { transport, owner: 'o', name: 'n', token: 'token' },
      { viewer: Result.ok('me'), defaultBranch: 'main' },
    );

    assert.strictEqual(
      sent.find(({ url }) => url.endsWith('/pulls/7'))?.headers['accept'],
      'application/vnd.github.full+json',
    );
  });

  test('fails on an answer without the rendering', async () => {
    const { body_html: _, ...withoutRendering } = PULL;

    const read = await readPullRequests(
      contextOf(routesOf({ '/repos/o/n/pulls/7': ok(withoutRendering) })),
      { viewer: Result.ok('me'), defaultBranch: 'main' },
    );

    assert.isTrue(Result.isErr(read));

    assert.strictEqual(read.value.kind, 'malformed');

    assert.include(read.value.message, 'body_html');
  });

  test('keeps a part that failed on its own', async () => {
    const [pr] = Result.unwrapThrow(
      await readPullRequests(
        contextOf(
          routesOf({
            '/repos/o/n/pulls/7/files?per_page=100': status(502, 'bad gateway'),
          }),
        ),
        { viewer: Result.ok('me'), defaultBranch: 'main' },
      ),
    );

    assert.isDefined(pr);

    assert.isTrue(Result.isErr(pr.review));

    assert.isTrue(Result.isOk(pr.checks));
  });

  test('is unread when the list is, or a pull request in it is', async () => {
    assert.isTrue(
      Result.isErr(
        await readPullRequests(
          contextOf(
            routesOf({
              '/repos/o/n/pulls/7': status(502, 'bad gateway'),
            }),
          ),
          { viewer: Result.ok('me'), defaultBranch: 'main' },
        ),
      ),
    );
  });
});

describe(latestReviewsOf, () => {
  test('keeps each writer’s latest review that counts', () => {
    assert.deepStrictEqual(
      latestReviewsOf(
        [
          { login: 'a', state: 'CHANGES_REQUESTED' },
          { login: 'a', state: 'APPROVED' },
          { login: 'a', state: 'COMMENTED' },
          { login: 'b', state: 'approved' },
          { login: 'c', state: 'DISMISSED' },
        ],
        (login) => login !== 'b',
      ),
      [
        { login: 'a', state: 'APPROVED' },
        { login: 'c', state: 'DISMISSED' },
      ],
    );
  });
});
