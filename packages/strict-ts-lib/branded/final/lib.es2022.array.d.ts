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

interface Array<T> {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.ArraySizeArg): T | undefined;
}

interface ReadonlyArray<T> {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.ArraySizeArg): T | undefined;
}

interface Int8Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Int8 | undefined;
}

interface Uint8Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Uint8 | undefined;
}

interface Uint8ClampedArray {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Uint8 | undefined;
}

interface Int16Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Int16 | undefined;
}

interface Uint16Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Uint16 | undefined;
}

interface Int32Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Int32 | undefined;
}

interface Uint32Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Uint32 | undefined;
}

interface Float32Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Float32 | undefined;
}

interface Float64Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): Float64 | undefined;
}

interface BigInt64Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): BigInt64 | undefined;
}

interface BigUint64Array {
  /**
   * Returns the item located at the specified index.
   *
   * @param index The zero-based index of the desired code unit. A negative
   *   index will count back from the last item.
   */
  at(index: NumberType.TypedArraySizeArg): BigUint64 | undefined;
}
