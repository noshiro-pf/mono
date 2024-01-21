/**
 * Replace all instances of a substring in a string, using a regular expression
 * or search string.
 *
 * @param {string | RegExp} searchValue A string to search for.
 * @param {string} replaceValue A string containing the text to replace for
 *   every successful match of searchValue in this string.
 * @param {({
 *   searchValue,
 *   replaceValue,
 *   target,
 *   result,
 * }: Readonly<{
 *   searchValue: string | RegExp;
 *   replaceValue: string;
 *   target: string;
 *   result: string;
 * }>) => boolean} [notFoundChecker]
 *   A function to Check if the replacement was successful. Default is `target ===
 *   result`.
 * @returns {(target: string) => string}
 * @throws {Error} If no match is found.
 */
export const replaceWithNoMatchCheck =
  (searchValue, replaceValue, notFoundChecker) => (target) => {
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

/**
 * @param {string | RegExp} str
 * @returns {string}
 */
const chopIfLong = (str) =>
  typeof str === 'string'
    ? str.length > sliceMaxLength
      ? `${str.slice(0, sliceMaxLength)} ...(and more)`
      : str
    : str.source;
