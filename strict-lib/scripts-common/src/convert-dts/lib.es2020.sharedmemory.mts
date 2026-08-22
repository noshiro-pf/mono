import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import {
  idFn,
  typedArrayRef,
  typedArrayRefRegexSource,
  typedArrayUnionRegexSource,
  type ConverterOptions,
} from './common.mjs';

const bigIntArrays = ['BigInt64Array', 'BigUint64Array'] as const;

export const convertLibEs2020Sharedmemory =
  ({
    brandedNumber,
    config: { useBrandedNumber },
    tsLibShape,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        ...(!useBrandedNumber
          ? []
          : [
              //
              ' add',
              ' and',
              ' exchange',
              ' or',
              ' store',
              ' sub',
              ' xor',
            ].map((fnName) =>
              replaceWithNoMatchCheck(
                new RegExp(
                  String.raw`${fnName}\(\s*typedArray:${typedArrayUnionRegexSource(bigIntArrays)},\s*index:\s*number,\s*value:\s*bigint,?\s*\):\s*bigint;`,
                  'gu',
                ),
                (['BigInt64', 'BigUint64'] as const)
                  .map(
                    (elementType) =>
                      `${fnName}(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, value: ${elementType}): ${elementType};`,
                  )
                  .join('\n'),
              ),
            )),

        !useBrandedNumber
          ? idFn
          : replaceWithNoMatchCheck(
              new RegExp(
                String.raw`compareExchange\(\s*typedArray:${typedArrayUnionRegexSource(bigIntArrays)},\s*index:\s*number,\s*expectedValue:\s*bigint,\s*replacementValue:\s*bigint,?\s*\):\s*bigint;`,
                'gu',
              ),
              (['BigInt64', 'BigUint64'] as const)
                .map(
                  (elementType) =>
                    `compareExchange(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, expectedValue: ${elementType}, replacementValue: ${elementType}): ${elementType};`,
                )
                .join('\n'),
            ),

        !useBrandedNumber
          ? idFn
          : replaceWithNoMatchCheck(
              new RegExp(
                String.raw`load\(\s*typedArray:${typedArrayUnionRegexSource(bigIntArrays)},\s*index:\s*number,?\s*\):\s*bigint;`,
                'gu',
              ),
              (['BigInt64', 'BigUint64'] as const)
                .map(
                  (elementType) =>
                    `load(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}): ${elementType};`,
                )
                .join('\n'),
            ),

        replaceWithNoMatchCheck(
          new RegExp(
            String.raw`wait\(\s*typedArray:\s*${typedArrayRefRegexSource('BigInt64Array')},\s*index:\s*number,\s*value:\s*bigint,\s*timeout\?:\s*number,?\s*\)`,
            'gu',
          ),
          `wait(typedArray: ${typedArrayRef('BigInt64Array', tsLibShape)}, index: ${brandedNumber.TypedArraySizeArg}, value: ${brandedNumber.BigInt64}, timeout?: number)`,
        ),

        replaceWithNoMatchCheck(
          new RegExp(
            String.raw`notify\(\s*typedArray:\s*${typedArrayRefRegexSource('BigInt64Array')},\s*index:\s*number,\s*count\?:\s*number,?\s*\):\s*number`,
            'gu',
          ),
          `notify(typedArray: ${typedArrayRef('BigInt64Array', tsLibShape)}, index: ${brandedNumber.TypedArraySizeArg}, count?: ${brandedNumber.SafeUint}): ${brandedNumber.SafeUint}`,
        ),
      ),
    ).value;
