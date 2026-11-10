import {
  actionsUrl,
  githubSearchUrl,
  mergedSinceQuery,
} from './github-search.mjs';

describe(githubSearchUrl, () => {
  test('puts the query in the search box of the repository’s list', () => {
    assert.strictEqual(
      githubSearchUrl({ owner: 'o', name: 'r' }, 'pulls', 'is:pr label:"a b"'),
      'https://github.com/o/r/pulls?q=is%3Apr+label%3A%22a+b%22',
    );
  });
});

describe(actionsUrl, () => {
  test('filters the Actions tab', () => {
    assert.strictEqual(
      actionsUrl({ owner: 'o', name: 'r' }, 'is:queued'),
      'https://github.com/o/r/actions?query=is%3Aqueued',
    );
  });
});

describe(mergedSinceQuery, () => {
  test('asks from the day the window starts', () => {
    assert.strictEqual(
      mergedSinceQuery(Date.parse('2026-11-10T03:00:00Z'), 7),
      'is:pr is:merged merged:>=2026-11-03 sort:updated-desc',
    );
  });
});
