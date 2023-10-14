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
    '/**\n   * Returns an object created by key-value entries for properties and methods\n   * @param entries An iterable object that contains key-value entries for properties and methods.\n   */\n  fromEntries<T = unknown>(\n    entries: Iterable<readonly [PropertyKey, T]>\n  ): { readonly [k: string]: T };',
    "/**\n   * Returns an object created by key-value entries for properties and methods\n   * @param entries An iterable object that contains key-value entries for properties and methods.\n   *\n   * @example\n   * ```ts\n   * const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] = [\n   *   ['x', 1],\n   *   ['y', 2],\n   *   ['z', 3],\n   *   [4, 3],\n   * ] as const;\n   *\n   * const obj = Object.fromEntries(entries); // Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>\n   * ```\n   */\n  fromEntries<K extends PropertyKey, V>(\n    entries: Iterable<readonly [K, V]>\n  ): Record<K, V>;",
  );

  return ret;
};
