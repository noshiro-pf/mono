import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
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
      // `assert` bound to something other than Vitest's.
      {
        code: dedent`
          import assert from 'node:assert';
          assert.deepEqual(a, b);
        `,
      },
      {
        code: dedent`
          import { assert } from './my-helpers.mjs';
          assert.deepEqual(a, b);
        `,
      },
      {
        code: dedent`
          const assert = makeAssert();
          assert.deepEqual(a, b);
        `,
      },
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
      // Imported explicitly from Vitest: the same value as the global.
      {
        code: dedent`
          import { assert } from 'vitest';
          assert.deepEqual(a, b);
        `,
        output: dedent`
          import { assert } from 'vitest';
          assert.deepStrictEqual(a, b);
        `,
        errors: [{ messageId: 'preferAssertDeepStrictEqual' }],
      },
      // Aliased: recognized through the imported name, and the fix keeps the
      // local one rather than naming a binding the file does not have.
      {
        code: dedent`
          import { assert as a } from 'vitest';
          a.deepEqual(x, y);
        `,
        output: dedent`
          import { assert as a } from 'vitest';
          a.deepStrictEqual(x, y);
        `,
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
      // `expect` bound to something other than Vitest's.
      {
        code: dedent`
          import { expect } from './my-helpers.mjs';
          expect(Array.isArray([])).toBe(true);
        `,
      },
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
      {
        code: dedent`
          import { expect } from './my-helpers.mjs';
          expect(Array.isArray({})).toBe(false);
        `,
      },
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
      // Node.js's `assert` is callable too, but has no `isTrue`.
      {
        code: dedent`
          import assert from 'node:assert';
          assert(Array.isArray([]));
        `,
      },
      {
        code: dedent`
          import { strict as assert } from 'node:assert';
          assert.ok(Array.isArray([]));
        `,
      },
      {
        code: dedent`
          const assert = (x) => x;
          assert(1);
        `,
      },
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
      {
        code: dedent`
          import { assert as a } from 'vitest';
          a.ok(Array.isArray([]));
        `,
        output: dedent`
          import { assert as a } from 'vitest';
          a.isTrue(Array.isArray([]));
        `,
        errors: [{ messageId: 'preferAssertIsTrueOverAssert' }],
      },
      {
        code: dedent`
          import { assert as a } from 'vitest';
          a(Array.isArray([]));
        `,
        output: dedent`
          import { assert as a } from 'vitest';
          a.isTrue(Array.isArray([]));
        `,
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
      {
        code: dedent`
          import { assert } from './my-helpers.mjs';
          assert.notOk(0);
        `,
      },
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
      {
        code: dedent`
          import { assert } from './my-helpers.mjs';
          assert.isTrue(!foo);
        `,
      },
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
      {
        code: dedent`
          import { assert as a } from 'vitest';
          a.isTrue(!foo);
        `,
        output: dedent`
          import { assert as a } from 'vitest';
          a.isFalse(foo);
        `,
        errors: [{ messageId: 'preferAssertIsFalseOverAssertNegation' }],
      },
    ],
  },
);

describe('chai API', () => {
  test('assert truthy', () => {
    // @ts-expect-error truthy value is ok
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert, @typescript-eslint/no-unsafe-call
    assert.isOk(1);

    assert.isTrue(true);

    // @ts-expect-error truthy value is ok
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert
    assert(1);
  });
});
