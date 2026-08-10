import { type FixedLengthTuple } from 'ts-type-forge';
import { Num } from '../../number/index.mjs';
import { type ArgArrayIndexWithNegative, type SizeType } from '../../types.mjs';

/**
 * Slices an array with automatically clamped start and end indices.
 *
 * @example
 *
 * ```ts
 * const letters = ['a', 'b', 'c', 'd', 'e'] as readonly string[];
 *
 * const lastThree = Arr.sliceClamped(letters, -3, 10);
 *
 * const middleTwo = Arr.sliceClamped(1, 3)(letters);
 *
 * assert.deepStrictEqual(lastThree, ['a', 'b', 'c', 'd', 'e']);
 *
 * assert.deepStrictEqual(middleTwo, ['b', 'c']);
 * ```
 */
export function sliceClamped<const Ar extends readonly unknown[]>(
  array: Ar,
  start: ArgArrayIndexWithNegative<Ar>,
  end: ArgArrayIndexWithNegative<Ar>,
): readonly Ar[number][];

export function sliceClamped(
  start: SizeType.ArgArrWithNegative,
  end: SizeType.ArgArrWithNegative,
): <E>(array: readonly E[]) => readonly E[];

export function sliceClamped<E>(
  ...args:
    | readonly [
        readonly E[],
        SizeType.ArgArrWithNegative,
        SizeType.ArgArrWithNegative,
      ]
    | FixedLengthTuple<2, SizeType.ArgArrWithNegative>
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 3:
      return sliceClampedImpl(...args);

    case 2:
      return (array) => sliceClampedImpl(array, ...args);
  }
}

const sliceClampedImpl = <E,>(
  array: readonly E[],
  start: SizeType.ArgArrWithNegative,
  end: SizeType.ArgArrWithNegative,
): readonly E[] => {
  const startClamped = Num.clamp(0, array.length)(start);

  // Ensure endClamped is not less than startClamped.
  const endClamped = Num.clamp(startClamped, array.length)(end);

  return array.slice(startClamped, endClamped);
};
