import dedent from 'dedent';
import type { StrictPick } from 'ts-type-forge';
import {
  findSiteLinks,
  isSiteRoute,
  pageIds,
  routeOfPage,
  type SiteLink,
} from './check-site-fragments.mjs';

const PAGE = 'apps/synstate-dom-docs/src/content/docs/guides/components.md';

// `PAGE` is on synstate-dom-docs, which renders no math.
const idsOf = (text: string, rendersMath = false): readonly string[] =>
  Array.from(pageIds(text, rendersMath));

const targetsOf = (
  text: string,
  relativePath = PAGE,
): readonly StrictPick<SiteLink, 'page' | 'fragment'>[] =>
  findSiteLinks(text, relativePath).map(({ page, fragment }) => ({
    page,
    fragment,
  }));

describe('pageIds', () => {
  test('slugs each heading as Starlight does, numbering repeats', () => {
    assert.deepStrictEqual(
      idsOf(dedent`
        ## Props are plain JavaScript

        ### Example

        ### Example

        #### \`For\` and \`If\`
      `),
      [
        '_top',
        'props-are-plain-javascript',
        'example',
        'example-1',
        'for-and-if',
      ],
    );
  });

  test('keeps Japanese text, as github-slugger does', () => {
    assert.deepStrictEqual(idsOf('## props は普通の JavaScript の値'), [
      '_top',
      'props-は普通の-javascript-の値',
    ]);
  });

  // Each expected id is the one `astro build` gave the same heading.
  test('reads a heading as it renders: links, emphasis, escapes, references', () => {
    assert.deepStrictEqual(
      idsOf(dedent`
        ## See [Bindable values](/mono/synstate-dom/guides/bindable/)

        ## Bold **strong** and _em_ and snake_case_name

        ## Escaped \*star\* and \# hash

        ## \_private\_ field

        ## Code \`a_b\` and [link](/x/) and ![img](/y.png) tail

        ## A &amp; B &lt;C&gt; &#9654; end

        ## Foo {/* note */} bar
      `),
      [
        '_top',
        'see-bindable-values',
        'bold-strong-and-em-and-snake_case_name',
        'escaped-star-and--hash',
        '_private_-field',
        'code-a_b-and-link-and--tail',
        'a--b-c--end',
        'foo--note--bar',
      ],
    );
  });

  test('leaves out a heading with inline math, whose text KaTeX renders', () => {
    assert.deepStrictEqual(
      idsOf(
        dedent`
          ## depth-$M$ chain

          ## Costs \`$1\` or \\$5 and \\$6
        `,
        true,
      ),
      ['_top', 'costs-1-or-5-and-6'],
    );
  });

  test('reads a heading with dollars as text on a site with no math', () => {
    assert.deepStrictEqual(idsOf('## Costs $5 or $10'), [
      '_top',
      'costs-5-or-10',
    ]);
  });

  test('leaves out a heading with an unknown reference', () => {
    assert.deepStrictEqual(
      idsOf(dedent`
        ## Item &hellip; more

        ## Item more

        ## A &#x2g; B
      `),
      ['_top', 'item-more', 'a-x2g-b'],
    );
  });

  test('decodes a reference once, and keeps an escaped bracket in a link', () => {
    assert.deepStrictEqual(
      idsOf(
        ['## A &#x26;lt; B', String.raw`## See [a \[b\] c](/x/) tail`].join(
          '\n\n',
        ),
      ),
      ['_top', 'a-lt-b', 'see-a-b-c-tail'],
    );
  });

  test('leaves headings inside fenced code alone', () => {
    assert.deepStrictEqual(
      idsOf(dedent`
        ## Real

        \`\`\`md
        ## Not a heading
        \`\`\`
      `),
      ['_top', 'real'],
    );
  });

  test('takes an id attribute written in the page as an id, not a data-id', () => {
    assert.deepStrictEqual(
      idsOf('<div id="glitch-demo" data-id="ghost">…</div><p id={\'p\'} />'),
      ['_top', 'glitch-demo', 'p'],
    );
  });

  test('leaves the frontmatter alone', () => {
    assert.deepStrictEqual(
      idsOf(dedent`
        ---
        title: Components
        # a YAML comment
        ---

        ## Real
      `),
      ['_top', 'real'],
    );
  });
});

