import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  describeEnglish,
  extractJsdoc,
  firstSentence,
  readDescription,
  setDescription,
  textVersion,
} from './reference-text.mjs';

const jsdocOf = (lines: readonly string[]): string =>
  [
    '/**',
    ...lines.map((line) => (line === '' ? ' *' : ` * ${line}`)),
    ' */',
    'export const f = 1;',
  ].join('\n');

describe(extractJsdoc, () => {
  test('puts each paragraph on one line and leaves out a code fence', () => {
    const result = extractJsdoc(
      jsdocOf([
        'Takes `a` and',
        'gives `b`, and so on.',
        '',
        '```ts',
        'f();',
        '```',
        '',
        'A second paragraph.',
      ]),
      'f',
    );

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(
      result.value,
      'Takes `a` and gives `b`, and so on.\n\nA second paragraph.',
    );
  });

  test.each([
    ['a wrapped line that starts with `2.`', ['Counts up from', '2. Then on.']],
    ['a brace in a code span', ['Returns `{ ok, value }`.']],
    ['a brace in a double-backtick span', ['Matches ``{ ` }`` here.']],
    ['a link', ['See [the guide](/guide/).']],
    ['a word with a colon', ['Keys look like owner:root.']],
  ] as const)('keeps %s', (_, lines) => {
    assert.isTrue(Result.isOk(extractJsdoc(jsdocOf(lines), 'f')));
  });

  test.each([
    ['a list after a lead sentence', ['Returns either:', '- the value, or']],
    ['a numbered list', ['1. First,', '2. then.']],
    ['a bare brace', ['Returns {x} at once.']],
    ['a brace after unmatched backticks', ['Odd `` {x} ` here.']],
    ['a brace after escaped backticks', [String.raw`Odd \`{x}\` here.`]],
    ['a JSX tag', ['Renders <b>bold</b>.']],
    ['ESM', ['import x from y']],
    ['a heading inside a paragraph', ['Text', '# Heading']],
    ['a tilde fence', ['~~~ts', 'f();', '~~~']],
    ['an aside', [':::note', 'Text', ':::']],
    ['a quote', ['> quoted']],
  ] as const)('refuses %s', (_, lines) => {
    assert.isTrue(Result.isErr(extractJsdoc(jsdocOf(lines), 'f')));
  });

  test('refuses a declaration with no JSDoc', () => {
    assert.isTrue(Result.isErr(extractJsdoc('export const f = 1;', 'f')));
  });
});

describe(readDescription, () => {
  test.each([
    ["description: 'It''s here.'", "It's here."],
    [String.raw`description: "Say \"hi\"."`, 'Say "hi".'],
    ['description: Plain text.', 'Plain text.'],
    ["description: 'Wrapped\n  on two lines.'", 'Wrapped on two lines.'],
    ['description: >-\n  Folded\n  text.', 'Folded text.'],
  ] as const)('reads %j', (yaml, expected) => {
    assert.strictEqual(
      readDescription(`---\ntitle: T\n${yaml}\n---\n\nBody.\n`),
      expected,
    );
  });

  test.each([
    ['an empty frontmatter', '---\n---\n\ndescription: In the body.\n'],
    ['no frontmatter', 'description: In the body.\n'],
    ['an empty description', "---\ndescription: ''\n---\n"],
  ] as const)('reads nothing from %s', (_, page) => {
    assert.isUndefined(readDescription(page));
  });
});

describe(setDescription, () => {
  test('sets a one-line description, single-quoted', () => {
    const page = dedent`
      ---
      title: T
      description: Old.
      ---

      description: in the body stays.
    `;

    assert.strictEqual(
      setDescription(page, "It's new."),
      dedent`
        ---
        title: T
        description: 'It''s new.'
        ---

        description: in the body stays.
      `,
    );
  });

  test.each([
    ['a wrapped description', "---\ndescription: 'Wrapped\n  on two.'\n---\n"],
    ['a block scalar', '---\ndescription: >-\n  Folded.\n---\n'],
    ['no description', '---\ntitle: T\n---\n'],
    ['no frontmatter', 'Body.\n'],
  ] as const)('refuses %s', (_, page) => {
    assert.isUndefined(setDescription(page, 'New.'));
  });
});

describe(firstSentence, () => {
  test.each([
    ['One. Two.', 'One.'],
    ['Reads `a.b` first. Then more.', 'Reads `a.b` first.'],
    ['No full stop', 'No full stop'],
    ['Spans\nlines. Next.', 'Spans lines.'],
  ] as const)('reads %j', (text, expected) => {
    assert.strictEqual(firstSentence(text), expected);
  });
});

describe(textVersion, () => {
  test('changes with the text and only with it', () => {
    assert.strictEqual(textVersion('a'), textVersion('a'));

    assert.notStrictEqual(textVersion('a'), textVersion('b'));

    assert.match(textVersion('a'), /^[0-9a-f]{12}$/u);
  });
});

describe(describeEnglish, () => {
  const page = "---\ntitle: T\ndescription: 'By hand.'\n---\n";

  test('a page of one export takes the first sentence, and translates the JSDoc', () => {
    const result = describeEnglish(page, 'First. Second.', true);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, {
      page: "---\ntitle: T\ndescription: 'First.'\n---\n",
      text: 'First. Second.',
    });
  });

  test('a page of several keeps its description, and translates it with the JSDoc', () => {
    const result = describeEnglish(page, 'JSDoc.', false);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, {
      page,
      text: 'By hand.\n\nJSDoc.',
    });
  });

  test.each([
    [true, '---\ntitle: T\n---\n'],
    [false, '---\ntitle: T\n---\n'],
    [false, '---\ndescription: 404\n---\n'],
  ] as const)(
    'refuses a page with no description (one export: %s)',
    (single, noDescription) => {
      assert.isTrue(
        Result.isErr(describeEnglish(noDescription, 'JSDoc.', single)),
      );
    },
  );
});
