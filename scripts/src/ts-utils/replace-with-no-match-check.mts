/**
 * Replace all instances of a substring in a string, using a regular expression
 * or search string.
 *
 * @param searchValue A string to search for.
 * @param replaceValue A string containing the text to replace for every
 *   successful match of searchValue in this string.
 *
 *   A function to Check if the replacement was successful. Default is `target ===
 *   result`.
 * @throws {Error} If no match is found.
 */
export const replaceWithNoMatchCheck =
  (
    searchValue: RegExp | string,
    replaceValue: string,
    notFoundChecker?: (
      args: Readonly<{
        searchValue: RegExp | string;
        replaceValue: string;
        target: string;
        result: string;
      }>,
    ) => boolean,
  ): ((target: string) => string) =>
  (target) => {
    if (searchValue === replaceValue) {
      throw new Error('searchValue is equal to replaceValue');
    }

    const result = target.replaceAll(searchValue, replaceValue);

    if (
      notFoundChecker?.({
        replaceValue,
        result,
        searchValue,
        target,
      }) ??
      target === result
    ) {
      throw new Error(
        `No match found for "${chopIfLong(searchValue)}" in "${chopIfLong(
          target,
        )}".`,
      );
    }

    return result;
  };

const sliceMaxLength = 100;

const chopIfLong = (str: RegExp | string): string =>
  typeof str === 'string'
    ? str.length > sliceMaxLength
      ? `${str.slice(0, sliceMaxLength)} ...(and more)`
      : str
    : str.source;
