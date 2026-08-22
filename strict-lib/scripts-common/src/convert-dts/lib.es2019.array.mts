import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2019Array =
  ({
    brandedNumber,
    readonlyModifier,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        // use branded number type in index
        replaceWithNoMatchCheck(
          'index: number',
          `index: ${brandedNumber.ArraySize}`,
        ),
        replaceWithNoMatchCheck(
          'flat<A, D extends number = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];',
          `flat<A, D extends ${brandedNumber.ArraySizeArgNonNegative} = 1>(this: A, depth?: D): ${readonlyModifier}FlatArray<A, D>[];`,
        ),
      ),
    ).value;
