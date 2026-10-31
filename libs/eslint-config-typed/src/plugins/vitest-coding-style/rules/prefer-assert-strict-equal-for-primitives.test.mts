import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferAssertStrictEqualForPrimitivesRule } from './prefer-assert-strict-equal-for-primitives.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

describe('prefer-assert-strict-equal-for-primitives', () => {
  ruleTester.run(
    'prefer-assert-strict-equal-for-primitives',
    preferAssertStrictEqualForPrimitivesRule,
    {
      valid: [
        {
          name: 'already strictEqual',
          code: dedent`
            declare const s: string;
            assert.strictEqual(s, 'a');
          `,
        },
        {
          name: 'objects and arrays',
          code: dedent`
            declare const o: Readonly<{ a: number }>;
            declare const xs: readonly string[];
            assert.deepStrictEqual(o, { a: 1 });
            assert.deepStrictEqual(xs, ['a']);
          `,
        },
        {
          name: 'a union with an object member',
          code: dedent`
            declare const x: string | readonly string[];
            assert.deepStrictEqual(x, 'a');
          `,
        },
        {
          name: 'unknown, any and an unresolved type parameter',
          code: dedent`
            declare const u: unknown;
            assert.deepStrictEqual(u, 'a');
            declare const x: any;
            assert.deepStrictEqual(x, 'a');
            const f = <T,>(t: T, s: T): void => {
              assert.deepStrictEqual(t, s);
            };
          `,
        },
        {
          name: '`assert` bound to something other than Vitest’s',
          code: dedent`
            import assert from 'node:assert';
            declare const s: string;
            assert.deepStrictEqual(s, 'a');
          `,
        },
        {
          name: 'a method of another object',
          code: dedent`
            declare const s: string;
            declare const foo: Readonly<{
              deepStrictEqual: (a: string, b: string) => void;
            }>;
            foo.deepStrictEqual(s, 'a');
          `,
        },
        {
          name: 'fewer than two arguments, or a spread',
          code: dedent`
            declare const args: readonly [string, string];
            // @ts-expect-error
            assert.deepStrictEqual('a');
            // @ts-expect-error
            assert.deepStrictEqual(...args);
          `,
        },
        {
          name: 'not called',
          code: dedent`
            const f = assert.deepStrictEqual;
          `,
        },
      ],
      invalid: [
        {
          name: 'strings',
          code: dedent`
            declare const s: string;
            assert.deepStrictEqual(s, 'a');
          `,
          output: dedent`
            declare const s: string;
            assert.strictEqual(s, 'a');
          `,
          errors: [{ messageId: 'preferStrictEqual' }],
        },
        {
          name: 'booleans, bigints, symbols, null and undefined',
          code: dedent`
            declare const b: boolean;
            declare const n: bigint;
            declare const sym: symbol;
            declare const v: string | null | undefined;
            assert.deepStrictEqual(b, true);
            assert.deepStrictEqual(n, 1n);
            assert.deepStrictEqual(sym, sym);
            assert.deepStrictEqual(v, undefined);
          `,
          output: dedent`
            declare const b: boolean;
            declare const n: bigint;
            declare const sym: symbol;
            declare const v: string | null | undefined;
            assert.strictEqual(b, true);
            assert.strictEqual(n, 1n);
            assert.strictEqual(sym, sym);
            assert.strictEqual(v, undefined);
          `,
          errors: [
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
          ],
        },
        {
          name: 'string literal, template literal and enum types',
          code: dedent`
            enum Color {
              Red = 'red',
            }
            declare const c: Color;
            declare const t: \`id-\${string}\`;
            declare const l: 'a' | 'b';
            assert.deepStrictEqual(c, Color.Red);
            assert.deepStrictEqual(t, 'id-1');
            assert.deepStrictEqual(l, 'a');
          `,
          output: dedent`
            enum Color {
              Red = 'red',
            }
            declare const c: Color;
            declare const t: \`id-\${string}\`;
            declare const l: 'a' | 'b';
            assert.strictEqual(c, Color.Red);
            assert.strictEqual(t, 'id-1');
            assert.strictEqual(l, 'a');
          `,
          errors: [
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
          ],
        },
        {
          name: 'a branded string is a string at run time',
          code: dedent`
            declare const id: string & Readonly<{ __brand: 'Id' }>;
            assert.deepStrictEqual(id, id);
          `,
          output: dedent`
            declare const id: string & Readonly<{ __brand: 'Id' }>;
            assert.strictEqual(id, id);
          `,
          errors: [{ messageId: 'preferStrictEqual' }],
        },
        {
          name: 'a number compared with a non-zero number literal, which is neither NaN nor a zero',
          code: dedent`
            enum Level {
              Low = 1,
            }
            declare const n: number;
            declare const l: Level;
            declare const x: string | number;
            assert.deepStrictEqual(n, 1);
            assert.deepStrictEqual(-1.5, n);
            assert.deepStrictEqual(l, Level.Low);
            assert.deepStrictEqual(x, 'a');
          `,
          output: dedent`
            enum Level {
              Low = 1,
            }
            declare const n: number;
            declare const l: Level;
            declare const x: string | number;
            assert.strictEqual(n, 1);
            assert.strictEqual(-1.5, n);
            assert.strictEqual(l, Level.Low);
            assert.strictEqual(x, 'a');
          `,
          errors: [
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
          ],
        },
        {
          name: 'two numbers that may both be NaN or a zero are only suggested',
          code: dedent`
            declare const n: number;
            declare const m: number;
            assert.deepStrictEqual(n, m);
          `,
          output: null,
          errors: [
            {
              messageId: 'preferStrictEqualForNumber',
              suggestions: [
                {
                  messageId: 'replaceWithStrictEqual',
                  output: dedent`
                    declare const n: number;
                    declare const m: number;
                    assert.strictEqual(n, m);
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'the literal 0 may be -0, and a branded number may be anything',
          code: dedent`
            declare const i: number & Readonly<{ __brand: 'Int' }>;
            declare const z: 0 | 1;
            assert.deepStrictEqual(i, i);
            assert.deepStrictEqual(z, 0);
          `,
          output: null,
          errors: [
            {
              messageId: 'preferStrictEqualForNumber',
              suggestions: [
                {
                  messageId: 'replaceWithStrictEqual',
                  output: dedent`
                    declare const i: number & Readonly<{ __brand: 'Int' }>;
                    declare const z: 0 | 1;
                    assert.strictEqual(i, i);
                    assert.deepStrictEqual(z, 0);
                  `,
                },
              ],
            },
            {
              messageId: 'preferStrictEqualForNumber',
              suggestions: [
                {
                  messageId: 'replaceWithStrictEqual',
                  output: dedent`
                    declare const i: number & Readonly<{ __brand: 'Int' }>;
                    declare const z: 0 | 1;
                    assert.deepStrictEqual(i, i);
                    assert.strictEqual(z, 0);
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'imported from Vitest under an alias keeps the local name',
          code: dedent`
            import { assert as a } from 'vitest';
            declare const s: string;
            a.deepStrictEqual(s, 'a');
          `,
          output: dedent`
            import { assert as a } from 'vitest';
            declare const s: string;
            a.strictEqual(s, 'a');
          `,
          errors: [{ messageId: 'preferStrictEqual' }],
        },
        {
          name: 'a type argument is kept',
          code: dedent`
            declare const s: string;
            assert.deepStrictEqual<string>(s, 'a');
          `,
          output: dedent`
            declare const s: string;
            assert.strictEqual<string>(s, 'a');
          `,
          errors: [{ messageId: 'preferStrictEqual' }],
        },
      ],
    },
  );
});

describe('prefer-assert-strict-equal-for-primitives through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-strict-equal-for-primitives',
    preferAssertStrictEqualForPrimitivesRule,
    {
      valid: [
        {
          name: 'an object asserted to be a string is still compared deeply',
          code: dedent`
            declare const o: Readonly<{ a: number }>;
            assert.deepStrictEqual(o as unknown as string, 'a');
            assert.deepStrictEqual('a', o as unknown as string);
          `,
        },
        {
          name: 'unknown asserted to be a string vouches for nothing',
          code: dedent`
            declare const u: unknown;
            assert.deepStrictEqual(u as string, 'a');
          `,
        },
        {
          name: 'a wrapped receiver that is not Vitest’s',
          code: dedent`
            import { assert } from './my-helpers.mjs';
            declare const s: string;
            (assert as typeof assert).deepStrictEqual(s, 'a');
          `,
        },
      ],
      invalid: [
        {
          name: 'a wrapped receiver, method or call',
          code: dedent`
            declare const s: string;
            (assert as typeof assert).deepStrictEqual(s, 'a');
            assert.deepStrictEqual!(s, 'a');
            (assert.deepStrictEqual satisfies unknown)(s, 'a');
          `,
          output: dedent`
            declare const s: string;
            (assert as typeof assert).strictEqual(s, 'a');
            assert.strictEqual!(s, 'a');
            (assert.strictEqual satisfies unknown)(s, 'a');
          `,
          errors: [
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
          ],
        },
        {
          name: 'wrapped arguments keep their wrappers',
          code: dedent`
            declare const s: string | undefined;
            assert.deepStrictEqual(s!, 'a' as string);
            assert.deepStrictEqual(s satisfies string | undefined, undefined);
          `,
          output: dedent`
            declare const s: string | undefined;
            assert.strictEqual(s!, 'a' as string);
            assert.strictEqual(s satisfies string | undefined, undefined);
          `,
          errors: [
            { messageId: 'preferStrictEqual' },
            { messageId: 'preferStrictEqual' },
          ],
        },
        {
          name: 'a literal asserted onto a number vouches for nothing',
          code: dedent`
            declare const n: number;
            assert.deepStrictEqual(n as 1, n as 1);
          `,
          output: null,
          errors: [
            {
              messageId: 'preferStrictEqualForNumber',
              suggestions: [
                {
                  messageId: 'replaceWithStrictEqual',
                  output: dedent`
                    declare const n: number;
                    assert.strictEqual(n as 1, n as 1);
                  `,
                },
              ],
            },
          ],
        },
      ],
    },
  );
});

/**
 * Why two numbers get only a suggestion unless one side rules out `NaN` and the
 * zeros. If a Chai release moves either side, these fail and the exception is
 * revisited.
 */
describe('deepStrictEqual and strictEqual disagree on NaN and -0 only', () => {
  test('NaN equals itself under deepStrictEqual, not under strictEqual', () => {
    assert.doesNotThrow(() => {
      // eslint-disable-next-line vitest-coding-style/prefer-assert-strict-equal-for-primitives -- pins the NaN case itself
      assert.deepStrictEqual(Number.NaN, Number.NaN);
    });

    assert.throws(() => {
      assert.strictEqual(Number.NaN, Number.NaN);
    });
  });

  test('-0 differs from 0 under deepStrictEqual, not under strictEqual', () => {
    assert.throws(() => {
      // eslint-disable-next-line vitest-coding-style/prefer-assert-strict-equal-for-primitives -- pins the -0 case itself
      assert.deepStrictEqual(-0, 0);
    });

    assert.doesNotThrow(() => {
      assert.strictEqual(-0, 0);
    });
  });
});
