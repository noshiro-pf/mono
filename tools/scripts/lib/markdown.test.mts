import dedent from 'dedent';
import {
  codeSpanRanges,
  codeSpans,
  markdownLines,
  tableCell,
  withoutCodeSpans,
} from './markdown.mjs';

const fencedLines = (text: string): readonly number[] =>
  markdownLines(text)
    .filter(({ fenced }) => fenced)
    .map(({ line }) => line);

describe('markdownLines', () => {
  test('marks a fenced block, its fences included', () => {
    assert.deepStrictEqual(
      fencedLines(dedent`
        prose
        \`\`\`sh
        code
        \`\`\`
        prose
      `),
      [2, 3, 4],
    );
  });

  test('closes a fence only with the same character, as long or longer', () => {
    assert.deepStrictEqual(
      fencedLines(dedent`
        ~~~~md
        \`\`\`
        ~~~
        ~~~~~
        prose
      `),
      [1, 2, 3, 4],
    );
  });

  test('does not close a fence with one that has an info string', () => {
    assert.deepStrictEqual(
      fencedLines(dedent`
        \`\`\`md
        \`\`\`ts
        \`\`\`
        prose
      `),
      [1, 2, 3],
    );
  });

  test('reads an indented fence, as in a list item', () => {
    assert.deepStrictEqual(
      fencedLines(dedent`
        - item

          \`\`\`sh
          code
          \`\`\`

        prose
      `),
      [3, 4, 5],
    );
  });

  test('reads a line that starts with a code span of three backticks as prose', () => {
    assert.deepStrictEqual(
      fencedLines(dedent`
        \`\`\`ts\`\`\` と書く
        prose
      `),
      [],
    );
  });

  test('reads a fence in a blockquote or an alert', () => {
    assert.deepStrictEqual(
      fencedLines(dedent`
        > [!NOTE]
        > \`\`\`ts
        > code
        > \`\`\`
        prose
      `),
      [2, 3, 4],
    );
  });

  test('reads a document with CRLF line endings', () => {
    assert.deepStrictEqual(
      fencedLines('prose\r\n```\r\ncode\r\n```\r\nprose'),
      [2, 3, 4],
    );
  });

  test('gives each line 1-based, with its text', () => {
    assert.deepStrictEqual(markdownLines('a\nb'), [
      { line: 1, text: 'a', fenced: false },
      { line: 2, text: 'b', fenced: false },
    ]);
  });
});

describe('codeSpans', () => {
  test('reads spans of one and of two backticks, as CommonMark shows them', () => {
    // One space at each end of a span is stripped when both are there.
    assert.deepStrictEqual(codeSpans('`a` and `` b `` and ``c`d``'), [
      'a',
      'b',
      'c`d',
    ]);
  });

  test('reads a shorter run of backticks as part of the span (#3264)', () => {
    assert.deepStrictEqual(codeSpans('Write `` `docs/gone.md` `` there'), [
      '`docs/gone.md`',
    ]);
  });

  test('reads an escaped backtick as text (#3264)', () => {
    assert.deepStrictEqual(codeSpans('\\`docs/gone.md`'), []);

    assert.deepStrictEqual(codeSpans('\\`docs/gone.md\\` and `x`'), ['x']);
  });

  test('keeps spaces that are not at both ends, and a span of spaces', () => {
    assert.deepStrictEqual(codeSpans('` a` and `  `'), [' a', '  ']);
  });

  test('reads nothing from an unclosed span', () => {
    assert.deepStrictEqual(codeSpans('`a and b'), []);
  });

  test('agrees with codeSpanRanges on every span', () => {
    const line = 'x `` a`b `` y `c` \\`d` e';

    assert.strictEqual(codeSpans(line).length, codeSpanRanges(line).length);
  });
});

describe('withoutCodeSpans', () => {
  test('takes the spans out and leaves the rest', () => {
    assert.strictEqual(
      withoutCodeSpans('see `[x](./a.md)` and [y](./b.md)'),
      'see  and [y](./b.md)',
    );
  });

  test('takes out a span holding a shorter run of backticks whole (#3264)', () => {
    assert.strictEqual(
      withoutCodeSpans('see `` `[x](./a.md)` `` and [y](./b.md)'),
      'see  and [y](./b.md)',
    );
  });

  test('leaves an escaped backtick and what follows it as text (#3264)', () => {
    assert.strictEqual(
      withoutCodeSpans('see \\`[x](./a.md)\\` and `y`.'),
      'see \\`[x](./a.md)\\` and .',
    );
  });
});

describe('tableCell', () => {
  test('puts the text on one line and escapes its pipes', () => {
    assert.strictEqual(tableCell(' a ||\n b | c '), String.raw`a \|\| b \| c`);
  });

  test('doubles a backslash before a pipe, so that it does not free it, and no other', () => {
    assert.strictEqual(
      tableCell(String.raw`a\|b \r\n`),
      String.raw`a\\\|b \r\n`,
    );
  });
});

describe('codeSpanRanges', () => {
  test('gives where each span is, its backticks included', () => {
    assert.deepStrictEqual(codeSpanRanges('a `b` c `` d`e ``'), [
      { start: 2, end: 5 },
      { start: 8, end: 17 },
    ]);
  });

  test('reads an escaped backtick as text', () => {
    assert.deepStrictEqual(codeSpanRanges('a \\` b `c`'), [
      { start: 7, end: 10 },
    ]);
  });
});
