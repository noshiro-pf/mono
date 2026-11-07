import type { ReportSource } from './constants.mjs';
import {
  mergedPullRequestsUrl,
  newIssueUrl,
  openIssuesUrl,
  openPullRequestsUrl,
  pickedPullRequestsUrl,
  queuedPullRequestsUrl,
} from './github-links.mjs';

// The repository the fixtures were taken from.
const SOURCE: ReportSource = { owner: 'noshiro-pf', repo: 'mono' } as const;

describe(openPullRequestsUrl, () => {
  test("is the repository's open pull requests", () => {
    assert.strictEqual(
      openPullRequestsUrl(SOURCE),
      'https://github.com/noshiro-pf/mono/pulls?q=is%3Apr+is%3Aopen',
    );
  });

  test('narrowed by what the merge order is filtered by', () => {
    assert.strictEqual(
      openPullRequestsUrl(SOURCE, [
        '-label:"pending"',
        '-label:"priority:low"',
      ]),
      'https://github.com/noshiro-pf/mono/pulls?q=is%3Apr+is%3Aopen+-label%3A%22pending%22+-label%3A%22priority%3Alow%22',
    );
  });

  test('follows the repository the page reads', () => {
    assert.strictEqual(
      openPullRequestsUrl(OTHER_SOURCE),
      'https://github.com/someone/elsewhere/pulls?q=is%3Apr+is%3Aopen',
    );
  });
});

describe(mergedPullRequestsUrl, () => {
  test('is the search the block reads: merged on or after the day the window starts, in UTC', () => {
    assert.strictEqual(
      mergedPullRequestsUrl(SOURCE, EARLY_ON_27TH_MS),
      'https://github.com/noshiro-pf/mono/pulls?q=is%3Apr+is%3Amerged+merged%3A%3E%3D2026-10-20+sort%3Aupdated-desc',
    );
  });

  test('follows the repository the page reads', () => {
    assert.strictEqual(
      mergedPullRequestsUrl(OTHER_SOURCE, LATE_ON_27TH_MS),
      'https://github.com/someone/elsewhere/pulls?q=is%3Apr+is%3Amerged+merged%3A%3E%3D2026-10-20+sort%3Aupdated-desc',
    );
  });
});

describe(openIssuesUrl, () => {
  test('is the open issues, most recently updated first, as the block lists them', () => {
    assert.strictEqual(
      openIssuesUrl(SOURCE),
      'https://github.com/noshiro-pf/mono/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc',
    );
  });

  test('narrowed by what the block is filtered by', () => {
    assert.strictEqual(
      openIssuesUrl(SOURCE, ['label:"bug"']),
      'https://github.com/noshiro-pf/mono/issues?q=is%3Aissue+is%3Aopen+label%3A%22bug%22+sort%3Aupdated-desc',
    );
  });
});

describe(queuedPullRequestsUrl, () => {
  test('is the open pull requests labelled merge-queued, oldest first', () => {
    assert.strictEqual(
      queuedPullRequestsUrl(SOURCE),
      'https://github.com/noshiro-pf/mono/pulls?q=is%3Apr+is%3Aopen+label%3A%22merge-queued%22+sort%3Acreated-asc',
    );
  });

  test('follows the repository the page reads', () => {
    assert.strictEqual(
      queuedPullRequestsUrl(OTHER_SOURCE),
      'https://github.com/someone/elsewhere/pulls?q=is%3Apr+is%3Aopen+label%3A%22merge-queued%22+sort%3Acreated-asc',
    );
  });
});

describe(pickedPullRequestsUrl, () => {
  test('is the queued pull requests without skip-ci', () => {
    assert.strictEqual(
      pickedPullRequestsUrl(SOURCE),
      'https://github.com/noshiro-pf/mono/pulls?q=is%3Apr+is%3Aopen+label%3A%22merge-queued%22+-label%3A%22skip-ci%22+sort%3Acreated-asc',
    );
  });

  test('follows the repository the page reads', () => {
    assert.strictEqual(
      pickedPullRequestsUrl(OTHER_SOURCE),
      'https://github.com/someone/elsewhere/pulls?q=is%3Apr+is%3Aopen+label%3A%22merge-queued%22+-label%3A%22skip-ci%22+sort%3Acreated-asc',
    );
  });
});

describe(newIssueUrl, () => {
  test("is the repository's new issue form, by way of its templates", () => {
    assert.strictEqual(
      newIssueUrl(OTHER_SOURCE),
      'https://github.com/someone/elsewhere/issues/new/choose',
    );
  });
});

/** 2026-10-27T01:30:00Z. */
const EARLY_ON_27TH_MS = 1_793_064_600_000;

/** 2026-10-27T23:59:59Z. */
const LATE_ON_27TH_MS = 1_793_145_599_000;

const OTHER_SOURCE = { owner: 'someone', repo: 'elsewhere' } as const;
