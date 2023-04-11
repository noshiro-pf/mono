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
/// <reference path="./lib.es5.d.ts" />

/// <reference path="./lib.es2015.iterable.d.ts" />

interface ObjectConstructor {
  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   *
   * @example
   * ```ts
   * const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] = [
   *   ['x', 1],
   *   ['y', 2],
   *   ['z', 3],
   *   [4, 3],
   * ] as const;
   *
   * const obj = Object.fromEntries(entries); // Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>
   * ```
   */
  fromEntries<K extends PropertyKey, V>(
    entries: Iterable<readonly [K, V]>
  ): Record<K, V>;

  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   */
  fromEntries(entries: Iterable<readonly unknown[]>): unknown;
}
