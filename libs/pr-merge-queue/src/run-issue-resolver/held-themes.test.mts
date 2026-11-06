import type { ReportIssue } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import {
  issueBodies,
  issuesByTheme,
  othersStarted,
  themedCandidates,
} from './held-themes.mjs';

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

describe(themedCandidates, () => {
  test('reads each candidate’s tier and themes from its issue and body', () => {
    assert.deepStrictEqual(
      themedCandidates(
        [{ number: 1 }, { number: 2 }],
        [
          issue(1, 'unblock-prs: a fix', ['priority:S']),
          issue(2, 'A change', ['priority:B']),
        ],
        new Map<number, string>([
          [1, 'In `libs/pr-merge-queue/src/unblock-prs/rebase.mts`.'],
          [2, 'In `apps/pr-manager/src/x.mts`.'],
        ]),
      ),
      [
        {
          number: 1,
          tier: 'S',
          themes: ['pr-merge-queue', 'unblock-prs'],
          primary: ['pr-merge-queue', 'unblock-prs'],
        },
        {
          number: 2,
          tier: 'other',
          themes: ['pr-manager'],
          primary: ['pr-manager'],
        },
      ],
    );
  });
});

const issue = (
  number: number,
  title: string,
  labels: readonly string[],
): ReportIssue =>
  ({
    number,
    title,
    author: 'owner',
    url: `https://github.com/o/r/issues/${number}`,
    labels: labels.map((name) => ({ name, color: '', description: '' })),
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    comments: 0,
    startAfter: [],
    misplacedMergeAfter: [],
    start: 'free',
    named: [],
  }) as const;
