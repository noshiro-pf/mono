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

/// <reference path="./lib.es2020.intl.d.ts" />

interface BigIntToLocaleStringOptions {
  /**
   * The locale matching algorithm to use.The default is "best fit". For
   * information about this option, see the
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_negotiation Intl page}.
   */
  readonly localeMatcher?: string;
  /** The formatting style to use , the default is "decimal". */
  readonly style?: string;

  readonly numberingSystem?: string;
  /**
   * The unit to use in unit formatting, Possible values are core unit
   * identifiers, defined in UTS #35, Part 2, Section 6. A subset of units from
   * the full list was selected for use in ECMAScript. Pairs of simple units can
   * be concatenated with "-per-" to make a compound unit. There is no default
   * value; if the style is "unit", the unit property must be provided.
   */
  readonly unit?: string;

  /**
   * The unit formatting style to use in unit formatting, the defaults is
   * "short".
   */
  readonly unitDisplay?: string;

  /**
   * The currency to use in currency formatting. Possible values are the ISO
   * 4217 currency codes, such as "USD" for the US dollar, "EUR" for the euro,
   * or "CNY" for the Chinese RMB — see the Current currency & funds code list.
   * There is no default value; if the style is "currency", the currency
   * property must be provided. It is only used when [[Style]] has the value
   * "currency".
   */
  readonly currency?: string;

  /**
   * How to display the currency in currency formatting. It is only used when
   * [[Style]] has the value "currency". The default is "symbol".
   *
   * "symbol" to use a localized currency symbol such as €,
   *
   * "code" to use the ISO currency code,
   *
   * "name" to use a localized currency name such as "dollar"
   */
  readonly currencyDisplay?: string;

  /**
   * Whether to use grouping separators, such as thousands separators or
   * thousand/lakh/crore separators. The default is true.
   */
  readonly useGrouping?: boolean;

  /**
   * The minimum number of integer digits to use. Possible values are from 1 to
   * 21; the default is 1.
   */
  readonly minimumIntegerDigits?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21;

  /**
   * The minimum number of fraction digits to use. Possible values are from 0 to
   * 20; the default for plain number and percent formatting is 0; the default
   * for currency formatting is the number of minor unit digits provided by the
   * {@link http://www.currency-iso.org/en/home/tables/table-a1.html ISO 4217 currency codes list}
   * (2 if the list doesn't provide that information).
   */
  readonly minimumFractionDigits?:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20;

  /**
   * The maximum number of fraction digits to use. Possible values are from 0 to
   * 20; the default for plain number formatting is the larger of
   * minimumFractionDigits and 3; the default for currency formatting is the
   * larger of minimumFractionDigits and the number of minor unit digits
   * provided by the
   * {@link http://www.currency-iso.org/en/home/tables/table-a1.html ISO 4217 currency codes list}
   * (2 if the list doesn't provide that information); the default for percent
   * formatting is the larger of minimumFractionDigits and 0.
   */
  readonly maximumFractionDigits?:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20;

  /**
   * The minimum number of significant digits to use. Possible values are from 1
   * to 21; the default is 1.
   */
  readonly minimumSignificantDigits?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21;

  /**
   * The maximum number of significant digits to use. Possible values are from 1
   * to 21; the default is 21.
   */
  readonly maximumSignificantDigits?:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21;

  /**
   * The formatting that should be displayed for the number, the defaults is
   * "standard"
   *
   *     "standard" plain number formatting
   *
   *     "scientific" return the order-of-magnitude for formatted number.
   *
   *     "engineering" return the exponent of ten when divisible by three
   *
   *     "compact" string representing exponent, defaults is using the "short" form
   */
  readonly notation?: string;

  /** Used only when notation is "compact" */
  readonly compactDisplay?: string;
}

interface BigInt {
  /**
   * Returns a string representation of an object.
   *
   * @param radix Specifies a radix for converting numeric values to strings.
   */
  toString(radix?: UintRange<2, 37>): string;

  /**
   * Returns a string representation appropriate to the host environment's
   * current locale.
   */
  toLocaleString(
    locales?: Intl.LocalesArgument,
    options?: BigIntToLocaleStringOptions,
  ): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): bigint;

  readonly [Symbol.toStringTag]: 'BigInt';
}

interface BigIntConstructor {
  (value: bigint | boolean | number | string): bigint;
  readonly prototype: BigInt;

