// cspell:ignore adipiscing amet eiusmod elit incididunt tempor
import { applyRefills, unfilledRuns } from './paragraphs.mjs';

const lines = (...xs: readonly string[]): string => xs.join('\n');

/** Every line, so that the whole document is read. */
const everyLine = (): boolean => true;

/** `text` refilled at `printWidth`, reading every line. */
const refilled = (text: string, printWidth = 40): string =>
  applyRefills(text, unfilledRuns(text, everyLine, printWidth));

describe(unfilledRuns, () => {
  test('a filled paragraph has nothing to refill', () => {
    const text = lines(
      'Lorem ipsum dolor sit amet, consectetur',
      'adipiscing elit, sed do eiusmod tempor',
      'incididunt ut labore.',
    );

    assert.deepStrictEqual(unfilledRuns(text, everyLine, 40), []);
  });

  test('a line with room for the next word is reported at that line', () => {
    const text = lines(
      'Lorem ipsum dolor sit amet, consectetur',
      'adipiscing elit, sed',
      'do eiusmod tempor incididunt ut labore.',
    );

    assert.deepStrictEqual(
      unfilledRuns(text, everyLine, 40).map((r) => r.reportLine),
      [2],
    );

    assert.strictEqual(
      refilled(text),
      lines(
        'Lorem ipsum dolor sit amet, consectetur',
        'adipiscing elit, sed do eiusmod tempor',
        'incididunt ut labore.',
      ),
    );
  });

  test('a line past the width with a space to break at is reported', () => {
    const text = lines(
      'Lorem ipsum dolor sit amet, consectetur adipiscing',
      'elit sed do eiusmod.',
    );

    assert.strictEqual(
      refilled(text),
      lines(
        'Lorem ipsum dolor sit amet, consectetur',
        'adipiscing elit sed do eiusmod.',
      ),
    );
  });

  test('a paragraph on one line is left as it is, however long', () => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    assert.deepStrictEqual(unfilledRuns(text, everyLine, 40), []);
  });

  test('an MDX expression is one word, and an unbalanced brace is left alone', () => {
    assert.strictEqual(
      refilled(
        lines('Lorem ipsum {/* bench:a/b */}2.7{/* /bench */}×', 'dolor.'),
      ),
      lines('Lorem ipsum', '{/* bench:a/b */}2.7{/* /bench */}×', 'dolor.'),
    );

    const unbalanced = lines('Lorem ipsum {/*', 'bench */} dolor.');

    assert.deepStrictEqual(unfilledRuns(unbalanced, everyLine, 40), []);
  });

  test('only a paragraph with a touched line is read', () => {
    const text = lines(
      'Lorem ipsum dolor',
      'sit amet.',
      '',
      'Lorem ipsum dolor',
      'sit amet.',
    );

    assert.deepStrictEqual(
      unfilledRuns(text, (line: number) => line === 5, 40).map(
        (r) => r.firstLine,
      ),
      [4],
    );

    assert.deepStrictEqual(
      unfilledRuns(text, (line: number) => line === 3, 40),
      [],
    );
  });

  test('a list item is refilled under its marker', () => {
    const text = lines(
      '- Lorem ipsum dolor sit amet,',
      '  consectetur adipiscing elit, sed do eiusmod tempor.',
      '',
      '10. Lorem ipsum dolor sit amet,',
      '    consectetur adipiscing.',
    );

    assert.strictEqual(
      refilled(text),
      lines(
        '- Lorem ipsum dolor sit amet,',
        '  consectetur adipiscing elit, sed do',
        '  eiusmod tempor.',
        '',
        '10. Lorem ipsum dolor sit amet,',
        '    consectetur adipiscing.',
      ),
    );
  });

  test('a list item ends the paragraph above it', () => {
    const text = lines('Lorem ipsum dolor', '- sit amet.');

    assert.deepStrictEqual(unfilledRuns(text, everyLine, 40), []);
  });

  test('a quoted paragraph keeps its marker', () => {
    const text = lines('> Lorem ipsum dolor sit', '> amet, consectetur.');

    assert.strictEqual(
      refilled(text),
      '> Lorem ipsum dolor sit amet,\n> consectetur.',
    );
  });

  test('a deliberate break is left alone', () => {
    const text = lines(
      'Lorem ipsum dolor sit amet.',
      'consectetur adipiscing',
      'Elit sed do eiusmod.',
      '',
      'Lorem',
      'ipsum dolor sit amet,',
      'consectetur adipiscing,',
      '',
      'hard break\\',
      'tempor ipsum two spaces  ',
      'incididunt ut labore.',
    );

    assert.deepStrictEqual(unfilledRuns(text, everyLine, 40), []);
  });

  test('fences, headings, tables, HTML blocks and front matter are not read', () => {
    const text = lines(
      '---',
      'title: Lorem ipsum',
      'description: dolor',
      '---',
      '',
      '# Lorem ipsum',
      '',
      '```ts',
      'const a',
      '  = 1;',
      '```',
      '',
      '| a | b |',
      '| - | - |',
      '',
      '<details>',
      'Lorem ipsum',
      'dolor sit amet.',
      '</details>',
      '',
      '    indented',
      '    code',
      '',
      'Lorem ipsum',
      '===========',
    );

    assert.deepStrictEqual(unfilledRuns(text, everyLine, 40), []);
  });

  test('lines with a URL, East Asian text or an image are not refilled', () => {
    const text = lines(
      'Lorem ipsum https://example.com/a',
      'dolor sit amet.',
      '',
      'Lorem ipsum 日本語',
      'dolor sit amet.',
      '',
      'Lorem ipsum ![a](b.png)',
      'dolor sit amet.',
    );

    assert.deepStrictEqual(unfilledRuns(text, everyLine, 40), []);
  });

  test('a code span is one word, and an odd backtick count is left alone', () => {
    assert.strictEqual(
      refilled(
        lines('Lorem ipsum dolor', '`sit amet consectetur adipiscing` elit.'),
      ),
      lines('Lorem ipsum dolor', '`sit amet consectetur adipiscing` elit.'),
    );

    const odd = lines('Lorem ipsum `dolor', 'sit` amet.');

    assert.deepStrictEqual(unfilledRuns(odd, everyLine, 40), []);
  });

  test('a word that means something at a line start never begins one', () => {
    assert.strictEqual(
      refilled(lines('aaaa bbbb - cccc', 'dddd'), 10),
      lines('aaaa', 'bbbb -', 'cccc dddd'),
    );

    assert.strictEqual(
      refilled(lines('aaaa bbbb 1. cccc', 'dddd'), 10),
      lines('aaaa', 'bbbb 1.', 'cccc dddd'),
    );
  });

  test(String.raw`a document with \r\n line endings is not read`, () => {
    const text = 'Lorem ipsum\r\ndolor sit amet.';

    assert.deepStrictEqual(unfilledRuns(text, everyLine, 40), []);
  });

  test('a hard break at the end of a run is kept', () => {
    const text = lines('Lorem ipsum', 'dolor sit amet  ', 'consectetur.');

    assert.strictEqual(
      refilled(text),
      lines('Lorem ipsum dolor sit amet  ', 'consectetur.'),
    );
  });
});
