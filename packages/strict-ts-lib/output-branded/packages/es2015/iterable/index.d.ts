/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/// <reference lib="es2015.symbol" />

interface SymbolConstructor {
  /** A method that returns the default iterator for an object. Called by the semantics of the for-of statement. */
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

interface Iterator<T, TReturn = any, TNext = unknown> {
  // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
  next(...[value]: [] | [TNext]): IteratorResult<T, TReturn>;
  return?(value?: TReturn): IteratorResult<T, TReturn>;
  throw?(e?: unknown): IteratorResult<T, TReturn>;
}

interface Iterable<T, TReturn = any, TNext = unknown> {
  [Symbol.iterator](): Iterator<T, TReturn, TNext>;
}

/** Describes a user-defined {@link Iterator} that is also iterable. */
interface IterableIterator<T, TReturn = any, TNext = unknown>
  extends Iterator<T, TReturn, TNext> {
  [Symbol.iterator](): IterableIterator<T, TReturn, TNext>;
}

/** Describes an {@link Iterator} produced by the runtime that inherits from the intrinsic `Iterator.prototype`. */
interface IteratorObject<T, TReturn = any, TNext = unknown>
  extends Iterator<T, TReturn, TNext> {
  [Symbol.iterator](): IteratorObject<T, TReturn, TNext>;
}

/** Defines the `TReturn` type used for built-in iterators produced by `Array`, `Map`, `Set`, and others. This is `undefined` when `strictBuiltInIteratorReturn` is `true`; otherwise, this is `any`. */
type BuiltinIteratorReturn = intrinsic;

interface ArrayIterator<T>
  extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): ArrayIterator<T>;
}

interface Array<T> {
  /** Iterator */
  [Symbol.iterator](): ArrayIterator<T>;

  /** Returns an iterable of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.ArraySize, T]>;

  /** Returns an iterable of keys in the array */
  keys(): ArrayIterator<NumberType.ArraySize>;

  /** Returns an iterable of values in the array */
  values(): ArrayIterator<T>;
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
  [Symbol.iterator](): ArrayIterator<T>;

  /** Returns an iterable of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.ArraySize, T]>;

  /** Returns an iterable of keys in the array */
  keys(): ArrayIterator<NumberType.ArraySize>;

  /** Returns an iterable of values in the array */
  values(): ArrayIterator<T>;
}

interface IArguments {
  /** Iterator */
  [Symbol.iterator](): ArrayIterator<unknown>;
}

interface MapIterator<T>
  extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): MapIterator<T>;
}

interface Map<K, V> {
  /** Returns an iterable of entries in the map. */
  [Symbol.iterator](): MapIterator<readonly [K, V]>;

  /** Returns an iterable of key, value pairs for every entry in the map. */
  entries(): MapIterator<readonly [K, V]>;

  /** Returns an iterable of keys in the map */
  keys(): MapIterator<K>;

  /** Returns an iterable of values in the map */
  values(): MapIterator<V>;
}

interface ReadonlyMap<K, V> {
  /** Returns an iterable of entries in the map. */
  [Symbol.iterator](): MapIterator<readonly [K, V]>;

  /** Returns an iterable of key, value pairs for every entry in the map. */
  entries(): MapIterator<readonly [K, V]>;

  /** Returns an iterable of keys in the map */
  keys(): MapIterator<K>;

  /** Returns an iterable of values in the map */
  values(): MapIterator<V>;
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

interface SetIterator<T>
  extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): SetIterator<T>;
}

interface Set<T> {
  /** Iterates over values in the set. */
  [Symbol.iterator](): SetIterator<T>;
  /** Returns an iterable of [v,v] pairs for every value `v` in the set. */
  entries(): SetIterator<readonly [T, T]>;
  /** Despite its name, returns an iterable of the values in the set. */
  keys(): SetIterator<T>;

  /** Returns an iterable of values in the set. */
  values(): SetIterator<T>;
}

interface ReadonlySet<T> {
  /** Iterates over values in the set. */
  [Symbol.iterator](): SetIterator<T>;

  /** Returns an iterable of [v,v] pairs for every value `v` in the set. */
  entries(): SetIterator<readonly [T, T]>;

  /** Despite its name, returns an iterable of the values in the set. */
  keys(): SetIterator<T>;

