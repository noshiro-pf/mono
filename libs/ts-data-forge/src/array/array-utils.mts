import { IMap } from '../collections/index.mjs';
import { expectType } from '../expect-type.mjs';
import { Optional, pipe, Result } from '../functional/index.mjs';
import { isString, isUndefined } from '../guard/index.mjs';
import { range as rangeIterator } from '../iterator/index.mjs';
import { asPositiveUint32, asUint32, Num, Uint32 } from '../number/index.mjs';
import { castMutable, tp, unknownToString } from '../others/index.mjs';

/**
 * A comprehensive, immutable utility library for array manipulations in TypeScript.
 * Provides a wide range of functions for array creation, validation, transformation,
 * reduction, slicing, set operations, and more, with a focus on type safety and
 * leveraging TypeScript's type inference capabilities.
 * All functions operate on `readonly` arrays and return new `readonly` arrays,
 * ensuring immutability.
 */
export namespace Arr {
  /**
   * Returns the size (length) of an array as a type-safe branded integer.
   *
   * This function provides the array length with enhanced type safety through branded types:
   * - For arrays known to be non-empty at compile time: returns `PositiveNumber & SizeType.Arr`
   * - For general arrays that may be empty: returns `SizeType.Arr` (branded Uint32)
   *
   * The returned value is always a non-negative integer that can be safely used for array indexing
   * and size comparisons. The branded type prevents common integer overflow issues and provides
   * better type checking than plain numbers.
   *
   * @template Ar The exact type of the input array, used for precise return type inference.
   * @param array The array to measure. Can be any readonly array type.
   * @returns The length of the array as a branded type:
   *   - `IntersectBrand<PositiveNumber, SizeType.Arr>` for known non-empty arrays
   *   - `SizeType.Arr` for general arrays (branded Uint32, may be 0)
   *
   * @example
   * ```typescript
   * // Known non-empty arrays get positive branded type
   * const tuple = [1, 2, 3] as const;
   * const tupleSize = Arr.size(tuple);
   * // Type: IntersectBrand<PositiveNumber, SizeType.Arr>
   * // Value: 3 (branded, guaranteed positive)
   *
   * const nonEmpty: NonEmptyArray<string> = ['a', 'b'] as NonEmptyArray<string>;
   * const nonEmptySize = Arr.size(nonEmpty);
   * // Type: IntersectBrand<PositiveNumber, SizeType.Arr>
   * // Guaranteed to be > 0
   *
   * // General arrays may be empty, get regular branded type
   * const generalArray: number[] = [1, 2, 3];
   * const generalSize = Arr.size(generalArray);
   * // Type: SizeType.Arr (branded Uint32)
   * // May be 0 or positive
   *
   * // Empty arrays
   * const emptyArray = [] as const;
   * const emptySize = Arr.size(emptyArray);
   * // Type: SizeType.Arr
   * // Value: 0 (branded)
   *
   * // Runtime arrays with unknown content
   * const dynamicArray = Array.from({ length: Math.random() * 10 }, (_, i) => i);
   * const dynamicSize = Arr.size(dynamicArray);
   * // Type: SizeType.Arr (may be 0)
   *
   * // Using size for safe operations
   * const data = [10, 20, 30];
   * const dataSize = Arr.size(data);
   *
   * // Safe for array creation
   * const indices = Arr.seq(dataSize); // Creates [0, 1, 2]
   * const zeros = Arr.zeros(dataSize); // Creates [0, 0, 0]
   *
   * // Safe for bounds checking
   * const isValidIndex = (index: number) => index >= 0 && index < dataSize;
   *
   * // Comparison with other sizes
   * const otherArray = ['a', 'b'];
   * const sizeDiff = Uint32.sub(Arr.size(data), Arr.size(otherArray)); // 1
   *
   * // Functional composition
   * const arrays = [
   *   [1, 2],
   *   [3, 4, 5],
   *   [],
   *   [6]
   * ];
   * const sizes = arrays.map(Arr.size); // [2, 3, 0, 1] (all branded)
   * const totalElements = sizes.reduce(Uint32.add, 0); // 6
   *
   * // Type guards work with size
   * if (Arr.size(data) > 0) {
   *   // TypeScript knows data is non-empty here
   *   const firstElement = data[0]; // Safe access
   * }
   *
   * // Type inference examples
   * expectType<typeof tupleSize, IntersectBrand<PositiveNumber, SizeType.Arr>>('=');
   * expectType<typeof generalSize, SizeType.Arr>('=');
   * expectType<typeof emptySize, SizeType.Arr>('=');
   * ```
   *
   * @see {@link length} - Alias for this function
   * @see {@link isEmpty} for checking if size is 0
   * @see {@link isNonEmpty} for checking if size > 0
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const size: SizeFnOverload = (<Ar extends readonly unknown[]>(
    array: Ar,
  ): SizeType.Arr => asUint32(array.length)) as SizeFnOverload;

  type SizeFnOverload = {
    <Ar extends NonEmptyArray<unknown>>(
      array: Ar,
    ): IntersectBrand<PositiveNumber, SizeType.Arr>;

    <Ar extends readonly unknown[]>(array: Ar): SizeType.Arr;
  };

  export const length = size;

  // type guard

  /**
   * Type guard that checks if a value is an array, excluding types that cannot be arrays.
   * This function refines the type by filtering out non-array types from unions.
   * @template E The input type that may or may not be an array.
   * @param value The value to check.
   * @returns `true` if the value is an array, `false` otherwise.
   * @example
   * ```ts
   * function processValue(value: string | number[] | null) {
   *   if (Arr.isArray(value)) {
   *     // value is now typed as number[]
   *     console.log(value.length);
   *   }
   * }
   *
   * Arr.isArray([1, 2, 3]); // true
   * Arr.isArray("hello"); // false
   * Arr.isArray(null); // false
   * ```
   */
  export const isArray = <E,>(value: E): value is FilterArray<E> =>
    Array.isArray(value);

  type FilterArray<T> = T extends T
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      BoolOr<TypeEq<T, unknown>, TypeEq<T, any>> extends true
      ? Cast<readonly unknown[], T>
      : T extends readonly unknown[]
        ? T
        : never // Exclude non-array types
    : never;

  type Cast<A, B> = A extends B ? A : never;

  // validation

  /**
   * Type guard that checks if an array is empty (has no elements).
   *
   * This function serves as both a runtime check and a TypeScript type guard,
   * narrowing the array type to `readonly []` when the check passes. It's useful
   * for conditional logic and type-safe handling of potentially empty arrays.
   *
   * @template E The type of elements in the array.
   * @param array The array to check for emptiness.
   * @returns `true` if the array has length 0, `false` otherwise.
   *   When `true`, TypeScript narrows the type to `readonly []`.
   *
   * @example
   * ```typescript
   * // Basic emptiness checking
   * const emptyArray: number[] = [];
   * const nonEmptyArray = [1, 2, 3];
   *
   * console.log(Arr.isEmpty(emptyArray)); // true
   * console.log(Arr.isEmpty(nonEmptyArray)); // false
   *
   * // Type guard behavior
   * function processArray(arr: readonly number[]) {
   *   if (Arr.isEmpty(arr)) {
   *     // arr is now typed as readonly []
   *     console.log('Array is empty');
   *     return 0;
   *   } else {
   *     // arr is now typed as NonEmptyArray<number>
   *     return arr[0]; // Safe access - TypeScript knows it's non-empty
   *   }
   * }
   *
   * // Conditional processing
   * const data = [10, 20, 30];
   * if (!Arr.isEmpty(data)) {
   *   // Safe to access elements
   *   const firstElement = data[0]; // No undefined risk
   *   const lastElement = data[data.length - 1];
   * }
   *
   * // Filtering empty arrays
   * const arrayList: readonly number[][] = [[1, 2], [], [3], []];
   * const nonEmptyArrays = arrayList.filter(arr => !Arr.isEmpty(arr));
   * // nonEmptyArrays: [[1, 2], [3]]
   *
   * // Early returns
   * function sumArray(numbers: readonly number[]): number {
   *   if (Arr.isEmpty(numbers)) {
   *     return 0; // Handle empty case early
   *   }
   *   return numbers.reduce((sum, n) => sum + n, 0);
   * }
   *
   * // Type inference examples
   * const testEmpty = [] as const;
   * const testNonEmpty = [1, 2] as const;
   *
   * expectType<Parameters<typeof Arr.isEmpty>[0], readonly unknown[]>('=');
   * expectType<ReturnType<typeof Arr.isEmpty>, boolean>('=');
   * ```
   *
   * @see {@link isNonEmpty} for the opposite check (non-empty arrays)
   * @see {@link size} for getting the exact length
   * @see {@link isArrayOfLength} for checking specific lengths
   */
  export const isEmpty = <E,>(array: readonly E[]): array is readonly [] =>
    array.length === 0;

  /**
   * Type guard that checks if an array is non-empty (has at least one element).
   *
   * This function serves as both a runtime check and a TypeScript type guard,
   * narrowing the array type to `NonEmptyArray<E>` when the check passes. This enables
   * safe access to array elements without undefined checks, as TypeScript knows the array
   * has at least one element.
   *
   * @template E The type of elements in the array.
   * @param array The array to check for non-emptiness.
   * @returns `true` if the array has length > 0, `false` otherwise.
   *   When `true`, TypeScript narrows the type to `NonEmptyArray<E>`.
   *
   * @example
   * ```typescript
   * // Basic non-emptiness checking
   * const emptyArray: number[] = [];
   * const nonEmptyArray = [1, 2, 3];
   *
   * console.log(Arr.isNonEmpty(emptyArray)); // false
   * console.log(Arr.isNonEmpty(nonEmptyArray)); // true
   *
   * // Type guard behavior enables safe element access
   * function getFirstElement(arr: readonly number[]): number | undefined {
   *   if (Arr.isNonEmpty(arr)) {
   *     // arr is now typed as NonEmptyArray<number>
   *     return arr[0]; // Safe - no undefined, TypeScript knows this exists
   *   }
   *   return undefined;
   * }
   *
   * // Safe operations on non-empty arrays
   * function processData(data: readonly string[]) {
   *   if (Arr.isNonEmpty(data)) {
   *     // All of these are now safe without undefined checks
   *     const first = data[0];
   *     const last = data[data.length - 1];
   *     const middle = data[Math.floor(data.length / 2)];
   *
   *     // Can safely use non-empty array methods
   *     const joined = data.join(', ');
   *     const reduced = data.reduce((acc, item) => acc + item.length, 0);
   *   }
   * }
   *
   * // Filtering and working with arrays
   * const possiblyEmptyArrays: readonly number[][] = [
   *   [1, 2, 3],
   *   [],
   *   [4, 5],
   *   []
   * ];
   *
   * // Get only non-empty arrays with proper typing
   * const definitelyNonEmpty = possiblyEmptyArrays.filter(Arr.isNonEmpty);
   * // Type: NonEmptyArray<number>[]
   *
   * // Now safe to access elements
   * const firstElements = definitelyNonEmpty.map(arr => arr[0]); // [1, 4]
   *
   * // Early validation
   * function calculateAverage(numbers: readonly number[]): number {
   *   if (!Arr.isNonEmpty(numbers)) {
   *     throw new Error('Cannot calculate average of empty array');
   *   }
   *
   *   // numbers is now NonEmptyArray<number>
   *   return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
   * }
   *
   * // Functional composition
   * const arrayGroups = [
   *   [1, 2],
   *   [],
   *   [3, 4, 5],
   *   []
   * ];
   *
   * const nonEmptyGroups = arrayGroups
   *   .filter(Arr.isNonEmpty) // Filter to NonEmptyArray<number>[]
   *   .map(group => group[0]); // Safe access to first element: [1, 3]
   *
   * // Combined with other array operations
   * function processArraySafely<T>(
   *   arr: readonly T[],
   *   processor: (item: T) => string
   * ): string {
   *   if (Arr.isNonEmpty(arr)) {
   *     return arr.map(processor).join(' -> ');
   *   }
   *   return 'No items to process';
   * }
   *
   * // Type inference examples
   * const testArray = [1, 2, 3];
   * const isNonEmptyResult = Arr.isNonEmpty(testArray);
   *
   * expectType<typeof isNonEmptyResult, boolean>('=');
   * expectType<Parameters<typeof Arr.isNonEmpty>[0], readonly unknown[]>('=');
   *
   * // Type narrowing in conditional
   * if (Arr.isNonEmpty(testArray)) {
   *   expectType<typeof testArray, NonEmptyArray<number>>('=');
   * }
   * ```
   *
   * @see {@link isEmpty} for the opposite check (empty arrays)
   * @see {@link size} for getting the exact length
   * @see {@link head} for safely getting the first element
   * @see {@link last} for safely getting the last element
   */
  export const isNonEmpty = <E,>(
    array: readonly E[],
  ): array is NonEmptyArray<E> => array.length > 0;

  /**
   * Checks if an array has a specific length.
   * @template E The type of elements in the array.
   * @template N The expected length of the array (must be a number type).
   * @param array The array to check.
   * @param len The expected length.
   * @returns `true` if the array has the specified length, `false` otherwise.
   * @example
   * ```ts
   * const arr: readonly number[] = [1, 2, 3];
   * if (Arr.isArrayOfLength(arr, 3)) {
   *   // arr is now typed as readonly [number, number, number]
   * }
   * Arr.isArrayOfLength([1, 2], 3); // false
   * ```
   */
  export const isArrayOfLength = <E, N extends SizeType.ArgArrNonNegative>(
    array: readonly E[],
    len: N,
  ): array is ArrayOfLength<N, E> => array.length === len;

  /**
   * Checks if an array has at least a specific length.
   * @template E The type of elements in the array.
   * @template N The minimum expected length of the array (must be a number type).
   * @param array The array to check.
   * @param len The minimum expected length.
   * @returns `true` if the array has at least the specified length, `false` otherwise.
   * @example
   * ```ts
   * const arr: readonly number[] = [1, 2, 3];
   * if (Arr.isArrayAtLeastLength(arr, 2)) {
   *   // arr is now typed as readonly [number, number, ...number[]]
   * }
   * Arr.isArrayAtLeastLength([1], 2); // false
   * ```
   */
  export const isArrayAtLeastLength = <E, N extends SizeType.ArgArrNonNegative>(
    array: readonly E[],
    len: N,
  ): array is ArrayAtLeastLen<N, E> => array.length >= len;

  /**
   * Checks if an index is within the valid range of an array (i.e., `0 <= index < array.length`).
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param index The index to check.
   * @returns `true` if the index is within the array bounds, `false` otherwise.
   * @example
   * ```ts
   * Arr.indexIsInRange([10, 20], 0); // true
   * Arr.indexIsInRange([10, 20], 1); // true
   * Arr.indexIsInRange([10, 20], 2); // false
   * Arr.indexIsInRange([10, 20], -1); // false
   * Arr.indexIsInRange([], 0); // false
   * ```
   */
  export const indexIsInRange = <E,>(
    array: readonly E[],
    index: SizeType.ArgArrNonNegative,
  ): boolean => Num.isInRange(0, array.length)(index);

  // array creation

  /**
   * Creates an array of zeros with the specified length.
   *
   * This function provides compile-time type safety with precise return types:
   * - When `len` is a compile-time known `SmallUint` (0-100), returns a tuple with exact length
   * - When `len` is a positive runtime value, returns a `NonEmptyArray<0>`
   * - Otherwise, returns a `readonly 0[]` that may be empty
   *
   * @template N The type of the length parameter. When a `SmallUint` literal is provided,
   *   the return type will be a tuple of exactly that length filled with zeros.
   * @param len The length of the array to create. Must be a non-negative integer.
   * @returns An immutable array of zeros. The exact return type depends on the input:
   *   - `ArrayOfLength<N, 0>` when `N` is a `SmallUint` literal
   *   - `NonEmptyArray<0>` when `len` is a positive runtime value
   *   - `readonly 0[]` for general non-negative values
   *
   * @example
   * ```typescript
   * // Compile-time known lengths produce precise tuple types
   * const exactLength = Arr.zeros(3); // readonly [0, 0, 0]
   * const empty = Arr.zeros(0); // readonly []
   *
   * // Runtime positive values produce non-empty arrays
   * const count = Math.floor(Math.random() * 5) + 1;
   * const nonEmpty = Arr.zeros(count); // NonEmptyArray<0>
   *
   * // General runtime values may be empty
   * const maybeEmpty = Arr.zeros(Math.floor(Math.random() * 5)); // readonly 0[]
   *
   * // Type inference examples
   * expectType<typeof exactLength, readonly [0, 0, 0]>('=');
   * expectType<typeof empty, readonly []>('=');
   * expectType<typeof nonEmpty, NonEmptyArray<0>>('=');
   * expectType<typeof maybeEmpty, readonly 0[]>('=');
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const zeros: ZerosFnOverload = ((
    len: SizeType.ArgArrNonNegative,
  ): readonly 0[] => Array.from<0>({ length: len }).fill(0)) as ZerosFnOverload;

  type ZerosFnOverload = {
    /**
     * Create array of zeros with compile-time length.
     */
    <N extends SmallUint>(len: N): ArrayOfLength<N, 0>;

    /**
     * Create non-empty array of zeros.
     */
    (len: SizeType.ArgArrPositive): NonEmptyArray<0>;

