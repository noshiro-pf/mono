import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferAssertDeepStrictEqualOverDeepEqualRule } from './prefer-assert-deep-strict-equal-over-deep-equal.mjs';
import { preferAssertIsFalseOverNegatedAssertIsTrueRule } from './prefer-assert-is-false-over-assert-negation.mjs';
import { preferAssertIsFalseOverAssertNotOkRule } from './prefer-assert-is-false-over-assert-not-ok.mjs';
import { preferAssertIsFalseOverExpectFalseRule } from './prefer-assert-is-false-over-expect-false.mjs';
import { preferAssertIsTrueOverNegatedAssertIsFalseRule } from './prefer-assert-is-true-over-assert-negated-is-false.mjs';
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

describe('prefer-assert-deep-strict-equal-over-deep-equal through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-deep-strict-equal-over-deep-equal',
    preferAssertDeepStrictEqualOverDeepEqualRule,
    {
      valid: [
        {
          name: 'a wrapped receiver that is not Vitest’s',
          code: dedent`
            import assert from 'node:assert';
            (assert as typeof assert).deepEqual(a, b);
          `,
        },
        {
          name: 'a wrapped method that is not called',
          code: 'const f = assert.deepEqual satisfies unknown;',
        },
      ],
      invalid: [
        {
          name: 'a wrapped receiver or method keeps its wrapper',
          code: dedent`
            (assert as typeof assert).deepEqual(a, b);
            assert!.deepEqual(a, b);
            assert.deepEqual!(a, b);
            (assert.deepEqual satisfies unknown)(a, b);
          `,
          output: dedent`
            (assert as typeof assert).deepStrictEqual(a, b);
            assert!.deepStrictEqual(a, b);
            assert.deepStrictEqual!(a, b);
            (assert.deepStrictEqual satisfies unknown)(a, b);
          `,
          errors: [
            { messageId: 'preferAssertDeepStrictEqual' },
            { messageId: 'preferAssertDeepStrictEqual' },
            { messageId: 'preferAssertDeepStrictEqual' },
            { messageId: 'preferAssertDeepStrictEqual' },
          ],
        },
      ],
    },
  );
});

describe('prefer-assert-is-false-over-assert-is-not-ok through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-is-false-over-assert-is-not-ok',
    preferAssertIsFalseOverAssertNotOkRule,
    {
      valid: [],
      invalid: [
        {
          name: 'a wrapped receiver or method keeps its wrapper',
          code: dedent`
            (assert as typeof assert).notOk(x);
            assert!.isNotOk(x);
            assert.notOk!(x);
          `,
          output: dedent`
            (assert as typeof assert).isFalse(x);
            assert!.isFalse(x);
            assert.isFalse!(x);
          `,
          errors: [
            { messageId: 'preferAssertIsFalseOverAssertNotOk' },
            { messageId: 'preferAssertIsFalseOverAssertNotOk' },
            { messageId: 'preferAssertIsFalseOverAssertNotOk' },
          ],
        },
      ],
    },
  );
});

describe('prefer-assert-is-true-over-assert through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-is-true-over-assert',
    preferAssertIsTrueOverAssertRule,
    {
      valid: [
        {
          name: 'a wrapped receiver that is not Vitest’s',
          code: dedent`
            import assert from 'node:assert';
            (assert as typeof assert)(x);
            (assert as typeof assert).ok(x);
          `,
        },
      ],
      invalid: [
        {
          name: 'a wrapped receiver keeps its wrapper',
          code: dedent`
            (assert as typeof assert).ok(x);
            assert!.isOk(x);
          `,
          output: dedent`
            (assert as typeof assert).isTrue(x);
            assert!.isTrue(x);
          `,
          errors: [
            { messageId: 'preferAssertIsTrueOverAssert' },
            { messageId: 'preferAssertIsTrueOverAssert' },
          ],
        },
        {
          name: 'a wrapped bare callee is reported without a fix',
          code: dedent`
            (assert as typeof assert)(x);
            assert!(x);
          `,
          output: null,
          errors: [
            { messageId: 'preferAssertIsTrueOverAssert' },
            { messageId: 'preferAssertIsTrueOverAssert' },
          ],
        },
      ],
    },
  );
});

