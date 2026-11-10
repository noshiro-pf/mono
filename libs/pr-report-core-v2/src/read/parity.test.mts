// cspell:ignore Fheads Ffeature
/**
 * The two readers, given recorded answers of one repository state, build the
 * same snapshot (`libs/pr-merge-queue-v2/spec/README.md`, §3), save for what
 * one of them cannot read: the parts only GraphQL serves, the open
 * conversations REST cannot tell, and a rename's old path GraphQL withholds.
 */

import { Result } from 'ts-data-forge';
import type { PullRequestFacts, Snapshot } from '../snapshot/index.mjs';
import {
  branchTipsNotRead,
  readSnapshotGraphql,
  readSnapshotRest,
} from './read-snapshot.mjs';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const TIP = 'f'.repeat(40);

const HEAD = 'b'.repeat(40);

const contextOf = (recorded: Routes): ReadContext =>
  ({
    transport: recordedTransport(recorded).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const options = {
  nowEpochMs: Date.parse('2026-11-10T00:00:00Z'),
  issuesLimit: 10,
  mergedLimit: 10,
  mergedDays: 7,
  follow: [],
  readBranchTips: branchTipsNotRead,
} as const;

const emptyChecksOf = (sha: string): Routes =>
  ({
    [`/repos/o/n/commits/${sha}/check-runs?filter=all&per_page=100`]: ok({
      check_runs: [],
    }),
    [`/repos/o/n/commits/${sha}/status?per_page=100`]: ok({ statuses: [] }),
    [`/repos/o/n/actions/runs?head_sha=${sha}&per_page=100`]: ok({
      workflow_runs: [],
    }),
  }) as const;

const BODY = 'Fixes #3';

const BODY_HTML =
  '<p><span class="issue-keyword tooltipped">Fixes</span> <a data-hovercard-type="issue" data-url="https://github.com/o/n/issues/3" href="https://github.com/o/n/issues/3">#3</a></p>';

/** What both readers read over REST. */
const shared: Routes = {
  '/repos/o/n/rules/branches/main?per_page=100': ok([]),
  '/repos/o/n/branches/main': ok({}),
  ...emptyChecksOf(TIP),
  ...emptyChecksOf(HEAD),
  '/repos/o/n/activity?ref=refs%2Fheads%2Ffeature&activity_type=push&direction=asc&per_page=100':
    ok([
      {
        activity_type: 'branch_creation',
        before: '0'.repeat(40),
        after: HEAD,
        actor: { login: 'author' },
      },
    ]),
  [`/repos/o/n/compare/main...${HEAD}`]: ok({ ahead_by: 1, behind_by: 0 }),
  '/repos/o/n/issues?state=open&sort=updated&direction=desc&per_page=100': ok(
    [],
  ),
  '/repos/o/n/pulls?state=closed&sort=updated&direction=desc&per_page=100': ok(
    [],
  ),
  '/repos/o/n/git/matching-refs/heads/queue/pr-?per_page=100': ok([]),
  // What the pull request closes, as an issue named: open, not in the list.
  '/repos/o/n/issues/3': ok({
    number: 3,
    title: 'a thing',
    body: null,
    state: 'open',
    state_reason: null,
    user: { login: 'author' },
    html_url: 'https://github.com/o/n/issues/3',
    repository_url: 'https://api.github.com/repos/o/n',
    labels: [],
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z',
    comments: 0,
  }),
  '/repos/o/n/issues/3/dependencies/blocked_by?per_page=100': ok([]),
  '/repos/o/n/issues/3/comments?per_page=100': ok([]),
} as const;

const restRoutes: Routes = {
  ...shared,
  '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
  '/repos/o/n/git/ref/heads/main': ok({ object: { sha: TIP } }),
  '/user': ok({ login: 'me' }),
  '/repos/o/n/labels/merge-queued': ok({ name: 'merge-queued' }),
  '/repos/o/n/contents/.github/CODEOWNERS?ref=main': ok({
    content: Buffer.from('* @owner\n').toString('base64'),
    encoding: 'base64',
  }),
  '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok([
    { number: 7 },
  ]),
  '/repos/o/n/pulls/7': ok({
    number: 7,
    title: 'fix: a thing',
    body: BODY,
    user: { login: 'author' },
    html_url: 'https://github.com/o/n/pull/7',
    draft: false,
    labels: [{ name: 'merge-queued', color: '0e8a16', description: null }],
    auto_merge: null,
    head: { ref: 'feature', sha: HEAD, repo: { full_name: 'o/n' } },
    base: { ref: 'main' },
    mergeable_state: 'clean',
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z',
    changed_files: 1,
  }),
  [`/repos/o/n/commits/${HEAD}`]: ok({
    commit: { committer: { date: '2026-11-02T00:00:00Z' } },
  }),
  '/repos/o/n/pulls/7/reviews?per_page=100': ok([
    { state: 'APPROVED', user: { login: 'writer' } },
  ]),
  '/repos/o/n/collaborators/writer/permission': ok({ permission: 'write' }),
  '/repos/o/n/pulls/7/files?per_page=100': ok([
    { filename: 'a.md', status: 'modified' },
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
      created_at: '2026-11-04T00:00:00Z',
    },
  ]),
} as const;

const pageInfo = { hasNextPage: false, endCursor: null } as const;

