import { Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import type { ReferenceFacts } from '../snapshot/index.mjs';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import { branchTipsNotRead, readSnapshotRest } from './rest-snapshot.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const TIP = 'f'.repeat(40);

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

const issueJson = (number: number, body: string): UnknownRecord =>
  ({
    number,
    title: `issue ${number}`,
    body,
    state: 'open',
    state_reason: null,
    user: { login: 'author' },
    html_url: `https://github.com/o/n/issues/${number}`,
    repository_url: 'https://api.github.com/repos/o/n',
    labels: [],
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z',
    comments: 0,
  }) as const;

const perIssue = (number: number): Routes =>
  ({
    [`/repos/o/n/issues/${number}/dependencies/blocked_by?per_page=100`]: ok(
      [],
    ),
    [`/repos/o/n/issues/${number}/comments?per_page=100`]: ok([]),
  }) as const;

const routes: Routes = {
  '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
  '/repos/o/n/git/ref/heads/main': ok({ object: { sha: TIP } }),
  '/user': ok({ login: 'me' }),
  '/repos/o/n/labels/merge-queued': ok({ name: 'merge-queued' }),
  '/repos/o/n/contents/.github/CODEOWNERS?ref=main': status(404, 'Not Found'),
  '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok([]),
  '/repos/o/n/issues?state=open&sort=updated&direction=desc&per_page=100': ok([
    issueJson(5, 'Start-After: #20'),
  ]),
  ...perIssue(5),
  '/repos/o/n/issues/20': ok(issueJson(20, 'Start-After: #21\n')),
  ...perIssue(20),
  '/repos/o/n/issues/21': ok({
    ...issueJson(21, ''),
    title: 'feat: 21',
    state: 'closed',
    pull_request: { merged_at: '2026-11-01T00:00:00Z' },
  }),
  '/repos/o/n/git/matching-refs/heads/queue/pr-?per_page=100': ok([]),
} as const;

describe(readSnapshotRest, () => {
  test('follows what a declaration names to its end', async () => {
    const snapshot = Result.unwrapThrow(
      await readSnapshotRest(contextOf(routes), options),
    );

    assert.strictEqual(snapshot.readAt, '2026-11-10T00:00:00Z');

    assert.isTrue(snapshot.authenticated);

    assert.deepStrictEqual(snapshot.pullRequests, Result.ok([]));

    assert.deepStrictEqual(
      Array.from(Result.unwrapThrow(snapshot.otherIssues).keys()),
      [20],
    );

    assert.deepStrictEqual(
      Array.from(Result.unwrapThrow(snapshot.references).values()),
      [
        {
          kind: 'pull-request',
          number: 21,
          title: 'feat: 21',
          state: 'closed',
          merged: true,
        },
      ],
    );

    assert.deepStrictEqual(snapshot.queueLayers, Result.ok([]));

    assert.deepStrictEqual(snapshot.followed, Result.ok([]));

    assert.strictEqual(
      Result.isErr(snapshot.branchTips) ? snapshot.branchTips.value.kind : '',
      'skipped',
    );
  });

  test('the numbers named are unread with the list naming them', async () => {
    const snapshot = Result.unwrapThrow(
      await readSnapshotRest(
        contextOf({
          ...routes,
          '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100':
            status(502, 'bad gateway'),
        }),
        options,
      ),
    );

    assert.isTrue(Result.isErr(snapshot.otherIssues));

    assert.isTrue(Result.isErr(snapshot.references));
  });

  test('the issues named are unread with the open issues; references stand', async () => {
    const snapshot = Result.unwrapThrow(
      await readSnapshotRest(
        contextOf({
          ...routes,
          '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100':
            ok([]),
          '/repos/o/n/issues?state=open&sort=updated&direction=desc&per_page=100':
            status(502, 'bad gateway'),
        }),
        options,
      ),
    );

    assert.isTrue(Result.isErr(snapshot.otherIssues));

    assert.deepStrictEqual(
      snapshot.references,
      Result.ok(new Map<number, ReferenceFacts>()),
    );
  });

  test('no snapshot where the default branch is unread', async () => {
    const snapshot = await readSnapshotRest(
      contextOf({ ...routes, '/repos/o/n': status(502, 'bad gateway') }),
      options,
    );

    assert.isTrue(Result.isErr(snapshot));
  });
});
