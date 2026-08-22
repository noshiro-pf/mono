interface Array<T> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: T | (import('ts-type-forge').WidenLiteral<T> & {}),
    fromIndex?: NumberType.ArraySizeArg,
  ): searchElement is T;
}

interface ReadonlyArray<T> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: T | (import('ts-type-forge').WidenLiteral<T> & {}),
    fromIndex?: NumberType.ArraySizeArg,
  ): searchElement is T;
}

interface Int8Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Int8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Uint8Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Uint8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Uint8ClampedArray<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Uint8,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Int16Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Int16,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Uint16Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Uint16,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Int32Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Int32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Uint32Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Uint32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Float32Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Float32,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}

interface Float64Array<TArrayBuffer extends ArrayBufferLike> {
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
  includes(
    searchElement: import('ts-type-forge').Float64,
    fromIndex?: NumberType.TypedArraySizeArg,
  ): boolean;
}