  /**
   * Interprets the low bits of a BigInt as a 2's-complement signed integer. All
   * higher bits are discarded.
   *
   * @param bits The number of low bits to use
   * @param int The BigInt whose bits to extract
   */
  asIntN(bits: UintRange<0, 65>, int: bigint): bigint;
  /**
   * Interprets the low bits of a BigInt as an unsigned integer. All higher bits
   * are discarded.
   *
   * @param bits The number of low bits to use
   * @param int The BigInt whose bits to extract
   */
  asUintN(bits: UintRange<0, 65>, int: bigint): bigint;
}

declare const BigInt: BigIntConstructor;

/**
 * A typed array of 64-bit signed integer values. The contents are initialized
 * to 0. If the requested number of bytes could not be allocated, an exception
 * is raised.
 */
interface BigInt64Array {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 8;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: ArrayBufferLike;

  /** The length in bytes of the array. */
  readonly byteLength: SafeUint;

  /** The offset in bytes of the array. */
  readonly byteOffset: SafeUint;

  /**
   * Returns the this object after copying a section of the array identified by
   * start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where
   *   length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is
   *   negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its
   *   default value.
   */
  copyWithin(
    target: SafeInt | Int10,
    start: SafeInt | Int10,
    end?: SafeInt | Int10,
  ): this;

