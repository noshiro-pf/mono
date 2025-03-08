import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-utils';
import { idFn, type ConverterOptions } from './common.mjs';

export const convertLibEs2020Sharedmemory =
  ({
    brandedNumber,
    config: { numberType },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      ...(numberType === 'normal'
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
              `${fnName}(typedArray: BigInt64Array<ArrayBufferLike> | BigUint64Array<ArrayBufferLike>, index: number, value: bigint): bigint;`,
              (['BigInt64', 'BigUint64'] as const)
                .map(
                  (elementType) =>
                    `${fnName}(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, value: ${elementType}): ${elementType};`,
                )
                .join('\n'),
            ),
          )),

      numberType === 'normal'
        ? idFn
        : replaceWithNoMatchCheck(
            'compareExchange(typedArray: BigInt64Array<ArrayBufferLike> | BigUint64Array<ArrayBufferLike>, index: number, expectedValue: bigint, replacementValue: bigint): bigint;',
            (['BigInt64', 'BigUint64'] as const)
              .map(
                (elementType) =>
                  `compareExchange(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}, expectedValue: ${elementType}, replacementValue: ${elementType}): ${elementType};`,
              )
              .join('\n'),
          ),

      numberType === 'normal'
        ? idFn
        : replaceWithNoMatchCheck(
            'load(typedArray: BigInt64Array<ArrayBufferLike> | BigUint64Array<ArrayBufferLike>, index: number): bigint;',
            (['BigInt64', 'BigUint64'] as const)
              .map(
                (elementType) =>
                  `load(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}): ${elementType};`,
              )
              .join('\n'),
          ),

      replaceWithNoMatchCheck(
        'wait(typedArray: BigInt64Array<ArrayBufferLike>, index: number, value: bigint, timeout?: number)',
        `wait(typedArray: BigInt64Array<ArrayBufferLike>, index: ${brandedNumber.TypedArraySizeArg}, value: ${brandedNumber.BigInt64}, timeout?: number)`,
      ),

      replaceWithNoMatchCheck(
        'notify(typedArray: BigInt64Array<ArrayBufferLike>, index: number, count?: number): number',
        `notify(typedArray: BigInt64Array<ArrayBufferLike>, index: ${brandedNumber.TypedArraySizeArg}, count?: ${brandedNumber.SafeUint}): ${brandedNumber.SafeUint}`,
      ),
    ).value;
