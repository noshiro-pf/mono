/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable unicorn/consistent-function-scoping */

import { noop } from './noop.mjs';

describe('vitest-coding-style', () => {
  // dummy values

  const customAssert = {
    ok: (_arg: unknown) => {},
    isNotOk: (_arg: unknown) => {},
    deepEqual: (_a: unknown, _b: unknown) => {},
  } as const;

  const type: boolean = typeof noop === 'function';

  const a = {};

  const b = {};

  const foo = true as boolean;

  const condition = (): boolean => true;

  // ---

  test('valid', () => {
    assert.isTrue(foo);

    assert.isFalse(type);

    assert.isTrue(Array.isArray([]));
  });

  test('removed APIs', () => {
    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert
    assert(foo);

    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert
    assert.ok(foo);

    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-false-over-assert-not-ok
    assert.notOk(type);

    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert
    assert.ok(Array.isArray([]));
  });

  test('expect(non-boolean).toBe(boolean)', () => {
    expect(0).toBe(true);

    expect(0).toBe(false);

    expect(123).toBe(true);
  });

  test('expect(boolean).toBe(boolean)', () => {
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-false-over-expect-false
    expect(Array.isArray({})).toBe(false);

    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-expect-true
    expect(Array.isArray([{}]) satisfies boolean).toBe(true);
  });

  // eslint-disable-next-line vitest/expect-expect
  test('customAssert is ignored', () => {
    customAssert.ok(0);

    customAssert.isNotOk(0);

    customAssert.deepEqual(a, b);
  });

  test('prefer-assert-is-true-over-assert', () => {
    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert
    assert.isOk(Array.isArray([]));

    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-assert
    assert.ok(Array.isArray([]));
  });

  test('prefer-assert-is-false-over-assert-not-ok', () => {
    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-false-over-assert-not-ok
    assert.isNotOk(Array.isArray([]));

    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-false-over-assert-not-ok
    assert.notOk(Array.isArray([]));
  });

  test('prefer-assert-deep-strict-equal-over-deep-equal', () => {
    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-deep-strict-equal-over-deep-equal
    assert.deepEqual(a, b, 'message');

    // @ts-expect-error removed in OverriddenAssert
    // eslint-disable-next-line vitest-coding-style/prefer-assert-deep-strict-equal-over-deep-equal
    assert.deepEqual(a, b);

    assert.deepStrictEqual(a, b);
  });

  test('prefer-assert-is-false-over-negated-assert-is-true', () => {
    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-false-over-negated-assert-is-true
    assert.isTrue(!foo);
  });

  test('prefer-assert-is-true-over-negated-assert-is-false', () => {
    assert.isFalse(foo);

    assert.isFalse(foo);

    // eslint-disable-next-line vitest-coding-style/prefer-assert-is-true-over-negated-assert-is-false
    assert.isFalse(!condition());
  });
});
