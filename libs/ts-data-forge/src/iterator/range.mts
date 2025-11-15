import { SafeInt, asSafeInt } from '../number/index.mjs';

/**
 * Generates a sequence of numbers within a specified range using a generator
 * function.
 *
 * This function creates a generator that yields numbers from `start`
 * (inclusive) to `end` (exclusive) with the specified `step`
 * increment/decrement. The function implements the JavaScript iterator
 * protocol, making it compatible with for-of loops, spread operator,
 * Array.from(), and other iterator consumers.
 *
 * The function has two overloaded signatures:
 *
 * 1. For non-negative ranges: accepts SafeUint parameters and optional positive
 *    step
 * 2. For general ranges: accepts SafeInt parameters and optional non-zero step
 *
 * **Generator Behavior:**
 *
 * - Yields values lazily (computed on-demand)
 * - Returns `void` when iteration completes
 * - Does not accept sent values (next parameter is ignored)
 * - Automatically handles direction based on step sign and start/end relationship
 *
 * **Step Parameter Behavior:**
 *
 * - Positive step: iterates from start toward end (start < end expected)
 * - Negative step: iterates from start toward end (start > end expected)
 * - Zero step: not allowed (NonZeroSafeInt constraint)
 * - Default step: 1 (positive direction)
 *
 * **Edge Cases:**
 *
 * - When start equals end: yields no values (empty sequence)
 * - When step direction conflicts with start/end relationship: yields no values
 * - All parameters must be safe integers (within JavaScript's safe integer range)
 *
 * @example
 *
 * ```ts
 * const zeroToThree = Array.from(range(0, 3));
 *
 * const threeToZero = Array.from(range(3, 0, -1));
 *
 * const defaultEnd = Array.from(range(4));
 *
 * assert.deepStrictEqual(zeroToThree, [0, 1, 2]);
 *
 * assert.deepStrictEqual(threeToZero, [3, 2, 1]);
 *
 * assert.deepStrictEqual(defaultEnd, [0, 1, 2, 3]);
 * ```
 *
 * @template T - The specific SafeInt or SafeUint type being generated
 * @param start - The starting number of the sequence (inclusive). Must be a
 *   safe integer.
 * @param end - The end number of the sequence (exclusive). Must be a safe
 *   integer.
 * @param step - The increment or decrement value. Defaults to 1. Must be
 *   non-zero safe integer.
 * @returns A Generator object that yields safe integers in the specified range.
 */
export function range(
  end: WithSmallInt<SafeUint, MaxInt>,
): Generator<SafeUint, void, unknown>;

export function range(
  start: WithSmallInt<SafeUint, MaxInt>,
  end: WithSmallInt<SafeUint, MaxInt>,
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  step?: WithSmallInt<PositiveSafeInt, MaxInt>,
): Generator<SafeUint, void, unknown>;

export function range(
  start: WithSmallInt<SafeInt, MaxInt>,
  end: WithSmallInt<SafeInt, MaxInt>,
  step?: WithSmallInt<NonZeroSafeInt, MaxInt>,
): Generator<SafeInt, void, unknown>;

export function* range(
  ...args:
    | readonly [end: WithSmallInt<SafeInt, MaxInt>]
    | readonly [
        start: WithSmallInt<SafeInt, MaxInt>,
        end: WithSmallInt<SafeInt, MaxInt>,
        step?: WithSmallInt<NonZeroSafeInt, MaxInt>,
      ]
): Generator<SafeInt, void, unknown> {
  switch (args.length) {
    case 1: {
      const [end] = args;

      for (const i of range(0, end, 1)) {
        yield i;
      }

      break;
    }

    case 2:

    // falls through
    case 3: {
      const [start, end, step = 1] = args;

      for (
        let mut_i: SafeInt = asSafeInt(start);
        step > 0 ? mut_i < end : mut_i > end;
        mut_i = SafeInt.add(mut_i, asSafeInt(step))
      ) {
        yield mut_i;
      }
    }
  }
}

type MaxInt = 512;
