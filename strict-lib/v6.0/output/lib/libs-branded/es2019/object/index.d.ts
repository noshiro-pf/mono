/// <reference lib="es5" />
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
 * Modified from TypeScript's `lib.es2019.object.d.ts` by strict-ts-lib
 * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
 * stricter types. This is not the original file. See the NOTICE and LICENSE
 * files of the package this ships in.
 */

/// <reference lib="es2015.iterable" />

declare namespace StrictLibInternals {
  type RecursionLimit = 20;

  /**
   * - `[['x', 1], ['y', 3]]` -> `{ x: 1, y: 3 }`
   *
   * @internal
   */
  export type EntriesToObject<
    Entries extends readonly (readonly [PropertyKey, unknown])[],
  > = Readonly<EntriesToObjectImpl<{}, Entries>>;

  /** @internal */
  type EntriesToObjectImpl<
    R,
    Entries extends readonly (readonly [PropertyKey, unknown])[],
  > = import('ts-type-forge').TypeEq<Entries['length'], 0> extends true
    ? R
    : EntriesToObjectImpl<
        EntryStep<R, Entries[0][0], Entries[0][1]>,
        import('ts-type-forge').List.Tail<Entries>
      >;

  /**
   * One entry set on `R`, replacing an earlier entry with the same
   * key as at run time. The key is read as {@link EntryKey} gives it,
   * and split into the literals a record lists and the index
   * signatures it does not:
   *
   * - literals alone: one replaces an earlier value, and a union sets
   *   one of its members, so a member `R` already has keeps its value
   *   or takes `V`, and one it lacks is optional;
   * - index signatures alone: an index signature of `V`, and a key of
   *   `R` they match may have been overwritten, so it takes `V` too;
   * - both: either may be the key, so the literals are optional, as
   *   for a union, and then the index signatures are set.
   *
   * @internal
   */
  type EntryStep<
    R,
    K0 extends PropertyKey,
    V,
    K extends PropertyKey = EntryKey<K0>,
  > = [LiteralKeys<K>] extends [never]
    ? IndexSignatureStep<R, K, V>
    : [IndexSignatureKeys<K>] extends [never]
      ? import('ts-type-forge').IsUnion<K> extends true
        ? UnionStep<R, K, V>
        : { [P in keyof R as P extends K ? never : P]: R[P] } & {
            readonly [P in K]: V;
          }
      : IndexSignatureStep<
          UnionStep<R, LiteralKeys<K>, V>,
          IndexSignatureKeys<K>,
          V
        >;

  /** @internal */
  type UnionStep<R, K extends PropertyKey, V> = {
    [P in keyof R]: [P & K] extends [never] ? R[P] : R[P] | V;
  } & {
    readonly [P in Exclude<K, keyof R>]?: V;
  };

  /** @internal */
  type IndexSignatureStep<R, K extends PropertyKey, V> = {
    [P in keyof R]: P extends K ? R[P] | V : R[P];
  } & {
    readonly [P in K]: V;
  };

  /**
   * A key as `Object.fromEntries` sets it. A number literal sets its
   * string: `0` sets `'0'`, as the key `'0'` does. A branded literal
   * (`'a' & { readonly __b: 1 }`), which a mapped type cannot list,
   * widens to its primitive, an index signature. `string`, a pattern
   * (``p-${string}``) and an open `string & {}` stay as they are.
   *
   * @internal
   */
  type EntryKey<K extends PropertyKey> = K extends string
    ? string extends K
      ? K
      : K extends `${infer _}`
        ? K
        : string
    : K extends number
      ? {} extends { [P in K]: unknown }
        ? number
        : `${K}`
      : K;

  /**
   * The object set by entries that need not be a tuple: each literal key
   * is optional, since such entries may be empty or leave a key out,
   * and an index signature is not, since its values hold no
   * `undefined`.
   *
   * @internal
   */
  export type ObjectOfEntryKeys<
    K0 extends PropertyKey,
    V,
    K extends PropertyKey = EntryKey<K0>,
  > = Readonly<
    { [P in LiteralKeys<K>]?: V } & { [P in IndexSignatureKeys<K>]: V }
  >;

  /**
   * - `['x' | 'y' | 'z', number][]]` -> `'x' | 'y' | 'z'`
   * - `[['a' | 'b' | 'c', number], ...['x' | 'y' | 'z', number][]]` -> `'a' | 'b' |
   *   'c' | 'x' | 'y' | 'z'`
   *
   * @internal
   *
   * @note The second example needs the recursion to run on past the
   * fixed elements, through entries of any length, where there is no
   * point to stop; so the recursion is limited (`RecursionLimit`).
   */
  export type KeysOfEntries<
    Entries extends readonly (readonly [PropertyKey, unknown])[],
  > = KeysOfEntriesImpl<never, Entries, RecursionLimit>;

