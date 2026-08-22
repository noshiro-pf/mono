/// <reference no-default-lib="true"/>

interface Array<T> {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
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
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.ArraySearchResult;
}

interface ReadonlyArray<T> {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
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
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: T,
      index: NumberType.ArraySize,
      array: readonly T[],
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.ArraySearchResult;
}

interface Int8Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Int8>(
    predicate: (
      value: import('ts-type-forge').Int8,
      index: NumberType.TypedArraySize,
      array: Int8Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Int8,
      index: NumberType.TypedArraySize,
      array: Int8Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Int8 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Int8,
      index: NumberType.TypedArraySize,
      array: Int8Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Uint8Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Uint8>(
    predicate: (
      value: import('ts-type-forge').Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Uint8 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Uint8ClampedArray {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Uint8>(
    predicate: (
      value: import('ts-type-forge').Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8ClampedArray,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8ClampedArray,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Uint8 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Uint8,
      index: NumberType.TypedArraySize,
      array: Uint8ClampedArray,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Int16Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Int16>(
    predicate: (
      value: import('ts-type-forge').Int16,
      index: NumberType.TypedArraySize,
      array: Int16Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Int16,
      index: NumberType.TypedArraySize,
      array: Int16Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Int16 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Int16,
      index: NumberType.TypedArraySize,
      array: Int16Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Uint16Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Uint16>(
    predicate: (
      value: import('ts-type-forge').Uint16,
      index: NumberType.TypedArraySize,
      array: Uint16Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Uint16,
      index: NumberType.TypedArraySize,
      array: Uint16Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Uint16 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Uint16,
      index: NumberType.TypedArraySize,
      array: Uint16Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Int32Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Int32>(
    predicate: (
      value: import('ts-type-forge').Int32,
      index: NumberType.TypedArraySize,
      array: Int32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Int32,
      index: NumberType.TypedArraySize,
      array: Int32Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Int32 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Int32,
      index: NumberType.TypedArraySize,
      array: Int32Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Uint32Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Uint32>(
    predicate: (
      value: import('ts-type-forge').Uint32,
      index: NumberType.TypedArraySize,
      array: Uint32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Uint32,
      index: NumberType.TypedArraySize,
      array: Uint32Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Uint32 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Uint32,
      index: NumberType.TypedArraySize,
      array: Uint32Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Float32Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Float32>(
    predicate: (
      value: import('ts-type-forge').Float32,
      index: NumberType.TypedArraySize,
      array: Float32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Float32,
      index: NumberType.TypedArraySize,
      array: Float32Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Float32 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Float32,
      index: NumberType.TypedArraySize,
      array: Float32Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface Float64Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').Float64>(
    predicate: (
      value: import('ts-type-forge').Float64,
      index: NumberType.TypedArraySize,
      array: Float64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').Float64,
      index: NumberType.TypedArraySize,
      array: Float64Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').Float64 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').Float64,
      index: NumberType.TypedArraySize,
      array: Float64Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface BigInt64Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').BigInt64>(
    predicate: (
      value: import('ts-type-forge').BigInt64,
      index: NumberType.TypedArraySize,
      array: BigInt64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').BigInt64,
      index: NumberType.TypedArraySize,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').BigInt64 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').BigInt64,
      index: NumberType.TypedArraySize,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}

interface BigUint64Array {
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined
   * otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found, findLast
   * immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLast<S extends import('ts-type-forge').BigUint64>(
    predicate: (
      value: import('ts-type-forge').BigUint64,
      index: NumberType.TypedArraySize,
      array: BigUint64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: import('ts-type-forge').BigUint64,
      index: NumberType.TypedArraySize,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): import('ts-type-forge').BigUint64 | undefined;

  /**
   * Returns the index of the last element in the array where predicate is true, and -1
   * otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending
   * order, until it finds one where predicate returns true. If such an element is found,
   * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex(
    predicate: (
      value: import('ts-type-forge').BigUint64,
      index: NumberType.TypedArraySize,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): NumberType.TypedArraySearchResult;
}
