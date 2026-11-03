import type { ReportIssue } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import {
  parseStartableIssuesArgs,
  renderStartable,
} from './startable-issues.mjs';

const UPDATED = '2026-10-15T00:00:00Z';

const issue = (number: number, labels: readonly string[] = []): ReportIssue =>
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
    start: 'free',
    named: [],
  }) as const;

const candidate = (number: number) =>
  ({
    number,
    url: `https://github.com/o/r/issues/${number}`,
    updatedAt: UPDATED,
  }) as const;

const ISSUES = [
  issue(10),
  issue(20, ['priority:high']),
  issue(30, ['priority:low']),
] as const;

describe(renderStartable, () => {
  test('lists each in the survey’s order, with its priority and title', () => {
    assert.strictEqual(
      renderStartable(
        {
          fresh: [candidate(20), candidate(10), candidate(30)],
          left: [],
          foreign: [],
          held: [],
        },
        ISSUES,
        ['owner'],
        undefined,
      ),
      [
        '#20  [priority:high]  feat: thing 20  https://github.com/o/r/issues/20',
        '#10  feat: thing 10  https://github.com/o/r/issues/10',
        '#30  [priority:low]  feat: thing 30  https://github.com/o/r/issues/30',
      ].join('\n'),
    );
  });

  test('stops at the limit, and says how many it left out', () => {
    assert.strictEqual(
      renderStartable(
        {
          fresh: [candidate(20), candidate(10), candidate(30)],
          left: [],
          foreign: [],
          held: [],
        },
        ISSUES,
        ['owner'],
        1,
      ),
      [
        '#20  [priority:high]  feat: thing 20  https://github.com/o/r/issues/20',
        '… and 2 more, which --limit left out.',
      ].join('\n'),
    );
  });

  test('lists one the report does not carry by its number and link alone', () => {
    assert.strictEqual(
      renderStartable(
        { fresh: [candidate(40)], left: [], foreign: [], held: [] },
        ISSUES,
        ['owner'],
        undefined,
      ),
      '#40  https://github.com/o/r/issues/40',
    );
  });

  test('says what it passed over, and when nothing is left to start', () => {
    assert.strictEqual(
      renderStartable(
        { fresh: [], left: [5], foreign: [6, 7], held: [8] },
        [],
        ['owner', 'friend'],
        undefined,
      ),
      [
        'No issue to start.',
        '#5: an earlier run-issue-resolver session left them as they stand; waiting for someone to change them.',
        '#6, #7: startable, but not written by owner or friend; left to a person.',
        '#8: startable, but labelled duplicate, invalid, question, wontfix, pending or the like; left as they are.',
      ].join('\n'),
    );
  });
});

describe(parseStartableIssuesArgs, () => {
  test('lists every one, by the token’s account, by default', () => {
    assert.deepStrictEqual(
      Result.unwrapOkOr(parseStartableIssuesArgs([]), undefined),
      { limit: undefined, authors: [] },
    );
  });

  test('reads the limit and each author', () => {
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
        ]),
        undefined,
      ),
      { limit: 3, authors: ['owner', 'friend'] },
    );
  });

  test('refuses a limit that is not a positive whole number', () => {
    assert.isTrue(Result.isErr(parseStartableIssuesArgs(['--limit', '0'])));

    assert.isTrue(Result.isErr(parseStartableIssuesArgs(['--limit', 'two'])));
  });

  test('answers help', () => {
    assert.deepStrictEqual(
      parseStartableIssuesArgs(['--help']),
      Result.ok('help'),
    );
  });
});
