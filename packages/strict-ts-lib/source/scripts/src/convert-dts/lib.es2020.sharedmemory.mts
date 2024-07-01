import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';
import { idFn, type ConverterOptions } from './common.mjs';

export const convertLibEs2020Sharedmemory = ({
  brandedNumber,
  config: { useBrandedNumber },
}: ConverterOptions): MonoTypeFunction<string> =>
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
            `${fnName}(typedArray: BigInt64Array | BigUint64Array, index: number, value: bigint): bigint;`,
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
          'compareExchange(typedArray: BigInt64Array | BigUint64Array, index: number, expectedValue: bigint, replacementValue: bigint): bigint;',
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
          'load(typedArray: BigInt64Array | BigUint64Array, index: number): bigint;',
          (['BigInt64', 'BigUint64'] as const)
            .map(
              (elementType) =>
                `load(typedArray: ${elementType}Array, index: ${brandedNumber.TypedArraySizeArg}): ${elementType};`,
            )
            .join('\n'),
        ),

    replaceWithNoMatchCheck(
      'wait(typedArray: BigInt64Array, index: number, value: bigint, timeout?: number)',
      `wait(typedArray: BigInt64Array, index: ${brandedNumber.TypedArraySizeArg}, value: ${brandedNumber.BigInt64}, timeout?: number)`,
    ),

    replaceWithNoMatchCheck(
      'notify(typedArray: BigInt64Array, index: number, count?: number): number',
      `notify(typedArray: BigInt64Array, index: ${brandedNumber.TypedArraySizeArg}, count?: ${brandedNumber.SafeUint}): ${brandedNumber.SafeUint}`,
    ),
  );
