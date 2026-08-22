import { Arr, pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import {
  enumType,
  typedArrayRef,
  typedArrayRefRegexSource,
  typedArrayUnionRegexSource,
  type ConverterOptions,
} from './common.mjs';

const atomicsTypedArrays = [
  'Int8Array',
  'Uint8Array',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
] as const;

export const convertLibEs2017Sharedmemory =
  ({
    config: { useBrandedNumber },
    brandedNumber,
    tsLibShape,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'readonly byteLength: number',
          `readonly byteLength: ${brandedNumber.TypedArraySize}`,
        ),
        replaceWithNoMatchCheck(
          // TS 5.7 made `byteLength` optional; earlier versions had it
          // required. Preserve the original `?` via capture group.
          /new \((byteLength\??): number\):/gu,
          `new ($1: ${brandedNumber.TypedArraySizeArgNonNegative}):`,
        ),
        replaceWithNoMatchCheck(
          // TS 5.7 made `begin` optional; earlier versions had it required.
          /slice\((begin\??): number, end\?: number\)/gu,
          `slice($1: ${brandedNumber.TypedArraySizeArg}, end?: ${brandedNumber.TypedArraySizeArg})`,
        ),

        ...[
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
              String.raw`${fnName}\(\s*typedArray:${typedArrayUnionRegexSource(atomicsTypedArrays)},\s*index:\s*number,\s*value:\s*number,?\s*\):\s*number;`,
              'gu',
            ),
            useBrandedNumber
              ? (
                  [
                    enumType.Int8,
                    enumType.Uint8,
                    brandedNumber.Int16,
                    brandedNumber.Uint16,
                    brandedNumber.Int32,
                    brandedNumber.Uint32,
                  ] as const
                )
                  .map(
                    (elementType) =>
                      `${fnName}(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, value: ${elementType}): ${elementType};`,
                  )
                  .join('\n')
              : Arr.toPushed(
                  ([enumType.Int8, enumType.Uint8] as const).map(
                    (elementType) =>
                      `${fnName}(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, value: ${elementType}): ${elementType};`,
                  ),
                  `${fnName}(typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array, index: ${brandedNumber.TypedArraySizeArg}, value: number): number;`,
                ).join('\n'),
          ),
        ),

        replaceWithNoMatchCheck(
          new RegExp(
            String.raw`compareExchange\(\s*typedArray:${typedArrayUnionRegexSource(atomicsTypedArrays)},\s*index:\s*number,\s*expectedValue:\s*number,\s*replacementValue:\s*number,?\s*\):\s*number;`,
            'gu',
          ),
          useBrandedNumber
            ? (
                [
                  enumType.Int8,
                  enumType.Uint8,
                  brandedNumber.Int16,
                  brandedNumber.Uint16,
                  brandedNumber.Int32,
                  brandedNumber.Uint32,
                ] as const
              )
                .map(
                  (elementType) =>
                    `compareExchange(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, expectedValue: ${elementType}, replacementValue: ${elementType}): ${elementType};`,
                )
                .join('\n')
            : Arr.toPushed(
                ([enumType.Int8, enumType.Uint8] as const).map(
                  (elementType) =>
                    `compareExchange(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, expectedValue: ${elementType}, replacementValue: ${elementType}): ${elementType};`,
                ),
                `compareExchange(typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array, index: ${brandedNumber.TypedArraySizeArg}, expectedValue: number, replacementValue: number): number;`,
              ).join('\n'),
        ),

        replaceWithNoMatchCheck(
          new RegExp(
            String.raw`load\(\s*typedArray:${typedArrayUnionRegexSource(atomicsTypedArrays)},\s*index:\s*number,?\s*\):\s*number;`,
            'gu',
          ),
          useBrandedNumber
            ? (
                [
                  enumType.Int8,
                  enumType.Uint8,
                  brandedNumber.Int16,
                  brandedNumber.Uint16,
                  brandedNumber.Int32,
                  brandedNumber.Uint32,
                ] as const
              )
                .map(
                  (elementType) =>
                    `load(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}): ${elementType};`,
                )
                .join('\n')
            : Arr.toPushed(
                ([enumType.Int8, enumType.Uint8] as const).map(
                  (elementType) =>
                    `load(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}): ${elementType};`,
                ),
                `load(typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array, index: ${brandedNumber.TypedArraySizeArg}): number;`,
              ).join('\n'),
        ),

        replaceWithNoMatchCheck(
          'isLockFree(size: number): boolean;',
          `isLockFree(size: ${brandedNumber.TypedArraySizeArgPositive}): boolean;`,
        ),

        replaceWithNoMatchCheck(
          new RegExp(
            String.raw`wait\(\s*typedArray:\s*${typedArrayRefRegexSource('Int32Array')},\s*index:\s*number,\s*value:\s*number,\s*timeout\?:\s*number,?\s*\)`,
            'gu',
          ),
          `wait(typedArray: ${typedArrayRef('Int32Array', tsLibShape)}, index: ${brandedNumber.TypedArraySizeArg}, value: ${brandedNumber.Int32}, timeout?: number)`,
        ),

        replaceWithNoMatchCheck(
          new RegExp(
            String.raw`notify\(\s*typedArray:\s*${typedArrayRefRegexSource('Int32Array')},\s*index:\s*number,\s*count\?:\s*number,?\s*\):\s*number`,
            'gu',
          ),
          `notify(typedArray: ${typedArrayRef('Int32Array', tsLibShape)}, index: ${brandedNumber.TypedArraySizeArg}, count?: ${brandedNumber.SafeUint}): ${brandedNumber.SafeUint}`,
        ),
      ),
    ).value;
