import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import type { ConverterOptions } from './common.mjs';
import { convertLibEs2022Sharedmemory } from './lib.es2022.sharedmemory.mjs';

export const convertLibEs2024Sharedmemory =
  (options: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        // `Atomics.waitAsync`, which TS 5.7 moved here from
        // `lib.es2022.sharedmemory.d.ts`.
        convertLibEs2022Sharedmemory(options),
        replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${options.brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          'get maxByteLength(): number;',
          `get maxByteLength(): ${options.brandedNumber.TypedArraySize};`,
        ),
        replaceWithNoMatchCheck(
          'maxByteLength?: number',
          `maxByteLength?: ${options.brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          'newByteLength?: number',
          `newByteLength?: ${options.brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
      ),
    ).value;
