/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference path="./lib.es2015.symbol.d.ts" />

interface SymbolConstructor {
  /**
   * A method that returns the default iterator for an object. Called by the
   * semantics of the for-of statement.
   */
  readonly iterator: unique symbol;
}

interface IteratorYieldResult<TYield> {
  readonly done?: false;
  readonly value: TYield;
}

interface IteratorReturnResult<TReturn> {
  readonly done: true;
  readonly value: TReturn;
}

type IteratorResult<T, TReturn = any> =
  | IteratorYieldResult<T>
  | IteratorReturnResult<TReturn>;

interface Iterator<T, TReturn = any, TNext = undefined> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(...args: readonly [] | readonly [TNext]): IteratorResult<T, TReturn>;
  return?(value?: TReturn): IteratorResult<T, TReturn>;
  throw?(e?: unknown): IteratorResult<T, TReturn>;
}

interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

interface IterableIterator<T> extends Iterator<T> {
  [Symbol.iterator](): IterableIterator<T>;
}

interface Array<T> {
  /** Iterator */
  [Symbol.iterator](): IterableIterator<T>;

  /** Returns an iterable of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.ArraySize, T]>;

  /** Returns an iterable of keys in the array */
  keys(): IterableIterator<NumberType.ArraySize>;

  /** Returns an iterable of values in the array */
  values(): IterableIterator<T>;
}

interface ArrayConstructor {
  /**
   * Creates an array from an iterable object.
   *
   * @param iterable An iterable object to convert to an array.
   */
  from<T>(iterable: Iterable<T> | ArrayLike<T>): readonly T[];

  /**
   * Creates an array from an iterable object.
   *
   * @param iterable An iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T, U>(
    iterable: Iterable<T> | ArrayLike<T>,
    mapfn: (v: T, k: NumberType.ArraySize) => U,
    thisArg?: unknown,
  ): readonly U[];
}

interface ReadonlyArray<T> {
  /** Iterator of values in the array. */
  [Symbol.iterator](): IterableIterator<T>;

  /** Returns an iterable of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.ArraySize, T]>;

  /** Returns an iterable of keys in the array */
  keys(): IterableIterator<NumberType.ArraySize>;

  /** Returns an iterable of values in the array */
  values(): IterableIterator<T>;
}

interface IArguments {
  /** Iterator */
  [Symbol.iterator](): IterableIterator<unknown>;
}

interface Map<K, V> {
  /** Returns an iterable of entries in the map. */
  [Symbol.iterator](): IterableIterator<readonly [K, V]>;

  /** Returns an iterable of key, value pairs for every entry in the map. */
  entries(): IterableIterator<readonly [K, V]>;

  /** Returns an iterable of keys in the map */
  keys(): IterableIterator<K>;

  /** Returns an iterable of values in the map */
  values(): IterableIterator<V>;
}

interface ReadonlyMap<K, V> {
  /** Returns an iterable of entries in the map. */
  [Symbol.iterator](): IterableIterator<readonly [K, V]>;

  /** Returns an iterable of key, value pairs for every entry in the map. */
  entries(): IterableIterator<readonly [K, V]>;

  /** Returns an iterable of keys in the map */
  keys(): IterableIterator<K>;

  /** Returns an iterable of values in the map */
  values(): IterableIterator<V>;
}

interface MapConstructor {
  new (): Map<never, never>;
  new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>;
}

interface WeakMap<K extends WeakKey, V> {}

interface WeakMapConstructor {
  new <K extends WeakKey, V>(
    iterable: Iterable<readonly [K, V]>,
  ): WeakMap<K, V>;
}

interface Set<T> {
  /** Iterates over values in the set. */
  [Symbol.iterator](): IterableIterator<T>;

  /** Returns an iterable of [v,v] pairs for every value `v` in the set. */
  entries(): IterableIterator<readonly [T, T]>;

  /** Despite its name, returns an iterable of the values in the set. */
  keys(): IterableIterator<T>;

  /** Returns an iterable of values in the set. */
  values(): IterableIterator<T>;
}

