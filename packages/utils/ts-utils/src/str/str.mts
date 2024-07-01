// eslint-disable-next-line import/no-internal-modules
import { Result } from '../functional/result.mjs';

const cmp = (x: string, y: string): number => x.localeCompare(y);

const cmpR = (x: string, y: string): number => cmp(y, x);

const subMatch = (
  target: string,
  key: string,
  ignoreCase: boolean = false,
): boolean =>
  ignoreCase
    ? subMatch(target.toUpperCase(), key.toUpperCase())
    : target.includes(key);

// eslint-disable-next-line no-restricted-syntax
const from: (v: unknown) => string = String;

/**
 * Converts all alphabetic characters to lowercase, taking into account the host
 * environment's current locale.
 */
const toLocaleLowerCase =
  (locales?: string | readonly string[]) =>
  (str: string): Result<string, RangeError | TypeError> => {
    try {
      return Result.ok(str.toLocaleLowerCase(locales));
    } catch (error) {
      // eslint-disable-next-line no-restricted-syntax
      return Result.err(error as RangeError | TypeError);
    }
  };

/**
 * Returns a string where all alphabetic characters have been converted to
 * uppercase, taking into account the host environment's current locale.
 */
const toLocaleUpperCase =
  (locales?: string | readonly string[]) =>
  (str: string): Result<string, RangeError | TypeError> => {
    try {
      return Result.ok(str.toLocaleUpperCase(locales));
    } catch (error) {
      // eslint-disable-next-line no-restricted-syntax
      return Result.err(error as RangeError | TypeError);
    }
  };

/**
 * Returns a String value that is made from count copies appended together. If
 * count is 0, the empty string is returned.
 *
 * @param count Number of copies to append
 */
const repeat =
  (count: SafeUint) =>
  (str: string): Result<string, string> => {
    try {
      return Result.ok(str.repeat(count));
    } catch (error) {
      return Result.err(from(error));
    }
  };

export const Str = {
  cmp,
  cmpR,
  subMatch,
  from,
  toLocaleLowerCase,
  toLocaleUpperCase,
  repeat,
} as const;