  /** Returns an iterable of values in the set. */
  values(): SetIterator<T>;
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
   * Creates a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected.
   *
   * @param values An iterable of Promises.
   * @returns A new Promise.
   */
  all<T>(values: Iterable<T | PromiseLike<T>>): Promise<readonly Awaited<T>[]>;

  /**
   * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved or rejected.
   *
   * @param values An iterable of Promises.
   * @returns A new Promise.
   */
  race<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
}

interface StringIterator<T>
  extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): StringIterator<T>;
}

interface String {
  /** Iterator */
  [Symbol.iterator](): StringIterator<string>;
}

interface Int8Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Int8>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Int8]>;
  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;
  /** Returns an list of values in the array */
  values(): ArrayIterator<Int8>;
}

interface Int8ArrayConstructor {
  new (elements: Iterable<number>): Int8Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Int8Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int8,
    thisArg?: unknown,
  ): Int8Array<ArrayBuffer>;
}

interface Uint8Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Uint8>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Uint8]>;
  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;
  /** Returns an list of values in the array */
  values(): ArrayIterator<Uint8>;
}

interface Uint8ArrayConstructor {
  new (elements: Iterable<number>): Uint8Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Uint8Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint8,
    thisArg?: unknown,
  ): Uint8Array<ArrayBuffer>;
}

interface Uint8ClampedArray<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Uint8>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Uint8]>;

  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): ArrayIterator<Uint8>;
}

interface Uint8ClampedArrayConstructor {
  new (elements: Iterable<number>): Uint8ClampedArray<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(
    arrayLike: Iterable<T>,
  ): Uint8ClampedArray<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint8,
    thisArg?: unknown,
  ): Uint8ClampedArray<ArrayBuffer>;
}

interface Int16Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Int16>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Int16]>;

  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;

  /** Returns an list of values in the array */
  values(): ArrayIterator<Int16>;
}

interface Int16ArrayConstructor {
  new (elements: Iterable<number>): Int16Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Int16Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int16,
    thisArg?: unknown,
  ): Int16Array<ArrayBuffer>;
}

interface Uint16Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Uint16>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Uint16]>;
  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;
  /** Returns an list of values in the array */
  values(): ArrayIterator<Uint16>;
}

interface Uint16ArrayConstructor {
  new (elements: Iterable<number>): Uint16Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Uint16Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint16,
    thisArg?: unknown,
  ): Uint16Array<ArrayBuffer>;
}

interface Int32Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Int32>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Int32]>;
  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;
  /** Returns an list of values in the array */
  values(): ArrayIterator<Int32>;
}

interface Int32ArrayConstructor {
  new (elements: Iterable<number>): Int32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Int32Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int32,
    thisArg?: unknown,
  ): Int32Array<ArrayBuffer>;
}

interface Uint32Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Uint32>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Uint32]>;
  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;
  /** Returns an list of values in the array */
  values(): ArrayIterator<Uint32>;
}

interface Uint32ArrayConstructor {
  new (elements: Iterable<number>): Uint32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Uint32Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint32,
    thisArg?: unknown,
  ): Uint32Array<ArrayBuffer>;
}

interface Float32Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Float32>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Float32]>;
  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;
  /** Returns an list of values in the array */
  values(): ArrayIterator<Float32>;
}

interface Float32ArrayConstructor {
  new (elements: Iterable<number>): Float32Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Float32Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Float32,
    thisArg?: unknown,
  ): Float32Array<ArrayBuffer>;
}

interface Float64Array<TArrayBuffer extends ArrayBufferLike> {
  [Symbol.iterator](): ArrayIterator<Float64>;
  /** Returns an array of key, value pairs for every entry in the array */
  entries(): ArrayIterator<readonly [NumberType.TypedArraySize, Float64]>;
  /** Returns an list of keys in the array */
  keys(): ArrayIterator<NumberType.TypedArraySize>;
  /** Returns an list of values in the array */
  values(): ArrayIterator<Float64>;
}

interface Float64ArrayConstructor {
  new (elements: Iterable<number>): Float64Array<ArrayBuffer>;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T extends number>(arrayLike: Iterable<T>): Float64Array<ArrayBuffer>;
  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from<T>(
    arrayLike: Iterable<T>,
    mapfn?: (v: T, k: NumberType.TypedArraySize) => Float64,
    thisArg?: unknown,
  ): Float64Array<ArrayBuffer>;
}
