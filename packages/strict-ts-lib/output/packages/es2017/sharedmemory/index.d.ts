/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference lib="es2015.symbol" />
/// <reference lib="es2015.symbol.wellknown" />

interface SharedArrayBuffer {
  /** Read-only. The length of the ArrayBuffer (in bytes). */
  readonly byteLength: number;

  /** Returns a section of an SharedArrayBuffer. */
  slice(begin?: number, end?: number): SharedArrayBuffer;
  readonly [Symbol.species]: SharedArrayBuffer;
  readonly [Symbol.toStringTag]: 'SharedArrayBuffer';
}

interface SharedArrayBufferConstructor {
  readonly prototype: SharedArrayBuffer;
  new (byteLength?: number): SharedArrayBuffer;
}
declare const SharedArrayBuffer: SharedArrayBufferConstructor;

interface ArrayBufferTypes {
  readonly SharedArrayBuffer: SharedArrayBuffer;
}

interface Atomics {
  /** Adds a value to the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  add(typedArray: Int8Array, index: number, value: Int8): Int8;
  add(typedArray: Uint8Array, index: number, value: Uint8): Uint8;
  add(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    value: number,
  ): number;

  /** Stores the bitwise AND of a value with the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  and(typedArray: Int8Array, index: number, value: Int8): Int8;
  and(typedArray: Uint8Array, index: number, value: Uint8): Uint8;
  and(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    value: number,
  ): number;

  /** Replaces the value at the given position in the array if the original value equals the given expected value, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  compareExchange(
    typedArray: Int8Array,
    index: number,
    expectedValue: Int8,
    replacementValue: Int8,
  ): Int8;
  compareExchange(
    typedArray: Uint8Array,
    index: number,
    expectedValue: Uint8,
    replacementValue: Uint8,
  ): Uint8;
  compareExchange(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    expectedValue: number,
    replacementValue: number,
  ): number;

  /** Replaces the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  exchange(typedArray: Int8Array, index: number, value: Int8): Int8;
  exchange(typedArray: Uint8Array, index: number, value: Uint8): Uint8;
  exchange(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    value: number,
  ): number;

  /** Returns a value indicating whether high-performance algorithms can use atomic operations (`true`) or must use locks (`false`) for the given number of bytes-per-element of a typed array. */
  isLockFree(size: number): boolean;

  /** Returns the value at the given position in the array. Until this atomic operation completes, any other read or write operation against the array will block. */
  load(typedArray: Int8Array, index: number): Int8;
  load(typedArray: Uint8Array, index: number): Uint8;
  load(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
  ): number;

  /** Stores the bitwise OR of a value with the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  or(typedArray: Int8Array, index: number, value: Int8): Int8;
  or(typedArray: Uint8Array, index: number, value: Uint8): Uint8;
  or(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    value: number,
  ): number;

  /** Stores a value at the given position in the array, returning the new value. Until this atomic operation completes, any other read or write operation against the array will block. */
  store(typedArray: Int8Array, index: number, value: Int8): Int8;
  store(typedArray: Uint8Array, index: number, value: Uint8): Uint8;
  store(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    value: number,
  ): number;

  /** Subtracts a value from the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  sub(typedArray: Int8Array, index: number, value: Int8): Int8;
  sub(typedArray: Uint8Array, index: number, value: Uint8): Uint8;
  sub(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    value: number,
  ): number;

  /** If the value at the given position in the array is equal to the provided value, the current agent is put to sleep causing execution to suspend until the timeout expires (returning `"timed-out"`) or until the agent is awoken (returning `"ok"`); otherwise, returns `"not-equal"`. */
  wait(
    typedArray: Int32Array<ArrayBufferLike>,
    index: number,
    value: number,
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
    index: number,
    count?: number,
  ): number;

  /** Stores the bitwise XOR of a value with the value at the given position in the array, returning the original value. Until this atomic operation completes, any other read or write operation against the array will block. */
  xor(typedArray: Int8Array, index: number, value: Int8): Int8;
  xor(typedArray: Uint8Array, index: number, value: Uint8): Uint8;
  xor(
    typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array,
    index: number,
    value: number,
  ): number;

  readonly [Symbol.toStringTag]: 'Atomics';
}

declare const Atomics: Atomics;
