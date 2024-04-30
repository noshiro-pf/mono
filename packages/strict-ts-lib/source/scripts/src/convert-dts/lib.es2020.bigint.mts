import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp } from './common.mjs';
import { convertTypedArrayCommon } from './lib.typed-array-common.mjs';

type ElemType = 'BigInt64' | 'BigUint64';

export const convertLibEs2020Bigint = (source: string): string =>
  pipe(source)
    .chain(convertTypedArrayCommon)
    .chain(
      replaceWithNoMatchCheck(
        'readonly byteOffset: number',
        `readonly byteOffset: ${NumberType.TypedArraySize}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly byteLength: number',
        `readonly byteLength: ${NumberType.TypedArraySize}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'byteOffset?: number',
        `byteOffset?: ${NumberType.TypedArraySizeArgNonNegative}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // require predicate function to return boolean
        'predicate: (value: bigint, index: number, array: BigInt64Array) => unknown',
        'predicate: (value: bigint, index: number, array: BigInt64Array) => boolean',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // require predicate function to return boolean
        'predicate: (value: bigint, index: number, array: BigUint64Array) => unknown',
        'predicate: (value: bigint, index: number, array: BigUint64Array) => boolean',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // BigInt
        'asIntN(bits: number, int: bigint): bigint;',
        'asIntN(bits: UintRange<0, 65>, int: bigint): bigint;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // BigInt
        'asUintN(bits: number, int: bigint): bigint;',
        'asUintN(bits: UintRange<0, 65>, int: bigint): bigint;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'radix?: number',
        'radix?: UintRange<2, 37>',
        () => false,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // BigInt64Array / BigUint64Array
        '): number;',
        `): ${NumberType.TypedArraySearchResult};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'keys(): IterableIterator<number>;',
        `keys(): IterableIterator<${NumberType.TypedArraySize}>;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'fill(value: bigint, start?: number, end?: number): this;',
        `fill(value: bigint, start?: ${NumberType.TypedArraySizeArg}, end?: ${NumberType.TypedArraySizeArg}): this;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        //
        'length?: number',
        `length?: ${NumberType.TypedArraySize}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly BYTES_PER_ELEMENT: number;',
        'readonly BYTES_PER_ELEMENT: 8;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // DataView
        'getBigInt64(byteOffset: number, littleEndian?: boolean): bigint;',
        `getBigInt64(byteOffset: ${NumberType.SafeUint}, littleEndian?: boolean): BigInt64;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'getBigUint64(byteOffset: number, littleEndian?: boolean): bigint;',
        `getBigUint64(byteOffset: ${NumberType.SafeUint}, littleEndian?: boolean): BigUint64;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'setBigInt64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
        `setBigInt64(byteOffset: ${NumberType.SafeUint}, value: BigInt64, littleEndian?: boolean): void;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'setBigUint64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
        `setBigUint64(byteOffset: ${NumberType.SafeUint}, value: BigUint64, littleEndian?: boolean): void;`,
      ),
    )
    .chainMonoTypeFns(
      (
        ['BigInt64', 'BigUint64'] as const satisfies readonly ElemType[]
      ).flatMap((elemType) => [
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${elemType}Array {`,
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(replaceWithNoMatchCheck(`bigint`, elemType))
              .chain(
                replaceWithNoMatchCheck(
                  `index: number`,
                  `index: ${NumberType.TypedArraySize}`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `[number, ${elemType}]`,
                  `[${NumberType.TypedArraySize}, ${elemType}]`,
                ),
              )
              .chain(
                replaceWithNoMatchCheck(
                  `number | ${elemType}`,
                  `number | bigint`,
                ),
              ).value,
        }),
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: `interface ${elemType}ArrayConstructor {`,
          endRegexp: closeBraceRegexp,
          mapFn: (slice) =>
            pipe(slice)
              .chain(replaceWithNoMatchCheck(`bigint`, elemType))
              .chain(
                replaceWithNoMatchCheck(`number`, NumberType.TypedArraySize),
              ).value,
        }),
      ]),
    ).value;
