import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2019Array = ({
  brandedNumber,
  readonlyModifier,
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    // Fix incorrect results of eslint fix
    replaceWithNoMatchCheck(
      'readonly readonly readonly readonly readonly readonly readonly readonly readonly readonly',
      '',
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
  );
