/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface Map<K, V> {
  clear(): void;
  /**
   * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  delete(key: K): boolean;
  /**
   * Executes a provided function once per each key/value pair in the Map, in insertion order.
   */
  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    thisArg?: unknown,
  ): void;
  /**
   * Returns a specified element from the Map object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the Map.
   * @returns Returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: K): V | undefined;
  /**
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K | (WidenLiteral<K> & {})): key is K;
  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  set(key: K, value: V): this;
  /**
   * @returns the number of elements in the Map.
   */
  readonly size: NumberType.ArraySize;
}

interface MapConstructor {
  new (): Map<never, never>;
  new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
  readonly prototype: Map<never, never>;
}
declare const Map: MapConstructor;

interface ReadonlyMap<K, V> {
  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    thisArg?: unknown,
  ): void;
  get(key: K): V | undefined;
  has(key: K | (WidenLiteral<K> & {})): key is K;
  readonly size: NumberType.ArraySize;
}

interface WeakMap<K extends WeakKey, V> {
  /**
   * Removes the specified element from the WeakMap.
   * @returns true if the element was successfully removed, or false if it was not present.
   */
  delete(key: K): boolean;
  /**
   * @returns a specified element.
   */
  get(key: K): V | undefined;
  /**
   * @returns a boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K | (WidenLiteral<K> & {})): key is K;
  /**
   * Adds a new element with a specified key and value.
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
  /**
   * Appends a new element with a specified value to the end of the Set.
   */
  add(value: T): this;

  clear(): void;
  /**
   * Removes a specified value from the Set.
   * @returns Returns true if an element in the Set existed and has been removed, or false if the element does not exist.
   */
  delete(value: T): boolean;
  /**
   * Executes a provided function once per each value in the Set object, in insertion order.
   */
  forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: unknown,
  ): void;
  /**
   * @returns a boolean indicating whether an element with the specified value exists in the Set or not.
   */
  has(value: T | (WidenLiteral<T> & {})): value is T;
  /**
   * @returns the number of (unique) elements in Set.
   */
  readonly size: NumberType.ArraySize;
}

interface SetConstructor {
  new <T = never>(values?: readonly T[] | null): Set<T>;
  readonly prototype: Set<never>;
}
declare const Set: SetConstructor;

interface ReadonlySet<T> {
  forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: unknown,
  ): void;
  has(value: T | (WidenLiteral<T> & {})): value is T;
  readonly size: NumberType.ArraySize;
}

interface WeakSet<T extends WeakKey> {
  /**
   * Appends a new value to the end of the WeakSet.
   */
  add(value: T): this;
  /**
   * Removes the specified element from the WeakSet.
   * @returns Returns true if the element existed and has been removed, or false if the element does not exist.
   */
  delete(value: T): boolean;
  /**
   * @returns a boolean indicating whether a value exists in the WeakSet or not.
   */
  has(value: T | (WidenLiteral<T> & {})): value is T;
}

interface WeakSetConstructor {
  new <T extends WeakKey = WeakKey>(values?: readonly T[] | null): WeakSet<T>;
  readonly prototype: WeakSet<WeakKey>;
}
declare const WeakSet: WeakSetConstructor;
