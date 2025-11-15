import { Num } from '../../number/index.mjs';

/**
 * Slices an array with automatically clamped start and end indices.
 *
 * @example
 *
 * ```ts
 * const letters = ['a', 'b', 'c', 'd', 'e'];
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
    | readonly [SizeType.ArgArrWithNegative, SizeType.ArgArrWithNegative]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 3: {
      const [array, start, end] = args;

      const startClamped = Num.clamp(0, array.length)(start);

      // Ensure endClamped is not less than startClamped.
      const endClamped = Num.clamp(startClamped, array.length)(end);

      return array.slice(startClamped, endClamped);
    }

    case 2: {
      const [start, end] = args;

      return (array) => sliceClamped(array, start, end);
    }
  }
}
