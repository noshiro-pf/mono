import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-utils';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2019Array =
  ({
    brandedNumber,
    readonlyModifier,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      // Fix incorrect results of eslint fix
      replaceWithNoMatchCheck(
        'readonly readonly readonly readonly readonly readonly readonly readonly readonly readonly [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]',
        '(readonly [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])[Depth]',
      ),
      // use branded number type in index
      replaceWithNoMatchCheck(
        'index: number',
        `index: ${brandedNumber.ArraySize}`,
      ),
      replaceWithNoMatchCheck(
        'flat<A, D extends number = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];',
        `flat<A, D extends ${brandedNumber.ArraySizeArgNonNegative} = 1>(this: A, depth?: D): ${readonlyModifier}FlatArray<A, D>[];`,
      ),
    ).value;