describe('prefer-assert-is-false-over-negated-assert-is-true through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-is-false-over-negated-assert-is-true',
    preferAssertIsFalseOverNegatedAssertIsTrueRule,
    {
      valid: [
        {
          name: 'a wrapped receiver that is not Vitest’s',
          code: dedent`
            import { assert } from './my-helpers.mjs';
            (assert as typeof assert).isTrue(!foo);
          `,
        },
      ],
      invalid: [
        {
          name: 'a wrapped negation',
          code: dedent`
            declare const flag: boolean;
            assert.isTrue(!flag as boolean);
            assert.isTrue((!flag) satisfies boolean);
            assert.isTrue(!flag!);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isFalse(flag);
            assert.isFalse(flag);
            assert.isFalse(flag!);
          `,
          errors: [
            { messageId: 'preferAssertIsFalseOverAssertNegation' },
            { messageId: 'preferAssertIsFalseOverAssertNegation' },
            { messageId: 'preferAssertIsFalseOverAssertNegation' },
          ],
        },
        {
          name: 'a wrapped receiver keeps its wrapper',
          code: dedent`
            (assert as typeof assert).isTrue(!foo);
            assert!.isTrue(!foo);
          `,
          output: dedent`
            (assert as typeof assert).isFalse(foo);
            assert!.isFalse(foo);
          `,
          errors: [
            { messageId: 'preferAssertIsFalseOverAssertNegation' },
            { messageId: 'preferAssertIsFalseOverAssertNegation' },
          ],
        },
      ],
    },
  );
});

describe('prefer-assert-is-false-over-negated-assert-is-true with parenthesized operands', () => {
  ruleTester.run(
    'prefer-assert-is-false-over-negated-assert-is-true',
    preferAssertIsFalseOverNegatedAssertIsTrueRule,
    {
      valid: [],
      invalid: [
        {
          name: 'a sequence expression stays one argument',
          code: 'assert.isTrue(!(setup(), flag));',
          output: 'assert.isFalse((setup(), flag));',
          errors: [{ messageId: 'preferAssertIsFalseOverAssertNegation' }],
        },
      ],
    },
  );
});

