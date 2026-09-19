import {
  allBranchesSegment,
  diffViewDefaults,
  isSettledLink,
  managedPagePathOf,
  overviewParam,
  preferredUrlOfLink,
  preferredUrlOfPage,
} from '../src/index.mjs';

const pageOrigin = 'https://github.com';

/**
 * A page that holds a link, for the cases where which page makes no
 * difference.
 *
 * Only the branches rule reads it, and only on the overview; every diff case
 * below answers the same whatever is passed here.
 */
const somePage = `${pageOrigin}/noshiro-pf/mono` as const;

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
        preferredUrlOfPage(href, pageOrigin),
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
      assert.deepStrictEqual(preferredUrlOfPage(href, pageOrigin), undefined);
    });

    test('leaves another origin alone, however the path reads', () => {
      // A link inside a comment body can point anywhere, and a path that looks
      // like GitHub's is not GitHub's.
      assert.deepStrictEqual(
        preferredUrlOfPage(
          'https://example.com/noshiro-pf/mono/pull/1938/files',
          pageOrigin,
        ),
        undefined,
      );
    });

    test('leaves an href the URL parser rejects alone', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage('#diff-abc', pageOrigin),
        undefined,
      );
    });
  });

  describe('what it does to the query it finds', () => {
    test('adds nothing when both defaults are already there', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(
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
        preferredUrlOfPage(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=0`,
          pageOrigin,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=0&show-viewed-files=false`,
      );
    });

    test('adds only the one that is missing', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(
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
        preferredUrlOfPage(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files?diff=split&q=a%20b`,
          pageOrigin,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?diff=split&q=a%20b&w=1&show-viewed-files=false`,
      );
    });

    test('keeps the fragment, which is how a file is linked to', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(
          `${pageOrigin}/noshiro-pf/mono/pull/1938/files#diff-abc123`,
          pageOrigin,
        ),
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files?w=1&show-viewed-files=false#diff-abc123`,
      );
    });

    test('is idempotent: what it returns needs nothing further', () => {
      const once = preferredUrlOfPage(
        `${pageOrigin}/noshiro-pf/mono/pull/1938/files`,
        pageOrigin,
      );

      assert.isDefined(once);

      assert.deepStrictEqual(preferredUrlOfPage(once, pageOrigin), undefined);
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

describe('isSettledLink', () => {
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
    [
      true,
      'the branch overview carrying the overview parameter',
      `${pageOrigin}/noshiro-pf/mono/branches?overview=1`,
    ],
    [
      false,
      'the bare branch overview',
      `${pageOrigin}/noshiro-pf/mono/branches`,
    ],
  ])('is %s for %s', (expected, _name, href) => {
    assert.deepStrictEqual(isSettledLink(href, pageOrigin, somePage), expected);
  });

  test('is false for the bare overview even in the branches page tab bar', () => {
    // There it is the "Overview" tab, which the rule marks rather than
    // redirects — so it is a link with something still to be done to it.
    assert.isFalse(
      isSettledLink(
        `${pageOrigin}/noshiro-pf/mono/branches`,
        pageOrigin,
        `${pageOrigin}/noshiro-pf/mono/branches/all`,
      ),
    );
  });
});

