/**
 * What `assert.deepStrictEqual` and `expect(...).toStrictEqual` actually do,
 * pinned as executable tests.
 *
 * These tests assert nothing about the lint rules in this directory. They
 * exist because the trade-off behind `no-expect-to-strict-equal` is not
 * self-evident from the two names: `deepStrictEqual` reads like Node.js's
 * `node:assert` function of the same name, which *does* compare prototypes,
 * and Vitest's is a different function that does not. What the rule buys in
 * exchange is a compile-time check that `toStrictEqual` does not perform at
 * all. If a future Vitest or Chai release moves either side, these fail and
 * the rule's rationale gets revisited instead of silently going stale.
 *
 * `expect(...)` is written in its `.not` form throughout, because the direct
 * form is what `no-expect-to-strict-equal` and
 * `prefer-assert-is-true-over-expect-true` forbid in this repository. It says
 * the same thing: `.not.toStrictEqual` passing *is* `toStrictEqual` rejecting
 * the pair.
 */

import { expectType } from 'ts-data-forge';

/** Two structurally identical shapes that differ only in their prototype. */
class Point {
  readonly x: number = 1;

  readonly y: number = 2;
}

class Vector {
  readonly x: number = 1;

  readonly y: number = 2;
}

const narrowedByAssert = (value: boolean): true => {
  assert.isTrue(value);

  return value;
};

const notNarrowedByExpect = (value: boolean): true => {
  expect(value).not.toBe(false);

  // @ts-expect-error no `expect` matcher is a TypeScript assertion signature
  const narrowed: true = value;

  return narrowed;
};

test('Vitest `assert.deepStrictEqual` is Chai `deepEqual`, not the Node.js function of that name', () => {
  // Not merely equivalent — the same function object. `@types/chai` documents
  // `deepStrictEqual` as "Alias to deepEqual", so the `Strict` in the name
  // distinguishes it from nothing at all. (`chai` is reached through the
  // global rather than through the narrowed `assert` global, which drops
  // `deepEqual`; see the last test in this file.)
  assert.isTrue(chai.assert.deepStrictEqual === chai.assert.deepEqual);

  // `strictEqual` and `equal`, by contrast, really are two different
  // functions — the alias-looking name is not a reliable signal either way.
  assert.isFalse(chai.assert.strictEqual === chai.assert.equal);
});

test('`assert.deepStrictEqual` ignores the prototype; `toStrictEqual` does not', () => {
  const point = new Point();

  // A class instance and a plain object literal of the same shape are equal.
  assert.deepStrictEqual(point, { x: 1, y: 2 });

  expect(point).not.toStrictEqual({ x: 1, y: 2 });

  // So are two instances of unrelated classes.
  assert.deepStrictEqual(point, new Vector());

  expect(point).not.toStrictEqual(new Vector());
});

test('the two agree that an `undefined`-valued key differs from an absent one', () => {
  const withUndefinedValue: Readonly<{ a: number; b?: number }> = {
    a: 1,
    b: undefined,
  } as const;

  const withoutKey: Readonly<{ a: number; b?: number }> = { a: 1 } as const;

  assert.throws(() => {
    assert.deepStrictEqual(withUndefinedValue, withoutKey);
  });

  expect(withUndefinedValue).not.toStrictEqual(withoutKey);
});

test('the two agree on `Map`, `Set`, `NaN` and `-0`', () => {
  assert.deepStrictEqual(new Map([[1, 2]]), new Map([[1, 2]]));

  assert.deepStrictEqual(new Set([1]), new Set([1]));

  // `NaN` is equal to itself, and `0` is not equal to `-0`, in both.
  assert.deepStrictEqual(Number.NaN, Number.NaN);

  assert.throws(() => {
    assert.deepStrictEqual(0, -0);
  });

  expect({ zero: 0 }).not.toStrictEqual({ zero: -0 });
});

test('`assert.deepStrictEqual` type-checks its two arguments; `toStrictEqual` does not', () => {
  // `deepStrictEqual: <T>(actual: T, expected: T) => void` binds both
  // arguments to one type parameter, so a mismatched pair does not compile.
  assert.throws(() => {
    // @ts-expect-error `'1'` is not assignable to the `number` inferred from `1`
    assert.deepStrictEqual(1, '1');
  });

  // `toStrictEqual: <E>(expected: E) => void` leaves `E` unconstrained, so the
  // same mismatch compiles. The *absence* of a `@ts-expect-error` on the next
  // line is the assertion — adding one would itself become an error. (The
  // values are wrapped in objects only because `vitest/prefer-to-be` sends
  // bare primitives to `toBe`.)
  expect({ value: 1 }).not.toStrictEqual({ value: '1' });
});

test('`assert.isTrue` narrows the type; no `expect` matcher does', () => {
  assert.isTrue(narrowedByAssert(true));

  assert.isTrue(notNarrowedByExpect(true));
});

test("Chai's loose APIs are unreachable through the `assert` global, which is narrowed", () => {
  // `chai.assert.equal` is `==`, not `===`. It is a trap the narrowed global
  // removes outright rather than something a lint rule has to catch.
  const one: unknown = 1;

  const oneAsString: unknown = '1';

  chai.assert.equal(one, oneAsString);

  assert.throws(() => {
    assert.strictEqual(one, oneAsString);
  });

  // None of the loose members survive on the global: `equal` / `notEqual`
  // (`==`), `deepEqual` (the very function `deepStrictEqual` aliases, kept
  // under one name only), and `ok` / `notOk` / `isOk` / `isNotOk`
  // (truthiness rather than `true` / `false`). See `vitest-globals.d.ts`.
  expectType<
    keyof typeof assert &
      (
        'deepEqual' | 'equal' | 'isNotOk' | 'isOk' | 'notEqual' | 'notOk' | 'ok'
      ),
    never
  >('=');
});