  /** @internal */
  type KeysOfEntriesImpl<
    K,
    Entries extends readonly (readonly [PropertyKey, unknown])[],
    RemainingNumRecursions extends number,
  > = import('ts-type-forge').TypeEq<RemainingNumRecursions, 0> extends true
    ? K
    : import('ts-type-forge').TypeEq<Entries['length'], 0> extends true
      ? K
      : KeysOfEntriesImpl<
          K | Entries[0][0],
          import('ts-type-forge').List.Tail<Entries>,
          import('ts-type-forge').Decrement<RemainingNumRecursions>
        >;

  /** @internal */
  export type ValuesOfEntries<
    Entries extends readonly (readonly [PropertyKey, unknown])[],
  > = ValuesOfEntriesImpl<never, Entries, RecursionLimit>;

  /** @internal */
  type ValuesOfEntriesImpl<
    K,
    Entries extends readonly (readonly [PropertyKey, unknown])[],
    RemainingNumRecursions extends number,
  > = import('ts-type-forge').TypeEq<RemainingNumRecursions, 0> extends true
    ? K
    : import('ts-type-forge').TypeEq<Entries['length'], 0> extends true
      ? K
      : ValuesOfEntriesImpl<
          K | Entries[0][1],
          import('ts-type-forge').List.Tail<Entries>,
          import('ts-type-forge').Decrement<RemainingNumRecursions>
        >;

  /**
   * The members of `K` a record keyed by it must hold, rather than
   * index signatures (`string`, ``p-${string}``).
   *
   * @internal
   */
  type LiteralKeys<K> = K extends unknown
    ? {} extends { [P in K & PropertyKey]: unknown }
      ? never
      : K
    : never;

  /** @internal */
  type IndexSignatureKeys<K> = Exclude<K, LiteralKeys<K>>;
}

interface ObjectConstructor {
  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   *
   * @example
   *   const entries = [
   *     ['x', 1],
   *     ['y', 3],
   *   ] as const satisfies [['x', 1], ['y', 3]];
   *
   *   const obj = Object.fromEntries(entries) satisfies { x: 1; y: 3 };
   *
   * @note When `entries` is a tuple type, the result keeps each key with
   * its own value. As at run time, a later element overwrites an earlier
   * one with the same key, and a key that an element with a union key
   * sets is optional.
   * Otherwise `entries` may be empty or leave a key out, so each
   * literal key of the result is optional, while an index signature is
   * not: its values hold no `undefined`.
   *
   * A number key sets its string, and a branded literal key, which a
   * mapped type cannot list, widens to an index signature of its
   * primitive.
   */
  // @note `entries` がタプル型の場合には key-value の組み合わせも反映した型にする。
  // 実行時と同じく後の要素が同じ key の前の要素を上書きし、key が union 型の要素が設定する key は省略可能になる。
  // そうでない場合、`entries` は空のことも key を欠くこともあるので、結果のリテラルの key は省略可能にし、
  // index signature は値に `undefined` を含まないので省略可能にしない。
  //
  // 数値の key はその文字列を設定し、mapped type で列挙できない brand 付きのリテラルの key は、
  // そのプリミティブの index signature に広げる。
  fromEntries<
    const Entries extends readonly (readonly [PropertyKey, unknown])[],
  >(
    entries: Entries,
  ): import('ts-type-forge').IsFixedLengthList<Entries> extends true
    ? StrictLibInternals.EntriesToObject<Entries>
    : StrictLibInternals.ObjectOfEntryKeys<
        StrictLibInternals.KeysOfEntries<Entries>,
        StrictLibInternals.ValuesOfEntries<Entries>
      >;

  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   *
   * @example
   *   const entries = new Map<'x' | 'y' | 'z' | 4, 1 | 2 | 3>([
   *     ['x', 1],
   *     ['y', 2],
   *     ['z', 3],
   *     [4, 3],
   *   ]);
   *
   *   const obj = Object.fromEntries(entries); // { readonly x?: 1 | 2 | 3; readonly y?: 1 | 2 | 3; readonly z?: 1 | 2 | 3; readonly '4'?: 1 | 2 | 3 }
   *
   */
  fromEntries<K extends PropertyKey, V>(
    entries: Iterable<readonly [K, V]>,
  ): StrictLibInternals.ObjectOfEntryKeys<K, V>;

  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   */
  fromEntries(entries: Iterable<readonly unknown[]>): unknown;
}
