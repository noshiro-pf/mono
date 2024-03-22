import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2019Object = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        '/// <reference types="@noshiro/ts-type-utils-no-stdlib" />',
        [
          '/// <reference types="@noshiro/ts-type-utils-no-stdlib" />',
          '/// <reference path="./lib.es5.d.ts" />',
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          '  /**',
          '   * Returns an object created by key-value entries for properties and methods',
          '   *',
          '   * @param entries An iterable object that contains key-value entries for',
          '   *   properties and methods.',
          '   */',
          '  fromEntries<T = unknown>(',
          '    entries: Iterable<readonly [PropertyKey, T]>,',
          '  ): { readonly [k: string]: T };',
        ].join('\n'),
        [
          '  /**',
          '   * Returns an object created by key-value entries for properties and methods',
          '   *',
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
          '   *',
          '   * @param entries An iterable object that contains key-value entries for',
          '   *   properties and methods.',
          '   */',
          '  fromEntries<K extends PropertyKey, V>(',
          '    entries: Iterable<readonly [K, V]>,',
          '  ): Record<K, V>;',
        ].join('\n'),
      ),
    ).value;
