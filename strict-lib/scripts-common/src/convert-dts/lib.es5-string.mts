import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';
import { convertStringReplacerArgs } from './convert-string-replacer-args.mjs';

export const convertLibEs5_String =
  ({
    readonlyModifier,
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'String',
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              'readonly length: number;',
              `readonly length: ${brandedNumber.StringSize};`,
            ),
            replaceWithNoMatchCheck(
              'charAt(pos: number): string;',
              `charAt(pos: ${brandedNumber.StringSizeArg}): string;`,
            ),
            replaceWithNoMatchCheck(
              'charCodeAt(index: number): number;',
              `charCodeAt(index: ${brandedNumber.StringSizeArg}): number;`,
            ),
            replaceWithNoMatchCheck(
              'indexOf(searchString: string, position?: number): number;',
              `indexOf(searchString: string, position?: ${brandedNumber.StringSizeArgNonNegative}): ${brandedNumber.StringSearchResult};`,
            ),
            replaceWithNoMatchCheck(
              'lastIndexOf(searchString: string, position?: number): number;',
              `lastIndexOf(searchString: string, position?: ${brandedNumber.StringSizeArgNonNegative}): ${brandedNumber.StringSearchResult};`,
            ),
            replaceWithNoMatchCheck(
              'slice(start?: number, end?: number): string;',
              `slice(start?: ${brandedNumber.StringSizeArg}, end?: ${brandedNumber.StringSizeArg}): string;`,
            ),
            replaceWithNoMatchCheck(
              'split(separator: string | RegExp, limit?: number): readonly string[];',
              `split(separator: string | RegExp, limit?: ${brandedNumber.StringSizeArgNonNegative}): ${readonlyModifier}string[];`,
            ),
            replaceWithNoMatchCheck(
              'substring(start: number, end?: number): string;',
              `substring(start: ${brandedNumber.StringSizeArgNonNegative}, end?: ${brandedNumber.StringSizeArgNonNegative}): string;`,
            ),
            replaceWithNoMatchCheck(
              'substr(from: number, length?: number): string;',
              `substr(from: ${brandedNumber.StringSizeArgNonNegative}, length?: ${brandedNumber.StringSizeArgNonNegative}): string;`,
            ),
            replaceWithNoMatchCheck(
              'search(regexp: string | RegExp): number;',
              `search(regexp: string | RegExp): ${brandedNumber.StringSearchResult};`,
            ),
            convertStringReplacerArgs,
          ),
        }),
      ),
    ).value;