const graphqlRoutes: Routes = {
  ...shared,
  'graphql:query Repository(': ok({
    data: {
      viewer: { login: 'me' },
      repository: {
        nameWithOwner: 'o/n',
        defaultBranchRef: { name: 'main', target: { oid: TIP } },
        codeOwners: { text: '* @owner\n' },
        queueLabel: { name: 'merge-queued' },
      },
    },
  }),
  'graphql:query PullRequests(': ok({
    data: {
      repository: {
        list: {
          pageInfo,
          nodes: [
            {
              number: 7,
              title: 'fix: a thing',
              body: BODY,
              bodyHTML: BODY_HTML,
              url: 'https://github.com/o/n/pull/7',
              isDraft: false,
              createdAt: '2026-11-01T00:00:00Z',
              updatedAt: '2026-11-02T00:00:00Z',
              author: { login: 'author' },
              labels: {
                totalCount: 1,
                nodes: [
                  { name: 'merge-queued', color: '0e8a16', description: null },
                ],
              },
              autoMergeRequest: null,
              headRefName: 'feature',
              headRefOid: HEAD,
              baseRefName: 'main',
              mergeStateStatus: 'CLEAN',
              headRepository: { nameWithOwner: 'o/n' },
              commits: {
                nodes: [
                  {
                    commit: {
                      oid: HEAD,
                      committedDate: '2026-11-02T00:00:00Z',
                    },
                  },
                ],
              },
              closingIssuesReferences: {
                totalCount: 1,
                nodes: [
                  {
                    number: 3,
                    title: 'a thing',
                    url: 'https://github.com/o/n/issues/3',
                    state: 'OPEN',
                    repository: { nameWithOwner: 'o/n' },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  }),
  'graphql:query PullRequestDetails(': ok({
    data: {
      repository: {
        list: {
          pageInfo,
          nodes: [
            {
              number: 7,
              changedFiles: 1,
              latestOpinionatedReviews: {
                totalCount: 1,
                nodes: [{ state: 'APPROVED', author: { login: 'writer' } }],
              },
              files: { nodes: [{ path: 'a.md', changeType: 'MODIFIED' }] },
              reviewThreads: {
                totalCount: 2,
                nodes: [{ isResolved: true }, { isResolved: false }],
              },
              comments: {
                totalCount: 2,
                nodes: [
                  {
                    databaseId: 1,
                    body: 'mine',
                    createdAt: '2026-11-03T00:00:00Z',
                    viewerDidAuthor: true,
                  },
                  {
                    databaseId: 2,
                    body: 'theirs',
                    createdAt: '2026-11-04T00:00:00Z',
                    viewerDidAuthor: false,
                  },
                ],
              },
              stackEntry: null,
              timelineItems: { totalCount: 0, nodes: [] },
            },
          ],
        },
      },
    },
  }),
} as const;

/** What only one reader can read, set aside before the two are compared. */
const comparable = (snapshot: Snapshot): unknown =>
  ({
    ...snapshot,
    pullRequests: Result.map(snapshot.pullRequests, (pulls) =>
      pulls.map(
        ({
          nativeStack: _nativeStack,
          baseChanges: _baseChanges,
          mergedParent: _mergedParent,
          review,
          ...rest
        }: PullRequestFacts) => ({
          ...rest,
          review: Result.map(
            review,
            ({ unresolvedConversations: _unresolved, ...facts }) => facts,
          ),
        }),
      ),
    ),
  }) as const;

describe('the REST and GraphQL readers', () => {
  test('build the same snapshot of one repository state', async () => {
    const [rest, graphql] = await Promise.all([
      readSnapshotRest(contextOf(restRoutes), options),
      readSnapshotGraphql(contextOf(graphqlRoutes), options),
    ]);

    const restSnapshot = Result.unwrapThrow(rest);

    // Every part read, so that two failures alike do not pass for agreement.
    for (const part of [
      restSnapshot.requirements,
      restSnapshot.defaultBranchChecks,
      restSnapshot.pullRequests,
      restSnapshot.openIssues,
      restSnapshot.otherIssues,
      restSnapshot.references,
      restSnapshot.merged,
      restSnapshot.queueLayers,
      restSnapshot.followed,
    ]) {
      assert.isTrue(Result.isOk(part));
    }

    const [pr] = Result.unwrapThrow(restSnapshot.pullRequests);

    for (const part of [
      pr?.headCommittedAt,
      pr?.checks,
      pr?.review,
      pr?.comments,
      pr?.closingIssues,
      pr?.comparison,
    ]) {
      assert.isTrue(part !== undefined && Result.isOk(part));
    }

    assert.deepStrictEqual(
      comparable(Result.unwrapThrow(graphql)),
      comparable(restSnapshot),
    );
  });

  test('GraphQL reads what REST skips', async () => {
    const snapshot = Result.unwrapThrow(
      await readSnapshotGraphql(contextOf(graphqlRoutes), options),
    );

    const [pr] = Result.unwrapThrow(snapshot.pullRequests);

    assert.deepStrictEqual(pr?.nativeStack, Result.ok(undefined));

    assert.deepStrictEqual(pr?.baseChanges, Result.ok([]));

    assert.deepStrictEqual(pr?.mergedParent, Result.ok(undefined));

    assert.strictEqual(
      Result.isOk(pr?.review ?? Result.ok(undefined))
        ? Result.unwrapThrow(pr?.review ?? Result.ok(undefined))
            ?.unresolvedConversations
        : undefined,
      1,
    );
  });

  test('a failed details query leaves each pull request its list facts', async () => {
    const snapshot = Result.unwrapThrow(
      await readSnapshotGraphql(
        contextOf({
          ...graphqlRoutes,
          'graphql:query PullRequestDetails(': status(502, 'bad gateway'),
        }),
        options,
      ),
    );

    const [pr] = Result.unwrapThrow(snapshot.pullRequests);

    assert.strictEqual(pr?.mergeState, 'CLEAN');

    assert.isTrue(Result.isErr(pr?.review ?? Result.ok(undefined)));

    assert.isTrue(Result.isErr(pr?.comments ?? Result.ok(undefined)));
  });
});
