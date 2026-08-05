import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type FixedLengthTuple,
  type MaxLengthArray,
  type MaxLengthOf,
  type MinLengthArray,
  type MinLengthOf,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import {
  asBoundedLengthArray,
  asFixedLengthArray,
  asMaxLengthArray,
  asMinLengthArray,
} from './array-utils-length-bounded-array-cast.mjs';
import { toFilled, toRangeFilled } from './array-utils-modification.mjs';
import { map, toReversed, toSorted } from './array-utils-transformation.mjs';

/**
 * Invariant-based coverage for the array -> array transforms.
 *
 * Rather than pinning an expected type for every (brand x shape x context)
 * combination — which is a large table whose expected side is easy to derive
 * from the implementation and therefore prove nothing — this asserts the small
 * set of properties every shape-preserving transform must satisfy, across a
 * fixed list of sample inputs that covers the axes.
 *
 * The properties are:
 *
 * 1. **Length** — the result reports the same `length` as the input.
 * 2. **Bounds** — a length brand on the input survives onto the result.
 * 3. **Generic context** — from a caller that is itself generic over the
 *    array, the result is assignable to the caller's own homomorphic mapping.
 *
 * Property 3 is the one with no coverage before this file, and is what the
 * `Arr.map` regression fixed in this PR violated: a conditional return type a
 * generic `Ar` cannot decide stays deferred, and its brand-carrying branch is
 * then not assignable to the caller's mapping.
 */

// The sample inputs. Between them they cover the axes: empty / singleton /
// fixed tuple / non-empty tuple / unbounded array on the shape axis, and
// unbranded / lower bound / upper bound / both / exact on the brand axis.
const emptyTuple: readonly [] = [] as const;

const singleton: readonly [1] = [1] as const;

const fixedTuple: readonly [1, 2, 3] = [1, 2, 3] as const;

const nonEmptyTuple: readonly [1, ...number[]] = [1, 2, 3] as const;

const plainArray: readonly number[] = [1, 2, 3] as const;

const lowerBounded: MinLengthArray<2, number> = asMinLengthArray(2, [1, 2, 3]);

const upperBounded: MaxLengthArray<5, number> = asMaxLengthArray(5, [1, 2, 3]);

const bounded: BoundedLengthArray<2, 5, number> = asBoundedLengthArray(
  2,
  5,
  [1, 2, 3],
);

const exactLength: FixedLengthArray<3, number> = asFixedLengthArray(
  3,
  [1, 2, 3],
);

/**
 * Property 3 — generic context.
 *
 * Each of these is an assertion by construction: the annotated return type is
 * the caller's own homomorphic mapping, so the declaration only compiles while
 * the transform reports something assignable to it. There is nothing to run.
 *
 * Only the transforms that satisfy this today are listed. `toSorted`,
 * `toSortedBy`, `toReversed`, `toUpdated`, `tail`, `butLast` and `zip` do not
 * yet — see the PR description for why each one resists the same fix. Add them
 * here as they are fixed; that is what makes this list the coverage record.
 */

const mapInGenericContext = <const T extends readonly number[]>(
  xs: T,
): Readonly<{ [K in keyof T]: string }> => map(xs, String);

const mapCurriedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): Readonly<{ [K in keyof T]: string }> => map(String)(xs);

const toFilledInGenericContext = <const T extends readonly number[]>(
  xs: T,
): Readonly<{ [K in keyof T]: 0 }> => toFilled(xs, 0);

const toFilledCurriedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): Readonly<{ [K in keyof T]: 0 }> => toFilled(0)(xs);

const toRangeFilledInGenericContext = <const T extends readonly number[]>(
  xs: T,
): Readonly<{ [K in keyof T]: number }> => toRangeFilled(xs, 0, [0, 1]);

describe('Arr shape invariants', () => {
  // The type-level assertions below are checked by `tsc`; this pins the same
  // property at runtime, so a transform that silently drops or adds an element
  // fails here even where the type says otherwise.
  test('every shape-preserving transform keeps the length at runtime', () => {
    const input = [3, 1, 2] as const;

    assert.deepStrictEqual<FixedLengthTuple<5, 3>>(
      [
        map(input, String).length,
        toFilled(input, 0).length,
        toRangeFilled(input, 0, [1, 2]).length,
        toSorted(input).length,
        toReversed(input).length,
      ] as const,
      [3, 3, 3, 3, 3] as const,
    );
  });

  test('the generic-context callers agree with their annotations', () => {
    const input = [3, 1, 2] as const;

    assert.deepStrictEqual<FixedLengthTuple<3, string>>(
      mapInGenericContext(input),
      ['3', '1', '2'],
    );

    assert.deepStrictEqual<FixedLengthTuple<3, string>>(
      mapCurriedInGenericContext(input),
      ['3', '1', '2'],
    );

    assert.deepStrictEqual<FixedLengthTuple<3, 0>>(
      toFilledInGenericContext(input),
      [0, 0, 0],
    );

    assert.deepStrictEqual<FixedLengthTuple<3, 0>>(
      toFilledCurriedInGenericContext(input),
      [0, 0, 0],
    );

    assert.deepStrictEqual<FixedLengthTuple<3, number>>(
      toRangeFilledInGenericContext(input),
      [0, 1, 2],
    );
  });
});

