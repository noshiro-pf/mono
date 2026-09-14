import {
  diffPagePathOf,
  diffUrlWithDefaults,
  diffViewDefaults,
  isSettledDiffUrl,
} from '../src/index.mjs';

const pageOrigin = 'https://github.com';

describe('diffUrlWithDefaults', () => {
  describe('the pages it acts on', () => {
    test.each([
      ['the files tab', `${pageOrigin}/noshiro-pf/mono/pull/1938/files`],
      [
        'the changes spelling',
        `${pageOrigin}/noshiro-pf/mono/pull/1938/changes`,
      ],
      [
        'a diff between two commits of the pull request',
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files/bafb1cf..fed0b20`,
      ],
      [
        'a repository whose name looks like a path segment',
        `${pageOrigin}/noshiro-pf/mono.github.io/pull/7/files`,
      ],
    ])('adds both defaults to %s', (_name, href) => {
      assert.deepStrictEqual(
        diffUrlWithDefaults(href, pageOrigin),
        `${href}?w=1&show-viewed-files=false`,
      );
    });

    test.each([
      ['the conversation tab', `${pageOrigin}/noshiro-pf/mono/pull/1938`],
      ['the commits tab', `${pageOrigin}/noshiro-pf/mono/pull/1938/commits`],
      ['a commit', `${pageOrigin}/noshiro-pf/mono/commit/bafb1cf`],
      ['a comparison', `${pageOrigin}/noshiro-pf/mono/compare/main...topic`],
      ['the repository root', `${pageOrigin}/noshiro-pf/mono`],
      ['a path that only starts the same', `${pageOrigin}/pull/1938/files`],
      [
        'a pull request number that is not a number',
        `${pageOrigin}/noshiro-pf/mono/pull/latest/files`,
      ],
      [
        'a path below the files tab that is a different word',
        `${pageOrigin}/noshiro-pf/mono/pull/1938/filestore`,
      ],
    ])('leaves %s alone', (_name, href) => {
      assert.deepStrictEqual(diffUrlWithDefaults(href, pageOrigin), undefined);
    });

    test('leaves another origin alone, however the path reads', () => {
      // A link inside a comment body can point anywhere, and a path that looks
      // like GitHub's is not GitHub's.
      assert.deepStrictEqual(
        diffUrlWithDefaults(
          'https://example.com/noshiro-pf/mono/pull/1938/files',
          pageOrigin,
        ),
        undefined,
      );
    });

    test('leaves an href the URL parser rejects alone', () => {
      assert.deepStrictEqual(
        diffUrlWithDefaults('#diff-abc', pageOrigin),
        undefined,
      );
    });
  });

  describe('what it does to the query it finds', () => {
    test('adds nothing when both defaults are already there', () => {
      assert.deepStrictEqual(
        diffUrlWithDefaults(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false`,
          pageOrigin,
        ),
        undefined,
      );
    });

    test('never rewrites a parameter that is already set', () => {
      // This is the opt-out: GitHub's own "Show whitespace changes" control
      // navigates to `w=0`, and forcing it back to `w=1` would leave no way to
      // look at what the extension hides.
      assert.deepStrictEqual(
        diffUrlWithDefaults(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=0`,
          pageOrigin,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=0&show-viewed-files=false`,
      );
    });

    test('adds only the one that is missing', () => {
      assert.deepStrictEqual(
        diffUrlWithDefaults(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?show-viewed-files=true`,
          pageOrigin,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?show-viewed-files=true&w=1`,
      );
    });

    test('keeps an unrelated parameter, and keeps it as it was written', () => {
      // Appended rather than re-serialized, so an escape GitHub wrote survives:
      // `URLSearchParams` would turn the `%20` into a `+`.
      assert.deepStrictEqual(
        diffUrlWithDefaults(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?diff=split&q=a%20b`,
          pageOrigin,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?diff=split&q=a%20b&w=1&show-viewed-files=false`,
      );
    });

    test('keeps the fragment, which is how a file is linked to', () => {
      assert.deepStrictEqual(
        diffUrlWithDefaults(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files#diff-abc123`,
          pageOrigin,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false#diff-abc123`,
      );
    });

    test('is idempotent: what it returns needs nothing further', () => {
      const once = diffUrlWithDefaults(
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files`,
        pageOrigin,
      );

      assert.isDefined(once);

      assert.deepStrictEqual(diffUrlWithDefaults(once, pageOrigin), undefined);
    });
  });
});

describe('diffPagePathOf', () => {
  test('is the path, whatever the query says', () => {
    // The point of the path alone: these three are one page, and the extension
    // has to recognize them as such after GitHub rewrites the address.
    const paths = [
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files`,
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false`,
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1#diff-abc`,
    ].map((href) => diffPagePathOf(href, pageOrigin));

    assert.deepStrictEqual(paths, [
      '/noshiro-pf/mono/pull/1938/files',
      '/noshiro-pf/mono/pull/1938/files',
      '/noshiro-pf/mono/pull/1938/files',
    ]);
  });

  test('tells two diff pages apart', () => {
    assert.deepStrictEqual(
      [
        diffPagePathOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files`,
          pageOrigin,
        ),
        diffPagePathOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1939/files`,
          pageOrigin,
        ),
      ],
      ['/noshiro-pf/mono/pull/1938/files', '/noshiro-pf/mono/pull/1939/files'],
    );
  });

  test.each([
    ['a page that is not a diff', `${pageOrigin}/noshiro-pf/mono/pull/1938`],
    ['another origin', 'https://example.com/noshiro-pf/mono/pull/1938/files'],
    ['an href the URL parser rejects', 'not a url'],
  ])('is undefined for %s', (_name, href) => {
    assert.deepStrictEqual(diffPagePathOf(href, pageOrigin), undefined);
  });
});

describe('diffViewDefaults', () => {
  test('is what the extension exists to do', () => {
    // Pinned rather than left implicit: these two strings are the whole of the
    // extension's behavior, and the README, the store description and the
    // manifest all describe them.
    assert.deepStrictEqual(diffViewDefaults, [
      ['w', '1'],
      ['show-viewed-files', 'false'],
    ]);
  });
});

describe('isSettledDiffUrl', () => {
  test.each([
    [
      true,
      'a diff URL carrying both defaults',
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false`,
    ],
    [
      true,
      'a diff URL whose parameters disagree with the defaults but are set',
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=0&show-viewed-files=true`,
    ],
    [false, 'a bare diff URL', `${pageOrigin}/noshiro-pf/mono/pull/1938/files`],
    [
      false,
      'a diff URL missing one of them',
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1`,
    ],
    [
      false,
      'a page that is not a diff',
      `${pageOrigin}/noshiro-pf/mono/pull/1938`,
    ],
    [
      false,
      'another origin',
      'https://example.com/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false',
    ],
  ])('is %s for %s', (expected, _name, href) => {
    assert.deepStrictEqual(isSettledDiffUrl(href, pageOrigin), expected);
  });
});
