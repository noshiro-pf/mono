/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2019Object = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    '/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />',
    '/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />\n/// <reference path="./lib.es5.d.ts" />',
  );

  ret = ret.replaceAll(
    [
      '  /**',
      '   * Returns an object created by key-value entries for properties and methods',
      '   * @param entries An iterable object that contains key-value entries for properties and methods.',
      '   */',
      '  fromEntries<T = unknown>(',
      '    entries: Iterable<readonly [PropertyKey, T]>,',
      '  ): { readonly [k: string]: T };',
    ].join('\n'),
    [
      '  /**',
      '   * Returns an object created by key-value entries for properties and methods',
      '   * @param entries An iterable object that contains key-value entries for properties and methods.',
      '   *',
      '   * @example',
      '   * ```ts',
      "   * const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] = [",
      "   *   ['x', 1],",
      "   *   ['y', 2],",
      "   *   ['z', 3],",
      '   *   [4, 3],',
      '   * ] as const;',
      '   *',
      "   * const obj = Object.fromEntries(entries); // Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>",
      '   * ```',
      '   */',
      '  fromEntries<K extends PropertyKey, V>(',
      '    entries: Iterable<readonly [K, V]>,',
      '  ): Record<K, V>;',
    ].join('\n'),
  );

  return ret;
};
