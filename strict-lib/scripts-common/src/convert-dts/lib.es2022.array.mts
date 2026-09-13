import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { enumType, type ConverterOptions } from './common.mjs';

export const convertLibEs2022Array =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'Array',
          mapFn: replaceWithNoMatchCheck(
            'at(index: number): T | undefined;',
            `at(index: ${brandedNumber.ArraySizeArg}): T | undefined;`,
          ),
        }),

        replaceWithinInterface({
          name: 'ReadonlyArray',
          mapFn: replaceWithNoMatchCheck(
            'at(index: number): T | undefined;',
            `at(index: ${brandedNumber.ArraySizeArg}): T | undefined`,
          ),
        }),

        ...(
          [
            ['Int8Array', 'number', enumType.Int8],
            ['Uint8Array', 'number', enumType.Uint8],
            ['Uint8ClampedArray', 'number', enumType.Uint8],
            ['Int16Array', 'number', brandedNumber.Int16],
            ['Uint16Array', 'number', brandedNumber.Uint16],
            ['Int32Array', 'number', brandedNumber.Int32],
            ['Uint32Array', 'number', brandedNumber.Uint32],
            ['Float32Array', 'number', brandedNumber.Float32],
            ['Float64Array', 'number', brandedNumber.Float64],
            ['BigInt64Array', 'bigint', brandedNumber.BigInt64],
            ['BigUint64Array', 'bigint', brandedNumber.BigUint64],
          ] as const
        ).map(([typeName, returnTypeBefore, returnTypeAfter]) =>
          replaceWithinInterface({
            name: typeName,
            mapFn: replaceWithNoMatchCheck(
              `at(index: number): ${returnTypeBefore} | undefined;`,
              `at(index: ${brandedNumber.TypedArraySizeArg}): ${returnTypeAfter} | undefined;`,
            ),
          }),
        ),
      ),
    ).value;
