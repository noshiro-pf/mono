import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2022Sharedmemory =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          `waitAsync(typedArray: Int32Array, index: number, value: number`,
          `waitAsync(typedArray: Int32Array, index: ${brandedNumber.TypedArraySizeArgNonNegative}, value: ${brandedNumber.Int32}`,
        ),

        replaceWithNoMatchCheck(
          `waitAsync(typedArray: BigInt64Array, index: number, value: bigint`,
          `waitAsync(typedArray: BigInt64Array, index: ${brandedNumber.TypedArraySizeArgNonNegative}, value: ${brandedNumber.BigInt64}`,
        ),
      ),
    ).value;
