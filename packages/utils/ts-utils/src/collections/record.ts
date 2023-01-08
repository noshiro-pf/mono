export namespace IRecord {
  export const get = <R extends ReadonlyRecordBase, K extends keyof R>(
    record: R,
    key: K
  ): R[K] => record[key];

  export const set = <R extends ReadonlyRecordBase, K extends keyof R>(
    record: R,
    key: K,
    newValue: R[K]
  ): R => ({ ...record, [key]: newValue });

  export const update = <R extends ReadonlyRecordBase, K extends keyof R>(
    record: R,
    key: K,
    updater: (prev: R[K]) => R[K]
  ): R => ({ ...record, [key]: updater(record[key]) });

  const UNSAFE_getIn_impl = (
    obj: ReadonlyRecordBase,
    keyPath: readonly (number | string)[],
    index: number
  ): unknown =>
    index >= keyPath.length
      ? obj
      : UNSAFE_getIn_impl(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          obj[keyPath[index]!] as ReadonlyRecordBase,
          keyPath,
          index + 1
        );

  export const getIn = <R extends ReadonlyRecordBase, Path extends Paths<R>>(
    record: R,
    keyPath: Path
  ): RecordValueAtPath<R, Path> =>
    UNSAFE_getIn_impl(
      record,
      keyPath as readonly string[],
      0
    ) as RecordValueAtPath<R, Path>;

  const UNSAFE_updateIn_impl = (
    obj: ReadonlyRecordBase,
    keyPath: readonly (number | string)[],
    index: number,
    updater: (prev: unknown) => unknown
  ): unknown =>
    index >= keyPath.length
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        updater(obj)
      : // eslint-disable-next-line no-restricted-globals
      Array.isArray(obj)
      ? obj.map((v, i): unknown =>
          i === keyPath[index]
            ? UNSAFE_updateIn_impl(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                obj[keyPath[index]!] as ReadonlyRecordBase,
                keyPath,
                index + 1,
                updater
              )
            : v
        )
      : {
          ...obj,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [keyPath[index]!]: UNSAFE_updateIn_impl(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            obj[keyPath[index]!] as ReadonlyRecordBase,
            keyPath,
            index + 1,
            updater
          ),
        };

  export const setIn = <R extends ReadonlyRecordBase>(
    record: R,
    ...[keyPath, newValue]: KeyPathAndValueTypeAtPathTuple<R>
  ): R =>
    UNSAFE_updateIn_impl(
      record,
      keyPath as readonly string[],
      0,
      () => newValue
    ) as R;

  export const updateIn = <R extends ReadonlyRecordBase, Path extends Paths<R>>(
    record: R,
    keyPath: IsUnion<Path> extends true ? never : Path,
    updater: IsUnion<Path> extends true
      ? never
      : (prev: RecordValueAtPath<R, Path>) => RecordValueAtPath<R, Path>
  ): R =>
    UNSAFE_updateIn_impl(
      record,
      keyPath as readonly string[],
      0,
      updater as (prev: unknown) => unknown
    ) as R;

  export const removeProperties = <
    R extends ReadonlyRecordBase,
    K extends keyof R
  >(
    record: R,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    keys: readonly K[]
  ): Readonly<{
    [Key in StrictExclude<keyof R, K>]: R[Key];
  }> => {
    // eslint-disable-next-line no-restricted-globals
    const keysSet = new Set<keyof R>(keys);
    return fromEntries(
      entries(record).filter(([k, _v]) => !keysSet.has(k))
    ) as never;
  };

  /**
   * Merge `record1` and `record2` with `...`.
   *
   * If `record1` and `record2` share some properties,
   * `record2` value have priority.
   */
  export const merge = <
    R1 extends ReadonlyRecordBase,
    R2 extends ReadonlyRecordBase
  >(
    record1: R1,
    record2: R2
  ): Readonly<{
    [Key in keyof R1 | keyof R2]: Key extends keyof R2
      ? R2[Key]
      : Key extends keyof R1
      ? R1[Key]
      : never;
  }> => ({ ...record1, ...record2 } as never);

  /**
   * `Object.keys` の返り値型を改善したもの。
   * `o: R` であるとして、
   * `Object.keys(o)` は `string[]` を返すが
   * `RecordUtil.keys(o)` は `(keyof typeof o)[]` を返す。
   * ただし、 number が key に含まれる場合は `Object.keys` のランタイム挙動に併せて文字列化する。
   *
   * @example
   * ```ts
   * const keys1 = Object.keys({ x: 1, y: 2, z: '3', 3: 4 }); // string[]
   * const keys2 = RecordUtil.keys({ x: 1, y: 2, z: '3', 3: 4 }); // ('3' | 'x' | 'y' | 'z')[]
   * ```
   */
  export const keys = <R extends ReadonlyRecordBase>(
    object: R
  ): ToObjectKeysValue<keyof R>[] =>
    // eslint-disable-next-line no-restricted-globals
    Object.keys(object) as ToObjectKeysValue<keyof R>[];

  export const values = <K extends PropertyKey, V>(
    object: ReadonlyRecord<K, V>
    // eslint-disable-next-line no-restricted-globals
  ): readonly V[] => Object.values(object);

  /**
   * `Object.fromEntries` の返り値型を改善したもの。
   * `entries: Iterable<readonly [K, V]>` であるとして、
   * `Object.fromEntries(entries)` は `Record<string, V>` を返すが、
   * `RecordUtil.fromEntries(entries)` は `Readonly<Record<K, V>>` を返す。
   *
   * @example
   * ```ts
   * const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] = [
   *   ['x', 1],
   *   ['y', 2],
   *   ['z', 3],
   *   [4, 3],
   * ] as const;
   *
   * const obj1 = Object.fromEntries(entries); // Record<string, 1 | 2 | 3>
   * const obj2 = RecordUtil.fromEntries(entries); // Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>
   * ```
   */
  export const fromEntries = <K extends PropertyKey, V>(
    entries_: Iterable<readonly [K, V]>
  ): ReadonlyRecord<K, V> =>
    // eslint-disable-next-line no-restricted-globals
    Object.fromEntries(entries_) as ReadonlyRecord<K, V>;

  /**
   * `Object.entries` の返り値型を改善したもの。
   * `Object.entries(obj)` はキー部を string として返すが、
   * `RecordUtil.entries(obj)` はキーと値のペアを維持して entries を返す。
   *
   * @example
   * ```ts
   * const entries = IRecord.entries({
   *   x: 1,
   *   y: 2,
   *   z: 2,
   *   3: 4,
   * } as const);
   *
   * const entries1 = Object.entries(obj); // [string, 1 | 2 | 4]
   * const entries2 = RecordUtil.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]
   * ```
   */
  export const entries = <R extends ReadonlyRecordBase>(
    object: R
    // eslint-disable-next-line no-restricted-globals
  ): Entries<R> => Object.entries(object) as Entries<R>;

  /**
   * @internal
   */
  export type Entries<R extends ReadonlyRecordBase> = R extends R
    ? readonly {
        readonly [K in keyof R]: readonly [
          ToObjectKeysValue<keyof PickByValue<R, R[K]>>,
          R[K]
        ];
        // eslint-disable-next-line @typescript-eslint/ban-types
      }[RelaxedExclude<keyof R, symbol>][]
    : never;

  export function hasKey<R extends ReadonlyRecordBase, K extends keyof R>(
    rec: R,
    key: K
  ): rec is R & ReadonlyRecord<K, R[K]>;

  export function hasKey<R extends ReadonlyRecordBase, K extends PropertyKey>(
    rec: R,
    key: K
  ): rec is R & ReadonlyRecord<K, R[K]>;

  export function hasKey<R extends ReadonlyRecordBase, K extends PropertyKey>(
    rec: R,
    key: K
  ): rec is R & ReadonlyRecord<K, R[K]> {
    // eslint-disable-next-line no-restricted-globals, prefer-object-has-own
    return Object.prototype.hasOwnProperty.call(rec, key);
  }

  export function hasKeyValue<
    R extends ReadonlyRecordBase,
    K extends keyof R,
    V extends R[K]
  >(
    rec: R,
    key: K,
    valueChecker: (v: R[K]) => v is V
  ): rec is R & ReadonlyRecord<K, V>;

  export function hasKeyValue<
    R extends ReadonlyRecordBase,
    K extends PropertyKey,
    V extends R[K]
  >(
    rec: R,
    key: K,
    valueChecker: (v: R[K]) => v is V
  ): rec is R & ReadonlyRecord<K, V>;

  export function hasKeyValue<
    R extends ReadonlyRecordBase,
    K extends PropertyKey,
    V extends R[K]
  >(
    rec: R,
    key: K,
    valueChecker: (v: R[K]) => v is V
  ): rec is R & ReadonlyRecord<K, V> {
    return hasKey(rec, key) && valueChecker(rec[key]);
  }
}

/**
 * @internal
 */
type ToObjectKeysValue<A> = A extends string
  ? A
  : A extends number
  ? `${A}`
  : never;

/**
 * @internal
 */
type PickByValue<R, V> = Pick<
  R,
  {
    [K in keyof R]: R[K] extends V ? K : never;
  }[keyof R]
>;