    /**
     * Create array of zeros.
     */
    (len: SizeType.ArgArrNonNegative): readonly 0[];
  };

  /**
   * Creates a sequence of consecutive integers from 0 to `len-1`.
   *
   * This function generates index sequences with precise compile-time typing:
   * - When `len` is a compile-time known `SmallUint` (0-100), returns a tuple of consecutive integers
   * - When `len` is a positive runtime value, returns a `NonEmptyArray<SizeType.Arr>`
   * - Otherwise, returns a `readonly SizeType.Arr[]` that may be empty
   *
   * @template N The type of the length parameter. When a `SmallUint` literal is provided,
   *   the return type will be a tuple containing the sequence [0, 1, 2, ..., N-1].
   * @param len The length of the sequence to create. Must be a non-negative integer.
   * @returns An immutable array containing the sequence [0, 1, 2, ..., len-1].
   *   The exact return type depends on the input:
   *   - `Seq<N>` (precise tuple) when `N` is a `SmallUint` literal
   *   - `NonEmptyArray<SizeType.Arr>` when `len` is a positive runtime value
   *   - `readonly SizeType.Arr[]` for general non-negative values
   *
   * @example
   * ```typescript
   * // Compile-time known lengths produce precise tuple types
   * const indices = Arr.seq(4); // readonly [0, 1, 2, 3]
   * const empty = Arr.seq(0); // readonly []
   * const single = Arr.seq(1); // readonly [0]
   *
   * // Runtime positive values produce non-empty arrays
   * const count = Math.floor(Math.random() * 5) + 1;
   * const nonEmpty = Arr.seq(count); // NonEmptyArray<SizeType.Arr>
   *
   * // General runtime values may be empty
   * const maybeEmpty = Arr.seq(Math.floor(Math.random() * 5)); // readonly SizeType.Arr[]
   *
   * // Useful for generating array indices
   * const data = ['a', 'b', 'c', 'd'];
   * const indexSequence = Arr.seq(data.length); // [0, 1, 2, 3]
   *
   * // Type inference examples
   * expectType<typeof indices, readonly [0, 1, 2, 3]>('=');
   * expectType<typeof empty, readonly []>('=');
   * expectType<typeof single, readonly [0]>('=');
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const seq: SeqFnOverload = ((
    len: SizeType.ArgArrNonNegative,
  ): readonly SizeType.Arr[] =>
    Array.from({ length: len }, (_, i) => asUint32(i))) as SeqFnOverload;

  type SeqFnOverload = {
    <N extends SmallUint>(len: N): Seq<N>;

    (len: SizeType.ArgArrPositive): NonEmptyArray<SizeType.Arr>;

    (len: SizeType.ArgArrNonNegative): readonly SizeType.Arr[];
  };

  /**
   * Creates a new array of the specified length, with each position filled with the provided initial value.
   *
   * This function provides compile-time type safety with precise return types and performs shallow copying
   * of the initial value (the same reference is used for all positions):
   * - When `len` is a compile-time known `SmallUint` (0-100), returns a tuple of exactly that length
   * - When `len` is a positive runtime value, returns a `NonEmptyArray<V>`
   * - Otherwise, returns a `readonly V[]` that may be empty
   *
   * @template V The type of the initial value. The `const` constraint preserves literal types.
   * @template N The type of the length parameter when it's a `SmallUint` literal.
   * @param len The length of the array to create. Must be a non-negative integer.
   * @param init The value to fill each position with. The same reference is used for all positions.
   * @returns An immutable array filled with the initial value. The exact return type depends on the length:
   *   - `ArrayOfLength<N, V>` when `len` is a `SmallUint` literal
   *   - `NonEmptyArray<V>` when `len` is a positive runtime value
   *   - `readonly V[]` for general non-negative values
   *
   * @example
   * ```typescript
   * // Compile-time known lengths produce precise tuple types
   * const strings = Arr.create(3, 'hello'); // readonly ['hello', 'hello', 'hello']
   * const numbers = Arr.create(2, 42); // readonly [42, 42]
   * const empty = Arr.create(0, 'unused'); // readonly []
   *
   * // Object references are shared (shallow copy behavior)
   * const obj = { id: 1, name: 'test' };
   * const objects = Arr.create(3, obj); // readonly [obj, obj, obj]
   * objects[0] === objects[1]; // true - same reference
   * objects[0].id = 999; // Mutates the shared object
   * console.log(objects[1].id); // 999 - all positions affected
   *
   * // Runtime positive values produce non-empty arrays
   * const count = Math.floor(Math.random() * 5) + 1;
   * const nonEmpty = Arr.create(count, 'item'); // NonEmptyArray<string>
   *
   * // Literal type preservation with const assertion
   * const literals = Arr.create(2, 'success' as const); // readonly ['success', 'success']
   *
   * // Type inference examples
   * expectType<typeof strings, readonly ['hello', 'hello', 'hello']>('=');
   * expectType<typeof numbers, readonly [42, 42]>('=');
   * expectType<typeof empty, readonly []>('=');
   * ```
   *
   * @see {@link zeros} for creating arrays filled with zeros
   * @see {@link seq} for creating sequences of consecutive integers
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const create: CreateFnOverload = (<const V,>(
    len: SizeType.ArgArrNonNegative,
    init: V,
  ): readonly V[] =>
    Array.from({ length: Math.max(0, len) }, () => init)) as CreateFnOverload;

  type CreateFnOverload = {
    <const V, N extends SmallUint>(len: N, init: V): ArrayOfLength<N, V>;

    <const V>(len: SizeType.ArgArrPositive, init: V): NonEmptyArray<V>;

    <const V>(len: SizeType.ArgArrNonNegative, init: V): readonly V[];
  };

  export const newArray = create;

  /**
   * Creates a shallow copy of an array, preserving the exact type signature.
   *
   * This function creates a new array with the same elements as the input, but with a new array reference.
   * Object references within the array are preserved (shallow copy), and the readonly/mutable status
   * of the array type is maintained.
   *
   * @template Ar The exact type of the input array, preserving tuple types, readonly status, and element types.
   * @param array The array to copy. Can be any array type: mutable, readonly, tuple, or general array.
   * @returns A new array that is a shallow copy of the input. The return type exactly matches the input type,
   *   preserving readonly status, tuple structure, and element types.
   *
   * @example
   * ```typescript
   * // Mutable arrays remain mutable
   * const mutableOriginal = [1, 2, 3];
   * const mutableCopy = Arr.copy(mutableOriginal); // number[]
   * mutableCopy[0] = 999; // OK - still mutable
   * mutableOriginal[0]; // 1 - original unchanged
   *
   * // Readonly arrays remain readonly
   * const readonlyOriginal = [1, 2, 3] as const;
   * const readonlyCopy = Arr.copy(readonlyOriginal); // readonly [1, 2, 3]
   * // readonlyCopy[0] = 999; // Error - readonly array
   *
   * // Tuple types are preserved
   * const tupleOriginal: [string, number, boolean] = ['hello', 42, true];
   * const tupleCopy = Arr.copy(tupleOriginal); // [string, number, boolean]
   *
   * // Shallow copy behavior with objects
   * const objectArray = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
   * const objectCopy = Arr.copy(objectArray);
   * objectCopy[0].name = 'Charlie'; // Mutates the shared object reference
   * console.log(objectArray[0].name); // 'Charlie' - original affected
   * objectCopy.push({ id: 3, name: 'Dave' }); // Array structure changes don't affect original
   * console.log(objectArray.length); // 2 - original array length unchanged
   *
   * // Empty arrays
   * const emptyArray: number[] = [];
   * const emptyCopy = Arr.copy(emptyArray); // number[]
   * const emptyTuple = [] as const;
   * const emptyTupleCopy = Arr.copy(emptyTuple); // readonly []
   *
   * // Type inference examples
   * expectType<typeof mutableCopy, number[]>('=');
   * expectType<typeof readonlyCopy, readonly [1, 2, 3]>('=');
   * expectType<typeof tupleCopy, [string, number, boolean]>('=');
   * ```
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice | Array.prototype.slice}
   *   The underlying implementation uses `slice()` for efficient shallow copying
   */
  export const copy = <Ar extends readonly unknown[]>(array: Ar): Ar =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    array.slice() as unknown as Ar;

  /**
   * @internal
   * Helper type for `range` function to represent a sequence of numbers up to N-1.
   * `LEQ[N]` would be `0 | 1 | ... | N-1`.
   */
  type LT = Readonly<{
    [N in SmallUint]: Index<N>;
  }>;

  /**
   * @internal
   * This type is used to avoid incorrect type calculation results for unions with `Seq`.
   * It computes the type of an array generated by `Arr.range(S, E)`.
   * If `S` or `E` is a union type, it falls back to a more general `readonly number[]` type
   * to prevent overly complex or incorrect tuple/union types.
   * Otherwise, it computes a precise tuple type like `readonly [S, S+1, ..., E-1]`.
   * @template S The start of the range (inclusive), constrained to `SmallUint`.
   * @template E The end of the range (exclusive), constrained to `SmallUint`.
   */
  type RangeList<S extends SmallUint, E extends SmallUint> =
    BoolOr<IsUnion<S>, IsUnion<E>> extends true
      ? readonly RelaxedExclude<LT[E], LT[Min<S>]>[] // Avoid incorrect type calculation for unions with Seq
      : List.Skip<S, Seq<E>>;

  expectType<RangeList<1, 5>, readonly [1, 2, 3, 4]>('=');
  expectType<RangeList<1, 2>, readonly [1]>('=');
  expectType<RangeList<1, 1>, readonly []>('=');
  expectType<RangeList<1, 1 | 3>, readonly (1 | 2)[]>('=');
  expectType<RangeList<1 | 3, 3 | 5>, readonly (1 | 2 | 3 | 4)[]>('=');
  expectType<
    RangeList<1 | 2 | 3, 5 | 6 | 7>,
    readonly (1 | 2 | 3 | 4 | 5 | 6)[]
  >('=');
  expectType<RangeList<5, 1>, readonly []>('=');

  /**
   * Creates an array of numbers within a specified range with optional step increment.
   *
   * This function generates arithmetic sequences with advanced compile-time type inference:
   * - When `start` and `end` are {@link SmallUint} literals and `step` is 1 (or omitted), returns a precise tuple type
   * - When parameters are runtime values, returns appropriate array types based on sign constraints
   * - Empty arrays are returned for invalid ranges (e.g., start ≥ end with positive step)
   * - Never throws exceptions - invalid parameters result in empty arrays
   *
   * **SmallUint Constraint:** The {@link SmallUint} constraint (0-255) enables precise tuple type inference
   * for compile-time known ranges. This allows TypeScript to compute exact tuple types like `readonly [1, 2, 3, 4]`
   * instead of generic `readonly number[]`.
   *
   * **Type Inference Behavior:**
   * - Literal {@link SmallUint} values with step=1 → precise tuple type (`RangeList<S, E>`)
   * - Non-negative parameters → `readonly SafeUint[]`
   * - Mixed signs or negative parameters → `readonly SafeInt[]`
   * - Runtime values → lose precise typing but maintain safety
   *
   * @template S The type of the start value. When a {@link SmallUint} literal (0-255), enables precise tuple typing.
   * @template E The type of the end value. When a {@link SmallUint} literal (0-255), enables precise tuple typing.
   * @param start The start of the range (inclusive). Must be a safe integer. Supports:
   *   - **Literal {@link SmallUint}:** Enables precise tuple types (0-255)
   *   - **Runtime {@link SafeInt}:** Fallback to general array types
   *   - **Negative values:** Supported for countdown sequences
   * @param end The end of the range (exclusive). Must be a safe integer. Supports:
   *   - **Literal {@link SmallUint}:** Enables precise tuple types (0-255)
   *   - **Runtime {@link SafeInt}:** Fallback to general array types
   *   - **Equal to start:** Results in empty array
   * @param step The step increment (default: 1). Must be a non-zero safe integer.
   *   - **Positive step:** generates increasing sequence from start to end
   *   - **Negative step:** generates decreasing sequence from start to end
   *   - **Zero step:** Not allowed (branded type prevents this)
   * @returns An immutable array containing the arithmetic sequence. Return type depends on parameters:
   *   - `RangeList<S, E>` (precise tuple like `readonly [1, 2, 3, 4]`) when `S` and `E` are {@link SmallUint} literals and step is 1
   *   - `readonly SafeUint[]` when all parameters are non-negative
   *   - `readonly SafeInt[]` for general integer ranges including negative values
   *
   * @example
   * ```typescript
   * // Compile-time known ranges with step=1 produce precise tuple types
   * const range1to4 = Arr.range(1, 5); // readonly [1, 2, 3, 4]
   * const range0to2 = Arr.range(0, 3); // readonly [0, 1, 2]
   * const emptyRange = Arr.range(5, 5); // readonly []
   * const reverseEmpty = Arr.range(5, 1); // readonly [] (invalid with positive step)
   *
   * // SmallUint constraint examples (0-255 for precise typing)
   * const small = Arr.range(0, 10); // readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   * const maxSmall = Arr.range(250, 255); // readonly [250, 251, 252, 253, 254]
   * const beyondSmall = Arr.range(0, 300); // readonly SafeUint[] (loses precision)
   *
   * // Custom step increments
   * const evens = Arr.range(0, 10, 2); // readonly SafeUint[] -> [0, 2, 4, 6, 8]
   * const odds = Arr.range(1, 10, 2); // readonly SafeUint[] -> [1, 3, 5, 7, 9]
   * const countdown = Arr.range(5, 0, -1); // readonly SafeInt[] -> [5, 4, 3, 2, 1]
   * const bigStep = Arr.range(0, 20, 5); // readonly SafeUint[] -> [0, 5, 10, 15]
   *
   * // Edge cases that return empty arrays
   * const singleElement = Arr.range(3, 4); // readonly [3]
   * const invalidRange = Arr.range(10, 5, 2); // readonly [] (start > end with positive step)
   * const invalidReverse = Arr.range(1, 10, -1); // readonly [] (start < end with negative step)
   * const zeroRange = Arr.range(42, 42); // readonly [] (start equals end)
   *
   * // Runtime ranges lose precise typing but maintain safety
   * const dynamicStart = Math.floor(Math.random() * 10) as SafeInt;
   * const dynamicEnd = (dynamicStart + 5) as SafeInt;
   * const dynamicRange = Arr.range(dynamicStart, dynamicEnd); // readonly SafeInt[]
   *
   * // Negative numbers and mixed signs
   * const negativeRange = Arr.range(-5, 5); // readonly SafeInt[] -> [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]
   * const negativeCountdown = Arr.range(0, -5, -1); // readonly SafeInt[] -> [0, -1, -2, -3, -4]
   *
   * // Useful for generating index ranges and iteration
   * const indices = Arr.range(0, 10); // readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   * const reversedIndices = Arr.range(9, -1, -1); // readonly SafeInt[] -> [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
   *
   * // Functional programming patterns
   * const squares = Arr.range(1, 6).map(x => x * x); // [1, 4, 9, 16, 25]
   * const fibonacci = Arr.range(0, 10).reduce((acc, _, i) => {\n   *   if (i <= 1) return [...acc, i];\n   *   return [...acc, acc[i-1] + acc[i-2]];\n   * }, [] as number[]); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
   *
   * // Type inference examples showing precise vs general types
   * expectType<typeof range1to4, readonly [1, 2, 3, 4]>('='); // Precise tuple
   * expectType<typeof emptyRange, readonly []>('='); // Precise empty tuple
   * expectType<typeof evens, readonly SafeUint[]>('='); // General positive array
   * expectType<typeof countdown, readonly SafeInt[]>('='); // General integer array
   * expectType<typeof negativeRange, readonly SafeInt[]>('='); // General integer array
   * expectType<typeof small, readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]>('='); // Precise tuple
   * expectType<typeof beyondSmall, readonly SafeUint[]>('='); // General array (beyond SmallUint)
   * ```
   *
   * @throws Never throws - invalid ranges simply return empty arrays
   * @see {@link seq} for creating sequences starting from 0
   * @see {@link SmallUint} for understanding the constraint that enables precise typing
   * @see {@link SafeInt} and {@link SafeUint} for the safe integer types used
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const range: RangeFnOverload = ((
    start: SafeIntWithSmallInt,
    end: SafeIntWithSmallInt,
    step: NonZeroSafeIntWithSmallInt = 1,
  ): readonly SafeInt[] =>
    Array.from(rangeIterator(start, end, step))) as RangeFnOverload;

  type RangeFnOverload = {
    <S extends SmallUint, E extends SmallUint>(
      start: S,
      end: E,
      step?: 1,
    ): RangeList<S, E>;

    (
      start: SafeUintWithSmallInt,
      end: SafeUintWithSmallInt,
      step?: PositiveSafeIntWithSmallInt,
    ): readonly SafeUint[];

    (
      start: SafeIntWithSmallInt,
      end: SafeIntWithSmallInt,
      step?: NonZeroSafeIntWithSmallInt,
    ): readonly SafeInt[];
  };

  // element access

  /**
   * Safely retrieves an element at a given index from an array, returning an {@link Optional}.
   *
   * This function provides type-safe array access with support for negative indexing
   * (e.g., -1 for the last element). Unlike direct array access which can return
   * `undefined` for out-of-bounds indices, this function always returns a well-typed
   * {@link Optional} that explicitly represents the possibility of absence.
   *
   * **Negative Indexing:** Negative indices count from the end of the array:
   * - `-1` refers to the last element
   * - `-2` refers to the second-to-last element, etc.
   *
   * **Curried Usage:** This function supports currying - when called with only an index, it returns
   * a function that can be applied to arrays, making it ideal for use in pipe operations.
   *
   * **Optional Return Type:** The return type is always {@link Optional}<E> which provides:
   * - Type-safe access without `undefined` in your business logic
   * - Explicit handling of \"not found\" cases
   * - Composable error handling with {@link Optional} utilities
   *
   * @template E The type of elements in the array.
   * @param array The array to access (when using direct call syntax).
   * @param index The index to access. Must be a branded `SizeType.ArgArr` (safe integer). Can be:
   *   - **Positive integer:** 0-based index from the start (0, 1, 2, ...)
   *   - **Negative integer:** index from the end (-1 is last element, -2 is second-to-last, etc.)
   *   - **Out of bounds:** any index beyond array bounds returns {@link Optional.None}
   * @returns An {@link Optional}<E> containing:
   *   - {@link Optional.Some}<E> with the element if the index is valid
   *   - {@link Optional.None} if the index is out of bounds (including empty arrays)
   *
   * @example
   * ```typescript
   * // Direct usage with positive indices
   * const fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
   * const first = Arr.at(fruits, 0); // Optional.Some('apple')
   * const third = Arr.at(fruits, 2); // Optional.Some('cherry')
   * const outOfBounds = Arr.at(fruits, 10); // Optional.None
   *
   * // Negative indexing (accessing from the end)
   * const last = Arr.at(fruits, -1); // Optional.Some('elderberry')
   * const secondLast = Arr.at(fruits, -2); // Optional.Some('date')
   * const negativeOutOfBounds = Arr.at(fruits, -10); // Optional.None
   *
   * // Edge cases
   * const emptyResult = Arr.at([], 0); // Optional.None
   * const negativeOnEmpty = Arr.at([], -1); // Optional.None
   * const singleElement = Arr.at(['only'], 0); // Optional.Some('only')
   * const singleNegative = Arr.at(['only'], -1); // Optional.Some('only')
   *
   * // Safe access pattern with type-safe unwrapping
   * const maybeElement = Arr.at(fruits, 2);
   * if (Optional.isSome(maybeElement)) {
   *   console.log(`Found: ${maybeElement.value}`); // Type-safe access, no undefined
   * } else {
   *   console.log('Index out of bounds');
   * }
   *
   * // Alternative unwrapping with default
   * const elementOrDefault = Optional.unwrapOr(Arr.at(fruits, 100), 'not found');
   * console.log(elementOrDefault); // 'not found'
   *
   * // Curried usage for functional composition
   * const getSecondElement = Arr.at(1);
   * const getLastElement = Arr.at(-1);
   * const getMiddleElement = Arr.at(2);
   *
   * const nestedArrays = [
   *   [10, 20, 30, 40],
   *   [50, 60],
   *   [70]
   * ];
   * const secondElements = nestedArrays.map(getSecondElement);
   * // [Optional.Some(20), Optional.None, Optional.None]
   *
   * const lastElements = nestedArrays.map(getLastElement);
   * // [Optional.Some(40), Optional.Some(60), Optional.Some(70)]
   *
   * // Pipe composition for data processing
   * const processArray = (arr: readonly string[]) => pipe(arr)
   *   .map(getSecondElement)
   *   .map(opt => Optional.map(opt, s => s.toUpperCase()))
   *   .map(opt => Optional.unwrapOr(opt, 'MISSING'))
   *   .value;
   *
   * console.log(processArray(['a', 'b', 'c'])); // 'B'
   * console.log(processArray(['x'])); // 'MISSING'
   *
   * // Advanced curried usage with transformation pipelines
   * const extractAndProcess = pipe([
   *   ['hello', 'world', 'typescript'],
   *   ['functional', 'programming'],
   *   ['type', 'safety', 'matters', 'most']
   * ])
   *   .map(arr => arr.map(getSecondElement))
   *   .map(opts => opts.map(opt => Optional.unwrapOr(opt, '[missing]')))
   *   .value;
   * // [['world'], ['[missing]'], ['safety']]
   *
   * // Type inference examples
   * expectType<typeof first, Optional<string>>('=');
   * expectType<typeof getSecondElement, <T>(array: readonly T[]) => Optional<T>>('=');
   * expectType<typeof negativeOutOfBounds, Optional<string>>('=');
   * ```
   *
   * @see {@link head} for getting the first element specifically
   * @see {@link last} for getting the last element specifically
   * @see {@link Optional} for working with the returned Optional values
   * @see {@link Optional.unwrapOr} for safe unwrapping with defaults
   * @see {@link Optional.map} for transforming Optional values
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const at: AtFnOverload = (<E,>(
    ...args:
      | readonly [array: readonly E[], index: SizeType.ArgArr]
      | readonly [index: SizeType.ArgArr]
  ): Optional<E> | (<E2>(array: readonly E2[]) => Optional<E2>) => {
    switch (args.length) {
      case 2: {
        const [array, index] = args;
        return pipe(index < 0 ? array.length + index : index).map(
          (normalizedIndex) =>
            normalizedIndex < 0 || normalizedIndex >= array.length
              ? Optional.none
              : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                Optional.some(array[normalizedIndex]!),
        ).value;
      }
      case 1: {
        const [index] = args;
        return <E2,>(array: readonly E2[]) => at(array, index);
      }
    }
  }) as AtFnOverload;

  /**
   * Function type for safely accessing an array element at a given index.
   */
  type AtFnOverload = {
    <E>(array: readonly E[], index: SizeType.ArgArr): Optional<E>;

    // Curried version
    (index: SizeType.ArgArr): <E>(array: readonly E[]) => Optional<E>;
  };

  /**
   * Returns the first element of an array wrapped in an Optional.
   *
   * This function provides type-safe access to the first element with precise return types:
   * - For empty arrays: returns `Optional.None`
   * - For tuples with known first element: returns `Optional.Some<FirstElementType>`
   * - For non-empty arrays: returns `Optional.Some<ElementType>`
   * - For general arrays: returns `Optional<ElementType>`
   *
   * The function leverages TypeScript's type system to provide the most precise return type
   * based on the input array type, making it safer than direct indexing.
   *
   * @template E The type of elements in the array.
   * @param array The array to get the first element from.
   * @returns An Optional containing the first element:
   *   - `Optional.None` if the array is empty
   *   - `Optional.Some<E>` containing the first element if the array is non-empty
   *
   * @example
   * ```typescript
   * // Empty array - precise None type
   * const emptyResult = Arr.head([]); // Optional.None
   * console.log(Optional.isNone(emptyResult)); // true
   *
   * // Tuple with known structure - precise Some type
   * const tupleResult = Arr.head(['first', 'second', 'third'] as const);
   * // Type: Optional.Some<'first'>
   * if (Optional.isSome(tupleResult)) {
   *   console.log(tupleResult.value); // 'first' - TypeScript knows exact type
   * }
   *
   * // Non-empty array - guaranteed Some type
   * const nonEmpty: NonEmptyArray<number> = [10, 20, 30] as NonEmptyArray<number>;
   * const guaranteedResult = Arr.head(nonEmpty); // Optional.Some<number>
   * // No need to check - always Some for NonEmptyArray
   *
   * // General array - may be Some or None
   * const generalArray: number[] = [1, 2, 3];
   * const maybeResult = Arr.head(generalArray); // Optional<number>
   * if (Optional.isSome(maybeResult)) {
   *   console.log(`First element: ${maybeResult.value}`);
   * } else {
   *   console.log('Array is empty');
   * }
   *
   * // Working with different types
   * const strings = ['hello', 'world'];
   * const firstString = Arr.head(strings); // Optional<string>
   *
   * const objects = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
   * const firstObject = Arr.head(objects); // Optional<{id: number, name: string}>
   *
   * // Functional composition
   * const getFirstElements = (arrays: readonly number[][]) =>
   *   arrays.map(Arr.head).filter(Optional.isSome);
   *
   * const nestedArrays = [[1, 2], [3, 4], [], [5]];
   * const firstElements = getFirstElements(nestedArrays);
   * // [Optional.Some(1), Optional.Some(3), Optional.Some(5)]
   *
   * // Type inference examples
   * expectType<typeof emptyResult, Optional.None>('=');
   * expectType<typeof tupleResult, Optional.Some<'first'>>('=');
   * expectType<typeof guaranteedResult, Optional.Some<number>>('=');
   * expectType<typeof maybeResult, Optional<number>>('=');
   * ```
   *
   * @see {@link last} for getting the last element
   * @see {@link at} for accessing elements at specific indices
   * @see {@link tail} for getting all elements except the first
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const head: HeadFnOverload = (<E,>(array: readonly E[]) => {
    const element = array.at(0);
    return element === undefined ? Optional.none : Optional.some(element);
  }) as HeadFnOverload;

  type HeadFnOverload = {
    /**
     * Get head of empty array.
     */
    (array: readonly []): Optional.None;

    /**
     * Get head of tuple.
     */
    <E, L extends readonly unknown[]>(
      array: readonly [E, ...L],
    ): Optional.Some<E>;

    /**
     * Get head of non-empty array.
     */
    <E>(array: NonEmptyArray<E>): Optional.Some<E>;

    /**
     * Get head of any array.
     */
    <E>(array: readonly E[]): Optional<E>;
  };

  /**
   * Returns the last element of an array wrapped in an Optional.
   *
   * This function provides type-safe access to the last element with precise return types:
   * - For empty arrays: returns `Optional.None`
   * - For tuples with known last element: returns `Optional.Some<LastElementType>`
   * - For non-empty arrays: returns `Optional.Some<ElementType>`
   * - For general arrays: returns `Optional<ElementType>`
   *
   * The function leverages TypeScript's type system to provide the most precise return type
   * based on the input array type, making it safer than direct indexing.
   *
   * @template E The type of elements in the array.
   * @param array The array to get the last element from.
   * @returns An Optional containing the last element:
   *   - `Optional.None` if the array is empty
   *   - `Optional.Some<E>` containing the last element if the array is non-empty
   *
   * @example
   * ```typescript
   * // Empty array - precise None type
   * const emptyResult = Arr.last([]); // Optional.None
   * console.log(Optional.isNone(emptyResult)); // true
   *
   * // Tuple with known structure - precise Some type
   * const tupleResult = Arr.last(['first', 'middle', 'last'] as const);
   * // Type: Optional.Some<'last'>
   * if (Optional.isSome(tupleResult)) {
   *   console.log(tupleResult.value); // 'last' - TypeScript knows exact type
   * }
   *
   * // Non-empty array - guaranteed Some type
   * const nonEmpty: NonEmptyArray<number> = [10, 20, 30] as NonEmptyArray<number>;
   * const guaranteedResult = Arr.last(nonEmpty); // Optional.Some<number>
   * // No need to check - always Some for NonEmptyArray
   *
   * // General array - may be Some or None
   * const generalArray: number[] = [1, 2, 3];
   * const maybeResult = Arr.last(generalArray); // Optional<number>
   * if (Optional.isSome(maybeResult)) {
   *   console.log(`Last element: ${maybeResult.value}`);
   * } else {
   *   console.log('Array is empty');
   * }
   *
   * // Working with different types
   * const strings = ['hello', 'world', 'example'];
   * const lastString = Arr.last(strings); // Optional<string>
   *
   * const coordinates = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}];
   * const lastCoordinate = Arr.last(coordinates); // Optional<{x: number, y: number}>
   *
   * // Single element arrays
   * const single = [42];
   * const singleResult = Arr.last(single); // Optional<number> containing 42
   *
   * // Functional composition with arrays of arrays
   * const getLastElements = (arrays: readonly string[][]) =>
   *   arrays.map(Arr.last).filter(Optional.isSome);
   *
   * const nestedArrays = [['a', 'b'], ['c'], [], ['d', 'e', 'f']];
   * const lastElements = getLastElements(nestedArrays);
   * // [Optional.Some('b'), Optional.Some('c'), Optional.Some('f')]
   *
   * // Common pattern: get last element or default
   * const data = [10, 20, 30];
   * const lastOrDefault = Optional.unwrapOr(Arr.last(data), 0); // 30
   * const emptyLastOrDefault = Optional.unwrapOr(Arr.last([]), 0); // 0
   *
   * // Type inference examples
   * expectType<typeof emptyResult, Optional.None>('=');
   * expectType<typeof tupleResult, Optional.Some<'last'>>('=');
   * expectType<typeof guaranteedResult, Optional.Some<number>>('=');
   * expectType<typeof maybeResult, Optional<number>>('=');
   * ```
   *
   * @see {@link head} for getting the first element
   * @see {@link at} for accessing elements at specific indices with negative indexing support
   * @see {@link butLast} for getting all elements except the last
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const last: LastFnOverload = (<E,>(array: readonly E[]) => {
    const element = array.at(-1);
    return element === undefined ? Optional.none : Optional.some(element);
  }) as LastFnOverload;

  type LastFnOverload = {
    /**
     * Get last of empty array.
     */
    (array: readonly []): Optional.None;

    /**
     * Get last of tuple.
     */
    <Ar extends readonly unknown[], L>(
      array: readonly [...Ar, L],
    ): Optional.Some<L>;

    /**
     * Get last of non-empty array.
     */
    <E>(array: NonEmptyArray<E>): Optional.Some<E>;

    /**
     * Get last of any array.
     */
    <E>(array: readonly E[]): Optional<E>;
  };

  // slicing

  /**
   * Slices an array with automatically clamped start and end indices for safe bounds handling.
   *
   * This function provides a safer alternative to `Array.slice()` by automatically clamping
   * the start and end indices to valid bounds, preventing out-of-bounds access and ensuring
   * consistent behavior regardless of input values.
   *
   * **Clamping Behavior:**
   * - `start` is clamped to `[0, array.length]`
   * - `end` is clamped to `[clampedStart, array.length]` (ensuring end ≥ start)
   * - Invalid ranges (start > end after clamping) return empty arrays
   * - Negative indices are clamped to 0, large indices are clamped to array.length
   *
   * **Curried Usage:** This function supports currying - when called with only start and end
   * indices, it returns a function that can be applied to arrays.
   *
   * @template E The type of elements in the array.
   * @param array The array to slice (when using direct call syntax).
   * @param start The start index for the slice (inclusive). Will be clamped to valid bounds.
   * @param end The end index for the slice (exclusive). Will be clamped to valid bounds.
   * @returns A new immutable array containing the sliced elements. Always returns a valid array,
   *   never throws for out-of-bounds indices.
   *
   * @example
   * ```typescript
   * const data = [10, 20, 30, 40, 50];
   *
   * // Normal slicing
   * const middle = Arr.sliceClamped(data, 1, 4); // [20, 30, 40]
   * const beginning = Arr.sliceClamped(data, 0, 2); // [10, 20]
   * const end = Arr.sliceClamped(data, 3, 5); // [40, 50]
   *
   * // Automatic clamping for out-of-bounds indices
   * const clampedStart = Arr.sliceClamped(data, -10, 3); // [10, 20, 30] (start clamped to 0)
   * const clampedEnd = Arr.sliceClamped(data, 2, 100); // [30, 40, 50] (end clamped to length)
   * const bothClamped = Arr.sliceClamped(data, -5, 100); // [10, 20, 30, 40, 50] (entire array)
   *
   * // Invalid ranges become empty arrays
   * const emptyReversed = Arr.sliceClamped(data, 4, 1); // [] (start > end after clamping)
   * const emptyAtEnd = Arr.sliceClamped(data, 5, 10); // [] (start at end of array)
   *
   * // Edge cases
   * const emptyArray = Arr.sliceClamped([], 0, 5); // [] (empty input)
   * const singleElement = Arr.sliceClamped([42], 0, 1); // [42]
   * const fullCopy = Arr.sliceClamped(data, 0, data.length); // [10, 20, 30, 40, 50]
   *
   * // Curried usage for functional composition
   * const takeFirst3 = Arr.sliceClamped(0, 3);
   * const getMiddle2 = Arr.sliceClamped(1, 3);
   *
   * const arrays = [
   *   [1, 2, 3, 4, 5],
   *   [10, 20],
   *   [100, 200, 300, 400, 500, 600]
   * ];
   *
   * const first3Elements = arrays.map(takeFirst3);
   * // [[1, 2, 3], [10, 20], [100, 200, 300]]
   *
   * const middle2Elements = arrays.map(getMiddle2);
   * // [[2, 3], [20], [200, 300]]
   *
   * // Pipe composition
   * const result = pipe([1, 2, 3, 4, 5, 6])
   *   .map(takeFirst3)
   *   .map(Arr.sum)
   *   .value; // 6 (sum of [1, 2, 3])
   *
   * // Comparison with regular Array.slice (which can throw or behave unexpectedly)
   * try {
   *   // Regular slice with out-of-bounds - works but may be unintuitive
   *   const regularSlice = data.slice(-10, 100); // [10, 20, 30, 40, 50]
   *   // sliceClamped provides same safe behavior explicitly
   *   const clampedSlice = Arr.sliceClamped(data, -10, 100); // [10, 20, 30, 40, 50]
   * } catch (error) {
   *   // sliceClamped never throws
   * }
   * ```
   *
   * @see {@link take} for taking the first N elements
   * @see {@link skip} for skipping the first N elements
   * @see {@link takeLast} for taking the last N elements
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const sliceClamped: SliceClampedFnOverload = (<E,>(
    ...args:
      | readonly [readonly E[], SizeType.ArgArr, SizeType.ArgArr]
      | readonly [SizeType.ArgArr, SizeType.ArgArr]
  ) => {
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
        return <E2,>(array: readonly E2[]) => sliceClamped(array, start, end);
      }
    }
  }) as SliceClampedFnOverload;

  type SliceClampedFnOverload = {
    <E>(
      array: readonly E[],
      start: SizeType.ArgArr,
      end: SizeType.ArgArr,
    ): readonly E[];

    // Curried version
    (
      start: SizeType.ArgArr,
      end: SizeType.ArgArr,
    ): <E>(array: readonly E[]) => readonly E[];
  };

  /**
   * Returns all elements of an array except the first one.
   * @template E The type of the array (can be a tuple for more precise typing).
   * @param array The input array.
   * @returns A new array containing all elements except the first. The type is inferred as `List.Tail<T>`.
   * @example
   * ```ts
   * Arr.tail([1, 2, 3] as const); // [2, 3]
   * Arr.tail([1] as const); // []
   * Arr.tail([]); // []
   * ```
   */
  export const tail = <Ar extends readonly unknown[]>(
    array: Ar,
  ): List.Tail<Ar> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    array.slice(1) as unknown as List.Tail<Ar>;

  /**
   * Returns all elements of an array except the last one.
   * @template E The type of the array (can be a tuple for more precise typing).
   * @param array The input array.
   * @returns A new array containing all elements except the last. The type is inferred as `List.ButLast<T>`.
   * @example
   * ```ts
   * Arr.butLast([1, 2, 3] as const); // [1, 2]
   * Arr.butLast([1] as const); // []
   * Arr.butLast([]); // []
   * ```
   */
  export const butLast = <Ar extends readonly unknown[]>(
    array: Ar,
  ): List.ButLast<Ar> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    (isEmpty(array) ? [] : array.slice(0, -1)) as unknown as List.ButLast<Ar>;

  /**
   * Takes the first N elements from an array.
   *
   * - If the array is a tuple, the return type is inferred as a tuple of the first N elements.
   * - If the array is a NonEmptyArray and N is a SizeType.ArgArrPositive, returns a NonEmptyArray.
   * - Otherwise, returns a readonly array of up to N elements.
   *
   * @template E The type of the array (can be a tuple for more precise typing).
   * @template N The number of elements to take, constrained to `SmallUint`.
   * @param array The input array.
   * @param num The number of elements to take.
   * @returns A new array containing the first N elements.
   * @example
   * ```ts
   * // Regular usage
   * Arr.take([1, 2, 3, 4] as const, 2); // [1, 2]
   *
   * // Curried usage for pipe composition
   * const takeFirst3 = Arr.take(3);
   * const result = pipe([1, 2, 3, 4, 5]).map(takeFirst3).value;
   * console.log(result); // [1, 2, 3]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const take: TakeFnOverload = (<Ar extends readonly unknown[]>(
    ...args:
      | readonly [array: Ar, num: SizeType.ArgArrNonNegative]
      | readonly [num: SizeType.ArgArrNonNegative]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, num] = args;
        return sliceClamped(array, 0, num);
      }
      case 1: {
        const [num] = args;
        return <E,>(array: readonly E[]) => take(array, num);
      }
    }
  }) as unknown as TakeFnOverload;

  type TakeFnOverload = {
    <Ar extends readonly unknown[], N extends SmallUint>(
      array: Ar,
      num: N,
    ): List.Take<N, Ar>;

    // curried version
    <N extends SmallUint>(
      num: N,
    ): <Ar extends readonly unknown[]>(array: Ar) => List.Take<N, Ar>;

    <E>(
      array: NonEmptyArray<E>,
      num: SizeType.ArgArrPositive,
    ): NonEmptyArray<E>;

    // curried version
    (
      num: SizeType.ArgArrPositive,
    ): <E>(array: NonEmptyArray<E>) => NonEmptyArray<E>;

    <E>(array: readonly E[], num: SizeType.ArgArrNonNegative): readonly E[];

    // curried version
    (num: SizeType.ArgArrNonNegative): <E>(array: readonly E[]) => readonly E[];
  };

  /**
   * Takes the last N elements from an array.
   *
   * - If the array is a tuple, the return type is inferred as a tuple of the last N elements.
   * - If the array is a non-empty array and N is a positive integer, returns a non-empty array.
   * - Otherwise, returns a readonly array of up to N elements.
   *
   * @template E The type of the array (can be a tuple for more precise typing).
   * @template N The number of elements to take, constrained to `SmallUint`.
   * @param array The input array.
   * @param num The number of elements to take.
   * @returns A new array containing the last N elements.
   * @example
   * ```ts
   * // Regular usage
   * Arr.takeLast([1, 2, 3, 4] as const, 2); // [3, 4]
   *
   * // Curried usage for pipe composition
   * const takeLast2 = Arr.takeLast(2);
   * const result = pipe([1, 2, 3, 4, 5]).map(takeLast2).value;
   * console.log(result); // [4, 5]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const takeLast: TakeLastFnOverload = (<Ar extends readonly unknown[]>(
    ...args:
      | readonly [array: Ar, num: SizeType.ArgArrNonNegative]
      | readonly [num: SizeType.ArgArrNonNegative]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, num] = args;
        return sliceClamped(array, Uint32.sub(size(array), num), size(array));
      }
      case 1: {
        const [num] = args;
        return <E,>(array: readonly E[]) => takeLast(array, num);
      }
    }
  }) as unknown as TakeLastFnOverload;

  type TakeLastFnOverload = {
    <Ar extends readonly unknown[], N extends SmallUint>(
      array: Ar,
      num: N,
    ): List.TakeLast<N, Ar>;

    // curried version
    <N extends SmallUint>(
      num: N,
    ): <Ar extends readonly unknown[]>(array: Ar) => List.TakeLast<N, Ar>;

    <E>(
      array: NonEmptyArray<E>,
      num: SizeType.ArgArrPositive,
    ): NonEmptyArray<E>;

    // curried version
    (
      num: SizeType.ArgArrPositive,
    ): <E>(array: NonEmptyArray<E>) => NonEmptyArray<E>;

    <E>(array: readonly E[], num: SizeType.ArgArrNonNegative): readonly E[];

    // curried version
    (num: SizeType.ArgArrNonNegative): <E>(array: readonly E[]) => readonly E[];
  };

  /**
   * Skips the first N elements of an array.
   *
   * - If the array is a tuple, the return type is inferred as a tuple with the first N elements removed.
   * - If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
   * - Otherwise, returns a readonly array with the first N elements skipped.
   *
   * @template E The type of the array (can be a tuple for more precise typing).
   * @template N The number of elements to skip, constrained to `SmallUint`.
   * @param array The input array.
   * @param num The number of elements to skip.
   * @returns A new array containing the elements after skipping the first N.
   * @example
   * ```ts
   * // Regular usage
   * Arr.skip([1, 2, 3, 4] as const, 2); // [3, 4]
   *
   * // Curried usage for pipe composition
   * const skipFirst2 = Arr.skip(2);
   * const result = pipe([1, 2, 3, 4, 5]).map(skipFirst2).value;
   * console.log(result); // [3, 4, 5]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const skip: SkipFnOverload = (<E,>(
    ...args:
      | readonly [readonly E[], SizeType.ArgArrNonNegative]
      | readonly [SizeType.ArgArrNonNegative]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, num] = args;
        return sliceClamped(array, num, size(array));
      }
      case 1: {
        const [num] = args;
        return <E2,>(array: readonly E2[]) => skip(array, num);
      }
    }
  }) as SkipFnOverload;

  type SkipFnOverload = {
    <Ar extends readonly unknown[], N extends SmallUint>(
      array: Ar,
      num: N,
    ): List.Skip<N, Ar>;

    <E>(array: NonEmptyArray<E>, num: SizeType.ArgArrPositive): readonly E[];

    <E>(array: readonly E[], num: SizeType.ArgArrNonNegative): readonly E[];

    // curried version
    <N extends SmallUint>(
      num: N,
    ): <Ar extends readonly unknown[]>(array: Ar) => List.Skip<N, Ar>;

    (
      num: SizeType.ArgArrPositive,
    ): <E>(array: NonEmptyArray<E>) => readonly E[];

    (num: SizeType.ArgArrNonNegative): <E>(array: readonly E[]) => readonly E[];
  };

  /**
   * Skips the last N elements of an array.
   *
   * - If the array is a tuple, the return type is inferred as a tuple with the last N elements removed.
   * - If the array is a non-empty array and N is a positive integer, returns a readonly array (may be empty).
   * - Otherwise, returns a readonly array with the last N elements skipped.
   *
   * @template E The type of the array (can be a tuple for more precise typing).
   * @template N The number of elements to skip, constrained to `SmallUint`.
   * @param array The input array.
   * @param num The number of elements to skip from the end.
   * @returns A new array containing the elements after skipping the last N.
   * @example
   * ```ts
   * // Regular usage
   * Arr.skipLast([1, 2, 3, 4] as const, 2); // [1, 2]
   *
   * // Curried usage for pipe composition
   * const skipLast2 = Arr.skipLast(2);
   * const result = pipe([1, 2, 3, 4, 5]).map(skipLast2).value;
   * console.log(result); // [1, 2, 3]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const skipLast: SkipLastFnOverload = (<E,>(
    ...args:
      | readonly [array: readonly E[], num: SizeType.ArgArrNonNegative]
      | readonly [num: SizeType.ArgArrNonNegative]
  ): readonly E[] | ((array: readonly E[]) => readonly E[]) => {
    switch (args.length) {
      case 2: {
        const [array, num] = args;
        return sliceClamped(array, 0, Uint32.sub(size(array), num));
      }
      case 1: {
        const [num] = args;
        return <E2,>(array: readonly E2[]) => skipLast(array, num);
      }
    }
  }) as SkipLastFnOverload;

  type SkipLastFnOverload = {
    <Ar extends readonly unknown[], N extends SmallUint>(
      array: Ar,
      num: N,
    ): List.SkipLast<N, Ar>;

    <E>(array: readonly E[], num: SizeType.ArgArrNonNegative): readonly E[];

    // curried version
    <N extends SmallUint>(
      num: N,
    ): <Ar extends readonly unknown[]>(array: Ar) => List.SkipLast<N, Ar>;

    (num: SizeType.ArgArrNonNegative): <E>(array: readonly E[]) => readonly E[];
  };

  // modification (returns new array)

  /**
   * Returns a new array with the element at the specified index updated by a function.
   *
   * This function provides immutable array updates with type-safe bounds checking. It applies an updater
   * function to the element at the given index and returns a new array with the transformed value.
   * The original array is never modified, ensuring immutability.
   *
   * **Type Union Behavior:** When the updater function returns a different type `U` than the original
   * element type `E`, the result type becomes `readonly (E | U)[]` to accommodate both original and
   * updated element types. This ensures type safety when elements have different types after updating.
   *
   * **Bounds Checking:** Unlike native array access which can cause runtime errors, this function
   * performs safe bounds checking:
   * - **Valid index:** Creates new array with updated element
   * - **Invalid index:** Returns the original array unchanged (no errors thrown)
   * - **Negative index:** Treated as invalid (returns original array)
   *
   * **Curried Usage:** Supports currying for functional composition - when called with only index and
   * updater, returns a reusable function that can be applied to arrays.
   *
   * @template E The type of elements in the original array.
   * @template U The type of the value returned by the updater function.
   * @param array The input array to update. Can be any readonly array.
   * @param index The index of the element to update. Must be a non-negative {@link SizeType.ArgArrNonNegative}.
   *   - **Valid range:** `0 <= index < array.length`
   *   - **Out of bounds:** Returns original array unchanged
   *   - **Negative values:** Not allowed by type system (non-negative constraint)
   * @param updater A function `(prev: E) => U` that transforms the existing element:
   *   - **prev:** The current element at the specified index
   *   - **returns:** The new value to place at that index (can be different type)
   * @returns A new `readonly (E | U)[]` array where:
   *   - All elements except the target index remain unchanged (type `E`)
   *   - The element at the target index is replaced with the updater result (type `U`)
   *   - Type union `E | U` accommodates both original and updated element types
   *   - If index is out of bounds, returns the original array unchanged
   *
   * @example
   * ```typescript
   * // Basic usage with same type transformation
   * const numbers = [1, 2, 3, 4, 5];
   * const doubled = Arr.toUpdated(numbers, 2, x => x * 2);
   * // readonly number[] -> [1, 2, 6, 4, 5]
   *
   * // Type union when updater returns different type
   * const mixed = Arr.toUpdated(numbers, 1, x => `value: ${x}`);
   * // readonly (number | string)[] -> [1, 'value: 2', 3, 4, 5]
   *
   * // Complex object updates
   * const users = [
   *   { id: 1, name: 'Alice', active: true },
   *   { id: 2, name: 'Bob', active: false },
   *   { id: 3, name: 'Charlie', active: true }
   * ];
   *
   * const activatedUser = Arr.toUpdated(users, 1, user => ({
   *   ...user,
   *   active: true,
   *   lastUpdated: new Date()
   * }));
   * // Bob is now active with lastUpdated field
   *
   * // Bounds checking behavior
   * const safe1 = Arr.toUpdated([1, 2, 3], 10, x => x * 2); // [1, 2, 3] (index out of bounds)
   * const safe2 = Arr.toUpdated([1, 2, 3], 0, x => x * 2); // [2, 2, 3] (valid index)
   * const safe3 = Arr.toUpdated([], 0, x => x); // [] (empty array, index out of bounds)
   *
   * // Functional transformations
   * const products = [
   *   { name: 'laptop', price: 1000 },
   *   { name: 'mouse', price: 25 },
   *   { name: 'keyboard', price: 75 }
   * ];
   *
   * const discounted = Arr.toUpdated(products, 0, product => ({
   *   ...product,
   *   price: Math.round(product.price * 0.8), // 20% discount
   *   onSale: true
   * }));
   * // First product now has discounted price and onSale flag
   *
   * // Curried usage for reusable updates
   * const doubleAtIndex2 = Arr.toUpdated(2, (x: number) => x * 2);
   * const capitalizeAtIndex0 = Arr.toUpdated(0, (s: string) => s.toUpperCase());
   * const markCompleteAtIndex = (index: number) =>
   *   Arr.toUpdated(index, (task: {done: boolean}) => ({...task, done: true}));
   *
   * const numberArrays = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
   * const allDoubled = numberArrays.map(doubleAtIndex2);
   * // [[1, 2, 6], [4, 5, 12], [7, 8, 18]]
   *
   * const words = [['hello', 'world'], ['foo', 'bar'], ['type', 'script']];
   * const capitalized = words.map(capitalizeAtIndex0);
   * // [['HELLO', 'world'], ['FOO', 'bar'], ['TYPE', 'script']]
   *
   * // Pipe composition for data processing
   * const processArray = (arr: readonly number[]) => pipe(arr)
   *   .map(Arr.toUpdated(0, x => x * 10)) // Scale first element
   *   .map(Arr.toUpdated(1, x => typeof x === 'number' ? x + 100 : x)) // Add to second if number
   *   .value;
   *
   * console.log(processArray([1, 2, 3])); // [10, 102, 3]
   *
   * // Multiple sequential updates
   * const pipeline = (data: readonly number[]) => pipe(data)
   *   .map(Arr.toUpdated(0, x => x * 2))
   *   .map(Arr.toUpdated(1, x => typeof x === 'number' ? x + 10 : x))
   *   .map(Arr.toUpdated(2, x => typeof x === 'number' ? x.toString() : x))
   *   .value;
   *
   * console.log(pipeline([1, 2, 3])); // [2, 12, '3'] - readonly (number | string)[]
   *
   * // Error-safe updates in data processing
   * const safeUpdate = <T, U>(
   *   array: readonly T[],
   *   index: number,
   *   updater: (value: T) => U
   * ) => {
   *   if (index < 0 || index >= array.length) {
   *     console.warn(`Index ${index} out of bounds for array of length ${array.length}`);
   *     return array;
   *   }
   *   return Arr.toUpdated(array, index as SizeType.ArgArrNonNegative, updater);
   * };
   *
   * // Advanced: State management pattern
   * type AppState = {
   *   users: Array<{id: number, name: string}>;
   *   currentUserId: number;
   * };
   *
   * const updateUserName = (state: AppState, userId: number, newName: string): AppState => {
   *   const userIndex = state.users.findIndex(u => u.id === userId);
   *   if (userIndex === -1) return state;
   *
   *   return {
   *     ...state,
   *     users: Arr.toUpdated(state.users, userIndex as SizeType.ArgArrNonNegative, user => ({
   *       ...user,
   *       name: newName
   *     }))
   *   };
   * };
   *
   * // Type inference examples showing union types
   * expectType<typeof doubled, readonly number[]>('='); // Same type
   * expectType<typeof mixed, readonly (number | string)[]>('='); // Union type
   * expectType<typeof doubleAtIndex2, <T extends readonly number[]>(array: T) => readonly (number | number)[]>('=');
   * expectType<typeof safe1, readonly number[]>('='); // Bounds check preserves type
   * ```
   *
   * @see {@link Array.prototype.with} for the native method with different error handling
   * @see {@link SizeType.ArgArrNonNegative} for the index type constraint
   * @see Immutable update patterns for functional programming approaches
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const toUpdated: ToUpdatedFnOverload = (<E, U>(
    ...args:
      | readonly [
          array: readonly E[],
          index: SizeType.ArgArrNonNegative,
          updater: (prev: E) => U,
        ]
      | readonly [index: SizeType.ArgArrNonNegative, updater: (prev: E) => U]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, index, updater] = args;
        return index < 0 || index >= array.length
          ? array // Return a copy if index is out of bounds
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-type-assertion
            (array as (E | U)[]).with(index, updater(array[index]!));
      }
      case 2: {
        const [index, updater] = args;
        return (array: readonly E[]) => toUpdated(array, index, updater);
      }
    }
  }) as ToUpdatedFnOverload;

  type ToUpdatedFnOverload = {
    <E, U>(
      array: readonly E[],
      index: SizeType.ArgArrNonNegative,
      updater: (prev: E) => U,
    ): readonly (E | U)[];

    // curried version
    <E, U>(
      index: SizeType.ArgArrNonNegative,
      updater: (prev: E) => U,
    ): (array: readonly E[]) => readonly (E | U)[];
  };

  /**
   * Returns a new array with a new value inserted at the specified index.
   * Index can be out of bounds (e.g., negative or greater than length), `toSpliced` handles this.
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param index The index at which to insert the new value.
   * @param newValue The value to insert.
   * @returns A new array with the value inserted.
   * @example
   * ```ts
   * // Regular usage
   * Arr.toInserted([1, 2, 3], 1, 10); // [1, 10, 2, 3]
   *
   * // Curried usage for pipe composition
   * const insertAtStart = Arr.toInserted(0, 99);
   * const result = pipe([1, 2, 3]).map(insertAtStart).value;
   * console.log(result); // [99, 1, 2, 3]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const toInserted: ToInsertedFnOverload = (<E, V = E>(
    ...args:
      | readonly [
          array: readonly E[],
          index: SizeType.ArgArrNonNegative,
          newValue: V,
        ]
      | readonly [index: SizeType.ArgArrNonNegative, newValue: V]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, index, newValue] = args;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return (array as (E | V)[]).toSpliced(
          index,
          0,
          newValue,
        ) as MutableNonEmptyArray<E | V>;
      }
      case 2: {
        const [index, newValue] = args;
        return <E2,>(array: readonly (E2 | V)[]) =>
          toInserted(array, index, newValue);
      }
    }
  }) as ToInsertedFnOverload;

  type ToInsertedFnOverload = {
    <E, const V = E>(
      array: readonly E[],
      index: SizeType.ArgArrNonNegative,
      newValue: V,
    ): NonEmptyArray<E | V>;

    // curried version
    <E, const V = E>(
      index: SizeType.ArgArrNonNegative,
      newValue: V,
    ): (array: readonly E[]) => NonEmptyArray<E | V>;
  };

  /**
   * Returns a new array with the element at the specified index removed.
   * If index is out of bounds, `toSpliced` handles this (usually by returning a copy).
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param index The index of the element to remove.
   * @returns A new array with the element removed.
   * @example
   * ```ts
   * // Regular usage
   * Arr.toRemoved([1, 2, 3], 1); // [1, 3]
   *
   * // Curried usage for pipe composition
   * const removeFirst = Arr.toRemoved(0);
   * const result = pipe([10, 20, 30]).map(removeFirst).value;
   * console.log(result); // [20, 30]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const toRemoved: ToRemovedFnOverload = (<E,>(
    ...args:
      | readonly [array: readonly E[], index: SizeType.ArgArrNonNegative]
      | readonly [index: SizeType.ArgArrNonNegative]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, index] = args;
        return array.toSpliced(index, 1);
      }
      case 1: {
        const [index] = args;
        return <E2,>(array: readonly E2[]) => toRemoved(array, index);
      }
    }
  }) as ToRemovedFnOverload;

  type ToRemovedFnOverload = {
    <E>(array: readonly E[], index: SizeType.ArgArrNonNegative): readonly E[];

    // curried version
    (
      index: SizeType.ArgArrNonNegative,
    ): <E>(array: readonly E[]) => readonly E[];
  };

  /**
   * Returns a new array with a value added to the end.
   * @template E The type of the input array (can be a tuple).
   * @template V The type of the value to add.
   * @param array The input array.
   * @param newValue The value to add.
   * @returns A new array with the value added to the end. Type is `readonly [...E, V]`.
   * @example
   * ```ts
   * // Regular usage
   * Arr.toPushed([1, 2] as const, 3); // [1, 2, 3]
   *
   * // Curried usage for pipe composition
   * const addZero = Arr.toPushed(0);
   * const result = pipe([1, 2, 3]).map(addZero).value;
   * console.log(result); // [1, 2, 3, 0]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const toPushed: ToPushedFnOverload = (<
    Ar extends readonly unknown[],
    const V,
  >(
    ...args: readonly [array: Ar, newValue: V] | readonly [newValue: V]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, newValue] = args;
        return array.toSpliced(array.length, 0, newValue);
      }
      case 1: {
        const [newValue] = args;
        return <Ar2 extends readonly unknown[]>(array: Ar2) =>
          toPushed(array, newValue);
      }
    }
  }) as unknown as ToPushedFnOverload;

  type ToPushedFnOverload = {
    <Ar extends readonly unknown[], const V>(
      array: Ar,
      newValue: V,
    ): readonly [...Ar, V];

    // curried version
    <const V>(
      newValue: V,
    ): <Ar extends readonly unknown[]>(array: Ar) => readonly [...Ar, V];
  };

  /**
   * Returns a new array with a value added to the beginning.
   * @template E The type of the input array (can be a tuple).
   * @template V The type of the value to add.
   * @param array The input array.
   * @param newValue The value to add.
   * @returns A new array with the value added to the beginning. Type is `readonly [V, ...E]`.
   * @example
   * ```ts
   * // Regular usage
   * Arr.toUnshifted([1, 2] as const, 0); // [0, 1, 2]
   *
   * // Curried usage for pipe composition
   * const prependZero = Arr.toUnshifted(0);
   * const result = pipe([1, 2, 3]).map(prependZero).value;
   * console.log(result); // [0, 1, 2, 3]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const toUnshifted: ToUnshiftedFnOverload = (<
    Ar extends readonly unknown[],
    const V,
  >(
    ...args: readonly [array: Ar, newValue: V] | readonly [newValue: V]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, newValue] = args;
        return array.toSpliced(0, 0, newValue);
      }
      case 1: {
        const [newValue] = args;
        return <Ar2 extends readonly unknown[]>(array: Ar2) =>
          toUnshifted(array, newValue);
      }
    }
  }) as unknown as ToUnshiftedFnOverload;

  type ToUnshiftedFnOverload = {
    <Ar extends readonly unknown[], const V>(
      array: Ar,
      newValue: V,
    ): readonly [V, ...Ar];

    // curried version
    <const V>(
      newValue: V,
    ): <Ar extends readonly unknown[]>(array: Ar) => readonly [V, ...Ar];
  };

  /**
   * Fills an array with a value (creates a new filled array).
   * @param array The array.
   * @param value The value to fill with.
   * @param start The start index.
   * @param end The end index.
   * @returns A new filled array.
   * @example
   * ```typescript
   * // Regular usage
   * const arr = [1, 2, 3, 4, 5];
   * const result = Arr.toFilled(arr, 0, 1, 4);
   * console.log(result); // [1, 0, 0, 0, 5]
   *
   * // Curried usage for pipe composition
   * const fillWithZeros = Arr.toFilled(0, 1, 3);
   * const result2 = pipe([1, 2, 3, 4]).map(fillWithZeros).value;
   * console.log(result2); // [1, 0, 0, 4]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const toFilled: ToFilledFnOverload = (<E,>(
    ...args: readonly [array: readonly E[], value: E] | readonly [value: E]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, value] = args;
        const cp = castMutable(copy(array));
        cp.fill(value);
        return cp;
      }
      case 1: {
        const [value] = args;
        return (array: readonly E[]) => toFilled(array, value);
      }
    }
  }) as ToFilledFnOverload;

  type ToFilledFnOverload = {
    <E>(array: readonly E[], value: E): readonly E[];

    // curried version
    <E>(value: E): (array: readonly E[]) => readonly E[];
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const toRangeFilled: ToRangeFilledFnOverload = (<E,>(
    ...args:
      | readonly [
          array: readonly E[],
          value: E,
          fillRange: readonly [start: SizeType.ArgArr, end: SizeType.ArgArr],
        ]
      | readonly [
          value: E,
          fillRange: readonly [start: SizeType.ArgArr, end: SizeType.ArgArr],
        ]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, value, [start, end]] = args;
        const cp = castMutable(copy(array));
        cp.fill(value, start, end);
        return cp;
      }
      case 2: {
        const [value, fillRange] = args;
        return (array: readonly unknown[]) =>
          toRangeFilled(array, value, fillRange);
      }
    }
  }) as ToRangeFilledFnOverload;

  type ToRangeFilledFnOverload = {
    <E>(
      array: readonly E[],
      value: E,
      fillRange: readonly [start: SizeType.ArgArr, end: SizeType.ArgArr],
    ): readonly E[];

    // curried version
    <E>(
      value: E,
      fillRange: readonly [start: SizeType.ArgArr, end: SizeType.ArgArr],
    ): (array: readonly E[]) => readonly E[];
  };

  // searching

  /**
   * Safely finds the first element in an array that satisfies a predicate function.
   *
   * This function provides type-safe searching with no risk of runtime errors. It returns
   * the first element that matches the predicate wrapped in an Optional, or Optional.None
   * if no element is found. The predicate receives the element, its index, and the entire array.
   *
   * **Curried Usage:** This function supports currying - when called with only a predicate,
   * it returns a function that can be applied to arrays, making it ideal for functional composition.
   *
   * @template E The type of elements in the array.
   * @param array The array to search through (when using direct call syntax).
   * @param predicate A function that tests each element. Called with:
   *   - `value`: The current element being tested
   *   - `index`: The index of the current element (branded as `SizeType.Arr`)
   *   - `arr`: The entire array being searched
   * @returns An `Optional<E>` containing:
   *   - `Optional.Some<E>` with the first matching element if found
   *   - `Optional.None` if no element satisfies the predicate
   *
   * @example
   * ```typescript
   * // Basic element finding
   * const numbers = [1, 2, 3, 4, 5];
   * const firstEven = Arr.find(numbers, x => x % 2 === 0);
   * if (Optional.isSome(firstEven)) {
   *   console.log(firstEven.value); // 2 - first even number
   * }
   *
   * // Finding with index information
   * const findLargeAtEnd = Arr.find(numbers, (value, index) => value > 3 && index > 2);
   * // Optional.Some(4) - first number > 3 after index 2
   *
   * // Finding objects by property
   * const users = [
   *   { id: 1, name: 'Alice', age: 25 },
   *   { id: 2, name: 'Bob', age: 30 },
   *   { id: 3, name: 'Charlie', age: 35 }
   * ];
   *
   * const adult = Arr.find(users, user => user.age >= 30);
   * // Optional.Some({ id: 2, name: 'Bob', age: 30 })
   *
   * const nonExistent = Arr.find(users, user => user.age > 100);
   * // Optional.None
   *
   * // Empty array handling
   * const emptyResult = Arr.find([], x => x > 0); // Optional.None
   *
   * // Curried usage for functional composition
   * const findNegative = Arr.find((x: number) => x < 0);
   * const findLongString = Arr.find((s: string) => s.length > 5);
   *
   * const datasets = [
   *   [1, 2, -3, 4],
   *   [5, 6, 7, 8],
   *   [-1, 0, 1]
   * ];
   *
   * const negativeNumbers = datasets.map(findNegative);
   * // [Optional.Some(-3), Optional.None, Optional.Some(-1)]
   *
   * // Pipe composition
   * const result = pipe(['short', 'medium', 'very long string'])
   *   .map(findLongString)
   *   .map(opt => Optional.unwrapOr(opt, 'default'))
   *   .value; // 'very long string'
   *
   * // Complex predicate with all parameters
   * const findSpecial = (arr: readonly number[]) =>
   *   Arr.find(arr, (value, index, array) => {
   *     return value > 10 && index > 0 && index < array.length - 1;
   *   });
   *
   * const hasMiddleSpecial = findSpecial([5, 15, 20, 3]);
   * // Optional.Some(15) - first value > 10 that's not at start or end
   *
   * // Safe unwrapping patterns
   * const maybeFound = Arr.find(numbers, x => x > 10);
   * const foundOrDefault = Optional.unwrapOr(maybeFound, 0); // 0 (not found)
   * const foundOrThrow = Optional.isSome(maybeFound)
   *   ? maybeFound.value
   *   : (() => { throw new Error('Not found'); })();
   *
   * // Type inference examples
   * expectType<typeof firstEven, Optional<number>>('=');
   * expectType<typeof adult, Optional<{id: number, name: string, age: number}>>('=');
   * expectType<typeof findNegative, (array: readonly number[]) => Optional<number>>('=');
   * ```
   *
   * @see {@link findIndex} for finding the index instead of the element
   * @see {@link indexOf} for finding elements by equality
   * @see {@link Optional} for working with the returned Optional values
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const find: FindFnOverload = (<E,>(
    ...args:
      | readonly [
          array: readonly E[],
          predicate: (
            value: E,
            index: SizeType.Arr,
            arr: readonly E[],
          ) => boolean,
        ]
      | readonly [
          predicate: (
            value: E,
            index: SizeType.Arr,
            arr: readonly E[],
          ) => boolean,
        ]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, predicate] = args;
        const foundIndex = array.findIndex(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          predicate as (value: E, index: number, arr: readonly E[]) => boolean,
        );

        return foundIndex === -1
          ? Optional.none
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Optional.some(array[foundIndex]!);
      }
      case 1: {
        const [predicate] = args;
        return (array: readonly E[]) => find(array, predicate);
      }
    }
  }) as FindFnOverload;

  type FindFnOverload = {
    <E>(
      array: readonly E[],
      predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean,
    ): Optional<E>;

    // curried version
    <E>(
      predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean,
    ): (array: readonly E[]) => Optional<E>;
  };

  /**
   * Safely finds the index of the first element in an array that satisfies a predicate function.
   *
   * This function provides type-safe index searching with no risk of runtime errors. It returns
   * the index of the first element that matches the predicate wrapped in an Optional, or Optional.None
   * if no element is found. The returned index is branded as `SizeType.Arr` for type safety.
   *
   * **Curried Usage:** This function supports currying - when called with only a predicate,
   * it returns a function that can be applied to arrays, making it ideal for functional composition.
   *
   * @template E The type of elements in the array.
   * @param array The array to search through (when using direct call syntax).
   * @param predicate A function that tests each element. Called with:
   *   - `value`: The current element being tested
   *   - `index`: The index of the current element (branded as `SizeType.Arr`)
   * @returns An `Optional<SizeType.Arr>` containing:
   *   - `Optional.Some<SizeType.Arr>` with the index of the first matching element if found
   *   - `Optional.None` if no element satisfies the predicate
   *
   * @example
   * ```typescript
   * // Basic index finding
   * const fruits = ['apple', 'banana', 'cherry', 'banana'];
   * const bananaIndex = Arr.findIndex(fruits, fruit => fruit === 'banana');
   * if (Optional.isSome(bananaIndex)) {
   *   console.log(bananaIndex.value); // 1 - index of first 'banana'
   * }
   *
   * // Finding with complex conditions
   * const numbers = [1, 5, 10, 15, 20];
   * const firstLargeIndex = Arr.findIndex(numbers, (value, index) =>
   *   value > 10 && index > 1
   * );
   * // Optional.Some(3) - index of 15 (first value > 10 after index 1)
   *
   * // Finding objects by property
   * const users = [
   *   { id: 1, active: false },
   *   { id: 2, active: true },
   *   { id: 3, active: true }
   * ];
   *
   * const firstActiveIndex = Arr.findIndex(users, user => user.active);
   * // Optional.Some(1) - index of first active user
   *
   * const inactiveAdminIndex = Arr.findIndex(users, user => !user.active && user.id > 5);
   * // Optional.None - no inactive user with id > 5
   *
   * // Empty array handling
   * const emptyResult = Arr.findIndex([], x => x > 0); // Optional.None
   *
   * // Curried usage for functional composition
   * const findNegativeIndex = Arr.findIndex((x: number) => x < 0);
   * const findLongStringIndex = Arr.findIndex((s: string) => s.length > 5);
   *
   * const datasets = [
   *   [1, 2, -3, 4],    // index 2 has negative
   *   [5, 6, 7, 8],     // no negative
   *   [-1, 0, 1]        // index 0 has negative
   * ];
   *
   * const negativeIndices = datasets.map(findNegativeIndex);
   * // [Optional.Some(2), Optional.None, Optional.Some(0)]
   *
   * // Using found indices for further operations
   * const data = ['short', 'medium', 'very long string', 'tiny'];
   * const longStringIndex = Arr.findIndex(data, s => s.length > 8);
   *
   * if (Optional.isSome(longStringIndex)) {
   *   const index = longStringIndex.value;
   *   console.log(`Found at position ${index}: ${data[index]}`);
   *   // "Found at position 2: very long string"
   * }
   *
   * // Pipe composition
   * const result = pipe(['a', 'bb', 'ccc'])
   *   .map(findLongStringIndex)
   *   .map(opt => Optional.unwrapOr(opt, -1))
   *   .value; // 2 (index of 'ccc')
   *
   * // Comparing with native findIndex (which returns -1)
   * const nativeResult = fruits.findIndex(fruit => fruit === 'grape'); // -1
   * const safeResult = Arr.findIndex(fruits, fruit => fruit === 'grape'); // Optional.None
   *
   * // Safe index usage patterns
   * const maybeIndex = Arr.findIndex(numbers, x => x > 100);
   * const indexOrDefault = Optional.unwrapOr(maybeIndex, 0); // 0 (not found)
   *
   * // Using index for array access
   * const foundIndex = Arr.findIndex(fruits, f => f.startsWith('c'));
   * const foundElement = Optional.isSome(foundIndex)
   *   ? fruits[foundIndex.value]
   *   : 'not found';
   * // 'cherry'
   *
   * // Type inference examples
   * expectType<typeof bananaIndex, Optional<SizeType.Arr>>('=');
   * expectType<typeof findNegativeIndex, (array: readonly number[]) => Optional<SizeType.Arr>>('=');
   * ```
   *
   * @see {@link find} for finding the element instead of its index
   * @see {@link indexOf} for finding elements by equality (not predicate)
   * @see {@link lastIndexOf} for finding the last occurrence
   * @see {@link Optional} for working with the returned Optional values
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const findIndex: FindIndexFnOverload = (<E,>(
    ...args:
      | readonly [
          array: readonly E[],
          predicate: (value: E, index: SizeType.Arr) => boolean,
        ]
      | readonly [predicate: (value: E, index: SizeType.Arr) => boolean]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, predicate] = args;
        return pipe(
          array.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            predicate as (value: E, index: number) => boolean,
          ),
        ).map((idx) => (idx >= 0 ? asUint32(idx) : -1)).value;
      }
      case 1: {
        const [predicate] = args;
        return (array: readonly E[]) => findIndex(array, predicate);
      }
    }
  }) as FindIndexFnOverload;

  type FindIndexFnOverload = {
    <E>(
      array: readonly E[],
      predicate: (value: E, index: SizeType.Arr) => boolean,
    ): SizeType.Arr | -1;

    // curried version
    <E>(
      predicate: (value: E, index: SizeType.Arr) => boolean,
    ): (array: readonly E[]) => SizeType.Arr | -1;
  };

  /**
   * Gets the index of a value in an array.
   * @param array The array to search.
   * @param searchElement The element to search for.
   * @param fromIndex The index to start searching from.
   * @returns The index if found, -1 otherwise.
   * @example
   * ```typescript
   * // Regular usage
   * const arr = ['a', 'b', 'c', 'b'];
   * const result = Arr.indexOf(arr, 'b');
   * if (Optional.isSome(result)) {
   *   console.log(result.value); // 1 (branded as SizeType.Arr)
   * }
   *
   * // Curried usage for pipe composition
   * const findB = Arr.indexOf('b');
   * const result2 = pipe(['a', 'b', 'c']).map(findB).value;
   * console.log(Optional.unwrapOr(result2, -1)); // 1
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const indexOf: IndexOfFnOverload = (<E,>(
    ...args:
      | readonly [array: readonly E[], searchElement: E]
      | readonly [searchElement: E]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, searchElement] = args;

        const index = array.indexOf(searchElement);
        return index >= 0 ? asUint32(index) : -1;
      }
      case 1: {
        const [searchElement] = args;
        return (array: readonly E[]) => indexOf(array, searchElement);
      }
    }
  }) as IndexOfFnOverload;

  type IndexOfFnOverload = {
    <E>(array: readonly E[], searchElement: E): SizeType.Arr | -1;

    // curried version
    <E>(searchElement: E): (array: readonly E[]) => SizeType.Arr | -1;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const indexOfFrom: IndexOfFromFnOverload = (<E,>(
    ...args:
      | readonly [
          array: readonly E[],
          searchElement: E,
          fromIndex: SizeType.ArgArr,
        ]
      | readonly [searchElement: E, fromIndex: SizeType.ArgArr]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, searchElement, fromIndex] = args;
        const index = array.indexOf(searchElement, fromIndex);
        return index >= 0 ? asUint32(index) : -1;
      }
      case 2: {
        const [searchElement, fromIndex] = args;
        return (array: readonly E[]) =>
          indexOfFrom(array, searchElement, fromIndex);
      }
    }
  }) as IndexOfFromFnOverload;

  type IndexOfFromFnOverload = {
    <E>(
      array: readonly E[],
      searchElement: E,
      fromIndex: SizeType.ArgArr,
    ): SizeType.Arr | -1;

    // curried version
    <E>(
      searchElement: E,
      fromIndex: SizeType.ArgArr,
    ): (array: readonly E[]) => SizeType.Arr | -1;
  };

  /**
   * Gets the last index of a value in an array.
   * @param array The array to search.
   * @param searchElement The element to search for.
   * @param fromIndex The index to start searching from (searches backwards).
   * @returns Optional.Some with the index if found, Optional.None otherwise.
   * @example
   * ```typescript
   * // Regular usage
   * const arr = ['a', 'b', 'c', 'b'];
   * const result = Arr.lastIndexOf(arr, 'b');
   * if (Optional.isSome(result)) {
   *   console.log(result.value); // 3 (branded as SizeType.Arr)
   * }
   *
   * // Curried usage for pipe composition
   * const findLastB = Arr.lastIndexOf('b');
   * const result2 = pipe(['a', 'b', 'c', 'b']).map(findLastB).value;
   * console.log(Optional.unwrapOr(result2, -1)); // 3
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const lastIndexOf: LastIndexOfFnOverload = (<E,>(
    ...args:
      | readonly [array: readonly E[], searchElement: E]
      | readonly [searchElement: E]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, searchElement] = args;
        const index = array.lastIndexOf(searchElement);
        return index >= 0 ? asUint32(index) : -1;
      }
      case 1: {
        const [searchElement] = args;
        return (array: readonly E[]) => lastIndexOf(array, searchElement);
      }
    }
  }) as LastIndexOfFnOverload;

  type LastIndexOfFnOverload = {
    <E>(array: readonly E[], searchElement: E): SizeType.Arr | -1;

    // curried version
    <E>(searchElement: E): (array: readonly E[]) => SizeType.Arr | -1;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const lastIndexOfFrom: LastIndexOfFromFnOverload = (<E,>(
    ...args:
      | readonly [
          array: readonly E[],
          searchElement: E,
          fromIndex: SizeType.ArgArr,
        ]
      | readonly [searchElement: E, fromIndex: SizeType.ArgArr]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, searchElement, fromIndex] = args;

        const index = array.lastIndexOf(searchElement, fromIndex);

        return index >= 0 ? asUint32(index) : -1;
      }
      case 2: {
        const [searchElement, fromIndex] = args;
        return (array: readonly E[]) =>
          lastIndexOfFrom(array, searchElement, fromIndex);
      }
    }
  }) as LastIndexOfFromFnOverload;

  type LastIndexOfFromFnOverload = {
    <E>(
      array: readonly E[],
      searchElement: E,
      fromIndex: SizeType.ArgArr,
    ): SizeType.Arr | -1;

    // curried version
    <E>(
      searchElement: E,
      fromIndex: SizeType.ArgArr,
    ): (array: readonly E[]) => SizeType.Arr | -1;
  };

  // reducing value

  /**
   * Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
   * This is an alias for `Array.prototype.reduce`.
   * @template E The type of elements in the array.
   * @template S The type of the accumulated value.
   * @param array The input array.
   * @param callbackfn A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.
   * @param initialValue The initial value of the accumulator.
   * @returns The single value that results from the reduction.
   * @example
   * ```ts
   * // Regular usage
   * Arr.foldl([1, 2, 3], (sum, n) => sum + n, 0); // 6
   *
   * // Curried usage for pipe composition
   * const sumWithZero = Arr.foldl((sum: number, n: number) => sum + n, 0);
   * const result = pipe([1, 2, 3, 4]).map(sumWithZero).value;
   * console.log(result); // 10
   * ```
   */
  export const foldl: FoldlFnOverload = <E, P>(
    ...args:
      | readonly [
          array: readonly E[],
          callbackfn: (
            previousValue: P,
            currentValue: E,
            currentIndex: SizeType.Arr,
          ) => P,
          initialValue: P,
        ]
      | readonly [
          callbackfn: (
            previousValue: P,
            currentValue: E,
            currentIndex: SizeType.Arr,
          ) => P,
          initialValue: P,
        ]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, callbackfn, initialValue] = args;
        return array.reduce(
          (prev, curr, index) => callbackfn(prev, curr, asUint32(index)),
          initialValue,
        );
      }
      case 2: {
        const [callbackfn, initialValue] = args;
        return (array: readonly E[]) => foldl(array, callbackfn, initialValue);
      }
    }
  };

  type FoldlFnOverload = {
    <E, P>(
      array: readonly E[],
      callbackfn: (
        previousValue: P,
        currentValue: E,
        currentIndex: SizeType.Arr,
      ) => P,
      initialValue: P,
    ): P;

    // curried version
    <E, P>(
      callbackfn: (
        previousValue: P,
        currentValue: E,
        currentIndex: SizeType.Arr,
      ) => P,
      initialValue: P,
    ): (array: readonly E[]) => P;
  };

  /**
   * Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.
   * This is an alias for `Array.prototype.reduceRight`.
   * @template E The type of elements in the array.
   * @template S The type of the accumulated value.
   * @param array The input array.
   * @param callbackfn A function to execute on each element in the array: `(previousValue: S, currentValue: A, currentIndex: SizeType.Arr) => S`.
   * @param initialValue The initial value of the accumulator.
   * @returns The single value that results from the reduction.
   * @example
   * ```ts
   * // Regular usage
   * Arr.foldr([1, 2, 3], (sum, n) => sum + n, 0); // 6
   *
   * // Curried usage for pipe composition
   * const concatRight = Arr.foldr((acc: string, curr: string) => curr + acc, '');
   * const result = pipe(['a', 'b', 'c']).map(concatRight).value;
   * console.log(result); // "abc"
   * ```
   */
  export const foldr: FoldrFnOverload = <E, P>(
    ...args:
      | readonly [
          array: readonly E[],
          callbackfn: (
            previousValue: P,
            currentValue: E,
            currentIndex: SizeType.Arr,
          ) => P,
          initialValue: P,
        ]
      | readonly [
          callbackfn: (
            previousValue: P,
            currentValue: E,
            currentIndex: SizeType.Arr,
          ) => P,
          initialValue: P,
        ]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, callbackfn, initialValue] = args;
        return array.reduceRight(
          (prev, curr, index) => callbackfn(prev, curr, asUint32(index)),
          initialValue,
        );
      }
      case 2: {
        const [callbackfn, initialValue] = args;
        return (array: readonly E[]) => foldr(array, callbackfn, initialValue);
      }
    }
  };

  type FoldrFnOverload = {
    <E, P>(
      array: readonly E[],
      callbackfn: (
        previousValue: P,
        currentValue: E,
        currentIndex: SizeType.Arr,
      ) => P,
      initialValue: P,
    ): P;

    // curried version
    <E, P>(
      callbackfn: (
        previousValue: P,
        currentValue: E,
        currentIndex: SizeType.Arr,
      ) => P,
      initialValue: P,
    ): (array: readonly E[]) => P;
  };

  /**
   * Finds the minimum value in an array.
   * @template E The type of numbers in the array (must extend `number`).
   * @param array The input array.
   * @param comparator An optional custom comparator function `(x: N, y: N) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to `x - y`.
   * @returns The minimum value in the array wrapped in Optional.
   * @example
   * ```ts
   * Arr.min([3, 1, 4, 1, 5] as const); // Optional.some(1)
   * Arr.min([{v:3}, {v:1}], (a,b) => a.v - b.v) // Optional.some({v:1})
   * Arr.min([]); // Optional.none
   * ```
   */

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const min: MinFnOverload = (<E extends number>(
    array: readonly E[],
    comparator?: (x: E, y: E) => number,
  ): Optional<E> => {
    if (!isNonEmpty(array)) {
      return Optional.none;
    }

    const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));

    return Optional.some(
      array.reduce(
        (currentMin, curr) => (cmp(curr, currentMin) < 0 ? curr : currentMin),
        array[0],
      ),
    );
  }) as MinFnOverload;

  type MinFnOverload = {
    <E extends number>(
      array: NonEmptyArray<E>,
      comparator?: (x: E, y: E) => number,
    ): Optional.Some<E>;

    <E extends number>(
      array: readonly E[],
      comparator?: (x: E, y: E) => number,
    ): Optional<E>;

    <E>(
      array: NonEmptyArray<E>,
      comparator: (x: E, y: E) => number,
    ): Optional.Some<E>;

    <E>(array: readonly E[], comparator: (x: E, y: E) => number): Optional<E>;
  };

  /**
   * Finds the maximum value in an array.
   *
   * - If the array is non-empty, returns the maximum value.
   * - If the array is empty, returns `Optional.none`.
   * - You can provide a custom comparator for arbitrary types.
   *
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param comparator An optional custom comparator function `(x: A, y: A) => number`. Should return < 0 if x is smaller, 0 if equal, > 0 if x is larger. Defaults to numeric comparison.
   * @returns The maximum value in the array wrapped in Optional.
   * @example
   * ```ts
   * Arr.max([3, 1, 4, 1, 5] as const); // Optional.some(5)
   * Arr.max([{v:3}, {v:1}], (a,b) => a.v - b.v) // Optional.some({v:3})
   * Arr.max([]); // Optional.none
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const max: MaxFnOverload = (<E extends number>(
    array: readonly E[],
    comparator?: (x: E, y: E) => number,
  ): Optional<E> => {
    const cmp = comparator ?? ((x, y) => Num.from(x) - Num.from(y));
    // Find max by finding min with an inverted comparator
    return min(array, (x, y) => -cmp(x, y));
  }) as MaxFnOverload;

  type MaxFnOverload = {
    <E extends number>(
      array: NonEmptyArray<E>,
      comparator?: (x: E, y: E) => number,
    ): Optional.Some<E>;

    <E extends number>(
      array: readonly E[],
      comparator?: (x: E, y: E) => number,
    ): Optional<E>;

    <E>(
      array: NonEmptyArray<E>,
      comparator: (x: E, y: E) => number,
    ): Optional.Some<E>;

    <E>(array: readonly E[], comparator: (x: E, y: E) => number): Optional<E>;
  };

  /**
   * Finds the element with the minimum value according to a mapped numeric value.
   *
   * - If the array is non-empty, returns the element with the minimum mapped value.
   * - If the array is empty, returns `Optional.none`.
   * - You can provide a custom comparator for the mapped values.
   *
   * @template E The type of elements in the array.
   * @template V The type of the value to compare by.
   * @param array The input array.
   * @param comparatorValueMapper A function that maps an element to a value for comparison.
   * @param comparator An optional custom comparator function for the mapped values.
   * @returns The element with the minimum mapped value wrapped in Optional.
   * @example
   * ```ts
   * const people = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 20 }] as const;
   * Arr.minBy(people, p => p.age); // Optional.some({ name: 'Bob', age: 20 })
   * Arr.minBy([], p => p.age); // Optional.none
   * ```
   */

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const minBy: MinByFnOverload = (<E, V>(
    array: readonly E[],
    comparatorValueMapper: (value: E) => V,
    comparator?: (x: V, y: V) => number,
  ): Optional<E> =>
    min(array, (x, y) =>
      comparator === undefined
        ? Num.from(comparatorValueMapper(x)) -
          Num.from(comparatorValueMapper(y))
        : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
    )) as MinByFnOverload;

  type MinByFnOverload = {
    <E>(
      array: NonEmptyArray<E>,
      comparatorValueMapper: (value: E) => number,
    ): Optional.Some<E>;

    <E>(
      array: readonly E[],
      comparatorValueMapper: (value: E) => number,
    ): Optional<E>;

    <E, V>(
      array: NonEmptyArray<E>,
      comparatorValueMapper: (value: E) => V,
      comparator: (x: V, y: V) => number,
    ): Optional.Some<E>;

    <E, V>(
      array: readonly E[],
      comparatorValueMapper: (value: E) => V,
      comparator: (x: V, y: V) => number,
    ): Optional<E>;
  };

  /**
   * Finds the element with the maximum value according to a mapped numeric value.
   *
   * - If the array is non-empty, returns the element with the maximum mapped value.
   * - If the array is empty, returns `Optional.none`.
   * - You can provide a custom comparator for the mapped values.
   *
   * @template E The type of elements in the array.
   * @template V The type of the value to compare by.
   * @param array The input array.
   * @param comparatorValueMapper A function that maps an element to a value for comparison.
   * @param comparator An optional custom comparator function for the mapped values.
   * @returns The element with the maximum mapped value wrapped in Optional.
   * @example
   * ```ts
   * const people = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 20 }] as const;
   * Arr.maxBy(people, p => p.age); // Optional.some({ name: 'Alice', age: 30 })
   * Arr.maxBy([], p => p.age); // Optional.none
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const maxBy: MaxByFnOverload = (<E, V>(
    array: readonly E[],
    comparatorValueMapper: (value: E) => V,
    comparator?: (x: V, y: V) => number,
  ): Optional<E> =>
    max(array, (x, y) =>
      comparator === undefined
        ? Num.from(comparatorValueMapper(x)) -
          Num.from(comparatorValueMapper(y))
        : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
    )) as MaxByFnOverload;

  type MaxByFnOverload = {
    <E>(
      array: NonEmptyArray<E>,
      comparatorValueMapper: (value: E) => number,
    ): Optional.Some<E>;

    <E>(
      array: readonly E[],
      comparatorValueMapper: (value: E) => number,
    ): Optional<E>;

    <E, V>(
      array: NonEmptyArray<E>,
      comparatorValueMapper: (value: E) => V,
      comparator: (x: V, y: V) => number,
    ): Optional.Some<E>;

    <E, V>(
      array: readonly E[],
      comparatorValueMapper: (value: E) => V,
      comparator: (x: V, y: V) => number,
    ): Optional<E>;
  };

  /**
   * Counts the number of elements in an array that satisfy a predicate.
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param predicate A function `(value: A, index: number) => boolean` to test each element for a condition.
   * @returns The number of elements that satisfy the predicate.
   * @example
   * ```ts
   * // Regular usage
   * Arr.count([1, 2, 3, 4], (x) => x > 2); // 2
   *
   * // Curried usage for pipe composition
   * const countEvens = Arr.count((x: number) => x % 2 === 0);
   * const result = pipe([1, 2, 3, 4, 5, 6]).map(countEvens).value;
   * console.log(result); // 3
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const count: CountFnOverload = (<E,>(
    ...args:
      | readonly [
          array: readonly E[],
          predicate: (value: E, index: SizeType.Arr) => boolean,
        ]
      | readonly [predicate: (value: E, index: SizeType.Arr) => boolean]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, predicate] = args;
        return array.reduce<Uint32>(
          (acc, curr, index) =>
            predicate(curr, asUint32(index)) ? Uint32.add(acc, 1) : acc,
          asUint32(0),
        );
      }
      case 1: {
        const [predicate] = args;
        return (array: readonly E[]) => count(array, predicate);
      }
    }
  }) as CountFnOverload;

  type CountFnOverload = {
    <E>(
      array: readonly E[],
      predicate: (value: E, index: SizeType.Arr) => boolean,
    ): SizeType.Arr;

    // curried version
    <E>(
      predicate: (value: E, index: SizeType.Arr) => boolean,
    ): (array: readonly E[]) => SizeType.Arr;
  };

  /**
   * Groups elements of an array by a key derived from each element and counts the elements in each group.
   * @template E The type of elements in the array.
   * @template G The type of the group key (must be a primitive type: `string`, `number`, `boolean`, `symbol`, `bigint`, `null`, or `undefined`).
   * @param array The input array.
   * @param grouper A function `(value: A, index: number) => G` that maps an element and its index to a group key.
   * @returns An `IMap` where keys are group keys and values are the counts of elements in each group.
   * @example
   * ```ts
   * // Regular usage
   * Arr.countBy([1, 2, 2, 3, 1, 1], (x) => x);
   * // IMap { 1 => 3, 2 => 2, 3 => 1 }
   *
   * // Curried usage for pipe composition
   * const countByType = Arr.countBy((x: {type: string}) => x.type);
   * const data = [{type: 'a'}, {type: 'b'}, {type: 'a'}];
   * const result = pipe(data).map(countByType).value;
   * // IMap { 'a' => 2, 'b' => 1 }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const countBy: CountByFnOverload = (<E, G extends MapSetKeyType>(
    ...args:
      | readonly [
          array: readonly E[],
          grouper: (value: E, index: SizeType.Arr) => G,
        ]
      | readonly [grouper: (value: E, index: SizeType.Arr) => G]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, grouper] = args;
        const mut_groups = new Map<MapSetKeyType, SizeType.Arr>();

        for (const [index, e] of array.entries()) {
          const key = grouper(e, asUint32(index));
          const curr = mut_groups.get(key) ?? 0;

          mut_groups.set(key, asUint32(curr + 1));
        }

        return IMap.create(mut_groups);
      }
      case 1: {
        const [grouper] = args;
        return (array: readonly E[]) => countBy(array, grouper);
      }
    }
  }) as CountByFnOverload;

  type CountByFnOverload = {
    <E, G extends MapSetKeyType>(
      array: readonly E[],
      grouper: (value: E, index: SizeType.Arr) => G,
    ): IMap<G, SizeType.Arr>;

    // curried version
    <E, G extends MapSetKeyType>(
      grouper: (value: E, index: SizeType.Arr) => G,
    ): (array: readonly E[]) => IMap<G, SizeType.Arr>;
  };

  /**
   * Calculates the sum of numbers in an array.
   * @param array The input array of numbers.
   * @returns The sum of the numbers. Returns 0 for an empty array.
   * @example
   * ```ts
   * Arr.sum([1, 2, 3]); // 6
   * Arr.sum([]); // 0
   * Arr.sum([-1, 0, 1]); // 0
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const sum: SumFnOverload = ((array: readonly number[]): number =>
    array.reduce((prev, curr) => prev + curr, 0)) as SumFnOverload;

  type SumFnOverload = {
    (array: readonly []): 0;
    <N extends number>(array: readonly [N]): N;
    (array: readonly Uint[]): Uint;
    (array: readonly Int[]): Int;
    (array: readonly number[]): number;
  };

  /**
   * Joins array elements into a string.
   * @param array The array to join.
   * @param separator The separator string.
   * @returns Result.Ok with the joined string, Result.Err if the operation throws.
   * @example
   * ```typescript
   * // Regular usage
   * const arr = ['Hello', 'World'];
   * const result = Arr.join(arr, ' ');
   * if (Result.isOk(result)) {
   *   console.log(result.value); // "Hello World"
   * }
   *
   * // Curried usage for pipe composition
   * const joinWithComma = Arr.join(',');
   * const result2 = pipe(['a', 'b', 'c']).map(joinWithComma).value;
   * console.log(Result.unwrapOr(result2, '')); // "a,b,c"
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const join: JoinFnOverload = (<E,>(
    ...args:
      | readonly [array: readonly E[], separator?: string]
      | readonly [separator?: string]
  ) => {
    switch (args.length) {
      case 0:
        return <E2,>(array: readonly E2[]) => joinImpl(array, undefined);

      case 1: {
        const [arg] = args;
        if (isString(arg) || isUndefined(arg)) {
          return <E2,>(array: readonly E2[]) => joinImpl(array, arg);
        }
        return joinImpl(arg, undefined);
      }
      case 2: {
        const [array, separator] = args;
        return joinImpl(array, separator);
      }
    }
  }) as JoinFnOverload;

  const joinImpl = <E,>(
    array: readonly E[],
    separator: string | undefined,
  ): Result<string, Error> => {
    try {
      const result = array.join(separator);
      return Result.ok(result);
    } catch (error) {
      return Result.err(
        error instanceof Error
          ? error
          : pipe(unknownToString(error))
              .map(Result.unwrapOkOr('Failed to join array'))
              .map((e) => new Error(e)).value,
      );
    }
  };

  type JoinFnOverload = {
    <E>(array: readonly E[], separator?: string): Result<string, Error>;

    // curried version
    (separator?: string): <E>(array: readonly E[]) => Result<string, Error>;
  };

  // transformation

  /**
   * Creates an array of tuples by pairing up corresponding elements from two arrays.
   * The resulting array has a length equal to the minimum of the two input array lengths.
   * @template E1 The type of the first array.
   * @template E2 The type of the second array.
   * @param array1 The first array.
   * @param array2 The second array.
   * @returns An array of tuples where each tuple contains corresponding elements from both arrays.
   * @example
   * ```ts
   * Arr.zip([1, 2, 3] as const, ['a', 'b', 'c'] as const); // [[1, 'a'], [2, 'b'], [3, 'c']]
   * Arr.zip([1, 2], ['a', 'b', 'c']); // [[1, 'a'], [2, 'b']]
   * Arr.zip([1, 2, 3], ['a']); // [[1, 'a']]
   * Arr.zip([], ['a']); // []
   * ```
   */
  export const zip = <
    Ar1 extends readonly unknown[],
    Ar2 extends readonly unknown[],
  >(
    array1: Ar1,
    array2: Ar2,
  ): List.Zip<Ar1, Ar2> =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    seq(Uint32.min(size(array1), size(array2))).map((i) =>
      // Non-null assertion is safe here because `i` is always within bounds of both arrays up to the length of the shorter one.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tp(array1[i]!, array2[i]!),
    ) as unknown as List.Zip<Ar1, Ar2>;

  /**
   * Filters an array by excluding elements for which the predicate returns true.
   * This is the opposite of `Array.prototype.filter`.
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param predicate A function `(a: A, index: number) => boolean` that returns `true` for elements to be excluded.
   * @returns A new array with elements for which the predicate returned `false`.
   * @example
   * ```ts
   * // Regular usage
   * Arr.filterNot([1, 2, 3, 4], (x) => x % 2 === 0); // [1, 3] (excludes even numbers)
   *
   * // Curried usage for pipe composition
   * const excludeEvens = Arr.filterNot((x: number) => x % 2 === 0);
   * const result = pipe([1, 2, 3, 4, 5, 6]).map(excludeEvens).value;
   * console.log(result); // [1, 3, 5]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const filterNot: FilterNotFnOverload = (<E,>(
    ...args:
      | readonly [
          array: readonly E[],
          predicate: (a: E, index: SizeType.Arr) => boolean,
        ]
      | readonly [predicate: (a: E, index: SizeType.Arr) => boolean]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, predicate] = args;
        return array.filter((a, i) => !predicate(a, asUint32(i)));
      }
      case 1: {
        const [predicate] = args;
        return (array: readonly E[]) => filterNot(array, predicate);
      }
    }
  }) as FilterNotFnOverload;

  type FilterNotFnOverload = {
    <E>(
      array: readonly E[],
      predicate: (a: E, index: SizeType.Arr) => boolean,
    ): readonly E[];

    // curried version
    <E>(
      predicate: (a: E, index: SizeType.Arr) => boolean,
    ): (array: readonly E[]) => readonly E[];
  };

  /**
   * Concatenates two arrays.
   * @template E1 The type of the first array (can be a tuple).
   * @template E2 The type of the second array (can be a tuple).
   * @param array1 The first array.
   * @param array2 The second array.
   * @returns A new array that is the concatenation of the two input arrays. Type is `readonly [...E1, ...E2]`.
   * @example
   * ```ts
   * Arr.concat([1, 2] as const, [3, 4] as const); // [1, 2, 3, 4]
   * Arr.concat([], [1, 2]); // [1, 2]
   * Arr.concat([1, 2], []); // [1, 2]
   * ```
   */
  export const concat = <
    Ar1 extends readonly unknown[],
    Ar2 extends readonly unknown[],
  >(
    array1: Ar1,
    array2: Ar2,
  ): readonly [...Ar1, ...Ar2] => [...array1, ...array2];

  /**
   * Partitions an array into sub-arrays of a specified size.
   * The last partition may be smaller if the array length is not a multiple of `chunkSize`.
   * Returns an empty array if chunkSize < 2.
   * @template N The size of each partition (must be a number type, typically a literal for precise typing).
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param chunkSize The size of each partition.
   * @returns An array of arrays, where each inner array has up to `chunkSize` elements.
   * @example
   * ```ts
   * // Regular usage
   * Arr.partition([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
   *
   * // Curried usage for pipe composition
   * const chunkBy3 = Arr.partition(3);
   * const result = pipe([1, 2, 3, 4, 5, 6, 7]).map(chunkBy3).value;
   * console.log(result); // [[1, 2, 3], [4, 5, 6], [7]]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const partition: PartitionFnOverload = (<
    N extends WithSmallInt<PositiveInt & SizeType.Arr>,
    E,
  >(
    ...args:
      | readonly [array: readonly E[], chunkSize: N]
      | readonly [chunkSize: N]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, chunkSize] = args;
        return chunkSize < 2
          ? []
          : seq(asUint32(Math.ceil(array.length / chunkSize))).map((i) =>
              array.slice(chunkSize * i, chunkSize * (i + 1)),
            );
      }
      case 1: {
        const [chunkSize] = args;
        return (array: readonly E[]) => partition(array, chunkSize);
      }
    }
  }) as PartitionFnOverload;

  type PartitionFnOverload = {
    <N extends WithSmallInt<PositiveInt & SizeType.Arr>, E>(
      array: readonly E[],
      chunkSize: N,
    ): readonly (readonly E[])[];

    // curried version
    <N extends WithSmallInt<PositiveInt & SizeType.Arr>>(
      chunkSize: N,
    ): <E>(array: readonly E[]) => readonly (readonly E[])[];
  };

  /**
   * Sorts an array by a value derived from its elements, using a numeric mapping.
   * @template E The type of elements in the array.
   * @param array The input array.
   * @param comparatorValueMapper A function `(value: A) => number` that maps an element to a number for comparison.
   * @param comparator An optional custom comparator function `(x: number, y: number) => number` for the mapped numbers. Defaults to ascending sort (x - y).
   * @returns A new array sorted by the mapped values.
   * @example
   * ```ts
   * const items = [{ name: 'Eve', score: 70 }, { name: 'Adam', score: 90 }, { name: 'Bob', score: 80 }];
   * Arr.toSortedBy(items, item => item.score);
   * // [{ name: 'Eve', score: 70 }, { name: 'Bob', score: 80 }, { name: 'Adam', score: 90 }]
   * Arr.toSortedBy(items, item => item.score, (a, b) => b - a); // Sort descending
   * // [{ name: 'Adam', score: 90 }, { name: 'Bob', score: 80 }, { name: 'Eve', score: 70 }]
   * ```
   */
  export const toSortedBy: ToSortedByFnOverload = <E, const V>(
    array: readonly E[],
    comparatorValueMapper: (value: E) => V,
    comparator?: (x: V, y: V) => number,
  ): readonly E[] =>
    array.toSorted((x, y) =>
      comparator === undefined
        ? // This branch assumes B is number if comparator is undefined.
          // The overloads should handle this, but explicit cast might be needed if B is not number.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          (comparatorValueMapper(x) as number) -
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          (comparatorValueMapper(y) as number)
        : comparator(comparatorValueMapper(x), comparatorValueMapper(y)),
    );

  type ToSortedByFnOverload = {
    <E>(
      array: readonly E[],
      comparatorValueMapper: (value: E) => number,
      comparator?: (x: number, y: number) => number,
    ): readonly E[];

    <E, const V>(
      array: readonly E[],
      comparatorValueMapper: (value: E) => V,
      comparator: (x: V, y: V) => number,
    ): readonly E[];
  };

  /**
   * Returns an array of successively reduced values from an array, starting with an initial value.
   *
   * This function creates a \"running tally\" by applying a reducer function to each element and
   * accumulating the results. Unlike {@link reduce} which returns a single final value, `scan`
   * returns all intermediate accumulated values, providing visibility into the reduction process.
   *
   * **Key Differences from Reduce:**
   * - {@link reduce}: `[1, 2, 3] -> 6` (final sum only)
   * - `scan`: `[1, 2, 3] -> [0, 1, 3, 6]` (all intermediate sums including initial value)
   *
   * **Guaranteed Non-Empty Return:** The result is always a {@link NonEmptyArray}<S> because it includes
   * the initial value as the first element, even for empty input arrays. This provides type safety
   * and eliminates the need for empty array checks.
   *
   * **Array Length Relationship:** `result.length === array.length + 1` (includes initial value)
   *
   * **Curried Usage:** Supports currying for functional composition - when called with only the reducer
   * and initial value, returns a reusable function that can be applied to arrays.
   *
   * @template E The type of elements in the input array.
   * @template S The type of the accumulated values and the initial value.
   * @param array The input array to scan over. Can be empty (result will still contain the initial value).
   * @param reducer A function `(accumulator: S, currentValue: E, currentIndex: SizeType.Arr) => S` that:
   *   - **accumulator:** The current accumulated value (starts with `init`, then previous results)
   *   - **currentValue:** The current array element being processed
   *   - **currentIndex:** The 0-based index of the current element (typed as {@link SizeType.Arr})
   *   - **returns:** The new accumulated value to include in the result array
   * @param init The initial accumulated value. Becomes the first element of the result array.
   * @returns A {@link NonEmptyArray}<S> of accumulated values with length `array.length + 1`:
   *   - `result[0]` is always the `init` value
   *   - `result[i+1]` is the result of applying the reducer to `result[i]` and `array[i]`
   *   - Guaranteed to be non-empty regardless of input array length
   *
   * @example
   * ```typescript
   * // Basic running sum example
   * const numbers = [1, 2, 3, 4];
   * const runningSum = Arr.scan(numbers, (acc, curr) => acc + curr, 0);
   * // NonEmptyArray<number> -> [0, 1, 3, 6, 10]
   * //                           ^  ^  ^  ^  ^
   * //                           |  |  |  |  └─ 0+1+2+3+4 = 10
   * //                           |  |  |  └─ 0+1+2+3 = 6
   * //                           |  |  └─ 0+1+2 = 3
   * //                           |  └─ 0+1 = 1
   * //                           └─ init = 0
   *
   * // Difference from reduce
   * const reduced = numbers.reduce((acc, curr) => acc + curr, 0); // 10 (final only)
   * const scanned = Arr.scan(numbers, (acc, curr) => acc + curr, 0); // [0, 1, 3, 6, 10] (all steps)
   *
   * // Running product
   * const factorial = Arr.scan([1, 2, 3, 4, 5], (acc, curr) => acc * curr, 1);
   * // [1, 1, 2, 6, 24, 120] - factorial sequence
   *
   * // Running maximum
   * const temperatures = [20, 25, 18, 30, 22];
   * const runningMax = Arr.scan(temperatures, (max, temp) => Math.max(max, temp), -Infinity);
   * // [-Infinity, 20, 25, 25, 30, 30]
   *
   * // Building strings incrementally
   * const words = ['Hello', 'beautiful', 'world'];
   * const sentences = Arr.scan(words, (sentence, word) => sentence + ' ' + word, '');
   * // ['', ' Hello', ' Hello beautiful', ' Hello beautiful world']
   *
   * // Array accumulation (collecting elements)
   * const items = ['a', 'b', 'c'];
   * const growing = Arr.scan(items, (acc, item) => [...acc, item], [] as string[]);
   * // [[], ['a'], ['a', 'b'], ['a', 'b', 'c']]
   *
   * // Financial running balance
   * const transactions = [100, -20, 50, -30];
   * const balances = Arr.scan(transactions, (balance, transaction) => balance + transaction, 1000);
   * // [1000, 1100, 1080, 1130, 1100] - account balance after each transaction
   *
   * // Using index information
   * const letters = ['a', 'b', 'c'];
   * const indexed = Arr.scan(letters, (acc, letter, index) => acc + `${index}:${letter} `, '');
   * // ['', '0:a ', '0:a 1:b ', '0:a 1:b 2:c ']
   *
   * // Edge cases
   * const emptyArray: number[] = [];
   * const emptyResult = Arr.scan(emptyArray, (acc, curr) => acc + curr, 42);
   * // [42] - NonEmptyArray even for empty input
   *
   * const singleElement = Arr.scan([5], (acc, curr) => acc * curr, 2);
   * // [2, 10] - init value plus one result
   *
   * // Complex object accumulation
   * const sales = [
   *   { product: 'A', amount: 100 },
   *   { product: 'B', amount: 200 },
   *   { product: 'A', amount: 150 }
   * ];
   *
   * const runningSales = Arr.scan(sales, (totals, sale) => ({
   *   ...totals,
   *   [sale.product]: (totals[sale.product] || 0) + sale.amount
   * }), {} as Record<string, number>);
   * // [
   * //   {},
   * //   { A: 100 },
   * //   { A: 100, B: 200 },
   * //   { A: 250, B: 200 }
   * // ]
   *
   * // Curried usage for functional composition
   * const runningSumFn = Arr.scan((acc: number, curr: number) => acc + curr, 0);
   * const runningProductFn = Arr.scan((acc: number, curr: number) => acc * curr, 1);
   * const collectingFn = Arr.scan((acc: string[], curr: string) => [...acc, curr], [] as string[]);
   *
   * const datasets = [[1, 2, 3], [4, 5], [6, 7, 8, 9]];
   * const allSums = datasets.map(runningSumFn);
   * // [
   * //   [0, 1, 3, 6],
   * //   [0, 4, 9],
   * //   [0, 6, 13, 21, 30]
   * // ]
   *
   * // Pipe composition for data analysis
   * const analysisResult = pipe([10, 20, 30, 40])
   *   .map(runningSumFn)
   *   .map(sums => sums.slice(1)) // Remove initial value to get pure running sums
   *   .map(sums => sums.map((sum, i) => ({ step: i + 1, total: sum })))
   *   .value;
   * // [{ step: 1, total: 10 }, { step: 2, total: 30 }, { step: 3, total: 60 }, { step: 4, total: 100 }]
   *
   * // Advanced: State machine simulation
   * type State = 'idle' | 'loading' | 'success' | 'error';
   * type Event = 'start' | 'complete' | 'fail' | 'reset';
   *
   * const events: Event[] = ['start', 'complete', 'reset', 'start', 'fail'];
   * const stateTransition = (state: State, event: Event): State => {
   *   switch (state) {
   *     case 'idle': return event === 'start' ? 'loading' : state;
   *     case 'loading': return event === 'complete' ? 'success' : event === 'fail' ? 'error' : state;
   *     case 'success': return event === 'reset' ? 'idle' : state;
   *     case 'error': return event === 'reset' ? 'idle' : state;
   *   }
   * };
   *
   * const stateHistory = Arr.scan(events, stateTransition, 'idle' as State);
   * // ['idle', 'loading', 'success', 'idle', 'loading', 'error']
   *
   * // Type inference examples
   * expectType<typeof runningSum, NonEmptyArray<number>>('=');
   * expectType<typeof emptyResult, NonEmptyArray<number>>('=');
   * expectType<typeof runningSumFn, <T extends readonly number[]>(array: T) => NonEmptyArray<number>>('=');
   * expectType<typeof stateHistory, NonEmptyArray<State>>('=');
   * ```
   *
   * @see {@link reduce} for getting only the final accumulated value
   * @see {@link NonEmptyArray} for understanding the guaranteed non-empty return type
   * @see {@link SizeType.Arr} for the index parameter type
   * @see Array.prototype.reduce for the standard reduce function
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const scan: ScanFnOverload = (<E, S>(
    ...args:
      | readonly [
          array: readonly E[],
          reducer: (
            accumulator: S,
            currentValue: E,
            currentIndex: SizeType.Arr,
          ) => S,
          init: S,
        ]
      | readonly [
          reducer: (
            accumulator: S,
            currentValue: E,
            currentIndex: SizeType.Arr,
          ) => S,
          init: S,
        ]
  ) => {
    switch (args.length) {
      case 3: {
        const [array, reducer, init] = args;
        const mut_result: MutableNonEmptyArray<S> = castMutable(
          newArray<S>(asPositiveUint32(array.length + 1), init),
        );

        let mut_acc = init;

        for (const [index, value] of array.entries()) {
          mut_acc = reducer(mut_acc, value, asUint32(index));
          mut_result[index + 1] = mut_acc;
        }

        return mut_result;
      }
      case 2: {
        const [reducer, init] = args;
        return (array: readonly E[]) => scan(array, reducer, init);
      }
    }
  }) as ScanFnOverload;

  type ScanFnOverload = {
    <E, S>(
      array: readonly E[],
      reducer: (
        accumulator: S,
        currentValue: E,
        currentIndex: SizeType.Arr,
      ) => S,
      init: S,
    ): NonEmptyArray<S>;

    // curried version
    <E, S>(
      reducer: (
        accumulator: S,
        currentValue: E,
        currentIndex: SizeType.Arr,
      ) => S,
      init: S,
    ): (array: readonly E[]) => NonEmptyArray<S>;
  };

  /**
   * Groups elements of an array by a key derived from each element, returning an immutable {@link IMap}.
   *
   * This function categorizes array elements into groups based on a computed key, using the efficient
   * {@link IMap} data structure for the result. The grouper function receives both the element and its
   * index, enabling flexible grouping strategies.
   *
   * **MapSetKeyType Constraint:** The group key type `G` must extend {@link MapSetKeyType}, which includes
   * primitive types that can be used as Map keys (string, number, boolean, symbol, null, undefined).
   * This constraint ensures type safety and efficient key-based operations.
   *
   * **IMap Return Type:** Returns an {@link IMap}<G, readonly E[]> where:
   * - Keys are the computed group identifiers of type `G`
   * - Values are immutable arrays containing all elements that belong to each group
   * - Preserves insertion order of first occurrence of each group
   * - Maintains type safety with precise generic types
   *
   * **Curried Usage:** Supports currying for functional composition - when called with only the grouper
   * function, returns a reusable function that can be applied to arrays.
   *
   * @template E The type of elements in the input array.
   * @template G The type of the group key, constrained to {@link MapSetKeyType} (primitives usable as Map keys).
   *   Must be one of: `string | number | boolean | symbol | null | undefined`
   * @param array The input array to group. Can be empty (returns empty {@link IMap}).
   * @param grouper A function `(value: E, index: SizeType.Arr) => G` that computes the group key for each element.
   *   - **value:** The current array element
   *   - **index:** The 0-based index of the element (typed as {@link SizeType.Arr})
   *   - **returns:** The group key (must be {@link MapSetKeyType})
   * @returns An {@link IMap}<G, readonly E[]> where:
   *   - Keys are unique group identifiers computed by the grouper function
   *   - Values are immutable arrays of elements belonging to each group
   *   - Empty groups are not included (only groups with at least one element)
   *   - Insertion order is preserved based on first occurrence of each group key
   *
   * @example
   * ```typescript
   * // Basic grouping by object property
   * const products = [
   *   { type: 'fruit', name: 'apple', price: 1.2 },
   *   { type: 'vegetable', name: 'carrot', price: 0.8 },
   *   { type: 'fruit', name: 'banana', price: 0.9 },
   *   { type: 'vegetable', name: 'broccoli', price: 2.1 },
   *   { type: 'fruit', name: 'orange', price: 1.5 }
   * ];
   *
   * const byType = Arr.groupBy(products, item => item.type);
   * // IMap<string, readonly Product[]> {
   * //   'fruit' => [
   * //     { type: 'fruit', name: 'apple', price: 1.2 },
   * //     { type: 'fruit', name: 'banana', price: 0.9 },
   * //     { type: 'fruit', name: 'orange', price: 1.5 }
   * //   ],
   * //   'vegetable' => [
   * //     { type: 'vegetable', name: 'carrot', price: 0.8 },
   * //     { type: 'vegetable', name: 'broccoli', price: 2.1 }
   * //   ]
   * // }
   *
   * // Access grouped results with IMap methods
   * const fruits = IMap.get(byType, 'fruit'); // Optional<readonly Product[]>
   * const fruitCount = Optional.map(fruits, arr => arr.length); // Optional<number>
   * const fruitNames = Optional.map(fruits, arr => arr.map(p => p.name)); // Optional<string[]>
   *
   * // Grouping by computed values
   * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
   * const byParity = Arr.groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd');
   * // IMap<string, readonly number[]> {
   * //   'odd' => [1, 3, 5, 7, 9],
   * //   'even' => [2, 4, 6, 8, 10]
   * // }
   *
   * // Grouping by price ranges using index information
   * const byPriceRange = Arr.groupBy(products, (product, index) => {
   *   const category = product.price < 1.0 ? 'cheap' :
   *                   product.price < 2.0 ? 'moderate' : 'expensive';
   *   return `${category}_${index < 2 ? 'early' : 'late'}`;
   * });
   *
   * // MapSetKeyType constraint examples (valid key types)
   * const byStringKey = Arr.groupBy([1, 2, 3], n => `group_${n}`); // string keys
   * const byNumberKey = Arr.groupBy(['a', 'b', 'c'], (_, i) => i); // number keys
   * const byBooleanKey = Arr.groupBy([1, 2, 3, 4], n => n > 2); // boolean keys
   * const bySymbolKey = Arr.groupBy([1, 2], n => Symbol(n.toString())); // symbol keys
   *
   * // Edge cases
   * const emptyGroup = Arr.groupBy([], x => x); // IMap<never, readonly never[]> (empty)
   * const singleGroup = Arr.groupBy([1, 2, 3], () => 'all'); // All elements in one group
   * const uniqueGroups = Arr.groupBy([1, 2, 3], x => x); // Each element in its own group
   *
   * // Curried usage for functional composition
   * const groupByType = Arr.groupBy((item: { type: string }) => item.type);
   * const groupByLength = Arr.groupBy((str: string) => str.length);
   * const groupByFirstChar = Arr.groupBy((str: string) => str.charAt(0).toLowerCase());
   *
   * const datasets = [
   *   [{ type: 'A' }, { type: 'B' }, { type: 'A' }],
   *   [{ type: 'C' }, { type: 'A' }],
   *   [{ type: 'B' }, { type: 'B' }, { type: 'C' }]
   * ];
   * const allGrouped = datasets.map(groupByType);
   * // Array of IMap instances, each grouped by type
   *
   * // Pipe composition for complex data processing
   * const words = ['apple', 'banana', 'apricot', 'blueberry', 'avocado', 'blackberry'];
   * const processedGroups = pipe(words)
   *   .map(groupByFirstChar)
   *   .map(groupMap => IMap.map(groupMap, (wordsInGroup, firstLetter) => ({
   *     letter: firstLetter,
   *     count: wordsInGroup.length,
   *     longest: wordsInGroup.reduce((longest, word) =>
   *       word.length > longest.length ? word : longest
   *     )
   *   })))
   *   .value;
   * // IMap<string, {letter: string, count: number, longest: string}>
   *
   * // Advanced: Grouping with complex transformations
   * const students = [
   *   { name: 'Alice', grade: 85, subject: 'Math' },
   *   { name: 'Bob', grade: 92, subject: 'Science' },
   *   { name: 'Charlie', grade: 78, subject: 'Math' },
   *   { name: 'Diana', grade: 96, subject: 'Science' }
   * ];
   *
   * const byGradeLevel = Arr.groupBy(students, student => {
   *   if (student.grade >= 90) return 'A';
   *   if (student.grade >= 80) return 'B';
   *   return 'C';
   * });
   *
   * // Working with the grouped results
   * const aStudents = Optional.unwrapOr(IMap.get(byGradeLevel, 'A'), []);
   * const averageAGrade = aStudents.length > 0
   *   ? aStudents.reduce((sum, s) => sum + s.grade, 0) / aStudents.length
   *   : 0;
   *
   * // Type inference examples
   * expectType<typeof byType, IMap<string, readonly typeof products[number][]>>('=');
   * expectType<typeof byParity, IMap<string, readonly number[]>>('=');
   * expectType<typeof groupByType, <T extends {type: string}>(array: readonly T[]) => IMap<string, readonly T[]>>('=');
   * expectType<typeof emptyGroup, IMap<never, readonly never[]>>('=');
   * ```
   *
   * @see {@link IMap} for working with the returned immutable map
   * @see {@link MapSetKeyType} for understanding valid key types
   * @see {@link IMap.get} for safely accessing grouped results
   * @see {@link IMap.map} for transforming grouped data
   * @see {@link Optional} for handling potentially missing groups
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const groupBy: GroupByFnOverload = (<E, G extends MapSetKeyType>(
    ...args:
      | readonly [
          array: readonly E[],
          grouper: (value: E, index: SizeType.Arr) => G,
        ]
      | readonly [grouper: (value: E, index: SizeType.Arr) => G]
  ) => {
    switch (args.length) {
      case 2: {
        const [array, grouper] = args;
        const mut_groups = new Map<G, E[]>(); // Store mutable arrays internally

        for (const [index, e] of array.entries()) {
          const key = grouper(e, asUint32(index)); // Ensure index is treated as SizeType.Arr
          const mut_group = mut_groups.get(key);
          if (mut_group !== undefined) {
            mut_group.push(e);
          } else {
            mut_groups.set(key, [e]);
          }
        }
        // Cast to IMap<G, readonly A[]> for the public interface
        return IMap.create<G, readonly E[]>(mut_groups);
      }
      case 1: {
        const [grouper] = args;
        return (array: readonly E[]) => groupBy(array, grouper);
      }
    }
  }) as GroupByFnOverload;

  type GroupByFnOverload = {
    <E, G extends MapSetKeyType>(
      array: readonly E[],
      grouper: (value: E, index: SizeType.Arr) => G,
    ): IMap<G, readonly E[]>;

    // curried version
    <E, G extends MapSetKeyType>(
      grouper: (value: E, index: SizeType.Arr) => G,
    ): (array: readonly E[]) => IMap<G, readonly E[]>;
  };

  /**
   * Creates a new array with unique elements from the input array. Order is preserved from the first occurrence.
   * Uses `Set` internally for efficient uniqueness checking.
   * @template P The type of elements in the array.
   * @param array The input array.
   * @returns A new array with unique elements from the input array. Returns `[]` for an empty input.
   * @example
   * ```ts
   * Arr.uniq([1, 2, 2, 3, 1, 4]); // [1, 2, 3, 4]
   * Arr.uniq(['a', 'b', 'a']); // ['a', 'b']
   * ```
   */
  export const uniq = <P extends Primitive>(
    array: readonly P[],
  ): readonly P[] => Array.from(new Set(array));

  /**
   * Creates a new array with unique elements from the input array, based on the values returned by `mapFn`.
   *
   * - If the input is a non-empty array, returns a non-empty array.
   * - Otherwise, returns a readonly array.
   *
   * @template E The type of elements in the array.
   * @template P The type of the mapped value (used for uniqueness comparison).
   * @param array The input array.
   * @param mapFn A function `(value: A) => P` to map elements to values for uniqueness comparison.
   * @returns A new array with unique elements based on the mapped values.
   * @example
   * ```ts
   * const users = [
   *   { id: 1, name: 'Alice' },
   *   { id: 2, name: 'Bob' },
   *   { id: 1, name: 'Alicia' }, // Duplicate id
   * ];
   * Arr.uniqBy(users, user => user.id); // [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  export const uniqBy: UniqByFnOverload = (<E, P extends Primitive>(
    array: readonly E[],
    mapFn: (value: E) => P,
  ): readonly E[] => {
    const mut_mappedValues = new Set<P>();

    return array.filter((val) => {
      const mappedValue = mapFn(val);

      if (mut_mappedValues.has(mappedValue)) return false;
      mut_mappedValues.add(mappedValue);

      return true;
    });
  }) as UniqByFnOverload;

  type UniqByFnOverload = {
    <E, P extends Primitive>(
      array: NonEmptyArray<E>,
      mapFn: (value: E) => P,
    ): NonEmptyArray<E>;

    <E, P extends Primitive>(
      array: readonly E[],
      mapFn: (value: E) => P,
    ): readonly E[];
  };

  // set operations & equality

  /**
   * Checks if two arrays are equal by performing a shallow comparison of their elements.
   * @template E The type of elements in the arrays.
   * @param array1 The first array.
   * @param array2 The second array.
   * @param equality An optional function `(a: T, b: T) => boolean` to compare elements. Defaults to `Object.is`.
   * @returns `true` if the arrays have the same length and all corresponding elements are equal according to the `equality` function, `false` otherwise.
   * @example
   * ```ts
   * Arr.eq([1, 2, 3], [1, 2, 3]); // true
   * Arr.eq([1, 2, 3], [1, 2, 4]); // false
   * Arr.eq([1, 2], [1, 2, 3]); // false
   * Arr.eq([{a:1}], [{a:1}]); // false (different object references)
   * Arr.eq([{a:1}], [{a:1}], (o1, o2) => o1.a === o2.a); // true
   * ```
   */
  export const eq = <E,>(
    array1: readonly E[],
    array2: readonly E[],
    equality: (a: E, b: E) => boolean = Object.is,
  ): boolean =>
    array1.length === array2.length &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    array1.every((v, i) => equality(v, array2[i]!));

  /**
   * Alias for `eq`.
   */
  export const equal = eq;

  /**
   * Checks if the first array (`array1`) is a subset of the second array (`array2`).
   * An array `A` is a subset of `B` if all elements of `A` are also present in `B`.
   * Elements must be primitive types for `includes` to work reliably for comparison.
   * @template E1 The type of elements in the first array (subset candidate), must be a primitive type.
   * @template E2 The type of elements in the second array (superset candidate), must be a primitive type.
   * @param array1 The first array.
   * @param array2 The second array.
   * @returns `true` if `array1` is a subset of `array2`, `false` otherwise.
   * @remarks `array1` ⊂ `array2`
   * @example
   * ```ts
   * Arr.isSubset([1, 2], [1, 2, 3]); // true
   * Arr.isSubset([1, 2, 3], [1, 2]); // false
   * Arr.isSubset([], [1, 2, 3]); // true
   * Arr.isSubset([1, 5], [1, 2, 3]); // false
   * ```
   */
  export const isSubset = <E1 extends Primitive, E2 extends Primitive = E1>(
    array1: readonly E1[],
    array2: readonly E2[],
  ): boolean =>
    array1.every((a) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      array2.includes(a as E1 & E2),
    );

  /**
   * Checks if the first array (`array1`) is a superset of the second array (`array2`).
   * An array `A` is a superset of `B` if all elements of `B` are also present in `A`.
   * Elements must be primitive types.
   * @template E1 The type of elements in the first array (superset candidate), must be a primitive type.
   * @template E2 The type of elements in the second array (subset candidate), must be a primitive type.
   * @param array1 The first array.
   * @param array2 The second array.
   * @returns `true` if `array1` is a superset of `array2`, `false` otherwise.
   * @remarks `array1` ⊃ `array2`
   * @example
   * ```ts
   * Arr.isSuperset([1, 2, 3], [1, 2]); // true
   * Arr.isSuperset([1, 2], [1, 2, 3]); // false
   * Arr.isSuperset([1, 2, 3], []); // true
   * ```
   */
  export const isSuperset = <E1 extends Primitive, E2 extends Primitive = E1>(
    array1: readonly E1[],
    array2: readonly E2[],
  ): boolean => isSubset(array2, array1);

  /**
   * Returns the intersection of two arrays of primitive types.
   * The intersection contains elements that are present in both arrays. Order is based on `array1`.
   * @template E1 The type of elements in the first array (must be a primitive type).
   * @template E2 The type of elements in the second array (must be a primitive type).
   * @param array1 The first array.
   * @param array2 The second array.
   * @returns A new array containing elements that are in both `array1` and `array2`.
   * @example
   * ```ts
   * Arr.setIntersection([1, 2, 3], [2, 3, 4]); // [2, 3]
   * Arr.setIntersection(['a', 'b'], ['b', 'c']); // ['b']
   * Arr.setIntersection([1, 2], [3, 4]); // []
   * ```
   */
  export const setIntersection = <
    E1 extends Primitive,
    E2 extends Primitive = E1,
  >(
    array1: readonly E1[],
    array2: readonly E2[],
  ): readonly (E1 & E2)[] =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    array1.filter((e) => array2.includes(e as E1 & E2)) as (E1 & E2)[];

  /**
   * Returns the set difference of two arrays (`array1` - `array2`).
   * The difference contains elements that are in `array1` but not in `array2`. Order is based on `array1`.
   * Elements must be primitive types.
   * @template E The type of elements in the arrays (must be a primitive type).
   * @param array1 The first array.
   * @param array2 The second array.
   * @returns A new array containing elements from `array1` that are not in `array2`.
   * @example
   * ```ts
   * Arr.setDifference([1, 2, 3], [2, 3, 4]); // [1]
   * Arr.setDifference([1, 2, 3], [1, 2, 3]); // []
   * Arr.setDifference([1, 2], [3, 4]); // [1, 2]
   * ```
   */
  export const setDifference = <E extends Primitive>(
    array1: readonly E[],
    array2: readonly E[],
  ): readonly E[] => array1.filter((e) => !array2.includes(e));

  /**
   * Returns the set difference of two sorted arrays of numbers (`sortedList1` - `sortedList2`).
   * This operation is more efficient for sorted arrays than the generic `setDifference`.
   * The resulting array is also sorted.
   * @template E The type of numbers in the arrays (must extend `number`).
   * @param sortedList1 The first sorted array of numbers.
   * @param sortedList2 The second sorted array of numbers.
   * @returns A new sorted array containing numbers from `sortedList1` that are not in `sortedList2`.
   * @example
   * ```ts
   * Arr.sortedNumSetDifference([1, 2, 3, 5], [2, 4, 5]); // [1, 3]
   * Arr.sortedNumSetDifference([1, 2, 3], [1, 2, 3]); // []
   * Arr.sortedNumSetDifference([1, 2], [3, 4]); // [1, 2]
   * ```
   */
  export const sortedNumSetDifference = <E extends number>(
    sortedList1: readonly E[],
    sortedList2: readonly E[],
  ): readonly E[] => {
    const mut_result: E[] = [];
    let mut_it1 = 0; // iterator for sortedList1
    let mut_it2 = 0; // iterator for sortedList2

    while (mut_it1 < sortedList1.length && mut_it2 < sortedList2.length) {
      // Non-null assertions are safe due to loop condition
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const val1 = sortedList1[mut_it1]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const val2 = sortedList2[mut_it2]!;

      if (val1 === val2) {
        mut_it1 += 1;
        mut_it2 += 1;
      } else if (val1 < val2) {
        mut_result.push(val1);
        mut_it1 += 1;
      } else {
        // val1 > val2
        mut_it2 += 1;
      }
    }
    // Add remaining elements from sortedList1
    for (; mut_it1 < sortedList1.length; mut_it1 += 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mut_result.push(sortedList1[mut_it1]!);
    }

    return mut_result;
  };

  // aliases

  /**
   * Alias for `head`. Returns the first element of an array.
   * @see {@link head}
   */
  export const first = head;

  /**
   * Alias for `tail`. Returns all elements of an array except the first one.
   * @see {@link tail}
   */
  export const rest = tail;

  /**
   * Alias for `skip`. Skips the first N elements of an array.
   * @see {@link skip}
   */
  export const drop = skip;

  /**
   * Alias for `foldl`. Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
   * @see {@link foldl}
   */
  export const reduce = foldl;

  /**
   * Alias for `foldr`. Applies a function against an accumulator and each element in the array (from right to left) to reduce it to a single value.
   * @see {@link foldr}
   */
  export const reduceRight = foldr;

  /**
   * Alias for `partition`. Splits an array into chunks of a specified size.
   * @see {@link partition}
   */
  export const chunk = partition;
}
