/* Array utilities */

/**
 * Represents a mutable array that is guaranteed to have at least one element.
 * @template A - The type of elements in the array.
 * @example
 * type NA = MutableNonEmptyArray<string>; // [string, ...string[]]
 * const valid: NA = ["hello"];
 * const alsoValid: NA = ["hello", "world"];
 * // const invalid: NA = []; // Error
 */
export type MutableNonEmptyArray<A> = [A, ...A[]];

/**
 * Represents a readonly array that is guaranteed to have at least one element.
 * @template A - The type of elements in the array.
 * @example
 * type NA = NonEmptyArray<number>; // readonly [number, ...number[]]
 * const valid: NA = [1];
 * const alsoValid: NA = [1, 2, 3];
 * // const invalid: NA = []; // Error
 * // valid.push(4); // Error: Property 'push' does not exist on type 'readonly [number, ...number[]]'.
 */
export type NonEmptyArray<A> = readonly [A, ...(readonly A[])];

/**
 * Extracts the element type from a readonly array or tuple type `S`.
 * If `S` is not an array or tuple type, it resolves to `never`.
 * @template S - The array or tuple type.
 * @returns The type of the elements within the array/tuple.
 * @example
 * type StrElm = ArrayElement<string[]>; // string
 * type NumElm = ArrayElement<readonly number[]>; // number
 * type TupleElm = ArrayElement<[string, boolean]>; // string | boolean
 * type NotArray = ArrayElement<{ a: number }>; // never
 */
export type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;
