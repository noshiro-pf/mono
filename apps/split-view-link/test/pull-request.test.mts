import { pullRequestSplitViewSearch } from '../src/index.mjs';

describe(pullRequestSplitViewSearch, () => {
  const pullRequest = {
    number: 2062,
    url: 'https://github.com/noshiro-pf/mono/pull/2062',
  } as const;

  const workspace = { id: 'pr-manager', name: 'PR Manager' } as const;

  const diffUrl =
    `${pullRequest.url}/files?w=1&show-viewed-files=false` as const;

  const issueUrl = 'https://github.com/noshiro-pf/mono/issues/1880';

  const sessionUrl = 'https://claude.ai/code/session_015ESrbamCgMWqeNyk6SCZcL';

  const paramsOf = (
    others: Readonly<{
      issueUrl: string | undefined;
      sessionUrl: string | undefined;
    }>,
  ): URLSearchParams =>
    new URLSearchParams(
      pullRequestSplitViewSearch({
        workspace,
        pullRequest,
        title: 'Open a split view',
        ...others,
      }),
    );

  test('names the saved split view and titles the tab', () => {
    const params = paramsOf({ issueUrl: undefined, sessionUrl: undefined });

    expect(params.get('ws')).toBe('pr-manager');

    expect(params.get('name')).toBe('PR Manager');

    expect(params.get('title')).toBe('#2062 Open a split view');
  });

  test('titles the tab with the number alone when the title is not known', () => {
    const params = new URLSearchParams(
      pullRequestSplitViewSearch({
        workspace,
        pullRequest,
        title: undefined,
        issueUrl: undefined,
        sessionUrl: undefined,
      }),
    );

    expect(params.get('title')).toBe('#2062');
  });

  test('puts the diff beside the conversation', () => {
    const params = paramsOf({ issueUrl: undefined, sessionUrl: undefined });

    expect(params.get('layout')).toBe('r737fpp');

    assert.deepStrictEqual(params.getAll('url'), [diffUrl, pullRequest.url]);

    assert.deepStrictEqual(params.getAll('zoom'), ['0.67', '0.75']);
  });

  test('adds the issue on the right', () => {
    const params = paramsOf({ issueUrl, sessionUrl: undefined });

    expect(params.get('layout')).toBe('r737fpr577fpp');

    assert.deepStrictEqual(params.getAll('url'), [
      diffUrl,
      pullRequest.url,
      issueUrl,
    ]);

    assert.deepStrictEqual(params.getAll('zoom'), ['0.67', '0.75', '0.75']);
  });

  test('adds the session on the right, at 100%', () => {
    const params = paramsOf({ issueUrl: undefined, sessionUrl });

    expect(params.get('layout')).toBe('r737fpr577fpp');

    assert.deepStrictEqual(params.getAll('zoom'), ['0.67', '0.75', '1']);
  });

  test('stacks the issue over the session', () => {
    const params = paramsOf({ issueUrl, sessionUrl });

    expect(params.get('layout')).toBe('r737fpr577fpcpp');

    assert.deepStrictEqual(params.getAll('url'), [
      diffUrl,
      pullRequest.url,
      issueUrl,
      sessionUrl,
    ]);

    assert.deepStrictEqual(params.getAll('zoom'), [
      '0.67',
      '0.75',
      '0.75',
      '1',
    ]);
  });

  test('escapes each value whole, so a query or an `&` stays in its pane', () => {
    const search = pullRequestSplitViewSearch({
      workspace,
      pullRequest,
      title: 'A & B',
      issueUrl: undefined,
      sessionUrl: undefined,
    });

    assert.isFalse(search.includes('&w=1'));

    assert.isFalse(search.includes('&show-viewed-files'));

    assert.isFalse(search.includes('& B'));

    const params = new URLSearchParams(search);

    expect(params.get('title')).toBe('#2062 A & B');
  });
});
