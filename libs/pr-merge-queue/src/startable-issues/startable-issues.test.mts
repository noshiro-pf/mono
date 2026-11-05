import type { ReportIssue } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import type { IssueSurvey } from '../run-issue-resolver/index.mjs';
import {
  issueBodies,
  issuesByTheme,
  othersStarted,
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

  test('warns first when another session is on the theme named', () => {
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
        'Another session is on theme synstate (synstate-dom: #90): ask the person before taking any of it.',
        '#10  {synstate-dom}  feat: thing 10  https://github.com/o/r/issues/10',
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

describe(issuesByTheme, () => {
  test('maps each theme to the issues about it', () => {
    assert.deepStrictEqual(
      issuesByTheme([
        { number: 90, themes: ['unblock-prs', 'pr-merge-queue'] },
        { number: 91, themes: ['unblock-prs'] },
        { number: 92, themes: [] },
      ]),
      new Map<string, readonly number[]>([
        ['unblock-prs', [90, 91]],
        ['pr-merge-queue', [90]],
      ]),
    );
  });
});

describe(othersStarted, () => {
  const SELF = 'https://claude.ai/code/session_self';

  test('leaves out the caller’s own, and keeps one with no claim', () => {
    assert.deepStrictEqual(
      othersStarted(
        [
          { number: 1, claimant: Result.ok(SELF) },
          { number: 2, claimant: Result.ok('https://claude.ai/code/other') },
          { number: 3, claimant: Result.ok(undefined) },
        ],
        SELF,
      ),
      { started: [2, 3], notes: [] },
    );
  });

  test('counts one it could not read as another’s, and says so', () => {
    assert.deepStrictEqual(
      othersStarted(
        [
          { number: 1, claimant: Result.err('502') },
          { number: 2, claimant: Result.ok(SELF) },
        ],
        SELF,
      ),
      {
        started: [1],
        notes: [
          "#1: who started them could not be read; counted as another session's.",
        ],
      },
    );
  });
});

describe(issueBodies, () => {
  test('keeps the issues’ descriptions and leaves pull requests out', () => {
    assert.deepStrictEqual(
      issueBodies([
        { number: 1, body: 'one' },
        { number: 2, body: null },
        { number: 3, body: 'a pull request', pull_request: {} },
        { number: 4 },
      ]),
      new Map<number, string>([
        [1, 'one'],
        [2, ''],
        [4, ''],
      ]),
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
