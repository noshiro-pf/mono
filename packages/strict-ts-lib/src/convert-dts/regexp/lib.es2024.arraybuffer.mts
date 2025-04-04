import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-utils';
import { type ConverterOptions } from '../common.mjs';

export const convertLibEs2024Arraybuffer =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
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
    ).value;
