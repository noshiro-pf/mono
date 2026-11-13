import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noExpectToStrictEqualRule } from './no-expect-to-strict-equal.mjs';
import { preferAssertDeepStrictEqualOverDeepEqualRule } from './prefer-assert-deep-strict-equal-over-deep-equal.mjs';
import { preferAssertIsFalseOverExpectFalseRule } from './prefer-assert-is-false-over-expect-false.mjs';
import { preferAssertIsTrueOverExpectTrueRule } from './prefer-assert-is-true-over-expect-true.mjs';

// An `expect` (or `assert`) destructured from a test's context or from the
// in-source handle is Vitest's own, so the rules report it. The fixes cannot
// name an `assert` for it — the context has none, and the in-source handle is
// all an in-source test may reach Vitest through, so neither a global nor an
// added import is safe — so these are reported without one.

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

/** The in-source handle, built so that this file's text does not name it. */
const inSource = ['import', 'meta', 'vitest'].join('.');

describe('an expect destructured from the test context or the in-source handle', () => {
  ruleTester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [
      {
        name: 'a function that is not a Vitest test',
        code: dedent`
          runCase('x', ({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'a test imported from another module',
        code: dedent`
          import { test } from './fixtures.mjs';
          test('x', ({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'the second parameter of a test callback',
        code: dedent`
          test('x', (_, { expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'a nested destructuring of the context',
        code: dedent`
          test('x', ({ task: { expect } }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'a context expect with a default value',
        code: dedent`
          test('x', ({ expect = check }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'a function that is not passed to a call',
        code: dedent`
          const body = ({ expect }) => {
            expect(a).toStrictEqual(b);
          };
        `,
      },
      {
        name: 'a function passed where the test name goes',
        code: dedent`
          test(({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'a property of test that is not a modifier',
        code: dedent`
          test.extend('x', ({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'the callback of test.each, whose first parameter is the case',
        code: dedent`
          test.each([1])('x', ({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
      },
      {
        name: 'a variable destructured from another object',
        code: dedent`
          const { expect } = helpers;
          expect(a).toStrictEqual(b);
        `,
      },
      {
        name: 'a property of the handle under another name',
        code: dedent`
          const { assert: expect } = ${inSource};
          expect(a).toStrictEqual(b);
        `,
      },
    ],
    invalid: [
      {
        name: 'test.concurrent',
        code: dedent`
          test.concurrent('x', ({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'it, with an async callback',
        code: dedent`
          it('x', async ({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a test with options before the callback',
        code: dedent`
          test('x', { timeout: 100 }, function ({ expect }) {
            expect(a).toStrictEqual(b);
          });
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a callback passed through a type wrapper',
        code: dedent`
          test('x', (({ expect }) => {
            expect(a).toStrictEqual(b);
          }) satisfies TestFunction);
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a function expression with a this parameter',
        code: dedent`
          test('x', function (this: unknown, { expect }) {
            expect(a).toStrictEqual(b);
          });
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'an aliased context expect',
        code: dedent`
          test('x', ({ expect: e }) => {
            e(a).toStrictEqual(b);
          });
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a test imported from vitest under another name',
        code: dedent`
          import { test as spec } from 'vitest';
          spec.concurrent('x', ({ expect }) => {
            expect(a).toStrictEqual(b);
          });
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'the in-source handle',
        code: dedent`
          const { expect } = ${inSource};
          expect(a).toStrictEqual(b);
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'the in-source handle behind a non-null assertion',
        code: dedent`
          const { expect, test } = ${inSource}!;
          expect(a).toStrictEqual(b);
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
    ],
  });

  ruleTester.run(
    'prefer-assert-is-true-over-expect-true',
    preferAssertIsTrueOverExpectTrueRule,
    {
      valid: [
        {
          name: 'a function that is not a Vitest test',
          code: dedent`
            declare const flag: boolean;
            runCase('x', ({ expect }) => {
              expect(flag).toBe(true);
            });
          `,
        },
      ],
      invalid: [
        {
          name: 'test.concurrent',
          code: dedent`
            declare const flag: boolean;
            test.concurrent('x', ({ expect }) => {
              expect(flag).toBe(true);
            });
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'the in-source handle',
          code: dedent`
            declare const flag: boolean;
            const { expect } = ${inSource};
            expect(flag).toBe(true);
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
      ],
    },
  );

  ruleTester.run(
    'prefer-assert-is-false-over-expect-false',
    preferAssertIsFalseOverExpectFalseRule,
    {
      valid: [
        {
          name: 'a function that is not a Vitest test',
          code: dedent`
            declare const flag: boolean;
            runCase('x', ({ expect }) => {
              expect(flag).toBe(false);
            });
          `,
        },
      ],
      invalid: [
        {
          name: 'test.concurrent',
          code: dedent`
            declare const flag: boolean;
            test.concurrent('x', ({ expect }) => {
              expect(flag).toBe(false);
            });
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'the in-source handle',
          code: dedent`
            declare const flag: boolean;
            const { expect } = ${inSource};
            expect(flag).toBe(false);
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
      ],
    },
  );
});

describe('an assert destructured from the in-source handle', () => {
  ruleTester.run(
    'prefer-assert-deep-strict-equal-over-deep-equal',
    preferAssertDeepStrictEqualOverDeepEqualRule,
    {
      valid: [
        {
          name: 'the test context, which has no assert',
          code: dedent`
            test('x', ({ assert }) => {
              assert.deepEqual(a, b);
            });
          `,
        },
      ],
      invalid: [
        {
          name: 'renamed in place, as for the global',
          code: dedent`
            const { assert } = ${inSource};
            assert.deepEqual(a, b);
          `,
          output: dedent`
            const { assert } = ${inSource};
            assert.deepStrictEqual(a, b);
          `,
          errors: [{ messageId: 'preferAssertDeepStrictEqual' }],
        },
      ],
    },
  );
});
