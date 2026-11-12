import { Arr, Num, Result } from 'ts-data-forge';

/**
 * One piece of what the page keeps in its query string: how to read it from the
 * parameters and how to write it back.
 *
 * `write` sets only what differs from the default and deletes the rest of the
 * keys it owns, so that a page laid out the usual way has a URL that says
 * nothing about it. `read` forgives: an unknown name or a number out of range
 * is dropped or clamped rather than refused, so that a URL written by an older
 * page or edited by hand still opens.
 *
 * Every codec owns its keys and no other codec writes them; `store/url-store`
 * is the one place that calls `write`.
 */
export type ParamCodec<T> = Readonly<{
  read: (params: URLSearchParams) => T;
  write: (value: T, params: URLSearchParams) => void;
}>;

/**
 * The query string `params` make, `''` for none. `/` is left unescaped, as a
 * reader types `repo=owner/name`; every writer goes through here so that the
 * address bar never flips between two spellings of the same thing.
 */
export const searchOf = (params: URLSearchParams): string => {
  const written = params.toString().replaceAll('%2F', '/');

  return written === '' ? '' : `?${written}`;
};

/**
 * The members of `all` named by `values` — each value a `.`-joined list, and
 * the key possibly repeated — in the order of `all`, once each.
 */
export const readNames = <T extends string>(
  params: URLSearchParams,
  key: string,
  all: readonly T[],
): readonly T[] => {
  const listed = new Set(params.getAll(key).flatMap((v) => v.split('.')));

  return all.filter((name) => listed.has(name));
};

/** The first known name as written under `key`, for a key that takes one. */
export const readFirstName = <T extends string>(
  params: URLSearchParams,
  key: string,
  all: readonly T[],
): T | undefined =>
  params
    .getAll(key)
    .flatMap((v) => v.split('.'))
    .map((written) => all.find((name) => name === written))
    .find((name) => name !== undefined);

/** `names` joined with `.`; none deletes the key. */
export const writeNames = (
  params: URLSearchParams,
  key: string,
  names: readonly string[],
): void => {
  if (Arr.isNonEmpty(names)) {
    params.set(key, names.join('.'));
  } else {
    params.delete(key);
  }
};

/** `1` is on; anything else, or no key, is off. */
export const readFlag = (params: URLSearchParams, key: string): boolean =>
  params.get(key) === '1';

/** On is `1`; off deletes the key. */
export const writeFlag = (
  params: URLSearchParams,
  key: string,
  on: boolean,
): void => {
  if (on) {
    params.set(key, '1');
  } else {
    params.delete(key);
  }
};

/** One of `all`, or `fallback` for anything else. */
export const readChoice = <T extends string>(
  params: URLSearchParams,
  key: string,
  all: readonly T[],
  fallback: T,
): T => {
  const value = params.get(key);

  return all.find((each) => each === value) ?? fallback;
};

/** `value`, unless it is the default, which deletes the key. */
export const writeChoice = <T extends string>(
  params: URLSearchParams,
  key: string,
  value: T,
  fallback: T,
): void => {
  if (value === fallback) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
};

/**
 * A whole number written in decimal, clamped to `[min, max]`; `undefined` for
 * no key or anything else.
 */
export const readInt = (
  params: URLSearchParams,
  key: string,
  min: number,
  max: number,
): number | undefined => {
  const value = params.get(key);

  return value === null || !/^-?\d+$/u.test(value)
    ? undefined
    : Math.min(
        max,
        Math.max(min, Result.unwrapOkOr(Num.safeParseInt(value), Number.NaN)),
      );
};
