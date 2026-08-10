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
import {
  toFilled,
  toInserted,
  toPushed,
  toRangeFilled,
  toRemoved,
  toUnshifted,
} from './array-utils-modification.mjs';
import { skip, skipLast, take, takeLast } from './array-utils-slicing.mjs';
import {
  concat,
  filter,
  filterNot,
  map,
  toReversed,
  toSorted,
  toSortedBy,
  uniq,
  uniqBy,
} from './array-utils-transformation.mjs';

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
 *    array, the result is assignable to the caller's own annotation.
 *
 * Property 3 is the one that keeps regressing, and the one a per-combination
 * table cannot express: a conditional a generic `Ar` cannot decide stays
 * deferred, and a deferred conditional carrying a brand-intersection branch is
 * not an array type at all — so the result has no `entries()`, is not
 * assignable to the caller's annotation, and in the worst case the bound
 * arithmetic behind the brand exceeds the instantiation limit.
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
 * what the caller is entitled to expect, so the declaration only compiles while
 * the transform reports something assignable to it. There is nothing to run.
 *
 * This list is the coverage record. Every array -> array transform that
 * resolves under a generic array parameter appears here; the ones that do not
 * are listed at the bottom of this file, with the reason.
 */

// Element-replacing transforms report the caller's own homomorphic mapping.
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

// Reordering transforms keep the elements, so the caller is entitled to an
// array of them.
const toReversedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => toReversed(xs);

const toSortedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => toSorted(xs, (a, b) => a - b);

// Numbers sort without a comparator. This is the overload that makes it
// optional, which a generic caller could not reach at all while the parameter
// list was itself a conditional type.
const toSortedDefaultInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => toSorted(xs);

const toSortedNonNumberInGenericContext = <const T extends readonly string[]>(
  xs: T,
): readonly T[number][] => toSorted(xs, (a, b) => a.localeCompare(b));

const toSortedByInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => toSortedBy(xs, (n) => n);

// Shortening transforms lose the length but keep the element type.
const takeInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => take(xs, 2);

const takeLastInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => takeLast(xs, 2);

const skipInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => skip(xs, 2);

const skipLastInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => skipLast(xs, 2);

const toRemovedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => toRemoved(xs, 0);

const filterInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => filter(xs, (n) => n > 0);

const filterNotInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => filterNot(xs, (n) => n > 0);

const uniqInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => uniq(xs);

const uniqByInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => uniqBy(xs, (n) => n);

// Lengthening transforms widen the element type by whatever was added.
const toPushedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly (T[number] | 'x')[] => toPushed(xs, 'x');

const toUnshiftedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly (T[number] | 'x')[] => toUnshifted(xs, 'x');

const toInsertedInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly (T[number] | 'x')[] => toInserted(xs, 0, 'x');

const concatInGenericContext = <const T extends readonly number[]>(
  xs: T,
): readonly T[number][] => concat(xs, xs);

