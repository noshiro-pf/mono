import type { PrReport, ReportIssue } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord, StrictOmit } from 'ts-type-forge';
import {
  checkRoutesAsked,
  failingRequiredCheck,
  FAKE_REPO,
  fakeGitHub,
  fakePullRequest,
  type FakeRoutes,
} from '../../test/index.mjs';
import {
  createClient,
  readReportWith,
  type ReadReportOptions,
} from '../pr-report/index.mjs';
import { ISSUES_READ, type IssueSurvey } from '../run-issue-resolver/index.mjs';
import {
  parseStartableIssuesArgs,
  renderStartable,
  type ThemedCandidate,
} from './startable-issues.mjs';

const UPDATED = '2026-10-15T00:00:00Z';

const issue = (
  number: number,
  labels: readonly string[] = [],
  start: ReportIssue['start'] = 'free',
): ReportIssue =>
  ({
    number,
    title: `feat: thing ${number}`,
    author: 'owner',
    url: `https://github.com/o/r/issues/${number}`,
    labels: labels.map((name) => ({ name, color: '', description: '' })),
    createdAt: UPDATED,
    updatedAt: UPDATED,
    comments: 0,
    startAfter: [],
    misplacedMergeAfter: [],
    start,
    named: [],
  }) as const;

const candidate = (
  number: number,
  themes: readonly string[] = [],
  tier: ThemedCandidate['tier'] = 'other',
): ThemedCandidate =>
  ({
    number,
    url: `https://github.com/o/r/issues/${number}`,
    updatedAt: UPDATED,
    tier,
    themes,
    primary: themes,
  }) as const;

const ISSUES = [
  issue(10),
  issue(20, ['priority:S']),
  issue(30, ['priority:D']),
] as const;

const NOTHING_PASSED_OVER: IssueSurvey = {
  fresh: [],
  left: [],
  foreign: [],
  held: [],
} as const;

