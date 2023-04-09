// eslint-disable-next-line import/no-internal-modules
import { Result } from '../functional/result';
import { Num } from '../num';

const cmp = (x: string, y: string): number => x.localeCompare(y);

const cmpR = (x: string, y: string): number => cmp(y, x);

const toNumber: (numberLike: string) => number | undefined = Num.parseFloat;

const subMatch = (
  target: string,
  key: string,
  ignoreCase: boolean = false
): boolean =>
  ignoreCase
    ? subMatch(target.toUpperCase(), key.toUpperCase())
    : target.includes(key);

// eslint-disable-next-line no-restricted-globals
const from: (v: unknown) => string = String;

/* static methods of String */

/**
 * Return the String value whose elements are, in order, the elements in the List elements.
 * If length is 0, the empty string is returned.
 */
const fromCodePoint = (...codePoints: readonly number[]): string =>
  // eslint-disable-next-line no-restricted-globals
  String.fromCodePoint(...codePoints);

/**
 * String.raw is usually used as a tag function of a Tagged Template String. When called as
 * such, the first argument will be a well formed template call site object and the rest
 * parameter will contain the substitution values. It can also be called directly, for example,
 * to interleave strings and values from your own tag function, and in this case the only thing
 * it needs from the first argument is the raw property.
 * @param template A well-formed template string call site representation.
 * @param substitutions A set of substitution values.
 */
const raw = (
  template: Readonly<{ raw: Readonly<ArrayLike<string>> | readonly string[] }>,
  ...substitutions: readonly never[]
): // eslint-disable-next-line no-restricted-globals
string => String.raw(template, ...substitutions);

/* methods for instances */

/** Returns the length of a String object. */
const len = (str: string): number => str.length;

/**
 * Takes an integer value and returns the item at that index,
 * allowing for positive and negative integers.
 * Negative integers count back from the last item in the array.
 */
const at =
  (index: number) =>
  (str: string): string | undefined =>
    str.at(index);

/**
 * Returns the character at the specified index.
 * @param pos The zero-based index of the desired character.
 * @deprecated Prefer `String#at(…)` over `String#charAt(…)`. eslint(unicorn/prefer-at)
 */
const charAt =
  (pos: number) =>
  (str: string): string | undefined =>
    // eslint-disable-next-line unicorn/prefer-at
    str.charAt(pos);

/**
 * Returns a string that contains the concatenation of two or more strings.
 * @param strings The strings to append to the end of the string.
 * @deprecated Prefer the spread operator over `Array#concat(…)`. eslint(unicorn/prefer-spread)
 */
const concat =
  (...strings: readonly string[]) =>
  (str: string): string =>
    // eslint-disable-next-line unicorn/prefer-spread
    str.concat(...strings);

/**
 * Returns the position of the first occurrence of a substring.
 * @param searchString The substring to search for in the string
 * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
 */
const indexOf =
  (searchString: string, position?: number) =>
  (str: string): number =>
    str.indexOf(searchString, position);

/**
 * Returns the last occurrence of a substring in the string.
 * @param searchString The substring to search for.
 * @param position The index at which to begin searching. If omitted, the search begins at the end of the string.
 */
const lastIndexOf =
  (searchString: string, position?: number) =>
  (str: string): number =>
    str.lastIndexOf(searchString, position);

/**
 * Determines whether two strings are equivalent in the current or specified locale.
 * @param that String to compare to target string
 * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used. This parameter must conform to BCP 47 standards; see the Intl.Collator object for details.
 * @param options An object that contains one or more properties that specify comparison options. see the Intl.Collator object for details.
 */
const localeCompare = (
  x: string,
  y: string,
  locales?: string | readonly string[],
  options?: Intl.CollatorOptions
): number => x.localeCompare(y, locales, options);

/**
 * Matches a string with a regular expression, and returns an array containing the results of that search.
 * @param regexp A variable name or string literal containing the regular expression pattern and flags.
 */
const match =
  (regexp: DeepReadonly<RegExp> | string) =>
  (str: string): RegExpMatchArray | null =>
    str.match(regexp);

/**
 * Replaces text in a string, using a regular expression or search string.
 * @param searchValue A string to search for.
 * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
 */
const replace =
  (searchValue: DeepReadonly<RegExp> | string, replaceValue: string) =>
  (str: string): string =>
    str.replace(searchValue, replaceValue);

/**
 * Replaces text in a string, using a regular expression or search string.
 * @param searchValue A string to search for.
 * @param replacer A function that returns the replacement text.
 */
const replaceWithFn =
  (
    searchValue: DeepReadonly<RegExp> | string,
    replacer: (substr: string, ...args: readonly never[]) => string
  ) =>
  (str: string): string =>
    str.replace(searchValue, replacer);

/**
 * Finds the first substring match in a regular expression search.
 * @param regexp The regular expression pattern and applicable flags.
 */
const search =
  (regexp: DeepReadonly<RegExp> | string) =>
  (str: string): number =>
    str.search(regexp);

/**
 * Returns a section of a string.
 * @param start The index to the beginning of the specified portion of stringObj.
 * @param end The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end.
 * If this value is not specified, the substring continues to the end of stringObj.
 */
const slice =
  (start?: number, end?: number) =>
  (str: string): string =>
    str.slice(start, end);

/**
 * Split a string into substrings using the specified separator and return them as an array.
 * @param separator A string that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned.
 * @param limit A value used to limit the number of elements returned in the array.
 */
const split =
  (separator: DeepReadonly<RegExp> | string, limit?: number) =>
  (str: string): readonly string[] =>
    str.split(separator, limit);

