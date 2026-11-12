/**
 * One open pull request (#7, failing `ci`) and two issues, as GitHub answers
 * every request a REST snapshot makes: what a command test reads the queue
 * from, overriding the routes it is about.
 */

import { ok, status, type recordedTransport } from 'pr-report-core-v2';
import type { UnknownRecord } from 'ts-type-forge';

export type Routes = Parameters<typeof recordedTransport>[0];

export const TIP = 'f'.repeat(40);

export const HEAD = 'b'.repeat(40);

export const checksOf = (sha: string, runs: readonly unknown[] = []): Routes =>
  ({
    [`/repos/o/n/commits/${sha}/check-runs?filter=all&per_page=100`]: ok({
      check_runs: runs,
    }),
    [`/repos/o/n/commits/${sha}/status?per_page=100`]: ok({ statuses: [] }),
    [`/repos/o/n/actions/runs?head_sha=${sha}&per_page=100`]: ok({
      workflow_runs: [],
    }),
  }) as const;

export const issueJson = (
  number: number,
  fields: UnknownRecord = {},
): UnknownRecord =>
  ({
    number,
    title: `issue ${number}`,
    body: null,
    state: 'open',
    state_reason: null,
    user: { login: 'author' },
    html_url: `https://github.com/o/n/issues/${number}`,
    repository_url: 'https://api.github.com/repos/o/n',
    labels: [{ name: 'priority:B', color: 'ffffff', description: null }],
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-02T00:00:00Z',
    comments: 1,
    ...fields,
  }) as const;

/** Open pull request #7, failing `ci`. */
export const PULL_7 = {
  number: 7,
  state: 'open',
  title: 'fix: a thing',
  body: 'Fixes #3',
  body_html:
    '<p><span class="issue-keyword">Fixes</span> <a data-hovercard-type="issue" data-url="https://github.com/o/n/issues/3">#3</a></p>',
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
} as const;

export const routes: Routes = {
  '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
  '/repos/o/n/git/ref/heads/main': ok({ object: { sha: TIP } }),
  '/user': ok({ login: 'me' }),
  '/repos/o/n/labels/merge-queued': ok({ name: 'merge-queued' }),
  '/repos/o/n/contents/.github/CODEOWNERS?ref=main': status(404, 'Not Found'),
  '/repos/o/n/rules/branches/main?per_page=100': ok([
    {
      type: 'required_status_checks',
      parameters: { required_status_checks: [{ context: 'ci' }] },
    },
  ]),
  '/repos/o/n/branches/main': ok({}),
  ...checksOf(TIP),
  ...checksOf(HEAD, [
    {
      name: 'ci',
      status: 'completed',
      conclusion: 'failure',
      check_suite: { id: 1 },
      id: 10,
      started_at: '2026-11-02T00:00:00Z',
      completed_at: '2026-11-02T00:10:00Z',
      html_url: 'https://github.com/o/n/runs/10',
    },
  ]),
  '/repos/o/n/check-runs/10/annotations?per_page=100': ok([]),
  '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100': ok([
    { number: 7 },
  ]),
  '/repos/o/n/pulls/7': ok(PULL_7),
  [`/repos/o/n/commits/${HEAD}`]: ok({
    commit: { committer: { date: '2026-11-02T00:00:00Z' } },
  }),
  [`/repos/o/n/compare/main...${HEAD}`]: ok({ ahead_by: 1, behind_by: 2 }),
  '/repos/o/n/pulls/7/reviews?per_page=100': ok([]),
  '/repos/o/n/pulls/7/files?per_page=100': ok([
    { filename: 'a.md', status: 'modified' },
  ]),
  '/repos/o/n/activity?ref=refs%2Fheads%2Ffeature&activity_type=push&direction=asc&per_page=100':
    ok([]),
  '/repos/o/n/issues/7/comments?per_page=100': ok([]),
  '/repos/o/n/issues?state=open&sort=updated&direction=desc&per_page=100': ok([
    issueJson(3),
    issueJson(4),
  ]),
  '/repos/o/n/issues/3/dependencies/blocked_by?per_page=100': ok([]),
  '/repos/o/n/issues/3/comments?per_page=100': ok([]),
  '/repos/o/n/issues/4/dependencies/blocked_by?per_page=100': ok([]),
  '/repos/o/n/issues/4/comments?per_page=100': ok([
    {
      id: 40,
      body: '<!-- start-issue:claim state=planned by=session-a at=2026-11-09T21:00:00Z -->\nPlanned.',
      user: { login: 'me' },
      created_at: '2026-11-09T21:00:00Z',
    },
  ]),
  '/repos/o/n/pulls?state=closed&sort=updated&direction=desc&per_page=100': ok(
    [],
  ),
  '/repos/o/n/git/matching-refs/heads/queue/pr-?per_page=100': ok([]),
} as const;
