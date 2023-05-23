import { indexType } from './common.mjs';

const markersBase = {
  interfaceArray: 'interface Array<T> {',
  interfaceReadonlyArray: 'interface ReadonlyArray<T> {',
  interfaceInt8Array: 'interface Int8Array {',
  interfaceUint8Array: 'interface Uint8Array {',
  interfaceUint8ClampedArray: 'interface Uint8ClampedArray {',
  interfaceInt16Array: 'interface Int16Array {',
  interfaceUint16Array: 'interface Uint16Array {',
  interfaceInt32Array: 'interface Int32Array {',
  interfaceUint32Array: 'interface Uint32Array {',
  interfaceFloat32Array: 'interface Float32Array {',
  interfaceFloat64Array: 'interface Float64Array {',
  interfaceBigInt64Array: 'interface BigInt64Array {',
  interfaceBigUint64Array: 'interface BigUint64Array {',
};

const markers = {
  Array: {
    start: markersBase.interfaceArray,
    end: markersBase.interfaceReadonlyArray,
  },
  ReadonlyArray: {
    start: markersBase.interfaceReadonlyArray,
    end: markersBase.interfaceInt8Array,
  },
  Int8: {
    start: markersBase.interfaceInt8Array,
    end: markersBase.interfaceUint8Array,
  },
  Uint8: {
    start: markersBase.interfaceUint8Array,
    end: markersBase.interfaceUint8ClampedArray,
  },
  Uint8Clamped: {
    start: markersBase.interfaceUint8ClampedArray,
    end: markersBase.interfaceInt16Array,
  },
  Int16: {
    start: markersBase.interfaceInt16Array,
    end: markersBase.interfaceUint16Array,
  },
  Uint16: {
    start: markersBase.interfaceUint16Array,
    end: markersBase.interfaceInt32Array,
  },
  Int32: {
    start: markersBase.interfaceInt32Array,
    end: markersBase.interfaceUint32Array,
  },
  Uint32: {
    start: markersBase.interfaceUint32Array,
    end: markersBase.interfaceFloat32Array,
  },
  Float32: {
    start: markersBase.interfaceFloat32Array,
    end: markersBase.interfaceFloat64Array,
  },
  Float64: {
    start: markersBase.interfaceFloat64Array,
    end: markersBase.interfaceBigInt64Array,
  },
  BigInt64: {
    start: markersBase.interfaceBigInt64Array,
    end: markersBase.interfaceBigUint64Array,
  },
  BigUint64: {
    start: markersBase.interfaceBigUint64Array,
    end: undefined,
  },
};

/**
 * @typedef {"Int8" | "Uint8" | "Uint8Clamped" | "Int16" | "Uint16" | "Int32" | "Uint32" | "Float32" | "Float64"} ElemType
 */
/**
 * @typedef {"BigInt64" | "BigUint64"} BigintElemType
 */

/** @type {ElemType[]} */
const typedArrayElemTypes = [
  'Int8',
  'Uint8',
  'Uint8Clamped',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float32',
  'Float64',
];

/** @type {BigintElemType[]} */
const bigIntElemTypes = ['BigInt64', 'BigUint64'];

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2023Array = (from) => {
  let ret = from;

  ret = ret.replaceAll(`index: number`, `index: ${indexType.callbackArg}`);

  for (const elemType of typedArrayElemTypes) {
    const slice = ret.slice(
      ret.indexOf(markers[elemType].start),
      ret.indexOf(markers[elemType].end)
    );
    ret = ret.replaceAll(
      slice,
      slice.replaceAll(
        'number',
        elemType === 'Uint8Clamped' ? 'Uint8' : elemType
      )
    );
  }

  for (const elemType of bigIntElemTypes) {
    const slice = ret.slice(
      ret.indexOf(markers[elemType].start),
      ret.indexOf(markers[elemType].end ?? '$$$$$$$$$$$')
    );
    ret = ret.replaceAll(slice, slice.replaceAll(`bigint`, elemType));
  }

  ret = ret.replaceAll(`): number;`, `): ${indexType.searchResult};`);

  return ret;
};
