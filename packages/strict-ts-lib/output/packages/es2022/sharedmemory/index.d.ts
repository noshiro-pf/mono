/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface Atomics {
  /**
   * A non-blocking, asynchronous version of wait which is usable on the main
   * thread. Waits asynchronously on a shared memory location and returns a
   * Promise
   *
   * @param typedArray A shared Int32Array or BigInt64Array.
   * @param index The position in the typedArray to wait on.
   * @param value The expected value to test.
   * @param [timeout] The expected value to test.
   */
  waitAsync(
    typedArray: Int32Array,
    index: number,
    value: number,
    timeout?: number,
  ):
    | { readonly async: false; readonly value: 'not-equal' | 'timed-out' }
    | { readonly async: true; readonly value: Promise<'ok' | 'timed-out'> };

  /**
   * A non-blocking, asynchronous version of wait which is usable on the main
   * thread. Waits asynchronously on a shared memory location and returns a
   * Promise
   *
   * @param typedArray A shared Int32Array or BigInt64Array.
   * @param index The position in the typedArray to wait on.
   * @param value The expected value to test.
   * @param [timeout] The expected value to test.
   */
  waitAsync(
    typedArray: BigInt64Array,
    index: number,
    value: bigint,
    timeout?: number,
  ):
    | { readonly async: false; readonly value: 'not-equal' | 'timed-out' }
    | { readonly async: true; readonly value: Promise<'ok' | 'timed-out'> };
}
