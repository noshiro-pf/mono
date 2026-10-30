import dedent from 'dedent';
import { codeSpans, markdownLines, withoutCodeSpans } from './markdown.mjs';

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
  test('reads spans of one and of two backticks', () => {
    assert.deepStrictEqual(codeSpans('`a` and `` b `` and ``c`d``'), [
      'a',
      ' b ',
    ]);
  });

  test('reads nothing from an unclosed span', () => {
    assert.deepStrictEqual(codeSpans('`a and b'), []);
  });
});

describe('withoutCodeSpans', () => {
  test('takes the spans out and leaves the rest', () => {
    assert.strictEqual(
      withoutCodeSpans('see `[x](./a.md)` and [y](./b.md)'),
      'see  and [y](./b.md)',
    );
  });
});
