import { splitViewUrl } from './split-view.mjs';

describe(splitViewUrl, () => {
  test('opens the extension’s page in the PR Manager view, titled by the pull request', () => {
    const url = new URL(
      splitViewUrl({
        number: 7,
        title: 'Fix it',
        url: 'https://github.com/o/r/pull/7',
        issueUrl: 'https://github.com/o/r/issues/3',
        sessionUrl: undefined,
      }),
    );

    assert.strictEqual(url.protocol, 'chrome-extension:');

    assert.strictEqual(url.searchParams.get('ws'), 'pr-manager');

    assert.deepStrictEqual(url.searchParams.getAll('url'), [
      'https://github.com/o/r/pull/7/files?w=1&show-viewed-files=false',
      'https://github.com/o/r/pull/7',
      'https://github.com/o/r/issues/3',
    ]);
  });
});
