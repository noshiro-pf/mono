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

interface Map<K, V> {
  clear(): void;
  /**
   * @returns True if an element in the Map existed and has been removed, or
   *   false if the element does not exist.
   */
  delete(key: K): boolean;
  /**
   * Executes a provided function once per each key/value pair in the Map, in
   * insertion order.
   */
  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    thisArg?: unknown,
  ): void;
  /**
   * Returns a specified element from the Map object. If the value that is
   * associated to the provided key is an object, then you will get a reference
   * to that object and any change made to that object will effectively modify
   * it inside the Map.
   *
   * @returns Returns the element associated with the specified key. If no
   *   element is associated with the specified key, undefined is returned.
   */
  get(key: K): V | undefined;
  /**
   * @returns Boolean indicating whether an element with the specified key
   *   exists or not.
   */
  has(key: K | (WidenLiteral<K> & {})): key is K;
  /**
   * Adds a new element with a specified key and value to the Map. If an element
   * with the same key already exists, the element will be updated.
   */
  set(key: K, value: V): this;
  /** @returns The number of elements in the Map. */
  readonly size: SafeUint;
}

interface MapConstructor {
  new (): Map<unknown, unknown>;
  new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
  readonly prototype: Map<unknown, unknown>;
}
declare const Map: MapConstructor;

interface ReadonlyMap<K, V> {
  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    thisArg?: unknown,
  ): void;
  get(key: K): V | undefined;
  has(key: K | (WidenLiteral<K> & {})): key is K;
  readonly size: SafeUint;
}

interface WeakMap<K extends WeakKey, V> {
  /**
   * Removes the specified element from the WeakMap.
   *
   * @returns True if the element was successfully removed, or false if it was
   *   not present.
   */
  delete(key: K): boolean;
  /** @returns A specified element. */
  get(key: K): V | undefined;
  /**
   * @returns A boolean indicating whether an element with the specified key
   *   exists or not.
   */
  has(key: K | (WidenLiteral<K> & {})): key is K;
  /**
   * Adds a new element with a specified key and value.
   *
   * @param key Must be an object or symbol.
   */
  set(key: K, value: V): this;
}

interface WeakMapConstructor {
  new <K extends WeakKey = WeakKey, V = unknown>(
    entries?: readonly (readonly [K, V])[] | null,
  ): WeakMap<K, V>;
  readonly prototype: WeakMap<WeakKey, unknown>;
}
declare const WeakMap: WeakMapConstructor;

interface Set<T> {
  /** Appends a new element with a specified value to the end of the Set. */
  add(value: T): this;

  clear(): void;
  /**
   * Removes a specified value from the Set.
   *
   * @returns Returns true if an element in the Set existed and has been
   *   removed, or false if the element does not exist.
   */
  delete(value: T): boolean;
  /**
   * Executes a provided function once per each value in the Set object, in
   * insertion order.
   */
  forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: unknown,
  ): void;
  /**
   * @returns A boolean indicating whether an element with the specified value
   *   exists in the Set or not.
   */
  has(value: T | (WidenLiteral<T> & {})): value is T;
  /** @returns The number of (unique) elements in Set. */
  readonly size: SafeUint;
}

interface SetConstructor {
  new <T = unknown>(values?: readonly T[] | null): Set<T>;
  readonly prototype: Set<unknown>;
}
declare const Set: SetConstructor;

interface ReadonlySet<T> {
  forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: unknown,
  ): void;
  has(value: T | (WidenLiteral<T> & {})): value is T;
  readonly size: SafeUint;
}

interface WeakSet<T extends WeakKey> {
  /** Appends a new value to the end of the WeakSet. */
  add(value: T): this;
  /**
   * Removes the specified element from the WeakSet.
   *
   * @returns Returns true if the element existed and has been removed, or false
   *   if the element does not exist.
   */
  delete(value: T): boolean;
  /** @returns A boolean indicating whether a value exists in the WeakSet or not. */
  has(value: T | (WidenLiteral<T> & {})): value is T;
}

interface WeakSetConstructor {
  new <T extends WeakKey = WeakKey>(values?: readonly T[] | null): WeakSet<T>;
  readonly prototype: WeakSet<WeakKey>;
}
declare const WeakSet: WeakSetConstructor;