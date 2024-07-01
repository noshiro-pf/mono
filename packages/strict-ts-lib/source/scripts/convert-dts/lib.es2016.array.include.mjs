import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { indexType } from './common.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2016ArrayInclude = (from) => {
  let mut_ret = from;

  mut_ret = pipe(mut_ret).chain(
    replaceWithNoMatchCheck(
      // change Array.includes() to accept widen literal types
      'includes(searchElement: T, fromIndex?: number): boolean;',
      'includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): searchElement is T;',
    ),
  ).value;

  for (const [typeName, elemType] of [
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
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [
          `interface ${typeName} {`,
          '  /**',
          '   * Determines whether an array includes a certain element, returning true or',
          '   * false as appropriate.',
          '   *',
          '   * @param searchElement The element to search for.',
          '   * @param fromIndex The position in this array at which to begin searching',
          '   *   for searchElement.',
          '   */',
          '  includes(searchElement: number, fromIndex?: number): boolean;',
          '}',
        ].join('\n'),
        [
          `interface ${typeName} {`,
          '  /**',
          '   * Determines whether an array includes a certain element, returning true or',
          '   * false as appropriate.',
          '   *',
          '   * @param searchElement The element to search for.',
          '   * @param fromIndex The position in this array at which to begin searching for searchElement.',
          '   */',
          `  includes(searchElement: ${elemType}, fromIndex?: number): boolean;`,
          '}',
        ].join('\n'),
      ),
    ).value;
  }

  mut_ret = pipe(mut_ret).chain(
    replaceWithNoMatchCheck(
      'fromIndex?: number',
      `fromIndex?: ${indexType.arg}`,
    ),
  ).value;

  return mut_ret;
};
