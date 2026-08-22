import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { arrayIteratorName, type ConverterOptions } from './common.mjs';

export const convertLibDomIterable =
  ({ brandedNumber, tsLibShape }: ConverterOptions): MonoTypeFunction<string> =>
  (src) => {
    const ai = arrayIteratorName(tsLibShape);

    return pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          // TS 5.6+ uses `ArrayIterator`; earlier versions used
          // `IterableIterator`. The `readonly` is optional because TS 6.0's
          // consolidated `lib.dom.d.ts` carries the mutable-tuple form
          // (`<[number,`) that the 5.x `lib.dom.iterable.d.ts` already made
          // readonly upstream; we always emit the readonly branded form.
          /entries\(\): (?:Array|Iterable)Iterator<(?:readonly )?\[number,/gu,
          `entries(): ${ai}<readonly [${brandedNumber.ArraySize},`,
          // Tolerant so this converter can also run over the consolidated
          // `lib.dom.d.ts` (TS 6.0 folded `lib.dom.iterable` into it). The 5.x
          // `lib.dom.d.ts` has no such signatures, so it stays a no-op there.
          { onNotFound: 'off' },
        ),
        replaceWithNoMatchCheck(
          /keys\(\): (?:Array|Iterable)Iterator<number>;/gu,
          `keys(): ${ai}<${brandedNumber.ArraySize}>;`,
          { onNotFound: 'off' },
        ),
      ),
    ).value;
  };
