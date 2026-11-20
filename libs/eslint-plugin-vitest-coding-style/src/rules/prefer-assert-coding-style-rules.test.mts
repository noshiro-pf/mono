import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { Arr } from 'ts-data-forge';
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
      // Through an optional chain it is still the method called.
      {
        code: '(assert?.deepEqual)(a, b);',
        output: '(assert?.deepStrictEqual)(a, b);',
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
        code: dedent`
          declare const foo: boolean;
          assert.isTrue(!foo);
        `,
        output: dedent`
          declare const foo: boolean;
          assert.isFalse(foo);
        `,
        errors: [{ messageId: 'preferAssertIsFalseOverAssertNegation' }],
      },
      {
        code: dedent`
          declare const condition: () => boolean;
          assert.isTrue(!condition());
        `,
        output: dedent`
          declare const condition: () => boolean;
          assert.isFalse(condition());
        `,
        errors: [{ messageId: 'preferAssertIsFalseOverAssertNegation' }],
      },
      {
        code: dedent`
          import { assert as a } from 'vitest';
          declare const foo: boolean;
          a.isTrue(!foo);
        `,
        output: dedent`
          import { assert as a } from 'vitest';
          declare const foo: boolean;
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
            declare const x: boolean;
            (assert as typeof assert).notOk(x);
            assert!.isNotOk(x);
            assert.notOk!(x);
          `,
          output: dedent`
            declare const x: boolean;
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
        {
          name: 'a method read through an optional chain is still the callee',
          code: dedent`
            declare const x: boolean;
            (assert?.notOk)(x);
          `,
          output: dedent`
            declare const x: boolean;
            (assert?.isFalse)(x);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverAssertNotOk' }],
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
            declare const x: boolean;
            (assert as typeof assert).ok(x);
            assert!.isOk(x);
          `,
          output: dedent`
            declare const x: boolean;
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
            declare const x: boolean;
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
            declare const foo: boolean;
            (assert as typeof assert).isTrue(!foo);
            assert!.isTrue(!foo);
          `,
          output: dedent`
            declare const foo: boolean;
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
          code: dedent`
            declare const setup: () => void; declare const flag: boolean;
            assert.isTrue(!(setup(), flag));
          `,
          output: dedent`
            declare const setup: () => void; declare const flag: boolean;
            assert.isFalse((setup(), flag));
          `,
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
          code: dedent`
            declare const foo: boolean;
            assert.isFalse(!foo);
          `,
          output: dedent`
            declare const foo: boolean;
            assert.isTrue(foo);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' }],
        },
        {
          code: dedent`
            import { assert as a } from 'vitest';
            declare const foo: boolean;
            a.isFalse(!foo);
          `,
          output: dedent`
            import { assert as a } from 'vitest';
            declare const foo: boolean;
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
          code: dedent`
            declare const foo: boolean;
            (assert as typeof assert).isFalse(!foo);
          `,
          output: dedent`
            declare const foo: boolean;
            (assert as typeof assert).isTrue(foo);
          `,
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
          code: dedent`
            declare const setup: () => void; declare const flag: boolean;
            assert.isFalse(!(setup(), flag));
          `,
          output: dedent`
            declare const setup: () => void; declare const flag: boolean;
            assert.isTrue((setup(), flag));
          `,
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
        {
          name: 'a narrowing assertion does not make the value a boolean',
          code: dedent`
            declare const v: unknown;
            declare const maybe: boolean | undefined;
            expect(v as boolean).toBe(true);
            expect(maybe!).toBe(true);
          `,
        },
        {
          name: 'a widening cast is the author saying it may not be a boolean',
          code: dedent`
            declare const flag: boolean;
            expect(flag as boolean | undefined).toBe(true);
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
        {
          name: 'an argument that is a boolean at every layer',
          code: dedent`
            declare const flag: boolean;
            expect(flag as boolean).toBe(true);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isTrue(flag as boolean);
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
        {
          name: 'a narrowing assertion does not make the value a boolean',
          code: dedent`
            declare const v: unknown;
            declare const maybe: boolean | undefined;
            expect(v as boolean).toBe(false);
            expect(maybe!).toBe(false);
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

describe('expect-to-assert fixes resolve the assert they write', () => {
  ruleTester.run(
    'prefer-assert-is-false-over-expect-false',
    preferAssertIsFalseOverExpectFalseRule,
    {
      valid: [
        {
          name: 'expect with no argument has nothing to assert on',
          code: 'expect().toBe(false);',
        },
        {
          name: 'expect with a spread argument',
          code: dedent`
            declare const flags: readonly [boolean];
            expect(...flags).toBe(false);
          `,
        },
        {
          name: 'expect with more arguments than a value and a message',
          code: dedent`
            declare const flag: boolean;
            expect(flag, 'a', 'b').toBe(false);
          `,
        },
      ],
      invalid: [
        {
          name: 'the message argument of expect is kept',
          code: dedent`
            declare const flag: boolean;
            expect(flag, 'flag is unset').toBe(false);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isFalse(flag, 'flag is unset');
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'a namespace import of vitest reaches assert through it',
          code: dedent`
            import * as vt from 'vitest';
            import { expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(false);
          `,
          output: dedent`
            import * as vt from 'vitest';
            import { expect } from 'vitest';
            declare const flag: boolean;
            vt.assert.isFalse(flag);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'a type-only assert import becomes a value import',
          code: dedent`
            import { type assert, expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(false);
          `,
          output: dedent`
            import { assert, expect } from 'vitest';
            declare const flag: boolean;
            assert.isFalse(flag);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'an assert from node:assert in scope is reported, not fixed',
          code: dedent`
            import assert from 'node:assert';
            import { expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(false);
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'an assert from node:assert beside the expect global',
          code: dedent`
            import assert from 'node:assert';
            declare const flag: boolean;
            expect(flag).toBe(false);
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'a local assert shadowing the global is reported, not fixed',
          code: dedent`
            declare const flag: boolean;
            export const f = (assert: unknown): void => {
              expect(flag).toBe(false);
            };
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'no assert in scope beside an imported expect: the import gains it',
          code: dedent`
            import { expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(false);
          `,
          output: dedent`
            import { expect, assert } from 'vitest';
            declare const flag: boolean;
            assert.isFalse(flag);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'an aliased expect import gains assert, before a trailing comma',
          code: dedent`
            import { describe, expect as e, } from 'vitest';
            declare const flag: boolean;
            e(flag).toBe(false);
          `,
          output: dedent`
            import { describe, expect as e, assert, } from 'vitest';
            declare const flag: boolean;
            assert.isFalse(flag);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'Vitest’s assert under an alias is written by its local name',
          code: dedent`
            import assert from 'node:assert';
            import { assert as va, expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(false);
          `,
          output: dedent`
            import assert from 'node:assert';
            import { assert as va, expect } from 'vitest';
            declare const flag: boolean;
            va.isFalse(flag);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
        {
          name: 'Vitest’s assert imported under its own name',
          code: dedent`
            import { assert, expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(false);
          `,
          output: dedent`
            import { assert, expect } from 'vitest';
            declare const flag: boolean;
            assert.isFalse(flag);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverExpectFalse' }],
        },
      ],
    },
  );

  ruleTester.run(
    'prefer-assert-is-over-expect-true',
    preferAssertIsTrueOverExpectTrueRule,
    {
      valid: [
        {
          name: 'expect with no argument has nothing to assert on',
          code: 'expect().toBe(true);',
        },
        {
          name: 'expect with a spread argument',
          code: dedent`
            declare const flags: readonly [boolean];
            expect(...flags).toBe(true);
          `,
        },
        {
          name: 'expect with more arguments than a value and a message',
          code: dedent`
            declare const flag: boolean;
            expect(flag, 'a', 'b').toBe(true);
          `,
        },
      ],
      invalid: [
        {
          name: 'an assert from node:assert in scope is reported, not fixed',
          code: dedent`
            import assert from 'node:assert';
            import { expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(true);
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'a local assert shadowing the global is reported, not fixed',
          code: dedent`
            declare const flag: boolean;
            export const f = (assert: unknown): void => {
              expect(flag).toBe(true);
            };
          `,
          output: null,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'a namespace import of vitest reaches assert through it',
          code: dedent`
            import * as vt from 'vitest';
            import { expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(true);
          `,
          output: dedent`
            import * as vt from 'vitest';
            import { expect } from 'vitest';
            declare const flag: boolean;
            vt.assert.isTrue(flag);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'a type-only assert import becomes a value import',
          code: dedent`
            import { type assert, expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(true);
          `,
          output: dedent`
            import { assert, expect } from 'vitest';
            declare const flag: boolean;
            assert.isTrue(flag);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'a namespace import of vitest reaches assert past a shadowing local',
          code: dedent`
            import * as vt from 'vitest';
            declare const flag: boolean;
            export const f = (assert: unknown): void => {
              expect(flag).toBe(true);
            };
          `,
          output: dedent`
            import * as vt from 'vitest';
            declare const flag: boolean;
            export const f = (assert: unknown): void => {
              vt.assert.isTrue(flag);
            };
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'a type named assert does not shadow the global',
          code: dedent`
            type assert = number;
            declare const flag: boolean;
            expect(flag).toBe(true);
          `,
          output: dedent`
            type assert = number;
            declare const flag: boolean;
            assert.isTrue(flag);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'the message argument of expect is kept',
          code: dedent`
            declare const flag: boolean;
            expect(flag, 'flag is set').toBe(true);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isTrue(flag, 'flag is set');
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'a wrapped, aliased expect import gains assert',
          code: dedent`
            import { expect as e } from 'vitest';
            declare const flag: boolean;
            (e as typeof e)(flag).toBe(true);
          `,
          output: dedent`
            import { expect as e, assert } from 'vitest';
            declare const flag: boolean;
            assert.isTrue(flag);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'no assert in scope beside an imported expect: the import gains it',
          code: dedent`
            import { expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(true);
          `,
          output: dedent`
            import { expect, assert } from 'vitest';
            declare const flag: boolean;
            assert.isTrue(flag);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
        {
          name: 'Vitest’s assert under an alias is written by its local name',
          code: dedent`
            import { assert as va, expect } from 'vitest';
            declare const flag: boolean;
            expect(flag).toBe(true);
          `,
          output: dedent`
            import { assert as va, expect } from 'vitest';
            declare const flag: boolean;
            va.isTrue(flag);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverExpectTrue' }],
        },
      ],
    },
  );
});

// `assert.ok(X)` passes for any truthy `X` and `assert.isTrue(X)` for `true`
// alone, so the rename is written only when `X` is a boolean at every layer of
// its type wrappers; any other operand is reported and left as written.
describe('the assert-renaming rules fix a boolean operand only', () => {
  const NON_BOOLEAN_DECLARATIONS = dedent`
    declare const el: { id: string } | undefined;
    declare const label: string;
    declare const count: number;
    declare const u: unknown;
    declare const maybe: boolean | undefined;
    declare const flag: boolean;
  `;

  const NON_BOOLEAN_OPERANDS = [
    'el',
    'label',
    'count',
    'u',
    'maybe',
    'u as boolean',
    'flag as unknown as boolean',
    'flag as boolean | undefined',
    'maybe!',
  ] as const;

  ruleTester.run(
    'prefer-assert-is-true-over-assert',
    preferAssertIsTrueOverAssertRule,
    {
      valid: [],
      invalid: Arr.toUnshifted({
        name: 'a boolean, a comparison, and a boolean under satisfies',
        code: dedent`
          declare const flag: boolean;
          declare const a: number;
          assert(flag);
          assert.isOk(a === 1);
          assert.ok(flag satisfies boolean);
        `,
        output: dedent`
          declare const flag: boolean;
          declare const a: number;
          assert.isTrue(flag);
          assert.isTrue(a === 1);
          assert.isTrue(flag satisfies boolean);
        `,
        errors: [
          { messageId: 'preferAssertIsTrueOverAssert' },
          { messageId: 'preferAssertIsTrueOverAssert' },
          { messageId: 'preferAssertIsTrueOverAssert' },
        ],
      })(
        NON_BOOLEAN_OPERANDS.flatMap((operand) =>
          ['assert', 'assert.isOk', 'assert.ok'].map((call) => ({
            name: `${call}(${operand}) is reported without a fix`,
            code: `${NON_BOOLEAN_DECLARATIONS}\n${call}(${operand});`,
            output: null,
            errors: [{ messageId: 'assertWhatIsMeant' as const }],
          })),
        ),
      ),
    },
  );

  ruleTester.run(
    'prefer-assert-is-false-over-assert-is-not-ok',
    preferAssertIsFalseOverAssertNotOkRule,
    {
      valid: [],
      invalid: Arr.toUnshifted({
        name: 'a boolean and a comparison',
        code: dedent`
          declare const flag: boolean;
          assert.notOk(flag);
          assert.isNotOk(1 > 2);
        `,
        output: dedent`
          declare const flag: boolean;
          assert.isFalse(flag);
          assert.isFalse(1 > 2);
        `,
        errors: [
          { messageId: 'preferAssertIsFalseOverAssertNotOk' },
          { messageId: 'preferAssertIsFalseOverAssertNotOk' },
        ],
      })(
        NON_BOOLEAN_OPERANDS.flatMap((operand) =>
          ['assert.isNotOk', 'assert.notOk'].map((call) => ({
            name: `${call}(${operand}) is reported without a fix`,
            code: `${NON_BOOLEAN_DECLARATIONS}\n${call}(${operand});`,
            output: null,
            errors: [{ messageId: 'assertWhatIsMeant' as const }],
          })),
        ),
      ),
    },
  );

  ruleTester.run(
    'prefer-assert-is-false-over-negated-assert-is-true',
    preferAssertIsFalseOverNegatedAssertIsTrueRule,
    {
      valid: NON_BOOLEAN_OPERANDS.map((operand) => ({
        name: `assert.isTrue(!(${operand})) is already a strict boolean`,
        code: `${NON_BOOLEAN_DECLARATIONS}\nassert.isTrue(!(${operand}));`,
      })),
      invalid: [
        {
          name: 'a negated boolean',
          code: dedent`
            declare const flag: boolean;
            assert.isTrue(!flag);
          `,
          output: dedent`
            declare const flag: boolean;
            assert.isFalse(flag);
          `,
          errors: [{ messageId: 'preferAssertIsFalseOverAssertNegation' }],
        },
      ],
    },
  );

  ruleTester.run(
    'prefer-assert-is-true-over-negated-assert-is-false',
    preferAssertIsTrueOverNegatedAssertIsFalseRule,
    {
      valid: NON_BOOLEAN_OPERANDS.map((operand) => ({
        name: `assert.isFalse(!(${operand})) is already a strict boolean`,
        code: `${NON_BOOLEAN_DECLARATIONS}\nassert.isFalse(!(${operand}));`,
      })),
      invalid: [
        {
          name: 'a negated comparison',
          code: dedent`
            declare const a: number;
            assert.isFalse(!(a === 1));
          `,
          output: dedent`
            declare const a: number;
            assert.isTrue(a === 1);
          `,
          errors: [{ messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse' }],
        },
      ],
    },
  );
});

describe('the assert-renaming rules name the call they report', () => {
  ruleTester.run(
    'prefer-assert-is-true-over-assert',
    preferAssertIsTrueOverAssertRule,
    {
      valid: [{ name: 'no operand', code: 'assert.ok();' }],
      invalid: [
        {
          name: 'a wrapped bare callee and an aliased receiver, on a non-boolean',
          code: dedent`
            import { assert as check } from 'vitest';
            declare const el: { id: string } | undefined;
            (check as typeof check)(el);
            check.ok(el);
          `,
          output: null,
          errors: [
            {
              messageId: 'assertWhatIsMeant',
              data: { method: 'check', receiver: 'check' },
            },
            {
              messageId: 'assertWhatIsMeant',
              data: { method: 'check.ok', receiver: 'check' },
            },
          ],
        },
      ],
    },
  );

  ruleTester.run(
    'prefer-assert-is-false-over-assert-is-not-ok',
    preferAssertIsFalseOverAssertNotOkRule,
    {
      valid: [{ name: 'no operand', code: 'assert.notOk();' }],
      invalid: [
        {
          name: 'an aliased receiver, on a non-boolean',
          code: dedent`
            import { assert as check } from 'vitest';
            declare const el: { id: string } | undefined;
            check.isNotOk(el);
          `,
          output: null,
          errors: [
            {
              messageId: 'assertWhatIsMeant',
              data: { method: 'check.isNotOk', receiver: 'check' },
            },
          ],
        },
      ],
    },
  );
});

describe('the assert-renaming rules without type information', () => {
  const untypedTester = new RuleTester({
    languageOptions: { parser, parserOptions: { sourceType: 'module' } },
  });

  untypedTester.run(
    'prefer-assert-is-true-over-assert',
    preferAssertIsTrueOverAssertRule,
    {
      valid: [],
      invalid: [
        {
          name: 'reported without a fix, rather than throwing',
          code: 'assert(flag);',
          output: null,
          errors: [{ messageId: 'assertWhatIsMeant' }],
        },
      ],
    },
  );

  untypedTester.run(
    'prefer-assert-is-false-over-negated-assert-is-true',
    preferAssertIsFalseOverNegatedAssertIsTrueRule,
    {
      valid: [
        {
          name: 'left alone, rather than throwing',
          code: 'assert.isTrue(!flag);',
        },
      ],
      invalid: [],
    },
  );
});

describe('the assert-renaming rules under another parser', () => {
  // A parser that gives the rules an AST and no services at all.
  const servicelessTester = new RuleTester({
    languageOptions: {
      parser: {
        parse: (
          code: string,
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the parser's own options type
          options: Parameters<typeof parser.parse>[1],
        ) => parser.parse(code, options),
      },
      parserOptions: { sourceType: 'module' },
    },
  });

  servicelessTester.run(
    'prefer-assert-is-false-over-assert-is-not-ok',
    preferAssertIsFalseOverAssertNotOkRule,
    {
      valid: [],
      invalid: [
        {
          name: 'reported without a fix, rather than throwing',
          code: 'assert.notOk(flag);',
          output: null,
          errors: [{ messageId: 'assertWhatIsMeant' }],
        },
      ],
    },
  );
});
