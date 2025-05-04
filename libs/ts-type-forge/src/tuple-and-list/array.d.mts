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
type MutableNonEmptyArray<A> = [A, ...A[]];

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
type NonEmptyArray<A> = readonly [A, ...(readonly A[])];

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
type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;

/* ArrayOfLength */

/**
 * Creates a readonly tuple type of a specific length `N` with elements of type `Elm`.
 * Alias for `MakeTuple<Elm, N>`.
 * @template N - The desired length of the tuple (must be a non-negative integer literal).
 * @template Elm - The type of elements in the tuple.
 * @returns A readonly tuple type `readonly [Elm, Elm, ..., Elm]` of length `N`.
 * @example
 * type TupleOf3Strings = ArrayOfLength<3, string>; // readonly [string, string, string]
 * type TupleOf0Numbers = ArrayOfLength<0, number>; // readonly []
 */
type ArrayOfLength<N extends number, Elm> = MakeTuple<Elm, N>;

/**
 * Creates a mutable tuple type of a specific length `N` with elements of type `Elm`.
 * @template N - The desired length of the tuple (must be a non-negative integer literal).
 * @template Elm - The type of elements in the tuple.
 * @returns A mutable tuple type `[Elm, Elm, ..., Elm]` of length `N`.
 * @example
 * type MutableTupleOf2Booleans = MutableArrayOfLength<2, boolean>; // [boolean, boolean]
 */
type MutableArrayOfLength<N extends number, Elm> = Mutable<
  ArrayOfLength<N, Elm>
>;

/* ArrayAtLeastLen */

// https://qiita.com/uhyo/items/80ce7c00f413c1d1be56

/**
 * Creates a mutable array type that is guaranteed to have at least `N` elements of type `Elm`.
 * @template N - The minimum length of the array (must be a non-negative integer literal).
 * @template Elm - The type of elements in the array.
 * @returns A mutable array type `[Elm, ..., Elm, ...Elm[]]` with at least `N` elements.
 * @example
 * type AtLeast2Numbers = MutableArrayAtLeastLen<2, number>; // [number, number, ...number[]]
 * const valid: AtLeast2Numbers = [1, 2];
 * const alsoValid: AtLeast2Numbers = [1, 2, 3, 4];
 * // const invalid: AtLeast2Numbers = [1]; // Error
 */
type MutableArrayAtLeastLen<N extends number, Elm> = Mutable<
  ArrayAtLeastLen<N, Elm>
>;

/**
 * Creates a readonly array type that is guaranteed to have at least `N` elements of type `Elm`.
 * @template N - The minimum length of the array (must be a non-negative integer literal).
 * @template Elm - The type of elements in the array.
 * @returns A readonly array type `readonly [Elm, ..., Elm, ...Elm[]]` with at least `N` elements.
 * @example
 * type AtLeast3Strings = ArrayAtLeastLen<3, string>; // readonly [string, string, string, ...string[]]
 * const valid: AtLeast3Strings = ["a", "b", "c"];
 * const alsoValid: AtLeast3Strings = ["a", "b", "c", "d"];
 * // const invalid: AtLeast3Strings = ["a", "b"]; // Error
 */
type ArrayAtLeastLen<N extends number, Elm> = readonly [
  ...MakeTuple<Elm, N>,
  ...Elm[],
];
