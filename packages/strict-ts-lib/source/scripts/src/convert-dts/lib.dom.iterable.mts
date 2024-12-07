import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { type ConverterOptions } from './common.mjs';

export const convertLibDomIterable =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      replaceWithNoMatchCheck(
        'entries(): ArrayIterator<readonly [number,',
        `entries(): ArrayIterator<readonly [${brandedNumber.ArraySize},`,
      ),
      replaceWithNoMatchCheck(
        'keys(): ArrayIterator<number>;',
        `keys(): ArrayIterator<${brandedNumber.ArraySize}>;`,
      ),
    ).value;
