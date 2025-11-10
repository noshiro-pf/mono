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
