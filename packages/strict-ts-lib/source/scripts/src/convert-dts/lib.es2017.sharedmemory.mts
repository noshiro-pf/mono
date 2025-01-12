import { pipe, replaceWithNoMatchCheck } from '@noshiro/node-utils';
import { enumType, type ConverterOptions } from './common.mjs';

export const convertLibEs2017Sharedmemory =
  ({
    config: { useBrandedNumber },
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      replaceWithNoMatchCheck(
        'readonly byteLength: number',
        `readonly byteLength: ${brandedNumber.TypedArraySize}`,
      ),
      replaceWithNoMatchCheck(
        'new (byteLength?: number):',
        `new (byteLength?: ${brandedNumber.TypedArraySizeArgNonNegative}):`,
      ),
      replaceWithNoMatchCheck(
        'slice(begin?: number, end?: number)',
        `slice(begin?: ${brandedNumber.TypedArraySizeArg}, end?: ${brandedNumber.TypedArraySizeArg})`,
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
          `${fnName}(typedArray: ${[
            'Int8Array',
            'Uint8Array',
            'Int16Array',
            'Uint16Array',
            'Int32Array',
            'Uint32Array',
          ]
            .map((t) => `${t}<ArrayBufferLike>`)
            .join(' | ')}, index: number, value: number): number;`,
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
            : [
                ...([enumType.Int8, enumType.Uint8] as const).map(
                  (elementType) =>
                    `${fnName}(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, value: ${elementType}): ${elementType};`,
                ),
                `${fnName}(typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array, index: ${brandedNumber.TypedArraySizeArg}, value: number): number;`,
              ].join('\n'),
        ),
      ),

      replaceWithNoMatchCheck(
        `compareExchange(typedArray: ${[
          'Int8Array',
          'Uint8Array',
          'Int16Array',
          'Uint16Array',
          'Int32Array',
          'Uint32Array',
        ]
          .map((t) => `${t}<ArrayBufferLike>`)
          .join(
            ' | ',
          )}, index: number, expectedValue: number, replacementValue: number): number;`,
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
          : [
              ...([enumType.Int8, enumType.Uint8] as const).map(
                (elementType) =>
                  `compareExchange(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, expectedValue: ${elementType}, replacementValue: ${elementType}): ${elementType};`,
              ),
              `compareExchange(typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array, index: ${brandedNumber.TypedArraySizeArg}, expectedValue: number, replacementValue: number): number;`,
            ].join('\n'),
      ),

      replaceWithNoMatchCheck(
        `load(typedArray: ${[
          'Int8Array',
          'Uint8Array',
          'Int16Array',
          'Uint16Array',
          'Int32Array',
          'Uint32Array',
        ]
          .map((t) => `${t}<ArrayBufferLike>`)
          .join(' | ')}, index: number): number;`,
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
          : [
              ...([enumType.Int8, enumType.Uint8] as const).map(
                (elementType) =>
                  `load(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}): ${elementType};`,
              ),
              `load(typedArray: Int16Array | Uint16Array | Int32Array | Uint32Array, index: ${brandedNumber.TypedArraySizeArg}): number;`,
            ].join('\n'),
      ),

      replaceWithNoMatchCheck(
        'isLockFree(size: number): boolean;',
        `isLockFree(size: ${brandedNumber.TypedArraySizeArgPositive}): boolean;`,
      ),

      replaceWithNoMatchCheck(
        'wait(typedArray: Int32Array<ArrayBufferLike>, index: number, value: number, timeout?: number)',
        `wait(typedArray: Int32Array<ArrayBufferLike>, index: ${brandedNumber.TypedArraySizeArg}, value: ${brandedNumber.Int32}, timeout?: number)`,
      ),

      replaceWithNoMatchCheck(
        'notify(typedArray: Int32Array<ArrayBufferLike>, index: number, count?: number): number',
        `notify(typedArray: Int32Array<ArrayBufferLike>, index: ${brandedNumber.TypedArraySizeArg}, count?: ${brandedNumber.SafeUint}): ${brandedNumber.SafeUint}`,
      ),
    ).value;
