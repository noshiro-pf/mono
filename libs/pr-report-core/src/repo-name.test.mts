import {
  asciiLowerCase,
  isRepoApiUrl,
  isRepoNamed,
  isSameRepo,
  readIssueNumber,
} from './repo-name.mjs';

describe(isRepoNamed, () => {
  const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

  test('is true for the name GitHub gives back', () => {
    assert.isTrue(isRepoNamed(repo, 'noshiro-pf/mono'));
  });

  test('ignores case on either side, as GitHub does', () => {
    assert.isTrue(isRepoNamed(repo, 'Noshiro-PF/Mono'));

    assert.isTrue(
      isRepoNamed({ owner: 'Noshiro-PF', name: 'MONO' }, 'noshiro-pf/mono'),
    );
  });

  test('is false for another repository or an owner alone', () => {
    assert.isFalse(isRepoNamed(repo, 'noshiro-pf/other'));

    assert.isFalse(isRepoNamed(repo, 'other/mono'));

    assert.isFalse(isRepoNamed(repo, 'noshiro-pf'));
  });

  test('is false for no name, as a deleted fork answers', () => {
    assert.isFalse(isRepoNamed(repo, undefined));
  });

  test('folds ASCII letters alone, so no Unicode fold makes a name equal', () => {
    // U+212A KELVIN SIGN, which `toLowerCase` folds to `k`.
    assert.isFalse(isRepoNamed({ owner: 'o', name: 'k' }, 'o/K'));
  });
});

describe(isRepoApiUrl, () => {
  const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

  test("is true for the repository's REST URL, in any case", () => {
    assert.isTrue(
      isRepoApiUrl(repo, 'https://api.github.com/repos/noshiro-pf/mono'),
    );

    assert.isTrue(
      isRepoApiUrl(repo, 'https://api.github.com/repos/Noshiro-PF/Mono'),
    );
  });

  test('reads the path alone, under whatever API root answered', () => {
    assert.isTrue(
      isRepoApiUrl(repo, 'https://ghe.example/api/v3/repos/Noshiro-PF/Mono'),
    );

    assert.isTrue(
      isRepoApiUrl(repo, 'http://127.0.0.1:1234/gh/repos/noshiro-pf/mono'),
    );
  });

  test("is false for another repository's URL, or another path", () => {
    assert.isFalse(
      isRepoApiUrl(repo, 'https://api.github.com/repos/noshiro-pf/other'),
    );

    assert.isFalse(
      isRepoApiUrl(repo, 'https://api.github.com/repos/other/mono'),
    );

    assert.isFalse(
      isRepoApiUrl(repo, 'https://api.github.com/repos/xnoshiro-pf/mono'),
    );

    assert.isFalse(
      isRepoApiUrl(repo, 'https://api.github.com/repos/noshiro-pf/mono/issues'),
    );

    assert.isFalse(
      isRepoApiUrl(repo, 'https://ghe.example/api/v3/repos/noshiro-pf/other'),
    );
  });

  test('is false for a path ending in a slash, which GitHub does not give', () => {
    assert.isFalse(
      isRepoApiUrl(repo, 'https://api.github.com/repos/noshiro-pf/mono/'),
    );
  });

  test('is false for text that is not a URL', () => {
    assert.isFalse(isRepoApiUrl(repo, 'noshiro-pf/mono'));
  });
});

describe(isSameRepo, () => {
  test('ignores the case of both names', () => {
    assert.isTrue(
      isSameRepo(
        { owner: 'noshiro-pf', name: 'mono' },
        { owner: 'Noshiro-PF', name: 'Mono' },
      ),
    );
  });

  test('is false when either name differs', () => {
    assert.isFalse(
      isSameRepo(
        { owner: 'noshiro-pf', name: 'mono' },
        { owner: 'noshiro-pf', name: 'other' },
      ),
    );

    assert.isFalse(
      isSameRepo(
        { owner: 'noshiro-pf', name: 'mono' },
        { owner: 'other', name: 'mono' },
      ),
    );
  });

  test('does not take a slash moved between the names for the same name', () => {
    assert.isFalse(
      isSameRepo({ owner: 'a/b', name: 'c' }, { owner: 'a', name: 'b/c' }),
    );
  });
});

describe(readIssueNumber, () => {
  test('reads decimal digits', () => {
    assert.deepStrictEqual(readIssueNumber('12'), [12]);
  });

  test('reads nothing from text that is not digits alone', () => {
    assert.deepStrictEqual(readIssueNumber(''), []);

    assert.deepStrictEqual(readIssueNumber('x'), []);

    assert.deepStrictEqual(readIssueNumber('-3'), []);

    assert.deepStrictEqual(readIssueNumber('1.5'), []);

    assert.deepStrictEqual(readIssueNumber('12a'), []);
  });

  test('reads nothing from digits past the safe integers', () => {
    assert.deepStrictEqual(readIssueNumber('9'.repeat(20)), []);
  });
});

describe(asciiLowerCase, () => {
  test('lowers A to Z alone', () => {
    assert.strictEqual(asciiLowerCase('Fixes \u{212A} É'), 'fixes \u{212A} É');
  });
});
