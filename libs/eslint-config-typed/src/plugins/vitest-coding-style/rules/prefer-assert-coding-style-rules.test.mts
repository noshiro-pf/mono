import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { preferAssertDeepStrictEqualOverDeepEqualRule } from './prefer-assert-deep-strict-equal-over-deep-equal.mjs';
import { preferAssertIsFalseOverNegatedAssertIsTrueRule } from './prefer-assert-is-false-over-assert-negation.mjs';
import { preferAssertIsFalseOverAssertNotOkRule } from './prefer-assert-is-false-over-assert-not-ok.mjs';
import { preferAssertIsFalseOverExpectFalseRule } from './prefer-assert-is-false-over-expect-false.mjs';
import { preferAssertIsTrueOverAssertRule } from './prefer-assert-is-true-over-assert.mjs';
import { preferAssertIsTrueOverExpectTrueRule } from './prefer-assert-is-true-over-expect-true.mjs';

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
  'prefer-assert-deep-strict-equal-over-deep-equal',
  preferAssertDeepStrictEqualOverDeepEqualRule,
  {
    valid: [
      { code: 'assert.deepStrictEqual(a, b);' },
      { code: 'foo.deepEqual(a, b);' },
    ],
    invalid: [
      {
        code: 'assert.deepEqual(a, b, "message");',
        output: 'assert.deepStrictEqual(a, b, "message");',
        errors: [{ messageId: 'preferAssertDeepStrictEqual' }],
      },
      {
        code: 'assert.deepEqual(a, b);',
        output: 'assert.deepStrictEqual(a, b);',
        errors: [{ messageId: 'preferAssertDeepStrictEqual' }],
      },
    ],
  },
);

ruleTester.run(
  'prefer-assert-is-over-expect-true',
  preferAssertIsTrueOverExpectTrueRule,
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
        output: 'assert.isTrue(Array.isArray([{}]));',
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
      { code: 'assert.notOk(0);' },
      { code: 'expect(0).toBe(true);' },
      { code: 'expect(0).toEqual(false);' },
    ],
    invalid: [
      {
        code: 'expect(Array.isArray({})).toBe(false);',
        output: 'assert.isFalse(Array.isArray({}));',
        errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
      },
    ],
  },
);

ruleTester.run(
  'prefer-assert-is-true-over-assert',
  preferAssertIsTrueOverAssertRule,
  {
    valid: [
      { code: 'assert.isTrue(0);' },
      { code: 'assert.notOk(0);' },
      { code: 'foo.ok(0);' },
    ],
    invalid: [
      {
        code: 'assert.isOk(Array.isArray([]));',
        output: 'assert.isTrue(Array.isArray([]));',
        errors: [{ messageId: 'preferAssertIsTrueOverAssert' }],
      },
      {
        code: 'assert.ok(Array.isArray([]));',
        output: 'assert.isTrue(Array.isArray([]));',
        errors: [{ messageId: 'preferAssertIsTrueOverAssert' }],
      },
      {
        code: 'assert(Array.isArray([]));',
        output: 'assert.isTrue(Array.isArray([]));',
        errors: [{ messageId: 'preferAssertIsTrueOverAssert' }],
      },
    ],
  },
);

ruleTester.run(
  'prefer-assert-is-false-over-assert-is-not-ok',
  preferAssertIsFalseOverAssertNotOkRule,
  {
    valid: [
      { code: 'assert(0);' },
      { code: 'assert.isFalse(0);' },
      { code: 'foo.isNotOk(0);' },
    ],
    invalid: [
      {
        code: 'assert.isNotOk(Array.isArray([]));',
        output: 'assert.isFalse(Array.isArray([]));',
        errors: [{ messageId: 'preferAssertIsFalseOverAssertNotOk' }],
      },
      {
        code: 'assert.notOk(Array.isArray([]));',
        output: 'assert.isFalse(Array.isArray([]));',
        errors: [{ messageId: 'preferAssertIsFalseOverAssertNotOk' }],
      },
    ],
  },
);

ruleTester.run(
  'prefer-assert-is-false-over-negated-assert-is-true',
  preferAssertIsFalseOverNegatedAssertIsTrueRule,
  {
    valid: [
      { code: 'assert.notOk(foo);' },
      { code: 'assert(!foo, );' },
      { code: 'expect(!foo).toBeTruthy();' },
      { code: 'assert(foo);' },
    ],
    invalid: [
      {
        code: 'assert.isTrue(!foo);',
        output: 'assert.isFalse(foo);',
        errors: [{ messageId: 'preferAssertIsFalseOverAssertNegation' }],
      },
      {
        code: 'assert.isTrue(!condition());',
        output: 'assert.isFalse(condition());',
        errors: [{ messageId: 'preferAssertIsFalseOverAssertNegation' }],
      },
    ],
  },
);

describe('chai API', () => {
  test('assert truthy', () => {
    // @ts-expect-error truthy value is ok
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert, total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-call
    assert.isOk(1 as unknown as boolean);

    assert.isTrue(true);

    // @ts-expect-error truthy value is ok
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert, total-functions/no-unsafe-type-assertion
    assert(1 as unknown as boolean);
  });
});