interface ReadonlySet<T> {
  /** Iterates over values in the set. */
  [Symbol.iterator](): IterableIterator<T>;

  /** Returns an iterable of [v,v] pairs for every value `v` in the set. */
  entries(): IterableIterator<readonly [T, T]>;

  /** Despite its name, returns an iterable of the values in the set. */
  keys(): IterableIterator<T>;

  /** Returns an iterable of values in the set. */
  values(): IterableIterator<T>;
}

interface SetConstructor {
  new (): Set<never>;
  new <T>(iterable?: Iterable<T> | null): Set<T>;
}

interface WeakSet<T extends WeakKey> {}

interface WeakSetConstructor {
  new <T extends WeakKey = WeakKey>(iterable: Iterable<T>): WeakSet<T>;
}

interface Promise<T> {}

interface PromiseConstructor {
  /**
   * Creates a Promise that is resolved with an array of results when all of the
   * provided Promises resolve, or rejected when any Promise is rejected.
   *
   * @param values An iterable of Promises.
   * @returns A new Promise.
   */
  all<T>(values: Iterable<T | PromiseLike<T>>): Promise<readonly Awaited<T>[]>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided
   * Promises are resolved or rejected.
   *
   * @param values An iterable of Promises.
   * @returns A new Promise.
   */
  race<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
}

interface String {
  /** Iterator */
  [Symbol.iterator](): IterableIterator<string>;
}

interface Int8Array {
  [Symbol.iterator](): IterableIterator<Int8>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Int8]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Int8>;
}

interface Int8ArrayConstructor {
  new (elements: Iterable<number>): Int8Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int8,
    thisArg?: unknown,
  ): Int8Array;
}

interface Uint8Array {
  [Symbol.iterator](): IterableIterator<Uint8>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint8]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Uint8>;
}

interface Uint8ArrayConstructor {
  new (elements: Iterable<number>): Uint8Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint8,
    thisArg?: unknown,
  ): Uint8Array;
}

interface Uint8ClampedArray {
  [Symbol.iterator](): IterableIterator<Uint8>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint8]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Uint8>;
}

interface Uint8ClampedArrayConstructor {
  new (elements: Iterable<number>): Uint8ClampedArray;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint8,
    thisArg?: unknown,
  ): Uint8ClampedArray;
}

interface Int16Array {
  [Symbol.iterator](): IterableIterator<Int16>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Int16]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Int16>;
}

interface Int16ArrayConstructor {
  new (elements: Iterable<number>): Int16Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int16,
    thisArg?: unknown,
  ): Int16Array;
}

interface Uint16Array {
  [Symbol.iterator](): IterableIterator<Uint16>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint16]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Uint16>;
}

interface Uint16ArrayConstructor {
  new (elements: Iterable<number>): Uint16Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint16,
    thisArg?: unknown,
  ): Uint16Array;
}

interface Int32Array {
  [Symbol.iterator](): IterableIterator<Int32>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Int32]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Int32>;
}

interface Int32ArrayConstructor {
  new (elements: Iterable<number>): Int32Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int32,
    thisArg?: unknown,
  ): Int32Array;
}

interface Uint32Array {
  [Symbol.iterator](): IterableIterator<Uint32>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint32]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Uint32>;
}

interface Uint32ArrayConstructor {
  new (elements: Iterable<number>): Uint32Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint32,
    thisArg?: unknown,
  ): Uint32Array;
}

interface Float32Array {
  [Symbol.iterator](): IterableIterator<Float32>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Float32]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Float32>;
}

interface Float32ArrayConstructor {
  new (elements: Iterable<number>): Float32Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Float32,
    thisArg?: unknown,
  ): Float32Array;
}

interface Float64Array {
  [Symbol.iterator](): IterableIterator<Float64>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Float64]>;

  /** Returns an list of keys in the array */
  keys(): IterableIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): IterableIterator<Float64>;
}

interface Float64ArrayConstructor {
  new (elements: Iterable<number>): Float64Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Float64,
    thisArg?: unknown,
  ): Float64Array;
}