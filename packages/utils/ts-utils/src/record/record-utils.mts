import { Uint32 } from '../num/index.mjs';

const get = <const R extends UnknownRecord, const K extends keyof R>(
  record: R,
  key: K,
): R[K] => record[key];

const set = <const R extends UnknownRecord, const K extends keyof R>(
  record: R,
  key: K,
  newValue: R[K],
): R => ({ ...record, [key]: newValue });

const update = <const R extends UnknownRecord, const K extends keyof R>(
  record: R,
  key: K,
  updater: (prev: R[K]) => R[K],
): R => ({ ...record, [key]: updater(record[key]) });

const UNSAFE_getIn_impl = (
  obj: UnknownRecord,
  keyPath: readonly (number | string)[],
  index: NumberType.ArraySizeArgNonNegative,
): unknown =>
  index >= keyPath.length
    ? obj
    : UNSAFE_getIn_impl(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, total-functions/no-unsafe-type-assertion
        obj[keyPath[index]!] as UnknownRecord,
        keyPath,
        Uint32.add(index, 1),
      );

const getIn = <const R extends UnknownRecord, const Path extends Paths<R>>(
  record: R,
  keyPath: Path,
): RecordValueAtPath<R, Path> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  UNSAFE_getIn_impl(
    record,
    keyPath as readonly string[],
    0,
  ) as RecordValueAtPath<R, Path>;

const UNSAFE_updateIn_impl = (
  obj: UnknownRecord,
  keyPath: readonly (number | string)[],
  index: NumberType.ArraySizeArgNonNegative,
  updater: (prev: unknown) => unknown,
): unknown =>
  index >= keyPath.length
    ? updater(obj)
    : Array.isArray(obj)
      ? obj.map((v, i): unknown =>
          i === keyPath[index]
            ? UNSAFE_updateIn_impl(
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                obj[keyPath[index]] as UnknownRecord,
                keyPath,
                Uint32.add(index, 1),
                updater,
              )
            : v,
        )
      : {
          ...obj,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [keyPath[index]!]: UNSAFE_updateIn_impl(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, total-functions/no-unsafe-type-assertion
            obj[keyPath[index]!] as UnknownRecord,
            keyPath,
            Uint32.add(index, 1),
            updater,
          ),
        };

const setIn = <const R extends UnknownRecord>(
  record: R,
  ...[keyPath, newValue]: KeyPathAndValueTypeAtPathTuple<R>
): R =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  UNSAFE_updateIn_impl(
    record,
    keyPath as readonly string[],
    0,
    () => newValue,
  ) as R;

const updateIn = <const R extends UnknownRecord, const Path extends Paths<R>>(
  record: R,
  keyPath: IsUnion<Path> extends true ? never : Path,
  updater: IsUnion<Path> extends true
    ? never
    : (prev: RecordValueAtPath<R, Path>) => RecordValueAtPath<R, Path>,
): R =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  UNSAFE_updateIn_impl(
    record,
    keyPath as readonly string[],
    0,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    updater as (prev: unknown) => unknown,
  ) as R;

const pick = <
  const R extends UnknownRecord,
  const Keys extends readonly (keyof R)[],
>(
  record: R,
  keys: Keys,
): Pick<R, ArrayElement<Keys>> => {
  // eslint-disable-next-line no-restricted-globals
  const keysSet = new Set<keyof R>(keys);
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Object.fromEntries(
    Object.entries(record).filter(([k, _v]) => keysSet.has(k)),
  ) as Pick<R, ArrayElement<Keys>>;
};

const omit = <
  const R extends UnknownRecord,
  const Keys extends readonly (keyof R)[],
>(
  record: R,
  keys: Keys,
): Omit<R, ArrayElement<Keys>> => {
  // eslint-disable-next-line no-restricted-globals
  const keysSet = new Set<keyof R>(keys);
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Object.fromEntries(
    Object.entries(record).filter(([k, _v]) => !keysSet.has(k)),
  ) as Omit<R, ArrayElement<Keys>>;
};

/**
 * Merge `record1` and `record2` with `...`.
 *
 * If `record1` and `record2` share some properties, `record2` value have
 * priority.
 */
const merge = <const R1 extends UnknownRecord, const R2 extends UnknownRecord>(
  record1: R1,
  record2: R2,
): Readonly<{
  [Key in keyof R1 | keyof R2]: Key extends keyof R2
    ? R2[Key]
    : Key extends keyof R1
      ? R1[Key]
      : never;
}> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  ({ ...record1, ...record2 }) as any;

function hasKeyValue<
  const R extends UnknownRecord,
  const K extends keyof R,
  const V extends R[K],
>(rec: R, key: K, valueChecker: (v: R[K]) => v is V): rec is R & Record<K, V>;

function hasKeyValue<
  const R extends UnknownRecord,
  const K extends PropertyKey,
  const V extends R[keyof R],
>(
  rec: R,
  key: K,
  valueChecker: (v: R[keyof R]) => v is V,
): rec is R & Record<K, V>;

function hasKeyValue<
  const R extends UnknownRecord,
  const K extends PropertyKey,
  const V extends R[keyof R],
>(
  rec: R,
  key: K,
  valueChecker: (v: R[keyof R]) => v is V,
): rec is R & Record<K, V> {
  return (
    Object.hasOwn(rec, key) &&
    valueChecker(
      rec[
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        key as keyof R
      ],
    )
  );
}

export const RecordUtils = {
  get,
  set,
  update,
  getIn,
  setIn,
  updateIn,
  pick,
  omit,
  merge,
  hasKeyValue,
} as const;

export const Obj = RecordUtils;
