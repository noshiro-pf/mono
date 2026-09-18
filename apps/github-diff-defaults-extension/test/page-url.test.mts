import {
  allBranchesSegment,
  diffViewDefaults,
  isSettledUrl,
  managedPagePathOf,
  preferredUrlOf,
} from '../src/index.mjs';

const pageOrigin = 'https://github.com';

/**
 * Where the visit came from, for the cases in which it makes no difference.
 *
 * Only the branches rule reads it, and only on the overview; every diff case
 * below answers the same whatever is passed here. `''` is what
 * `document.referrer` says on a typed URL or a bookmark.
 */
const noReferrer = '';

describe('preferredUrlOf, on a pull request diff', () => {
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
        preferredUrlOf(href, pageOrigin, noReferrer),
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
      assert.deepStrictEqual(
        preferredUrlOf(href, pageOrigin, noReferrer),
        undefined,
      );
    });

    test('leaves another origin alone, however the path reads', () => {
      // A link inside a comment body can point anywhere, and a path that looks
      // like GitHub's is not GitHub's.
      assert.deepStrictEqual(
        preferredUrlOf(
          'https://example.com/noshiro-pf/mono/pull/1938/files',
          pageOrigin,
          noReferrer,
        ),
        undefined,
      );
    });

    test('leaves an href the URL parser rejects alone', () => {
      assert.deepStrictEqual(
        preferredUrlOf('#diff-abc', pageOrigin, noReferrer),
        undefined,
      );
    });
  });

  describe('what it does to the query it finds', () => {
    test('adds nothing when both defaults are already there', () => {
      assert.deepStrictEqual(
        preferredUrlOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false`,
          pageOrigin,
          noReferrer,
        ),
        undefined,
      );
    });

    test('never rewrites a parameter that is already set', () => {
      // This is the opt-out: GitHub's own "Show whitespace changes" control
      // navigates to `w=0`, and forcing it back to `w=1` would leave no way to
      // look at what the extension hides.
      assert.deepStrictEqual(
        preferredUrlOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=0`,
          pageOrigin,
          noReferrer,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=0&show-viewed-files=false`,
      );
    });

    test('adds only the one that is missing', () => {
      assert.deepStrictEqual(
        preferredUrlOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?show-viewed-files=true`,
          pageOrigin,
          noReferrer,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?show-viewed-files=true&w=1`,
      );
    });

    test('keeps an unrelated parameter, and keeps it as it was written', () => {
      // Appended rather than re-serialized, so an escape GitHub wrote survives:
      // `URLSearchParams` would turn the `%20` into a `+`.
      assert.deepStrictEqual(
        preferredUrlOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?diff=split&q=a%20b`,
          pageOrigin,
          noReferrer,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?diff=split&q=a%20b&w=1&show-viewed-files=false`,
      );
    });

    test('keeps the fragment, which is how a file is linked to', () => {
      assert.deepStrictEqual(
        preferredUrlOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files#diff-abc123`,
          pageOrigin,
          noReferrer,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false#diff-abc123`,
      );
    });

    test('is idempotent: what it returns needs nothing further', () => {
      const once = preferredUrlOf(
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files`,
        pageOrigin,
        noReferrer,
      );

      assert.isDefined(once);

      assert.deepStrictEqual(
        preferredUrlOf(once, pageOrigin, noReferrer),
        undefined,
      );
    });
  });
});

describe('managedPagePathOf', () => {
  test('is the path, whatever the query says', () => {
    // The point of the path alone: these three are one page, and the extension
    // has to recognize them as such after GitHub rewrites the address.
    const paths = [
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files`,
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false`,
      `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1#diff-abc`,
    ].map((href) => managedPagePathOf(href, pageOrigin));

    assert.deepStrictEqual(paths, [
      '/noshiro-pf/mono/pull/1938/files',
      '/noshiro-pf/mono/pull/1938/files',
      '/noshiro-pf/mono/pull/1938/files',
    ]);
  });

  test('tells two diff pages apart', () => {
    assert.deepStrictEqual(
      [
        managedPagePathOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files`,
          pageOrigin,
        ),
        managedPagePathOf(
          `${pageOrigin}/noshiro-pf/mono/pull/1939/files`,
          pageOrigin,
        ),
      ],
      ['/noshiro-pf/mono/pull/1938/files', '/noshiro-pf/mono/pull/1939/files'],
    );
  });

  test.each([
    ['a page no rule speaks for', `${pageOrigin}/noshiro-pf/mono/pull/1938`],
    ['another origin', 'https://example.com/noshiro-pf/mono/pull/1938/files'],
    ['an href the URL parser rejects', 'not a url'],
  ])('is undefined for %s', (_name, href) => {
    assert.deepStrictEqual(managedPagePathOf(href, pageOrigin), undefined);
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

describe('isSettledUrl', () => {
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
      'a page no rule speaks for',
      `${pageOrigin}/noshiro-pf/mono/pull/1938`,
    ],
    [
      false,
      'another origin',
      'https://example.com/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false',
    ],
    [
      true,
      'a branch list that is already a named one',
      `${pageOrigin}/noshiro-pf/mono/branches/all`,
    ],
    [false, 'the branch overview', `${pageOrigin}/noshiro-pf/mono/branches`],
  ])('is %s for %s', (expected, _name, href) => {
    assert.deepStrictEqual(
      isSettledUrl(href, pageOrigin, noReferrer),
      expected,
    );
  });

  test('is true for the branch overview reached from another of its tabs', () => {
    // Which is what tells the click handler to leave that link to the browser
    // rather than treating it as one to rewrite.
    assert.isTrue(
      isSettledUrl(
        `${pageOrigin}/noshiro-pf/mono/branches`,
        pageOrigin,
        `${pageOrigin}/noshiro-pf/mono/branches/all`,
      ),
    );
  });
});

describe('preferredUrlOf, on a repository branches page', () => {
  const overview = `${pageOrigin}/noshiro-pf/mono/branches`;

  describe('the pages it acts on', () => {
    test.each([
      ['the branch overview', overview],
      ['the same path with a trailing slash', `${overview}/`],
      [
        'a repository whose name looks like a path segment',
        `${pageOrigin}/noshiro-pf/mono.github.io/branches`,
      ],
    ])('sends %s to the full list', (_name, href) => {
      assert.deepStrictEqual(
        preferredUrlOf(href, pageOrigin, noReferrer),
        `${href.replace(/\/$/u, '')}/all`,
      );
    });

    test.each([
      ['the full list itself', `${overview}/all`],
      ['another tab of the same page', `${overview}/yours`],
      ['the active branches', `${overview}/active`],
      ['the stale branches', `${overview}/stale`],
      ['a single branch page', `${pageOrigin}/noshiro-pf/mono/tree/main`],
      ['the repository root', `${pageOrigin}/noshiro-pf/mono`],
      ['a path that only starts the same', `${pageOrigin}/branches`],
      [
        'a path that is a different word',
        `${pageOrigin}/noshiro-pf/mono/branchesets`,
      ],
    ])('leaves %s alone', (_name, href) => {
      assert.deepStrictEqual(
        preferredUrlOf(href, pageOrigin, noReferrer),
        undefined,
      );
    });

    test('leaves another origin alone, however the path reads', () => {
      assert.deepStrictEqual(
        preferredUrlOf(
          'https://example.com/noshiro-pf/mono/branches',
          pageOrigin,
          noReferrer,
        ),
        undefined,
      );
    });
  });

  describe('where the visit came from', () => {
    test.each([
      ['the full list', `${overview}/all`],
      ['another tab of the same page', `${overview}/yours`],
      ['the overview of the same repository', overview],
    ])(
      'leaves the overview alone when it was reached from %s',
      (_name, from) => {
        // This is the opt-out. The "Overview" tab of the branches page points at
        // the very URL this rule redirects, so a rule that acted on it whatever
        // the referrer said would make that tab unreachable.
        assert.deepStrictEqual(
          preferredUrlOf(overview, pageOrigin, from),
          undefined,
        );
      },
    );

    test.each([
      ['the repository root', `${pageOrigin}/noshiro-pf/mono`],
      [
        'the branches page of a different repository',
        `${pageOrigin}/noshiro-pf/other/branches`,
      ],
      ['a pull request', `${pageOrigin}/noshiro-pf/mono/pull/1938`],
      ['another origin', 'https://example.com/noshiro-pf/mono/branches'],
      ['nowhere — a typed URL or a bookmark', noReferrer],
      ['an address the URL parser rejects', 'not a url'],
    ])('acts on the overview reached from %s', (_name, from) => {
      assert.deepStrictEqual(
        preferredUrlOf(overview, pageOrigin, from),
        `${overview}/all`,
      );
    });
  });

  describe('what it does to the rest of the address', () => {
    test('keeps the query, which is where the branch search goes', () => {
      assert.deepStrictEqual(
        preferredUrlOf(`${overview}?query=release%2F1`, pageOrigin, noReferrer),
        `${overview}/all?query=release%2F1`,
      );
    });

    test('keeps the fragment', () => {
      assert.deepStrictEqual(
        preferredUrlOf(`${overview}#top`, pageOrigin, noReferrer),
        `${overview}/all#top`,
      );
    });

    test('is idempotent: what it returns needs nothing further', () => {
      const once = preferredUrlOf(overview, pageOrigin, noReferrer);

      assert.isDefined(once);

      assert.deepStrictEqual(
        preferredUrlOf(once, pageOrigin, noReferrer),
        undefined,
      );
    });
  });

  test('is a page the caller can remember, like a diff page', () => {
    assert.deepStrictEqual(
      [
        managedPagePathOf(overview, pageOrigin),
        managedPagePathOf(`${overview}/all?query=x`, pageOrigin),
      ],
      ['/noshiro-pf/mono/branches', '/noshiro-pf/mono/branches/all'],
    );
  });
});

describe('allBranchesSegment', () => {
  test('is the tab the overview is opened as', () => {
    // Pinned rather than left implicit: with `diffViewDefaults` above, this is
    // the whole of what the extension does, and the README, the store
    // description and the manifest all describe it.
    assert.deepStrictEqual(allBranchesSegment, 'all');
  });
});