describe('Arr shape invariants', () => {
  // The type-level assertions below are checked by `tsc`; this pins the same
  // property at runtime, so a transform that silently drops or adds an element
  // fails here even where the type says otherwise.
  test('every shape-preserving transform keeps the length at runtime', () => {
    const input = [3, 1, 2] as const;

    assert.deepStrictEqual<FixedLengthTuple<6, 3>>(
      [
        map(input, String).length,
        toFilled(input, 0).length,
        toRangeFilled(input, 0, [1, 2]).length,
        toSorted(input).length,
        toSortedBy(input, (n) => n).length,
        toReversed(input).length,
      ] as const,
      [3, 3, 3, 3, 3, 3] as const,
    );
  });

  test('the element-replacing callers agree with their annotations', () => {
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

  test('the reordering callers agree with their annotations', () => {
    const input = [3, 1, 2] as const;

    assert.deepStrictEqual<readonly number[]>(
      toReversedInGenericContext(input),
      [2, 1, 3],
    );

    assert.deepStrictEqual<readonly number[]>(
      toSortedInGenericContext(input),
      [1, 2, 3],
    );

    assert.deepStrictEqual<readonly number[]>(
      toSortedDefaultInGenericContext(input),
      [1, 2, 3],
    );

    assert.deepStrictEqual<readonly string[]>(
      toSortedNonNumberInGenericContext(['c', 'a', 'b'] as const),
      ['a', 'b', 'c'],
    );

    assert.deepStrictEqual<readonly number[]>(
      toSortedByInGenericContext(input),
      [1, 2, 3],
    );
  });

  test('the shortening callers agree with their annotations', () => {
    const input = [3, 1, 2] as const;

    assert.deepStrictEqual<readonly number[]>(
      takeInGenericContext(input),
      [3, 1],
    );

    assert.deepStrictEqual<readonly number[]>(
      takeLastInGenericContext(input),
      [1, 2],
    );

    assert.deepStrictEqual<readonly number[]>(skipInGenericContext(input), [2]);

    assert.deepStrictEqual<readonly number[]>(
      skipLastInGenericContext(input),
      [3],
    );

    assert.deepStrictEqual<readonly number[]>(
      toRemovedInGenericContext(input),
      [1, 2],
    );

    assert.deepStrictEqual<readonly number[]>(
      filterInGenericContext(input),
      [3, 1, 2],
    );

    assert.deepStrictEqual<readonly number[]>(
      filterNotInGenericContext(input),
      [],
    );

    assert.deepStrictEqual<readonly number[]>(
      uniqInGenericContext([1, 1, 2] as const),
      [1, 2],
    );

    assert.deepStrictEqual<readonly number[]>(
      uniqByInGenericContext([1, 1, 2] as const),
      [1, 2],
    );
  });

  test('the lengthening callers agree with their annotations', () => {
    const input = [3, 1, 2] as const;

    assert.deepStrictEqual<readonly (number | string)[]>(
      toPushedInGenericContext(input),
      [3, 1, 2, 'x'],
    );

    assert.deepStrictEqual<readonly (number | string)[]>(
      toUnshiftedInGenericContext(input),
      ['x', 3, 1, 2],
    );

    assert.deepStrictEqual<readonly (number | string)[]>(
      toInsertedInGenericContext(input),
      ['x', 3, 1, 2],
    );

    assert.deepStrictEqual<readonly number[]>(
      concatInGenericContext(input),
      [3, 1, 2, 3, 1, 2],
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

// `toSorted` — properties 1 and 2. Sorting neither adds nor drops elements.
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

// `toSortedBy` — properties 1 and 2.
{
  const _a = toSortedBy(fixedTuple, (n) => n);

  const _b = toSortedBy(plainArray, (n) => n);

  const _c = toSortedBy(lowerBounded, (n) => n);

  const _d = toSortedBy(bounded, (n) => n);

  expectType<(typeof _a)['length'], (typeof fixedTuple)['length']>('=');

  expectType<(typeof _b)['length'], (typeof plainArray)['length']>('=');

  expectType<MinLengthOf<typeof _c>, MinLengthOf<typeof lowerBounded>>('=');

  expectType<MinLengthOf<typeof _d>, MinLengthOf<typeof bounded>>('=');

  expectType<MaxLengthOf<typeof _d>, MaxLengthOf<typeof bounded>>('=');
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

/**
 * The transforms that do **not** resolve under a generic array parameter, and
 * therefore have no property-3 entry above:
 *
 * | transform           | reports                 | symptom under a generic `Ar` |
 * | :------------------ | :---------------------- | :--------------------------- |
 * | `tail` / `butLast`  | `ConstrainedList.Tail`  | TS2590                       |
 * | `zip`               | `ConstrainedList.Zip`   | TS2589, and no `entries()`   |
 * | `set` / `toUpdated` | `ConstrainedList.SetAt` | TS2589                       |
 *
 * The cause is the same in all three, and it is upstream. Their brand branch
 * does arithmetic on the input's own bounds (`SubLength`, `SmallerLength`), and
 * that arithmetic goes through `MakeTuple`. For a concrete branded array the
 * bound is a single number and the expansion is cheap; for a type parameter it
 * is the whole `SupportedLength` union, which `MakeTuple` distributes over.
 *
 * `map`, `toFilled` and `toRangeFilled` were fixable in 14.0.1 precisely
 * because `ChangeArrayElement`'s brand branch does no such arithmetic. The
 * `UnknownBrand`-keyed overload split that fixed them does not transfer: the
 * constrained overload makes the checker attempt that arithmetic at every call
 * site, generic or not.
 */
