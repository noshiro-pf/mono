import type {
  Paths,
  ReadonlyRecord,
  RecordKeyType,
  RecordUpdated,
  RecordValueAtPath,
} from '../types';

export namespace IRecord {
  type ReadonlyRecordBase = Readonly<Record<RecordKeyType, unknown>>;

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

  const UNSAFE_getIn_sub = (
    valueCurr: ReadonlyRecord<string, unknown>,
    keys: readonly string[],
    index: number
  ): unknown =>
    index >= keys.length
      ? valueCurr
      : UNSAFE_getIn_sub(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          valueCurr[keys[index]!] as ReadonlyRecord<string, unknown>,
          keys,
          index + 1
        );

  const UNSAFE_updateIn_sub = (
    valueCurr: ReadonlyRecord<string, unknown>,
    keys: readonly string[],
    index: number,
    updater: (prev: unknown) => unknown
  ): unknown =>
    index >= keys.length
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        updater(valueCurr)
      : {
          ...valueCurr,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [keys[index]!]: UNSAFE_updateIn_sub(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            valueCurr[keys[index]!] as ReadonlyRecord<string, unknown>,
            keys,
            index + 1,
            updater
          ),
        };

  export const getIn = <R extends ReadonlyRecordBase, Path extends Paths<R>>(
    record: R,
    path: Path
  ): RecordValueAtPath<R, Path> =>
    UNSAFE_getIn_sub(record, path as readonly string[], 0) as RecordValueAtPath<
      R,
      Path
    >;

  export const setIn = <R extends ReadonlyRecordBase, Path extends Paths<R>, N>(
    record: R,
    path: Path,
    newValue: N
  ): RecordUpdated<R, Path, N> =>
    UNSAFE_updateIn_sub(
      record,
      path as readonly string[],
      0,
      () => newValue
    ) as RecordUpdated<R, Path, N>;

  export const updateIn = <
    R extends ReadonlyRecordBase,
    Path extends Paths<R>,
    N
  >(
    record: R,
    path: Path,
    updater: (prev: RecordValueAtPath<R, Path>) => N
  ): RecordUpdated<R, Path, N> =>
    UNSAFE_updateIn_sub(
      record,
      path as readonly string[],
      0,
      updater as (prev: unknown) => unknown
    ) as RecordUpdated<R, Path, N>;
}
