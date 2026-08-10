/**
 * Creates a readonly tuple type of a specific length `N` with elements of type `Elm`.
 *
 * @template N - The desired length of the tuple (must be a non-negative integer literal).
 * @template Elm - The type of elements in the tuple.
 * @returns A readonly tuple type `readonly [Elm, Elm, ..., Elm]` of length `N`.
 * @example
 * ```ts
 * type TupleOf3Strings = MakeTuple<3, string>; // readonly [string, string, string]
 * type TupleOf0Numbers = MakeTuple<0, number>; // readonly []
 * // type InvalidLength = MakeTuple<-1, boolean>; // Error or unexpected result
 * // type InvalidLength2 = MakeTuple<1.5, boolean>; // Error or unexpected result
 * ```
 */
export type MakeTuple<N extends number, Elm> = MakeTupleImpl<
  Elm,
  `${N}`,
  readonly []
>;

// https://techracho.bpsinc.jp/yoshi/2020_09_04/97108

/** @internal Represents the numeric digits 0 through 9. */
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** @internal Extracts the "tail" of a string representing a number (all digits except the first). */
type Tail<T extends string> = T extends `${Digit}${infer U}` ? U : never;

/** @internal Extracts the first digit of a string representing a number. */
type First<T extends string> = T extends `${infer U}${Tail<T>}` ? U : never;

/** @internal Represents the digits 0 through 9 as string literals. */
type DigitStr = `${Digit}`;

/**
 * @internal
 * Creates a new tuple by repeating the input tuple `T`, `N` times.
 * `N` can be a number literal (0-10) or its string representation.
 * Uses a hardcoded tuple of repeated tuples for efficiency.
 * @template T - The tuple to repeat.
 * @template N - The number of times to repeat `T` (0-10).
 */
type Tile<
  T extends readonly unknown[],
  N extends Digit | DigitStr | '10' | 10,
> = [
  readonly [], // 0 times
  readonly [...T], // 1 time
  readonly [...T, ...T], // 2 times
  readonly [...T, ...T, ...T], // 3 times
  readonly [...T, ...T, ...T, ...T], // 4 times
  readonly [...T, ...T, ...T, ...T, ...T], // 5 times
  readonly [...T, ...T, ...T, ...T, ...T, ...T], // 6 times
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T], // 7 times
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T], // 8 times
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T], // 9 times
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T], // 10 times
][N];

/**
 * @internal
 * Recursive implementation for `MakeTuple`. Builds the tuple digit by digit.
 * @template Elm - The element type.
 * @template N - The remaining length as a string.
 * @template X - The accumulator tuple being built.
 */
type MakeTupleImpl<
  Elm,
  N extends string,
  X extends readonly unknown[],
> = string extends N // Prevent distribution with `string` type
  ? never
  : N extends '' // Base case: length string is empty, return accumulator
    ? X
    : First<N> extends infer U // Get the first digit
      ? U extends DigitStr // Check if the first digit is a valid digit string
        ? // Recursive step:
          // - Process the rest of the digits (Tail<N>)
          // - Add the current digit's worth of elements (Tile<[Elm], U>)
          // - Multiply the accumulator by 10 (Tile<X, 10>) and add it
          MakeTupleImpl<
            Elm,
            Tail<N>,
            readonly [...Tile<readonly [Elm], U>, ...Tile<X, 10>]
          >
        : never // Should not happen if N is derived from `${number}`
      : never; // Should not happen
