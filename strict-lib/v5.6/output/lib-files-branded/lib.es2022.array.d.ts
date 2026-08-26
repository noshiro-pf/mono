/// <reference no-default-lib="true"/>

interface Array<T> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: NumberType.ArraySizeArg): T | undefined;
}

interface ReadonlyArray<T> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: NumberType.ArraySizeArg): T | undefined;
}

interface Int8Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Int8 | undefined;
}

interface Uint8Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint8 | undefined;
}

interface Uint8ClampedArray {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint8 | undefined;
}

interface Int16Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Int16 | undefined;
}

interface Uint16Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint16 | undefined;
}

interface Int32Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Int32 | undefined;
}

interface Uint32Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint32 | undefined;
}

interface Float32Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Float32 | undefined;
}

interface Float64Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Float64 | undefined;
}

interface BigInt64Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').BigInt64 | undefined;
}

interface BigUint64Array {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').BigUint64 | undefined;
}
