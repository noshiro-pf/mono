/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface MapConstructor {
  /**
   * Groups members of an iterable according to the return value of the passed
   * callback.
   *
   * @param items An iterable.
   * @param keySelector A callback which will be invoked for each item in items.
   */
  groupBy<K, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: NumberType.ArraySizeArgNonNegative) => K,
  ): ReadonlyMap<K, readonly T[]>;
}

interface ReadonlySetLike<T> {
  /** Despite its name, returns an iterator of the values in the set-like. */
  keys(): Iterator<T>;
  /**
   * @returns A boolean indicating whether an element with the specified value
   *   exists in the set-like or not.
   */
  has(value: T): boolean;
  /** @returns The number of (unique) elements in the set-like. */
  readonly size: number;
}

interface Set<T> {
  /**
   * @returns A new Set containing all the elements in this Set and also all the
   *   elements in the argument.
   */
  union<U>(other: ReadonlySetLike<U>): ReadonlySet<T | U>;
  /**
   * @returns A new Set containing all the elements which are both in this Set
   *   and in the argument.
   */
  intersection<U>(other: ReadonlySetLike<U>): ReadonlySet<T & U>;
  /**
   * @returns A new Set containing all the elements in this Set which are not
   *   also in the argument.
   */
  difference<U>(other: ReadonlySetLike<U>): ReadonlySet<T>;
  /**
   * @returns A new Set containing all the elements which are in either this Set
   *   or in the argument, but not in both.
   */
  symmetricDifference<U>(other: ReadonlySetLike<U>): ReadonlySet<T | U>;
  /**
   * @returns A boolean indicating whether all the elements in this Set are also
   *   in the argument.
   */
  isSubsetOf(other: ReadonlySetLike<unknown>): boolean;
  /**
   * @returns A boolean indicating whether all the elements in the argument are
   *   also in this Set.
   */
  isSupersetOf(other: ReadonlySetLike<unknown>): boolean;
  /**
   * @returns A boolean indicating whether this Set has no elements in common
   *   with the argument.
   */
  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean;
}

interface ReadonlySet<T> {
  /**
   * @returns A new Set containing all the elements in this Set and also all the
   *   elements in the argument.
   */
  union<U>(other: ReadonlySetLike<U>): ReadonlySet<T | U>;
  /**
   * @returns A new Set containing all the elements which are both in this Set
   *   and in the argument.
   */
  intersection<U>(other: ReadonlySetLike<U>): ReadonlySet<T & U>;
  /**
   * @returns A new Set containing all the elements in this Set which are not
   *   also in the argument.
   */
  difference<U>(other: ReadonlySetLike<U>): ReadonlySet<T>;
  /**
   * @returns A new Set containing all the elements which are in either this Set
   *   or in the argument, but not in both.
   */
  symmetricDifference<U>(other: ReadonlySetLike<U>): ReadonlySet<T | U>;
  /**
   * @returns A boolean indicating whether all the elements in this Set are also
   *   in the argument.
   */
  isSubsetOf(other: ReadonlySetLike<unknown>): boolean;
  /**
   * @returns A boolean indicating whether all the elements in the argument are
   *   also in this Set.
   */
  isSupersetOf(other: ReadonlySetLike<unknown>): boolean;
  /**
   * @returns A boolean indicating whether this Set has no elements in common
   *   with the argument.
   */
  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean;
}
