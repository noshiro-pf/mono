```diff
@@ -14,8 +14,9 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2015.symbol" />
+/// <reference path="./lib.es2015.symbol.d.ts" />
 
 interface SymbolConstructor {
   /**
@@ -26,13 +27,13 @@ interface SymbolConstructor {
 }
 
 interface IteratorYieldResult<TYield> {
-  done?: false;
-  value: TYield;
+  readonly done?: false;
+  readonly value: TYield;
 }
 
 interface IteratorReturnResult<TReturn> {
-  done: true;
-  value: TReturn;
+  readonly done: true;
+  readonly value: TReturn;
 }
 
 type IteratorResult<T, TReturn = any> =
@@ -41,9 +42,9 @@ type IteratorResult<T, TReturn = any> =
 
 interface Iterator<T, TReturn = any, TNext = undefined> {
   // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
-  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
+  next(...args: readonly [] | readonly [TNext]): IteratorResult<T, TReturn>;
   return?(value?: TReturn): IteratorResult<T, TReturn>;
-  throw?(e?: any): IteratorResult<T, TReturn>;
+  throw?(e?: unknown): IteratorResult<T, TReturn>;
 }
 
 interface Iterable<T> {
@@ -59,10 +60,10 @@ interface Array<T> {
   [Symbol.iterator](): IterableIterator<T>;
 
   /** Returns an iterable of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, T]>;
+  entries(): IterableIterator<readonly [NumberType.ArraySize, T]>;
 
   /** Returns an iterable of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.ArraySize>;
 
   /** Returns an iterable of values in the array */
   values(): IterableIterator<T>;
@@ -74,7 +75,7 @@ interface ArrayConstructor {
    *
    * @param iterable An iterable object to convert to an array.
    */
-  from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];
+  from<T>(iterable: Iterable<T> | ArrayLike<T>): readonly T[];
 
   /**
    * Creates an array from an iterable object.
@@ -85,9 +86,9 @@ interface ArrayConstructor {
    */
   from<T, U>(
     iterable: Iterable<T> | ArrayLike<T>,
-    mapfn: (v: T, k: number) => U,
-    thisArg?: any,
-  ): U[];
+    mapfn: (v: T, k: NumberType.ArraySize) => U,
+    thisArg?: unknown,
+  ): readonly U[];
 }
 
 interface ReadonlyArray<T> {
@@ -95,10 +96,10 @@ interface ReadonlyArray<T> {
   [Symbol.iterator](): IterableIterator<T>;
 
   /** Returns an iterable of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, T]>;
+  entries(): IterableIterator<readonly [NumberType.ArraySize, T]>;
 
   /** Returns an iterable of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.ArraySize>;
 
   /** Returns an iterable of values in the array */
   values(): IterableIterator<T>;
@@ -106,15 +107,15 @@ interface ReadonlyArray<T> {
 
 interface IArguments {
   /** Iterator */
-  [Symbol.iterator](): IterableIterator<any>;
+  [Symbol.iterator](): IterableIterator<unknown>;
 }
 
 interface Map<K, V> {
   /** Returns an iterable of entries in the map. */
-  [Symbol.iterator](): IterableIterator<[K, V]>;
+  [Symbol.iterator](): IterableIterator<readonly [K, V]>;
 
   /** Returns an iterable of key, value pairs for every entry in the map. */
-  entries(): IterableIterator<[K, V]>;
+  entries(): IterableIterator<readonly [K, V]>;
 
   /** Returns an iterable of keys in the map */
   keys(): IterableIterator<K>;
@@ -125,10 +126,10 @@ interface Map<K, V> {
 
 interface ReadonlyMap<K, V> {
   /** Returns an iterable of entries in the map. */
-  [Symbol.iterator](): IterableIterator<[K, V]>;
+  [Symbol.iterator](): IterableIterator<readonly [K, V]>;
 
   /** Returns an iterable of key, value pairs for every entry in the map. */
-  entries(): IterableIterator<[K, V]>;
+  entries(): IterableIterator<readonly [K, V]>;
 
   /** Returns an iterable of keys in the map */
   keys(): IterableIterator<K>;
@@ -138,7 +139,7 @@ interface ReadonlyMap<K, V> {
 }
 
 interface MapConstructor {
-  new (): Map<any, any>;
+  new (): Map<never, never>;
   new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>;
 }
 
@@ -153,8 +154,10 @@ interface WeakMapConstructor {
 interface Set<T> {
   /** Iterates over values in the set. */
   [Symbol.iterator](): IterableIterator<T>;
+
   /** Returns an iterable of [v,v] pairs for every value `v` in the set. */
-  entries(): IterableIterator<[T, T]>;
+  entries(): IterableIterator<readonly [T, T]>;
+
   /** Despite its name, returns an iterable of the values in the set. */
   keys(): IterableIterator<T>;
 
@@ -167,7 +170,7 @@ interface ReadonlySet<T> {
   [Symbol.iterator](): IterableIterator<T>;
 
   /** Returns an iterable of [v,v] pairs for every value `v` in the set. */
-  entries(): IterableIterator<[T, T]>;
+  entries(): IterableIterator<readonly [T, T]>;
 
   /** Despite its name, returns an iterable of the values in the set. */
   keys(): IterableIterator<T>;
@@ -177,6 +180,7 @@ interface ReadonlySet<T> {
 }
 
 interface SetConstructor {
+  new (): Set<never>;
   new <T>(iterable?: Iterable<T> | null): Set<T>;
 }
 
@@ -196,7 +200,7 @@ interface PromiseConstructor {
    * @param values An iterable of Promises.
    * @returns A new Promise.
    */
-  all<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;
+  all<T>(values: Iterable<T | PromiseLike<T>>): Promise<readonly Awaited<T>[]>;
 
   /**
    * Creates a Promise that is resolved or rejected when any of the provided
@@ -214,13 +218,15 @@ interface String {
 }
 
 interface Int8Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Int8>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Int8]>;
+
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
+
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Int8>;
 }
 
 interface Int8ArrayConstructor {
@@ -233,21 +239,23 @@ interface Int8ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int8,
+    thisArg?: unknown,
   ): Int8Array;
 }
 
 interface Uint8Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Uint8>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint8]>;
+
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
+
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Uint8>;
 }
 
 interface Uint8ArrayConstructor {
@@ -260,23 +268,23 @@ interface Uint8ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint8,
+    thisArg?: unknown,
   ): Uint8Array;
 }
 
 interface Uint8ClampedArray {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Uint8>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint8]>;
 
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
 
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Uint8>;
 }
 
 interface Uint8ClampedArrayConstructor {
@@ -289,23 +297,23 @@ interface Uint8ClampedArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint8,
+    thisArg?: unknown,
   ): Uint8ClampedArray;
 }
 
 interface Int16Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Int16>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Int16]>;
 
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
 
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Int16>;
 }
 
 interface Int16ArrayConstructor {
@@ -318,21 +326,23 @@ interface Int16ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int16,
+    thisArg?: unknown,
   ): Int16Array;
 }
 
 interface Uint16Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Uint16>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint16]>;
+
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
+
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Uint16>;
 }
 
 interface Uint16ArrayConstructor {
@@ -345,21 +355,23 @@ interface Uint16ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint16,
+    thisArg?: unknown,
   ): Uint16Array;
 }
 
 interface Int32Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Int32>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Int32]>;
+
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
+
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Int32>;
 }
 
 interface Int32ArrayConstructor {
@@ -372,21 +384,23 @@ interface Int32ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Int32,
+    thisArg?: unknown,
   ): Int32Array;
 }
 
 interface Uint32Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Uint32>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Uint32]>;
+
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
+
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Uint32>;
 }
 
 interface Uint32ArrayConstructor {
@@ -399,21 +413,23 @@ interface Uint32ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Uint32,
+    thisArg?: unknown,
   ): Uint32Array;
 }
 
 interface Float32Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Float32>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Float32]>;
+
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
+
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Float32>;
 }
 
 interface Float32ArrayConstructor {
@@ -426,21 +442,23 @@ interface Float32ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Float32,
+    thisArg?: unknown,
   ): Float32Array;
 }
 
 interface Float64Array {
-  [Symbol.iterator](): IterableIterator<number>;
+  [Symbol.iterator](): IterableIterator<Float64>;
   /** Returns an array of key, value pairs for every entry in the array */
-  entries(): IterableIterator<[number, number]>;
+  entries(): IterableIterator<readonly [NumberType.TypedArraySize, Float64]>;
+
   /** Returns an list of keys in the array */
-  keys(): IterableIterator<number>;
+  keys(): IterableIterator<NumberType.TypedArraySize>;
+
   /** Returns an list of values in the array */
-  values(): IterableIterator<number>;
+  values(): IterableIterator<Float64>;
 }
 
 interface Float64ArrayConstructor {
@@ -453,9 +471,9 @@ interface Float64ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(
-    arrayLike: Iterable<number>,
-    mapfn?: (v: number, k: number) => number,
-    thisArg?: any,
+  from<T extends number>(
+    arrayLike: Iterable<T>,
+    mapfn?: (v: T, k: NumberType.TypedArraySize) => Float64,
+    thisArg?: unknown,
   ): Float64Array;
 }
```