/**
 * Returns the substring at the specified location within a String object.
 * @param start The zero-based index number indicating the beginning of the substring.
 * @param end Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end.
 * If end is omitted, the characters from start through the end of the original string are returned.
 */
const substring =
  (start: number, end?: number) =>
  (str: string): string =>
    str.slice(start, end);

/** Converts all the alphabetic characters in a string to lowercase. */
const toLowerCase = (str: string): string => str.toLowerCase();

/** Converts all alphabetic characters to lowercase, taking into account the host environment's current locale. */
const toLocaleLowerCase =
  (locales?: string | readonly string[]) =>
  (str: string): Result<string, RangeError | TypeError> => {
    try {
      return Result.ok(str.toLocaleLowerCase(locales));
    } catch (error) {
      return Result.err(error as RangeError | TypeError);
    }
  };

/** Converts all the alphabetic characters in a string to uppercase. */
const toUpperCase = (str: string): string => str.toUpperCase();

/** Returns a string where all alphabetic characters have been converted to uppercase, taking into account the host environment's current locale. */
const toLocaleUpperCase =
  (locales?: string | readonly string[]) =>
  (str: string): Result<string, RangeError | TypeError> => {
    try {
      return Result.ok(str.toLocaleUpperCase(locales));
    } catch (error) {
      return Result.err(error as RangeError | TypeError);
    }
  };

/** Removes the leading and trailing white space and line terminator characters from a string. */
const trim = (str: string): string => str.trim();

/**
 * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point
 * value of the UTF-16 encoded code point starting at the string element at position pos in
 * the String resulting from converting this object to a String.
 * If there is no element at that position, the result is undefined.
 * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
 */
const codePointAt =
  (pos: number) =>
  (str: string): number | undefined =>
    str.codePointAt(pos);

/**
 * Returns true if searchString appears as a substring of the result of converting this
 * object to a String, at one or more positions that are
 * greater than or equal to position; otherwise, returns false.
 * @param searchString search string
 * @param position If position is undefined, 0 is assumed, so as to search all of the String.
 */
const includes =
  (searchString: string, position?: number) =>
  (str: string): boolean =>
    str.includes(searchString, position);

/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * endPosition – length(this). Otherwise returns false.
 */
const endsWith =
  (searchString: string, endPosition?: number) =>
  (str: string): boolean =>
    str.endsWith(searchString, endPosition);

/**
 * Returns the String value result of normalizing the string into the normalization form
 * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
 * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
 * is "NFC"
 */
const normalize =
  (form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD') =>
  (str: string): string =>
    str.normalize(form);

/**
 * Returns a String value that is made from count copies appended together. If count is 0,
 * the empty string is returned.
 * @param count number of copies to append
 */
const repeat =
  (count: number) =>
  (str: string): Result<string, string> => {
    try {
      return Result.ok(str.repeat(count));
    } catch (error) {
      return Result.err(from(error));
    }
  };

/**
 * Returns true if the sequence of elements of searchString converted to a String is the
 * same as the corresponding elements of this object (converted to a String) starting at
 * position. Otherwise returns false.
 */
const startsWith =
  (searchString: string, position?: number) =>
  (str: string): boolean =>
    str.startsWith(searchString, position);

/** Removes the trailing white space and line terminator characters from a string. */
const trimEnd = (str: string): string => str.trimEnd();

/** Removes the leading white space and line terminator characters from a string. */
const trimStart = (str: string): string => str.trimStart();

/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the start (left) of the current string.
 *
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
//  padStart(maxLength: number, fillString?: string): string;

/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the end (right) of the current string.
 *
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
const padEnd =
  (maxLength: number, fillString?: string) =>
  (str: string): string =>
    str.padEnd(maxLength, fillString);

/**
 * Matches a string with a regular expression, and returns an iterable of matches
 * containing the results of that search.
 * @param regexp A variable name or string literal containing the regular expression pattern and flags.
 */
const matchAll =
  (regexp: DeepReadonly<RegExp>) =>
  (str: string): IterableIterator<RegExpMatchArray> =>
    str.matchAll(regexp);

/**
 * Replace all instances of a substring in a string, using a regular expression or search string.
 * @param searchValue A string to search for.
 * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
 */
const replaceAll =
  (searchValue: DeepReadonly<RegExp> | string, replaceValue: string) =>
  (str: string): string =>
    str.replaceAll(searchValue, replaceValue);

/**
 * Replace all instances of a substring in a string, using a regular expression or search string.
 * @param searchValue A string to search for.
 * @param replacer A function that returns the replacement text.
 */
const replaceAllWithFn =
  (
    searchValue: DeepReadonly<RegExp> | string,
    replacer: (substr: string, ...args: readonly unknown[]) => string
  ) =>
  (str: string): string =>
    str.replaceAll(searchValue, replacer);

export const Str = {
  cmp,
  cmpR,
  toNumber,
  subMatch,
  from,
  fromCodePoint,
  raw,
  len,
  at,
  charAt,
  concat,
  indexOf,
  lastIndexOf,
  localeCompare,
  match,
  replace,
  replaceWithFn,
  search,
  slice,
  split,
  substring,
  toLowerCase,
  toLocaleLowerCase,
  toUpperCase,
  toLocaleUpperCase,
  trim,
  codePointAt,
  includes,
  endsWith,
  normalize,
  repeat,
  startsWith,
  trimEnd,
  trimStart,
  padEnd,
  matchAll,
  replaceAll,
  replaceAllWithFn,
} as const;
