/**
 * Replace all instances of a substring in a string, using a regular expression
 * or search string.
 *
 * @param searchValue A string to search for.
 * @param replaceValue A string containing the text to replace for every
 *   successful match of searchValue in this string.
 * @param options Options. The default value is `{ throwOnNotFound: true,
 *   throwOnNoChange: true }`
 * @throws {Error} If no match is found.
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
          onNotFound: 'throw';
          onNoChange?: 'off' | 'throw' | 'warn';
        }
      | {
          onNotFound: 'warn';
          onNoChange?: 'off' | 'warn';
        }
    >,
  ): ((target: string) => string) =>
  (target) => {
    if (searchValue === replaceValue) {
      const msg = `searchValue is equal to replaceValue: "${replaceValue}".`;

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

    const result = target.replaceAll(searchValue, replaceValue);

    if (target === result) {
      const msg = `Replacing had no effect. (searchValue = "${chopIfLong(searchValue)}"; target = "${chopIfLong(
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

const sliceMaxLength = 100;

const chopIfLong = (str: RegExp | string): string =>
  typeof str === 'string'
    ? str.length > sliceMaxLength
      ? `${str.slice(0, sliceMaxLength)} ...(and more)`
      : str
    : str.source;
