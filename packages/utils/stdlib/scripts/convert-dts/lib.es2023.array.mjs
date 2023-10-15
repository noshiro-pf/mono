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

/** @type {("Array" | "ReadonlyArray")[]} */
const arrayTypes = ['Array', 'ReadonlyArray'];

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2023Array = (from) => {
  let ret = from;

  ret = ret.replaceAll(`index: number`, `index: ${indexType.callbackArg}`);

  {
    for (const type of arrayTypes) {
      const slice = ret.slice(
        ret.indexOf(markers[type].start),
        ret.indexOf(markers[type].end),
      );
      ret = ret.replaceAll(
        slice,
        slice
          .replaceAll('compareFn?', 'compareFn')
          .replaceAll(`start: number`, `start: ${indexType.arg}`)
          .replaceAll(`deleteCount: number`, `deleteCount: ${indexType.arg}`)
          .replaceAll(`deleteCount?: number`, `deleteCount?: ${indexType.arg}`),
      );
    }
  }

  {
    const slice = ret.slice(
      ret.indexOf(markers.Array.start),
      ret.indexOf(markers.Array.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          // TODO: remove if fixed
          'Copies an array and removes elements and, if necessary, inserts new elements in their place. Returns the copied array.',
          'Copies an array and removes elements while, if necessary, inserting new elements in their place, returning the remaining elements.',
        )
        .replaceAll(
          // TODO: remove if fixed
          '@returns The copied array.',
          '@returns A copy of the original array with the remaining elements.',
        ),
    );
  }

  {
    const slice = ret.slice(
      ret.indexOf(markers.ReadonlyArray.start),
      ret.indexOf(markers.ReadonlyArray.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          // TODO: remove if fixed
          'Copies the array and returns the copied array with all of its elements reversed.',
          'Returns a copy of an array with its elements reversed.',
        )
        .replaceAll(
          // TODO: remove if fixed
          '@param value The value to insert into the copied array.',
          '@param value The value to write into the copied array.',
        )
        .replaceAll(
          // TODO: remove if fixed
          '@returns A copy of the original array with the inserted value.',
          '@returns The copied array with the updated value.',
        )
        .replaceAll(
          // TODO: remove if fixed (missing ending ".")
          [
            '   * Copies an array, then overwrites the value at the provided index with the',
            '   * given value. If the index is negative, then it replaces from the end',
            '   * of the array',
          ].join('\n'),
          [
            '   * Copies an array, then overwrites the value at the provided index with the',
            '   * given value. If the index is negative, then it replaces from the end',
            '   * of the array.',
          ].join('\n'),
        ),
    );
  }

  for (const elemType of typedArrayElemTypes) {
    const slice = ret.slice(
      ret.indexOf(markers[elemType].start),
      ret.indexOf(markers[elemType].end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          // TODO: remove if fixed
          `   * Copies the array and inserts the given number at the provided index.`,
          [
            '   * Copies an array, then overwrites the value at the provided index with the',
            '   * given value. If the index is negative, then it replaces from the end',
            '   * of the array.',
          ].join('\n'),
        )
        .replaceAll('number', elemType === 'Uint8Clamped' ? 'Uint8' : elemType),
    );
  }

  for (const elemType of bigIntElemTypes) {
    const slice = ret.slice(
      ret.indexOf(markers[elemType].start),
      ret.indexOf(markers[elemType].end ?? '$$$$$$$$$$$'),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          // TODO: remove if fixed
          `   * Copies the array and inserts the given bigint at the provided index.`,
          [
            '   * Copies an array, then overwrites the value at the provided index with the',
            '   * given value. If the index is negative, then it replaces from the end',
            '   * of the array.',
          ].join('\n'),
        )
        .replaceAll(`bigint`, elemType),
    );
  }

  for (const list of [typedArrayElemTypes, bigIntElemTypes]) {
    for (const elemType of list) {
      const slice = ret.slice(
        ret.indexOf(markers[elemType].start),
        ret.indexOf(markers[elemType].end ?? '$$$$$$$$$$$'),
      );
      ret = ret.replaceAll(
        slice,
        slice
          .replaceAll(
            // TODO: remove if fixed
            'Copies the array and returns the copy with the elements in reverse order.',
            'Returns a copy of an array with its elements reversed.',
          )
          .replaceAll(
            // TODO: remove if fixed
            'If omitted, the elements are sorted in ascending, ASCII character order.',
            'If omitted, the elements are sorted in ascending order.',
          )
          .replaceAll(
            // TODO: remove if fixed
            '@param value The value to insert into the copied array.',
            '@param value The value to write into the copied array.',
          )
          .replaceAll(
            // TODO: remove if fixed
            '@returns A copy of the original array with the inserted value.',
            '@returns The copied array with the updated value.',
          ),
      );
    }
  }

  ret = ret.replaceAll(`): number;`, `): ${indexType.searchResult};`);

  ret = ret.replaceAll(
    // TODO: remove if fixed
    'Copies and sorts the array.',
    'Returns a copy of an array with its elements sorted.', // use the same description with Array
  );

  return ret;
};
