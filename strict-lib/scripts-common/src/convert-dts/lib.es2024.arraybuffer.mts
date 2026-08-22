import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs2024Arraybuffer =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'get maxByteLength(): number;',
          `get maxByteLength(): ${brandedNumber.TypedArraySize};`,
        ),
        replaceWithNoMatchCheck(
          'newByteLength?: number',
          `newByteLength?: ${brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          'readonly maxByteLength?: number',
          `readonly maxByteLength?: ${brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
      ),
    ).value;
