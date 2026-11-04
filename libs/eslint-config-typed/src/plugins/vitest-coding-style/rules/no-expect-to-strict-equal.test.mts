import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noExpectToStrictEqualRule } from './no-expect-to-strict-equal.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
  valid: [
    {
      code: 'assert.deepStrictEqual(actual, expected);',
    },
    {
      code: 'expect(actual).toBe(expected);',
    },
    {
      code: 'something.expect(actual).toStrictEqual(expected);',
    },
  ],
  invalid: [
    {
      code: 'expect(actual).toStrictEqual(expected);',
      output: 'assert.deepStrictEqual(actual, expected);',
      errors: [{ messageId: 'useAssert' }],
    },
    {
      code: dedent`
        expect(resultError[0]).toStrictEqual<ValidationError>({
          foo: 'bar',
        });
      `,
      output: dedent`
        assert.deepStrictEqual(resultError[0], ({
          foo: 'bar',
        }) as ValidationError);
      `,
      errors: [{ messageId: 'useAssert' }],
    },
  ],
});

describe('no-expect-to-strict-equal through type wrappers', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [
      {
        name: 'a wrapped callee that is not expect',
        code: '(something as typeof expect)(actual).toStrictEqual(expected);',
      },
    ],
    invalid: [
      {
        name: 'a wrapped expect call or expect function',
        code: dedent`
          expect(actual)!.toStrictEqual(expected);
          (expect as typeof expect)(actual).toStrictEqual(expected);
          expect!(actual).toStrictEqual(expected);
          expect(actual).toStrictEqual!(expected);
        `,
        output: dedent`
          assert.deepStrictEqual(actual, expected);
          assert.deepStrictEqual(actual, expected);
          assert.deepStrictEqual(actual, expected);
          assert.deepStrictEqual(actual, expected);
        `,
        errors: [
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
          { messageId: 'useAssert' },
        ],
      },
      {
        name: 'wrapped arguments keep their wrappers',
        code: 'expect(actual as Foo).toStrictEqual(expected satisfies Foo);',
        output:
          'assert.deepStrictEqual(actual as Foo, expected satisfies Foo);',
        errors: [{ messageId: 'useAssert' }],
      },
    ],
  });
});

describe('no-expect-to-strict-equal with parenthesized operands', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [],
    invalid: [
      {
        name: 'a sequence expression stays one argument',
        code: dedent`
          expect((setup(), actual)).toStrictEqual(expected);
          expect(actual).toStrictEqual((setup(), expected));
        `,
        output: dedent`
          assert.deepStrictEqual((setup(), actual), expected);
          assert.deepStrictEqual(actual, (setup(), expected));
        `,
        errors: [{ messageId: 'useAssert' }, { messageId: 'useAssert' }],
      },
    ],
  });
});

describe('no-expect-to-strict-equal resolves expect and assert', () => {
  tester.run('no-expect-to-strict-equal', noExpectToStrictEqualRule, {
    valid: [
      {
        name: 'Playwright’s expect',
        code: dedent`
          import { expect } from '@playwright/test';
          expect(actual).toStrictEqual(expected);
        `,
      },
      {
        name: 'toStrictEqual on something other than a call',
        code: 'matcher.toStrictEqual(expected);',
      },
      {
        name: 'a local expect',
        code: dedent`
          const expect = makeExpect();
          expect(actual).toStrictEqual(expected);
        `,
      },
    ],
    invalid: [
      {
        name: 'an expect aliased from vitest',
        code: dedent`
          import { assert, expect as e } from 'vitest';
          e(actual).toStrictEqual(expected);
        `,
        output: dedent`
          import { assert, expect as e } from 'vitest';
          assert.deepStrictEqual(actual, expected);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'an assert from node:assert in scope is reported, not fixed',
        code: dedent`
          import assert from 'node:assert';
          import { expect } from 'vitest';
          expect(actual).toStrictEqual(expected);
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'a local assert shadowing the global is reported, not fixed',
        code: dedent`
          export const f = (assert) => {
            expect(actual).toStrictEqual(expected);
          };
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'an assert from node:assert beside the expect global',
        code: dedent`
          import assert from 'node:assert';
          expect(actual).toStrictEqual(expected);
        `,
        output: null,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'no assert in scope beside an imported expect: the import gains it',
        code: dedent`
          import { expect } from 'vitest';
          expect(actual).toStrictEqual(expected);
        `,
        output: dedent`
          import { expect, assert } from 'vitest';
          assert.deepStrictEqual(actual, expected);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
      {
        name: 'several fixes in one file add the import once',
        code: dedent`
          import { expect } from 'vitest';
          expect(a).toStrictEqual(b);
          expect(c).toStrictEqual(d);
        `,
        output: [
          dedent`
            import { expect, assert } from 'vitest';
            assert.deepStrictEqual(a, b);
            expect(c).toStrictEqual(d);
          `,
          dedent`
            import { expect, assert } from 'vitest';
            assert.deepStrictEqual(a, b);
            assert.deepStrictEqual(c, d);
          `,
        ],
        errors: [{ messageId: 'useAssert' }, { messageId: 'useAssert' }],
      },
      {
        name: 'Vitest’s assert under an alias is written by its local name',
        code: dedent`
          import assert from 'node:assert';
          import { assert as va, expect } from 'vitest';
          expect(actual).toStrictEqual(expected);
        `,
        output: dedent`
          import assert from 'node:assert';
          import { assert as va, expect } from 'vitest';
          va.deepStrictEqual(actual, expected);
        `,
        errors: [{ messageId: 'useAssert' }],
      },
    ],
  });
});
