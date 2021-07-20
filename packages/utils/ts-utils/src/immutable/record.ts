import type {
  IsUnion,
  KeyPathAndValueTypeAtPathTuple,
  Paths,
  ReadonlyRecordBase,
  RecordValueAtPath,
} from '../types';

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
}
