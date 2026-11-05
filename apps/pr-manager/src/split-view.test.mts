// cspell:ignore nifmgpafbfpgpcijgmfpcoonjbalbkhf
import type { LinkedIssue } from 'pr-report-core';
import type { ClaudeSession } from 'split-view-link';
import { splitViewUrl } from './split-view.mjs';

describe(splitViewUrl, () => {
  // The layout and the zoom are `split-view-link`'s, and tested there; what is
  // tested here is what the PR Manager passes it.
  const pullRequestUrl = 'https://github.com/noshiro-pf/mono/pull/2062';

  // Whitespace changes hidden, and files marked viewed left out.
  const diffUrl =
    `${pullRequestUrl}/files?w=1&show-viewed-files=false` as const;

  const pullRequest = {
    number: 2062,
    title: 'feat(split-view-extension): open a split view from its URL',
    url: pullRequestUrl,
  } as const;

  test('opens the split view page of the pinned extension id', () => {
    const url = new URL(
      splitViewUrl({ ...pullRequest, linkedIssues: [], claudeSessions: [] }),
    );

    expect(url.protocol).toBe('chrome-extension:');

    expect(url.host).toBe('nifmgpafbfpgpcijgmfpcoonjbalbkhf');

    expect(url.pathname).toBe('/split.html');
  });

  test('takes only the first of several issues', () => {
    const params = paramsOf(
      splitViewUrl({
        ...pullRequest,
        linkedIssues: [issue(1880), issue(1881)],
        claudeSessions: [],
      }),
    );

    expect(params.get('layout')).toBe('r737fpr577fpp');

    assert.deepStrictEqual(params.getAll('url'), [
      diffUrl,
      pullRequestUrl,
      'https://github.com/noshiro-pf/mono/issues/1880',
    ]);
  });

  test('takes only the first of several sessions, under the issue', () => {
    const params = paramsOf(
      splitViewUrl({
        ...pullRequest,
        linkedIssues: [issue(1880)],
        claudeSessions: [session('01First'), session('02Second')],
      }),
    );

    assert.deepStrictEqual(params.getAll('url'), [
      diffUrl,
      pullRequestUrl,
      'https://github.com/noshiro-pf/mono/issues/1880',
      'https://claude.ai/code/session_01First',
    ]);
  });

  test('titles the tab with the number and the title of the pull request', () => {
    const params = paramsOf(
      splitViewUrl({
        ...pullRequest,
        linkedIssues: [issue(1880)],
        claudeSessions: [],
      }),
    );

    expect(params.get('title')).toBe(
      '#2062 feat(split-view-extension): open a split view from its URL',
    );
  });

  test('reuses one saved split view for every pull request', () => {
    const first = paramsOf(
      splitViewUrl({ ...pullRequest, linkedIssues: [], claudeSessions: [] }),
    );

    const second = paramsOf(
      splitViewUrl({
        number: 2063,
        title:
          'feat(eslint-config-typed): write range checks in number line order',
        url: 'https://github.com/noshiro-pf/mono/pull/2063',
        linkedIssues: [issue(1880)],
        claudeSessions: [],
      }),
    );

    expect(first.get('ws')).toBe('pr-manager');

    expect(second.get('ws')).toBe(first.get('ws'));

    expect(first.get('name')).toBe('PR Manager');
  });
});

const issue = (number: number): LinkedIssue =>
  ({
    number,
    title: `issue ${number}`,
    url: `https://github.com/noshiro-pf/mono/issues/${number}`,
    state: 'open',
  }) as const;

const session = (id: string): ClaudeSession =>
  ({
    title: `session ${id}`,
    url: `https://claude.ai/code/session_${id}`,
  }) as const;

const paramsOf = (url: string): URLSearchParams => {
  const parsed = new URL(url);

  return parsed.searchParams;
};
