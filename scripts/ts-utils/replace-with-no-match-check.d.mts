/* eslint-disable @typescript-eslint/no-shadow */
/**
 * Replace all instances of a substring in a string, using a regular expression or search string.
 * @param {string | RegExp} searchValue  A string to search for.
 * @param {string} replaceValue A string containing the text to replace for every successful match of searchValue in this string.
 * @param {(
 *    {
 *      searchValue,
 *      replaceValue,
 *      target,
 *      result
 *    }: Readonly<{
 *      searchValue: string | RegExp,
 *      replaceValue: string,
 *      target: string,
 *      result: string
 *    }>) => boolean
 * } notFoundChecker A function to Check if the replacement was successful. Default is `target === result`.
 *
 * @throws {Error} If no match is found.
 * @returns {(target: string) => string}
 */
export declare const replaceWithNoMatchCheck: (
  searchValue: RegExp | string,
  replaceValue: string,
  notFoundChecker?: ({
    searchValue,
    replaceValue,
    target,
    result,
  }: Readonly<{
    searchValue: RegExp | string;
    replaceValue: string;
    target: string;
    result: string;
  }>) => boolean,
) => (target: string) => string;
