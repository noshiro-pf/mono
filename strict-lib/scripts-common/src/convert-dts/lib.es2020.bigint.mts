import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import {
  arrayIteratorName,
  closeBraceRegexp,
  idFn,
  typedArrayInterfaceStartRegexp,
  typedArrayRef,
  wrapTolerant,
  type ConverterOptions,
} from './common.mjs';
import { convertTypedArrayCommon } from './lib.typed-array-common.mjs';

type ElemType = 'BigInt64' | 'BigUint64';

export const convertLibEs2020Bigint =
  (config: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        convertTypedArrayCommon(config),
        replaceWithNoMatchCheck(
          'minimumIntegerDigits?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;',
          'minimumIntegerDigits?: UintRange<1, 22>;',
        ),
        replaceWithNoMatchCheck(
          'minimumFractionDigits?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;',
          'minimumFractionDigits?: UintRange<0, 21>;',
        ),
        replaceWithNoMatchCheck(
          'maximumFractionDigits?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;',
          'maximumFractionDigits?: UintRange<0, 21>;',
        ),
        replaceWithNoMatchCheck(
          'minimumSignificantDigits?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;',
          'minimumSignificantDigits?: UintRange<1, 22>;',
        ),
        replaceWithNoMatchCheck(
          'maximumSignificantDigits?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;',
          'maximumSignificantDigits?: UintRange<1, 22>;',
        ),
        replaceWithNoMatchCheck(
          'readonly byteOffset: number',
          `readonly byteOffset: ${config.brandedNumber.TypedArraySize}`,
        ),
        replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${config.brandedNumber.TypedArraySize}`,
        ),
        replaceWithNoMatchCheck(
          'byteOffset?: number',
          `byteOffset?: ${config.brandedNumber.TypedArraySizeArgNonNegative}`,
        ),
        replaceWithNoMatchCheck(
          // require predicate function to return boolean
          // TS 5.7 introduced `<TArrayBuffer>` generic; earlier versions omit it.
          new RegExp(
            wrapTolerant(
              String.raw`predicate: \(value: bigint, index: number, array: BigInt64Array(?:<TArrayBuffer>)?\) => unknown`,
            ),
            'gu',
          ),
          `predicate: (value: bigint, index: number, array: ${typedArrayRef('BigInt64Array', config.tsLibShape, 'TArrayBuffer')}) => boolean`,
        ),
        replaceWithNoMatchCheck(
          // require predicate function to return boolean
          new RegExp(
            wrapTolerant(
              String.raw`predicate: \(value: bigint, index: number, array: BigUint64Array(?:<TArrayBuffer>)?\) => unknown`,
            ),
            'gu',
          ),
          `predicate: (value: bigint, index: number, array: ${typedArrayRef('BigUint64Array', config.tsLibShape, 'TArrayBuffer')}) => boolean`,
        ),
        replaceWithNoMatchCheck(
          // BigInt
          'asIntN(bits: number, int: bigint): bigint;',
          'asIntN(bits: UintRange<0, 65>, int: bigint): bigint;',
        ),
        replaceWithNoMatchCheck(
          // BigInt
          'asUintN(bits: number, int: bigint): bigint;',
          'asUintN(bits: UintRange<0, 65>, int: bigint): bigint;',
        ),
        replaceWithNoMatchCheck(
          //
          'radix?: number',
          'radix?: UintRange<2, 37>',
          {
            onNotFound: 'off',
            onNoChange: 'off',
          },
        ),
        replaceWithNoMatchCheck(
          // BigInt64Array / BigUint64Array
          '): number;',
          `): ${config.brandedNumber.TypedArraySearchResult};`,
        ),
        replaceWithNoMatchCheck(
          // TS 5.6+ uses `ArrayIterator`; earlier versions used `IterableIterator`.
          /keys\(\): (?:Array|Iterable)Iterator<number>;/gu,
          `keys(): ${arrayIteratorName(config.tsLibShape)}<${config.brandedNumber.TypedArraySize}>;`,
        ),
        replaceWithNoMatchCheck(
          'fill(value: bigint, start?: number, end?: number): this;',
          `fill(value: bigint, start?: ${config.brandedNumber.TypedArraySizeArg}, end?: ${config.brandedNumber.TypedArraySizeArg}): this;`,
        ),
        replaceWithNoMatchCheck(
          //
          'length?: number',
          `length?: ${config.brandedNumber.TypedArraySize}`,
        ),
        replaceWithNoMatchCheck(
          'BYTES_PER_ELEMENT: number;',
          'BYTES_PER_ELEMENT: 8;',
        ),
        replaceWithNoMatchCheck(
          // DataView
          'getBigInt64(byteOffset: number, littleEndian?: boolean): bigint;',
          `getBigInt64(byteOffset: ${config.brandedNumber.TypedArraySizeArgNonNegative}, littleEndian?: boolean): ${config.brandedNumber.BigInt64};`,
        ),
        replaceWithNoMatchCheck(
          'getBigUint64(byteOffset: number, littleEndian?: boolean): bigint;',
          `getBigUint64(byteOffset: ${config.brandedNumber.TypedArraySizeArgNonNegative}, littleEndian?: boolean): ${config.brandedNumber.BigUint64};`,
        ),
        replaceWithNoMatchCheck(
          'setBigInt64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
          `setBigInt64(byteOffset: ${config.brandedNumber.TypedArraySizeArgNonNegative}, value: ${config.brandedNumber.BigInt64}, littleEndian?: boolean): void;`,
        ),
        replaceWithNoMatchCheck(
          'setBigUint64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
          `setBigUint64(byteOffset: ${config.brandedNumber.TypedArraySizeArgNonNegative}, value: ${config.brandedNumber.BigUint64}, littleEndian?: boolean): void;`,
        ),

        ...(
          ['BigInt64', 'BigUint64'] as const satisfies readonly ElemType[]
        ).flatMap((elemType) => [
          replaceWithNoMatchCheckBetweenRegexp({
            startRegexp: typedArrayInterfaceStartRegexp(`${elemType}Array`),
            endRegexp: closeBraceRegexp,
            mapFn: composeMonoTypeFns(
              replaceWithNoMatchCheck(
                'readonly [index: number]: bigint;',
                '[index: number]: bigint;',
              ),
              config.config.useBrandedNumber
                ? replaceWithNoMatchCheck(
                    `[number, bigint]`,
                    `[${config.brandedNumber.TypedArraySize}, bigint]`,
                  )
                : idFn,
              config.config.useBrandedNumber
                ? replaceWithNoMatchCheck('bigint', elemType)
                : idFn,
              replaceWithNoMatchCheck(
                `index: number,`,
                `index: ${config.brandedNumber.TypedArraySize},`,
              ),
              config.config.useBrandedNumber
                ? replaceWithNoMatchCheck(
                    //
                    `number | ${elemType}`,
                    `number | bigint`,
                  )
                : idFn,
            ),
          }),
          replaceWithNoMatchCheckBetweenRegexp({
            startRegexp: `interface ${elemType}ArrayConstructor {`,
            endRegexp: closeBraceRegexp,
            mapFn: composeMonoTypeFns(
              config.config.useBrandedNumber
                ? replaceWithNoMatchCheck(`bigint`, elemType)
                : idFn,
              replaceWithNoMatchCheck(
                `number`,
                config.brandedNumber.TypedArraySize,
              ),
            ),
          }),
        ]),
      ),
    ).value;
