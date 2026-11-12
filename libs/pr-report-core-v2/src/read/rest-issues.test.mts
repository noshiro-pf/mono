import { Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import {
  readFollowed,
  readMerged,
  readNumbers,
  readOpenIssues,
} from './rest-issues.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const contextOf = (routes: Routes): ReadContext =>
  ({
    transport: recordedTransport(routes).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const issueJson = (number: number, extra: UnknownRecord = {}): UnknownRecord =>
  ({
    number,
    title: `issue ${number}`,
    body: null,
    state: 'open',
    state_reason: null,
    user: { login: 'author' },
    html_url: `https://github.com/o/n/issues/${number}`,
    repository_url: 'https://api.github.com/repos/o/n',
    labels: [],
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z',
    comments: 1,
    ...extra,
  }) as const;

const closedPull = (
  number: number,
  mergedAt: string | null,
  updatedAt: string = mergedAt ?? '2026-11-09T00:00:00Z',
): UnknownRecord =>
  ({
    number,
    title: `pr ${number}`,
    body_html:
      '<p><span class="issue-keyword tooltipped">Closes</span> <a data-hovercard-type="issue" data-url="https://github.com/o/n/issues/3" href="https://github.com/o/n/issues/3">#3</a></p>',
    user: { login: 'author' },
    html_url: `https://github.com/o/n/pull/${number}`,
    labels: [],
    merged_at: mergedAt,
    merge_commit_sha: mergedAt === null ? null : 'm'.repeat(40),
    updated_at: updatedAt,
    head: { ref: `b${number}`, sha: 'h'.repeat(40) },
    base: { ref: 'main' },
  }) as const;

const OPEN =
  '/repos/o/n/issues?state=open&sort=updated&direction=desc&per_page=100';

const NEXT = `${OPEN}&page=2` as const;

const perIssue = (number: number): Routes =>
  ({
    [`/repos/o/n/issues/${number}/dependencies/blocked_by?per_page=100`]: ok([
      { number: 1, repository_url: 'https://api.github.com/repos/o/n' },
      { number: 2, repository_url: 'https://api.github.com/repos/o/other' },
    ]),
    [`/repos/o/n/issues/${number}/comments?per_page=100`]: ok([
      {
        id: number,
        body: 'mine',
        user: { login: 'me' },
        created_at: '2026-11-03T00:00:00Z',
      },
    ]),
  }) as const;

describe(readOpenIssues, () => {
  test('leaves out pull requests and reads each issue', async () => {
    const read = await readOpenIssues(
      contextOf({
        [OPEN]: ok([
          issueJson(5),
          issueJson(6, { pull_request: { merged_at: null } }),
        ]),
        ...perIssue(5),
      }),
      { limit: 10, viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isOk(read));

    assert.isTrue(read.value.complete);

    assert.deepStrictEqual(
      read.value.issues.map(({ number }) => number),
      [5],
    );

    const [issue] = read.value.issues;

    expect(issue?.body).toBe('');

    // #2 is another repository's, whose number names something else here.
    assert.deepStrictEqual(issue?.blockedBy, Result.ok([1]));

    assert.deepStrictEqual(
      issue === undefined
        ? undefined
        : Result.map(issue.comments, (c) => c.length),
      Result.ok(1),
    );
  });

  test('asks what blocks an issue unless its summary says nothing does', async () => {
    const { transport, sent } = recordedTransport({
      [OPEN]: ok([
        issueJson(5, {
          comments: 0,
          issue_dependencies_summary: { total_blocked_by: 0 },
        }),
        issueJson(6, { comments: 0, issue_dependencies_summary: null }),
        issueJson(7, {
          comments: 0,
          issue_dependencies_summary: { total_blocked_by: 1 },
        }),
      ]),
      '/repos/o/n/issues/6/dependencies/blocked_by?per_page=100': ok([]),
      '/repos/o/n/issues/7/dependencies/blocked_by?per_page=100': ok([
        { number: 1, repository_url: 'https://api.github.com/repos/o/n' },
      ]),
    });

    const read = await readOpenIssues(
      { transport, owner: 'o', name: 'n', token: 'token' },
      { limit: 10, viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(
      read.value.issues.map(({ blockedBy }) => blockedBy),
      [Result.ok([]), Result.ok([]), Result.ok([1])],
    );

    expect(
      sent.map(({ url }) => url).filter((url) => url.includes('blocked_by')),
    ).toHaveLength(2);
  });

  test('reads no comments of an issue that has none', async () => {
    const read = await readOpenIssues(
      contextOf({
        [OPEN]: ok([issueJson(5, { comments: 0 })]),
        '/repos/o/n/issues/5/dependencies/blocked_by?per_page=100': ok([]),
      }),
      { limit: 10, viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value.issues[0]?.comments, Result.ok([]));
  });

  test('stops at the limit and says the list is cut short', async () => {
    const read = await readOpenIssues(
      contextOf({
        [OPEN]: ok([issueJson(5), issueJson(6)]),
        ...perIssue(5),
      }),
      { limit: 1, viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isOk(read));

    assert.isFalse(read.value.complete);

    assert.deepStrictEqual(
      read.value.issues.map(({ number }) => number),
      [5],
    );
  });

  test('reads the next page only while the limit is not reached', async () => {
    const read = await readOpenIssues(
      contextOf({
        [OPEN]: ok(
          [issueJson(5), issueJson(9, { pull_request: { merged_at: null } })],
          {
            link: `<https://api.github.com${NEXT}>; rel="next"`,
          },
        ),
        [NEXT]: ok([issueJson(6)]),
        ...perIssue(5),
        ...perIssue(6),
      }),
      { limit: 2, viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isOk(read));

    assert.isTrue(read.value.complete);

    assert.deepStrictEqual(
      read.value.issues.map(({ number }) => number),
      [5, 6],
    );
  });

  test('a page filling the limit with a next page is not complete', async () => {
    const read = await readOpenIssues(
      contextOf({
        [OPEN]: ok([issueJson(5)], {
          link: `<https://api.github.com${NEXT}>; rel="next"`,
        }),
        ...perIssue(5),
      }),
      { limit: 1, viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isOk(read));

    assert.isFalse(read.value.complete);
  });

  test('a failed "blocked by" is unread for that issue alone', async () => {
    const read = await readOpenIssues(
      contextOf({
        [OPEN]: ok([issueJson(5)]),
        ...perIssue(5),
        '/repos/o/n/issues/5/dependencies/blocked_by?per_page=100': status(
          502,
          'bad gateway',
        ),
      }),
      { limit: 10, viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isOk(read));

    assert.isTrue(
      Result.isErr(read.value.issues[0]?.blockedBy ?? Result.ok([])),
    );
  });

  test('a repository with issues turned off has none', async () => {
    const read = await readOpenIssues(
      contextOf({ [OPEN]: status(410, 'Issues are disabled') }),
      { limit: 10, viewer: Result.ok('me') },
    );

    assert.deepStrictEqual(read, Result.ok({ issues: [], complete: true }));
  });
});

describe(readNumbers, () => {
  test('issues, pull requests, and numbers naming nothing', async () => {
    const read = await readNumbers(
      contextOf({
        '/repos/o/n/issues/5': ok(issueJson(5, { state: 'closed' })),
        '/repos/o/n/issues/6': ok(
          issueJson(6, {
            title: 'feat: x',
            state: 'closed',
            pull_request: { merged_at: '2026-11-01T00:00:00Z' },
          }),
        ),
        '/repos/o/n/issues/7': ok(
          issueJson(7, { pull_request: { merged_at: null } }),
        ),
        '/repos/o/n/issues/8': status(404, 'Not Found'),
        '/repos/o/n/issues/9': status(410, 'This issue was deleted'),
        '/repos/o/n/pulls/9': status(404, 'Not Found'),
        // Issues turned off: a pull request answers on its own path.
        '/repos/o/n/issues/11': status(410, 'Issues are disabled'),
        '/repos/o/n/pulls/11': ok({
          title: 'fix: y',
          state: 'closed',
          merged_at: '2026-11-02T00:00:00Z',
        }),
        // No word on whether it merged: read as a pull request.
        '/repos/o/n/issues/12': ok(issueJson(12, { pull_request: {} })),
        '/repos/o/n/pulls/12': ok({
          title: 'fix: z',
          state: 'open',
          merged_at: null,
        }),
        // Transferred: the redirect answers with another repository's issue.
        '/repos/o/n/issues/10': ok(
          issueJson(10, {
            repository_url: 'https://api.github.com/repos/other/repo',
          }),
        ),
        ...perIssue(5),
      }),
      [5, 6, 7, 8, 9, 10, 11, 12],
      Result.ok('me'),
    );

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(Array.from(read.value.issues.keys()), [5]);

    assert.strictEqual(read.value.issues.get(5)?.state, 'closed');

    assert.deepStrictEqual(Array.from(read.value.references.values()), [
      {
        kind: 'pull-request',
        number: 6,
        title: 'feat: x',
        state: 'closed',
        merged: true,
      },
      {
        kind: 'pull-request',
        number: 7,
        title: 'issue 7',
        state: 'open',
        merged: false,
      },
      { kind: 'unknown', number: 8 },
      { kind: 'unknown', number: 9 },
      { kind: 'unknown', number: 10 },
      {
        kind: 'pull-request',
        number: 11,
        title: 'fix: y',
        state: 'closed',
        merged: true,
      },
      {
        kind: 'pull-request',
        number: 12,
        title: 'fix: z',
        state: 'open',
        merged: false,
      },
    ]);
  });

  test('any other failure fails the whole', async () => {
    const read = await readNumbers(
      contextOf({ '/repos/o/n/issues/5': status(500, 'oops') }),
      [5],
      Result.ok('me'),
    );

    assert.isTrue(Result.isErr(read));
  });
});

describe(readMerged, () => {
  test('asks the list with its rendering', async () => {
    const { transport, sent } = recordedTransport({
      '/repos/o/n/pulls?state=closed&sort=updated&direction=desc&per_page=100':
        ok([]),
    });

    await readMerged(
      { transport, owner: 'o', name: 'n', token: 'token' },
      { limit: 2, days: 3, nowEpochMs: Date.parse('2026-11-10T00:00:00Z') },
    );

    assert.strictEqual(
      sent[0]?.headers['accept'],
      'application/vnd.github.full+json',
    );
  });

  test('keeps the latest merged within the window, up to the limit', async () => {
    const read = await readMerged(
      contextOf({
        '/repos/o/n/pulls?state=closed&sort=updated&direction=desc&per_page=100':
          ok(
            [
              closedPull(1, '2026-11-09T00:00:00Z'),
              closedPull(2, null),
              closedPull(3, '2026-11-01T00:00:00Z'),
              closedPull(4, '2026-11-08T00:00:00Z'),
              closedPull(5, '2026-11-08T12:00:00Z'),
            ],
            // This page reaches before the window: the next is not read.
            {
              link: '<https://api.github.com/repos/o/n/pulls?page=2>; rel="next"',
            },
          ),
      }),
      {
        limit: 2,
        days: 3,
        nowEpochMs: Date.parse('2026-11-10T00:00:00Z'),
      },
    );

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(
      read.value.map(({ number }) => number),
      [1, 5],
    );

    assert.deepStrictEqual(read.value[0]?.closingIssues, [3]);
  });

  test('reads on while every pull request on a page is in the window', async () => {
    const page2 =
      '/repos/o/n/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=2';

    const read = await readMerged(
      contextOf({
        '/repos/o/n/pulls?state=closed&sort=updated&direction=desc&per_page=100':
          ok(
            [
              // Updated long after it merged: it still sorts first.
              closedPull(1, '2026-11-01T00:00:00Z', '2026-11-09T12:00:00Z'),
              closedPull(2, null),
            ],
            { link: `<https://api.github.com${page2}>; rel="next"` },
          ),
        [page2]: ok([
          closedPull(3, '2026-11-08T00:00:00Z'),
          closedPull(4, '2026-10-01T00:00:00Z'),
        ]),
      }),
      {
        limit: 10,
        days: 3,
        nowEpochMs: Date.parse('2026-11-10T00:00:00Z'),
      },
    );

    assert.deepStrictEqual(
      Result.unwrapThrow(read).map(({ number }) => number),
      [3],
    );
  });
});

describe(readFollowed, () => {
  test('merged, closed; still open, and no pull request, left out', async () => {
    const read = await readFollowed(
      contextOf({
        '/repos/o/n/pulls/1': ok({
          state: 'closed',
          merged_at: '2026-11-09T00:00:00Z',
          closed_at: '2026-11-09T00:00:00Z',
        }),
        '/repos/o/n/pulls/2': ok({
          state: 'closed',
          merged_at: null,
          closed_at: '2026-11-08T00:00:00Z',
        }),
        '/repos/o/n/pulls/3': ok({
          state: 'open',
          merged_at: null,
          closed_at: null,
        }),
        '/repos/o/n/pulls/4': status(404, 'Not Found'),
      }),
      [1, 2, 3, 4],
    );

    assert.deepStrictEqual(
      read,
      Result.ok([
        { number: 1, state: 'merged', at: '2026-11-09T00:00:00Z' },
        { number: 2, state: 'closed', at: '2026-11-08T00:00:00Z' },
      ]),
    );
  });
});
