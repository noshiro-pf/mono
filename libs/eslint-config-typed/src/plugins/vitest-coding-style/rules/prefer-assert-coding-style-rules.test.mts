import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferAssertNotOkOverAssertIsNotOkRule } from './prefer-assert-not-ok-over-assert-is-not-ok.mjs';
import { preferAssertNotOkOverExpectFalseRule } from './prefer-assert-not-ok-over-expect-false.mjs';
import { preferAssertOverAssertOkRule } from './prefer-assert-over-assert-ok.mjs';
import { preferAssertOverExpectTrueRule } from './prefer-assert-over-expect-true.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

ruleTester.run(
  'prefer-assert-not-ok-over-expect-false',
  preferAssertNotOkOverExpectFalseRule,
  {
    valid: [
      { code: 'assert.notOk(0);' },
      { code: 'expect(0).toBe(true);' },
      { code: 'expect(0).toEqual(false);' },
    ],
    invalid: [
      {
        code: 'expect(Array.isArray({})).toBe(false);',
        output: 'assert.notOk(Array.isArray({}));',
        errors: [{ messageId: 'preferAssertNotOkOverExpectFalse' }],
      },
    ],
  },
);

ruleTester.run(
  'prefer-assert-over-expect-true',
  preferAssertOverExpectTrueRule,
  {
    valid: [
      { code: 'assert(0);' },
      { code: 'expect(0).toBe(false);' },
      { code: 'expect(0).toEqual(true);' },
      // Non-boolean argument
      { code: 'expect(123).toBe(true);' },
    ],
    invalid: [
      {
        code: 'expect(Array.isArray([{}])).toBe(true);',
        output: 'assert(Array.isArray([{}]));',
        errors: [{ messageId: 'preferAssertOverExpectTrue' }],
      },
    ],
  },
);

ruleTester.run('prefer-assert-over-assert-ok', preferAssertOverAssertOkRule, {
  valid: [
    { code: 'assert(0);' },
    { code: 'assert.notOk(0);' },
    { code: 'foo.ok(0);' },
  ],
  invalid: [
    {
      code: 'assert.ok(Array.isArray([]));',
      output: 'assert(Array.isArray([]));',
      errors: [{ messageId: 'preferAssertOverAssertOk' }],
    },
    {
      code: 'assert.isOk(Array.isArray([]));',
      output: 'assert(Array.isArray([]));',
      errors: [{ messageId: 'preferAssertOverAssertOk' }],
    },
  ],
});

ruleTester.run(
  'prefer-assert-not-ok-over-assert-is-not-ok',
  preferAssertNotOkOverAssertIsNotOkRule,
  {
    valid: [
      { code: 'assert(0);' },
      { code: 'assert.notOk(0);' },
      { code: 'foo.isNotOk(0);' },
    ],
    invalid: [
      {
        code: 'assert.isNotOk(Array.isArray([]));',
        output: 'assert.notOk(Array.isArray([]));',
        errors: [{ messageId: 'preferAssertOverAssertNotOk' }],
      },
    ],
  },
);
