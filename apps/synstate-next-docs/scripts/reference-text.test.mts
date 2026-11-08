import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  checkOperatorKindConditions,
  describeEnglish,
  extractJsdoc,
  extractOperatorKinds,
  firstSentence,
  operatorKindText,
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

describe(extractOperatorKinds, () => {
  test('reads the kind an arrow function returns', () => {
    const source = dedent`
      export const take =
        <A,>(count: number): KeepInitialValueOperator<A, A> =>
        (source) => view(source);
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'take'), ['Keep']);
  });

  test('reads one kind per overload, in the order written', () => {
    const source = dedent`
      export function takeWhile<A>(
        predicate: (value: A) => boolean,
        options: Readonly<{ inclusive: true }>,
      ): KeepInitialValueOperator<A, A>;

      export function takeWhile<A>(
        predicate: (value: A) => boolean,
        options?: TakeWhileOptions,
      ): DropInitialValueOperator<A, A>;

      export function takeWhile<A>(
        predicate: (value: A) => boolean,
        options?: TakeWhileOptions,
      ): KeepInitialValueOperator<A, A> | DropInitialValueOperator<A, A> {
        return (source) => view(source);
      }
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'takeWhile'), [
      'Keep',
      'Drop',
    ]);
  });

  test('gives one kind for overloads that return the same kind', () => {
    const source = dedent`
      export function filter<A, B extends A>(
        predicate: (value: A) => value is B,
      ): DropInitialValueOperator<A, B>;

      export function filter<A>(
        predicate: (value: A) => boolean,
      ): DropInitialValueOperator<A, A>;
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'filter'), ['Drop']);
  });

  test('does not take an operator type that types a parameter', () => {
    const source = dedent`
      export const apply =
        <A,>(op: ProvideInitialValueOperator<A, A>): DropInitialValueOperator<A, A> =>
        (source) => op(source);
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'apply'), ['Drop']);
  });

  test('gives none for a declaration that is not an operator, or is missing', () => {
    const source = 'export const state = <A,>(initialValue: A): State<A> => s;';

    assert.deepStrictEqual(extractOperatorKinds(source, 'state'), []);

    assert.deepStrictEqual(extractOperatorKinds(source, 'other'), []);

    assert.deepStrictEqual(
      extractOperatorKinds('export function f(): void {}', 'f'),
      [],
    );
  });

  test('reads overloads that no blank line separates', () => {
    const source = dedent`
      export function f<A>(o: Readonly<{ x: true }>): KeepInitialValueOperator<A, A>;
      export function f<A>(o?: O): DropInitialValueOperator<A, A>;
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), ['Keep', 'Drop']);
  });

  test('reads an overload followed by a comment on its last line', () => {
    const source = dedent`
      export function f<A>(o: Readonly<{ x: true }>): KeepInitialValueOperator<A, A>; // kept

      export function f<A>(o?: O): DropInitialValueOperator<A, A>;
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), ['Keep', 'Drop']);
  });

  test('does not read the implementation signature after overloads', () => {
    const source = dedent`
      export function f<A>(p: P<A>): DropInitialValueOperator<A, A>;

      export function f<A>(
        p: P<A>,
      ): KeepInitialValueOperator<A, A> | DropInitialValueOperator<A, A> {
        return g(p);
      }
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), ['Drop']);
  });

  test('reads an operator type whose output has braces or an arrow', () => {
    const source = dedent`
      export const f = <A,>(): KeepInitialValueOperator<A, Readonly<{ a: () => A }>> =>
        (source) => g(source);
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), ['Keep']);
  });

  test('reads every kind of a union a single signature returns', () => {
    const source = dedent`
      export function f<A>(
        p: P<A>,
      ): KeepInitialValueOperator<A, A> | DropInitialValueOperator<A, A> {
        return g(p);
      }
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), ['Keep', 'Drop']);
  });

  test('reads overloads with a blank line inside a parameter list', () => {
    const source = dedent`
      export function f<A>(
        p: P<A>,

        o: Readonly<{ x: true }>,
      ): KeepInitialValueOperator<A, A>;

      export function f<A>(p: P<A>): DropInitialValueOperator<A, A>;
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), ['Keep', 'Drop']);
  });

  test('does not take a declaration whose name only begins the same', () => {
    const source = dedent`
      export const takeWhileX = (): KeepInitialValueOperator<A, A> => f;
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'takeWhile'), []);
  });
});

describe('extractOperatorKinds through wrappers and exports', () => {
  test.each([
    [
      'parentheses and satisfies',
      'export const f = (<A,>(): KeepInitialValueOperator<A, A> => g) satisfies F;',
    ],
    [
      'as',
      'export const f = (<A,>(): KeepInitialValueOperator<A, A> => g) as F;',
    ],
    [
      'a function expression',
      'export const f = function <A>(): KeepInitialValueOperator<A, A> { return g; };',
    ],
    [
      '<T>',
      'export const f = <F>(<A,>(): KeepInitialValueOperator<A, A> => g);',
    ],
    ['!', 'export const f = (<A,>(): KeepInitialValueOperator<A, A> => g)!;'],
  ] as const)('reads a const through %s', (_, source) => {
    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), ['Keep']);
  });

  test('reads only exported declarations', () => {
    const source = dedent`
      /** Does f. */
      const f = <A,>(): KeepInitialValueOperator<A, A> => g;
      export { f };
    `;

    assert.deepStrictEqual(extractOperatorKinds(source, 'f'), []);

    const result = extractJsdoc(source, 'f');

    assert.isTrue(Result.isErr(result));

    assert.match(result.value, /no exported declaration/u);
  });
});

describe(operatorKindText, () => {
  const sentences = {
    Keep: 'Keeps it.',
    Drop: 'Drops it.',
    Provide: 'Provides it.',
  } as const;

  test('gives the sentence of a single kind', () => {
    assert.strictEqual(
      operatorKindText('en', sentences, ['Keep'], undefined),
      'Keeps it.',
    );
  });

  test('lists each kind after its condition, the one without last', () => {
    assert.strictEqual(
      operatorKindText('en', sentences, ['Drop', 'Keep'], {
        Keep: { en: 'With `x`', ja: '`x` を付けると' },
      }),
      ['- With `x`, keeps it.', '- Otherwise, drops it.'].join('\n'),
    );

    assert.strictEqual(
      operatorKindText('ja', sentences, ['Drop', 'Keep'], {
        Keep: { en: 'With `x`', ja: '`x` を付けると' },
      }),
      ['- `x` を付けると、Keeps it.', '- それ以外は、Drops it.'].join('\n'),
    );
  });
});

describe(checkOperatorKindConditions, () => {
  const keep = { Keep: { en: 'With `x`', ja: '`x` を付けると' } } as const;

  test('accepts conditions for all kinds but one', () => {
    assert.deepStrictEqual(
      checkOperatorKindConditions('p', ['Keep', 'Drop'], keep),
      [],
    );
  });

  test('accepts no conditions for one kind or none', () => {
    assert.deepStrictEqual(
      checkOperatorKindConditions('p', ['Drop'], undefined),
      [],
    );

    assert.deepStrictEqual(checkOperatorKindConditions('p', [], undefined), []);
  });

  test('refuses conditions for a single kind, or no operator', () => {
    assert.match(
      checkOperatorKindConditions('p', ['Keep'], keep)[0] ?? '',
      /one kind of operator: remove them/u,
    );

    assert.match(
      checkOperatorKindConditions('p', [], keep)[0] ?? '',
      /no operator: remove them/u,
    );
  });

  test('asks for conditions when several kinds have none', () => {
    assert.match(
      checkOperatorKindConditions('p', ['Keep', 'Drop'], undefined)[0] ?? '',
      /give operatorKindConditions/u,
    );
  });

  test('asks to leave one out when every kind has a condition', () => {
    assert.match(
      checkOperatorKindConditions('p', ['Keep', 'Drop'], {
        ...keep,
        Drop: { en: 'Else', ja: 'ほか' },
      })[0] ?? '',
      /leave out the one that holds otherwise/u,
    );
  });

  test('refuses a condition for a kind not returned', () => {
    assert.match(
      checkOperatorKindConditions('p', ['Keep', 'Drop'], {
        ...keep,
        Provide: { en: 'Never', ja: 'なし' },
      })[0] ?? '',
      /for Provide, which it does not return/u,
    );
  });
});

describe('extractJsdoc on overloads', () => {
  test('refuses overloads whose JSDoc differ', () => {
    const source = dedent`
      /** Does a. */
      export function f(a: A): B;

      /** Does b. */
      export function f(a?: A): B;
    `;

    const result = extractJsdoc(source, 'f');

    assert.isTrue(Result.isErr(result));
  });

  test('reads JSDoc that a line comment separates from its overload', () => {
    const source = dedent`
      /** Does a. */
      export function f(a: A): B;

      /** Does b. */
      // A note.
      export function f(a?: A): B;
    `;

    const result = extractJsdoc(source, 'f');

    assert.isTrue(Result.isErr(result));

    assert.match(result.value, /overloads whose JSDoc differ/u);
  });

  test('reads the JSDoc of exported declarations only', () => {
    const source = dedent`
      /** Not this. */
      const f = 1;

      /** Does a. */
      export class f {}
    `;

    assert.deepStrictEqual(extractJsdoc(source, 'f'), Result.ok('Does a.'));
  });

  test('gives the JSDoc of a const that declares several to the first only', () => {
    const source = dedent`
      /** Doc of a. */
      export const a = 1,
        f = 2;
    `;

    assert.deepStrictEqual(extractJsdoc(source, 'a'), Result.ok('Doc of a.'));

    assert.isTrue(Result.isErr(extractJsdoc(source, 'f')));
  });

  test('takes overloads whose JSDoc are the same', () => {
    const source = dedent`
      /** Does a. */
      export function f(a: A): B;

      /** Does a. */
      export function f(a?: A): B;
    `;

    assert.deepStrictEqual(extractJsdoc(source, 'f'), Result.ok('Does a.'));
  });
});
