import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2024Sharedmemory =
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
        replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          'get maxByteLength(): number;',
          `get maxByteLength(): ${brandedNumber.TypedArraySize};`,
        ),
        replaceWithNoMatchCheck(
          'maxByteLength?: number',
          `maxByteLength?: ${brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          'newByteLength?: number',
          `newByteLength?: ${brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
      ),
    ).value;
