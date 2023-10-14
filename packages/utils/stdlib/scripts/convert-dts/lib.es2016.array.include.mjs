import { indexType } from './common.mjs';

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2016ArrayInclude = (from) => {
  let ret = from;

  // change Array.includes() to accept widen literal types

  ret = ret.replaceAll(
    'includes(searchElement: T, fromIndex?: number): boolean;',
    'includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): searchElement is T;',
  );

  for (const [typeName, returnTypeAfter] of [
    ['Int8Array', 'Int8'],
    ['Uint8Array', 'Uint8'],
    ['Uint8ClampedArray', 'Uint8'],
    ['Int16Array', 'Int16'],
    ['Uint16Array', 'Uint16'],
    ['Int32Array', 'Int32'],
    ['Uint32Array', 'Uint32'],
    ['Float32Array', 'Float32'],
    ['Float64Array', 'Float64'],
  ]) {
    ret = ret.replaceAll(
      `interface ${typeName} {\n  /**\n   * Determines whether an array includes a certain element, returning true or false as appropriate.\n   * @param searchElement The element to search for.\n   * @param fromIndex The position in this array at which to begin searching for searchElement.\n   */\n  includes(searchElement: number, fromIndex?: number): boolean;\n}`,
      `interface ${typeName} {\n  /**\n   * Determines whether an array includes a certain element, returning true or false as appropriate.\n   * @param searchElement The element to search for.\n   * @param fromIndex The position in this array at which to begin searching for searchElement.\n   */\n  includes(searchElement: ${returnTypeAfter}, fromIndex?: number): boolean;\n}`,
    );
  }

  ret = ret.replaceAll('fromIndex?: number', `fromIndex?: ${indexType.arg}`);

  return ret;
};
