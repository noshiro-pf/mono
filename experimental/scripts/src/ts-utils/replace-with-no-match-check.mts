import { toSafeUint } from './cast-brand.mjs';

/**
 * Replace all instances of a substring in a string, using a regular expression
 * or search string.
 *
 * @example
 *   ```ts
 *   const replace = replaceWithNoMatchCheck(/apple/g, 'orange');
 *   const result = replace('I have an apple and a banana.'); // 'I have an orange and a banana.'
 *   ```;
 *
 * @param searchValue A regular expression or string to search for.
 * @param replaceValue A string containing the text to replace for every
 *   successful match of searchValue in the input string.
 * @param options Options controlling behavior when no matches or no changes
 *   occur.
 * @param options.onNotFound Specifies the action to take when searchValue is
 *   not found.
 *
 *   - 'off': No action; returns the original string.
 *   - 'warn': Logs a warning message; returns the original string.
 *   - 'throw': Throws an error; this is the default behavior.
 *
 * @param options.onNoChange Specifies the action to take when replacement has
 *   no effect.
 *
 *   - If `onNotFound` is 'off', this option will have no effect. replacement will
 *       be skipped if `searchValue` is not found, regardless of `onNoChange`
 *       setting.
 *   - 'off': No action; returns the original string.
 *   - 'warn': Logs a warning message; returns the original string.
 *   - 'throw': Throws an error; this is the default behavior except when
 *       `onNotFound` is 'off'.
 *
 * @returns A function that takes a string and returns the string with
 *   replacements applied.
 * @throws {Error} If no match is found and `options.onNotFound` is 'throw' (or
 *   omitted).
 * @throws {Error} If replacement has no effect and `options.onNoChange` is
 *   'throw' (or omitted, except when `onNotFound` is 'off').
 */
export const replaceWithNoMatchCheck =
  (
    searchValue: RegExp | string,
    replaceValue: string,
    options?: Readonly<
      // 検索文字列がそもそも見つからない場合には置換はスキップされるため、
      // onNotFound（検索文字列が見つからない）であっても throw/warn しない場合には
      // onNoChange（置換結果に変化が無い）でより強いエラーは出さない。
      | {
          onNotFound: 'off';
          onNoChange?: 'off';
        }
      | {
          onNotFound: 'warn';
          onNoChange?: 'off' | 'warn';
        }
      | {
          onNotFound: 'throw';
          onNoChange?: 'off' | 'throw' | 'warn';
        }
    >,
  ): ((target: string) => string) =>
  (target) => {
    if (
      typeof searchValue === 'string'
        ? !target.includes(searchValue)
        : target.search(searchValue) < 0
    ) {
      const msg = `No match found for "${chopIfLong(searchValue)}" in "${chopIfLong(
        target,
      )}".`;

      switch (options?.onNotFound) {
        case undefined:
        case 'throw':
          throw new Error(msg);

        case 'warn':
          console.warn(msg);
          return target;

        case 'off':
          return target;
      }
    }

    const result =
      searchValue === replaceValue
        ? target
        : target.replaceAll(searchValue, replaceValue);

    if (target === result) {
      const msg =
        searchValue === replaceValue
          ? `searchValue is equal to replaceValue: "${replaceValue}".`
          : `Replacing had no effect. (searchValue = "${chopIfLong(searchValue)}"; target = "${chopIfLong(
              target,
            )}".`;

      switch (options?.onNoChange) {
        case 'throw':
          throw new Error(msg);

        case 'warn':
          console.warn(msg);
          return target;

        case undefined:
        case 'off':
          return target;
      }
    }

    return result;
  };

const sliceMaxLength = toSafeUint(100);

const chopIfLong = (str: RegExp | string): string =>
  typeof str === 'string'
    ? str.length > sliceMaxLength
      ? `${str.slice(0, sliceMaxLength)} ...(and more)`
      : str
    : str.source;
