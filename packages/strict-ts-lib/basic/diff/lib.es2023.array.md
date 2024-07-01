```diff
@@ -14,6 +14,7 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
 interface Array<T> {
   /**
@@ -29,12 +30,12 @@ interface Array<T> {
    *   instead.
    */
   findLast<S extends T>(
-    predicate: (value: T, index: number, array: T[]) => value is S,
-    thisArg?: any,
+    predicate: (value: T, index: number, array: readonly T[]) => value is S,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
-    predicate: (value: T, index: number, array: T[]) => unknown,
-    thisArg?: any,
+    predicate: (value: T, index: number, array: readonly T[]) => unknown,
+    thisArg?: unknown,
   ): T | undefined;
 
   /**
@@ -50,8 +51,8 @@ interface Array<T> {
    *   instead.
    */
   findLastIndex(
-    predicate: (value: T, index: number, array: T[]) => unknown,
-    thisArg?: any,
+    predicate: (value: T, index: number, array: readonly T[]) => unknown,
+    thisArg?: unknown,
   ): number;
 
   /** Returns a copy of an array with its elements reversed. */
@@ -73,17 +74,17 @@ interface Array<T> {
   toSorted(compareFn?: (a: T, b: T) => number): T[];
 
   /**
-   * Copies an array and removes elements and, if necessary, inserts new
-   * elements in their place. Returns the copied array.
+   * Copies an array and removes elements while, if necessary, inserting new
+   * elements in their place, returning the remaining elements.
    *
    * @param start The zero-based location in the array from which to start
    *   removing elements.
    * @param deleteCount The number of elements to remove.
    * @param items Elements to insert into the copied array in place of the
    *   deleted elements.
-   * @returns The copied array.
+   * @returns A copy of the original array with the remaining elements.
    */
-  toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
+  toSpliced(start: number, deleteCount: number, ...items: readonly T[]): T[];
 
   /**
    * Copies an array and removes elements while returning the remaining
@@ -124,11 +125,11 @@ interface ReadonlyArray<T> {
    */
   findLast<S extends T>(
     predicate: (value: T, index: number, array: readonly T[]) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (value: T, index: number, array: readonly T[]) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): T | undefined;
 
   /**
@@ -145,17 +146,14 @@ interface ReadonlyArray<T> {
    */
   findLastIndex(
     predicate: (value: T, index: number, array: readonly T[]) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /**
-   * Copies the array and returns the copied array with all of its elements
-   * reversed.
-   */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): T[];
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -180,7 +178,7 @@ interface ReadonlyArray<T> {
    *   deleted elements.
    * @returns A copy of the original array with the remaining elements.
    */
-  toSpliced(start: number, deleteCount: number, ...items: T[]): T[];
+  toSpliced(start: number, deleteCount: number, ...items: readonly T[]): T[];
 
   /**
    * Copies an array and removes elements while returning the remaining
@@ -200,8 +198,8 @@ interface ReadonlyArray<T> {
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
   with(index: number, value: T): T[];
 }
@@ -219,14 +217,14 @@ interface Int8Array {
    *   invocation of predicate. If it is not provided, undefined is used
    *   instead.
    */
-  findLast<S extends number>(
-    predicate: (value: number, index: number, array: Int8Array) => value is S,
-    thisArg?: any,
+  findLast<S extends Int8>(
+    predicate: (value: Int8, index: number, array: Int8Array) => value is S,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
-    predicate: (value: number, index: number, array: Int8Array) => unknown,
-    thisArg?: any,
-  ): number | undefined;
+    predicate: (value: Int8, index: number, array: Int8Array) => unknown,
+    thisArg?: unknown,
+  ): Int8 | undefined;
 
   /**
    * Returns the index of the last element in the array where predicate is true,
@@ -241,15 +239,15 @@ interface Int8Array {
    *   instead.
    */
   findLastIndex(
-    predicate: (value: number, index: number, array: Int8Array) => unknown,
-    thisArg?: any,
+    predicate: (value: Int8, index: number, array: Int8Array) => unknown,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Uint8Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -261,17 +259,19 @@ interface Int8Array {
    *   myNums.toSorted((a, b) => a - b); // Uint8Array(4) [1, 2, 11, 22]
    *   ```
    */
