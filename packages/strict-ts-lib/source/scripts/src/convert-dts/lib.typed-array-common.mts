import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { NumberType } from './common.mjs';

export const convertTypedArrayCommon = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        'copyWithin(target: number, start: number, end?: number): this;',
        `copyWithin(target: ${NumberType.TypedArraySizeArg}, start: ${NumberType.TypedArraySizeArg}, end?: ${NumberType.TypedArraySizeArg}): this;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'subarray(begin?: number, end?: number)',
        `subarray(begin?: ${NumberType.TypedArraySizeArg}, end?: ${NumberType.TypedArraySizeArg})`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'slice(start?: number, end?: number)',
        `slice(start?: ${NumberType.TypedArraySizeArg}, end?: ${NumberType.TypedArraySizeArg})`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'offset?: number',
        `offset?: ${NumberType.TypedArraySizeArgNonNegative}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `fromIndex?: number`,
        `fromIndex?: ${NumberType.TypedArraySizeArg}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'currentIndex: number',
        `currentIndex: ${NumberType.TypedArraySize}`,
      ),
    ).value;
