import { indexType } from './common.mjs';
import { convertTypedArrayCommon } from './lib.typed-array-common.mjs';

/**
 * @typedef {'BigInt64' | 'BigUint64'} ElemType
 */

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2020Bigint = (from) => {
  let ret = from;

  ret = convertTypedArrayCommon(ret);

  // require predicate function to return boolean

  ret = ret.replaceAll(
    'predicate: (value: bigint, index: number, array: BigInt64Array) => unknown',
    'predicate: (value: bigint, index: number, array: BigInt64Array) => boolean'
  );
  ret = ret.replaceAll(
    'predicate: (value: bigint, index: number, array: BigUint64Array) => unknown',
    'predicate: (value: bigint, index: number, array: BigUint64Array) => boolean'
  );

  // BigInt
  ret = ret.replaceAll(
    'asIntN(bits: number, int: bigint): bigint;',
    'asIntN(bits: UintRange<0, 65>, int: bigint): bigint;'
  );
  ret = ret.replaceAll(
    'asUintN(bits: number, int: bigint): bigint;',
    'asUintN(bits: UintRange<0, 65>, int: bigint): bigint;'
  );

  // BigInt64Array / BigUint64Array

  ret = ret.replaceAll('): number;', `): ${indexType.searchResult};`);

  ret = ret.replaceAll(
    'keys(): IterableIterator<number>;',
    `keys(): IterableIterator<${indexType.ret}>;`
  );
  ret = ret.replaceAll(
    'readonly length: number;',
    `readonly length: ${indexType.size};`
  );
  ret = ret.replaceAll(
    'fill(value: bigint, start?: number, end?: number): this;',
    `fill(value: bigint, start?: ${indexType.arg}, end?: ${indexType.arg}): this;`
  );

  ret = ret.replaceAll('length?: number', `length?: ${indexType.size}`);
  ret = ret.replaceAll(
    'readonly BYTES_PER_ELEMENT: number;',
    'readonly BYTES_PER_ELEMENT: 8;'
  );

  // DataView
  ret = ret.replaceAll(
    'getBigInt64(byteOffset: number, littleEndian?: boolean): bigint;',
    'getBigInt64(byteOffset: SafeUint, littleEndian?: boolean): BigInt64;'
  );
  ret = ret.replaceAll(
    'getBigUint64(byteOffset: number, littleEndian?: boolean): bigint;',
    'getBigUint64(byteOffset: SafeUint, littleEndian?: boolean): BigUint64;'
  );
  ret = ret.replaceAll(
    'setBigInt64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
    'setBigInt64(byteOffset: SafeUint, value: BigInt64, littleEndian?: boolean): void;'
  );
  ret = ret.replaceAll(
    'setBigUint64(byteOffset: number, value: bigint, littleEndian?: boolean): void;',
    'setBigUint64(byteOffset: SafeUint, value: BigUint64, littleEndian?: boolean): void;'
  );

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

  /** @type {ElemType[]} */
  const elemTypes = ['BigInt64', 'BigUint64'];

  for (const elemType of elemTypes) {
    {
      const slice = ret.slice(
        ret.indexOf(marker(elemType).Array.start),
        ret.indexOf(marker(elemType).Array.end)
      );
      ret = ret.replaceAll(slice, convertInterfaceTypedArray(slice, elemType));
    }
    {
      const slice = ret.slice(
        ret.indexOf(marker(elemType).ArrayConstructor.start),
        ret.indexOf(marker(elemType).ArrayConstructor.end)
      );
      ret = ret.replaceAll(
        slice,
        convertInterfaceTypedArrayConstructor(slice, elemType)
      );
    }
  }

  return ret;
};

/**
 * @param {string} from
 * @param {ElemType} elementType
 * @returns {string}
 */
const convertInterfaceTypedArray = (from, elementType) => {
  let ret = from;

  ret = ret.replaceAll(`bigint`, elementType);
  ret = ret.replaceAll(`index: number`, `index: ${indexType.callbackArg}`);
  ret = ret.replaceAll(
    `[number, ${elementType}]`,
    `[${indexType.ret}, ${elementType}]`
  );
  ret = ret.replaceAll(`number | ${elementType}`, `number | bigint`);

  return ret;
};

/**
 * @param {string} from
 * @param {ElemType} elementType
 * @returns {string}
 */
const convertInterfaceTypedArrayConstructor = (from, elementType) => {
  let ret = from;

  ret = ret.replaceAll(`bigint`, elementType);
  ret = ret.replaceAll(`number`, `${indexType.callbackArg}`);

  return ret;
};
