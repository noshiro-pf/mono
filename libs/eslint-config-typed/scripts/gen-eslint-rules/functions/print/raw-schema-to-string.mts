import { Arr } from 'ts-data-forge';
import type { JSONSchema4 } from '../type.mjs';

/**
 * スキーマ定義を JSDoc コメントの code block として整形する
 */
export const rawSchemaToString = (
  rawSchema: JSONSchema4 | readonly JSONSchema4[] | undefined,
): readonly string[] =>
  rawSchema === undefined
    ? ([] as const)
    : ([
        '  /**',
        '   * ### schema',
        '   *',
        '   * ```json',

        JSON.stringify(rawSchema, null, 2)
          .split('\n')
          .map((line) => `  * ${line}`)
          .join('\n'),
        '  * ```',
        '  */',
      ] as const);

/**
 * `schemaLines` (from {@link rawSchemaToString}) put in front of `code`. When
 * `code` opens with a JSDoc block — `json-schema-to-typescript` writes the
 * schema's `description` above the `Options` type — the schema joins that block
 * rather than standing as one of its own above it, which TypeScript attaches to
 * nothing (`ts-restrictions/no-detached-jsdoc`).
 */
export const withSchemaDoc = (
  schemaLines: readonly string[],
  code: string,
): readonly string[] => {
  const leadingDoc = /^\s*\/\*\*(?!\/)[^\S\n]*\n?/u.exec(code);

  if (leadingDoc === null || !Arr.isNonEmpty(schemaLines)) {
    return Arr.toPushed(schemaLines, code);
  }

  const rest = code.slice(leadingDoc[0].length);

  return [
    ...Arr.butLast(schemaLines),
    '   *',
    leadingDoc[0].endsWith('\n') ? rest : `   * ${rest}`,
  ];
};

if (import.meta.vitest !== undefined) {
  describe(withSchemaDoc, () => {
    const schemaLines = rawSchemaToString({ type: 'string' });

    test('merges the schema into the JSDoc the code opens with', () => {
      expect(
        withSchemaDoc(
          schemaLines,
          '/**\n * Doc.\n */\nexport type Options = string;',
        ).join('\n'),
      ).toBe(
        [
          ...Arr.butLast(schemaLines),
          '   *',
          ' * Doc.\n */\nexport type Options = string;',
        ].join('\n'),
      );
    });

    test('merges the schema into a one-line JSDoc', () => {
      assert.isTrue(
        withSchemaDoc(schemaLines, '/** Doc. */\nexport type Options = string;')
          .join('\n')
          .endsWith('   *\n   * Doc. */\nexport type Options = string;'),
      );
    });

    test('keeps the schema block when the code opens with no JSDoc', () => {
      assert.deepStrictEqual(
        withSchemaDoc(schemaLines, 'export type Options = string;'),
        Arr.toPushed(schemaLines, 'export type Options = string;'),
      );
    });

    test('adds nothing when there is no schema', () => {
      assert.deepStrictEqual(
        withSchemaDoc([], '/** Doc. */\nexport type Options = string;'),
        ['/** Doc. */\nexport type Options = string;'],
      );
    });
  });
}
