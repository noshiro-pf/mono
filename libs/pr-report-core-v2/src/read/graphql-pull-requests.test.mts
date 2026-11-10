// cspell:ignore Fheads
import { Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import type { PullRequestFacts } from '../snapshot/index.mjs';
import { readPullRequestsGraphql } from './graphql-pull-requests.mjs';
import { ok, recordedTransport } from './recorded-transport.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const HEAD = 'b'.repeat(40);

const PARENT_HEAD = 'c'.repeat(40);

const contextOf = (recorded: Routes): ReadContext =>
  ({
    transport: recordedTransport(recorded).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const checksOf = (sha: string): Routes =>
  ({
    [`/repos/o/n/commits/${sha}/check-runs?filter=all&per_page=100`]: ok({
      check_runs: [],
    }),
    [`/repos/o/n/commits/${sha}/status?per_page=100`]: ok({ statuses: [] }),
    [`/repos/o/n/actions/runs?head_sha=${sha}&per_page=100`]: ok({
      workflow_runs: [],
    }),
  }) as const;

const restOf = (number: number, branch: string): Routes =>
  ({
    [`/repos/o/n/activity?ref=refs%2Fheads%2F${branch}&activity_type=push&direction=asc&per_page=100`]:
      ok([]),
    [`/repos/o/n/compare/main...${HEAD}`]: ok({
      ahead_by: number,
      behind_by: 0,
    }),
  }) as const;

const issueLink = (repo: string, number: number): string =>
  `<span class="issue-keyword tooltipped">Closes</span> <a data-hovercard-type="issue" data-url="https://github.com/${repo}/issues/${number}">#${number}</a>` as const;

const pullNode = (number: number, extra: UnknownRecord = {}): UnknownRecord =>
  ({
    number,
    title: `pr ${number}`,
    body: '',
    bodyHTML: '',
    url: `https://github.com/o/n/pull/${number}`,
    isDraft: false,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-02T00:00:00Z',
    author: { login: 'author' },
    labels: { totalCount: 0, nodes: [] },
    autoMergeRequest: null,
    headRefName: `b${number}`,
    headRefOid: HEAD,
    baseRefName: 'main',
    mergeStateStatus: 'BEHIND',
    headRepository: { nameWithOwner: 'O/N' },
    commits: {
      nodes: [{ commit: { oid: HEAD, committedDate: '2026-11-02T00:00:00Z' } }],
    },
    closingIssuesReferences: { totalCount: 0, nodes: [] },
    ...extra,
  }) as const;

const detailsNode = (
  number: number,
  extra: UnknownRecord = {},
): UnknownRecord =>
  ({
    number,
    changedFiles: 0,
    latestOpinionatedReviews: { totalCount: 0, nodes: [] },
    files: { nodes: [] },
    reviewThreads: { totalCount: 0, nodes: [] },
    comments: { totalCount: 0, nodes: [] },
    stackEntry: null,
    timelineItems: { totalCount: 0, nodes: [] },
    ...extra,
  }) as const;

const page = (
  nodes: readonly UnknownRecord[],
  endCursor: string | null = null,
): ReturnType<typeof ok> =>
  ok({
    data: {
      repository: {
        list: {
          pageInfo: { hasNextPage: endCursor !== null, endCursor },
          nodes,
        },
      },
    },
  });

const readOne = async (
  pull: UnknownRecord,
  details: UnknownRecord,
  routes: Routes = {},
): Promise<PullRequestFacts> => {
  const [pr] = Result.unwrapThrow(
    await readPullRequestsGraphql(
      contextOf({
        'graphql:query PullRequests(': page([pull]),
        'graphql:query PullRequestDetails(': page([details]),
        ...checksOf(HEAD),
        ...restOf(1, 'b7'),
        ...routes,
      }),
      { viewer: Result.ok('me') },
    ),
  );

  assert.isDefined(pr);

  return pr;
};

describe(readPullRequestsGraphql, () => {
  test('reads every page of both parts, and joins them by number', async () => {
    const pulls = Result.unwrapThrow(
      await readPullRequestsGraphql(
        contextOf({
          'graphql:query PullRequests(': [
            page([pullNode(7)], 'cursor'),
            page([pullNode(8)]),
          ],
          'graphql:query PullRequestDetails(': page([
            detailsNode(7),
            detailsNode(8, {
              stackEntry: { position: 2, stack: { number: 4, size: 3 } },
            }),
          ]),
          ...checksOf(HEAD),
          ...restOf(1, 'b7'),
          ...restOf(1, 'b8'),
        }),
        { viewer: Result.ok('me') },
      ),
    );

    assert.deepStrictEqual(
      pulls.map(({ number }) => number),
      [7, 8],
    );

    // GitHub's names ignore case.
    assert.isFalse(pulls[0]?.fromFork ?? true);

    assert.deepStrictEqual(
      pulls[1]?.nativeStack,
      Result.ok({ stack: 4, position: 2, size: 3 }),
    );
  });

  test('closes what the body marks, in its order, then what GitHub links', async () => {
    const pr = await readOne(
      pullNode(7, {
        bodyHTML: `${issueLink('o/n', 4)} ${issueLink('o/n', 3)} ${issueLink('other/repo', 9)}`,
        closingIssuesReferences: {
          totalCount: 3,
          nodes: [
            {
              number: 3,
              title: 'three',
              url: 'https://github.com/o/n/issues/3',
              state: 'CLOSED',
              repository: { nameWithOwner: 'o/n' },
            },
            {
              number: 5,
              title: 'five',
              url: 'https://github.com/o/n/issues/5',
              state: 'OPEN',
              repository: { nameWithOwner: 'o/n' },
            },
            {
              number: 6,
              title: 'elsewhere',
              url: 'https://github.com/other/repo/issues/6',
              state: 'OPEN',
              repository: { nameWithOwner: 'other/repo' },
            },
          ],
        },
      }),
      detailsNode(7),
      {
        // Marked in the body, not linked: read as REST reads it.
        '/repos/o/n/issues/4': ok({
          title: 'four',
          html_url: 'https://github.com/o/n/issues/4',
          state: 'open',
        }),
      },
    );

    assert.deepStrictEqual(
      Result.unwrapThrow(pr.closingIssues).map(
        ({ number, state }) => [number, state] as const,
      ),
      [
        [4, 'open'],
        [3, 'closed'],
        [5, 'open'],
      ],
    );
  });

  test('a rename, or files past those listed, are read over REST', async () => {
    const pr = await readOne(
      pullNode(7),
      detailsNode(7, {
        changedFiles: 2,
        files: { nodes: [{ path: 'b.md', changeType: 'RENAMED' }] },
        reviewThreads: { totalCount: 101, nodes: [{ isResolved: false }] },
      }),
      {
        '/repos/o/n/pulls/7/files?per_page=100': ok([
          { filename: 'b.md', status: 'renamed', previous_filename: 'a.md' },
          { filename: 'c.md', status: 'added' },
        ]),
      },
    );

    const review = Result.unwrapThrow(pr.review);

    assert.deepStrictEqual(review.files, [
      { path: 'b.md', change: 'renamed', previousPath: 'a.md' },
      { path: 'c.md', change: 'added', previousPath: undefined },
    ]);

    assert.isTrue(review.filesComplete);

    // More conversations than read: how many are open is not known.
    assert.strictEqual(review.unresolvedConversations, 'unknown');
  });

  test('a base moved off a merged parent reads that parent', async () => {
    const pr = await readOne(
      pullNode(7),
      detailsNode(7, {
        timelineItems: {
          totalCount: 1,
          nodes: [
            {
              previousRefName: 'parent',
              currentRefName: 'main',
              createdAt: '2026-11-03T00:00:00Z',
            },
          ],
        },
      }),
      {
        'graphql:query MergedHead(': ok({
          data: {
            repository: {
              pullRequests: {
                nodes: [
                  // The branch name reused after the base moved: not the parent.
                  {
                    number: 10,
                    headRefOid: 'f'.repeat(40),
                    mergedAt: '2026-11-04T00:00:00Z',
                    headRepository: { nameWithOwner: 'o/n' },
                    mergeCommit: { oid: 'f'.repeat(40) },
                  },
                  // A fork's branch of the same name: not the parent.
                  {
                    number: 9,
                    headRefOid: 'e'.repeat(40),
                    mergedAt: '2026-11-02T12:00:00Z',
                    headRepository: { nameWithOwner: 'fork/n' },
                    mergeCommit: { oid: 'e'.repeat(40) },
                  },
                  {
                    number: 5,
                    headRefOid: 'a'.repeat(40),
                    mergedAt: '2026-10-01T00:00:00Z',
                    headRepository: { nameWithOwner: 'o/n' },
                    mergeCommit: { oid: 'a'.repeat(40) },
                  },
                  {
                    number: 6,
                    headRefOid: PARENT_HEAD,
                    mergedAt: '2026-11-02T00:00:00Z',
                    headRepository: { nameWithOwner: 'o/n' },
                    mergeCommit: { oid: 'm'.repeat(40) },
                  },
                ],
              },
            },
          },
        }),
        [`/repos/o/n/compare/${PARENT_HEAD}...${HEAD}`]: ok({
          ahead_by: 1,
          behind_by: 0,
        }),
      },
    );

    assert.deepStrictEqual(
      pr.baseChanges,
      Result.ok([{ from: 'parent', to: 'main', at: '2026-11-03T00:00:00Z' }]),
    );

    assert.deepStrictEqual(
      pr.mergedParent,
      Result.ok({
        number: 6,
        headSha: PARENT_HEAD,
        mergeCommitSha: 'm'.repeat(40),
        containsHead: true,
      }),
    );
  });

  test('more comments than listed are read over REST; a head not last is read by sha', async () => {
    const pr = await readOne(
      pullNode(7, {
        commits: {
          nodes: [
            {
              commit: {
                oid: 'd'.repeat(40),
                committedDate: '2026-11-05T00:00:00Z',
              },
            },
          ],
        },
      }),
      detailsNode(7, { comments: { totalCount: 150, nodes: [] } }),
      {
        '/repos/o/n/issues/7/comments?per_page=100': ok([
          {
            id: 1,
            body: 'old record',
            user: { login: 'me' },
            created_at: '2026-10-01T00:00:00Z',
          },
        ]),
        [`/repos/o/n/commits/${HEAD}`]: ok({
          commit: { committer: { date: '2026-11-02T00:00:00Z' } },
        }),
      },
    );

    assert.deepStrictEqual(
      pr.comments,
      Result.ok([
        { id: 1, body: 'old record', createdAt: '2026-10-01T00:00:00Z' },
      ]),
    );

    assert.deepStrictEqual(
      pr.headCommittedAt,
      Result.ok('2026-11-02T00:00:00Z'),
    );
  });

  test('more labels than listed are read over REST', async () => {
    const pr = await readOne(
      pullNode(7, { labels: { totalCount: 101, nodes: [] } }),
      detailsNode(7),
      {
        '/repos/o/n/issues/7/labels?per_page=100': ok([
          { name: 'merge-queued', color: '0e8a16', description: null },
        ]),
      },
    );

    assert.deepStrictEqual(pr.labels, [
      { name: 'merge-queued', color: '0e8a16', description: '' },
    ]);
  });

  test('a next page with no cursor fails the list', async () => {
    const read = await readPullRequestsGraphql(
      contextOf({
        'graphql:query PullRequests(': ok({
          data: {
            repository: {
              list: {
                pageInfo: { hasNextPage: true, endCursor: null },
                nodes: [],
              },
            },
          },
        }),
        'graphql:query PullRequestDetails(': page([]),
      }),
      { viewer: Result.ok('me') },
    );

    assert.isTrue(Result.isErr(read));
  });

  test('a full scan of merged heads may have missed the parent: unread', async () => {
    const pr = await readOne(
      pullNode(7),
      detailsNode(7, {
        timelineItems: {
          totalCount: 1,
          nodes: [
            {
              previousRefName: 'renovate',
              currentRefName: 'main',
              createdAt: '2026-11-03T00:00:00Z',
            },
          ],
        },
      }),
      {
        'graphql:query MergedHead(': ok({
          data: {
            repository: {
              pullRequests: {
                nodes: Array.from({ length: 100 }, (_, index) => ({
                  number: index + 100,
                  headRefOid: 'a'.repeat(40),
                  mergedAt: '2026-10-01T00:00:00Z',
                  headRepository: { nameWithOwner: 'o/n' },
                  mergeCommit: { oid: 'a'.repeat(40) },
                })),
              },
            },
          },
        }),
      },
    );

    assert.isTrue(Result.isErr(pr.mergedParent));
  });

  test('one opened between the two parts lacks only its details', async () => {
    const [pr] = Result.unwrapThrow(
      await readPullRequestsGraphql(
        contextOf({
          'graphql:query PullRequests(': page([pullNode(7)]),
          'graphql:query PullRequestDetails(': page([]),
          ...checksOf(HEAD),
          ...restOf(1, 'b7'),
        }),
        { viewer: Result.ok('me') },
      ),
    );

    assert.isDefined(pr);

    assert.isTrue(Result.isErr(pr.review));

    assert.isTrue(Result.isErr(pr.mergedParent));

    assert.isTrue(Result.isOk(pr.checks));
  });
});
