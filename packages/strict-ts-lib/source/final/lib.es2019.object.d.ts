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
/// <reference path="./lib.es5.d.ts" />

/// <reference path="./lib.es2015.iterable.d.ts" />

type RecursionLimit = 20;

/**
 * - `[['x', 1], ['y', 3]]` -> `{ x: 1, y: 3 }`
 *
 * @internal
 */
type _EntriesToObject<
  Entries extends readonly (readonly [PropertyKey, unknown])[],
> = Readonly<_EntriesToObjectImpl<{}, Entries>>;

/** @internal */
type _EntriesToObjectImpl<
  R,
  Entries extends readonly (readonly [PropertyKey, unknown])[],
> =
  TypeEq<Entries['length'], 0> extends true
    ? R
    : _EntriesToObjectImpl<
        R & { [key in Entries[0][0]]: Entries[0][1] },
        ListType.Tail<Entries>
      >;

/**
 * - `['x' | 'y' | 'z', number][]]` -> `'x' | 'y' | 'z'`
 * - `[['a' | 'b' | 'c', number], ...['x' | 'y' | 'z', number][]]` -> `'a' | 'b' |
 *   'c' | 'x' | 'y' | 'z'`
 *
 * @internal
 *
 * @note 上の2個目の例に対応するためには、無限長の Entries に対しても再帰を回す必要があるが、
 * 止めるタイミングを決められないので再帰制限を設けている。
 */
type _KeysOfEntries<
  Entries extends readonly (readonly [PropertyKey, unknown])[],
> = _KeysOfEntriesImpl<never, Entries, RecursionLimit>;

/** @internal */
type _KeysOfEntriesImpl<
  K extends PropertyKey,
  Entries extends readonly (readonly [PropertyKey, unknown])[],
  RemainingNumRecursions extends number,
> =
  TypeEq<RemainingNumRecursions, 0> extends true
    ? K
    : TypeEq<Entries['length'], 0> extends true
      ? K
      : _KeysOfEntriesImpl<
          K | Entries[0][0],
          ListType.Tail<Entries>,
          Decrement<RemainingNumRecursions>
        >;

/** @internal */
type _ValuesOfEntries<
  Entries extends readonly (readonly [PropertyKey, unknown])[],
> = _ValuesOfEntriesImpl<never, Entries, RecursionLimit>;

/** @internal */
type _ValuesOfEntriesImpl<
  K extends PropertyKey,
  Entries extends readonly (readonly [PropertyKey, unknown])[],
  RemainingNumRecursions extends number,
> =
  TypeEq<RemainingNumRecursions, 0> extends true
    ? K
    : TypeEq<Entries['length'], 0> extends true
      ? K
      : _ValuesOfEntriesImpl<
          K | Entries[0][1],
          ListType.Tail<Entries>,
          Decrement<RemainingNumRecursions>
        >;

/** @internal */
type _PartialIfKeyIsUnion<K, T> = IsUnion<K> extends true ? Partial<T> : T;

interface ObjectConstructor {
  /**
   * Returns an object created by key-value entries for properties and methods.
   *
   * ```ts
   * const entries = [
   *   ['x', 1],
   *   ['y', 3],
   * ] as const satisfies [['x', 1], ['y', 3]];
   *
   * const obj = Object.fromEntries(entries) satisfies { x: 1; y: 3 };
   * ```
   *
   * @param entries An iterable object that contains key-value entries for
   *   properties and methods.
   * @note `entries` がタプル型の場合には key-value の組み合わせも反映した型にする。
   * そうでない場合、 `K` が union 型の場合、`entries` がそのすべてを網羅しているとは限らないため、
   * `fromEntries` の返り値型がその union 要素すべてを含む型になってしまわないように `Partial` を付けている。
   */
  fromEntries<Entries extends readonly (readonly [PropertyKey, unknown])[]>(
    entries: Entries,
  ): IsFixedLengthList<Entries> extends true
    ? _EntriesToObject<Entries>
    : _PartialIfKeyIsUnion<
        _KeysOfEntries<Entries>,
        Record<_KeysOfEntries<Entries>, _ValuesOfEntries<Entries>>
      >;

  /**
   * Returns an object created by key-value entries for properties and methods.
   *
   * @param entries An iterable object that contains key-value entries for
   *   properties and methods.
   *
   *   ```ts
   *   const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] =
   *     [
   *       ['x', 1],
   *       ['y', 2],
   *       ['z', 3],
   *       [4, 3],
   *     ] as const;
   *
   *   const obj = Object.fromEntries(entries); // Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>
   *   ```
   * @param entries An iterable object that contains key-value entries for
   *   properties and methods.
   */
  fromEntries<K extends PropertyKey, V>(
    entries: Iterable<readonly [K, V]>,
  ): Record<K, V>;

  /**
   * Returns an object created by key-value entries for properties and methods
   *
   * @param entries An iterable object that contains key-value entries for
   *   properties and methods.
   */
  fromEntries(entries: Iterable<readonly unknown[]>): unknown;
}