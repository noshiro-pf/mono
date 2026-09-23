/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABILITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/*
 * Modified from TypeScript's `lib.esnext.collection.d.ts` by strict-ts-lib
 * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
 * stricter types. This is not the original file. See the NOTICE and LICENSE
 * files of the package this ships in.
 */

/// <reference path="./lib.es2025.collection.d.ts" />

interface Map<K, V> {
  /**
   * Returns a specified element from the Map object.
   * If no element is associated with the specified key, a new element with the value `defaultValue` will be inserted into the Map and returned.
   * @returns The element associated with the specified key, which will be `defaultValue` if no element previously existed.
   */
  getOrInsert(key: K, defaultValue: V): V;
  /**
   * Returns a specified element from the Map object.
   * If no element is associated with the specified key, the result of passing the specified key to the `callback` function will be inserted into the Map and returned.
   * @returns The element associated with the specific key, which will be the newly computed value if no element previously existed.
   */
  getOrInsertComputed(key: K, callback: (key: K) => V): V;
}

interface WeakMap<K extends WeakKey, V> {
  /**
   * Returns a specified element from the WeakMap object.
   * If no element is associated with the specified key, a new element with the value `defaultValue` will be inserted into the WeakMap and returned.
   * @returns The element associated with the specified key, which will be `defaultValue` if no element previously existed.
   */
  getOrInsert(key: K, defaultValue: V): V;
  /**
   * Returns a specified element from the WeakMap object.
   * If no element is associated with the specified key, the result of passing the specified key to the `callback` function will be inserted into the WeakMap and returned.
   * @returns The element associated with the specific key, which will be the newly computed value if no element previously existed.
   */
  getOrInsertComputed(key: K, callback: (key: K) => V): V;
}
