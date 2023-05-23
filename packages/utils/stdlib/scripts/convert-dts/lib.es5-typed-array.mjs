import { indexType } from './common.mjs';
import { convertTypedArrayCommon } from './lib.typed-array-common.mjs';

/**
 * @typedef {"Int8" | "Uint8" | "Uint8Clamped" | "Int16" | "Uint16" | "Int32" | "Uint32" | "Float32" | "Float64"} ElemType
 */

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_TypedArray = (from) => {
  let ret = from;

  /** @param {ElemType} elemType */
  const marker = (elemType) => {
    const Array = `interface ${elemType}Array {`;
    const ArrayConstructor = `interface ${elemType}ArrayConstructor {`;
    const declareConstArray = `declare const ${elemType}Array: ${elemType}ArrayConstructor`;
    return {
      Array: {
        start: Array,
        end: ArrayConstructor,
      },
      ArrayConstructor: {
        start: ArrayConstructor,
        end: declareConstArray,
      },
    };
  };

  /** @type {ElemType[]} */
  const elemTypes = [
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

  // DataView
  const markers = {
    ArrayBuffer: {
      start: 'interface ArrayBuffer {',
      end: 'interface ArrayBufferTypes {',
    },
    ArrayBufferView: {
      start: 'interface ArrayBufferView {',
      end: 'interface DataView {',
    },
    DataView: {
      start: 'interface DataView {',
      end: 'interface DataViewConstructor {',
    },
  };

  {
    const slice = ret.slice(
      ret.indexOf(markers.ArrayBuffer.start),
      ret.indexOf(markers.ArrayBuffer.end)
    );

    ret = ret.replaceAll(
      slice,
      slice.replaceAll(
        `slice(begin: number, end?: number)`,
        `slice(begin: ${indexType.arg}, end?: ${indexType.arg})`
      )
    );
  }
  {
    const slice = ret.slice(
      ret.indexOf(markers.ArrayBufferView.start),
      ret.indexOf(markers.ArrayBufferView.end)
    );

    ret = ret.replaceAll(slice, convertArrayBufferView(slice));
  }

  {
    const slice = ret.slice(
      ret.indexOf(markers.DataView.start),
      ret.indexOf(markers.DataView.end)
    );

    ret = ret.replaceAll(slice, convertDataView(slice));
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

  const arrayType = `${elementType}Array`;
  elementType = elementType === 'Uint8Clamped' ? 'Uint8' : elementType;

  ret = convertTypedArrayCommon(ret);

  ret = ret.replaceAll(
    `readonly BYTES_PER_ELEMENT: number;`,
    `readonly BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT(elementType)};`
  );
  ret = ret.replaceAll(
    `readonly [index: number]: number;`,
    `readonly [index: number]: ${elementType};`
  );
  ret = ret.replaceAll(`index: number,`, `index: ${indexType.callbackArg},`);
  ret = ret.replaceAll(
    `predicate: (value: number, index: number, array: ${arrayType}) => unknown`,
    `predicate: (value: ${elementType}, index: ${indexType.callbackArg}, array: ${arrayType}) => boolean`
  );
  ret = ret.replaceAll(
    `fill(value: number, start?: number, end?: number)`,
    `fill(value: ${elementType}, start?: ${indexType.arg}, end?: ${indexType.arg})`
  );
  ret = ret.replaceAll(
    `unknown,\n    thisArg?: unknown\n  ): boolean`,
    `boolean,\n    thisArg?: unknown\n  ): boolean`
  );
  ret = ret.replaceAll(
    `) => unknown,\n    thisArg?: unknown\n  ): ${arrayType};`,
    `) => boolean,\n    thisArg?: unknown\n  ): ${arrayType};`
  );
  ret = ret.replaceAll(
    `searchElement: number`,
    `searchElement: ${elementType}`
  );
  ret = ret.replaceAll(
    `fromIndex?: ${indexType.arg}): number;`,
    `fromIndex?: ${indexType.arg}): ${indexType.searchResult};`
  );

  ret = ret.replaceAll(
    `findIndex(\n    predicate: (value: number, index: ${indexType.callbackArg}, obj: ${arrayType}) => boolean,\n    thisArg?: unknown\n  ): number;`,
    `findIndex(\n    predicate: (value: number, index: ${indexType.callbackArg}, obj: ${arrayType}) => boolean,\n    thisArg?: unknown\n  ): ${indexType.searchResult};`
  );

  // Uint8ClampedArray
  ret = ret.replaceAll(
    `findIndex(\n    predicate: (\n      value: number,\n      index: ${indexType.callbackArg},\n      obj: Uint8ClampedArray\n    ) => boolean,\n    thisArg?: unknown\n  ): number;`,
    `findIndex(\n    predicate: (\n      value: number,\n      index: ${indexType.callbackArg},\n      obj: Uint8ClampedArray\n    ) => boolean,\n    thisArg?: unknown\n  ): ${indexType.searchResult};`
  );

  // convert rest
  ret = ret.replaceAll(`number`, elementType);

  // revert
  ret = ret.replaceAll(
    `(a: ${elementType}, b: ${elementType}) => ${elementType}`,
    `(a: ${elementType}, b: ${elementType}) => number`
  );
  ret = ret.replaceAll(`[index: ${elementType}]`, `[index: number]`);
  ret = ret.replaceAll(
    `Converts a ${elementType} to a string`,
    `Converts a number to a string`
  );

  return ret;
};

/**
 * @param {string} from
 * @param {ElemType} elementType
 * @returns {string}
 */
const convertInterfaceTypedArrayConstructor = (from, elementType) => {
  let ret = from;

  elementType = elementType === 'Uint8Clamped' ? 'Uint8' : elementType;

  ret = ret.replaceAll(
    `readonly BYTES_PER_ELEMENT: number;`,
    `readonly BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT(elementType)};`
  );
  ret = ret.replaceAll(
    `new (array: ArrayLike<number>`,
    `new (array: ArrayLike<${elementType}>`
  );
  ret = ret.replaceAll(`length?: number`, `length?: ${indexType.size}`);
  ret = ret.replaceAll(
    `mapfn: (v: T, k: number) => number,`,
    `mapfn: (v: T, k: ${indexType.callbackArg}) => ${elementType},`
  );
  ret = ret.replaceAll(`number`, elementType);

  return ret;
};

/**
 * @param {Exclude<ElemType, "Uint8Clamped">} elementType
 * @returns {1|2|4|8}
 */
const BYTES_PER_ELEMENT = (elementType) => {
  switch (elementType) {
    case 'Int8':
      return 1;
    case 'Int16':
      return 2;
    case 'Int32':
      return 4;
    case 'Uint8':
      return 1;
    case 'Uint16':
      return 2;
    case 'Uint32':
      return 4;
    case 'Float32':
      return 4;
    case 'Float64':
      return 8;
  }
};

/**
 * @param {string} from
 * @returns {string}
 */
const convertArrayBufferView = (from) => {
  let ret = from;

  ret.replaceAll(
    'slice(begin: number, end?: number): ArrayBuffer;',
    `slice(begin: ${indexType.arg}, end?: ${indexType.arg}): ArrayBuffer;`
  );

  for (const [fn, valueType] of [
    ['getInt8', 'Int8'],
    ['getUint8', 'Uint8'],
  ]) {
    ret = ret.replaceAll(
      `${fn}(byteOffset: SafeUint): number;`,
      `${fn}(byteOffset: SafeUint): ${valueType};`
    );
  }

  return ret;
};

/**
 * @param {string} from
 * @returns {string}
 */
const convertDataView = (from) => {
  let ret = from;

  for (const [fn, valueType] of [
    ['getInt8', 'Int8'],
    ['getUint8', 'Uint8'],
  ]) {
    ret = ret.replaceAll(
      `${fn}(byteOffset: SafeUint): number;`,
      `${fn}(byteOffset: SafeUint): ${valueType};`
    );
  }

  for (const [fn, valueType] of [
    ['getInt16', 'Int16'],
    ['getUint16', 'Uint16'],
    ['getInt32', 'Int32'],
    ['getUint32', 'Uint32'],
    ['getFloat32', 'Float32'],
    ['getFloat64', 'Float64'],
  ]) {
    ret = ret.replaceAll(
      `${fn}(byteOffset: SafeUint, littleEndian?: boolean): number;`,
      `${fn}(byteOffset: SafeUint, littleEndian?: boolean): ${valueType};`
    );
  }

  for (const [fn, valueType] of [
    ['setInt8', 'Int8'],
    ['setUint8', 'Uint8'],
  ]) {
    ret = ret.replaceAll(
      `${fn}(byteOffset: SafeUint, value: number): void;`,
      `${fn}(byteOffset: SafeUint, value: ${valueType}): void;`
    );
  }

  for (const [fn, valueType] of [
    ['setInt16', 'Int16'],
    ['setUint16', 'Uint16'],
    ['setInt32', 'Int32'],
    ['setUint32', 'Uint32'],
    ['setFloat32', 'Float32'],
    ['setFloat64', 'Float64'],
  ]) {
    ret = ret.replaceAll(
      `${fn}(byteOffset: SafeUint, value: number, littleEndian?: boolean): void;`,
      `${fn}(byteOffset: SafeUint, value: ${valueType}, littleEndian?: boolean): void;`
    );
  }

  return ret;
};
