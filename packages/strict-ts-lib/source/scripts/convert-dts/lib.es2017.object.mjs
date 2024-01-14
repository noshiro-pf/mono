import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017Object = (from) => {
  let mut_ret = from;

  mut_ret = pipe(mut_ret).chain(
    replaceWithNoMatchCheck(
      'interface ObjectConstructor {',
      [
        '/** @internal */',
        'type ToObjectKeysValue<A> = A extends string',
        '  ? A',
        '  : A extends number',
        // eslint-disable-next-line no-template-curly-in-string
        '  ? `${A}`',
        '  : never;',
        '',
        '/** @internal */',
        'type PickByValue<R, V> = Pick<',
        '  R,',
        '  {',
        '    [K in keyof R]: R[K] extends V ? K : never;',
        '  }[keyof R]',
        '>;',
        '',
        '/** @internal */',
        'type _RecordUtilsEntries<R extends RecordBase> = R extends R',
        '  ? readonly {',
        '      readonly [K in keyof R]: readonly [',
        '        ToObjectKeysValue<keyof PickByValue<R, R[K]>>,',
        '        R[K]',
        '      ];',
        '      // eslint-disable-next-line @typescript-eslint/ban-types',
        '    }[RelaxedExclude<keyof R, symbol>][]',
        '  : never;',
        '',
        'interface ObjectConstructor {',
      ].join('\n'),
    ),
  ).value;

  {
    const prefix = [
      '  /**',
      '   * Returns an array of key/values of the enumerable properties of an object',
      '   * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.',
    ];

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [
          ...prefix,
          '   */',
          '  entries<T>(',
          '    o: { readonly [s: string]: T } | ArrayLike<T>,',
          '  ): readonly (readonly [string, T])[];',
        ].join('\n'),
        [
          ...prefix,
          '   *',
          '   * @example',
          '   * ```ts',
          '   * const obj = {',
          '   *   x: 1,',
          '   *   y: 2,',
          '   *   z: 2,',
          '   *   3: 4,',
          '   * } as const;',
          '   *',
          "   * const entries = Object.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]",
          '   * ```',
          '   */',
          'entries<R extends RecordBase>(object: R): _RecordUtilsEntries<R>;',
        ].join('\n'),
      ),
    ).value;
  }

  return mut_ret;
};