describe(renderStartable, () => {
  test('lists each in order, with its tier, its themes and its title', () => {
    assert.strictEqual(
      renderStartable({
        survey: NOTHING_PASSED_OVER,
        candidates: [
          candidate(20, [], 'S'),
          candidate(10, ['pr-merge-queue', 'unblock-prs']),
          candidate(30, ['task-manager'], 'D'),
        ],
        order: {
          taken: [
            candidate(20, [], 'S'),
            candidate(10, ['pr-merge-queue', 'unblock-prs']),
            candidate(30, ['task-manager'], 'D'),
          ],
          heldBack: [],
        },
        issues: ISSUES,
        authors: ['owner'],
        limit: undefined,
        theme: undefined,
        held: new Map<string, readonly number[]>(),
        notes: [],
      }),
      [
        '#20  [priority:S]  feat: thing 20  https://github.com/o/r/issues/20',
        '#10  {pr-merge-queue, unblock-prs}  feat: thing 10  https://github.com/o/r/issues/10',
        '#30  [priority:D]  {task-manager}  feat: thing 30  https://github.com/o/r/issues/30',
      ].join('\n'),
    );
  });

  test('stops at the limit, and says how many it left out', () => {
    assert.strictEqual(
      renderStartable({
        survey: NOTHING_PASSED_OVER,
        candidates: [candidate(20, [], 'S'), candidate(10), candidate(30)],
        order: {
          taken: [candidate(20, [], 'S'), candidate(10), candidate(30)],
          heldBack: [],
        },
        issues: ISSUES,
        authors: ['owner'],
        limit: 1,
        theme: undefined,
        held: new Map<string, readonly number[]>(),
        notes: [],
      }),
      [
        '#20  [priority:S]  feat: thing 20  https://github.com/o/r/issues/20',
        '… and 2 more, which --limit left out.',
      ].join('\n'),
    );
  });

  test('lists one the report does not carry by its number and link alone', () => {
    assert.strictEqual(
      renderStartable({
        survey: NOTHING_PASSED_OVER,
        candidates: [candidate(40)],
        order: { taken: [candidate(40)], heldBack: [] },
        issues: ISSUES,
        authors: ['owner'],
        limit: undefined,
        theme: undefined,
        held: new Map<string, readonly number[]>(),
        notes: [],
      }),
      '#40  https://github.com/o/r/issues/40',
    );
  });

  test('says what it passed over, and when nothing is left to start', () => {
    assert.strictEqual(
      renderStartable({
        survey: { fresh: [], left: [5], foreign: [6, 7], held: [8] },
        candidates: [],
        order: { taken: [], heldBack: [] },
        issues: [],
        authors: ['owner', 'friend'],
        limit: undefined,
        theme: undefined,
        held: new Map<string, readonly number[]>(),
        notes: [],
      }),
      [
        'No issue to start.',
        '#5: an earlier run-issue-resolver session left them as they stand; waiting for someone to change them.',
        '#6, #7: startable, but not written by owner or friend; left to a person.',
        '#8: startable, but labelled duplicate, invalid, question, wontfix, pending, priority:hold, priority:close or the like; left as they are.',
      ].join('\n'),
    );
  });

  test('names what it held back for a theme another session is on', () => {
    assert.strictEqual(
      renderStartable({
        survey: NOTHING_PASSED_OVER,
        candidates: [candidate(10), candidate(30, ['unblock-prs'])],
        order: {
          taken: [candidate(10)],
          heldBack: [{ number: 30, themes: ['unblock-prs'] }],
        },
        issues: ISSUES,
        authors: ['owner'],
        limit: undefined,
        theme: undefined,
        held: new Map<string, readonly number[]>([['unblock-prs', [90, 91]]]),
        notes: [],
      }),
      [
        '#10  feat: thing 10  https://github.com/o/r/issues/10',
        '#30: startable, but another session is on its theme (unblock-prs: #90, #91); left to that session, unless named with --theme.',
      ].join('\n'),
    );
  });

  test('says first that the issues another session started in the theme named are left to it', () => {
    assert.strictEqual(
      renderStartable({
        survey: NOTHING_PASSED_OVER,
        candidates: [candidate(10, ['synstate-dom'])],
        order: { taken: [candidate(10, ['synstate-dom'])], heldBack: [] },
        issues: ISSUES,
        authors: ['owner'],
        limit: undefined,
        theme: 'synstate',
        held: new Map<string, readonly number[]>([
          ['synstate-dom', [90]],
          ['ci', [91]],
        ]),
        notes: [],
      }),
      [
        'Another session is on theme synstate (synstate-dom: #90): those are left to it; the rest of the theme follows, to take without asking.',
        '#10  {synstate-dom}  feat: thing 10  https://github.com/o/r/issues/10',
      ].join('\n'),
    );
  });

  test('promises no rest when another session holds all of the theme named', () => {
    assert.strictEqual(
      renderStartable({
        survey: NOTHING_PASSED_OVER,
        candidates: [candidate(10, ['ci'])],
        order: { taken: [], heldBack: [] },
        issues: ISSUES,
        authors: ['owner'],
        limit: undefined,
        theme: 'synstate',
        held: new Map<string, readonly number[]>([['synstate-dom', [90]]]),
        notes: [],
      }),
      [
        'Another session is on theme synstate (synstate-dom: #90): those are left to it.',
        'No startable issue in theme synstate. The themes with startable issues: ci (1).',
      ].join('\n'),
    );
  });

  test('lists the themes there are when the theme named has no issue', () => {
    assert.strictEqual(
      renderStartable({
        survey: NOTHING_PASSED_OVER,
        candidates: [
          candidate(10, ['ci']),
          candidate(20, ['ci', 'tooling']),
          candidate(30, ['tooling']),
          candidate(40, ['ci']),
          candidate(50),
        ],
        order: { taken: [], heldBack: [] },
        issues: ISSUES,
        authors: ['owner'],
        limit: undefined,
        theme: 'synstate',
        held: new Map<string, readonly number[]>(),
        notes: [],
      }),
      'No startable issue in theme synstate. The themes with startable issues: ci (3), tooling (2).',
    );
  });
});

