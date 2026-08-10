/* Array utilities */

import {
  type MinLengthArray,
  type MutableMinLengthArray,
} from '../branded-types/index.mjs';

/**
 * Represents a mutable structural tuple that is guaranteed to have at least one
 * element.
 * @template A - The type of elements in the array.
 * @example
 * ```ts
 * type NA = MutableNonEmptyTuple<string>; // [string, ...string[]]
 * const valid: NA = ['hello'];
 * const alsoValid: NA = ['hello', 'world'];
 * // const invalid: NA = []; // Error
 * ```
 */
export type MutableNonEmptyTuple<A> = readonly [A, ...A[]];

/**
 * Represents a readonly structural tuple that is guaranteed to have at least
 * one element.
 * @template A - The type of elements in the array.
 * @example
 * ```ts
 * type NA = NonEmptyTuple<number>; // readonly [number, ...number[]]
 * const valid: NA = [1];
 * const alsoValid: NA = [1, 2, 3];
 * // const invalid: NA = []; // Error
 * // valid.push(4); // Error: Property 'push' does not exist on type 'readonly [number, ...number[]]'.
 * ```
 */
export type NonEmptyTuple<A> = readonly [A, ...A[]];

/**
 * Represents a readonly array that is guaranteed to have at least one element.
 *
 * Brand-based alias of `MinLengthArray<1, A>`: unlike the structural
 * {@link NonEmptyTuple}, the non-emptiness is encoded in the brand, so
 * type-checking cost stays essentially independent of the size of `A`. Use
 * {@link NonEmptyTuple} instead when a purely structural check is needed (e.g.
 * `T extends NonEmptyTuple<unknown>`).
 * @template A - The type of elements in the array.
 * @example
 * ```ts
 * type NA = NonEmptyArray<number>; // MinLengthArray<1, number>
 * const head = (arr: NA): number => arr[0]; // OK — no `undefined`
 * ```
 */
export type NonEmptyArray<A> = MinLengthArray<1, A>;

/**
 * Represents a mutable array that is guaranteed to have at least one element.
 *
 * Brand-based alias of `MutableMinLengthArray<1, A>` — the mutable counterpart
 * of {@link NonEmptyArray}. Use {@link MutableNonEmptyTuple} instead when a
 * purely structural mutable tuple is needed.
 * @template A - The type of elements in the array.
 */
export type MutableNonEmptyArray<A> = MutableMinLengthArray<1, A>;

/**
 * Extracts the element type from a readonly array or tuple type `S`.
 * If `S` is not an array or tuple type, it resolves to `never`.
 * @template S - The array or tuple type.
 * @returns The type of the elements within the array/tuple.
 * @example
 * ```ts
 * type StrElm = ArrayElement<string[]>; // string
 * type NumElm = ArrayElement<readonly number[]>; // number
 * type TupleElm = ArrayElement<[string, boolean]>; // string | boolean
 * type NotArray = ArrayElement<{ a: number }>; // never
 * ```
 */
export type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;