-  toSorted(compareFn?: (a: number, b: number) => number): Uint8Array;
+  toSorted(compareFn?: (a: Int8, b: Int8) => number): Uint8Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
-  with(index: number, value: number): Uint8Array;
+  with(index: number, value: Int8): Uint8Array;
 }
 
 interface Uint8Array {
@@ -287,14 +287,14 @@ interface Uint8Array {
    *   invocation of predicate. If it is not provided, undefined is used
    *   instead.
    */
-  findLast<S extends number>(
-    predicate: (value: number, index: number, array: Uint8Array) => value is S,
-    thisArg?: any,
+  findLast<S extends Uint8>(
+    predicate: (value: Uint8, index: number, array: Uint8Array) => value is S,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
-    predicate: (value: number, index: number, array: Uint8Array) => unknown,
-    thisArg?: any,
-  ): number | undefined;
+    predicate: (value: Uint8, index: number, array: Uint8Array) => unknown,
+    thisArg?: unknown,
+  ): Uint8 | undefined;
 
   /**
    * Returns the index of the last element in the array where predicate is true,
@@ -309,15 +309,15 @@ interface Uint8Array {
    *   instead.
    */
   findLastIndex(
-    predicate: (value: number, index: number, array: Uint8Array) => unknown,
-    thisArg?: any,
+    predicate: (value: Uint8, index: number, array: Uint8Array) => unknown,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Uint8Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -329,17 +329,19 @@ interface Uint8Array {
    *   myNums.toSorted((a, b) => a - b); // Uint8Array(4) [1, 2, 11, 22]
    *   ```
    */
-  toSorted(compareFn?: (a: number, b: number) => number): Uint8Array;
+  toSorted(compareFn?: (a: Uint8, b: Uint8) => number): Uint8Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
-  with(index: number, value: number): Uint8Array;
+  with(index: number, value: Uint8): Uint8Array;
 }
 
 interface Uint8ClampedArray {
@@ -355,22 +357,22 @@ interface Uint8ClampedArray {
    *   invocation of predicate. If it is not provided, undefined is used
    *   instead.
    */
-  findLast<S extends number>(
+  findLast<S extends Uint8>(
     predicate: (
-      value: number,
+      value: Uint8,
       index: number,
       array: Uint8ClampedArray,
     ) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (
-      value: number,
+      value: Uint8,
       index: number,
       array: Uint8ClampedArray,
     ) => unknown,
-    thisArg?: any,
-  ): number | undefined;
+    thisArg?: unknown,
+  ): Uint8 | undefined;
 
   /**
    * Returns the index of the last element in the array where predicate is true,
@@ -386,18 +388,18 @@ interface Uint8ClampedArray {
    */
   findLastIndex(
     predicate: (
-      value: number,
+      value: Uint8,
       index: number,
       array: Uint8ClampedArray,
     ) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Uint8ClampedArray;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -409,17 +411,19 @@ interface Uint8ClampedArray {
    *   myNums.toSorted((a, b) => a - b); // Uint8ClampedArray(4) [1, 2, 11, 22]
    *   ```
    */
-  toSorted(compareFn?: (a: number, b: number) => number): Uint8ClampedArray;
+  toSorted(compareFn?: (a: Uint8, b: Uint8) => number): Uint8ClampedArray;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
-  with(index: number, value: number): Uint8ClampedArray;
+  with(index: number, value: Uint8): Uint8ClampedArray;
 }
 
 interface Int16Array {
@@ -437,11 +441,11 @@ interface Int16Array {
    */
   findLast<S extends number>(
     predicate: (value: number, index: number, array: Int16Array) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (value: number, index: number, array: Int16Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number | undefined;
 
   /**
@@ -458,14 +462,14 @@ interface Int16Array {
    */
   findLastIndex(
     predicate: (value: number, index: number, array: Int16Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Int16Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -480,12 +484,14 @@ interface Int16Array {
   toSorted(compareFn?: (a: number, b: number) => number): Int16Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
   with(index: number, value: number): Int16Array;
 }
@@ -505,11 +511,11 @@ interface Uint16Array {
    */
   findLast<S extends number>(
     predicate: (value: number, index: number, array: Uint16Array) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (value: number, index: number, array: Uint16Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number | undefined;
 
   /**
@@ -526,14 +532,14 @@ interface Uint16Array {
    */
   findLastIndex(
     predicate: (value: number, index: number, array: Uint16Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Uint16Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -548,12 +554,14 @@ interface Uint16Array {
   toSorted(compareFn?: (a: number, b: number) => number): Uint16Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
   with(index: number, value: number): Uint16Array;
 }
@@ -573,11 +581,11 @@ interface Int32Array {
    */
   findLast<S extends number>(
     predicate: (value: number, index: number, array: Int32Array) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (value: number, index: number, array: Int32Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number | undefined;
 
   /**
@@ -594,14 +602,14 @@ interface Int32Array {
    */
   findLastIndex(
     predicate: (value: number, index: number, array: Int32Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Int32Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -616,12 +624,14 @@ interface Int32Array {
   toSorted(compareFn?: (a: number, b: number) => number): Int32Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
   with(index: number, value: number): Int32Array;
 }
@@ -641,11 +651,11 @@ interface Uint32Array {
    */
   findLast<S extends number>(
     predicate: (value: number, index: number, array: Uint32Array) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (value: number, index: number, array: Uint32Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number | undefined;
 
   /**
@@ -662,14 +672,14 @@ interface Uint32Array {
    */
   findLastIndex(
     predicate: (value: number, index: number, array: Uint32Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Uint32Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -684,12 +694,14 @@ interface Uint32Array {
   toSorted(compareFn?: (a: number, b: number) => number): Uint32Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
   with(index: number, value: number): Uint32Array;
 }
@@ -713,11 +725,11 @@ interface Float32Array {
       index: number,
       array: Float32Array,
     ) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (value: number, index: number, array: Float32Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number | undefined;
 
   /**
@@ -734,14 +746,14 @@ interface Float32Array {
    */
   findLastIndex(
     predicate: (value: number, index: number, array: Float32Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Float32Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -756,12 +768,14 @@ interface Float32Array {
   toSorted(compareFn?: (a: number, b: number) => number): Float32Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
   with(index: number, value: number): Float32Array;
 }
@@ -785,11 +799,11 @@ interface Float64Array {
       index: number,
       array: Float64Array,
     ) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
     predicate: (value: number, index: number, array: Float64Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number | undefined;
 
   /**
@@ -806,14 +820,14 @@ interface Float64Array {
    */
   findLastIndex(
     predicate: (value: number, index: number, array: Float64Array) => unknown,
-    thisArg?: any,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): Float64Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -828,12 +842,14 @@ interface Float64Array {
   toSorted(compareFn?: (a: number, b: number) => number): Float64Array;
 
   /**
-   * Copies the array and inserts the given number at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
   with(index: number, value: number): Float64Array;
 }
@@ -851,18 +867,22 @@ interface BigInt64Array {
    *   invocation of predicate. If it is not provided, undefined is used
    *   instead.
    */
-  findLast<S extends bigint>(
+  findLast<S extends BigInt64>(
     predicate: (
-      value: bigint,
+      value: BigInt64,
       index: number,
       array: BigInt64Array,
     ) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
-    predicate: (value: bigint, index: number, array: BigInt64Array) => unknown,
-    thisArg?: any,
-  ): bigint | undefined;
+    predicate: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => unknown,
+    thisArg?: unknown,
+  ): BigInt64 | undefined;
 
   /**
    * Returns the index of the last element in the array where predicate is true,
@@ -877,15 +897,19 @@ interface BigInt64Array {
    *   instead.
    */
   findLastIndex(
-    predicate: (value: bigint, index: number, array: BigInt64Array) => unknown,
-    thisArg?: any,
+    predicate: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => unknown,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): BigInt64Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -897,17 +921,19 @@ interface BigInt64Array {
    *   myNums.toSorted((a, b) => Number(a - b)); // BigInt64Array(4) [-22n, 1n, 2n, 11n]
    *   ```
    */
-  toSorted(compareFn?: (a: bigint, b: bigint) => number): BigInt64Array;
+  toSorted(compareFn?: (a: BigInt64, b: BigInt64) => number): BigInt64Array;
 
   /**
-   * Copies the array and inserts the given bigint at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
-  with(index: number, value: bigint): BigInt64Array;
+  with(index: number, value: BigInt64): BigInt64Array;
 }
 
 interface BigUint64Array {
@@ -923,18 +949,22 @@ interface BigUint64Array {
    *   invocation of predicate. If it is not provided, undefined is used
    *   instead.
    */
-  findLast<S extends bigint>(
+  findLast<S extends BigUint64>(
     predicate: (
-      value: bigint,
+      value: BigUint64,
       index: number,
       array: BigUint64Array,
     ) => value is S,
-    thisArg?: any,
+    thisArg?: unknown,
   ): S | undefined;
   findLast(
-    predicate: (value: bigint, index: number, array: BigUint64Array) => unknown,
-    thisArg?: any,
-  ): bigint | undefined;
+    predicate: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => unknown,
+    thisArg?: unknown,
+  ): BigUint64 | undefined;
 
   /**
    * Returns the index of the last element in the array where predicate is true,
@@ -949,15 +979,19 @@ interface BigUint64Array {
    *   instead.
    */
   findLastIndex(
-    predicate: (value: bigint, index: number, array: BigUint64Array) => unknown,
-    thisArg?: any,
+    predicate: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => unknown,
+    thisArg?: unknown,
   ): number;
 
-  /** Copies the array and returns the copy with the elements in reverse order. */
+  /** Returns a copy of an array with its elements reversed. */
   toReversed(): BigUint64Array;
 
   /**
-   * Copies and sorts the array.
+   * Returns a copy of an array with its elements sorted.
    *
    * @param compareFn Function used to determine the order of the elements. It
    *   is expected to return a negative value if the first argument is less than
@@ -969,15 +1003,17 @@ interface BigUint64Array {
    *   myNums.toSorted((a, b) => Number(a - b)); // BigUint64Array(4) [1n, 2n, 11n, 22n]
    *   ```
    */
-  toSorted(compareFn?: (a: bigint, b: bigint) => number): BigUint64Array;
+  toSorted(compareFn?: (a: BigUint64, b: BigUint64) => number): BigUint64Array;
 
   /**
-   * Copies the array and inserts the given bigint at the provided index.
+   * Copies an array, then overwrites the value at the provided index with the
+   * given value. If the index is negative, then it replaces from the end of the
+   * array.
    *
    * @param index The index of the value to overwrite. If the index is negative,
    *   then it replaces from the end of the array.
-   * @param value The value to insert into the copied array.
-   * @returns A copy of the original array with the inserted value.
+   * @param value The value to write into the copied array.
+   * @returns The copied array with the updated value.
    */
-  with(index: number, value: bigint): BigUint64Array;
+  with(index: number, value: BigUint64): BigUint64Array;
 }
```