describe('preferredUrlOfPage, on a repository branches page', () => {
  const overview = `${pageOrigin}/noshiro-pf/mono/branches` as const;

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
        preferredUrlOfPage(href, pageOrigin),
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
      assert.deepStrictEqual(preferredUrlOfPage(href, pageOrigin), undefined);
    });

    test('leaves another origin alone, however the path reads', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(
          'https://example.com/noshiro-pf/mono/branches',
          pageOrigin,
        ),
        undefined,
      );
    });
  });

  describe('the overview parameter', () => {
    test('leaves the overview alone when the address asks for it', () => {
      // This is the opt-out, and it is in the address rather than in how the
      // address was reached — which is what makes a reload, a bookmark and the
      // click that wrote it answer the same.
      assert.deepStrictEqual(
        preferredUrlOfPage(`${overview}?overview=1`, pageOrigin),
        undefined,
      );
    });

    test('reads the parameter by name, whatever its value', () => {
      // The value is what this extension writes, not what it checks: the
      // question the address answers is whether the parameter is there at all,
      // the same way the diff rule reads `w`.
      assert.deepStrictEqual(
        preferredUrlOfPage(`${overview}?overview=0`, pageOrigin),
        undefined,
      );
    });

    test('is not confused by a parameter that only starts the same', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(`${overview}?overviewing=1`, pageOrigin),
        `${overview}/all?overviewing=1`,
      );
    });

    test('does not act on a named list that carries it', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(`${overview}/all?overview=1`, pageOrigin),
        undefined,
      );
    });
  });

  describe('what it does to the rest of the address', () => {
    test('keeps the query, which is where the branch search goes', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(`${overview}?query=release%2F1`, pageOrigin),
        `${overview}/all?query=release%2F1`,
      );
    });

    test('keeps the fragment', () => {
      assert.deepStrictEqual(
        preferredUrlOfPage(`${overview}#top`, pageOrigin),
        `${overview}/all#top`,
      );
    });

    test('is idempotent: what it returns needs nothing further', () => {
      const once = preferredUrlOfPage(overview, pageOrigin);

      assert.isDefined(once);

      assert.deepStrictEqual(preferredUrlOfPage(once, pageOrigin), undefined);
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

describe('preferredUrlOfLink, on a link to the branch overview', () => {
  const overview = `${pageOrigin}/noshiro-pf/mono/branches` as const;

  test.each([
    ['the full list', `${overview}/all`],
    ['another tab of the same page', `${overview}/yours`],
    ['the overview itself', overview],
    ['the overview carrying the parameter', `${overview}?overview=1`],
  ])('marks it as the overview when the link sits on %s', (_name, pageHref) => {
    // The "Overview" tab points at the very URL the rule redirects, so the tab
    // is marked rather than left alone: the mark is what survives the
    // navigation, and the reload after it.
    assert.deepStrictEqual(
      preferredUrlOfLink(overview, pageOrigin, pageHref),
      `${overview}?overview=1`,
    );
  });

  test.each([
    ['the repository root', `${pageOrigin}/noshiro-pf/mono`],
    [
      'the branches page of a different repository',
      `${pageOrigin}/noshiro-pf/other/branches`,
    ],
    ['a pull request', `${pageOrigin}/noshiro-pf/mono/pull/1938`],
    ['another origin', 'https://example.com/noshiro-pf/mono/branches'],
    ['an address the URL parser rejects', 'not a url'],
  ])(
    'sends it to the full list when the link sits on %s',
    (_name, pageHref) => {
      assert.deepStrictEqual(
        preferredUrlOfLink(overview, pageOrigin, pageHref),
        `${overview}/all`,
      );
    },
  );

  test('keeps the query when it marks one', () => {
    assert.deepStrictEqual(
      preferredUrlOfLink(
        `${overview}?query=release`,
        pageOrigin,
        `${overview}/all`,
      ),
      `${overview}?query=release&overview=1`,
    );
  });

  test('is idempotent: a marked link needs nothing further', () => {
    const once = preferredUrlOfLink(overview, pageOrigin, `${overview}/all`);

    assert.isDefined(once);

    assert.deepStrictEqual(
      preferredUrlOfLink(once, pageOrigin, `${overview}/all`),
      undefined,
    );
  });
});

describe('allBranchesSegment and overviewParam', () => {
  test('are what the extension writes', () => {
    // Pinned rather than left implicit: with `diffViewDefaults` above, these
    // are the whole of what the extension does, and the README, the store
    // description and the manifest all describe them.
    assert.deepStrictEqual(
      [allBranchesSegment, overviewParam],
      ['all', ['overview', '1']],
    );
  });
});
