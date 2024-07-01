import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';
import { type ConverterOptions } from './common.mjs';

export const convertLibDomIterable = ({
  brandedNumber,
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    replaceWithNoMatchCheck(
      'entries(): IterableIterator<readonly [number,',
      `entries(): IterableIterator<readonly [${brandedNumber.ArraySize},`,
    ),
    replaceWithNoMatchCheck(
      'keys(): IterableIterator<number>;',
      `keys(): IterableIterator<${brandedNumber.ArraySize}>;`,
    ),
  );
