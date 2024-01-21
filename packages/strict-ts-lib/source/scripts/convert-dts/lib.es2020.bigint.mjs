import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
import { indexType } from './common.mjs';
import { convertTypedArrayCommon } from './lib.typed-array-common.mjs';

/** @typedef {'BigInt64' | 'BigUint64'} ElemType */

/** @param {ElemType} elemType */
const marker = (elemType) => ({
  Array: {
    start: `interface ${elemType}Array {`,
    end: `interface ${elemType}ArrayConstructor {`,
  },
  ArrayConstructor: {
    start: `interface ${elemType}ArrayConstructor {`,
    end: `declare const ${elemType}Array: ${elemType}ArrayConstructor`,
  },
});

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2020Bigint = (from) => {
  let mut_ret = from;

  mut_ret = convertTypedArrayCommon(mut_ret);

  mut_ret = pipe(mut_ret)
    .chain(
      replaceWithNoMatchCheck(
        'readonly byteOffset: number',
        `readonly byteOffset: ${indexType.ret}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly byteLength: number',
        `readonly byteLength: ${indexType.ret}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'byteOffset?: number',
        `byteOffset?: ${indexType.argNonNegative}`,
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
        // BigInt64Array / BigUint64Array
        '): number;',
        `): ${indexType.searchResult};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'keys(): IterableIterator<number>;',
        `keys(): IterableIterator<${indexType.ret}>;`,
      ),
    )
    // .chain(
    //   replaceWithNoMatchCheck(
    //     'readonly length: number;',
    //     `readonly length: ${indexType.size};`,
    //   ),
    // )
    .chain(
      replaceWithNoMatchCheck(
        'fill(value: bigint, start?: number, end?: number): this;',
        `fill(value: bigint, start?: ${indexType.arg}, end?: ${indexType.arg}): this;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck('length?: number', `length?: ${indexType.size}`),
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
        'getBigInt64(byteOffset: SafeUint, littleEndian?: boolean): BigInt64;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'getBigUint64(byteOffset: number, littleEndian?: boolean): bigint;',
        'getBigUint64(byteOffset: SafeUint, littleEndian?: boolean): BigUint64;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'setBigInt64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
        'setBigInt64(byteOffset: SafeUint, value: BigInt64, littleEndian?: boolean): void;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'setBigUint64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
        'setBigUint64(byteOffset: SafeUint, value: BigUint64, littleEndian?: boolean): void;',
      ),
    ).value;

  /** @type {ElemType[]} */
  const elemTypes = ['BigInt64', 'BigUint64'];

  for (const elemType of elemTypes) {
    {
      const slice = mut_ret.slice(
        mut_ret.indexOf(marker(elemType).Array.start),
        mut_ret.indexOf(marker(elemType).Array.end),
      );
      mut_ret = replaceWithNoMatchCheck(
        slice,
        convertInterfaceTypedArray(slice, elemType),
      )(mut_ret);
    }
    {
      const slice = mut_ret.slice(
        mut_ret.indexOf(marker(elemType).ArrayConstructor.start),
        mut_ret.indexOf(marker(elemType).ArrayConstructor.end),
      );
      mut_ret = replaceWithNoMatchCheck(
        slice,
        convertInterfaceTypedArrayConstructor(slice, elemType),
      )(mut_ret);
    }
  }

  return mut_ret;
};

/**
 * @param {string} from
 * @param {ElemType} elementType
 * @returns {string}
 */
const convertInterfaceTypedArray = (from, elementType) =>
  pipe(from)
    .chain(replaceWithNoMatchCheck(`bigint`, elementType))
    .chain(
      replaceWithNoMatchCheck(
        `index: number`,
        `index: ${indexType.callbackArg}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `[number, ${elementType}]`,
        `[${indexType.ret}, ${elementType}]`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(`number | ${elementType}`, `number | bigint`),
    ).value;

/**
 * @param {string} from
 * @param {ElemType} elementType
 * @returns {string}
 */
const convertInterfaceTypedArrayConstructor = (from, elementType) =>
  pipe(from)
    .chain(replaceWithNoMatchCheck(`bigint`, elementType))
    .chain(replaceWithNoMatchCheck(`number`, indexType.callbackArg)).value;
