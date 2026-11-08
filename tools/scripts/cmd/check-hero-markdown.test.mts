// cspell:ignore FEFF
import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import { findHeroMarkdown } from './check-hero-markdown.mjs';

const marksIn = (content: string): readonly string[] => {
  const found = findHeroMarkdown(content);

  assert.isTrue(Result.isOk(found));

  return found.value;
};

describe(findHeroMarkdown, () => {
  test('reports Markdown in a one-line tagline', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        title: a
        hero:
            tagline: Use \`map\`, **bold** and [a link](/x/).
        ---

        Body with \`code\`.
      `),
      [
        'hero.tagline: `code`',
        'hero.tagline: **strong**',
        'hero.tagline: a link',
      ],
    );
  });

  test('reports emphasis, strikethrough, autolinks and escapes', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: A *fast*, _small_, un*bounded*, ~~old~~ library; see <https://example.com>, 1\\. not a list.
        ---
      `),
      [
        'hero.tagline: *emphasis*',
        'hero.tagline: ~~strikethrough~~',
        'hero.tagline: a link',
        'hero.tagline: a backslash escape',
      ],
    );
  });

  test('reports a block, such as a list', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: "- one"
        ---
      `),
      ['hero.tagline: a list'],
    );
  });

  test('reports Markdown in a block-scalar tagline and in the hero title', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        title: plain
        hero:
            title: The \`x\` library
            tagline: >
                One line,
                then \`code\`.
            actions: []
        ---
      `),
      ['hero.title: `code`', 'hero.tagline: `code`'],
    );
  });

  test('reports Markdown in the page title a hero without a title shows', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        title: The \`x\` library
        hero:
            tagline: plain
        ---
      `),
      [
        'title (shown as the hero title, and as plain text elsewhere: give the hero a `title` instead): `code`',
      ],
    );
  });

  test('reads a CRLF file', () => {
    assert.deepStrictEqual(
      marksIn('---\r\nhero:\r\n    tagline: use `x`\r\n---\r\n\r\nBody.\r\n'),
      ['hero.tagline: `code`'],
    );
  });

  test('reads only the hero', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        foo:
            tagline: see \`elsewhere\`
        hero:
            tagline: plain
        ---

        tagline: \`not frontmatter\`
      `),
      [],
    );
  });

  test('accepts HTML, arithmetic and identifiers', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: Use <code>__dirname</code>, <a href="/docs/_internal_/">this</a>, 2 * 3 * 4 and map_value.
        ---
      `),
      [],
    );
  });

  test('accepts brackets and a less-than sign that are text', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: Arrays like [1, 2] work [beta] (optional), [a][b] too, and when a < b so c > d.
        ---
      `),
      [],
    );
  });

  test('accepts what code, kbd, samp and pre elements hold', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: <code>a*b*c</code>, <kbd>**Ctrl**</kbd>, <samp>\\*</samp>, <a title="x > y">*not*</a>.
        ---
      `),
      ['hero.tagline: *emphasis*'],
    );
  });

  test('reads Markdown after a tag that opens an HTML block', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: <p>Use \`map\`</p>
        ---
      `),
      ['hero.tagline: `code`'],
    );
  });

  test('reads on after a self-closing code element and a custom element', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            title: <code/> then \`x\`
            tagline: <code-sample>then *y*</code-sample>
        ---
      `),
      ['hero.title: `code`', 'hero.tagline: *emphasis*'],
    );
  });

  test('reports Markdown and HTML in the text of an action', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: plain
            actions:
                - text: Read \`map\`
                  link: /a/
                - text: Plain
                  link: /b/
                - text: Read <code>map</code>
                  link: /c/
        ---
      `),
      [
        'hero.actions[0].text: `code`',
        'hero.actions[2].text: HTML (shown here as written)',
      ],
    );
  });

  test('reports a character reference in the text of an action', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: Read &amp; write
            actions:
                - text: Read &amp; write
                  link: /a/
                - text: Read & write
                  link: /b/
        ---
      `),
      ['hero.actions[0].text: a character reference (shown here as written)'],
    );
  });

  test('reports HTML in the page title a hero without a title shows', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        title: The <code>x</code> library
        hero:
            tagline: plain
        ---
      `),
      [
        'title (shown as the hero title, and as plain text elsewhere: give the hero a `title` instead): HTML (shown here as written)',
      ],
    );
  });

  test('names a link definition and a reference link', () => {
    assert.deepStrictEqual(
      marksIn(
        [
          '---',
          'hero:',
          '    tagline: |',
          '        See [map][m].',
          '',
          '        [m]: /map/',
          '---',
        ].join('\n'),
      ),
      ['hero.tagline: a link', 'hero.tagline: a link definition'],
    );
  });

  test('reads a quoted hero key', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        "hero":
            tagline: use \`x\`
        ---
      `),
      ['hero.tagline: `code`'],
    );
  });

  test('finds Markdown between a less-than and a greater-than sign', () => {
    assert.deepStrictEqual(
      marksIn(dedent`
        ---
        hero:
            tagline: When a < b, \`map\` the rest so c > d.
        ---
      `),
      ['hero.tagline: `code`'],
    );
  });

  test('reads a byte order mark and spaces after the fences', () => {
    assert.deepStrictEqual(
      marksIn('\u{FEFF}--- \nhero:\n  tagline: use `x`\n---  \n'),
      ['hero.tagline: `code`'],
    );
  });

  test('reads nothing of a page without a hero', () => {
    assert.deepStrictEqual(marksIn('# Title\n'), []);

    assert.deepStrictEqual(marksIn('---\ntitle: The `x` library\n---\n'), []);
  });

  test('refuses a page whose frontmatter does not parse', () => {
    assert.isTrue(
      Result.isErr(findHeroMarkdown('---\nhero:\n  tagline: [\n---\n')),
    );
  });
});
