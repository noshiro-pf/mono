/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface Array<T> {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends T>(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): T | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.ArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): readonly T[];

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending, ASCII
   *   character order.
   *
   *   ```ts
   *   [11, 2, 22, 1].toSorted((a, b) => a - b); // [1, 2, 11, 22]
   *   ```
   */
  toSorted(compareFn?: (a: T, b: T) => number): readonly T[];

  /**
   * Copies an array and removes elements while, if necessary, inserting new
   * elements in their place, returning the remaining elements.
   *
   * @param start The zero-based location in the array from which to start
   *   removing elements.
   * @param deleteCount The number of elements to remove.
   * @param items Elements to insert into the copied array in place of the
   *   deleted elements.
   * @returns A copy of the original array with the remaining elements.
   */
  toSpliced(
    start: NumberType.ArraySizeArg,
    deleteCount: NumberType.ArraySizeArg,
    ...items: readonly T[]
  ): readonly T[];

  /**
   * Copies an array and removes elements while returning the remaining
   * elements.
   *
   * @param start The zero-based location in the array from which to start
   *   removing elements.
   * @param deleteCount The number of elements to remove.
   * @returns A copy of the original array with the remaining elements.
   */
  toSpliced(
    start: NumberType.ArraySizeArg,
    deleteCount?: NumberType.ArraySizeArg,
  ): readonly T[];

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.ArraySizeArg, value: T): readonly T[];
}

interface ReadonlyArray<T> {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends T>(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): T | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.ArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): readonly T[];

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending, ASCII
   *   character order.
   *
   *   ```ts
   *   [11, 2, 22, 1].toSorted((a, b) => a - b); // [1, 2, 11, 22]
   *   ```
   */
  toSorted(compareFn?: (a: T, b: T) => number): readonly T[];

  /**
   * Copies an array and removes elements while, if necessary, inserting new
   * elements in their place, returning the remaining elements.
   *
   * @param start The zero-based location in the array from which to start
   *   removing elements.
   * @param deleteCount The number of elements to remove.
   * @param items Elements to insert into the copied array in place of the
   *   deleted elements.
   * @returns A copy of the original array with the remaining elements.
   */
  toSpliced(
    start: NumberType.ArraySizeArg,
    deleteCount: NumberType.ArraySizeArg,
    ...items: readonly T[]
  ): readonly T[];

  /**
   * Copies an array and removes elements while returning the remaining
   * elements.
   *
   * @param start The zero-based location in the array from which to start
   *   removing elements.
   * @param deleteCount The number of elements to remove.
   * @returns A copy of the original array with the remaining elements.
   */
  toSpliced(
    start: NumberType.ArraySizeArg,
    deleteCount?: NumberType.ArraySizeArg,
  ): readonly T[];

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.ArraySizeArg, value: T): readonly T[];
}

interface Int8Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Int8>(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: Int8Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: Int8Array,
    ) => boolean,
    thisArg?: unknown,
  ): Int8 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Int8,
      index: NumberType.TypedArraySize,
      array: Int8Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Int8Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Int8Array.from([11, 2, 22, 1]);
   *   myNums.toSorted((a, b) => a - b); // Int8Array(4) [1, 2, 11, 22]
   *   ```
   */
  toSorted(compareFn?: (a: Int8, b: Int8) => number): Int8Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Int8): Int8Array;
}

interface Uint8Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Uint8>(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8Array,
    ) => boolean,
    thisArg?: unknown,
  ): Uint8 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Uint8Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Uint8Array.from([11, 2, 22, 1]);
   *   myNums.toSorted((a, b) => a - b); // Uint8Array(4) [1, 2, 11, 22]
   *   ```
   */
  toSorted(compareFn?: (a: Uint8, b: Uint8) => number): Uint8Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Uint8): Uint8Array;
}

interface Uint8ClampedArray {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Uint8>(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8ClampedArray,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8ClampedArray,
    ) => boolean,
    thisArg?: unknown,
  ): Uint8 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8ClampedArray,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Uint8ClampedArray;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Uint8ClampedArray.from([11, 2, 22, 1]);
   *   myNums.toSorted((a, b) => a - b); // Uint8ClampedArray(4) [1, 2, 11, 22]
   *   ```
   */
  toSorted(compareFn?: (a: Uint8, b: Uint8) => number): Uint8ClampedArray;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Uint8): Uint8ClampedArray;
}

interface Int16Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Int16>(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: Int16Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: Int16Array,
    ) => boolean,
    thisArg?: unknown,
  ): Int16 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Int16,
      index: NumberType.TypedArraySize,
      array: Int16Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Int16Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Int16Array.from([11, 2, -22, 1]);
   *   myNums.toSorted((a, b) => a - b); // Int16Array(4) [-22, 1, 2, 11]
   *   ```
   */
  toSorted(compareFn?: (a: Int16, b: Int16) => number): Int16Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Int16): Int16Array;
}

