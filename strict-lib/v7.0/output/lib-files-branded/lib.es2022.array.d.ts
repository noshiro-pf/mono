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

interface Int8Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Int8 | undefined;
}

interface Uint8Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint8 | undefined;
}

interface Uint8ClampedArray<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint8 | undefined;
}

interface Int16Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Int16 | undefined;
}

interface Uint16Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint16 | undefined;
}

interface Int32Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Int32 | undefined;
}

interface Uint32Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Uint32 | undefined;
}

interface Float32Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Float32 | undefined;
}

interface Float64Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').Float64 | undefined;
}

interface BigInt64Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').BigInt64 | undefined;
}

interface BigUint64Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(
    index: NumberType.TypedArraySizeArg,
  ): import('ts-type-forge').BigUint64 | undefined;
}
