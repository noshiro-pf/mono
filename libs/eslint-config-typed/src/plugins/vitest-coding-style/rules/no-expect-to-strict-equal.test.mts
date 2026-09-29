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
