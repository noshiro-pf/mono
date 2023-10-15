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
/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />

type MapToTypedArray<T> = T extends BigInt64
  ? BigInt64Array
  : T extends BigUint64
  ? BigUint64Array
  : never;

type TypedArrayElementTypes = BigInt64 | BigUint64;

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
   * Returns the value at the given position in the array. Until this atomic operation completes,
   * any other read or write operation against the array will block.
   */
  load(typedArray: MapToTypedArray<T>, index: SafeUint): T;

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
    typedArray: BigInt64Array,
    index: SafeUint,
    value: T,
    timeout?: number,
  ): 'ok' | 'not-equal' | 'timed-out';

  /**
   * Wakes up sleeping agents that are waiting on the given index of the array, returning the
   * number of agents that were awoken.
   * @param typedArray A shared BigInt64Array.
   * @param index The position in the typedArray to wake up on.
   * @param count The number of sleeping agents to notify. Defaults to +Infinity.
   */
  notify(typedArray: BigInt64Array, index: SafeUint, count?: number): number;

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
}
