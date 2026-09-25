import { type LinkedIssue } from 'pr-report-core';
import { splitViewUrl } from './split-view.mjs';

describe(splitViewUrl, () => {
  const pullRequestUrl = 'https://github.com/noshiro-pf/mono/pull/2062';

  const pullRequest = {
    number: 2062,
    title: 'feat(split-view-extension): open a split view from its URL',
    url: pullRequestUrl,
  } as const;

  test('opens the split view page of the pinned extension id', () => {
    const url = new URL(splitViewUrl({ ...pullRequest, linkedIssues: [] }));

    expect(url.protocol).toBe('chrome-extension:');

    expect(url.host).toBe('nifmgpafbfpgpcijgmfpcoonjbalbkhf');

    expect(url.pathname).toBe('/split.html');
  });

  test('puts the diff beside the conversation at 7:3', () => {
    const params = paramsOf(splitViewUrl({ ...pullRequest, linkedIssues: [] }));

    expect(params.get('layout')).toBe('r70pp');

    assert.deepStrictEqual(params.getAll('url'), [
      `${pullRequestUrl}/files`,
      pullRequestUrl,
    ]);
  });

  test('adds the closed issue on the right, at 2:1:1', () => {
    const params = paramsOf(
      splitViewUrl({ ...pullRequest, linkedIssues: [issue(1880)] }),
    );

    expect(params.get('layout')).toBe('rprpp');

    assert.deepStrictEqual(params.getAll('url'), [
      `${pullRequestUrl}/files`,
      pullRequestUrl,
      'https://github.com/noshiro-pf/mono/issues/1880',
    ]);
  });

  test('takes only the first of several issues', () => {
    const params = paramsOf(
      splitViewUrl({
        ...pullRequest,
        linkedIssues: [issue(1880), issue(1881)],
      }),
    );

    expect(params.get('layout')).toBe('rprpp');

    assert.deepStrictEqual(params.getAll('url'), [
      `${pullRequestUrl}/files`,
      pullRequestUrl,
      'https://github.com/noshiro-pf/mono/issues/1880',
    ]);
  });

  test('titles the tab with the number and the title of the pull request', () => {
    const params = paramsOf(
      splitViewUrl({ ...pullRequest, linkedIssues: [issue(1880)] }),
    );

    expect(params.get('title')).toBe(
      '#2062 feat(split-view-extension): open a split view from its URL',
    );
  });

  test('reuses one saved split view for every pull request', () => {
    const first = paramsOf(splitViewUrl({ ...pullRequest, linkedIssues: [] }));

    const second = paramsOf(
      splitViewUrl({
        number: 2063,
        title:
          'feat(eslint-config-typed): write range checks in number line order',
        url: 'https://github.com/noshiro-pf/mono/pull/2063',
        linkedIssues: [issue(1880)],
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

const paramsOf = (url: string): URLSearchParams => {
  const parsed = new URL(url);

  return parsed.searchParams;
};
