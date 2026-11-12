import { ok, recordedTransport, status } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import { startableIssues, type StartableIssuesWorld } from './main.mjs';
import type { StartableIssuesOptions } from './options.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const TIP = 'f'.repeat(40);

const NOW = Date.parse('2026-11-10T00:00:00Z');

const options: StartableIssuesOptions = {
  limit: undefined,
  authors: [],
  theme: undefined,
  by: undefined,
  repo: undefined,
} as const;

const issueJson = (
  number: number,
  title: string,
  fields: UnknownRecord = {},
): UnknownRecord =>
  ({
    number,
    title,
    body: null,
    state: 'open',
    state_reason: null,
    user: { login: 'me' },
    html_url: `https://github.com/o/n/issues/${number}`,
    repository_url: 'https://api.github.com/repos/o/n',
    labels: [{ name: 'priority:B', color: 'ffffff', description: null }],
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z',
    comments: 0,
    ...fields,
  }) as const;

const issueRoutes = (
  number: number,
  comments: readonly unknown[] = [],
): Routes =>
  ({
    [`/repos/o/n/issues/${number}/dependencies/blocked_by?per_page=100`]: ok(
      [],
    ),
    [`/repos/o/n/issues/${number}/comments?per_page=100`]: ok(comments),
  }) as const;

const routes: Routes = {
  '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
  '/repos/o/n/git/ref/heads/main': ok({ object: { sha: TIP } }),
  '/user': ok({ login: 'me' }),
  '/repos/o/n/labels/merge-queued': ok({ name: 'merge-queued' }),
  '/repos/o/n/contents/.github/CODEOWNERS?ref=main': status(404, 'Not Found'),
  '/repos/o/n/rules/branches/main?per_page=100': ok([]),
  '/repos/o/n/branches/main': ok({}),
  '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok([]),
  '/repos/o/n/issues?state=open&sort=updated&direction=desc&per_page=100': ok([
    issueJson(1, 'ci: a'),
    issueJson(2, 'ci: b', {
      labels: [{ name: 'priority:S', color: 'ffffff', description: null }],
    }),
    issueJson(3, 'feat(synstate): c'),
    issueJson(4, 'chore(tools): d', {
      labels: [{ name: 'in-progress', color: 'ffffff', description: null }],
    }),
    issueJson(5, 'tools/scripts: e'),
    issueJson(6, 'question: f', {
      labels: [{ name: 'question', color: 'ffffff', description: null }],
    }),
    issueJson(7, 'docs: g', { user: { login: 'stranger' } }),
  ]),
  ...issueRoutes(1),
  ...issueRoutes(2),
  ...issueRoutes(3),
  ...issueRoutes(4),
  ...issueRoutes(5),
  ...issueRoutes(6),
  ...issueRoutes(7),
  '/repos/o/n/pulls?state=closed&sort=updated&direction=desc&per_page=100': ok(
    [],
  ),
  '/repos/o/n/git/matching-refs/heads/queue/pr-?per_page=100': ok([]),
} as const;

const worldOf = (recorded: Routes, attempted?: string): StartableIssuesWorld =>
  ({
    transport: recordedTransport(recorded).transport,
    env: { GH_TOKEN: 'token' },
    nowEpochMs: NOW,
    originUrl: () => Promise.resolve('git@github.com:o/n.git'),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    attemptedFile: ({ owner, name }) => `/state/${owner}/${name}.json`,
    readTextFile: () => Promise.resolve(Result.ok(attempted)),
  }) as const;

describe(startableIssues, () => {
  test('lists the S first, holds back a started theme, and names what it passed over', async () => {
    const text = Result.unwrapThrow(
      await startableIssues(options, worldOf(routes)),
    );

    assert.deepStrictEqual(text.split('\n'), [
      '#2  [priority:S]  {ci}  ci: b  https://github.com/o/n/issues/2',
      '#1  [priority:B]  {ci}  ci: a  https://github.com/o/n/issues/1',
      '#3  [priority:B]  {synstate}  feat(synstate): c  https://github.com/o/n/issues/3',
      '#5: startable, but another session is on its theme (tooling: #4); left to that session, unless named with --theme.',
      '#7: startable, but not written by me; left to a person.',
      '#6: startable, but labelled duplicate, invalid, question, wontfix, pending, priority:hold, priority:close; left as they are.',
    ]);
  });

  test('with a theme, that theme alone, and who is on it', async () => {
    const text = Result.unwrapThrow(
      await startableIssues({ ...options, theme: 'tooling' }, worldOf(routes)),
    );

    assert.deepStrictEqual(Arr.take(text.split('\n'), 2), [
      'Another session is on theme tooling (tooling: #4): those are left to it; the rest of the theme follows, to take without asking.',
      '#5  [priority:B]  {tooling}  tools/scripts: e  https://github.com/o/n/issues/5',
    ]);
  });

  test('leaves what a resolver session left as it stands', async () => {
    const text = Result.unwrapThrow(
      await startableIssues(
        options,
        worldOf(
          routes,
          JSON.stringify({ attempted: { 1: '2026-11-02T00:00:00Z' } }),
        ),
      ),
    );

    assert.notInclude(text, '#1  [priority:B]');

    assert.include(
      text,
      '#1: an earlier run-issue-resolver session left them as they stand',
    );
  });

  test('refuses without a token', async () => {
    assert.isTrue(
      Result.isErr(
        await startableIssues(options, { ...worldOf(routes), env: {} }),
      ),
    );
  });

  test('reads the record by the repository as resolved, and fails on a broken one before any request', async () => {
    const { transport, sent } = recordedTransport(routes);

    const mut_asked: string[] = [];

    const result = await startableIssues(
      { ...options, repo: 'O/N' },
      {
        ...worldOf(routes, '{'),
        transport,
        attemptedFile: ({ owner, name }) => {
          mut_asked.push(`${owner}/${name}`);

          return `/state/${owner}/${name}.json`;
        },
      },
    );

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '/state/O/N.json');

    assert.deepStrictEqual(mut_asked, ['O/N']);

    assert.deepStrictEqual(sent, []);
  });
});
