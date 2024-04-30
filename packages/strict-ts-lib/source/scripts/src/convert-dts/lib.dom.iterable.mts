import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { NumberType } from './common.mjs';

export const convertLibDomIterable = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        'entries(): IterableIterator<readonly [number,',
        `entries(): IterableIterator<readonly [${NumberType.ArraySize},`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'keys(): IterableIterator<number>;',
        `keys(): IterableIterator<${NumberType.ArraySize}>;`,
      ),
    ).value;