interface Uint16Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Uint16>(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: Uint16Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: Uint16Array,
    ) => boolean,
    thisArg?: unknown,
  ): Uint16 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Uint16,
      index: NumberType.TypedArraySize,
      array: Uint16Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Uint16Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Uint16Array.from([11, 2, 22, 1]);
   *   myNums.toSorted((a, b) => a - b); // Uint16Array(4) [1, 2, 11, 22]
   *   ```
   */
  toSorted(compareFn?: (a: Uint16, b: Uint16) => number): Uint16Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Uint16): Uint16Array;
}

interface Int32Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Int32>(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: Int32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: Int32Array,
    ) => boolean,
    thisArg?: unknown,
  ): Int32 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Int32,
      index: NumberType.TypedArraySize,
      array: Int32Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Int32Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Int32Array.from([11, 2, -22, 1]);
   *   myNums.toSorted((a, b) => a - b); // Int32Array(4) [-22, 1, 2, 11]
   *   ```
   */
  toSorted(compareFn?: (a: Int32, b: Int32) => number): Int32Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Int32): Int32Array;
}

interface Uint32Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Uint32>(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: Uint32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: Uint32Array,
    ) => boolean,
    thisArg?: unknown,
  ): Uint32 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Uint32,
      index: NumberType.TypedArraySize,
      array: Uint32Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Uint32Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Uint32Array.from([11, 2, 22, 1]);
   *   myNums.toSorted((a, b) => a - b); // Uint32Array(4) [1, 2, 11, 22]
   *   ```
   */
  toSorted(compareFn?: (a: Uint32, b: Uint32) => number): Uint32Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Uint32): Uint32Array;
}

interface Float32Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Float32>(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: Float32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: Float32Array,
    ) => boolean,
    thisArg?: unknown,
  ): Float32 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Float32,
      index: NumberType.TypedArraySize,
      array: Float32Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Float32Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Float32Array.from([11.25, 2, -22.5, 1]);
   *   myNums.toSorted((a, b) => a - b); // Float32Array(4) [-22.5, 1, 2, 11.5]
   *   ```
   */
  toSorted(compareFn?: (a: Float32, b: Float32) => number): Float32Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Float32): Float32Array;
}

interface Float64Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends Float64>(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: Float64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: Float64Array,
    ) => boolean,
    thisArg?: unknown,
  ): Float64 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: Float64,
      index: NumberType.TypedArraySize,
      array: Float64Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): Float64Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = Float64Array.from([11.25, 2, -22.5, 1]);
   *   myNums.toSorted((a, b) => a - b); // Float64Array(4) [-22.5, 1, 2, 11.5]
   *   ```
   */
  toSorted(compareFn?: (a: Float64, b: Float64) => number): Float64Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: Float64): Float64Array;
}

interface BigInt64Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends BigInt64>(
    predicate: (
      value: BigInt64,
      index: NumberType.TypedArraySize,
      array: BigInt64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: BigInt64,
      index: NumberType.TypedArraySize,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): BigInt64 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: BigInt64,
      index: NumberType.TypedArraySize,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): BigInt64Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = BigInt64Array.from([11n, 2n, -22n, 1n]);
   *   myNums.toSorted((a, b) => Number(a - b)); // BigInt64Array(4) [-22n, 1n, 2n, 11n]
   *   ```
   */
  toSorted(compareFn?: (a: BigInt64, b: BigInt64) => number): BigInt64Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: BigInt64): BigInt64Array;
}

interface BigUint64Array {
  /**
   * Returns the value of the last element in the array where predicate is true,
   * and undefined otherwise.
   *
   * @param predicate FindLast calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLast immediately returns that
   *   element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLast<S extends BigUint64>(
    predicate: (
      value: BigUint64,
      index: NumberType.TypedArraySize,
      array: BigUint64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: BigUint64,
      index: NumberType.TypedArraySize,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): BigUint64 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true,
   * and -1 otherwise.
   *
   * @param predicate FindLastIndex calls predicate once for each element of the
   *   array, in descending order, until it finds one where predicate returns
   *   true. If such an element is found, findLastIndex immediately returns that
   *   element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findLastIndex(
    predicate: (
      value: BigUint64,
      index: NumberType.TypedArraySize,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;

  /** Returns a copy of an array with its elements reversed. */
  toReversed(): BigUint64Array;

  /**
   * Returns a copy of an array with its elements sorted.
   *
   * @param compareFn Function used to determine the order of the elements. It
   *   is expected to return a negative value if the first argument is less than
   *   the second argument, zero if they're equal, and a positive value
   *   otherwise. If omitted, the elements are sorted in ascending order.
   *
   *   ```ts
   *   const myNums = BigUint64Array.from([11n, 2n, 22n, 1n]);
   *   myNums.toSorted((a, b) => Number(a - b)); // BigUint64Array(4) [1n, 2n, 11n, 22n]
   *   ```
   */
  toSorted(compareFn?: (a: BigUint64, b: BigUint64) => number): BigUint64Array;

  /**
   * Copies an array, then overwrites the value at the provided index with the
   * given value. If the index is negative, then it replaces from the end of the
   * array.
   *
   * @param index The index of the value to overwrite. If the index is negative,
   *   then it replaces from the end of the array.
   * @param value The value to write into the copied array.
   * @returns The copied array with the updated value.
   */
  with(index: NumberType.TypedArraySizeArg, value: BigUint64): BigUint64Array;
}