import { indexType, pipe } from './common.mjs';

const marker = {
  start: 'interface String {',
  end: 'declare const String: StringConstructor;',
};

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_String = (from) => {
  const slice = from.slice(
    from.indexOf(marker.start),
    from.indexOf(marker.end),
  );

  return from.replaceAll(
    slice,
    pipe(slice).chain((str) => {
      for (const line of [
        `new (value?: unknown): String;`,
        `(value?: unknown): string;`,
      ]) {
        str = str.replaceAll(
          line,
          [`  /** @deprecated Don't use String constructor */`, line].join(
            '\n',
          ),
        );
      }
      str = str.replaceAll(
        'charAt(pos: number): string;',
        `charAt(pos: ${indexType.arg}): string;`,
      );
      str = str.replaceAll(
        'charCodeAt(index: number): number;',
        `charCodeAt(index: ${indexType.arg}): number;`,
      );
      str = str.replaceAll(
        'indexOf(searchString: string, position?: number): number;',
        `indexOf(searchString: string, position?:  ${indexType.argNonNegative}): ${indexType.searchResult};`,
      );
      str = str.replaceAll(
        'lastIndexOf(searchString: string, position?: number): number;',
        `lastIndexOf(searchString: string, position?: ${indexType.argNonNegative}): ${indexType.searchResult};`,
      );
      str = str.replaceAll(
        'slice(start?: number, end?: number): string;',
        `slice(start?: ${indexType.arg}, end?: ${indexType.arg}): string;`,
      );
      str = str.replaceAll(
        'split(separator: string | RegExp, limit?: number): readonly string[];',
        `split(separator: string | RegExp, limit?: ${indexType.argNonNegative}): readonly string[];`,
      );
      str = str.replaceAll(
        'substring(start: number, end?: number): string;',
        `substring(start: ${indexType.argNonNegative}, end?: ${indexType.argNonNegative}): string;`,
      );
      str = str.replaceAll(
        'search(regexp: string | RegExp): number;',
        `search(regexp: string | RegExp): ${indexType.searchResult}`,
      );
      return str;
    }).value,
  );
};
