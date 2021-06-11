import type {
  Paths,
  ReadonlyRecordBase,
  RecordUpdated,
  RecordValueAtPath,
} from '../types';

export namespace IRecord {
  export const get = <R extends ReadonlyRecordBase, K extends keyof R>(
    record: R,
    key: K
  ): R[K] => record[key];

  export const set = <R extends ReadonlyRecordBase, K extends keyof R, N>(
    record: R,
    key: K,
    newValue: N
  ): {
    readonly [Key in keyof R]: Key extends K ? N : R[Key];
  } =>
    ({
      ...record,
      [key]: newValue,
    } as {
      readonly [Key in keyof R]: Key extends K ? N : R[Key];
    });

  export const update = <R extends ReadonlyRecordBase, K extends keyof R, N>(
    record: R,
    key: K,
    updater: (prev: R[K]) => N
  ): {
    readonly [Key in keyof R]: Key extends K ? N : R[Key];
  } =>
    ({
      ...record,
      [key]: updater(record[key]),
    } as {
      readonly [Key in keyof R]: Key extends K ? N : R[Key];
    });

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

  const UNSAFE_updateIn_impl = (
    obj: ReadonlyRecordBase,
    keyPath: readonly (number | string)[],
    index: number,
    updater: (prev: unknown) => unknown
  ): unknown =>
    index >= keyPath.length
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        updater(obj)
      : Array.isArray(obj)
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

  export const getIn = <R extends ReadonlyRecordBase, Path extends Paths<R>>(
    record: R,
    keyPath: Path
  ): RecordValueAtPath<R, Path> =>
    UNSAFE_getIn_impl(
      record,
      keyPath as readonly string[],
      0
    ) as RecordValueAtPath<R, Path>;

  export const setIn = <R extends ReadonlyRecordBase, Path extends Paths<R>, N>(
    record: R,
    keyPath: Path,
    newValue: N
  ): RecordUpdated<R, Path, N> =>
    UNSAFE_updateIn_impl(
      record,
      keyPath as readonly string[],
      0,
      () => newValue
    ) as RecordUpdated<R, Path, N>;

  export const updateIn = <
    R extends ReadonlyRecordBase,
    Path extends Paths<R>,
    N
  >(
    record: R,
    keyPath: Path,
    updater: (prev: RecordValueAtPath<R, Path>) => N
  ): RecordUpdated<R, Path, N> =>
    UNSAFE_updateIn_impl(
      record,
      keyPath as readonly string[],
      0,
      updater as (prev: unknown) => unknown
    ) as RecordUpdated<R, Path, N>;
}
