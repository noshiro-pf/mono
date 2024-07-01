import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { indexType } from './common.mjs';

const marker = {
  start: 'interface String {',
  end: 'declare const String: StringConstructor;',
};

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_String = (from) => {
  const slice = from.slice(
    from.indexOf(marker.start),
    from.indexOf(marker.end),
  );

  return pipe(from).chain(
    replaceWithNoMatchCheck(
      slice,
      pipe(slice).chain((str) => {
        let mut_str = str;

        for (const line of [
          `new (value?: unknown): String;`,
          `(value?: unknown): string;`,
        ]) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              line,
              [`  /** @deprecated Don't use String constructor */`, line].join(
                '\n',
              ),
            ),
          ).value;
        }
        mut_str = pipe(mut_str)
          .chain(
            replaceWithNoMatchCheck(
              'charAt(pos: number): string;',
              `charAt(pos: ${indexType.arg}): string;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'charCodeAt(index: number): number;',
              `charCodeAt(index: ${indexType.arg}): number;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'indexOf(searchString: string, position?: number): number;',
              `indexOf(searchString: string, position?:  ${indexType.argNonNegative}): ${indexType.searchResult};`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'lastIndexOf(searchString: string, position?: number): number;',
              `lastIndexOf(searchString: string, position?: ${indexType.argNonNegative}): ${indexType.searchResult};`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'slice(start?: number, end?: number): string;',
              `slice(start?: ${indexType.arg}, end?: ${indexType.arg}): string;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'split(separator: string | RegExp, limit?: number): readonly string[];',
              `split(separator: string | RegExp, limit?: ${indexType.argNonNegative}): readonly string[];`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'substring(start: number, end?: number): string;',
              `substring(start: ${indexType.argNonNegative}, end?: ${indexType.argNonNegative}): string;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'search(regexp: string | RegExp): number;',
              `search(regexp: string | RegExp): ${indexType.searchResult}`,
            ),
          ).value;

        return mut_str;
      }).value,
    ),
  ).value;
};
