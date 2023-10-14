import { indexType } from './common.mjs';

const markers = {
  Array: {
    start: 'interface Array<T> {',
    end: 'interface ReadonlyArray<T> {',
  },
  ReadonlyArray: {
    start: 'interface ReadonlyArray<T> {',
    end: 'interface Int8Array {',
  },
};

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2022Array = (from) => {
  let ret = from;

  {
    const slice = ret.slice(
      ret.indexOf(markers.Array.start),
      ret.indexOf(markers.Array.end),
    );
    ret = ret.replaceAll(
      slice,
      slice.replaceAll(
        'at(index: number): T | undefined;',
        `at(index: ${indexType.arg}): T | undefined`,
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
      slice.replaceAll(
        'at(index: number): T | undefined;',
        `at(index: ${indexType.arg}): T | undefined`,
      ),
    );
  }

  ret = ret.replaceAll(
    'at(index: number): T | undefined;',
    `at(index: ${indexType.arg}): T | undefined`,
  );

  for (const [typeName, returnTypeBefore, returnTypeAfter] of [
    ['Int8Array', 'number', 'Int8'],
    ['Uint8Array', 'number', 'Uint8'],
    ['Uint8ClampedArray', 'number', 'Uint8'],
    ['Int16Array', 'number', 'Int16'],
    ['Uint16Array', 'number', 'Uint16'],
    ['Int32Array', 'number', 'Int32'],
    ['Uint32Array', 'number', 'Uint32'],
    ['Float32Array', 'number', 'Float32'],
    ['Float64Array', 'number', 'Float64'],
    ['BigInt64Array', 'bigint', 'BigInt64'],
    ['BigUint64Array', 'bigint', 'BigUint64'],
  ]) {
    ret = ret.replaceAll(
      `interface ${typeName} {\n  /**\n   * Returns the item located at the specified index.\n   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.\n   */\n  at(index: number): ${returnTypeBefore} | undefined;\n}`,
      `interface ${typeName} {\n  /**\n   * Returns the item located at the specified index.\n   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.\n   */\n  at(index: ${indexType.arg}): ${returnTypeAfter} | undefined;\n}`,
    );
  }

  return ret;
};
