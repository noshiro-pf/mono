/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference lib="es2015.symbol" />
/// <reference lib="es2015.symbol.wellknown" />

interface SharedArrayBuffer {
  /** Read-only. The length of the ArrayBuffer (in bytes). */
  readonly byteLength: NumberType.TypedArraySize;

  /** Returns a section of an SharedArrayBuffer. */
  slice(
    begin?: NumberType.TypedArraySizeArg,
    end?: NumberType.TypedArraySizeArg,
  ): SharedArrayBuffer;
  readonly [Symbol.species]: SharedArrayBuffer;
  readonly [Symbol.toStringTag]: 'SharedArrayBuffer';
}

interface SharedArrayBufferConstructor {
  readonly prototype: SharedArrayBuffer;
  new (byteLength?: NumberType.TypedArraySizeArgNonNegative): SharedArrayBuffer;
}
declare const SharedArrayBuffer: SharedArrayBufferConstructor;

interface ArrayBufferTypes {
  readonly SharedArrayBuffer: SharedArrayBuffer;
}

interface Atomics {
  /** Adds a value to the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  add(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    value: Int8,
  ): Int8;
  add(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint8,
  ): Uint8;
  add(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    value: Int16,
  ): Int16;
  add(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint16,
  ): Uint16;
  add(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
  ): Int32;
  add(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint32,
  ): Uint32;

  /** Stores the bitwise AND of a value with the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  and(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    value: Int8,
  ): Int8;
  and(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint8,
  ): Uint8;
  and(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    value: Int16,
  ): Int16;
  and(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint16,
  ): Uint16;
  and(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
  ): Int32;
  and(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint32,
  ): Uint32;

  /** Replaces the value at the given position in the array if the original value equals the given expected value, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  compareExchange(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    expectedValue: Int8,
    replacementValue: Int8,
  ): Int8;
  compareExchange(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    expectedValue: Uint8,
    replacementValue: Uint8,
  ): Uint8;
  compareExchange(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    expectedValue: Int16,
    replacementValue: Int16,
  ): Int16;
  compareExchange(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    expectedValue: Uint16,
    replacementValue: Uint16,
  ): Uint16;
  compareExchange(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    expectedValue: Int32,
    replacementValue: Int32,
  ): Int32;
  compareExchange(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    expectedValue: Uint32,
    replacementValue: Uint32,
  ): Uint32;

  /** Replaces the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  exchange(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    value: Int8,
  ): Int8;
  exchange(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint8,
  ): Uint8;
  exchange(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    value: Int16,
  ): Int16;
  exchange(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint16,
  ): Uint16;
  exchange(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
  ): Int32;
  exchange(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint32,
  ): Uint32;

  /** Returns a value indicating whether high-performance algorithms can use atomic operations (`true`) or must use locks (`false`) for the given number of bytes-per-element of a typed array. */
  isLockFree(size: NumberType.TypedArraySizeArgPositive): boolean;

  /** Returns the value at the given position in the array. Until this atomic operation completes, any other read or write operation against the array will block. */
  load(typedArray: Int8Array, index: NumberType.TypedArraySizeArg): Int8;
  load(typedArray: Uint8Array, index: NumberType.TypedArraySizeArg): Uint8;
  load(typedArray: Int16Array, index: NumberType.TypedArraySizeArg): Int16;
  load(typedArray: Uint16Array, index: NumberType.TypedArraySizeArg): Uint16;
  load(typedArray: Int32Array, index: NumberType.TypedArraySizeArg): Int32;
  load(typedArray: Uint32Array, index: NumberType.TypedArraySizeArg): Uint32;

  /** Stores the bitwise OR of a value with the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  or(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    value: Int8,
  ): Int8;
  or(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint8,
  ): Uint8;
  or(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    value: Int16,
  ): Int16;
  or(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint16,
  ): Uint16;
  or(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
  ): Int32;
  or(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint32,
  ): Uint32;

  /** Stores a value at the given position in the array, returning the new value. Until this atomic operation completes, any other read or write operation against the array will block. */
  store(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    value: Int8,
  ): Int8;
  store(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint8,
  ): Uint8;
  store(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    value: Int16,
  ): Int16;
  store(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint16,
  ): Uint16;
  store(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
  ): Int32;
  store(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint32,
  ): Uint32;

  /** Subtracts a value from the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  sub(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    value: Int8,
  ): Int8;
  sub(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint8,
  ): Uint8;
  sub(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    value: Int16,
  ): Int16;
  sub(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint16,
  ): Uint16;
  sub(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
  ): Int32;
  sub(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint32,
  ): Uint32;

  /** If the value at the given position in the array is equal to the provided value, the current agent is put to sleep causing execution to suspend until the timeout expires (returning `"timed-out"`) or until the agent is awoken (returning `"ok"`); otherwise, returns `"not-equal"`. */
  wait(
    typedArray: Int32Array<ArrayBufferLike>,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
    timeout?: number,
  ): 'ok' | 'not-equal' | 'timed-out';

  /**
   * Wakes up sleeping agents that are waiting on the given index of the array, returning the number of agents that were awoken.
   *
   * @param typedArray A shared Int32Array<ArrayBufferLike>.
   * @param index The position in the typedArray to wake up on.
   * @param count The number of sleeping agents to notify. Defaults to +Infinity.
   */
  notify(
    typedArray: Int32Array<ArrayBufferLike>,
    index: NumberType.TypedArraySizeArg,
    count?: SafeUint,
  ): SafeUint;

  /** Stores the bitwise XOR of a value with the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  xor(
    typedArray: Int8Array,
    index: NumberType.TypedArraySizeArg,
    value: Int8,
  ): Int8;
  xor(
    typedArray: Uint8Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint8,
  ): Uint8;
  xor(
    typedArray: Int16Array,
    index: NumberType.TypedArraySizeArg,
    value: Int16,
  ): Int16;
  xor(
    typedArray: Uint16Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint16,
  ): Uint16;
  xor(
    typedArray: Int32Array,
    index: NumberType.TypedArraySizeArg,
    value: Int32,
  ): Int32;
  xor(
    typedArray: Uint32Array,
    index: NumberType.TypedArraySizeArg,
    value: Uint32,
  ): Uint32;

  readonly [Symbol.toStringTag]: 'Atomics';
}

declare const Atomics: Atomics;