  /** Yields index, value pairs for every entry in the array. */
  entries(): IterableIterator<readonly [SafeUint, BigInt64]>;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every
   *   method calls the predicate function for each element in the array until
   *   the predicate returns false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the
   *   predicate function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  every(
    predicate: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value`
   * and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it
   *   is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is
   *   treated as length+end.
   */
  fill(value: BigInt64, start?: SafeInt | Int10, end?: SafeInt | Int10): this;

  /**
   * Returns the elements of an array that meet the condition specified in a
   * callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter
   *   method calls the predicate function one time for each element in the
   *   array.
   * @param thisArg An object to which the this keyword can refer in the
   *   predicate function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  filter(
    predicate: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): BigInt64Array;

  /**
   * Returns the value of the first element in the array where predicate is
   * true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array,
   *   in ascending order, until it finds one where predicate returns true. If
   *   such an element is found, find immediately returns that element value.
   *   Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  find(
    predicate: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): BigInt64 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is
   * true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array,
   *   in ascending order, until it finds one where predicate returns true. If
   *   such an element is found, findIndex immediately returns that element
   *   index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findIndex(
    predicate: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): SafeUint | -1;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach
   *   calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the
   *   callbackfn function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  forEach(
    callbackfn: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Determines whether an array includes a certain element, returning true or
   * false as appropriate.
   *
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for
   *   searchElement.
   */
  includes(searchElement: BigInt64, fromIndex?: SafeInt | Int10): boolean;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex
   *   is omitted, the search starts at index 0.
   */
  indexOf(searchElement: BigInt64, fromIndex?: SafeInt | Int10): SafeUint | -1;

  /**
   * Adds all the elements of an array separated by the specified separator
   * string.
   *
   * @param separator A string used to separate one element of an array from the
   *   next in the resulting String. If omitted, the array elements are
   *   separated with a comma.
   */
  join(separator?: string): string;

  /** Yields each index in the array. */
  keys(): IterableIterator<SafeUint>;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex
   *   is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: BigInt64,
    fromIndex?: SafeInt | Int10,
  ): SafeUint | -1;

  /** The length of the array. */
  readonly length: SafeUint;

  /**
   * Calls a defined callback function on each element of an array, and returns
   * an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map
   *   method calls the callbackfn function one time for each element in the
   *   array.
   * @param thisArg An object to which the this keyword can refer in the
   *   callbackfn function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  map(
    callbackfn: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => BigInt64,
    thisArg?: unknown,
  ): BigInt64Array;

  /**
   * Calls the specified callback function for all the elements in an array. The
   * return value of the callback function is the accumulated result, and is
   * provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce
   *   method calls the callbackfn function one time for each element in the
   *   array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: BigInt64,
      currentValue: BigInt64,
      currentIndex: SafeUint,
      array: BigInt64Array,
    ) => BigInt64,
  ): BigInt64;

  /**
   * Calls the specified callback function for all the elements in an array. The
   * return value of the callback function is the accumulated result, and is
   * provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce
   *   method calls the callbackfn function one time for each element in the
   *   array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: BigInt64,
      currentIndex: SafeUint,
      array: BigInt64Array,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in
   * descending order. The return value of the callback function is the
   * accumulated result, and is provided as an argument in the next call to the
   * callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The
   *   reduceRight method calls the callbackfn function one time for each
   *   element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: BigInt64,
      currentValue: BigInt64,
      currentIndex: SafeUint,
      array: BigInt64Array,
    ) => BigInt64,
  ): BigInt64;

  /**
   * Calls the specified callback function for all the elements in an array, in
   * descending order. The return value of the callback function is the
   * accumulated result, and is provided as an argument in the next call to the
   * callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The
   *   reduceRight method calls the callbackfn function one time for each
   *   element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: BigInt64,
      currentIndex: SafeUint,
      array: BigInt64Array,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in the array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be
   *   written.
   */
  set(array: ArrayLike<BigInt64>, offset?: SafeUint | Uint9): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array.
   */
  slice(start?: SafeInt | Int10, end?: SafeInt | Int10): BigInt64Array;

  /**
   * Determines whether the specified callback function returns true for any
   * element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some
   *   method calls the predicate function for each element in the array until
   *   the predicate returns true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the
   *   predicate function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  some(
    predicate: (
      value: BigInt64,
      index: SafeUint,
      array: BigInt64Array,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts the array.
   *
   * @param compareFn The function used to determine the order of the elements.
   *   If omitted, the elements are sorted in ascending order.
   */
  sort(compareFn?: (a: BigInt64, b: BigInt64) => number | bigint): this;

  /**
   * Gets a new BigInt64Array view of the ArrayBuffer store for this array,
   * referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(begin?: SafeInt | Int10, end?: SafeInt | Int10): BigInt64Array;

  /** Converts the array to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of the array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): BigInt64Array;

  /** Yields each value in the array. */
  values(): IterableIterator<BigInt64>;

  [Symbol.iterator](): IterableIterator<BigInt64>;

  readonly [Symbol.toStringTag]: 'BigInt64Array';

  readonly [index: SafeUint]: BigInt64;
}

interface BigInt64ArrayConstructor {
  readonly prototype: BigInt64Array;
  new (length?: SafeUint): BigInt64Array;
  new (array: Iterable<BigInt64>): BigInt64Array;
  new (
    buffer: ArrayBufferLike,
    byteOffset?: SafeUint | Uint9,
    length?: SafeUint,
  ): BigInt64Array;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 8;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly BigInt64[]): BigInt64Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: ArrayLike<BigInt64>): BigInt64Array;
  from<U>(
    arrayLike: ArrayLike<U>,
    mapfn: (v: U, k: SafeUint) => BigInt64,
    thisArg?: unknown,
  ): BigInt64Array;
}

declare const BigInt64Array: BigInt64ArrayConstructor;

/**
 * A typed array of 64-bit unsigned integer values. The contents are initialized
 * to 0. If the requested number of bytes could not be allocated, an exception
 * is raised.
 */
interface BigUint64Array {
  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 8;

  /** The ArrayBuffer instance referenced by the array. */
  readonly buffer: ArrayBufferLike;

  /** The length in bytes of the array. */
  readonly byteLength: SafeUint;

  /** The offset in bytes of the array. */
  readonly byteOffset: SafeUint;

  /**
   * Returns the this object after copying a section of the array identified by
   * start and end to the same array starting at position target
   *
   * @param target If target is negative, it is treated as length+target where
   *   length is the length of the array.
   * @param start If start is negative, it is treated as length+start. If end is
   *   negative, it is treated as length+end.
   * @param end If not specified, length of the this object is used as its
   *   default value.
   */
  copyWithin(
    target: SafeInt | Int10,
    start: SafeInt | Int10,
    end?: SafeInt | Int10,
  ): this;

  /** Yields index, value pairs for every entry in the array. */
  entries(): IterableIterator<readonly [SafeUint, BigUint64]>;

  /**
   * Determines whether all the members of an array satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every
   *   method calls the predicate function for each element in the array until
   *   the predicate returns false, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the
   *   predicate function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  every(
    predicate: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Changes all array elements from `start` to `end` index to a static `value`
   * and returns the modified array
   *
   * @param value Value to fill array section with
   * @param start Index to start filling the array at. If start is negative, it
   *   is treated as length+start where length is the length of the array.
   * @param end Index to stop filling the array at. If end is negative, it is
   *   treated as length+end.
   */
  fill(value: BigUint64, start?: SafeInt | Int10, end?: SafeInt | Int10): this;

  /**
   * Returns the elements of an array that meet the condition specified in a
   * callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter
   *   method calls the predicate function one time for each element in the
   *   array.
   * @param thisArg An object to which the this keyword can refer in the
   *   predicate function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  filter(
    predicate: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): BigUint64Array;

  /**
   * Returns the value of the first element in the array where predicate is
   * true, and undefined otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array,
   *   in ascending order, until it finds one where predicate returns true. If
   *   such an element is found, find immediately returns that element value.
   *   Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  find(
    predicate: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): BigUint64 | undefined;

  /**
   * Returns the index of the first element in the array where predicate is
   * true, and -1 otherwise.
   *
   * @param predicate Find calls predicate once for each element of the array,
   *   in ascending order, until it finds one where predicate returns true. If
   *   such an element is found, findIndex immediately returns that element
   *   index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each
   *   invocation of predicate. If it is not provided, undefined is used
   *   instead.
   */
  findIndex(
    predicate: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): SafeUint | -1;

  /**
   * Performs the specified action for each element in an array.
   *
   * @param callbackfn A function that accepts up to three arguments. forEach
   *   calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the
   *   callbackfn function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  forEach(
    callbackfn: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => void,
    thisArg?: unknown,
  ): void;

  /**
   * Determines whether an array includes a certain element, returning true or
   * false as appropriate.
   *
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for
   *   searchElement.
   */
  includes(searchElement: BigUint64, fromIndex?: SafeInt | Int10): boolean;

  /**
   * Returns the index of the first occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex
   *   is omitted, the search starts at index 0.
   */
  indexOf(searchElement: BigUint64, fromIndex?: SafeInt | Int10): SafeUint | -1;

  /**
   * Adds all the elements of an array separated by the specified separator
   * string.
   *
   * @param separator A string used to separate one element of an array from the
   *   next in the resulting String. If omitted, the array elements are
   *   separated with a comma.
   */
  join(separator?: string): string;

  /** Yields each index in the array. */
  keys(): IterableIterator<SafeUint>;

  /**
   * Returns the index of the last occurrence of a value in an array.
   *
   * @param searchElement The value to locate in the array.
   * @param fromIndex The array index at which to begin the search. If fromIndex
   *   is omitted, the search starts at index 0.
   */
  lastIndexOf(
    searchElement: BigUint64,
    fromIndex?: SafeInt | Int10,
  ): SafeUint | -1;

  /** The length of the array. */
  readonly length: SafeUint;

  /**
   * Calls a defined callback function on each element of an array, and returns
   * an array that contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map
   *   method calls the callbackfn function one time for each element in the
   *   array.
   * @param thisArg An object to which the this keyword can refer in the
   *   callbackfn function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  map(
    callbackfn: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => BigUint64,
    thisArg?: unknown,
  ): BigUint64Array;

  /**
   * Calls the specified callback function for all the elements in an array. The
   * return value of the callback function is the accumulated result, and is
   * provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce
   *   method calls the callbackfn function one time for each element in the
   *   array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduce(
    callbackfn: (
      previousValue: BigUint64,
      currentValue: BigUint64,
      currentIndex: SafeUint,
      array: BigUint64Array,
    ) => BigUint64,
  ): BigUint64;

  /**
   * Calls the specified callback function for all the elements in an array. The
   * return value of the callback function is the accumulated result, and is
   * provided as an argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce
   *   method calls the callbackfn function one time for each element in the
   *   array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: BigUint64,
      currentIndex: SafeUint,
      array: BigUint64Array,
    ) => U,
    initialValue: U,
  ): U;

  /**
   * Calls the specified callback function for all the elements in an array, in
   * descending order. The return value of the callback function is the
   * accumulated result, and is provided as an argument in the next call to the
   * callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The
   *   reduceRight method calls the callbackfn function one time for each
   *   element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduceRight(
    callbackfn: (
      previousValue: BigUint64,
      currentValue: BigUint64,
      currentIndex: SafeUint,
      array: BigUint64Array,
    ) => BigUint64,
  ): BigUint64;

  /**
   * Calls the specified callback function for all the elements in an array, in
   * descending order. The return value of the callback function is the
   * accumulated result, and is provided as an argument in the next call to the
   * callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The
   *   reduceRight method calls the callbackfn function one time for each
   *   element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial
   *   value to start the accumulation. The first call to the callbackfn
   *   function provides this value as an argument instead of an array value.
   */
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: BigUint64,
      currentIndex: SafeUint,
      array: BigUint64Array,
    ) => U,
    initialValue: U,
  ): U;

  /** Reverses the elements in the array. */
  reverse(): this;

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be
   *   written.
   */
  set(array: ArrayLike<BigUint64>, offset?: SafeUint | Uint9): void;

  /**
   * Returns a section of an array.
   *
   * @param start The beginning of the specified portion of the array.
   * @param end The end of the specified portion of the array.
   */
  slice(start?: SafeInt | Int10, end?: SafeInt | Int10): BigUint64Array;

  /**
   * Determines whether the specified callback function returns true for any
   * element of an array.
   *
   * @param predicate A function that accepts up to three arguments. The some
   *   method calls the predicate function for each element in the array until
   *   the predicate returns true, or until the end of the array.
   * @param thisArg An object to which the this keyword can refer in the
   *   predicate function. If thisArg is omitted, undefined is used as the this
   *   value.
   */
  some(
    predicate: (
      value: BigUint64,
      index: SafeUint,
      array: BigUint64Array,
    ) => boolean,
    thisArg?: unknown,
  ): boolean;

  /**
   * Sorts the array.
   *
   * @param compareFn The function used to determine the order of the elements.
   *   If omitted, the elements are sorted in ascending order.
   */
  sort(compareFn?: (a: BigUint64, b: BigUint64) => number | bigint): this;

  /**
   * Gets a new BigUint64Array view of the ArrayBuffer store for this array,
   * referencing the elements at begin, inclusive, up to end, exclusive.
   *
   * @param begin The index of the beginning of the array.
   * @param end The index of the end of the array.
   */
  subarray(begin?: SafeInt | Int10, end?: SafeInt | Int10): BigUint64Array;

  /** Converts the array to a string by using the current locale. */
  toLocaleString(): string;

  /** Returns a string representation of the array. */
  toString(): string;

  /** Returns the primitive value of the specified object. */
  valueOf(): BigUint64Array;

  /** Yields each value in the array. */
  values(): IterableIterator<BigUint64>;

  [Symbol.iterator](): IterableIterator<BigUint64>;

  readonly [Symbol.toStringTag]: 'BigUint64Array';

  readonly [index: SafeUint]: BigUint64;
}

interface BigUint64ArrayConstructor {
  readonly prototype: BigUint64Array;
  new (length?: SafeUint): BigUint64Array;
  new (array: Iterable<BigUint64>): BigUint64Array;
  new (
    buffer: ArrayBufferLike,
    byteOffset?: SafeUint | Uint9,
    length?: SafeUint,
  ): BigUint64Array;

  /** The size in bytes of each element in the array. */
  readonly BYTES_PER_ELEMENT: 8;

  /**
   * Returns a new array from a set of elements.
   *
   * @param items A set of elements to include in the new array object.
   */
  of(...items: readonly BigUint64[]): BigUint64Array;

  /**
   * Creates an array from an array-like or iterable object.
   *
   * @param arrayLike An array-like or iterable object to convert to an array.
   * @param mapfn A mapping function to call on every element of the array.
   * @param thisArg Value of 'this' used to invoke the mapfn.
   */
  from(arrayLike: ArrayLike<BigUint64>): BigUint64Array;
  from<U>(
    arrayLike: ArrayLike<U>,
    mapfn: (v: U, k: SafeUint) => BigUint64,
    thisArg?: unknown,
  ): BigUint64Array;
}

declare const BigUint64Array: BigUint64ArrayConstructor;

interface DataView {
  /**
   * Gets the BigInt64 value at the specified byte offset from the start of the
   * view. There is no alignment constraint; multi-byte values may be fetched
   * from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be
   *   retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be
   *   read.
   */
  getBigInt64(byteOffset: SafeUint, littleEndian?: boolean): BigInt64;

  /**
   * Gets the BigUint64 value at the specified byte offset from the start of the
   * view. There is no alignment constraint; multi-byte values may be fetched
   * from any offset.
   *
   * @param byteOffset The place in the buffer at which the value should be
   *   retrieved.
   * @param littleEndian If false or undefined, a big-endian value should be
   *   read.
   */
  getBigUint64(byteOffset: SafeUint, littleEndian?: boolean): BigUint64;

  /**
   * Stores a BigInt64 value at the specified byte offset from the start of the
   * view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be
   *   written.
   */
  setBigInt64(
    byteOffset: SafeUint,
    value: BigInt64,
    littleEndian?: boolean,
  ): void;

  /**
   * Stores a BigUint64 value at the specified byte offset from the start of the
   * view.
   *
   * @param byteOffset The place in the buffer at which the value should be set.
   * @param value The value to set.
   * @param littleEndian If false or undefined, a big-endian value should be
   *   written.
   */
  setBigUint64(
    byteOffset: SafeUint,
    value: BigUint64,
    littleEndian?: boolean,
  ): void;
}

declare namespace Intl {
  interface NumberFormat {
    format(value: number | bigint): string;
    resolvedOptions(): ResolvedNumberFormatOptions;
  }
}
