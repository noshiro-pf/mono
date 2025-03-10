/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />
/// <reference lib="es5" />

/**
 * @internal
 * R が union 型（要素数1の場合も含む）のとき、 union の要素の中に K をキーとして含むものが一つでもあれば、
 * union 型を K をキーとして含むもののみに絞った型を返す。
 * union の要素の中に K をキーとして含むものが一つも無ければ、`Record<K, unknown>` を返す。
 * 結果には Readonly を付ける。
 */
declare namespace StrictLibInternals {
  export type HasOwnReturnType<
    R extends UnknownRecord,
    K extends PropertyKey,
  > = R extends R // union distribution
    ? K extends keyof R
      ? string extends keyof R
        ? Record<K, R[keyof R]> & R
        : number extends keyof R
          ? Record<K, R[keyof R]> & R
          : symbol extends keyof R
            ? Record<K, R[keyof R]> & R
            : R
      : never // omit union member that does not have key K
    : never; // dummy case for union distribution
}

interface ObjectConstructor {
  /**
   * Determines whether an object has a property with the specified name.
   *
   * @param obj An object.
   * @param key A property name.
   */
  hasOwn<R extends UnknownRecord, K extends PropertyKey>(
    obj: R,
    key: K,
  ): obj is StrictLibInternals.HasOwnReturnType<R, K>;
}
