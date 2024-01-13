import { SafeUint } from '../num';

const get = <R extends RecordBase, K extends keyof R>(
  record: R,
  key: K,
): R[K] => record[key];

const set = <R extends RecordBase, K extends keyof R>(
  record: R,
  key: K,
  newValue: R[K],
): R => ({ ...record, [key]: newValue });

const update = <R extends RecordBase, K extends keyof R>(
  record: R,
  key: K,
  updater: (prev: R[K]) => R[K],
): R => ({ ...record, [key]: updater(record[key]) });

const UNSAFE_getIn_impl = (
  obj: RecordBase,
  keyPath: readonly (number | string)[],
  index: SafeUintWithSmallInt,
): unknown =>
  index >= keyPath.length
    ? obj
    : UNSAFE_getIn_impl(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-restricted-syntax
        obj[keyPath[index]!] as RecordBase,
        keyPath,
        SafeUint.add(index, 1),
      );

const getIn = <R extends RecordBase, Path extends Paths<R>>(
  record: R,
  keyPath: Path,
): RecordValueAtPath<R, Path> =>
  // eslint-disable-next-line no-restricted-syntax
  UNSAFE_getIn_impl(
    record,
    // eslint-disable-next-line no-restricted-syntax
    keyPath as readonly string[],
    0,
  ) as RecordValueAtPath<R, Path>;

const UNSAFE_updateIn_impl = (
  obj: RecordBase,
  keyPath: readonly (number | string)[],
  index: SafeUintWithSmallInt,
  updater: (prev: unknown) => unknown,
): unknown =>
  index >= keyPath.length
    ? updater(obj)
    : Array.isArray(obj)
      ? obj.map((v, i): unknown =>
          i === keyPath[index]
            ? UNSAFE_updateIn_impl(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-restricted-syntax
                obj[keyPath[index]!] as RecordBase,
                keyPath,
                SafeUint.add(index, 1),
                updater,
              )
            : v,
        )
      : {
          ...obj,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [keyPath[index]!]: UNSAFE_updateIn_impl(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-restricted-syntax
            obj[keyPath[index]!] as RecordBase,
            keyPath,
            SafeUint.add(index, 1),
            updater,
          ),
        };

const setIn = <R extends RecordBase>(
  record: R,
  ...[keyPath, newValue]: KeyPathAndValueTypeAtPathTuple<R>
): R =>
  // eslint-disable-next-line no-restricted-syntax
  UNSAFE_updateIn_impl(
    record,
    // eslint-disable-next-line no-restricted-syntax
    keyPath as readonly string[],
    0,
    () => newValue,
  ) as R;

const updateIn = <R extends RecordBase, Path extends Paths<R>>(
  record: R,
  keyPath: IsUnion<Path> extends true ? never : Path,
  updater: IsUnion<Path> extends true
    ? never
    : (prev: RecordValueAtPath<R, Path>) => RecordValueAtPath<R, Path>,
): R =>
  // eslint-disable-next-line no-restricted-syntax
  UNSAFE_updateIn_impl(
    record,
    // eslint-disable-next-line no-restricted-syntax
    keyPath as readonly string[],
    0,
    // eslint-disable-next-line no-restricted-syntax
    updater as (prev: unknown) => unknown,
  ) as R;

const removeProperties = <R extends RecordBase, K extends keyof R>(
  record: R,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  keys: readonly K[],
): Readonly<{
  [Key in Exclude<keyof R, K>]: R[Key];
}> => {
  // eslint-disable-next-line no-restricted-globals
  const keysSet = new Set<keyof R>(keys);
  // eslint-disable-next-line no-restricted-syntax
  return Object.fromEntries(
    Object.entries(record).filter(([k, _v]) => !keysSet.has(k)),
  ) as never;
};

/**
 * Merge `record1` and `record2` with `...`.
 *
 * If `record1` and `record2` share some properties,
 * `record2` value have priority.
 */
const merge = <R1 extends RecordBase, R2 extends RecordBase>(
  record1: R1,
  record2: R2,
): Readonly<{
  [Key in keyof R1 | keyof R2]: Key extends keyof R2
    ? R2[Key]
    : Key extends keyof R1
      ? R1[Key]
      : never;
  // eslint-disable-next-line no-restricted-syntax
}> => ({ ...record1, ...record2 }) as never;

function hasKeyValue<R extends RecordBase, K extends keyof R, V extends R[K]>(
  rec: R,
  key: K,
  valueChecker: (v: R[K]) => v is V,
): rec is R & Record<K, V>;

function hasKeyValue<
  R extends RecordBase,
  K extends PropertyKey,
  V extends R[K],
>(rec: R, key: K, valueChecker: (v: R[K]) => v is V): rec is R & Record<K, V>;

function hasKeyValue<
  R extends RecordBase,
  K extends PropertyKey,
  V extends R[K],
>(rec: R, key: K, valueChecker: (v: R[K]) => v is V): rec is R & Record<K, V> {
  return Object.hasOwn(rec, key) && valueChecker(rec[key]);
}

export const RecordUtils = {
  get,
  set,
  update,
  getIn,
  setIn,
  updateIn,
  removeProperties,
  merge,
  hasKeyValue,
} as const;

export const Obj = RecordUtils;
