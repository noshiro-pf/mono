/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils-no-stdlib" />

/// <reference lib="es2015.symbol" />
/// <reference lib="es2015.symbol.wellknown" />

interface SharedArrayBuffer {
  /**
   * Read-only. The length of the ArrayBuffer (in bytes).
   */
  readonly byteLength: SafeUint;

  /**
   * Returns a section of an SharedArrayBuffer.
   */
  slice(begin: SafeUint, end?: SafeUint): SharedArrayBuffer;
  readonly [Symbol.species]: SharedArrayBuffer;
  readonly [Symbol.toStringTag]: 'SharedArrayBuffer';
}

interface SharedArrayBufferConstructor {
  readonly prototype: SharedArrayBuffer;
  new (byteLength: SafeUint): SharedArrayBuffer;
}
declare const SharedArrayBuffer: SharedArrayBufferConstructor;

interface ArrayBufferTypes {
  readonly SharedArrayBuffer: SharedArrayBuffer;
}

type MapToTypedArray<T> = T extends Int8
  ? Int8Array
  : T extends Uint8
    ? Uint8Array
    : T extends Int16
      ? Int16Array
      : T extends Uint16
        ? Uint16Array
        : T extends Int32
          ? Int32Array
          : T extends Uint32
            ? Uint32Array
            : never;

type TypedArrayElementTypes = Int8 | Uint8 | Int16 | Uint16 | Int32 | Uint32;

interface Atomics {
  /**
   * Adds a value to the value at the given position in the array, returning the original value.
   * Until this atomic operation completes, any other read or write operation against the array
   * will block.
   */
  add<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    value: T,
  ): T;

  /**
   * Stores the bitwise AND of a value with the value at the given position in the array,
   * returning the original value. Until this atomic operation completes, any other read or
   * write operation against the array will block.
   */
  and<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    value: T,
  ): T;

  /**
   * Replaces the value at the given position in the array if the original value equals the given
   * expected value, returning the original value. Until this atomic operation completes, any
   * other read or write operation against the array will block.
   */
  compareExchange<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    expectedValue: T,
    replacementValue: T,
  ): T;

  /**
   * Replaces the value at the given position in the array, returning the original value. Until
   * this atomic operation completes, any other read or write operation against the array will
   * block.
   */
  exchange<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    value: T,
  ): T;

  /**
   * Returns a value indicating whether high-performance algorithms can use atomic operations
   * (`true`) or must use locks (`false`) for the given number of bytes-per-element of a typed
   * array.
   */
  isLockFree(size: SafeUint): boolean;

  /**
   * Returns the value at the given position in the array. Until this atomic operation completes,
   * any other read or write operation against the array will block.
   */
  load<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
  ): T;

  /**
   * Stores the bitwise OR of a value with the value at the given position in the array,
   * returning the original value. Until this atomic operation completes, any other read or write
   * operation against the array will block.
   */
  or<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    value: T,
  ): T;

  /**
   * Stores a value at the given position in the array, returning the new value. Until this
   * atomic operation completes, any other read or write operation against the array will block.
   */
  store<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    value: T,
  ): T;

  /**
   * Subtracts a value from the value at the given position in the array, returning the original
   * value. Until this atomic operation completes, any other read or write operation against the
   * array will block.
   */
  sub<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    value: T,
  ): T;

  /**
   * If the value at the given position in the array is equal to the provided value, the current
   * agent is put to sleep causing execution to suspend until the timeout expires (returning
   * `"timed-out"`) or until the agent is awoken (returning `"ok"`); otherwise, returns
   * `"not-equal"`.
   */
  wait<T extends TypedArrayElementTypes>(
    typedArray: Int32Array,
    index: SafeUint,
    value: T,
    timeout?: number,
  ): 'ok' | 'not-equal' | 'timed-out';

  /**
   * Wakes up sleeping agents that are waiting on the given index of the array, returning the
   * number of agents that were awoken.
   * @param typedArray A shared Int32Array.
   * @param index The position in the typedArray to wake up on.
   * @param count The number of sleeping agents to notify. Defaults to +Infinity.
   */
  notify(typedArray: Int32Array, index: SafeUint, count?: number): T;

  /**
   * Stores the bitwise XOR of a value with the value at the given position in the array,
   * returning the original value. Until this atomic operation completes, any other read or write
   * operation against the array will block.
   */
  xor<T extends TypedArrayElementTypes>(
    typedArray: MapToTypedArray<T>,
    index: SafeUint,
    value: T,
  ): T;

  readonly [Symbol.toStringTag]: 'Atomics';
}

declare const Atomics: Atomics;
