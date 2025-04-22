/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference lib="es2020.bigint" />

interface Atomics {
  /**
   * A non-blocking, asynchronous version of wait which is usable on the main thread. Waits asynchronously on a shared memory location and returns a Promise
   *
   * @param typedArray A shared Int32Array or BigInt64Array.
   * @param index The position in the typedArray to wait on.
   * @param value The expected value to test.
   * @param [timeout] The expected value to test.
   */
  waitAsync(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArgNonNegative,
    value: Int32,
    timeout?: number,
  ):
    | { readonly async: false; readonly value: 'not-equal' | 'timed-out' }
    | { readonly async: true; readonly value: Promise<'ok' | 'timed-out'> };

  /**
   * A non-blocking, asynchronous version of wait which is usable on the main thread. Waits asynchronously on a shared memory location and returns a Promise
   *
   * @param typedArray A shared Int32Array or BigInt64Array.
   * @param index The position in the typedArray to wait on.
   * @param value The expected value to test.
   * @param [timeout] The expected value to test.
   */
  waitAsync(
    typedArray: BigInt64Array,
    index: NumberType.TypedArraySizeArgNonNegative,
    value: BigInt64,
    timeout?: number,
  ):
    | { readonly async: false; readonly value: 'not-equal' | 'timed-out' }
    | { readonly async: true; readonly value: Promise<'ok' | 'timed-out'> };
}

interface SharedArrayBuffer {
  /**
   * Returns true if this SharedArrayBuffer can be grown.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/growable)
   */
  get growable(): boolean;

  /**
   * If this SharedArrayBuffer is growable, returns the maximum byte length given during construction; returns the byte length if not.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/maxByteLength)
   */
  get maxByteLength(): NumberType.TypedArraySize;

  /**
   * Grows the SharedArrayBuffer to the specified size (in bytes).
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/grow)
   */
  grow(newByteLength?: NumberType.TypedArraySizeArgNonNegative): void;
}

interface SharedArrayBufferConstructor {
  new (
    byteLength: NumberType.TypedArraySizeArgNonNegative,
    options?: {
      readonly maxByteLength?: NumberType.TypedArraySizeArgNonNegative;
    },
  ): SharedArrayBuffer;
}