// `map` — property 1 (length) across every unbranded sample.
{
  const _a = map(emptyTuple, String);

  const _b = map(singleton, String);

  const _c = map(fixedTuple, String);

  const _d = map(nonEmptyTuple, String);

  const _e = map(plainArray, String);

  expectType<(typeof _a)['length'], (typeof emptyTuple)['length']>('=');

  expectType<(typeof _b)['length'], (typeof singleton)['length']>('=');

  expectType<(typeof _c)['length'], (typeof fixedTuple)['length']>('=');

  expectType<(typeof _d)['length'], (typeof nonEmptyTuple)['length']>('=');

  expectType<(typeof _e)['length'], (typeof plainArray)['length']>('=');
}

// `map` — property 2 (bounds) across every branded sample.
{
  const _a = map(lowerBounded, String);

  const _b = map(upperBounded, String);

  const _c = map(bounded, String);

  const _d = map(exactLength, String);

  expectType<MinLengthOf<typeof _a>, MinLengthOf<typeof lowerBounded>>('=');

  expectType<MaxLengthOf<typeof _b>, MaxLengthOf<typeof upperBounded>>('=');

  expectType<MinLengthOf<typeof _c>, MinLengthOf<typeof bounded>>('=');

  expectType<MaxLengthOf<typeof _c>, MaxLengthOf<typeof bounded>>('=');

  expectType<MinLengthOf<typeof _d>, MinLengthOf<typeof exactLength>>('=');

  expectType<MaxLengthOf<typeof _d>, MaxLengthOf<typeof exactLength>>('=');
}

// `toFilled` — properties 1 and 2.
{
  const _a = toFilled(fixedTuple, 0);

  const _b = toFilled(nonEmptyTuple, 0);

  const _c = toFilled(plainArray, 0);

  const _d = toFilled(lowerBounded, 0);

  const _e = toFilled(bounded, 0);

  expectType<(typeof _a)['length'], (typeof fixedTuple)['length']>('=');

  expectType<(typeof _b)['length'], (typeof nonEmptyTuple)['length']>('=');

  expectType<(typeof _c)['length'], (typeof plainArray)['length']>('=');

  expectType<MinLengthOf<typeof _d>, MinLengthOf<typeof lowerBounded>>('=');

  expectType<MinLengthOf<typeof _e>, MinLengthOf<typeof bounded>>('=');

  expectType<MaxLengthOf<typeof _e>, MaxLengthOf<typeof bounded>>('=');
}

// `toRangeFilled` — properties 1 and 2.
{
  const _a = toRangeFilled(fixedTuple, 0, [1, 2]);

  const _b = toRangeFilled(plainArray, 0, [0, 1]);

  const _c = toRangeFilled(lowerBounded, 0, [0, 1]);

  expectType<(typeof _a)['length'], (typeof fixedTuple)['length']>('=');

  expectType<(typeof _b)['length'], (typeof plainArray)['length']>('=');

  expectType<MinLengthOf<typeof _c>, MinLengthOf<typeof lowerBounded>>('=');
}

// `toSorted` — properties 1 and 2. Sorting neither adds nor drops elements, so
// it is held to the same contract even though it is not fixed for property 3.
{
  const _a = toSorted(fixedTuple);

  const _b = toSorted(nonEmptyTuple);

  const _c = toSorted(plainArray);

  const _d = toSorted(lowerBounded);

  const _e = toSorted(bounded);

  expectType<(typeof _a)['length'], (typeof fixedTuple)['length']>('=');

  expectType<(typeof _b)['length'], (typeof nonEmptyTuple)['length']>('=');

  expectType<(typeof _c)['length'], (typeof plainArray)['length']>('=');

  expectType<MinLengthOf<typeof _d>, MinLengthOf<typeof lowerBounded>>('=');

  expectType<MinLengthOf<typeof _e>, MinLengthOf<typeof bounded>>('=');

  expectType<MaxLengthOf<typeof _e>, MaxLengthOf<typeof bounded>>('=');
}

// `toReversed` — properties 1 and 2. Reversal permutes, so the length and the
// bounds are exactly what must not move.
{
  const _a = toReversed(fixedTuple);

  const _b = toReversed(plainArray);

  const _c = toReversed(lowerBounded);

  const _d = toReversed(bounded);

  expectType<(typeof _a)['length'], (typeof fixedTuple)['length']>('=');

  expectType<(typeof _b)['length'], (typeof plainArray)['length']>('=');

  expectType<MinLengthOf<typeof _c>, MinLengthOf<typeof lowerBounded>>('=');

  expectType<MinLengthOf<typeof _d>, MinLengthOf<typeof bounded>>('=');

  expectType<MaxLengthOf<typeof _d>, MaxLengthOf<typeof bounded>>('=');
}