describe('routeOfPage and isSiteRoute', () => {
  test('a page is served at its path, and an index at its directory', () => {
    assert.strictEqual(
      routeOfPage(PAGE),
      '/mono/synstate-dom/guides/components/',
    );

    assert.strictEqual(
      routeOfPage('apps/synstate-docs/src/content/docs/index.mdx'),
      '/mono/synstate/',
    );

    assert.strictEqual(
      routeOfPage('apps/synstate-docs/src/content/docs/ja/guides/index.md'),
      '/mono/synstate/ja/guides/',
    );
  });

  test('a route is a site route only under one of the sites', () => {
    assert.isTrue(isSiteRoute('/mono/synstate-dom/guides/components/'));

    assert.isTrue(isSiteRoute('/mono/synstate/'));

    assert.isFalse(isSiteRoute('/mono/pr-manager/'));

    assert.isFalse(isSiteRoute('/mono/synstate-domain/'));
  });
});

describe('findSiteLinks', () => {
  test('reads same-page, absolute-path, relative and full-URL links with a fragment', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        See [above](#props-are-plain-javascript),
        [For](/mono/synstate-dom/guides/control-flow/#for),
        [bindable](../bindable/#receiving-a-bindable),
        [full](https://noshiro-pf.github.io/mono/synstate/guides/operators/#map).
      `),
      [
        {
          page: '/mono/synstate-dom/guides/components/',
          fragment: 'props-are-plain-javascript',
        },
        { page: '/mono/synstate-dom/guides/control-flow/', fragment: 'for' },
        {
          page: '/mono/synstate-dom/guides/bindable/',
          fragment: 'receiving-a-bindable',
        },
        { page: '/mono/synstate/guides/operators/', fragment: 'map' },
      ],
    );
  });

  test('decodes a percent-encoded fragment', () => {
    assert.deepStrictEqual(
      targetsOf(
        '[x](/mono/synstate-dom/ja/guides/components/#props-%E3%81%AF)',
      ),
      [
        {
          page: '/mono/synstate-dom/ja/guides/components/',
          fragment: 'props-は',
        },
      ],
    );
  });

  test('leaves links with no or an empty fragment, other sites, line anchors and code alone', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        [no fragment](/mono/synstate-dom/guides/control-flow/)
        [top](#) <a href="#">top</a> <a data-href="#gone">x</a>
        [GitHub](https://github.com/noshiro-pf/mono/blob/main/a.mts#L10)
        [another app](/mono/pr-manager/#top)
        \`[in code](#nowhere)\`

        \`\`\`md
        [in a fence](#nowhere)
        \`\`\`
      `),
      [],
    );
  });

  test('reads only full URLs from a document outside the sites', () => {
    assert.deepStrictEqual(
      targetsOf(
        dedent`
          [same page](#usage)
          [site](https://noshiro-pf.github.io/mono/synstate-dom/guides/components/#props-are-plain-javascript)
        `,
        'libs/synstate-dom/README.md',
      ),
      [
        {
          page: '/mono/synstate-dom/guides/components/',
          fragment: 'props-are-plain-javascript',
        },
      ],
    );
  });

  test('keeps a fragment ending in _ in a link, and reads [url](url) once', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        [x](#_private_)
        [mut_](https://noshiro-pf.github.io/mono/synstate/guides/x/#mut_)
        [https://noshiro-pf.github.io/mono/synstate/#a](https://noshiro-pf.github.io/mono/synstate/#a)
      `),
      [
        {
          page: '/mono/synstate-dom/guides/components/',
          fragment: '_private_',
        },
        { page: '/mono/synstate/guides/x/', fragment: 'mut_' },
        { page: '/mono/synstate/', fragment: 'a' },
      ],
    );
  });

  test('reads a bare URL and an autolink, without what GFM leaves out of a bare one', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        **https://noshiro-pf.github.io/mono/synstate/guides/a/#map**
        詳しくは https://noshiro-pf.github.io/mono/synstate/ja/guides/b/#scan。
        <https://noshiro-pf.github.io/mono/synstate/guides/c/#zip>
      `),
      [
        { page: '/mono/synstate/guides/a/', fragment: 'map' },
        // GFM links the \`。\` too, so the link is broken, and read so.
        { page: '/mono/synstate/ja/guides/b/', fragment: 'scan。' },
        { page: '/mono/synstate/guides/c/', fragment: 'zip' },
      ],
    );
  });

  test('reads an href written in HTML or JSX', () => {
    assert.deepStrictEqual(
      targetsOf(
        '<LinkCard href="/mono/synstate/guides/operators/#map" title="map" />',
        PAGE.replace('.md', '.mdx'),
      ),
      [{ page: '/mono/synstate/guides/operators/', fragment: 'map' }],
    );
  });
});