describe(parseStartableIssuesArgs, () => {
  test('lists every one, by the token’s account, by default', () => {
    assert.deepStrictEqual(
      Result.unwrapOkOr(parseStartableIssuesArgs([]), undefined),
      { limit: undefined, authors: [], theme: undefined, by: undefined },
    );
  });

  test('reads the limit, each author, the theme and the claimant', () => {
    assert.deepStrictEqual(
      Result.unwrapOkOr(
        parseStartableIssuesArgs([
          '--',
          '--limit',
          '3',
          '--author',
          '@owner',
          '--author',
          'friend',
          '--theme',
          'synstate',
          '--by',
          'https://claude.ai/code/session_1',
        ]),
        undefined,
      ),
      {
        limit: 3,
        authors: ['owner', 'friend'],
        theme: 'synstate',
        by: 'https://claude.ai/code/session_1',
      },
    );
  });

  test('refuses a limit that is not a positive whole number', () => {
    assert.isTrue(Result.isErr(parseStartableIssuesArgs(['--limit', '0'])));

    assert.isTrue(Result.isErr(parseStartableIssuesArgs(['--limit', 'two'])));
  });

  test('refuses an empty theme', () => {
    assert.isTrue(Result.isErr(parseStartableIssuesArgs(['--theme', ' '])));
  });

  test('answers help', () => {
    assert.deepStrictEqual(
      parseStartableIssuesArgs(['--help']),
      Result.ok('help'),
    );
  });
});

// What `startableIssues` lists is decided from the report's issues alone, so
// that it can leave the pull requests' checks unread.
describe('the issues startable-issues reads', () => {
  test('are read with no required context, comparison, check, status or workflow run', async () => {
    const { requested } = await reportThrough(ISSUES_READ);

    assert.deepStrictEqual(checkRoutesAsked(requested), []);
  });

  test('are the same whether the checks are read or not', async () => {
    const without = await reportThrough(ISSUES_READ);

    const withChecks = await reportThrough({ ...ISSUES_READ, checks: true });

    assert.deepStrictEqual(without.report.issues, withChecks.report.issues);

    // #10 closed by the open pull request, #11 blocked by it, and the pull
    // request failing and behind where its checks are read: a fixture whose
    // facts decide something of the issues, and differ by the checks.
    assert.deepStrictEqual(
      without.report.issues.map(({ number, start }) => ({ number, start })),
      [
        { number: 11, start: 'blocked' },
        { number: 10, start: 'in-progress' },
      ],
    );

    assert.strictEqual(withChecks.report.entries[0]?.checks.verdict, 'failing');

    assert.strictEqual(withChecks.report.entries[0]?.comparison?.behindBy, 3);
  });
});

/** An open issue, as the open list answers it. */
const openIssue = (
  number: number,
  body: string,
  updatedAt: string,
): ReadonlyRecord<string, unknown> =>
  ({
    number,
    title: `feat: thing ${number}`,
    body,
    html_url: `https://github.com/o/r/issues/${number}`,
    created_at: UPDATED,
    updated_at: updatedAt,
    comments: 0,
    user: { login: 'owner' },
    labels: [],
  }) as const;

/**
 * The open pull request closing #10, failing the required check and behind its
 * base, and the open issues #10 and #11, which starts after #10.
 */
const behindAndFailing: FakeRoutes = (request) => {
  const { url } = request;

  if (url.includes('/pulls?state=open')) {
    return { body: [fakePullRequest({ body: 'Closes #10' })] };
  }

  if (url.includes('/issues?state=open')) {
    return {
      body: [
        openIssue(11, 'Start-After: #10', '2026-01-03T00:00:00Z'),
        openIssue(10, '', '2026-01-02T00:00:00Z'),
      ],
    };
  }

  return url.includes('/compare/')
    ? { body: { ahead_by: 0, behind_by: 3, commits: [] } }
    : failingRequiredCheck(request);
};

/**
 * The report read from {@link behindAndFailing} with `options`, and the path of
 * every request it took.
 */
const reportThrough = async (
  options: StrictOmit<ReadReportOptions, 'repo'>,
): Promise<Readonly<{ report: PrReport; requested: readonly string[] }>> => {
  const github = await fakeGitHub(behindAndFailing);

  const read = await readReportWith(
    createClient('token', github.baseUrl),
    FAKE_REPO,
    options,
  );

  await github.close();

  assert.isTrue(Result.isOk(read));

  return { report: read.value.report, requested: github.requested };
};
