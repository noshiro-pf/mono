import {
  DEFAULT_REPORT_SOURCE,
  reportSourceFromSearch,
  repositoryUrl,
} from './constants.mjs';

describe(reportSourceFromSearch, () => {
  test('reads the repository from `repo=owner/name`', () => {
    assert.deepStrictEqual(
      reportSourceFromSearch('?theme=dark&repo=example-org/hello.world_2'),
      { owner: 'example-org', repo: 'hello.world_2' },
    );
  });

  test('is this repository without the parameter', () => {
    assert.deepStrictEqual(reportSourceFromSearch(''), DEFAULT_REPORT_SOURCE);

    assert.deepStrictEqual(
      reportSourceFromSearch('?cols=2'),
      DEFAULT_REPORT_SOURCE,
    );
  });

  // Anything else would reach the query as a name GitHub cannot have, and
  // the reader would read an error about a repository they never named.
  test('is this repository for a value that names no repository', () => {
    for (const value of [
      'example-org',
      'example-org/',
      '/hello',
      'a/b/c',
      '-org/repo',
      'org/..',
      'org/re po',
    ]) {
      assert.deepStrictEqual(
        reportSourceFromSearch(searchNaming(value)),
        DEFAULT_REPORT_SOURCE,
      );
    }
  });
});

describe(repositoryUrl, () => {
  test("is the repository's page on GitHub", () => {
    expect(repositoryUrl({ owner: 'example-org', repo: 'hello' })).toBe(
      'https://github.com/example-org/hello',
    );
  });
});

const searchNaming = (value: string): string => {
  const params = new URLSearchParams({ repo: value });

  return `?${params.toString()}`;
};
