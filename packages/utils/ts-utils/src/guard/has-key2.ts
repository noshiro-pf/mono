/**
 * @internal
 * union の要素の中に K をキーとして含むものが一つでもあれば false、そうでなければ true を返す。
 */
export type NoUnionMemberHasKey<O extends object, K> = (
  O extends O ? (K extends keyof O ? 1 : 0) : never
) extends 0
  ? true
  : false;

/**
 * @internal
 * O が union 型（要素数1以下の場合も含む）のとき、 union の要素の中に K をキーとして含むものが一つでもあれば、
 * union 型を K をキーとして含むもののみに絞った型を返す。
 * union の要素の中に K をキーとして含むものが一つも無ければ、`Record<K, unknown>` を返す。
 * 結果には Readonly を付ける。
 */
export type AppendKey<O extends object, K extends PropertyKey> = Readonly<
  NoUnionMemberHasKey<O, K> extends true
    ? O & Record<K, unknown>
    : O extends O // union distribution
    ? K extends keyof O
      ? O
      : never
    : never
>;

export const hasKey2 = <K extends PropertyKey, O extends object>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  obj: O,
  key: K
): obj is AppendKey<O, K> =>
  // eslint-disable-next-line no-restricted-globals, prefer-object-has-own, no-restricted-syntax
  Object.prototype.hasOwnProperty.call(obj, key);
