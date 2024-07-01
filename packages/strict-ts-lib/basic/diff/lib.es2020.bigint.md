```diff
@@ -14,8 +14,9 @@ and limitations under the License.
 ***************************************************************************** */
 
 /// <reference no-default-lib="true"/>
+/// <reference types="@noshiro/ts-type-utils-no-stdlib" />
 
-/// <reference lib="es2020.intl" />
+/// <reference path="./lib.es2020.intl.d.ts" />
 
 interface BigIntToLocaleStringOptions {
   /**
@@ -23,11 +24,11 @@ interface BigIntToLocaleStringOptions {
    * information about this option, see the
    * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation Intl page}.
    */
-  localeMatcher?: string;
+  readonly localeMatcher?: string;
   /** The formatting style to use , the default is "decimal". */
-  style?: string;
+  readonly style?: string;
 
-  numberingSystem?: string;
+  readonly numberingSystem?: string;
   /**
    * The unit to use in unit formatting, Possible values are core unit
    * identifiers, defined in UTS #35, Part 2, Section 6. A subset of units from
@@ -35,13 +36,13 @@ interface BigIntToLocaleStringOptions {
    * be concatenated with "-per-" to make a compound unit. There is no default
    * value; if the style is "unit", the unit property must be provided.
    */
-  unit?: string;
+  readonly unit?: string;
 
   /**
    * The unit formatting style to use in unit formatting, the defaults is
    * "short".
    */
-  unitDisplay?: string;
+  readonly unitDisplay?: string;
 
   /**
    * The currency to use in currency formatting. Possible values are the ISO
@@ -51,7 +52,7 @@ interface BigIntToLocaleStringOptions {
    * property must be provided. It is only used when [[Style]] has the value
    * "currency".
    */
-  currency?: string;
+  readonly currency?: string;
 
   /**
    * How to display the currency in currency formatting. It is only used when
@@ -63,40 +64,19 @@ interface BigIntToLocaleStringOptions {
    *
    * "name" to use a localized currency name such as "dollar"
    */
-  currencyDisplay?: string;
+  readonly currencyDisplay?: string;
 
   /**
    * Whether to use grouping separators, such as thousands separators or
    * thousand/lakh/crore separators. The default is true.
    */
-  useGrouping?: boolean;
+  readonly useGrouping?: boolean;
 
   /**
    * The minimum number of integer digits to use. Possible values are from 1 to
    * 21; the default is 1.
    */
-  minimumIntegerDigits?:
-    | 1
-    | 2
-    | 3
-    | 4
-    | 5
-    | 6
-    | 7
-    | 8
-    | 9
-    | 10
-    | 11
-    | 12
-    | 13
-    | 14
-    | 15
-    | 16
-    | 17
-    | 18
-    | 19
-    | 20
-    | 21;
+  readonly minimumIntegerDigits?: UintRange<1, 22>;
 
   /**
    * The minimum number of fraction digits to use. Possible values are from 0 to
@@ -105,28 +85,7 @@ interface BigIntToLocaleStringOptions {
    * {@link http://www.currency-iso.org/en/home/tables/table-a1.html ISO 4217 currency codes list}
    * (2 if the list doesn't provide that information).
    */
-  minimumFractionDigits?:
-    | 0
-    | 1
-    | 2
-    | 3
-    | 4
-    | 5
-    | 6
-    | 7
-    | 8
-    | 9
-    | 10
-    | 11
-    | 12
-    | 13
-    | 14
-    | 15
-    | 16
-    | 17
-    | 18
-    | 19
-    | 20;
+  readonly minimumFractionDigits?: UintRange<0, 21>;
 
   /**
    * The maximum number of fraction digits to use. Possible values are from 0 to
@@ -138,82 +97,19 @@ interface BigIntToLocaleStringOptions {
    * (2 if the list doesn't provide that information); the default for percent
    * formatting is the larger of minimumFractionDigits and 0.
    */
-  maximumFractionDigits?:
-    | 0
-    | 1
-    | 2
-    | 3
-    | 4
-    | 5
-    | 6
-    | 7
-    | 8
-    | 9
-    | 10
-    | 11
-    | 12
-    | 13
-    | 14
-    | 15
-    | 16
-    | 17
-    | 18
-    | 19
-    | 20;
+  readonly maximumFractionDigits?: UintRange<0, 21>;
 
   /**
    * The minimum number of significant digits to use. Possible values are from 1
    * to 21; the default is 1.
    */
-  minimumSignificantDigits?:
-    | 1
-    | 2
-    | 3
-    | 4
-    | 5
-    | 6
-    | 7
-    | 8
-    | 9
-    | 10
-    | 11
-    | 12
-    | 13
-    | 14
-    | 15
-    | 16
-    | 17
-    | 18
-    | 19
-    | 20
-    | 21;
+  readonly minimumSignificantDigits?: UintRange<1, 22>;
 
   /**
    * The maximum number of significant digits to use. Possible values are from 1
    * to 21; the default is 21.
    */
-  maximumSignificantDigits?:
-    | 1
-    | 2
-    | 3
-    | 4
-    | 5
-    | 6
-    | 7
-    | 8
-    | 9
-    | 10
-    | 11
-    | 12
-    | 13
-    | 14
-    | 15
-    | 16
-    | 17
-    | 18
-    | 19
-    | 20
-    | 21;
+  readonly maximumSignificantDigits?: UintRange<1, 22>;
 
   /**
    * The formatting that should be displayed for the number, the defaults is
@@ -227,10 +123,10 @@ interface BigIntToLocaleStringOptions {
    *
    *     "compact" string representing exponent, defaults is using the "short" form
    */
-  notation?: string;
+  readonly notation?: string;
 
   /** Used only when notation is "compact" */
-  compactDisplay?: string;
+  readonly compactDisplay?: string;
 }
 
 interface BigInt {
@@ -239,7 +135,7 @@ interface BigInt {
    *
    * @param radix Specifies a radix for converting numeric values to strings.
    */
-  toString(radix?: number): string;
+  toString(radix?: UintRange<2, 37>): string;
 
   /**
    * Returns a string representation appropriate to the host environment's
@@ -267,7 +163,7 @@ interface BigIntConstructor {
    * @param bits The number of low bits to use
    * @param int The BigInt whose bits to extract
    */
-  asIntN(bits: number, int: bigint): bigint;
+  asIntN(bits: UintRange<0, 65>, int: bigint): bigint;
   /**
    * Interprets the low bits of a BigInt as an unsigned integer. All higher bits
    * are discarded.
@@ -275,10 +171,10 @@ interface BigIntConstructor {
    * @param bits The number of low bits to use
    * @param int The BigInt whose bits to extract
    */
-  asUintN(bits: number, int: bigint): bigint;
+  asUintN(bits: UintRange<0, 65>, int: bigint): bigint;
 }
 
-declare var BigInt: BigIntConstructor;
+declare const BigInt: BigIntConstructor;
 
 /**
  * A typed array of 64-bit signed integer values. The contents are initialized
@@ -287,7 +183,7 @@ declare var BigInt: BigIntConstructor;
  */
 interface BigInt64Array {
   /** The size in bytes of each element in the array. */
-  readonly BYTES_PER_ELEMENT: number;
+  readonly BYTES_PER_ELEMENT: 8;
 
   /** The ArrayBuffer instance referenced by the array. */
   readonly buffer: ArrayBufferLike;
@@ -312,7 +208,7 @@ interface BigInt64Array {
   copyWithin(target: number, start: number, end?: number): this;
 
   /** Yields index, value pairs for every entry in the array. */
-  entries(): IterableIterator<[number, bigint]>;
+  entries(): IterableIterator<readonly [number, BigInt64]>;
 
   /**
    * Determines whether all the members of an array satisfy the specified test.
@@ -325,8 +221,12 @@ interface BigInt64Array {
    *   value.
    */
   every(
-    predicate: (value: bigint, index: number, array: BigInt64Array) => boolean,
-    thisArg?: any,
+    predicate: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): boolean;
 
   /**
@@ -339,7 +239,7 @@ interface BigInt64Array {
    * @param end Index to stop filling the array at. If end is negative, it is
    *   treated as length+end.
    */
-  fill(value: bigint, start?: number, end?: number): this;
+  fill(value: BigInt64, start?: number, end?: number): this;
 
   /**
    * Returns the elements of an array that meet the condition specified in a
@@ -353,8 +253,12 @@ interface BigInt64Array {
    *   value.
    */
   filter(
-    predicate: (value: bigint, index: number, array: BigInt64Array) => any,
-    thisArg?: any,
+    predicate: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): BigInt64Array;
 
   /**
@@ -370,9 +274,13 @@ interface BigInt64Array {
    *   instead.
    */
   find(
-    predicate: (value: bigint, index: number, array: BigInt64Array) => boolean,
-    thisArg?: any,
-  ): bigint | undefined;
+    predicate: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => boolean,
+    thisArg?: unknown,
+  ): BigInt64 | undefined;
 
   /**
    * Returns the index of the first element in the array where predicate is
@@ -387,8 +295,12 @@ interface BigInt64Array {
    *   instead.
    */
   findIndex(
-    predicate: (value: bigint, index: number, array: BigInt64Array) => boolean,
-    thisArg?: any,
+    predicate: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): number;
 
   /**
@@ -401,8 +313,8 @@ interface BigInt64Array {
    *   value.
    */
   forEach(
-    callbackfn: (value: bigint, index: number, array: BigInt64Array) => void,
-    thisArg?: any,
+    callbackfn: (value: BigInt64, index: number, array: BigInt64Array) => void,
+    thisArg?: unknown,
   ): void;
 
   /**
@@ -413,7 +325,7 @@ interface BigInt64Array {
    * @param fromIndex The position in this array at which to begin searching for
    *   searchElement.
    */
-  includes(searchElement: bigint, fromIndex?: number): boolean;
+  includes(searchElement: BigInt64, fromIndex?: number): boolean;
 
   /**
    * Returns the index of the first occurrence of a value in an array.
@@ -422,7 +334,7 @@ interface BigInt64Array {
    * @param fromIndex The array index at which to begin the search. If fromIndex
    *   is omitted, the search starts at index 0.
    */
-  indexOf(searchElement: bigint, fromIndex?: number): number;
+  indexOf(searchElement: BigInt64, fromIndex?: number): number;
 
   /**
    * Adds all the elements of an array separated by the specified separator
@@ -444,7 +356,7 @@ interface BigInt64Array {
    * @param fromIndex The array index at which to begin the search. If fromIndex
    *   is omitted, the search starts at index 0.
    */
-  lastIndexOf(searchElement: bigint, fromIndex?: number): number;
+  lastIndexOf(searchElement: BigInt64, fromIndex?: number): number;
 
   /** The length of the array. */
   readonly length: number;
@@ -461,8 +373,12 @@ interface BigInt64Array {
    *   value.
    */
   map(
-    callbackfn: (value: bigint, index: number, array: BigInt64Array) => bigint,
-    thisArg?: any,
+    callbackfn: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => BigInt64,
+    thisArg?: unknown,
   ): BigInt64Array;
 
   /**
@@ -479,12 +395,12 @@ interface BigInt64Array {
    */
   reduce(
     callbackfn: (
-      previousValue: bigint,
-      currentValue: bigint,
+      previousValue: BigInt64,
+      currentValue: BigInt64,
       currentIndex: number,
       array: BigInt64Array,
-    ) => bigint,
-  ): bigint;
+    ) => BigInt64,
+  ): BigInt64;
 
   /**
    * Calls the specified callback function for all the elements in an array. The
@@ -501,7 +417,7 @@ interface BigInt64Array {
   reduce<U>(
     callbackfn: (
       previousValue: U,
-      currentValue: bigint,
+      currentValue: BigInt64,
       currentIndex: number,
       array: BigInt64Array,
     ) => U,
@@ -523,12 +439,12 @@ interface BigInt64Array {
    */
   reduceRight(
     callbackfn: (
-      previousValue: bigint,
-      currentValue: bigint,
+      previousValue: BigInt64,
+      currentValue: BigInt64,
       currentIndex: number,
       array: BigInt64Array,
-    ) => bigint,
-  ): bigint;
+    ) => BigInt64,
+  ): BigInt64;
 
   /**
    * Calls the specified callback function for all the elements in an array, in
@@ -546,7 +462,7 @@ interface BigInt64Array {
   reduceRight<U>(
     callbackfn: (
       previousValue: U,
-      currentValue: bigint,
+      currentValue: BigInt64,
       currentIndex: number,
       array: BigInt64Array,
     ) => U,
@@ -563,7 +479,7 @@ interface BigInt64Array {
    * @param offset The index in the current array at which the values are to be
    *   written.
    */
-  set(array: ArrayLike<bigint>, offset?: number): void;
+  set(array: ArrayLike<BigInt64>, offset?: number): void;
 
   /**
    * Returns a section of an array.
@@ -585,8 +501,12 @@ interface BigInt64Array {
    *   value.
    */
   some(
-    predicate: (value: bigint, index: number, array: BigInt64Array) => boolean,
-    thisArg?: any,
+    predicate: (
+      value: BigInt64,
+      index: number,
+      array: BigInt64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): boolean;
 
   /**
@@ -595,7 +515,7 @@ interface BigInt64Array {
    * @param compareFn The function used to determine the order of the elements.
    *   If omitted, the elements are sorted in ascending order.
    */
-  sort(compareFn?: (a: bigint, b: bigint) => number | bigint): this;
+  sort(compareFn?: (a: BigInt64, b: BigInt64) => number | bigint): this;
 
   /**
    * Gets a new BigInt64Array view of the ArrayBuffer store for this array,
@@ -616,19 +536,19 @@ interface BigInt64Array {
   valueOf(): BigInt64Array;
 
   /** Yields each value in the array. */
-  values(): IterableIterator<bigint>;
+  values(): IterableIterator<BigInt64>;
 
-  [Symbol.iterator](): IterableIterator<bigint>;
+  [Symbol.iterator](): IterableIterator<BigInt64>;
 
   readonly [Symbol.toStringTag]: 'BigInt64Array';
 
-  [index: number]: bigint;
+  readonly [index: number]: BigInt64;
 }
 
 interface BigInt64ArrayConstructor {
   readonly prototype: BigInt64Array;
   new (length?: number): BigInt64Array;
-  new (array: Iterable<bigint>): BigInt64Array;
+  new (array: Iterable<BigInt64>): BigInt64Array;
   new (
     buffer: ArrayBufferLike,
     byteOffset?: number,
@@ -636,14 +556,14 @@ interface BigInt64ArrayConstructor {
   ): BigInt64Array;
 
   /** The size in bytes of each element in the array. */
-  readonly BYTES_PER_ELEMENT: number;
+  readonly BYTES_PER_ELEMENT: 8;
 
   /**
    * Returns a new array from a set of elements.
    *
    * @param items A set of elements to include in the new array object.
    */
-  of(...items: bigint[]): BigInt64Array;
+  of(...items: readonly BigInt64[]): BigInt64Array;
 
   /**
    * Creates an array from an array-like or iterable object.
@@ -652,15 +572,15 @@ interface BigInt64ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(arrayLike: ArrayLike<bigint>): BigInt64Array;
+  from(arrayLike: ArrayLike<BigInt64>): BigInt64Array;
   from<U>(
     arrayLike: ArrayLike<U>,
-    mapfn: (v: U, k: number) => bigint,
-    thisArg?: any,
+    mapfn: (v: U, k: number) => BigInt64,
+    thisArg?: unknown,
   ): BigInt64Array;
 }
 
-declare var BigInt64Array: BigInt64ArrayConstructor;
+declare const BigInt64Array: BigInt64ArrayConstructor;
 
 /**
  * A typed array of 64-bit unsigned integer values. The contents are initialized
@@ -669,7 +589,7 @@ declare var BigInt64Array: BigInt64ArrayConstructor;
  */
 interface BigUint64Array {
   /** The size in bytes of each element in the array. */
-  readonly BYTES_PER_ELEMENT: number;
+  readonly BYTES_PER_ELEMENT: 8;
 
   /** The ArrayBuffer instance referenced by the array. */
   readonly buffer: ArrayBufferLike;
@@ -694,7 +614,7 @@ interface BigUint64Array {
   copyWithin(target: number, start: number, end?: number): this;
 
   /** Yields index, value pairs for every entry in the array. */
-  entries(): IterableIterator<[number, bigint]>;
+  entries(): IterableIterator<readonly [number, BigUint64]>;
 
   /**
    * Determines whether all the members of an array satisfy the specified test.
@@ -707,8 +627,12 @@ interface BigUint64Array {
    *   value.
    */
   every(
-    predicate: (value: bigint, index: number, array: BigUint64Array) => boolean,
-    thisArg?: any,
+    predicate: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): boolean;
 
   /**
@@ -721,7 +645,7 @@ interface BigUint64Array {
    * @param end Index to stop filling the array at. If end is negative, it is
    *   treated as length+end.
    */
-  fill(value: bigint, start?: number, end?: number): this;
+  fill(value: BigUint64, start?: number, end?: number): this;
 
   /**
    * Returns the elements of an array that meet the condition specified in a
@@ -735,8 +659,12 @@ interface BigUint64Array {
    *   value.
    */
   filter(
-    predicate: (value: bigint, index: number, array: BigUint64Array) => any,
-    thisArg?: any,
+    predicate: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): BigUint64Array;
 
   /**
@@ -752,9 +680,13 @@ interface BigUint64Array {
    *   instead.
    */
   find(
-    predicate: (value: bigint, index: number, array: BigUint64Array) => boolean,
-    thisArg?: any,
-  ): bigint | undefined;
+    predicate: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => boolean,
+    thisArg?: unknown,
+  ): BigUint64 | undefined;
 
   /**
    * Returns the index of the first element in the array where predicate is
@@ -769,8 +701,12 @@ interface BigUint64Array {
    *   instead.
    */
   findIndex(
-    predicate: (value: bigint, index: number, array: BigUint64Array) => boolean,
-    thisArg?: any,
+    predicate: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): number;
 
   /**
@@ -783,8 +719,12 @@ interface BigUint64Array {
    *   value.
    */
   forEach(
-    callbackfn: (value: bigint, index: number, array: BigUint64Array) => void,
-    thisArg?: any,
+    callbackfn: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => void,
+    thisArg?: unknown,
   ): void;
 
   /**
@@ -795,7 +735,7 @@ interface BigUint64Array {
    * @param fromIndex The position in this array at which to begin searching for
    *   searchElement.
    */
-  includes(searchElement: bigint, fromIndex?: number): boolean;
+  includes(searchElement: BigUint64, fromIndex?: number): boolean;
 
   /**
    * Returns the index of the first occurrence of a value in an array.
@@ -804,7 +744,7 @@ interface BigUint64Array {
    * @param fromIndex The array index at which to begin the search. If fromIndex
    *   is omitted, the search starts at index 0.
    */
-  indexOf(searchElement: bigint, fromIndex?: number): number;
+  indexOf(searchElement: BigUint64, fromIndex?: number): number;
 
   /**
    * Adds all the elements of an array separated by the specified separator
@@ -826,7 +766,7 @@ interface BigUint64Array {
    * @param fromIndex The array index at which to begin the search. If fromIndex
    *   is omitted, the search starts at index 0.
    */
-  lastIndexOf(searchElement: bigint, fromIndex?: number): number;
+  lastIndexOf(searchElement: BigUint64, fromIndex?: number): number;
 
   /** The length of the array. */
   readonly length: number;
@@ -843,8 +783,12 @@ interface BigUint64Array {
    *   value.
    */
   map(
-    callbackfn: (value: bigint, index: number, array: BigUint64Array) => bigint,
-    thisArg?: any,
+    callbackfn: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => BigUint64,
+    thisArg?: unknown,
   ): BigUint64Array;
 
   /**
@@ -861,12 +805,12 @@ interface BigUint64Array {
    */
   reduce(
     callbackfn: (
-      previousValue: bigint,
-      currentValue: bigint,
+      previousValue: BigUint64,
+      currentValue: BigUint64,
       currentIndex: number,
       array: BigUint64Array,
-    ) => bigint,
-  ): bigint;
+    ) => BigUint64,
+  ): BigUint64;
 
   /**
    * Calls the specified callback function for all the elements in an array. The
@@ -883,7 +827,7 @@ interface BigUint64Array {
   reduce<U>(
     callbackfn: (
       previousValue: U,
-      currentValue: bigint,
+      currentValue: BigUint64,
       currentIndex: number,
       array: BigUint64Array,
     ) => U,
@@ -905,12 +849,12 @@ interface BigUint64Array {
    */
   reduceRight(
     callbackfn: (
-      previousValue: bigint,
-      currentValue: bigint,
+      previousValue: BigUint64,
+      currentValue: BigUint64,
       currentIndex: number,
       array: BigUint64Array,
-    ) => bigint,
-  ): bigint;
+    ) => BigUint64,
+  ): BigUint64;
 
   /**
    * Calls the specified callback function for all the elements in an array, in
@@ -928,7 +872,7 @@ interface BigUint64Array {
   reduceRight<U>(
     callbackfn: (
       previousValue: U,
-      currentValue: bigint,
+      currentValue: BigUint64,
       currentIndex: number,
       array: BigUint64Array,
     ) => U,
@@ -945,7 +889,7 @@ interface BigUint64Array {
    * @param offset The index in the current array at which the values are to be
    *   written.
    */
-  set(array: ArrayLike<bigint>, offset?: number): void;
+  set(array: ArrayLike<BigUint64>, offset?: number): void;
 
   /**
    * Returns a section of an array.
@@ -967,8 +911,12 @@ interface BigUint64Array {
    *   value.
    */
   some(
-    predicate: (value: bigint, index: number, array: BigUint64Array) => boolean,
-    thisArg?: any,
+    predicate: (
+      value: BigUint64,
+      index: number,
+      array: BigUint64Array,
+    ) => boolean,
+    thisArg?: unknown,
   ): boolean;
 
   /**
@@ -977,7 +925,7 @@ interface BigUint64Array {
    * @param compareFn The function used to determine the order of the elements.
    *   If omitted, the elements are sorted in ascending order.
    */
-  sort(compareFn?: (a: bigint, b: bigint) => number | bigint): this;
+  sort(compareFn?: (a: BigUint64, b: BigUint64) => number | bigint): this;
 
   /**
    * Gets a new BigUint64Array view of the ArrayBuffer store for this array,
@@ -998,19 +946,19 @@ interface BigUint64Array {
   valueOf(): BigUint64Array;
 
   /** Yields each value in the array. */
-  values(): IterableIterator<bigint>;
+  values(): IterableIterator<BigUint64>;
 
-  [Symbol.iterator](): IterableIterator<bigint>;
+  [Symbol.iterator](): IterableIterator<BigUint64>;
 
   readonly [Symbol.toStringTag]: 'BigUint64Array';
 
-  [index: number]: bigint;
+  readonly [index: number]: BigUint64;
 }
 
 interface BigUint64ArrayConstructor {
   readonly prototype: BigUint64Array;
   new (length?: number): BigUint64Array;
-  new (array: Iterable<bigint>): BigUint64Array;
+  new (array: Iterable<BigUint64>): BigUint64Array;
   new (
     buffer: ArrayBufferLike,
     byteOffset?: number,
@@ -1018,14 +966,14 @@ interface BigUint64ArrayConstructor {
   ): BigUint64Array;
 
   /** The size in bytes of each element in the array. */
-  readonly BYTES_PER_ELEMENT: number;
+  readonly BYTES_PER_ELEMENT: 8;
 
   /**
    * Returns a new array from a set of elements.
    *
    * @param items A set of elements to include in the new array object.
    */
-  of(...items: bigint[]): BigUint64Array;
+  of(...items: readonly BigUint64[]): BigUint64Array;
 
   /**
    * Creates an array from an array-like or iterable object.
@@ -1034,15 +982,15 @@ interface BigUint64ArrayConstructor {
    * @param mapfn A mapping function to call on every element of the array.
    * @param thisArg Value of 'this' used to invoke the mapfn.
    */
-  from(arrayLike: ArrayLike<bigint>): BigUint64Array;
+  from(arrayLike: ArrayLike<BigUint64>): BigUint64Array;
   from<U>(
     arrayLike: ArrayLike<U>,
-    mapfn: (v: U, k: number) => bigint,
-    thisArg?: any,
+    mapfn: (v: U, k: number) => BigUint64,
+    thisArg?: unknown,
   ): BigUint64Array;
 }
 
-declare var BigUint64Array: BigUint64ArrayConstructor;
+declare const BigUint64Array: BigUint64ArrayConstructor;
 
 interface DataView {
   /**
@@ -1055,7 +1003,7 @@ interface DataView {
    * @param littleEndian If false or undefined, a big-endian value should be
    *   read.
    */
-  getBigInt64(byteOffset: number, littleEndian?: boolean): bigint;
+  getBigInt64(byteOffset: number, littleEndian?: boolean): BigInt64;
 
   /**
    * Gets the BigUint64 value at the specified byte offset from the start of the
@@ -1067,7 +1015,7 @@ interface DataView {
    * @param littleEndian If false or undefined, a big-endian value should be
    *   read.
    */
-  getBigUint64(byteOffset: number, littleEndian?: boolean): bigint;
+  getBigUint64(byteOffset: number, littleEndian?: boolean): BigUint64;
 
   /**
    * Stores a BigInt64 value at the specified byte offset from the start of the
@@ -1078,7 +1026,7 @@ interface DataView {
    * @param littleEndian If false or undefined, a big-endian value should be
    *   written.
    */
-  setBigInt64(byteOffset: number, value: bigint, littleEndian?: boolean): void;
+  setBigInt64(byteOffset: number, value: number, littleEndian?: boolean): void;
 
   /**
    * Stores a BigUint64 value at the specified byte offset from the start of the
@@ -1089,7 +1037,7 @@ interface DataView {
    * @param littleEndian If false or undefined, a big-endian value should be
    *   written.
    */
-  setBigUint64(byteOffset: number, value: bigint, littleEndian?: boolean): void;
+  setBigUint64(byteOffset: number, value: number, littleEndian?: boolean): void;
 }
 
 declare namespace Intl {
```
