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
      'entries(): ArrayIterator<readonly [number,',
      `entries(): ArrayIterator<readonly [${brandedNumber.ArraySize},`,
    ),
    replaceWithNoMatchCheck(
      'keys(): ArrayIterator<number>;',
      `keys(): ArrayIterator<${brandedNumber.ArraySize}>;`,
    ),
  );
