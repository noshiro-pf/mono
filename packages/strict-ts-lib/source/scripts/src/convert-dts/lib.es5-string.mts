import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp, converterOptions } from './common.mjs';

const { returnType } = converterOptions;

export const convertLibEs5_String = (source: string): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface String {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              `readonly length: number;`,
              `readonly length: ${NumberType.StringSize};`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'charAt(pos: number): string;',
              `charAt(pos: ${NumberType.StringSizeArg}): string;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'charCodeAt(index: number): number;',
              `charCodeAt(index: ${NumberType.StringSizeArg}): number;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'indexOf(searchString: string, position?: number): number;',
              `indexOf(searchString: string, position?: ${NumberType.StringSizeArgNonNegative}): ${NumberType.StringSearchResult};`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'lastIndexOf(searchString: string, position?: number): number;',
              `lastIndexOf(searchString: string, position?: ${NumberType.StringSizeArgNonNegative}): ${NumberType.StringSearchResult};`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'slice(start?: number, end?: number): string;',
              `slice(start?: ${NumberType.StringSizeArg}, end?: ${NumberType.StringSizeArg}): string;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `split(separator: string | RegExp, limit?: number): readonly string[];`,
              `split(separator: string | RegExp, limit?: ${NumberType.StringSizeArgNonNegative}): ${returnType === 'readonly' ? 'readonly ' : ''}string[];`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'substring(start: number, end?: number): string;',
              `substring(start: ${NumberType.StringSizeArgNonNegative}, end?: ${NumberType.StringSizeArgNonNegative}): string;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'search(regexp: string | RegExp): number;',
              `search(regexp: string | RegExp): ${NumberType.StringSearchResult};`,
            ),
          ).value,
    }),
  ).value;
