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
    predicate: (value: T, index: SafeUint, array: readonly T[]) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: T, index: SafeUint, array: readonly T[]) => unknown,
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
    predicate: (value: T, index: SafeUint, array: readonly T[]) => unknown,
    thisArg?: unknown,
  ): SafeUint | -1;
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
    predicate: (value: T, index: SafeUint, array: readonly T[]) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: T, index: SafeUint, array: readonly T[]) => unknown,
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
    predicate: (value: T, index: SafeUint, array: readonly T[]) => unknown,
    thisArg?: unknown,
  ): SafeUint | -1;
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
  findLast<S extends Int8>(
    predicate: (value: Int8, index: SafeUint, array: Int8Array) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: Int8, index: SafeUint, array: Int8Array) => unknown,
    thisArg?: unknown,
  ): Int8 | undefined;

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
    predicate: (value: Int8, index: SafeUint, array: Int8Array) => unknown,
    thisArg?: unknown,
  ): Int8;
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
  findLast<S extends Uint8>(
    predicate: (value: Uint8, index: SafeUint, array: Uint8Array) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: Uint8, index: SafeUint, array: Uint8Array) => unknown,
    thisArg?: unknown,
  ): Uint8 | undefined;

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
    predicate: (value: Uint8, index: SafeUint, array: Uint8Array) => unknown,
    thisArg?: unknown,
  ): Uint8;
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
  findLast<S extends Uint8>(
    predicate: (
      value: Uint8,
      index: SafeUint,
      array: Uint8ClampedArray,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Uint8,
      index: SafeUint,
      array: Uint8ClampedArray,
    ) => unknown,
    thisArg?: unknown,
  ): Uint8 | undefined;

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
      value: Uint8,
      index: SafeUint,
      array: Uint8ClampedArray,
    ) => unknown,
    thisArg?: unknown,
  ): Uint8;
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
  findLast<S extends Int16>(
    predicate: (value: Int16, index: SafeUint, array: Int16Array) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: Int16, index: SafeUint, array: Int16Array) => unknown,
    thisArg?: unknown,
  ): Int16 | undefined;

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
    predicate: (value: Int16, index: SafeUint, array: Int16Array) => unknown,
    thisArg?: unknown,
  ): Int16;
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
  findLast<S extends Uint16>(
    predicate: (
      value: Uint16,
      index: SafeUint,
      array: Uint16Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: Uint16, index: SafeUint, array: Uint16Array) => unknown,
    thisArg?: unknown,
  ): Uint16 | undefined;

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
    predicate: (value: Uint16, index: SafeUint, array: Uint16Array) => unknown,
    thisArg?: unknown,
  ): Uint16;
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
  findLast<S extends Int32>(
    predicate: (value: Int32, index: SafeUint, array: Int32Array) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: Int32, index: SafeUint, array: Int32Array) => unknown,
    thisArg?: unknown,
  ): Int32 | undefined;

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
    predicate: (value: Int32, index: SafeUint, array: Int32Array) => unknown,
    thisArg?: unknown,
  ): Int32;
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
  findLast<S extends Uint32>(
    predicate: (
      value: Uint32,
      index: SafeUint,
      array: Uint32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (value: Uint32, index: SafeUint, array: Uint32Array) => unknown,
    thisArg?: unknown,
  ): Uint32 | undefined;

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
    predicate: (value: Uint32, index: SafeUint, array: Uint32Array) => unknown,
    thisArg?: unknown,
  ): Uint32;
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
  findLast<S extends Float32>(
    predicate: (
      value: Float32,
      index: SafeUint,
      array: Float32Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Float32,
      index: SafeUint,
      array: Float32Array,
    ) => unknown,
    thisArg?: unknown,
  ): Float32 | undefined;

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
      value: Float32,
      index: SafeUint,
      array: Float32Array,
    ) => unknown,
    thisArg?: unknown,
  ): Float32;
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
  findLast<S extends Float64>(
    predicate: (
      value: Float64,
      index: SafeUint,
      array: Float64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: Float64,
      index: SafeUint,
      array: Float64Array,
    ) => unknown,
    thisArg?: unknown,
  ): Float64 | undefined;

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
      value: Float64,
      index: SafeUint,
      array: Float64Array,
    ) => unknown,
    thisArg?: unknown,
  ): Float64;
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
  findLast<S extends BigInt64>(
    predicate: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => unknown,
    thisArg?: unknown,
  ): BigInt64 | undefined;

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
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => unknown,
    thisArg?: unknown,
  ): SafeUint | -1;
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
  findLast<S extends BigUint64>(
    predicate: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => value is S,
    thisArg?: unknown,
  ): S | undefined;
  findLast(
    predicate: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => unknown,
    thisArg?: unknown,
  ): BigUint64 | undefined;

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
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => unknown,
    thisArg?: unknown,
  ): SafeUint | -1;
}
