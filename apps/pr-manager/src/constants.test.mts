import {
  DEFAULT_REPORT_SOURCE,
  parseRepository,
  reportSourceFromSearch,
  repositoryUrl,
  searchWithRepository,
} from './constants.mjs';

describe(reportSourceFromSearch, () => {
  test('reads the repository from `repo=owner/name`', () => {
    assert.deepStrictEqual(
      reportSourceFromSearch('?theme=dark&repo=example-org/hello.world_2'),
      { owner: 'example-org', repo: 'hello.world_2' },
    );
  });

  test('reads a URL as the input field does', () => {
    assert.deepStrictEqual(
      reportSourceFromSearch(
        searchNaming('https://github.com/example-org/hello/pulls'),
      ),
      { owner: 'example-org', repo: 'hello' },
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

describe(parseRepository, () => {
  test('reads `owner/name`, with or without spaces round it', () => {
    assert.deepStrictEqual(parseRepository(' example-org/hello '), {
      owner: 'example-org',
      repo: 'hello',
    });
  });

  // What a reader copies out of the address bar.
  test("reads the repository's URL on GitHub, whatever follows the name", () => {
    for (const value of [
      'https://github.com/example-org/hello',
      'https://github.com/example-org/hello/',
      'https://github.com/example-org/hello.git',
      'https://github.com/example-org/hello/pulls?q=is%3Aopen',
      'https://github.com/example-org/hello#readme',
      'http://www.github.com/example-org/hello',
      'github.com/example-org/hello/issues/3',
    ]) {
      assert.deepStrictEqual(parseRepository(value), {
        owner: 'example-org',
        repo: 'hello',
      });
    }
  });

  test('keeps `.git` in a name given as `owner/name`', () => {
    assert.deepStrictEqual(parseRepository('example-org/hello.git'), {
      owner: 'example-org',
      repo: 'hello.git',
    });
  });

  test('is `undefined` for what names no repository on github.com', () => {
    for (const value of [
      '',
      'example-org',
      'a/b/c',
      'https://github.com/example-org',
      'https://gitlab.com/example-org/hello',
      'https://github.example.com/example-org/hello',
      'org/..',
    ]) {
      assert.isUndefined(parseRepository(value));
    }
  });
});

describe(searchWithRepository, () => {
  test('sets `repo` and keeps the rest', () => {
    expect(
      searchWithRepository('?theme=dark&repo=a/b', {
        owner: 'example-org',
        repo: 'hello',
      }),
    ).toBe('?theme=dark&repo=example-org/hello');
  });

  test('drops `repo` for the repository read without it', () => {
    expect(
      searchWithRepository('?repo=a/b&cols=2', DEFAULT_REPORT_SOURCE),
    ).toBe('?cols=2');

    expect(searchWithRepository('?repo=a/b', DEFAULT_REPORT_SOURCE)).toBe('');
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
