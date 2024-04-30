import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { NumberType } from './common.mjs';

export const convertLibEs2022Sharedmemory = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        `waitAsync(typedArray: Int32Array, index: number, value: number`,
        `waitAsync(typedArray: Int32Array, index: ${NumberType.TypedArraySizeArgNonNegative}, value: Int32`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `waitAsync(typedArray: BigInt64Array, index: number, value: bigint`,
        `waitAsync(typedArray: BigInt64Array, index: ${NumberType.TypedArraySizeArgNonNegative}, value: BigInt64`,
      ),
    ).value;
