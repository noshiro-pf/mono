import { numberedTitleOf } from '../src/index.mjs';

const pageOrigin = 'https://github.com';

const title =
  'Fix the thing by noshiro-pf · Pull Request #2054 · noshiro-pf/mono';

describe('numberedTitleOf', () => {
  describe('the pages it numbers', () => {
    test.each([
      ['a pull request', `${pageOrigin}/noshiro-pf/mono/pull/2054`, '2054'],
      [
        'a tab of a pull request',
        `${pageOrigin}/noshiro-pf/mono/pull/2054/files`,
        '2054',
      ],
      [
        'a diff between two commits of a pull request',
        `${pageOrigin}/noshiro-pf/mono/pull/2054/files/bafb1cf..fed0b20`,
        '2054',
      ],
      ['an issue', `${pageOrigin}/noshiro-pf/mono/issues/2065`, '2065'],
      [
        'an address with a query and a fragment',
        `${pageOrigin}/noshiro-pf/mono/issues/2065?w=1#issuecomment-1`,
        '2065',
      ],
      [
        'a repository whose name looks like a path segment',
        `${pageOrigin}/noshiro-pf/mono.github.io/pull/7`,
        '7',
      ],
    ])('puts the number in front on %s', (_name, pageHref, number) => {
      assert.deepStrictEqual(
        numberedTitleOf(title, pageHref),
        `#${number} ${title}`,
      );
    });

    test.each([
      ['the pull request list', `${pageOrigin}/noshiro-pf/mono/pulls`],
      ['the issue list', `${pageOrigin}/noshiro-pf/mono/issues`],
      ['a new issue', `${pageOrigin}/noshiro-pf/mono/issues/new`],
      ['a commit', `${pageOrigin}/noshiro-pf/mono/commit/bafb1cf`],
      ['a discussion', `${pageOrigin}/noshiro-pf/mono/discussions/12`],
      ['the repository root', `${pageOrigin}/noshiro-pf/mono`],
      ['a path that only starts the same', `${pageOrigin}/pull/2054`],
      [
        'a number followed by more of the same segment',
        `${pageOrigin}/noshiro-pf/mono/pull/2054abc`,
      ],
      ['an address the URL parser rejects', 'not a url'],
    ])('leaves the title of %s alone', (_name, pageHref) => {
      assert.deepStrictEqual(numberedTitleOf(title, pageHref), title);
    });
  });

  describe('the title it is given', () => {
    const pageHref = `${pageOrigin}/noshiro-pf/mono/pull/2054` as const;

    test('does not number a title that already starts with the number', () => {
      // What it wrote itself, read back on the next mutation. Numbering it
      // again would be a write per mutation, each one a mutation of its own.
      assert.deepStrictEqual(
        numberedTitleOf(`#2054 ${title}`, pageHref),
        `#2054 ${title}`,
      );
    });

    test('does not number a title that is the number alone', () => {
      assert.deepStrictEqual(numberedTitleOf('#2054', pageHref), '#2054');
    });

    test('numbers a title that starts with a longer number', () => {
      // `#20545` is not `#2054` followed by a space.
      assert.deepStrictEqual(
        numberedTitleOf('#20545 elsewhere', pageHref),
        '#2054 #20545 elsewhere',
      );
    });

    test('leaves an empty title empty', () => {
      // The title before the document has one. Writing one then would put a
      // second `<title>` in front of the one the page is about to parse.
      assert.deepStrictEqual(numberedTitleOf('', pageHref), '');
    });
  });
});
