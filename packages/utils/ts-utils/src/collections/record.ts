import { IList } from './list';

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
      : IList.isArray(obj)
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

  export const keys = <R extends ReadonlyRecordBase>(
    object: R
  ): ToObjectKeysValue<keyof R>[] =>
    // eslint-disable-next-line no-restricted-globals
    Object.keys(object) as ToObjectKeysValue<keyof R>[];

  export const values = <K extends PropertyKey, V>(
    object: ReadonlyRecord<K, V>
    // eslint-disable-next-line no-restricted-globals
  ): V[] => Object.values(object);

  export const fromEntries = <K extends PropertyKey, V>(
    entries_: Iterable<readonly [K, V]>
    // eslint-disable-next-line no-restricted-globals
  ): Record<K, V> => Object.fromEntries(entries_) as Record<K, V>;

  export const entries = <R extends ReadonlyRecordBase>(
    object: R
    // eslint-disable-next-line no-restricted-globals
  ): Entries<R> => Object.entries(object) as Entries<R>;

  /* @internal */
  export type Entries<R extends ReadonlyRecordBase> = R extends R
    ? {
        [K in keyof R]: [ToObjectKeysValue<keyof PickByValue<R, R[K]>>, R[K]];
        // eslint-disable-next-line @typescript-eslint/ban-types
      }[RelaxedExclude<keyof R, symbol>][]
    : never;
}

type ToObjectKeysValue<A> = A extends string
  ? A
  : A extends number
  ? `${A}`
  : never;

type PickByValue<R, V> = Pick<
  R,
  {
    [K in keyof R]: R[K] extends V ? K : never;
  }[keyof R]
>;