describe('prefer-assert-is-true-over-negated-assert-is-false', () => {
  ruleTester.run(
    'prefer-assert-is-true-over-negated-assert-is-false',
    preferAssertIsTrueOverNegatedAssertIsFalseRule,
    {
      valid: [
        { code: 'assert.isFalse(foo);' },
        { code: 'assert.isTrue(!foo);' },
        {
          code: dedent`
            import { assert } from './my-helpers.mjs';
            assert.isFalse(!foo);
          `,
        },
      ],
      invalid: [
        {
          code: 'assert.isFalse(!foo);',
          output: 'assert.isTrue(foo);',
          errors: [{ messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' }],
        },
        {
          code: dedent`
            import { assert as a } from 'vitest';
            a.isFalse(!foo);
          `,
          output: dedent`
            import { assert as a } from 'vitest';
            a.isTrue(foo);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' }],
        },
      ],
    },
  );
});

describe('prefer-assert-is-true-over-negated-assert-is-false through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-is-true-over-negated-assert-is-false',
    preferAssertIsTrueOverNegatedAssertIsFalseRule,
    {
      valid: [],
      invalid: [
        {
          name: 'a wrapped negation',
          code: dedent`
            declare const flag: boolean;
            assert.isFalse(!flag as boolean);
            assert.isFalse((!flag) satisfies boolean);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isTrue(flag);
            assert.isTrue(flag);
          `,
          errors: [
            { messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' },
            { messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' },
          ],
        },
        {
          name: 'a wrapped receiver keeps its wrapper',
          code: '(assert as typeof assert).isFalse(!foo);',
          output: '(assert as typeof assert).isTrue(foo);',
          errors: [{ messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' }],
        },
      ],
    },
  );
});

describe('prefer-assert-is-true-over-negated-assert-is-false with parenthesized operands', () => {
  ruleTester.run(
    'prefer-assert-is-true-over-negated-assert-is-false',
    preferAssertIsTrueOverNegatedAssertIsFalseRule,
    {
      valid: [],
      invalid: [
        {
          name: 'a sequence expression stays one argument',
          code: 'assert.isFalse(!(setup(), flag));',
          output: 'assert.isTrue((setup(), flag));',
          errors: [{ messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' }],
        },
      ],
    },
  );
});

describe('prefer-assert-is-true-over-expect-true through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-is-over-expect-true',
    preferAssertIsTrueOverExpectTrueRule,
    {
      valid: [
        {
          name: 'a wrapped callee that is not Vitest’s',
          code: dedent`
            import { expect } from './my-helpers.mjs';
            declare const flag: boolean;
            (expect as typeof expect)(flag).toBe(true);
          `,
        },
        {
          name: 'a wrapped literal that is not true',
          code: dedent`
            declare const flag: boolean;
            expect(flag).toBe(false as boolean);
          `,
        },
      ],
      invalid: [
        {
          name: 'a wrapped true',
          code: dedent`
            declare const flag: boolean;
            expect(flag).toBe(true as const);
            expect(flag).toBe(true satisfies boolean);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isTrue(flag);
            assert.isTrue(flag);
          `,
          errors: [
            { messageId: 'preferAssertIsTrueOverExpectTrue' },
            { messageId: 'preferAssertIsTrueOverExpectTrue' },
          ],
        },
        {
          name: 'a wrapped expect function or expect call',
          code: dedent`
            declare const flag: boolean;
            (expect as typeof expect)(flag).toBe(true);
            expect(flag)!.toBe(true);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isTrue(flag);
            assert.isTrue(flag);
          `,
          errors: [
            { messageId: 'preferAssertIsTrueOverExpectTrue' },
            { messageId: 'preferAssertIsTrueOverExpectTrue' },
          ],
        },
        {
          name: 'a wrapped argument keeps its wrapper',
          code: dedent`
            declare const flag: boolean;
            expect(flag satisfies boolean).toBe(true);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isTrue(flag satisfies boolean);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
      ],
    },
  );
});

describe('prefer-assert-is-true-over-expect-true with parenthesized operands', () => {
  ruleTester.run(
    'prefer-assert-is-over-expect-true',
    preferAssertIsTrueOverExpectTrueRule,
    {
      valid: [],
      invalid: [
        {
          name: 'a sequence expression stays one argument',
          code: dedent`
            declare const setup: () => void;
            declare const flag: boolean;
            expect((setup(), flag)).toBe(true);
          `,
          output: dedent`
            declare const setup: () => void;
            declare const flag: boolean;
            assert.isTrue((setup(), flag));
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
      ],
    },
  );
});

describe('prefer-assert-is-false-over-expect-false through type wrappers', () => {
  ruleTester.run(
    'prefer-assert-is-false-over-expect-false',
    preferAssertIsFalseOverExpectFalseRule,
    {
      valid: [
        {
          name: 'a wrapped literal that is not false',
          code: dedent`
            declare const flag: boolean;
            expect(flag).toBe(true as boolean);
          `,
        },
      ],
      invalid: [
        {
          name: 'a wrapped false, expect function or expect call',
          code: dedent`
            declare const flag: boolean;
            expect(flag).toBe(false as const);
            expect(flag).toBe(false satisfies boolean);
            (expect as typeof expect)(flag).toBe(false);
            expect(flag)!.toBe(false);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isFalse(flag);
            assert.isFalse(flag);
            assert.isFalse(flag);
            assert.isFalse(flag);
          `,
          errors: [
            { messageId: 'preferAssertIsFalseOverExpectFalse' },
            { messageId: 'preferAssertIsFalseOverExpectFalse' },
            { messageId: 'preferAssertIsFalseOverExpectFalse' },
            { messageId: 'preferAssertIsFalseOverExpectFalse' },
          ],
        },
      ],
    },
  );
});

describe('prefer-assert-is-false-over-expect-false with parenthesized operands', () => {
  ruleTester.run(
    'prefer-assert-is-false-over-expect-false',
    preferAssertIsFalseOverExpectFalseRule,
    {
      valid: [],
      invalid: [
        {
          name: 'a sequence expression stays one argument',
          code: dedent`
            declare const setup: () => void;
            declare const flag: boolean;
            expect((setup(), flag)).toBe(false);
          `,
          output: dedent`
            declare const setup: () => void;
            declare const flag: boolean;
            assert.isFalse((setup(), flag));
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
      ],
    },
  );
});
